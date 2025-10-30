"""Enhanced Performance Estimator with Physics-Based Models"""
from typing import Dict, List, Tuple
import numpy as np
from dataclasses import dataclass

@dataclass
class PerformanceMetrics:
    """Complete performance metrics"""
    top_speed: float  # km/h
    avg_corner_speed: float  # km/h
    ld_ratio: float
    acceleration_0_100: float  # seconds
    acceleration_0_200: float  # seconds
    braking_distance_100_0: float  # meters
    braking_distance_200_0: float  # meters
    overall_balance: float  # percentage (front bias)
    aero_efficiency: float  # score 0-1
    straight_line_performance: float  # score 0-1
    corner_performance: float  # score 0-1
    tire_stress_factor: float  # 0-1 (higher = more stress)
    fuel_efficiency: float  # relative consumption
    
class PerformanceEstimator:
    """Estimates comprehensive car performance from aerodynamic configuration"""
    
    def __init__(self):
        # Physics constants
        self.air_density = 1.225  # kg/m³
        self.car_mass = 798  # kg
        self.engine_power = 745000  # Watts (~1000 HP)
        self.frontal_area = 1.4  # m²
        
        # Performance baselines (reference car)
        self.baseline_cd = 0.70
        self.baseline_cl = 3.5
        self.baseline_top_speed = 340  # km/h
        self.baseline_corner_speed = 180  # km/h
    
    def estimate_performance(self, aero_config: Dict, track_config: Dict) -> Dict[str, float]:
        """
        Comprehensive performance estimation
        
        Args:
            aero_config: Current aerodynamic configuration
            track_config: Track characteristics
            
        Returns:
            Dictionary of performance metrics
        """
        cd = aero_config.get('drag_coefficient', 0.70)
        cl_front = aero_config.get('cl_front', 1.5)
        cl_rear = aero_config.get('cl_rear', 2.0)
        front_wing_angle = aero_config.get('front_wing_angle', 22.0)
        rear_wing_angle = aero_config.get('rear_wing_angle', 26.0)
        
        total_downforce = cl_front + cl_rear
        
        # 1. Top Speed Calculation (REALISTIC F1 SPEEDS)
        # Real F1 top speeds (2025 season data):
        # - Monza (lowest drag): 360-370 km/h (with DRS)
        # - Normal circuits: 320-350 km/h
        # - Monaco (highest downforce): 290-310 km/h
        
        # Base calculation using realistic F1 performance
        # Using empirical formula calibrated to real F1 data
        base_top_speed = 350.0  # Baseline at Cd=0.70
        
        # Drag coefficient effect (every 0.01 Cd ≈ 2 km/h)
        cd_effect = (0.70 - cd) * 200  # Linear relationship
        
        # Downforce effect on top speed (more downforce = more drag)
        df_drag_penalty = (total_downforce - 3.5) * -3.0  # Each 0.1 CL costs ~3 km/h
        
        # Calculate realistic top speed
        top_speed = base_top_speed + cd_effect + df_drag_penalty
        
        # Apply realistic bounds based on configuration
        # Ultra-low drag (Monza): max 370 km/h
        # Medium drag: 340-355 km/h
        # High drag (Monaco): 300-320 km/h
        if cd < 0.68:  # Very low drag
            top_speed = np.clip(top_speed, 355.0, 370.0)
        elif cd > 0.73:  # High drag
            top_speed = np.clip(top_speed, 300.0, 340.0)
        else:  # Medium drag
            top_speed = np.clip(top_speed, 330.0, 360.0)
        
        # 2. Corner Speed Calculation (REALISTIC F1 CORNER SPEEDS)
        # Typical F1 corner speeds: 120-220 km/h depending on corner type
        # High-speed corners: 180-220 km/h
        # Medium corners: 140-180 km/h
        # Slow corners: 80-140 km/h
        
        # Base corner speed calculation with downforce effect
        downforce_factor = total_downforce / self.baseline_cl
        avg_corner_speed = self.baseline_corner_speed * (downforce_factor ** 0.4)
        
        # Realistic limits: min 120 km/h, max 220 km/h
        avg_corner_speed = np.clip(avg_corner_speed, 120.0, 220.0)
        
        # Adjust for drag penalty in corners (minimal effect)
        drag_penalty = (cd / self.baseline_cd) ** 0.1
        avg_corner_speed *= (1.05 - drag_penalty * 0.05)
        
        # 3. L/D Ratio (aerodynamic efficiency)
        ld_ratio = total_downforce / cd if cd > 0 else 0
        
        # 4. Acceleration (0-100 km/h)
        # Affected by drag and power-to-weight
        base_acceleration_time = 2.6  # seconds (F1 baseline)
        drag_impact = (cd - self.baseline_cd) * 8  # More drag = slower
        downforce_impact = (total_downforce - self.baseline_cl) * -0.15  # More downforce = more grip = faster
        acceleration_0_100 = max(2.0, base_acceleration_time + drag_impact + downforce_impact)
        
        # 5. Acceleration (0-200 km/h)
        # Drag becomes more significant at higher speeds
        acceleration_0_200 = acceleration_0_100 * 2.8 + (cd - self.baseline_cd) * 15
        
        # 6. Braking Distance (100-0 km/h)
        # More downforce = shorter braking distance
        base_braking_100 = 65  # meters
        downforce_benefit = (total_downforce - self.baseline_cl) * -12  # More DF = shorter distance
        braking_100_0 = max(45, base_braking_100 + downforce_benefit)
        
        # 7. Braking Distance (200-0 km/h)
        # High-speed braking heavily influenced by downforce
        base_braking_200 = 180  # meters
        braking_200_0 = max(140, base_braking_200 + downforce_benefit * 2.5)
        
        # 8. Aerodynamic Balance
        overall_balance = (cl_front / total_downforce) * 100 if total_downforce > 0 else 50
        
        # 9. Aero Efficiency Score (0-1)
        # Optimal L/D ratio for F1 is around 4.0-4.5
        ld_efficiency = min(1.0, ld_ratio / 4.5)
        
        # Balance efficiency (ideal: 38-42% front)
        balance_deviation = abs(overall_balance - 40) / 40
        balance_efficiency = max(0, 1 - balance_deviation)
        
        aero_efficiency = (ld_efficiency * 0.6 + balance_efficiency * 0.4)
        
        # 10. Straight-line Performance Score
        # Trade-off between top speed and acceleration
        speed_score = min(1.0, top_speed / 360)  # 360 km/h = perfect
        accel_score = max(0, 1 - (acceleration_0_100 - 2.0) / 2.0)
        straight_line_performance = (speed_score * 0.6 + accel_score * 0.4)
        
        # 11. Corner Performance Score
        # Combination of corner speed and braking
        corner_speed_score = min(1.0, avg_corner_speed / 220)  # 220 km/h = excellent
        braking_score = max(0, 1 - (braking_100_0 - 45) / 30)
        corner_performance = (corner_speed_score * 0.7 + braking_score * 0.3)
        
        # 12. Tire Stress Factor
        # High downforce = more tire stress
        # Too low downforce = sliding = high stress
        optimal_downforce = 3.5
        downforce_stress = abs(total_downforce - optimal_downforce) / optimal_downforce
        tire_stress_factor = min(1.0, 0.3 + downforce_stress * 0.7)
        
        # 13. Fuel Efficiency
        # Lower drag = better fuel efficiency
        drag_efficiency = self.baseline_cd / cd if cd > 0 else 1.0
        fuel_efficiency = min(1.2, drag_efficiency)  # Normalized
        
        # Track-specific adjustments
        downforce_level = track_config.get('downforce_level', 'medium')
        if hasattr(downforce_level, 'value'):
            df_level = downforce_level.value
        else:
            df_level = str(downforce_level).lower()
        
        # Penalize mismatched configurations
        if df_level == 'high' and total_downforce < 3.8:
            corner_performance *= 0.85  # Underwinged for track
        elif df_level == 'low' and total_downforce > 3.2:
            straight_line_performance *= 0.85  # Overwinged for track
        
        return {
            'top_speed': top_speed,
            'avg_corner_speed': avg_corner_speed,
            'ld_ratio': ld_ratio,
            'acceleration_0_100kmh': acceleration_0_100,
            'acceleration_0_200kmh': acceleration_0_200,
            'braking_distance_100_0': braking_100_0,
            'braking_distance_200_0': braking_200_0,
            'overall_balance': overall_balance,
            'aero_efficiency': aero_efficiency,
            'straight_line_performance': straight_line_performance,
            'corner_performance': corner_performance,
            'tire_stress_factor': tire_stress_factor,
            'fuel_efficiency': fuel_efficiency
        }
    
    def estimate_detailed_metrics(self, aero_config: Dict, track_config: Dict) -> PerformanceMetrics:
        """Return detailed performance metrics as dataclass"""
        metrics = self.estimate_performance(aero_config, track_config)
        return PerformanceMetrics(**metrics)
    
    def compare_configurations(self, config1: Dict, config2: Dict, track_config: Dict) -> Dict:
        """
        Compare two configurations
        
        Args:
            config1: First configuration
            config2: Second configuration
            track_config: Track characteristics
            
        Returns:
            Comparison with deltas
        """
        perf1 = self.estimate_performance(config1, track_config)
        perf2 = self.estimate_performance(config2, track_config)
        
        comparison = {
            'config1': perf1,
            'config2': perf2,
            'deltas': {}
        }
        
        for key in perf1.keys():
            comparison['deltas'][key] = perf1[key] - perf2[key]
        
        # Determine winner
        score1 = (perf1['straight_line_performance'] + perf1['corner_performance'] + perf1['aero_efficiency']) / 3
        score2 = (perf2['straight_line_performance'] + perf2['corner_performance'] + perf2['aero_efficiency']) / 3
        
        comparison['winner'] = 1 if score1 > score2 else 2
        comparison['overall_delta'] = score1 - score2
        
        return comparison
    
    def sensitivity_analysis(self, base_config: Dict, track_config: Dict, parameter: str, range_pct: float = 10) -> Dict:
        """
        Analyze sensitivity of performance to a specific parameter
        
        Args:
            base_config: Base configuration
            track_config: Track characteristics
            parameter: Parameter to vary
            range_pct: Percentage range to test
            
        Returns:
            Sensitivity data
        """
        base_value = base_config.get(parameter, 1.0)
        variations = np.linspace(base_value * (1 - range_pct/100), 
                                base_value * (1 + range_pct/100), 11)
        
        results = []
        for val in variations:
            test_config = base_config.copy()
            test_config[parameter] = val
            perf = self.estimate_performance(test_config, track_config)
            results.append({
                'parameter_value': val,
                'top_speed': perf['top_speed'],
                'corner_speed': perf['avg_corner_speed'],
                'ld_ratio': perf['ld_ratio'],
                'overall_score': (perf['straight_line_performance'] + perf['corner_performance']) / 2
            })
        
        return {
            'parameter': parameter,
            'base_value': base_value,
            'range': (variations[0], variations[-1]),
            'results': results
        }