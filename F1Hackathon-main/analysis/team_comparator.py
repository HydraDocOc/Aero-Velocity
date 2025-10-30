"""
Team Comparator Module
Compares two F1 teams' cars on a specific track, identifies performance differences,
and predicts which team will be more efficient in upcoming races.
"""

import numpy as np
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, field
import logging

from config.settings import TEAMS, AERODYNAMIC_EFFICIENCY_WEIGHT
from config.track_configs import TRACK_CONFIGS
from physics.aerodynamics import AerodynamicCalculator
from physics.lap_time_simulator import LapTimeSimulator
from physics.circuit_analyzer import CircuitAnalyzer
from data.fastf1_data_loader import FastF1DataLoader
from ml_models.performance_estimator import PerformanceEstimator

logger = logging.getLogger(__name__)


@dataclass
class ComponentComparison:
    """Comparison data for a specific aerodynamic component."""
    component_name: str
    team1_efficiency: float
    team2_efficiency: float
    difference_percent: float
    advantage: str  # 'team1', 'team2', or 'neutral'
    impact_on_laptime: float  # seconds per lap
    technical_analysis: str


@dataclass
class TrackPerformanceComparison:
    """Comprehensive comparison of two teams on a specific track."""
    track_name: str
    team1_name: str
    team2_name: str
    
    # Lap time comparison
    team1_predicted_laptime: float
    team2_predicted_laptime: float
    laptime_difference: float  # positive means team1 is faster
    
    # Aerodynamic efficiency
    team1_aero_efficiency: float
    team2_aero_efficiency: float
    aero_efficiency_gap: float
    
    # Component-level comparison
    component_comparisons: List[ComponentComparison] = field(default_factory=list)
    
    # Performance metrics
    team1_top_speed: float = 0.0
    team2_top_speed: float = 0.0
    team1_corner_speed: float = 0.0
    team2_corner_speed: float = 0.0
    team1_downforce: float = 0.0
    team2_downforce: float = 0.0
    team1_drag: float = 0.0
    team2_drag: float = 0.0
    
    # Strengths and weaknesses
    team1_strengths: List[str] = field(default_factory=list)
    team1_weaknesses: List[str] = field(default_factory=list)
    team2_strengths: List[str] = field(default_factory=list)
    team2_weaknesses: List[str] = field(default_factory=list)
    
    # Track suitability
    track_characteristics: Dict[str, float] = field(default_factory=dict)
    team1_track_suitability: float = 0.0  # 0-100 score
    team2_track_suitability: float = 0.0
    
    # Overall verdict
    predicted_winner: str = ""
    confidence: float = 0.0
    winning_margin_seconds: float = 0.0
    key_differentiators: List[str] = field(default_factory=list)


@dataclass
class SeasonForecast:
    """Forecast for remaining races in the season."""
    team1_name: str
    team2_name: str
    upcoming_races: List[str]
    race_predictions: List[Dict[str, any]] = field(default_factory=list)
    team1_expected_wins: int = 0
    team2_expected_wins: int = 0
    team1_efficiency_score: float = 0.0
    team2_efficiency_score: float = 0.0
    overall_prediction: str = ""
    reasoning: List[str] = field(default_factory=list)


class TeamComparator:
    """
    Compares two F1 teams' aerodynamic performance on specific tracks
    and predicts future race efficiency.
    """
    
    def __init__(self):
        self.aero_calc = AerodynamicCalculator()
        self.lap_sim = LapTimeSimulator()
        self.circuit_analyzer = CircuitAnalyzer()
        self.data_loader = FastF1DataLoader()
        self.perf_estimator = PerformanceEstimator()
        
    def compare_teams_on_track(
        self,
        team1: str,
        team2: str,
        track_name: str,
        year: int = 2025
    ) -> TrackPerformanceComparison:
        """
        Perform comprehensive comparison of two teams on a specific track.
        
        Args:
            team1: First team name
            team2: Second team name
            track_name: Name of the track
            year: Season year
            
        Returns:
            TrackPerformanceComparison object with detailed analysis
        """
        logger.info(f"Comparing {team1} vs {team2} on {track_name}")
        
        # Validate inputs
        if team1 not in TEAMS or team2 not in TEAMS:
            raise ValueError(f"Invalid team names. Available: {list(TEAMS.keys())}")
        if track_name not in TRACK_CONFIGS:
            raise ValueError(f"Invalid track. Available: {list(TRACK_CONFIGS.keys())}")
        
        track_config = TRACK_CONFIGS[track_name]
        
        # Load real telemetry data for both teams
        team1_data = self._load_team_data(team1, track_name, year)
        team2_data = self._load_team_data(team2, track_name, year)
        
        # Get aerodynamic configurations
        team1_aero = TEAMS[team1]["aero_config"]
        team2_aero = TEAMS[team2]["aero_config"]
        
        # Calculate lap times
        team1_laptime = self._calculate_laptime(team1_aero, track_config)
        team2_laptime = self._calculate_laptime(team2_aero, track_config)
        
        # Performance metrics
        team1_perf = self.perf_estimator.evaluate_performance(team1_aero, track_config)
        team2_perf = self.perf_estimator.evaluate_performance(team2_aero, track_config)
        
        # Component-level analysis
        component_comparisons = self._compare_components(
            team1, team2, team1_aero, team2_aero, track_config
        )
        
        # Identify strengths and weaknesses
        team1_strengths, team1_weaknesses = self._analyze_team_profile(
            team1_perf, team1_aero, track_config
        )
        team2_strengths, team2_weaknesses = self._analyze_team_profile(
            team2_perf, team2_aero, track_config
        )
        
        # Track suitability analysis
        track_chars = self._analyze_track_characteristics(track_config)
        team1_suitability = self._calculate_track_suitability(
            team1_aero, team1_perf, track_chars
        )
        team2_suitability = self._calculate_track_suitability(
            team2_aero, team2_perf, track_chars
        )
        
        # Determine winner and key differentiators
        laptime_diff = team2_laptime - team1_laptime  # Positive if team1 faster
        predicted_winner = team1 if laptime_diff > 0 else team2
        confidence = min(abs(laptime_diff) / 0.5 * 100, 100)  # Max confidence at 0.5s gap
        
        key_differentiators = self._identify_key_differentiators(
            component_comparisons, team1_perf, team2_perf, track_chars
        )
        
        # Calculate aerodynamic efficiency
        team1_efficiency = team1_perf["aero_efficiency"]
        team2_efficiency = team2_perf["aero_efficiency"]
        
        comparison = TrackPerformanceComparison(
            track_name=track_name,
            team1_name=team1,
            team2_name=team2,
            team1_predicted_laptime=team1_laptime,
            team2_predicted_laptime=team2_laptime,
            laptime_difference=laptime_diff,
            team1_aero_efficiency=team1_efficiency,
            team2_aero_efficiency=team2_efficiency,
            aero_efficiency_gap=team1_efficiency - team2_efficiency,
            component_comparisons=component_comparisons,
            team1_top_speed=team1_perf["top_speed_kmh"],
            team2_top_speed=team2_perf["top_speed_kmh"],
            team1_corner_speed=team1_perf["corner_speed_avg_kmh"],
            team2_corner_speed=team2_perf["corner_speed_avg_kmh"],
            team1_downforce=team1_perf["total_downforce_n"],
            team2_downforce=team2_perf["total_downforce_n"],
            team1_drag=team1_perf["total_drag_n"],
            team2_drag=team2_perf["total_drag_n"],
            team1_strengths=team1_strengths,
            team1_weaknesses=team1_weaknesses,
            team2_strengths=team2_strengths,
            team2_weaknesses=team2_weaknesses,
            track_characteristics=track_chars,
            team1_track_suitability=team1_suitability,
            team2_track_suitability=team2_suitability,
            predicted_winner=predicted_winner,
            confidence=confidence,
            winning_margin_seconds=abs(laptime_diff),
            key_differentiators=key_differentiators
        )
        
        return comparison
    
    def forecast_season_efficiency(
        self,
        team1: str,
        team2: str,
        upcoming_tracks: List[str],
        year: int = 2025
    ) -> SeasonForecast:
        """
        Forecast which team will be more efficient across upcoming races.
        
        Args:
            team1: First team name
            team2: Second team name
            upcoming_tracks: List of upcoming track names
            year: Season year
            
        Returns:
            SeasonForecast with predictions for each race
        """
        logger.info(f"Forecasting season efficiency: {team1} vs {team2}")
        
        race_predictions = []
        team1_wins = 0
        team2_wins = 0
        team1_total_efficiency = 0.0
        team2_total_efficiency = 0.0
        
        for track_name in upcoming_tracks:
            try:
                comparison = self.compare_teams_on_track(team1, team2, track_name, year)
                
                prediction = {
                    "track": track_name,
                    "predicted_winner": comparison.predicted_winner,
                    "confidence": comparison.confidence,
                    "laptime_gap": comparison.winning_margin_seconds,
                    "team1_suitability": comparison.team1_track_suitability,
                    "team2_suitability": comparison.team2_track_suitability,
                    "key_factors": comparison.key_differentiators[:3]
                }
                
                race_predictions.append(prediction)
                
                if comparison.predicted_winner == team1:
                    team1_wins += 1
                else:
                    team2_wins += 1
                
                team1_total_efficiency += comparison.team1_aero_efficiency
                team2_total_efficiency += comparison.team2_aero_efficiency
                
            except Exception as e:
                logger.warning(f"Could not analyze {track_name}: {e}")
                continue
        
        # Calculate average efficiency scores
        num_races = len(race_predictions)
        team1_avg_efficiency = team1_total_efficiency / num_races if num_races > 0 else 0
        team2_avg_efficiency = team2_total_efficiency / num_races if num_races > 0 else 0
        
        # Determine overall prediction
        if team1_wins > team2_wins:
            overall_prediction = f"{team1} is predicted to be more efficient"
            win_percentage = (team1_wins / num_races * 100) if num_races > 0 else 0
        elif team2_wins > team1_wins:
            overall_prediction = f"{team2} is predicted to be more efficient"
            win_percentage = (team2_wins / num_races * 100) if num_races > 0 else 0
        else:
            overall_prediction = "Both teams are evenly matched"
            win_percentage = 50.0
        
        # Generate reasoning
        reasoning = self._generate_season_reasoning(
            team1, team2, race_predictions, 
            team1_avg_efficiency, team2_avg_efficiency
        )
        
        forecast = SeasonForecast(
            team1_name=team1,
            team2_name=team2,
            upcoming_races=upcoming_tracks,
            race_predictions=race_predictions,
            team1_expected_wins=team1_wins,
            team2_expected_wins=team2_wins,
            team1_efficiency_score=team1_avg_efficiency,
            team2_efficiency_score=team2_avg_efficiency,
            overall_prediction=overall_prediction,
            reasoning=reasoning
        )
        
        return forecast
    
    def _load_team_data(self, team: str, track: str, year: int) -> Dict:
        """Load real telemetry data for a team at a specific track."""
        try:
            return self.data_loader.get_team_session_data(year, track, team)
        except Exception as e:
            logger.warning(f"Could not load data for {team} at {track}: {e}")
            return {}
    
    def _calculate_laptime(self, aero_config: Dict, track_config: Dict) -> float:
        """Calculate predicted lap time for a configuration."""
        result = self.circuit_analyzer.analyze_circuit(
            aero_config, track_config, weather_conditions={}
        )
        return result["predicted_quali_time"]
    
    def _compare_components(
        self,
        team1: str,
        team2: str,
        aero1: Dict,
        aero2: Dict,
        track_config: Dict
    ) -> List[ComponentComparison]:
        """Compare individual aerodynamic components."""
        components = [
            "front_wing",
            "rear_wing",
            "floor",
            "diffuser",
            "sidepods",
            "beam_wing"
        ]
        
        comparisons = []
        
        for component in components:
            # Calculate component efficiency
            eff1 = self._calculate_component_efficiency(component, aero1, track_config)
            eff2 = self._calculate_component_efficiency(component, aero2, track_config)
            
            diff_percent = ((eff1 - eff2) / eff2 * 100) if eff2 > 0 else 0
            
            if abs(diff_percent) < 2:
                advantage = "neutral"
            elif diff_percent > 0:
                advantage = "team1"
            else:
                advantage = "team2"
            
            # Estimate lap time impact
            laptime_impact = self._estimate_component_laptime_impact(
                component, abs(diff_percent), track_config
            )
            
            # Technical analysis
            analysis = self._generate_component_analysis(
                component, eff1, eff2, track_config, team1, team2
            )
            
            comparison = ComponentComparison(
                component_name=component.replace("_", " ").title(),
                team1_efficiency=eff1,
                team2_efficiency=eff2,
                difference_percent=diff_percent,
                advantage=advantage,
                impact_on_laptime=laptime_impact,
                technical_analysis=analysis
            )
            
            comparisons.append(comparison)
        
        return comparisons
    
    def _calculate_component_efficiency(
        self, component: str, aero_config: Dict, track_config: Dict
    ) -> float:
        """Calculate efficiency score for a specific component (0-100)."""
        # Component-specific weights based on track characteristics
        downforce_need = track_config.get("required_downforce_level", "medium")
        
        weights = {
            "high": {"downforce": 0.7, "drag": 0.3},
            "medium": {"downforce": 0.5, "drag": 0.5},
            "low": {"downforce": 0.3, "drag": 0.7}
        }
        
        weight = weights.get(downforce_need, weights["medium"])
        
        # Get component parameters
        if component == "front_wing":
            angle = aero_config.get("front_wing_angle", 15)
            efficiency = (angle / 20) * 50 + 50  # Normalize to 0-100
        elif component == "rear_wing":
            angle = aero_config.get("rear_wing_angle", 20)
            efficiency = (angle / 25) * 50 + 50
        elif component == "floor":
            rake = aero_config.get("rake_angle", 1.0)
            efficiency = (rake / 2.0) * 50 + 50
        elif component == "diffuser":
            angle = aero_config.get("diffuser_angle", 12)
            efficiency = (angle / 15) * 50 + 50
        elif component == "sidepods":
            undercut = aero_config.get("sidepod_undercut", 0.8)
            efficiency = undercut * 100
        else:  # beam_wing
            efficiency = 75.0  # Default
        
        # Adjust for drag coefficient
        drag = aero_config.get("drag_coefficient", 0.7)
        drag_penalty = (drag - 0.6) * 20  # Penalty for high drag
        
        # Weighted efficiency
        final_efficiency = (
            efficiency * weight["downforce"] - 
            drag_penalty * weight["drag"]
        )
        
        return max(0, min(100, final_efficiency))
    
    def _estimate_component_laptime_impact(
        self, component: str, efficiency_diff_percent: float, track_config: Dict
    ) -> float:
        """Estimate lap time impact of component efficiency difference."""
        # Base impact per percent (seconds)
        base_impacts = {
            "front_wing": 0.008,
            "rear_wing": 0.010,
            "floor": 0.015,
            "diffuser": 0.012,
            "sidepods": 0.006,
            "beam_wing": 0.004
        }
        
        base_impact = base_impacts.get(component, 0.005)
        
        # Scale by track length
        track_length = track_config.get("length_km", 5.0)
        length_factor = track_length / 5.0
        
        return base_impact * efficiency_diff_percent * length_factor
    
    def _generate_component_analysis(
        self, component: str, eff1: float, eff2: float, 
        track_config: Dict, team1: str, team2: str
    ) -> str:
        """Generate technical analysis for component comparison."""
        diff = eff1 - eff2
        better_team = team1 if diff > 0 else team2
        worse_team = team2 if diff > 0 else team1
        
        if abs(diff) < 2:
            return f"Both teams have similar {component} efficiency on this track."
        
        downforce_need = track_config.get("required_downforce_level", "medium")
        
        analyses = {
            "front_wing": f"{better_team}'s front wing generates superior front-end downforce, "
                         f"providing better turn-in stability. Critical for {downforce_need}-downforce tracks.",
            "rear_wing": f"{better_team}'s rear wing configuration offers better balance between "
                        f"downforce and drag, optimizing straight-line speed and cornering.",
            "floor": f"{better_team}'s floor design creates more efficient ground effect, "
                    f"crucial for consistent downforce through corners.",
            "diffuser": f"{better_team}'s diffuser extracts air more efficiently, "
                       f"reducing turbulence and increasing rear downforce.",
            "sidepods": f"{better_team}'s sidepod design channels airflow more effectively, "
                       f"improving overall aerodynamic efficiency.",
            "beam_wing": f"{better_team}'s beam wing works better with their rear wing configuration."
        }
        
        return analyses.get(component, f"{better_team} has advantage in {component}.")
    
    def _analyze_team_profile(
        self, performance: Dict, aero_config: Dict, track_config: Dict
    ) -> Tuple[List[str], List[str]]:
        """Identify team's aerodynamic strengths and weaknesses."""
        strengths = []
        weaknesses = []
        
        # Top speed analysis
        if performance["top_speed_kmh"] > 330:
            strengths.append("Excellent straight-line speed with low-drag configuration")
        elif performance["top_speed_kmh"] < 310:
            weaknesses.append("Limited top speed due to high-drag setup")
        
        # Cornering analysis
        if performance["corner_speed_avg_kmh"] > 180:
            strengths.append("Strong cornering performance with high downforce")
        elif performance["corner_speed_avg_kmh"] < 160:
            weaknesses.append("Weak cornering speed indicating insufficient downforce")
        
        # L/D ratio
        ld_ratio = performance.get("lift_to_drag_ratio", 3.0)
        if ld_ratio > 3.5:
            strengths.append("Excellent aerodynamic efficiency (high L/D ratio)")
        elif ld_ratio < 2.5:
            weaknesses.append("Poor aerodynamic efficiency (low L/D ratio)")
        
        # DRS effectiveness
        drs_gain = performance.get("drs_effectiveness", 8.0)
        if drs_gain > 10:
            strengths.append("Highly effective DRS system for overtaking")
        elif drs_gain < 6:
            weaknesses.append("Limited DRS effectiveness")
        
        # Balance
        front_downforce = aero_config.get("front_wing_angle", 15) * 100
        rear_downforce = aero_config.get("rear_wing_angle", 20) * 100
        balance = front_downforce / (front_downforce + rear_downforce)
        
        if 0.42 < balance < 0.48:
            strengths.append("Well-balanced aero distribution front-to-rear")
        elif balance < 0.40:
            weaknesses.append("Rear-biased setup may cause understeer")
        else:
            weaknesses.append("Front-biased setup may cause oversteer")
        
        return strengths, weaknesses
    
    def _analyze_track_characteristics(self, track_config: Dict) -> Dict[str, float]:
        """Analyze track characteristics for suitability matching."""
        return {
            "straight_line_ratio": self._calculate_straight_ratio(track_config),
            "corner_complexity": len(track_config.get("corners", [])) / track_config.get("length_km", 5.0),
            "high_speed_corners": sum(1 for c in track_config.get("corners", []) 
                                     if c.get("speed_kmh", 0) > 200) / max(len(track_config.get("corners", [])), 1),
            "downforce_importance": {"high": 0.9, "medium": 0.6, "low": 0.3}.get(
                track_config.get("required_downforce_level", "medium"), 0.6
            ),
            "drs_zones": len(track_config.get("drs_zones", [])),
            "elevation_change": track_config.get("elevation_change_m", 0) / 100
        }
    
    def _calculate_straight_ratio(self, track_config: Dict) -> float:
        """Calculate percentage of track that is straight-line."""
        straights = track_config.get("straights", [])
        total_straight_length = sum(s.get("length_m", 0) for s in straights)
        track_length_m = track_config.get("length_km", 5.0) * 1000
        return total_straight_length / track_length_m if track_length_m > 0 else 0.3
    
    def _calculate_track_suitability(
        self, aero_config: Dict, performance: Dict, track_chars: Dict
    ) -> float:
        """Calculate how suitable a car is for a specific track (0-100)."""
        score = 50.0  # Base score
        
        # Straight-line performance matching
        straight_ratio = track_chars["straight_line_ratio"]
        top_speed = performance["top_speed_kmh"]
        if straight_ratio > 0.4:  # High-speed track
            score += (top_speed - 320) * 0.5
        else:  # Twisty track
            score += (340 - top_speed) * 0.3
        
        # Downforce matching
        downforce_importance = track_chars["downforce_importance"]
        corner_speed = performance["corner_speed_avg_kmh"]
        score += (corner_speed - 170) * downforce_importance * 0.4
        
        # Efficiency
        ld_ratio = performance.get("lift_to_drag_ratio", 3.0)
        score += (ld_ratio - 3.0) * 8
        
        # DRS zones
        if track_chars["drs_zones"] > 2:
            drs_gain = performance.get("drs_effectiveness", 8.0)
            score += (drs_gain - 8.0) * 2
        
        return max(0, min(100, score))
    
    def _identify_key_differentiators(
        self, 
        component_comps: List[ComponentComparison],
        perf1: Dict,
        perf2: Dict,
        track_chars: Dict
    ) -> List[str]:
        """Identify the key factors that differentiate the two teams."""
        differentiators = []
        
        # Find components with biggest differences
        sorted_comps = sorted(
            component_comps, 
            key=lambda x: abs(x.difference_percent), 
            reverse=True
        )
        
        for comp in sorted_comps[:2]:  # Top 2 components
            if abs(comp.difference_percent) > 5:
                advantage_team = "team1" if comp.advantage == "team1" else "team2"
                differentiators.append(
                    f"{comp.component_name}: {abs(comp.difference_percent):.1f}% advantage "
                    f"(~{comp.impact_on_laptime:.3f}s/lap)"
                )
        
        # Top speed difference
        speed_diff = abs(perf1["top_speed_kmh"] - perf2["top_speed_kmh"])
        if speed_diff > 5:
            differentiators.append(f"Top speed difference: {speed_diff:.1f} km/h")
        
        # Corner speed difference
        corner_diff = abs(perf1["corner_speed_avg_kmh"] - perf2["corner_speed_avg_kmh"])
        if corner_diff > 3:
            differentiators.append(f"Cornering speed difference: {corner_diff:.1f} km/h")
        
        # Track-specific factors
        if track_chars["straight_line_ratio"] > 0.4:
            differentiators.append("Straight-line speed crucial on this power circuit")
        elif track_chars["downforce_importance"] > 0.7:
            differentiators.append("High downforce essential for this technical circuit")
        
        return differentiators[:5]  # Top 5 differentiators
    
    def _generate_season_reasoning(
        self,
        team1: str,
        team2: str,
        race_predictions: List[Dict],
        eff1: float,
        eff2: float
    ) -> List[str]:
        """Generate reasoning for season forecast."""
        reasoning = []
        
        # Win distribution
        team1_wins = sum(1 for r in race_predictions if r["predicted_winner"] == team1)
        team2_wins = sum(1 for r in race_predictions if r["predicted_winner"] == team2)
        
        reasoning.append(
            f"{team1} predicted to win {team1_wins} races, "
            f"{team2} predicted to win {team2_wins} races"
        )
        
        # Efficiency comparison
        if eff1 > eff2:
            reasoning.append(
                f"{team1} has superior aerodynamic efficiency ({eff1:.2f} vs {eff2:.2f})"
            )
        else:
            reasoning.append(
                f"{team2} has superior aerodynamic efficiency ({eff2:.2f} vs {eff1:.2f})"
            )
        
        # Track type analysis
        high_speed_tracks = sum(
            1 for r in race_predictions 
            if r.get("key_factors", [""])[0].find("speed") != -1
        )
        technical_tracks = len(race_predictions) - high_speed_tracks
        
        reasoning.append(
            f"Upcoming calendar: {high_speed_tracks} power circuits, "
            f"{technical_tracks} technical circuits"
        )
        
        # Confidence analysis
        high_confidence_races = sum(1 for r in race_predictions if r["confidence"] > 70)
        reasoning.append(
            f"High confidence predictions in {high_confidence_races}/{len(race_predictions)} races"
        )
        
        return reasoning
