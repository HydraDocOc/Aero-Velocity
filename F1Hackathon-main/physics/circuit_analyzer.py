"""
Circuit Analyzer
Analyzes track-specific aerodynamic requirements and predicts lap times
"""
from dataclasses import dataclass
from typing import Dict, Optional
import math

from config.track_configs import get_track_by_name, TrackConfig
from physics.lap_time_simulator import LapTimeSimulator, CarParameters
from physics.aerodynamics import AerodynamicPhysics


@dataclass
class CircuitAnalysis:
    """Results of circuit analysis"""
    track_name: str
    qualifying_lap_time: str
    race_lap_time: str
    optimal_config: Dict
    time_gain_quali: float
    time_gain_race: float
    downforce_requirement: str
    top_speed_estimate: float
    avg_corner_speed: float
    top_speed: float = 0.0  # Alias for top_speed_estimate
    setup_recommendations: Dict = None
    critical_corners: list = None


class CircuitAnalyzer:
    """
    Analyzes circuits and provides aerodynamic recommendations
    """
    
    def __init__(self):
        self.lap_simulator = LapTimeSimulator()
        self.aero_physics = AerodynamicPhysics()
    
    def analyze_circuit(self, track_name: str, current_config: Dict) -> CircuitAnalysis:
        """
        Analyze a circuit and predict optimal lap times
        
        Args:
            track_name: Name of the track
            current_config: Current aerodynamic configuration
            
        Returns:
            CircuitAnalysis object
        """
        track_config = get_track_by_name(track_name)
        
        if not track_config:
            raise ValueError(f"Track '{track_name}' not found")
        
        # Create car parameters from current config
        current_params = CarParameters(
            drag_coefficient=current_config.get('drag_coefficient', 0.70),
            cl_front=current_config.get('cl_front', 1.5),
            cl_rear=current_config.get('cl_rear', 2.0),
            front_wing_angle=current_config.get('front_wing_angle', 22),
            rear_wing_angle=current_config.get('rear_wing_angle', 26),
            ride_height_front=current_config.get('ride_height_front', 12),
            ride_height_rear=current_config.get('ride_height_rear', 14)
        )
        
        # Simulate with current config
        current_quali, current_race = self.lap_simulator.predict_optimal_laptime(
            current_params, track_config
        )
        
        # Get optimal configuration for this track using AerodynamicPhysics
        optimal_aero = self.aero_physics.optimize_for_track(track_config.__dict__)
        
        # Create optimal car parameters
        optimal_params = CarParameters(
            mass=current_params.mass,
            power=current_params.power,
            drag_coefficient=optimal_aero['drag_coefficient'],
            cl_front=optimal_aero['cl_front'],
            cl_rear=optimal_aero['cl_rear'],
            front_wing_angle=optimal_aero['front_wing_angle'],
            rear_wing_angle=optimal_aero['rear_wing_angle'],
            ride_height_front=optimal_aero['ride_height_front'],
            ride_height_rear=optimal_aero['ride_height_rear']
        )
        
        # Simulate with optimal config
        optimal_quali, optimal_race = self.lap_simulator.predict_optimal_laptime(
            optimal_params, track_config
        )
        
        # Calculate time gains
        time_gain_quali = self._parse_laptime(current_quali) - self._parse_laptime(optimal_quali)
        time_gain_race = self._parse_laptime(current_race) - self._parse_laptime(optimal_race)
        
        # Estimate speeds
        top_speed = self._estimate_top_speed(optimal_params, track_config)
        avg_corner_speed = self._estimate_corner_speed(optimal_params, track_config)
        
        # Generate setup recommendations (simple dict)
        setup_recommendations = {
            'wing_angles': {
                'front': f"{optimal_params.front_wing_angle}°",
                'rear': f"{optimal_params.rear_wing_angle}°"
            },
            'ride_heights': {
                'front': f"{optimal_params.ride_height_front}mm",
                'rear': f"{optimal_params.ride_height_rear}mm"
            },
            'downforce_level': track_config.downforce_level.value
        }
        
        # Identify critical corners
        critical_corners = ["Medium-speed corners - balanced setup"]
        
        return CircuitAnalysis(
            track_name=track_config.name,
            qualifying_lap_time=optimal_quali,
            race_lap_time=optimal_race,
            optimal_config={
                'drag_coefficient': optimal_params.drag_coefficient,
                'cl_front': optimal_params.cl_front,
                'cl_rear': optimal_params.cl_rear,
                'front_wing_angle': optimal_params.front_wing_angle,
                'rear_wing_angle': optimal_params.rear_wing_angle
            },
            time_gain_quali=time_gain_quali,
            time_gain_race=time_gain_race,
            downforce_requirement=track_config.downforce_level.value,
            top_speed_estimate=top_speed,
            avg_corner_speed=avg_corner_speed,
            top_speed=top_speed,  # Set alias
            setup_recommendations=setup_recommendations,
            critical_corners=critical_corners
        )
    
    def _parse_laptime(self, laptime_str: str) -> float:
        """Convert lap time string M:SS.mmm to seconds"""
        try:
            parts = laptime_str.split(':')
            minutes = int(parts[0])
            seconds = float(parts[1])
            return minutes * 60 + seconds
        except:
            return 90.0  # Default fallback
    
    def _estimate_top_speed(self, car_params: CarParameters, track_config: TrackConfig) -> float:
        """Estimate maximum speed on longest straight (km/h)"""
        # Terminal velocity when drag equals engine force
        # Simplified: v = (2 * P / (ρ * Cd * A))^(1/3)
        power = car_params.power
        cd = car_params.drag_coefficient
        area = car_params.frontal_area
        rho = 1.225
        
        # Iterative approximation
        v = 90  # Start at ~324 km/h
        for _ in range(10):
            drag = 0.5 * rho * (v ** 2) * cd * area
            v_new = power / drag
            v = (v + v_new) / 2
        
        return v * 3.6  # Convert to km/h
    
    def _estimate_corner_speed(self, car_params: CarParameters, track_config: TrackConfig) -> float:
        """Estimate average corner speed (km/h)"""
        # Based on typical corner radius and downforce
        typical_radius = 50  # meters (medium corner)
        
        # Corner speed with downforce
        v_estimate = 40  # m/s initial guess
        downforce_at_v = 0.5 * 1.225 * (v_estimate ** 2) * (car_params.cl_front + car_params.cl_rear) * car_params.frontal_area
        
        normal_force = (car_params.mass * 9.81) + downforce_at_v
        max_lat_accel = (car_params.tire_friction * normal_force) / car_params.mass
        v_corner = math.sqrt(max_lat_accel * typical_radius)
        
        return v_corner * 3.6  # Convert to km/h
    
    def compare_with_baseline(self, track_name: str, predicted_time: str) -> Dict:
        """
        Compare predicted time with 2024 baseline
        
        Args:
            track_name: Track name
            predicted_time: Predicted lap time
            
        Returns:
            Comparison data
        """
        track_config = get_track_by_name(track_name)
        
        if not track_config or not track_config.fastest_quali_2024:
            return {'comparison_available': False}
        
        baseline_2024 = self._parse_laptime(track_config.fastest_quali_2024)
        predicted = self._parse_laptime(predicted_time)
        
        delta = predicted - baseline_2024
        
        return {
            'comparison_available': True,
            'baseline_2024': track_config.fastest_quali_2024,
            'predicted_2025': predicted_time,
            'delta_seconds': delta,
            'percentage_diff': (delta / baseline_2024) * 100
        }