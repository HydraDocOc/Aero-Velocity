"""
Comprehensive Visualization System
Creates all types of plots for F1 aerodynamic analysis
"""
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from typing import Dict, List, Optional
from pathlib import Path
import pandas as pd

from config.settings import OUTPUT_DIR, VIZ_DPI, VIZ_FIGSIZE, VIZ_COLOR_PALETTE

# Set style
sns.set_style("darkgrid")
plt.rcParams['figure.figsize'] = VIZ_FIGSIZE
plt.rcParams['figure.dpi'] = VIZ_DPI


class F1AeroVisualizer:
    """Creates visualizations for F1 aerodynamic analysis"""
    
    def __init__(self, output_dir: Path = OUTPUT_DIR):
        self.output_dir = output_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def plot_component_efficiency(self, component_analyses: Dict, team_name: str, track_name: str) -> str:
        """Bar chart of component efficiency scores"""
        fig, ax = plt.subplots(figsize=(14, 8))
        
        components = list(component_analyses.keys())
        efficiencies = [comp.efficiency_score for comp in component_analyses.values()]
        colors = ['#2ecc71' if e > 0.8 else '#f39c12' if e > 0.6 else '#e74c3c' for e in efficiencies]
        
        bars = ax.barh(components, efficiencies, color=colors, edgecolor='black', linewidth=1.5)
        
        # Add value labels
        for i, (bar, eff) in enumerate(zip(bars, efficiencies)):
            ax.text(eff + 0.02, bar.get_y() + bar.get_height()/2, 
                   f'{eff:.2f}', va='center', fontweight='bold', fontsize=10)
        
        ax.set_xlabel('Efficiency Score', fontsize=12, fontweight='bold')
        ax.set_title(f'{team_name} - Component Efficiency at {track_name}', 
                    fontsize=14, fontweight='bold', pad=20)
        ax.set_xlim(0, 1.1)
        ax.axvline(x=0.8, color='green', linestyle='--', alpha=0.5, label='Excellent (>0.8)')
        ax.axvline(x=0.6, color='orange', linestyle='--', alpha=0.5, label='Good (>0.6)')
        ax.legend()
        
        plt.tight_layout()
        filename = self.output_dir / f'{team_name}_{track_name}_component_efficiency.png'
        plt.savefig(filename, bbox_inches='tight')
        plt.close()
        
        return str(filename)
    
    def plot_aero_comparison(self, recommendation, team_name: str) -> str:
        """Comparison plot of current vs optimal configuration"""
        fig, axes = plt.subplots(2, 2, figsize=(16, 12))
        fig.suptitle(f'{team_name} - Aerodynamic Configuration Analysis\n{recommendation.track_name}', 
                    fontsize=16, fontweight='bold')
        
        # Extract data
        params = [comp.parameter for comp in recommendation.comparisons]
        current = [comp.current_value for comp in recommendation.comparisons]
        optimal = [comp.optimal_value for comp in recommendation.comparisons]
        impacts = [comp.impact_on_laptime for comp in recommendation.comparisons]
        
        # Plot 1: Current vs Optimal
        ax1 = axes[0, 0]
        x = np.arange(len(params))
        width = 0.35
        
        ax1.bar(x - width/2, current, width, label='Current', color='#e74c3c', alpha=0.8)
        ax1.bar(x + width/2, optimal, width, label='Optimal', color='#2ecc71', alpha=0.8)
        ax1.set_xlabel('Parameters', fontweight='bold')
        ax1.set_ylabel('Values', fontweight='bold')
        ax1.set_title('Current vs Optimal Configuration', fontweight='bold')
        ax1.set_xticks(x)
        ax1.set_xticklabels(params, rotation=45, ha='right', fontsize=8)
        ax1.legend()
        ax1.grid(True, alpha=0.3)
        
        # Plot 2: Lap Time Impact
        ax2 = axes[0, 1]
        colors_impact = ['#e74c3c' if i > 0.1 else '#f39c12' if i > 0.05 else '#2ecc71' for i in impacts]
        bars = ax2.barh(params, impacts, color=colors_impact, edgecolor='black')
        ax2.set_xlabel('Time Loss (seconds)', fontweight='bold')
        ax2.set_title('Lap Time Impact per Parameter', fontweight='bold')
        ax2.axvline(x=0, color='black', linewidth=1)
        
        for bar, impact in zip(bars, impacts):
            if abs(impact) > 0.01:
                ax2.text(impact + 0.01, bar.get_y() + bar.get_height()/2,
                        f'{impact:+.3f}s', va='center', fontsize=9)
        
        # Plot 3: Status Distribution
        ax3 = axes[1, 0]
        statuses = [comp.status for comp in recommendation.comparisons]
        status_counts = pd.Series(statuses).value_counts()
        
        colors_status = {'Optimal': '#2ecc71', 'Close': '#3498db', 
                        'Needs Improvement': '#f39c12', 'Critical': '#e74c3c'}
        colors = [colors_status.get(s, '#95a5a6') for s in status_counts.index]
        
        ax3.pie(status_counts.values, labels=status_counts.index, autopct='%1.1f%%',
               colors=colors, startangle=90, textprops={'fontweight': 'bold'})
        ax3.set_title('Configuration Status Distribution', fontweight='bold')
        
        # Plot 4: Cumulative Impact
        ax4 = axes[1, 1]
        cumulative_impact = np.cumsum(sorted(impacts, reverse=True))
        ax4.plot(range(len(cumulative_impact)), cumulative_impact, 
                marker='o', linewidth=3, markersize=8, color='#e74c3c')
        ax4.fill_between(range(len(cumulative_impact)), cumulative_impact, alpha=0.3, color='#e74c3c')
        ax4.set_xlabel('Number of Parameters Fixed', fontweight='bold')
        ax4.set_ylabel('Cumulative Time Gain (s)', fontweight='bold')
        ax4.set_title('Potential Lap Time Improvement', fontweight='bold')
        ax4.grid(True, alpha=0.3)
        
        # Add total gain annotation
        ax4.text(len(cumulative_impact)-1, cumulative_impact[-1], 
                f'Total: {cumulative_impact[-1]:.3f}s',
                ha='right', va='bottom', fontweight='bold', fontsize=12,
                bbox=dict(boxstyle='round', facecolor='yellow', alpha=0.7))
        
        plt.tight_layout()
        filename = self.output_dir / f'{team_name}_{recommendation.track_name}_aero_comparison.png'
        plt.savefig(filename, bbox_inches='tight')
        plt.close()
        
        return str(filename)
    
    def plot_track_performance_heatmap(self, all_tracks_data: Dict, team_name: str) -> str:
        """Heatmap of performance across all tracks"""
        fig, ax = plt.subplots(figsize=(16, 10))
        
        tracks = list(all_tracks_data.keys())
        metrics = ['Drag Efficiency', 'Downforce', 'Corner Speed', 'Top Speed', 'Overall']
        
        # Generate data matrix
        data = []
        for track in tracks:
            track_data = all_tracks_data[track]
            perf = track_data.get('performance', {})
            
            row = [
                1 - (track_data.get('circuit_analysis', {}).get('time_gain_quali', 0) / 2),  # Drag eff
                perf.get('ld_ratio', 4.0) / 5.0,  # Downforce normalized
                perf.get('avg_corner_speed', 180) / 220,  # Corner speed normalized
                perf.get('top_speed', 320) / 360,  # Top speed normalized
                0.75  # Overall placeholder
            ]
            data.append(row)
        
        data_array = np.array(data)
        
        # Create heatmap
        im = ax.imshow(data_array, cmap='RdYlGn', aspect='auto', vmin=0, vmax=1)
        
        # Set ticks
        ax.set_xticks(np.arange(len(metrics)))
        ax.set_yticks(np.arange(len(tracks)))
        ax.set_xticklabels(metrics, fontweight='bold')
        ax.set_yticklabels(tracks, fontsize=9)
        
        # Add colorbar
        cbar = plt.colorbar(im, ax=ax)
        cbar.set_label('Performance Score', fontweight='bold')
        
        # Add values in cells
        for i in range(len(tracks)):
            for j in range(len(metrics)):
                text = ax.text(j, i, f'{data_array[i, j]:.2f}',
                             ha="center", va="center", color="black", fontweight='bold')
        
        ax.set_title(f'{team_name} - Performance Heatmap Across All Tracks', 
                    fontsize=14, fontweight='bold', pad=20)
        
        plt.tight_layout()
        filename = self.output_dir / f'{team_name}_track_performance_heatmap.png'
        plt.savefig(filename, bbox_inches='tight')
        plt.close()
        
        return str(filename)
    
    def plot_team_comparison(self, team1_data: Dict, team2_data: Dict, 
                           team1_name: str, team2_name: str, track_name: str) -> str:
        """Side-by-side comparison of two teams"""
        fig, axes = plt.subplots(2, 2, figsize=(16, 12))
        fig.suptitle(f'Team Comparison: {team1_name} vs {team2_name}\n{track_name}',
                    fontsize=16, fontweight='bold')
        
        # Plot 1: Aerodynamic coefficients
        ax1 = axes[0, 0]
        categories = ['Drag (Cd)', 'Front DF', 'Rear DF', 'L/D Ratio']
        team1_values = [
            team1_data['performance'].get('drag_coefficient', 0.70),
            team1_data['performance'].get('cl_front', 1.5),
            team1_data['performance'].get('cl_rear', 2.0),
            team1_data['performance'].get('ld_ratio', 4.0)
        ]
        team2_values = [
            team2_data['performance'].get('drag_coefficient', 0.70),
            team2_data['performance'].get('cl_front', 1.5),
            team2_data['performance'].get('cl_rear', 2.0),
            team2_data['performance'].get('ld_ratio', 4.0)
        ]
        
        x = np.arange(len(categories))
        width = 0.35
        
        ax1.bar(x - width/2, team1_values, width, label=team1_name, color='#3498db', alpha=0.8)
        ax1.bar(x + width/2, team2_values, width, label=team2_name, color='#e74c3c', alpha=0.8)
        ax1.set_ylabel('Values', fontweight='bold')
        ax1.set_title('Aerodynamic Coefficients', fontweight='bold')
        ax1.set_xticks(x)
        ax1.set_xticklabels(categories, rotation=20, ha='right')
        ax1.legend()
        ax1.grid(True, alpha=0.3, axis='y')
        
        # Plot 2: Speed comparison
        ax2 = axes[0, 1]
        speed_cats = ['Top Speed', 'Avg Corner Speed']
        team1_speeds = [
            team1_data['performance'].get('top_speed', 330),
            team1_data['performance'].get('avg_corner_speed', 180)
        ]
        team2_speeds = [
            team2_data['performance'].get('top_speed', 330),
            team2_data['performance'].get('avg_corner_speed', 180)
        ]
        
        x_speed = np.arange(len(speed_cats))
        ax2.bar(x_speed - width/2, team1_speeds, width, label=team1_name, color='#3498db', alpha=0.8)
        ax2.bar(x_speed + width/2, team2_speeds, width, label=team2_name, color='#e74c3c', alpha=0.8)
        ax2.set_ylabel('Speed (km/h)', fontweight='bold')
        ax2.set_title('Speed Comparison', fontweight='bold')
        ax2.set_xticks(x_speed)
        ax2.set_xticklabels(speed_cats)
        ax2.legend()
        ax2.grid(True, alpha=0.3, axis='y')
        
        # Plot 3: Lap time comparison
        ax3 = axes[1, 0]
        lap_types = ['Qualifying', 'Race']
        
        # Parse lap times (simplified)
        team1_quali = 85.5  # placeholder
        team1_race = 87.2
        team2_quali = 85.8
        team2_race = 87.5
        
        team1_times = [team1_quali, team1_race]
        team2_times = [team2_quali, team2_race]
        
        x_lap = np.arange(len(lap_types))
        bars1 = ax3.bar(x_lap - width/2, team1_times, width, label=team1_name, color='#3498db', alpha=0.8)
        bars2 = ax3.bar(x_lap + width/2, team2_times, width, label=team2_name, color='#e74c3c', alpha=0.8)
        
        ax3.set_ylabel('Lap Time (seconds)', fontweight='bold')
        ax3.set_title('Lap Time Comparison', fontweight='bold')
        ax3.set_xticks(x_lap)
        ax3.set_xticklabels(lap_types)
        ax3.legend()
        ax3.grid(True, alpha=0.3, axis='y')
        
        # Add delta annotations
        for i, (t1, t2) in enumerate(zip(team1_times, team2_times)):
            delta = t1 - t2
            y_pos = max(t1, t2) + 0.3
            ax3.text(i, y_pos, f'Δ {delta:+.3f}s', ha='center', fontweight='bold',
                    color='green' if delta < 0 else 'red')
        
        # Plot 4: Component strength comparison
        ax4 = axes[1, 1]
        
        # Simplified component scores
        components_comp = ['Front Wing', 'Rear Wing', 'Floor', 'Diffuser', 'Sidepods']
        team1_comp_scores = [0.85, 0.78, 0.92, 0.88, 0.75]
        team2_comp_scores = [0.82, 0.85, 0.87, 0.90, 0.80]
        
        angles = np.linspace(0, 2 * np.pi, len(components_comp), endpoint=False).tolist()
        team1_comp_scores += team1_comp_scores[:1]
        team2_comp_scores += team2_comp_scores[:1]
        angles += angles[:1]
        
        ax4 = plt.subplot(2, 2, 4, projection='polar')
        ax4.plot(angles, team1_comp_scores, 'o-', linewidth=2, label=team1_name, color='#3498db')
        ax4.fill(angles, team1_comp_scores, alpha=0.25, color='#3498db')
        ax4.plot(angles, team2_comp_scores, 'o-', linewidth=2, label=team2_name, color='#e74c3c')
        ax4.fill(angles, team2_comp_scores, alpha=0.25, color='#e74c3c')
        ax4.set_xticks(angles[:-1])
        ax4.set_xticklabels(components_comp, fontsize=9)
        ax4.set_ylim(0, 1)
        ax4.set_title('Component Strength Radar', fontweight='bold', pad=20)
        ax4.legend(loc='upper right', bbox_to_anchor=(1.3, 1.1))
        ax4.grid(True)
        
        plt.tight_layout()
        filename = self.output_dir / f'{team1_name}_vs_{team2_name}_{track_name}_comparison.png'
        plt.savefig(filename, bbox_inches='tight')
        plt.close()
        
        return str(filename)
    
    def plot_pressure_distribution(self, pressure_data: Dict, team_name: str, track_name: str) -> str:
        """Line plot of pressure distribution along car"""
        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 10))
        fig.suptitle(f'{team_name} - Pressure Distribution at {track_name}',
                    fontsize=14, fontweight='bold')
        
        position = pressure_data['position']
        cp = pressure_data['pressure_coefficient']
        pressure = pressure_data['pressure']
        
        # Plot 1: Pressure coefficient
        ax1.plot(position, cp, linewidth=3, color='#e74c3c', label='Pressure Coefficient (Cp)')
        ax1.fill_between(position, cp, alpha=0.3, color='#e74c3c')
        ax1.axhline(y=0, color='black', linestyle='--', linewidth=1)
        ax1.set_ylabel('Pressure Coefficient (Cp)', fontweight='bold')
        ax1.set_title('Pressure Coefficient Distribution', fontweight='bold')
        ax1.grid(True, alpha=0.3)
        ax1.legend()
        
        # Annotate key regions
        ax1.annotate('Front Wing', xy=(0.05, cp[2]), xytext=(0.1, cp[2]+0.3),
                    arrowprops=dict(arrowstyle='->', color='black'), fontweight='bold')
        ax1.annotate('Floor', xy=(0.5, cp[25]), xytext=(0.55, cp[25]-0.5),
                    arrowprops=dict(arrowstyle='->', color='black'), fontweight='bold')
        ax1.annotate('Diffuser', xy=(0.85, cp[43]), xytext=(0.75, cp[43]+0.3),
                    arrowprops=dict(arrowstyle='->', color='black'), fontweight='bold')
        
        # Plot 2: Actual pressure
        ax2.plot(position, pressure/1000, linewidth=3, color='#3498db', label='Pressure (kPa)')
        ax2.fill_between(position, pressure/1000, alpha=0.3, color='#3498db')
        ax2.set_xlabel('Position Along Car (0=Front, 1=Rear)', fontweight='bold')
        ax2.set_ylabel('Pressure (kPa)', fontweight='bold')
        ax2.set_title('Absolute Pressure Distribution', fontweight='bold')
        ax2.grid(True, alpha=0.3)
        ax2.legend()
        
        plt.tight_layout()
        filename = self.output_dir / f'{team_name}_{track_name}_pressure_distribution.png'
        plt.savefig(filename, bbox_inches='tight')
        plt.close()
        
        return str(filename)
    
    def plot_upgrade_roi(self, upgrade_packages: List, team_name: str) -> str:
        """Scatter plot of upgrade packages with ROI analysis"""
        fig, ax = plt.subplots(figsize=(14, 8))
        
        costs = [pkg.total_cost for pkg in upgrade_packages]
        improvements = [pkg.expected_improvement * 100 for pkg in upgrade_packages]  # Convert to %
        rois = [pkg.roi for pkg in upgrade_packages]
        names = [pkg.package_name for pkg in upgrade_packages]
        
        # Color by ROI
        colors = plt.cm.RdYlGn(np.array(rois) / max(rois) if rois else [0.5]*len(rois))
        
        scatter = ax.scatter(costs, improvements, s=[r*500 for r in rois], 
                           c=colors, alpha=0.6, edgecolors='black', linewidth=2)
        
        # Add labels
        for i, name in enumerate(names):
            ax.annotate(f'{name}\\nROI: {rois[i]:.2f}', 
                       xy=(costs[i], improvements[i]),
                       xytext=(10, 10), textcoords='offset points',
                       bbox=dict(boxstyle='round,pad=0.5', facecolor='yellow', alpha=0.7),
                       fontsize=9, fontweight='bold',
                       arrowprops=dict(arrowstyle='->', color='black'))
        
        ax.set_xlabel('Cost ($1000s)', fontsize=12, fontweight='bold')
        ax.set_ylabel('Expected Improvement (%)', fontsize=12, fontweight='bold')
        ax.set_title(f'{team_name} - Upgrade Packages: Cost vs Performance Gain',
                    fontsize=14, fontweight='bold', pad=20)
        ax.grid(True, alpha=0.3)
        
        # Add ROI reference lines
        ax.axhline(y=np.mean(improvements) if improvements else 0, 
                  color='red', linestyle='--', alpha=0.5, label='Avg Improvement')
        ax.axvline(x=np.mean(costs) if costs else 0,
                  color='blue', linestyle='--', alpha=0.5, label='Avg Cost')
        ax.legend()
        
        plt.tight_layout()
        filename = self.output_dir / f'{team_name}_upgrade_roi_analysis.png'
        plt.savefig(filename, bbox_inches='tight')
        plt.close()
        
        return str(filename)
