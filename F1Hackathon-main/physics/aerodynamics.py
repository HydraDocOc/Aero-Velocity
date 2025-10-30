"""
Aerodynamics Physics Engine
Implements real physics formulas for F1 car aerodynamic calculations
"""
import numpy as np
from dataclasses import dataclass
from typing import Dict, Tuple, Optional
import math

from config.settings import (
    AIR_DENSITY, F1_CAR_MASS, F1_FRONTAL_AREA_TYPICAL,
    CD_BASELINE, CL_FRONT_BASELINE, CL_REAR_BASELINE, GRAVITY
)


@dataclass
class AeroState:
    """Represents the aerodynamic state of an F1 car"""
    velocity: float  # m/s
    drag_coefficient: float
    lift_coefficient_front: float
    lift_coefficient_rear: float
    frontal_area: float
    ride_height_front: float  # mm
    ride_height_rear: float  # mm
    wing_angle_front: float  # degrees
    wing_angle_rear: float  # degrees
    yaw_angle: float = 0.0  # degrees
    ground_effect_active: bool = True


class AerodynamicPhysics:
    """
    Core aerodynamics physics engine using real formulas
    """
    
    def __init__(self, air_density: float = AIR_DENSITY):
        self.air_density = air_density
        self.g = GRAVITY
    
    def calculate_drag_force(self, state: AeroState) -> float:
        """
        Calculate drag force using drag equation: F_d = 0.5 * ρ * v² * C_d * A
        
        Args:
            state: Aerodynamic state
            
        Returns:
            Drag force in Newtons
        """
        # Adjust Cd for yaw angle (increases drag)
        cd_adjusted = state.drag_coefficient * (1 + 0.02 * abs(state.yaw_angle))
        
        # Drag equation
        drag = 0.5 * self.air_density * (state.velocity ** 2) * cd_adjusted * state.frontal_area
        
        return drag
    
    def calculate_downforce(self, state: AeroState) -> Tuple[float, float, float]:
        """
        Calculate downforce using lift equation: F_l = 0.5 * ρ * v² * C_l * A
        
        Returns:
            Tuple of (front_downforce, rear_downforce, total_downforce) in Newtons
        """
        # Ground effect increases downforce at lower ride heights
        ground_effect_front = self._ground_effect_factor(state.ride_height_front)
        ground_effect_rear = self._ground_effect_factor(state.ride_height_rear)
        
        # Wing angle effect (more angle = more downforce, up to stall)
        wing_efficiency_front = self._wing_efficiency(state.wing_angle_front)
        wing_efficiency_rear = self._wing_efficiency(state.wing_angle_rear)
        
        # Effective lift coefficients
        cl_front_eff = state.lift_coefficient_front * ground_effect_front * wing_efficiency_front
        cl_rear_eff = state.lift_coefficient_rear * ground_effect_rear * wing_efficiency_rear
        
        # Downforce calculation (negative lift)
        dynamic_pressure = 0.5 * self.air_density * (state.velocity ** 2) * state.frontal_area
        
        front_downforce = dynamic_pressure * cl_front_eff
        rear_downforce = dynamic_pressure * cl_rear_eff
        total_downforce = front_downforce + rear_downforce
        
        return front_downforce, rear_downforce, total_downforce
    
    def _ground_effect_factor(self, ride_height_mm: float) -> float:
        """
        Calculate ground effect multiplier based on ride height
        Lower ride height = more ground effect
        
        Args:
            ride_height_mm: Ride height in millimeters
            
        Returns:
            Ground effect multiplier
        """
        # Optimal ride height around 10-15mm
        # Too low causes porpoising, too high loses ground effect
        optimal_height = 12.0
        
        if ride_height_mm < 5:
            # Too low - airflow stalls
            return 0.8 + 0.04 * ride_height_mm
        elif ride_height_mm <= optimal_height:
            # Optimal zone - maximum ground effect
            return 1.0 + 0.3 * (optimal_height - ride_height_mm) / optimal_height
        else:
            # Above optimal - ground effect diminishes
            decay = math.exp(-(ride_height_mm - optimal_height) / 50)
            return 1.0 + 0.3 * decay
    
    def _wing_efficiency(self, angle_degrees: float) -> float:
        """
        Calculate wing efficiency based on angle of attack
        
        Args:
            angle_degrees: Wing angle in degrees
            
        Returns:
            Efficiency multiplier
        """
        # Typical F1 wing operates at 15-35 degrees
        # Stall occurs around 40+ degrees
        optimal_angle = 25.0
        stall_angle = 40.0
        
        if angle_degrees < stall_angle:
            # Linear region up to stall
            efficiency = 0.5 + (angle_degrees / optimal_angle) * 0.5
            return min(efficiency, 1.0)
        else:
            # Post-stall - significant loss
            return 0.3
    
    def calculate_lift_to_drag_ratio(self, state: AeroState) -> float:
        """
        Calculate L/D ratio - measure of aerodynamic efficiency
        
        Args:
            state: Aerodynamic state
            
        Returns:
            L/D ratio
        """
        _, _, total_downforce = self.calculate_downforce(state)
        drag = self.calculate_drag_force(state)
        
        if drag > 0:
            return total_downforce / drag
        return 0.0
    
    def calculate_aerodynamic_balance(self, state: AeroState) -> float:
        """
        Calculate aerodynamic balance (front downforce as % of total)
        Typical F1 balance: 35-40% front, 60-65% rear
        
        Args:
            state: Aerodynamic state
            
        Returns:
            Front balance percentage (0-100)
        """
        front_df, rear_df, total_df = self.calculate_downforce(state)
        
        if total_df > 0:
            return (front_df / total_df) * 100
        return 50.0
    
    def calculate_pressure_distribution(self, state: AeroState, n_points: int = 50) -> Dict[str, np.ndarray]:
        """
        Estimate pressure distribution along the car
        Using simplified Bernoulli equation: P + 0.5*ρ*v² = constant
        
        Args:
            state: Aerodynamic state
            n_points: Number of points to calculate
            
        Returns:
            Dictionary with pressure distribution data
        """
        # Car length positions (normalized 0 to 1)
        x = np.linspace(0, 1, n_points)
        
        # Free stream pressure
        p_inf = 101325  # Pa (atmospheric)
        q_inf = 0.5 * self.air_density * state.velocity ** 2
        
        # Simplified pressure coefficient distribution
        # Front: high pressure (stagnation)
        # Over car: low pressure (acceleration)
        # Rear: pressure recovery
        
        cp = np.zeros(n_points)
        
        for i, pos in enumerate(x):
            if pos < 0.1:  # Front wing / nose
                cp[i] = 0.8 - 8 * pos  # Stagnation to suction
            elif pos < 0.3:  # Underbody entrance
                cp[i] = -0.3 - 1.5 * (pos - 0.1)
            elif pos < 0.7:  # Floor / diffuser
                cp[i] = -0.6 - 0.8 * math.sin(math.pi * (pos - 0.3) / 0.4)
            else:  # Rear wing / diffuser exit
                cp[i] = -1.0 + 2.5 * (pos - 0.7)
        
        # Apply ground effect
        if state.ground_effect_active:
            # Enhanced suction under car
            mask = (x >= 0.3) & (x <= 0.7)
            cp[mask] *= (1 + 0.3 * self._ground_effect_factor(state.ride_height_rear))
        
        # Convert Cp to actual pressure
        pressure = p_inf + cp * q_inf
        
        return {
            'position': x,
            'pressure_coefficient': cp,
            'pressure': pressure,
            'dynamic_pressure': q_inf
        }
    
    def calculate_vortex_generation(self, state: AeroState) -> Dict[str, float]:
        """
        Estimate vortex generation and strength
        Vortices are crucial for managing airflow and downforce
        
        Args:
            state: Aerodynamic state
            
        Returns:
            Dictionary with vortex metrics
        """
        # Vortex strength proportional to velocity and wing angles
        front_wing_vorticity = state.velocity * math.sin(math.radians(state.wing_angle_front)) * 10
        
        # Y250 vortex (from front wing endplate)
        y250_strength = front_wing_vorticity * 0.7
        
        # Bargeboard vortices
        bargeboard_strength = state.velocity * 8
        
        # Diffuser vortices
        diffuser_vorticity = state.velocity * state.lift_coefficient_rear * 5
        
        # Tip vortices from rear wing
        rear_wing_vorticity = state.velocity * math.sin(math.radians(state.wing_angle_rear)) * 8
        
        total_vorticity = (y250_strength + bargeboard_strength + 
                          diffuser_vorticity + rear_wing_vorticity)
        
        return {
            'y250_vortex': y250_strength,
            'bargeboard_vortices': bargeboard_strength,
            'diffuser_vortices': diffuser_vorticity,
            'rear_wing_vortices': rear_wing_vorticity,
            'total_vorticity': total_vorticity
        }
    
    def calculate_drs_effect(self, state: AeroState, drs_open: bool) -> Dict[str, float]:
        """
        Calculate the effect of DRS (Drag Reduction System)
        
        Args:
            state: Aerodynamic state
            drs_open: Whether DRS is open
            
        Returns:
            Dictionary with DRS effects
        """
        if not drs_open:
            return {
                'drag_reduction': 0.0,
                'downforce_loss': 0.0,
                'speed_gain': 0.0
            }
        
        # DRS reduces rear wing drag by ~10% and downforce by ~15%
        drag_reduction = 0.10 * state.drag_coefficient
        downforce_loss = 0.15 * state.lift_coefficient_rear
        
        # Estimate speed gain (simplified)
        drag_normal = self.calculate_drag_force(state)
        drag_drs = drag_normal * 0.90
        
        # Power-limited speed gain: P = F * v
        # Assuming constant power, v_drs = v * (F_normal / F_drs)
        speed_gain_kmh = state.velocity * 3.6 * (1 - math.sqrt(drag_drs / drag_normal))
        
        return {
            'drag_reduction': drag_reduction,
            'downforce_loss': downforce_loss,
            'speed_gain': abs(speed_gain_kmh)
        }
    
    def calculate_reynolds_number(self, state: AeroState, characteristic_length: float = 5.0) -> float:
        """
        Calculate Reynolds number: Re = ρ * v * L / μ
        
        Args:
            state: Aerodynamic state
            characteristic_length: Reference length in meters (default: car length)
            
        Returns:
            Reynolds number
        """
        # Dynamic viscosity of air at 15°C
        mu = 1.81e-5  # Pa·s
        
        re = (self.air_density * state.velocity * characteristic_length) / mu
        
        return re
    
    def optimize_for_track(self, track_characteristics: Dict) -> Dict[str, float]:
        """
        Optimize aerodynamic configuration for specific track
        
        Args:
            track_characteristics: Track data (downforce level, corners, straights)
            
        Returns:
            Optimized aerodynamic parameters
        """
        downforce_level = track_characteristics.get('downforce_level', 'medium')
        
        if downforce_level == 'low':  # High-speed tracks (Monza, Spa)
            return {
                'drag_coefficient': 0.68,
                'cl_front': 1.2,
                'cl_rear': 1.6,
                'front_wing_angle': 15,
                'rear_wing_angle': 18,
                'ride_height_front': 15,
                'ride_height_rear': 18
            }
        elif downforce_level == 'high':  # Slow tracks (Monaco, Hungary)
            return {
                'drag_coefficient': 0.75,
                'cl_front': 1.8,
                'cl_rear': 2.4,
                'front_wing_angle': 30,
                'rear_wing_angle': 35,
                'ride_height_front': 8,
                'ride_height_rear': 10
            }
        else:  # Medium downforce (most tracks)
            return {
                'drag_coefficient': 0.70,
                'cl_front': 1.5,
                'cl_rear': 2.0,
                'front_wing_angle': 22,
                'rear_wing_angle': 26,
                'ride_height_front': 12,
                'ride_height_rear': 14
            }
    
    def calculate_porpoising_risk(self, state: AeroState) -> Dict[str, any]:
        """
        Estimate porpoising risk based on ride height and downforce
        
        Args:
            state: Aerodynamic state
            
        Returns:
            Porpoising risk assessment
        """
        # Porpoising occurs when ride height is too low and downforce fluctuates
        _, _, downforce = self.calculate_downforce(state)
        
        # Critical ride height threshold
        min_safe_height = 8.0  # mm
        
        # Risk factors
        ride_height_risk = max(0, (min_safe_height - state.ride_height_front) / min_safe_height)
        downforce_risk = min(1.0, downforce / (F1_CAR_MASS * self.g * 4))  # downforce to weight ratio
        
        combined_risk = ride_height_risk * downforce_risk
        
        if combined_risk > 0.7:
            risk_level = "HIGH"
        elif combined_risk > 0.4:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"
        
        return {
            'risk_level': risk_level,
            'risk_score': combined_risk,
            'ride_height_factor': ride_height_risk,
            'downforce_factor': downforce_risk,
            'recommendation': 'Increase ride height' if combined_risk > 0.6 else 'Configuration acceptable'
        }