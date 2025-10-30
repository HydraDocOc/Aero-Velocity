"""
Lap Time Simulator
Physics-based lap time prediction using real formulas
"""
import numpy as np
import math
from dataclasses import dataclass
from typing import Dict, List, Tuple

from config.settings import F1_CAR_MASS, GRAVITY, AIR_DENSITY
from physics.aerodynamics import AerodynamicPhysics, AeroState


@dataclass
class CarParameters:
    """Physical parameters of an F1 car"""
    mass: float = F1_CAR_MASS  # kg
    power: float = 745000  # Watts (1000 HP)
    frontal_area: float = 1.4  # m²
    drag_coefficient: float = 0.70
    cl_front: float = 1.5
    cl_rear: float = 2.0
    tire_friction: float = 2.0  # Coefficient (dry tires)
    brake_force: float = 25000  # Newtons
    front_wing_angle: float = 22.0
    rear_wing_angle: float = 26.0
    ride_height_front: float = 12.0
    ride_height_rear: float = 14.0


class LapTimeSimulator:
    """
    Simulates lap times using physics-based calculations
    """
    
    def __init__(self):
        self.aero_physics = AerodynamicPhysics()
        self.g = GRAVITY
    
    def simulate_lap(self, car_params: CarParameters, track_config: Dict, 
                     race_mode: bool = False) -> Dict:
        """
        Simulate a complete lap using real physics
        
        Args:
            car_params: Car physical parameters
            track_config: Track configuration
            race_mode: If True, includes tire degradation
            
        Returns:
            Dictionary with lap time and details
        """
        circuit_length = track_config.get('circuit_length', 5.0) * 1000  # Convert to meters
        corner_count = track_config.get('corner_count', 15)
        longest_straight = track_config.get('longest_straight', 800)
        
        # Estimate straight and corner portions
        total_straight_distance = longest_straight * 1.5
        corner_distance = circuit_length - total_straight_distance
        
        # Average corner radius estimation
        avg_corner_radius = corner_distance / (corner_count * math.pi / 2)
        
        # Simulate straight sections
        straight_time = self._simulate_straight(car_params, total_straight_distance)
        
        # Simulate corners
        corner_time = self._simulate_corners(car_params, corner_count, avg_corner_radius)
        
        total_time = straight_time + corner_time
        
        # Apply race mode adjustments
        if race_mode:
            total_time *= 1.007  # Tire deg
            total_time *= 1.003  # Fuel weight
        
        # Format as M:SS.mmm
        minutes = int(total_time // 60)
        seconds = total_time % 60
        lap_time_str = f"{minutes}:{seconds:06.3f}"
        
        return {
            'lap_time': lap_time_str,
            'lap_time_seconds': total_time,
            'straight_time': straight_time,
            'corner_time': corner_time
        }
    
    def _simulate_straight(self, car_params: CarParameters, distance: float) -> float:
        """Simulate straight-line acceleration"""
        dt = 0.1
        velocity = 50.0
        position = 0.0
        time = 0.0
        
        while position < distance and time < 60:
            state = AeroState(
                velocity=velocity,
                drag_coefficient=car_params.drag_coefficient,
                lift_coefficient_front=car_params.cl_front,
                lift_coefficient_rear=car_params.cl_rear,
                frontal_area=car_params.frontal_area,
                ride_height_front=car_params.ride_height_front,
                ride_height_rear=car_params.ride_height_rear,
                wing_angle_front=car_params.front_wing_angle,
                wing_angle_rear=car_params.rear_wing_angle
            )
            
            drag = self.aero_physics.calculate_drag_force(state)
            engine_force = car_params.power / max(velocity, 0.1)
            net_force = engine_force - drag
            acceleration = net_force / car_params.mass
            
            velocity += acceleration * dt
            velocity = min(velocity, 100)  # ~360 km/h max
            position += velocity * dt
            time += dt
        
        return time
    
    def _simulate_corners(self, car_params: CarParameters, corner_count: int, avg_radius: float) -> float:
        """Simulate corner sections"""
        total_time = 0.0
        
        for i in range(corner_count):
            radius_factor = 0.7 + 0.6 * (i % 3) / 2
            corner_radius = avg_radius * radius_factor
            
            v_estimate = math.sqrt(car_params.tire_friction * self.g * corner_radius)
            
            state = AeroState(
                velocity=v_estimate,
                drag_coefficient=car_params.drag_coefficient,
                lift_coefficient_front=car_params.cl_front,
                lift_coefficient_rear=car_params.cl_rear,
                frontal_area=car_params.frontal_area,
                ride_height_front=car_params.ride_height_front,
                ride_height_rear=car_params.ride_height_rear,
                wing_angle_front=car_params.front_wing_angle,
                wing_angle_rear=car_params.rear_wing_angle
            )
            
            _, _, downforce = self.aero_physics.calculate_downforce(state)
            normal_force = (car_params.mass * self.g) + downforce
            max_lat_accel = (car_params.tire_friction * normal_force) / car_params.mass
            v_max = math.sqrt(max_lat_accel * corner_radius)
            
            arc_length = (math.pi / 2) * corner_radius
            corner_time = arc_length / v_max
            
            v_entry = min(70, v_estimate * 1.3)
            brake_decel = car_params.brake_force / car_params.mass
            brake_time = (v_entry - v_max) / brake_decel if v_entry > v_max else 0
            accel_time = abs(v_estimate * 0.3 / 10)
            
            total_time += corner_time + abs(brake_time) + accel_time
        
        return total_time
    
    def predict_optimal_laptime(self, car_params: CarParameters, track_config) -> Tuple[str, str]:
        """Predict qualifying and race lap times"""
        quali_result = self.simulate_lap(car_params, track_config.__dict__, race_mode=False)
        race_result = self.simulate_lap(car_params, track_config.__dict__, race_mode=True)
        return quali_result['lap_time'], race_result['lap_time']