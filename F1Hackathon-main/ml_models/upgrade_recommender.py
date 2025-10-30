"""Intelligent Upgrade Recommender System"""
from dataclasses import dataclass
from typing import List, Dict, Tuple
import numpy as np
from datetime import datetime, timedelta

from config.settings import COMPONENT_COST, COMPONENT_WEIGHTS, AERODYNAMIC_COMPONENTS

@dataclass
class UpgradePackage:
    package_name: str
    components: List[str]
    total_cost: float  # In thousands of dollars
    expected_improvement: float  # Lap time gain in seconds
    roi: float  # Return on investment
    target_races: List[str]
    development_time: int  # Days needed
    risk_level: str  # Low, Medium, High
    performance_gain_breakdown: Dict[str, float]
    priority_score: float

class UpgradeRecommender:
    """Recommends aerodynamic upgrade packages with ROI analysis"""
    
    def __init__(self):
        # Development time estimates (days)
        self.development_times = {
            'front_wing': 45,
            'rear_wing': 40,
            'floor': 60,
            'diffuser': 50,
            'sidepods': 55,
            'bargeboards': 35,
            'beam_wing': 30,
            'nose': 40,
            'halo': 90,  # Restricted by regulations
            'engine_cover': 35
        }
        
        # Component interdependencies
        self.synergies = {
            ('front_wing', 'bargeboards'): 1.15,  # Work well together
            ('floor', 'diffuser'): 1.20,  # Strong synergy
            ('rear_wing', 'beam_wing'): 1.12,
            ('sidepods', 'floor'): 1.10,
            ('nose', 'front_wing'): 1.08
        }
    
    def analyze_current_performance(self, aero_config: Dict, upcoming_races: List[Dict], 
                                   competitor_configs: List[Dict]) -> Dict:
        """
        Comprehensive performance gap analysis
        
        Args:
            aero_config: Current configuration
            upcoming_races: List of upcoming race configs
            competitor_configs: Competitor configurations
            
        Returns:
            Detailed performance analysis
        """
        cd = aero_config.get('drag_coefficient', 0.70)
        cl_front = aero_config.get('cl_front', 1.5)
        cl_rear = aero_config.get('cl_rear', 2.0)
        cl_total = cl_front + cl_rear
        
        # Competitor analysis
        if competitor_configs and len(competitor_configs) > 0:
            avg_competitor_cd = np.mean([c.get('drag_coefficient', 0.70) for c in competitor_configs])
            avg_competitor_cl_front = np.mean([c.get('cl_front', 1.5) for c in competitor_configs])
            avg_competitor_cl_rear = np.mean([c.get('cl_rear', 2.0) for c in competitor_configs])
            avg_competitor_cl = avg_competitor_cl_front + avg_competitor_cl_rear
            
            # Calculate deficits
            cd_deficit = cd - avg_competitor_cd
            cl_front_deficit = avg_competitor_cl_front - cl_front
            cl_rear_deficit = avg_competitor_cl_rear - cl_rear
            downforce_deficit = avg_competitor_cl - cl_total
            
            # Estimate time loss
            drag_time_loss = cd_deficit * 15  # 0.01 Cd ≈ 0.15s per lap
            downforce_time_loss = downforce_deficit * 8  # 0.1 downforce ≈ 0.08s
            
            total_gap = drag_time_loss + downforce_time_loss
        else:
            cd_deficit = 0
            cl_front_deficit = 0
            cl_rear_deficit = 0
            downforce_deficit = 0
            total_gap = 0
            avg_competitor_cd = 0.70
            avg_competitor_cl = 3.5
        
        # L/D ratio analysis
        current_ld = cl_total / cd if cd > 0 else 0
        optimal_ld = 4.2
        ld_efficiency = current_ld / optimal_ld
        
        # Balance analysis
        current_balance = (cl_front / cl_total * 100) if cl_total > 0 else 50
        optimal_balance = 40  # 40% front, 60% rear
        balance_deviation = abs(current_balance - optimal_balance)
        
        # Identify weak areas
        weak_areas = []
        if cd_deficit > 0.02:
            weak_areas.append('drag')
        if cl_front_deficit > 0.15:
            weak_areas.append('front_downforce')
        if cl_rear_deficit > 0.20:
            weak_areas.append('rear_downforce')
        if ld_efficiency < 0.90:
            weak_areas.append('aero_efficiency')
        if balance_deviation > 5:
            weak_areas.append('balance')
        
        return {
            'cd_deficit': cd_deficit,
            'cl_front_deficit': cl_front_deficit,
            'cl_rear_deficit': cl_rear_deficit,
            'downforce_deficit': downforce_deficit,
            'total_time_gap': total_gap,
            'ld_ratio': current_ld,
            'ld_efficiency': ld_efficiency,
            'balance': current_balance,
            'balance_deviation': balance_deviation,
            'weak_areas': weak_areas,
            'competitiveness': 'Competitive' if total_gap < 0.2 else 'Behind' if total_gap < 0.5 else 'Struggling',
            'avg_competitor_cd': avg_competitor_cd,
            'avg_competitor_downforce': avg_competitor_cl
        }
    
    def recommend_upgrades(self, aero_config: Dict, performance_analysis: Dict, 
                          budget: float, upcoming_races: List[Dict]) -> List[UpgradePackage]:
        """
        Generate intelligent upgrade package recommendations
        
        Args:
            aero_config: Current aero configuration
            performance_analysis: Performance gap analysis
            budget: Available budget in thousands of dollars
            upcoming_races: Upcoming race schedule
            
        Returns:
            List of recommended upgrade packages sorted by priority
        """
        packages = []
        weak_areas = performance_analysis.get('weak_areas', [])
        
        # Package 1: Quick Win - Setup Optimization (Free)
        if 'balance' in weak_areas:
            packages.append(UpgradePackage(
                package_name="Setup Optimization (Free)",
                components=['front_wing', 'rear_wing'],  # Adjust angles only
                total_cost=0,
                expected_improvement=0.08,
                roi=float('inf'),
                target_races=[r.get('name', 'Next') for r in upcoming_races[:2]] if upcoming_races else ['Next 2 Races'],
                development_time=0,
                risk_level='Low',
                performance_gain_breakdown={'balance': 0.08},
                priority_score=100
            ))
        
        # Package 2: Front Wing Optimization
        if 'front_downforce' in weak_areas or 'aero_efficiency' in weak_areas:
            cost = COMPONENT_COST['front_wing']
            improvement = 0.12 + (performance_analysis.get('cl_front_deficit', 0) * 4)
            packages.append(UpgradePackage(
                package_name="Front Wing Upgrade Package",
                components=['front_wing'],
                total_cost=cost,
                expected_improvement=improvement,
                roi=improvement / (cost / 1000),
                target_races=[r.get('name', 'Race') for r in upcoming_races[1:4]] if len(upcoming_races) > 1 else ['Races 2-4'],
                development_time=self.development_times['front_wing'],
                risk_level='Low',
                performance_gain_breakdown={'front_downforce': improvement},
                priority_score=85
            ))
        
        # Package 3: Floor & Diffuser Major Upgrade (High ROI due to synergy)
        if 'rear_downforce' in weak_areas or 'aero_efficiency' in weak_areas:
            components = ['floor', 'diffuser']
            base_cost = sum([COMPONENT_COST[c] for c in components])
            base_improvement = 0.25
            
            # Apply synergy bonus
            synergy_multiplier = self.synergies.get(('floor', 'diffuser'), 1.0)
            improvement = base_improvement * synergy_multiplier
            
            packages.append(UpgradePackage(
                package_name="Floor & Diffuser Major Upgrade",
                components=components,
                total_cost=base_cost,
                expected_improvement=improvement,
                roi=improvement / (base_cost / 1000),
                target_races=[r.get('name', 'Race') for r in upcoming_races[2:7]] if len(upcoming_races) > 2 else ['Mid-Season'],
                development_time=max([self.development_times[c] for c in components]),
                risk_level='Medium',
                performance_gain_breakdown={
                    'floor': 0.15,
                    'diffuser': 0.10,
                    'synergy_bonus': improvement - base_improvement
                },
                priority_score=90
            ))
        
        # Package 4: Complete Rear End Package
        if 'rear_downforce' in weak_areas:
            components = ['rear_wing', 'beam_wing', 'diffuser']
            base_cost = sum([COMPONENT_COST[c] for c in components])
            improvement = 0.35
            
            packages.append(UpgradePackage(
                package_name="Complete Rear End Package",
                components=components,
                total_cost=base_cost,
                expected_improvement=improvement,
                roi=improvement / (base_cost / 1000),
                target_races=[r.get('name', 'Race') for r in upcoming_races[3:8]] if len(upcoming_races) > 3 else ['Later Season'],
                development_time=max([self.development_times[c] for c in components]) + 10,  # Integration time
                risk_level='High',
                performance_gain_breakdown={
                    'rear_wing': 0.15,
                    'beam_wing': 0.05,
                    'diffuser': 0.15
                },
                priority_score=75
            ))
        
        # Package 5: Drag Reduction Package
        if 'drag' in weak_areas:
            components = ['sidepods', 'engine_cover', 'nose']
            base_cost = sum([COMPONENT_COST[c] for c in components])
            drag_reduction = performance_analysis.get('cd_deficit', 0.02)
            improvement = drag_reduction * 15  # Lap time gain from drag reduction
            
            packages.append(UpgradePackage(
                package_name="Drag Reduction Package",
                components=components,
                total_cost=base_cost,
                expected_improvement=improvement,
                roi=improvement / (base_cost / 1000),
                target_races=['High-Speed Tracks'],
                development_time=max([self.development_times[c] for c in components]),
                risk_level='Medium',
                performance_gain_breakdown={'drag_reduction': improvement},
                priority_score=80
            ))
        
        # Package 6: Front Wing + Bargeboards (Synergy Package)
        components = ['front_wing', 'bargeboards']
        base_cost = sum([COMPONENT_COST[c] for c in components])
        base_improvement = 0.18
        synergy_multiplier = self.synergies.get(('front_wing', 'bargeboards'), 1.0)
        improvement = base_improvement * synergy_multiplier
        
        packages.append(UpgradePackage(
            package_name="Front Aero Flow Management Package",
            components=components,
            total_cost=base_cost,
            expected_improvement=improvement,
            roi=improvement / (base_cost / 1000),
            target_races=[r.get('name', 'Race') for r in upcoming_races[2:6]] if len(upcoming_races) > 2 else ['Mid-Season'],
            development_time=max([self.development_times[c] for c in components]),
            risk_level='Low',
            performance_gain_breakdown={
                'front_wing': 0.10,
                'bargeboards': 0.08,
                'synergy': improvement - base_improvement
            },
            priority_score=82
        ))
        
        # Package 7: Complete Championship Push (Everything)
        if budget > 800:
            major_components = ['front_wing', 'rear_wing', 'floor', 'diffuser', 'sidepods']
            total_cost = sum([COMPONENT_COST[c] for c in major_components])
            improvement = 0.55  # Major comprehensive upgrade
            
            packages.append(UpgradePackage(
                package_name="Complete Aerodynamic Overhaul",
                components=major_components,
                total_cost=total_cost,
                expected_improvement=improvement,
                roi=improvement / (total_cost / 1000),
                target_races=['Championship Finale'] if upcoming_races else ['Late Season'],
                development_time=90,
                risk_level='High',
                performance_gain_breakdown={
                    'comprehensive_redesign': improvement
                },
                priority_score=95
            ))
        
        # Filter by budget
        affordable_packages = [p for p in packages if p.total_cost <= budget]
        
        # Sort by priority score (combines ROI, improvement, and risk)
        affordable_packages.sort(key=lambda x: x.priority_score, reverse=True)
        
        return affordable_packages
    
    def create_development_timeline(self, selected_packages: List[UpgradePackage]) -> Dict:
        """
        Create a development timeline for selected packages
        
        Args:
            selected_packages: List of packages to develop
            
        Returns:
            Timeline with milestones
        """
        timeline = []
        current_date = datetime.now()
        
        for package in selected_packages:
            start_date = current_date
            end_date = current_date + timedelta(days=package.development_time)
            
            timeline.append({
                'package_name': package.package_name,
                'start_date': start_date.strftime('%Y-%m-%d'),
                'end_date': end_date.strftime('%Y-%m-%d'),
                'duration_days': package.development_time,
                'components': package.components,
                'target_races': package.target_races
            })
            
            # Next package starts after this one
            current_date = end_date
        
        return {
            'total_duration_days': (current_date - datetime.now()).days,
            'completion_date': current_date.strftime('%Y-%m-%d'),
            'milestones': timeline
        }