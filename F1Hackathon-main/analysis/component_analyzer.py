"""Component Analyzer - Analyzes individual aerodynamic components"""
from dataclasses import dataclass
from typing import Dict, List
import numpy as np
from config.settings import AERODYNAMIC_COMPONENTS

@dataclass
class ComponentAnalysis:
    component_name: str
    efficiency_score: float
    strength_rating: str
    improvement_potential: float
    contribution_to_downforce: float
    contribution_to_drag: float
    recommendations: List[str]

class ComponentAnalyzer:
    def analyze_all_components(self, team_name: str, aero_config: Dict, track_config: Dict) -> Dict[str, ComponentAnalysis]:
        analyses = {}
        for component in AERODYNAMIC_COMPONENTS:
            analyses[component] = self._analyze_generic(component, aero_config, track_config)
        return analyses
    
    def _analyze_generic(self, component: str, aero_config: Dict, track_config: Dict) -> ComponentAnalysis:
        base_efficiency = 0.75 + np.random.uniform(-0.15, 0.15)
        rating = "Excellent" if base_efficiency > 0.9 else "Good" if base_efficiency > 0.75 else "Average"
        
        # Component-specific contributions
        contributions = {
            'front_wing': (35, 25),
            'rear_wing': (40, 35),
            'floor': (45, 15),
            'diffuser': (30, 10),
            'sidepods': (5, 20),
            'bargeboards': (8, 5),
            'beam_wing': (6, 4),
            'nose': (3, 8),
            'halo': (1, 7),
            'engine_cover': (2, 10)
        }
        
        df_contrib, drag_contrib = contributions.get(component, (5, 5))
        
        return ComponentAnalysis(
            component_name=component.replace('_', ' ').title(),
            efficiency_score=base_efficiency,
            strength_rating=rating,
            improvement_potential=1 - base_efficiency,
            contribution_to_downforce=df_contrib,
            contribution_to_drag=drag_contrib,
            recommendations=[f"Optimize {component} for track characteristics"]
        )