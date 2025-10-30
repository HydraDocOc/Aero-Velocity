"""Enhanced Aero Predictor with Configuration Comparison and Recommendations"""
from typing import Dict, List, Tuple
import numpy as np
from dataclasses import dataclass

@dataclass
class ConfigComparison:
    """Detailed comparison between current and optimal configuration"""
    parameter: str
    current_value: float
    optimal_value: float
    delta: float
    status: str  # 'Optimal', 'Close', 'Needs Improvement', 'Critical'
    impact_on_laptime: float  # seconds
    recommendation: str

@dataclass
class AeroRecommendation:
    """Complete aerodynamic recommendation package"""
    track_name: str
    current_config: Dict
    optimal_config: Dict
    comparisons: List[ConfigComparison]
    overall_gap: float  # seconds
    priority_upgrades: List[str]
    quick_wins: List[str]  # Setup changes (no cost)
    major_upgrades: List[str]  # Physical components
    estimated_improvement: float  # seconds
    competitive_analysis: Dict

class AeroPredictionModel:
    """ML-based aerodynamic configuration predictor with comparison and recommendations"""
    
    def __init__(self):
        self.model_trained = False
        self.impact_weights = {
            'drag_coefficient': 0.15,      # 0.01 difference = ~0.15s per lap
            'cl_front': 0.08,              # 0.1 difference = ~0.08s
            'cl_rear': 0.10,               # 0.1 difference = ~0.10s
            'front_wing_angle': 0.05,      # 1 degree = ~0.05s
            'rear_wing_angle': 0.06,       # 1 degree = ~0.06s
            'ride_height_front': 0.03,     # 1mm = ~0.03s
            'ride_height_rear': 0.04       # 1mm = ~0.04s
        }
    
    def predict_optimal_config(self, track_config: Dict, current_config: Dict) -> Dict:
        """Predict optimal aerodynamic configuration for track"""
        downforce_level = track_config.get('downforce_level', 'medium')
        
        if hasattr(downforce_level, 'value'):
            df_level = downforce_level.value
        else:
            df_level = str(downforce_level).lower()
        
        # Predict based on track characteristics
        if df_level == 'low':  # High-speed tracks (Monza, Spa, Canada)
            return {
                'drag_coefficient': 0.68,
                'cl_front': 1.2,
                'cl_rear': 1.6,
                'front_wing_angle': 18.0,
                'rear_wing_angle': 21.0,
                'ride_height_front': 14.0,
                'ride_height_rear': 16.0,
                'reasoning': 'Minimize drag for maximum straight-line speed'
            }
        elif df_level == 'high':  # Slow, twisty tracks (Monaco, Hungary, Singapore)
            return {
                'drag_coefficient': 0.75,
                'cl_front': 1.8,
                'cl_rear': 2.4,
                'front_wing_angle': 32.0,
                'rear_wing_angle': 37.0,
                'ride_height_front': 8.0,
                'ride_height_rear': 10.0,
                'reasoning': 'Maximize downforce for corner speed, drag less critical'
            }
        else:  # Medium downforce (most tracks)
            return {
                'drag_coefficient': 0.70,
                'cl_front': 1.5,
                'cl_rear': 2.0,
                'front_wing_angle': 23.0,
                'rear_wing_angle': 27.0,
                'ride_height_front': 12.0,
                'ride_height_rear': 14.0,
                'reasoning': 'Balanced setup for mixed speed corners and straights'
            }
    
    def compare_and_recommend(self, track_name: str, track_config: Dict, 
                             current_config: Dict, competitor_configs: List[Dict] = None) -> AeroRecommendation:
        """
        Complete analysis: compare current vs optimal, provide detailed recommendations
        
        Args:
            track_name: Name of the track
            track_config: Track characteristics
            current_config: Current aerodynamic configuration
            competitor_configs: Optional list of competitor configurations
            
        Returns:
            Complete AeroRecommendation with comparisons and suggestions
        """
        # Get optimal configuration
        optimal_config = self.predict_optimal_config(track_config, current_config)
        
        # Compare each parameter
        comparisons = []
        total_time_loss = 0.0
        
        # Drag coefficient
        comp = self._compare_parameter(
            'drag_coefficient', 
            current_config.get('drag_coefficient', 0.70),
            optimal_config['drag_coefficient'],
            'Cd',
            lower_is_better=True
        )
        comparisons.append(comp)
        total_time_loss += comp.impact_on_laptime
        
        # Front downforce
        comp = self._compare_parameter(
            'cl_front',
            current_config.get('cl_front', 1.5),
            optimal_config['cl_front'],
            'Front Downforce',
            lower_is_better=False
        )
        comparisons.append(comp)
        total_time_loss += comp.impact_on_laptime
        
        # Rear downforce
        comp = self._compare_parameter(
            'cl_rear',
            current_config.get('cl_rear', 2.0),
            optimal_config['cl_rear'],
            'Rear Downforce',
            lower_is_better=False
        )
        comparisons.append(comp)
        total_time_loss += comp.impact_on_laptime
        
        # Front wing angle
        comp = self._compare_parameter(
            'front_wing_angle',
            current_config.get('front_wing_angle', 22.0),
            optimal_config['front_wing_angle'],
            'Front Wing Angle',
            lower_is_better=None,
            unit='°'
        )
        comparisons.append(comp)
        total_time_loss += comp.impact_on_laptime
        
        # Rear wing angle
        comp = self._compare_parameter(
            'rear_wing_angle',
            current_config.get('rear_wing_angle', 26.0),
            optimal_config['rear_wing_angle'],
            'Rear Wing Angle',
            lower_is_better=None,
            unit='°'
        )
        comparisons.append(comp)
        total_time_loss += comp.impact_on_laptime
        
        # Ride heights
        comp = self._compare_parameter(
            'ride_height_front',
            current_config.get('ride_height_front', 12.0),
            optimal_config['ride_height_front'],
            'Front Ride Height',
            lower_is_better=None,
            unit='mm'
        )
        comparisons.append(comp)
        total_time_loss += comp.impact_on_laptime
        
        comp = self._compare_parameter(
            'ride_height_rear',
            current_config.get('ride_height_rear', 14.0),
            optimal_config['ride_height_rear'],
            'Rear Ride Height',
            lower_is_better=None,
            unit='mm'
        )
        comparisons.append(comp)
        total_time_loss += comp.impact_on_laptime
        
        # Categorize recommendations
        quick_wins = []  # Setup changes
        major_upgrades = []  # Component upgrades
        priority_upgrades = []
        
        for comp in comparisons:
            if comp.status in ['Needs Improvement', 'Critical']:
                # Setup changes (no physical modifications)
                if comp.parameter in ['front_wing_angle', 'rear_wing_angle', 'ride_height_front', 'ride_height_rear']:
                    quick_wins.append(comp.recommendation)
                # Component upgrades (physical changes needed)
                elif comp.parameter in ['drag_coefficient', 'cl_front', 'cl_rear']:
                    major_upgrades.append(comp.recommendation)
                
                if comp.status == 'Critical':
                    priority_upgrades.append(comp.parameter.replace('_', ' ').title())
        
        # Competitive analysis
        competitive_analysis = self._analyze_vs_competitors(
            current_config, optimal_config, competitor_configs
        )
        
        return AeroRecommendation(
            track_name=track_name,
            current_config=current_config,
            optimal_config=optimal_config,
            comparisons=comparisons,
            overall_gap=total_time_loss,
            priority_upgrades=priority_upgrades,
            quick_wins=quick_wins,
            major_upgrades=major_upgrades,
            estimated_improvement=total_time_loss,
            competitive_analysis=competitive_analysis
        )
    
    def _compare_parameter(self, param_name: str, current: float, optimal: float, 
                          display_name: str, lower_is_better: bool = None, unit: str = '') -> ConfigComparison:
        """Compare a single parameter and generate recommendation"""
        delta = current - optimal
        abs_delta = abs(delta)
        
        # Calculate lap time impact
        if param_name in self.impact_weights:
            base_impact = self.impact_weights[param_name]
            if param_name == 'drag_coefficient':
                impact = abs_delta * base_impact / 0.01
            elif param_name in ['cl_front', 'cl_rear']:
                impact = abs_delta * base_impact / 0.1
            else:  # angles and ride heights
                impact = abs_delta * base_impact
        else:
            impact = 0.0
        
        # Determine status
        threshold_critical = 0.15 if 'coefficient' in param_name else (0.3 if 'cl_' in param_name else (5 if 'angle' in param_name else 3))
        threshold_improvement = threshold_critical * 0.5
        threshold_close = threshold_critical * 0.2
        
        if abs_delta < threshold_close:
            status = 'Optimal'
        elif abs_delta < threshold_improvement:
            status = 'Close'
        elif abs_delta < threshold_critical:
            status = 'Needs Improvement'
        else:
            status = 'Critical'
        
        # Generate recommendation
        if status == 'Optimal':
            recommendation = f"{display_name} is optimal for this track"
        elif status == 'Close':
            if delta > 0:
                recommendation = f"Slightly reduce {display_name} by {abs_delta:.2f}{unit} for minor gain"
            else:
                recommendation = f"Slightly increase {display_name} by {abs_delta:.2f}{unit} for minor gain"
        else:
            if param_name == 'drag_coefficient':
                if delta > 0:
                    recommendation = f"CRITICAL: Reduce drag by {abs_delta:.3f}. Streamline bodywork, reduce wing angles, or bring low-drag package. Losing {impact:.3f}s per lap!"
                else:
                    recommendation = f"Increase drag coefficient by {abs_delta:.3f} (add downforce) for this high-downforce track"
            elif param_name == 'cl_front':
                if delta < 0:
                    recommendation = f"Increase front downforce by {abs_delta:.2f}. Adjust front wing to {optimal:.1f} or bring upgraded front wing package. Worth {impact:.3f}s!"
                else:
                    recommendation = f"Reduce front downforce by {abs_delta:.2f} to decrease drag for this fast track"
            elif param_name == 'cl_rear':
                if delta < 0:
                    recommendation = f"Increase rear downforce by {abs_delta:.2f}. Adjust rear wing to {optimal:.0f}° or upgrade floor/diffuser. Worth {impact:.3f}s!"
                else:
                    recommendation = f"Reduce rear downforce by {abs_delta:.2f} to improve straight-line speed"
            elif 'wing_angle' in param_name:
                if delta > 0:
                    recommendation = f"Reduce {display_name} from {current:.1f}° to {optimal:.1f}° (decrease {abs_delta:.1f}°) for less drag"
                else:
                    recommendation = f"Increase {display_name} from {current:.1f}° to {optimal:.1f}° (add {abs_delta:.1f}°) for more downforce"
            elif 'ride_height' in param_name:
                if delta > 0:
                    recommendation = f"Lower {display_name} from {current:.1f}mm to {optimal:.1f}mm for better ground effect"
                else:
                    recommendation = f"Raise {display_name} from {current:.1f}mm to {optimal:.1f}mm to reduce porpoising risk or drag"
        
        return ConfigComparison(
            parameter=display_name,
            current_value=current,
            optimal_value=optimal,
            delta=delta,
            status=status,
            impact_on_laptime=impact,
            recommendation=recommendation
        )
    
    def _analyze_vs_competitors(self, current_config: Dict, optimal_config: Dict, 
                                competitor_configs: List[Dict] = None) -> Dict:
        """Analyze current configuration vs competitors"""
        if not competitor_configs or len(competitor_configs) == 0:
            return {
                'comparison_available': False,
                'message': 'No competitor data available'
            }
        
        # Average competitor values
        avg_competitor_cd = np.mean([c.get('drag_coefficient', 0.70) for c in competitor_configs])
        avg_competitor_cl = np.mean([c.get('cl_front', 1.5) + c.get('cl_rear', 2.0) for c in competitor_configs])
        
        current_cd = current_config.get('drag_coefficient', 0.70)
        current_cl = current_config.get('cl_front', 1.5) + current_config.get('cl_rear', 2.0)
        
        # Calculate position
        cd_vs_field = 'Better' if current_cd < avg_competitor_cd else 'Worse' if current_cd > avg_competitor_cd else 'Equal'
        cl_vs_field = 'Better' if current_cl > avg_competitor_cl else 'Worse' if current_cl < avg_competitor_cl else 'Equal'
        
        return {
            'comparison_available': True,
            'drag_vs_competitors': cd_vs_field,
            'drag_delta': current_cd - avg_competitor_cd,
            'downforce_vs_competitors': cl_vs_field,
            'downforce_delta': current_cl - avg_competitor_cl,
            'overall_competitiveness': 'Competitive' if cd_vs_field != 'Worse' and cl_vs_field != 'Worse' else 'Behind',
            'estimated_gap_to_field': abs(current_cd - avg_competitor_cd) * 10 + abs(current_cl - avg_competitor_cl) * 5
        }
    
    def print_recommendation_report(self, recommendation: AeroRecommendation):
        """Print detailed recommendation report"""
        print(f"\n{'='*80}")
        print(f"AERODYNAMIC CONFIGURATION ANALYSIS: {recommendation.track_name}")
        print(f"{'='*80}\n")
        
        print("📊 CURRENT vs OPTIMAL COMPARISON:")
        print(f"{'Parameter':<25} {'Current':<12} {'Optimal':<12} {'Delta':<12} {'Status':<15} {'Impact (s)'}")
        print("-" * 95)
        
        for comp in recommendation.comparisons:
            status_emoji = '✅' if comp.status == 'Optimal' else '⚠️' if comp.status == 'Close' else '❌' if comp.status == 'Critical' else '🔸'
            print(f"{comp.parameter:<25} {comp.current_value:<12.3f} {comp.optimal_value:<12.3f} {comp.delta:>+11.3f} {status_emoji} {comp.status:<13} {comp.impact_on_laptime:+.3f}")
        
        print(f"\n⏱️  TOTAL TIME LOSS: {recommendation.overall_gap:.3f} seconds per lap\n")
        
        if recommendation.priority_upgrades:
            print("🚨 PRIORITY FIXES (CRITICAL):")
            for i, upgrade in enumerate(recommendation.priority_upgrades, 1):
                print(f"   {i}. {upgrade}")
            print()
        
        if recommendation.quick_wins:
            print("⚡ QUICK WINS (Setup Changes - FREE):")
            for i, win in enumerate(recommendation.quick_wins, 1):
                print(f"   {i}. {win}")
            print()
        
        if recommendation.major_upgrades:
            print("🔧 MAJOR UPGRADES NEEDED (Component Development):")
            for i, upgrade in enumerate(recommendation.major_upgrades, 1):
                print(f"   {i}. {upgrade}")
            print()
        
        if recommendation.competitive_analysis.get('comparison_available'):
            ca = recommendation.competitive_analysis
            print("🏁 COMPETITIVE POSITION:")
            print(f"   Drag vs Field: {ca['drag_vs_competitors']} ({ca['drag_delta']:+.3f})")
            print(f"   Downforce vs Field: {ca['downforce_vs_competitors']} ({ca['downforce_delta']:+.3f})")
            print(f"   Overall: {ca['overall_competitiveness']}")
            print()
        
        print(f"💡 ESTIMATED IMPROVEMENT IF ALL CHANGES APPLIED: {recommendation.estimated_improvement:.3f} seconds")
        print(f"{'='*80}\n")