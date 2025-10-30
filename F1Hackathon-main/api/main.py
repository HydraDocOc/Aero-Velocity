"""
FastAPI Backend - F1 Aerodynamics Analysis API
Complete REST API for frontend integration
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Optional
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from config.track_configs import get_track_by_name, get_all_track_names, TRACK_CONFIGS
from config.settings import F1_TEAMS, AERODYNAMIC_COMPONENTS
from physics.aerodynamics import AerodynamicPhysics, AeroState
from physics.lap_time_simulator import LapTimeSimulator, CarParameters
from physics.circuit_analyzer import CircuitAnalyzer
from data.fastf1_data_loader import FastF1DataLoader
from ml_models.aero_predictor import AeroPredictionModel
from ml_models.performance_estimator import PerformanceEstimator
from ml_models.upgrade_recommender import UpgradeRecommender
from ml_models.aero_advanced_models import (
    get_component_optimizer,
    get_config_predictor,
    get_pressure_analyzer
)
from analysis.component_analyzer import ComponentAnalyzer
from analysis.team_comparator import TeamComparator
from visualization.plots import F1AeroVisualizer
from computer_vision.car_analyzer import F1CarImageAnalyzer

# Initialize FastAPI
app = FastAPI(
    title="F1 Aerodynamics Analysis API",
    description="Advanced ML-powered F1 aerodynamic analysis system",
    version="1.0.0"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
aero_physics = AerodynamicPhysics()
lap_simulator = LapTimeSimulator()
circuit_analyzer = CircuitAnalyzer()
fastf1_loader = FastF1DataLoader()
aero_predictor = AeroPredictionModel()
performance_estimator = PerformanceEstimator()
upgrade_recommender = UpgradeRecommender()
component_analyzer = ComponentAnalyzer()
team_comparator = TeamComparator()
visualizer = F1AeroVisualizer()
car_analyzer = F1CarImageAnalyzer()
component_optimizer = get_component_optimizer()
config_predictor = get_config_predictor()
pressure_analyzer = get_pressure_analyzer()


# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class AeroConfig(BaseModel):
    """Aerodynamic configuration"""
    drag_coefficient: float = Field(ge=0.65, le=0.80, description="Drag coefficient (Cd)")
    cl_front: float = Field(ge=1.0, le=2.0, description="Front downforce coefficient")
    cl_rear: float = Field(ge=1.5, le=2.5, description="Rear downforce coefficient")
    front_wing_angle: float = Field(ge=15, le=35, description="Front wing angle (degrees)")
    rear_wing_angle: float = Field(ge=18, le=40, description="Rear wing angle (degrees)")
    ride_height_front: float = Field(ge=5, le=20, description="Front ride height (mm)")
    ride_height_rear: float = Field(ge=8, le=25, description="Rear ride height (mm)")


class LapTimePredictionRequest(BaseModel):
    """Request for lap time prediction"""
    team: str
    track: str
    aero_config: AeroConfig


class ComponentOptimizationRequest(BaseModel):
    """Request for component optimization"""
    component: str
    track: str
    current_config: AeroConfig


class ConfigComparisonRequest(BaseModel):
    """Request to compare configurations"""
    team: str
    track: str
    config1: AeroConfig
    config2: AeroConfig


class TeamComparisonRequest(BaseModel):
    """Request to compare two teams"""
    team1: str
    team2: str
    track: str


class SeasonForecastRequest(BaseModel):
    """Request for season forecast"""
    team1: str
    team2: str
    upcoming_tracks: List[str]


# ============================================================================
# HEALTH & INFO ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "message": "F1 Aerodynamics Analysis API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "operational"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "F1 Aero API"}


@app.get("/info/teams")
async def get_teams():
    """Get list of all F1 teams"""
    return {"teams": F1_TEAMS}


@app.get("/info/tracks")
async def get_tracks():
    """Get list of all F1 tracks"""
    return {"tracks": get_all_track_names()}


@app.get("/info/components")
async def get_components():
    """Get list of aerodynamic components"""
    return {"components": AERODYNAMIC_COMPONENTS}


@app.get("/info/track/{track_name}")
async def get_track_info(track_name: str):
    """Get detailed track information"""
    track = get_track_by_name(track_name)
    if not track:
        raise HTTPException(status_code=404, detail=f"Track '{track_name}' not found")
    
    return {
        "name": track.name,
        "length_km": track.circuit_length,
        "corners": track.corner_count,
        "downforce_level": track.downforce_level.value,
        "average_speed_kmh": track.average_speed,
        "longest_straight_m": track.longest_straight,
        "elevation_change_m": track.elevation_change,
        "drs_zones": track.drs_zones,
        "optimal_setup": {
            "front_wing_angle": track.optimal_front_wing_angle,
            "rear_wing_angle": track.optimal_rear_wing_angle,
            "ride_height_front": track.optimal_ride_height_front,
            "ride_height_rear": track.optimal_ride_height_rear
        },
        "2024_reference_times": {
            "quali": track.fastest_quali_2024,
            "race": track.fastest_race_2024
        }
    }


# ============================================================================
# LAP TIME PREDICTION ENDPOINTS
# ============================================================================

@app.post("/predict/laptime")
async def predict_lap_time(request: LapTimePredictionRequest):
    """
    Predict lap time for given configuration
    
    Returns qualifying and race lap times with detailed breakdown
    """
    track = get_track_by_name(request.track)
    if not track:
        raise HTTPException(status_code=404, detail=f"Track '{request.track}' not found")
    
    # Create car parameters
    car_params = CarParameters(
        drag_coefficient=request.aero_config.drag_coefficient,
        cl_front=request.aero_config.cl_front,
        cl_rear=request.aero_config.cl_rear,
        front_wing_angle=request.aero_config.front_wing_angle,
        rear_wing_angle=request.aero_config.rear_wing_angle,
        ride_height_front=request.aero_config.ride_height_front,
        ride_height_rear=request.aero_config.ride_height_rear
    )
    
    # Predict lap times
    quali_time, race_time = lap_simulator.predict_optimal_laptime(car_params, track)
    
    # Get performance metrics
    perf = performance_estimator.estimate_performance(
        request.aero_config.dict(),
        track.__dict__
    )
    
    # Compare with 2024 baseline
    if track.fastest_quali_2024:
        baseline_parts = track.fastest_quali_2024.split(':')
        baseline_seconds = int(baseline_parts[0]) * 60 + float(baseline_parts[1])
        
        quali_parts = quali_time.split(':')
        predicted_seconds = int(quali_parts[0]) * 60 + float(quali_parts[1])
        
        gap_to_2024 = predicted_seconds - baseline_seconds
    else:
        gap_to_2024 = None
    
    return {
        "team": request.team,
        "track": track.name,
        "predicted_times": {
            "qualifying": quali_time,
            "race": race_time,
            "gap_to_2024_pole": f"{gap_to_2024:+.3f}s" if gap_to_2024 else "N/A"
        },
        "performance_metrics": {
            "top_speed_kmh": perf['top_speed'],
            "avg_corner_speed_kmh": perf['avg_corner_speed'],
            "ld_ratio": perf['ld_ratio'],
            "aero_efficiency": perf['aero_efficiency'],
            "straight_line_performance": perf['straight_line_performance'],
            "corner_performance": perf['corner_performance']
        },
        "configuration": request.aero_config.dict()
    }


@app.post("/predict/optimal-config")
async def predict_optimal_config(track: str, prioritize: Optional[str] = None):
    """
    Predict optimal aerodynamic configuration for track
    
    Args:
        track: Track name
        prioritize: 'top_speed' or 'corners' (optional)
    """
    track_config = get_track_by_name(track)
    if not track_config:
        raise HTTPException(status_code=404, detail=f"Track '{track}' not found")
    
    targets = {}
    if prioritize == 'top_speed':
        targets['prioritize_top_speed'] = True
    elif prioritize == 'corners':
        targets['prioritize_corners'] = True
    
    prediction = config_predictor.predict_optimal_config(
        track_config.__dict__,
        targets
    )
    
    return {
        "track": track_config.name,
        "optimal_configuration": {
            "drag_coefficient": prediction.optimal_drag_coefficient,
            "cl_front": prediction.optimal_cl_front,
            "cl_rear": prediction.optimal_cl_rear,
            "front_wing_angle": prediction.optimal_front_wing_angle,
            "rear_wing_angle": prediction.optimal_rear_wing_angle,
            "ride_height_front": prediction.optimal_ride_height_front,
            "ride_height_rear": prediction.optimal_ride_height_rear
        },
        "predicted_laptime": prediction.predicted_laptime,
        "confidence_score": prediction.confidence_score,
        "optimization_target": prioritize or "balanced"
    }


# ============================================================================
# AERODYNAMIC ANALYSIS ENDPOINTS
# ============================================================================

@app.post("/analyze/configuration")
async def analyze_configuration(team: str, track: str, config: AeroConfig):
    """
    Complete aerodynamic configuration analysis
    
    Returns detailed analysis with recommendations
    """
    track_config = get_track_by_name(track)
    if not track_config:
        raise HTTPException(status_code=404, detail=f"Track '{track}' not found")
    
    # Get detailed recommendation
    recommendation = aero_predictor.compare_and_recommend(
        track_config.name,
        track_config.__dict__,
        config.dict(),
        competitor_configs=[]  # Could add competitor data here
    )
    
    # Format response
    comparisons = []
    for comp in recommendation.comparisons:
        comparisons.append({
            "parameter": comp.parameter,
            "current": comp.current_value,
            "optimal": comp.optimal_value,
            "delta": comp.delta,
            "status": comp.status,
            "lap_time_impact_seconds": comp.impact_on_laptime,
            "recommendation": comp.recommendation
        })
    
    return {
        "team": team,
        "track": track_config.name,
        "total_time_loss_seconds": recommendation.overall_gap,
        "comparisons": comparisons,
        "priority_fixes": recommendation.priority_upgrades,
        "quick_wins": recommendation.quick_wins,
        "major_upgrades": recommendation.major_upgrades,
        "estimated_improvement": recommendation.estimated_improvement
    }


@app.post("/analyze/component")
async def analyze_component(request: ComponentOptimizationRequest):
    """
    Analyze and optimize specific aerodynamic component
    """
    track_config = get_track_by_name(request.track)
    if not track_config:
        raise HTTPException(status_code=404, detail=f"Track '{request.track}' not found")
    
    result = component_optimizer.optimize_component(
        request.component,
        request.current_config.dict(),
        track_config.__dict__
    )
    
    return {
        "component": result.component,
        "current_efficiency": result.current_efficiency,
        "optimal_parameters": result.optimal_parameters,
        "expected_improvement_seconds": result.expected_improvement,
        "aerodynamic_impact": {
            "drag_delta": result.drag_impact,
            "downforce_delta": result.downforce_impact,
            "ld_ratio_improvement": result.ld_ratio_improvement
        }
    }


@app.post("/analyze/pressure-distribution")
async def analyze_pressure(config: AeroConfig, velocity_kmh: float = 250):
    """
    Analyze pressure distribution across car
    """
    prediction = pressure_analyzer.analyze_pressure_distribution(
        config.dict(),
        velocity_kmh
    )
    
    return {
        "velocity_kmh": velocity_kmh,
        "front_wing_efficiency": prediction.front_wing_efficiency,
        "floor_suction_level": prediction.floor_suction_level,
        "diffuser_performance": prediction.diffuser_performance,
        "downforce_distribution": prediction.overall_downforce_distribution,
        "drag_breakdown": prediction.drag_breakdown_by_component,
        "high_pressure_zones": prediction.stagnation_points
    }


# ============================================================================
# COMPARISON ENDPOINTS
# ============================================================================

@app.post("/compare/configurations")
async def compare_configurations(request: ConfigComparisonRequest):
    """
    Compare two aerodynamic configurations
    """
    track_config = get_track_by_name(request.track)
    if not track_config:
        raise HTTPException(status_code=404, detail=f"Track '{request.track}' not found")
    
    perf1 = performance_estimator.estimate_performance(
        request.config1.dict(),
        track_config.__dict__
    )
    
    perf2 = performance_estimator.estimate_performance(
        request.config2.dict(),
        track_config.__dict__
    )
    
    return {
        "team": request.team,
        "track": track_config.name,
        "config1": {
            "configuration": request.config1.dict(),
            "performance": perf1
        },
        "config2": {
            "configuration": request.config2.dict(),
            "performance": perf2
        },
        "deltas": {
            "top_speed": perf1['top_speed'] - perf2['top_speed'],
            "corner_speed": perf1['avg_corner_speed'] - perf2['avg_corner_speed'],
            "ld_ratio": perf1['ld_ratio'] - perf2['ld_ratio'],
            "aero_efficiency": perf1['aero_efficiency'] - perf2['aero_efficiency']
        },
        "winner": "Config 1" if perf1['aero_efficiency'] > perf2['aero_efficiency'] else "Config 2"
    }


@app.post("/compare/teams")
async def compare_teams(request: TeamComparisonRequest):
    """
    Compare two teams at specific track with comprehensive aerodynamic analysis
    """
    try:
        comparison = team_comparator.compare_teams_on_track(
            request.team1,
            request.team2,
            request.track
        )
        
        # Format component comparisons
        components = []
        for comp in comparison.component_comparisons:
            components.append({
                "component": comp.component_name,
                "team1_efficiency": round(comp.team1_efficiency, 2),
                "team2_efficiency": round(comp.team2_efficiency, 2),
                "difference_percent": round(comp.difference_percent, 2),
                "advantage": comp.advantage,
                "lap_time_impact_seconds": round(comp.impact_on_laptime, 4),
                "analysis": comp.technical_analysis
            })
        
        return {
            "track": comparison.track_name,
            "teams": {
                "team1": comparison.team1_name,
                "team2": comparison.team2_name
            },
            "predicted_winner": comparison.predicted_winner,
            "confidence_percent": round(comparison.confidence, 1),
            "winning_margin_seconds": round(comparison.winning_margin_seconds, 3),
            "lap_times": {
                "team1_predicted": round(comparison.team1_predicted_laptime, 3),
                "team2_predicted": round(comparison.team2_predicted_laptime, 3),
                "difference": round(comparison.laptime_difference, 3)
            },
            "aerodynamic_efficiency": {
                "team1": round(comparison.team1_aero_efficiency, 3),
                "team2": round(comparison.team2_aero_efficiency, 3),
                "gap": round(comparison.aero_efficiency_gap, 3)
            },
            "performance_comparison": {
                "top_speed_kmh": {
                    "team1": round(comparison.team1_top_speed, 1),
                    "team2": round(comparison.team2_top_speed, 1),
                    "delta": round(comparison.team1_top_speed - comparison.team2_top_speed, 1)
                },
                "corner_speed_kmh": {
                    "team1": round(comparison.team1_corner_speed, 1),
                    "team2": round(comparison.team2_corner_speed, 1),
                    "delta": round(comparison.team1_corner_speed - comparison.team2_corner_speed, 1)
                },
                "downforce_n": {
                    "team1": round(comparison.team1_downforce, 0),
                    "team2": round(comparison.team2_downforce, 0),
                    "delta": round(comparison.team1_downforce - comparison.team2_downforce, 0)
                },
                "drag_n": {
                    "team1": round(comparison.team1_drag, 1),
                    "team2": round(comparison.team2_drag, 1),
                    "delta": round(comparison.team1_drag - comparison.team2_drag, 1)
                }
            },
            "component_analysis": components,
            "team_profiles": {
                "team1": {
                    "strengths": comparison.team1_strengths,
                    "weaknesses": comparison.team1_weaknesses,
                    "track_suitability_score": round(comparison.team1_track_suitability, 1)
                },
                "team2": {
                    "strengths": comparison.team2_strengths,
                    "weaknesses": comparison.team2_weaknesses,
                    "track_suitability_score": round(comparison.team2_track_suitability, 1)
                }
            },
            "track_characteristics": comparison.track_characteristics,
            "key_differentiators": comparison.key_differentiators
        }
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error comparing teams: {str(e)}")


# ============================================================================
# SEASON FORECAST ENDPOINTS
# ============================================================================

@app.post("/forecast/season")
async def forecast_season(request: SeasonForecastRequest):
    """
    Forecast which team will be more efficient across upcoming races
    """
    try:
        forecast = team_comparator.forecast_season_efficiency(
            request.team1,
            request.team2,
            request.upcoming_tracks
        )
        
        # Format race predictions
        predictions = []
        for pred in forecast.race_predictions:
            predictions.append({
                "track": pred["track"],
                "predicted_winner": pred["predicted_winner"],
                "confidence_percent": round(pred["confidence"], 1),
                "lap_time_gap_seconds": round(pred["laptime_gap"], 3),
                "track_suitability": {
                    "team1": round(pred["team1_suitability"], 1),
                    "team2": round(pred["team2_suitability"], 1)
                },
                "key_factors": pred["key_factors"]
            })
        
        return {
            "teams": {
                "team1": forecast.team1_name,
                "team2": forecast.team2_name
            },
            "upcoming_races": forecast.upcoming_races,
            "race_count": len(forecast.upcoming_races),
            "overall_prediction": forecast.overall_prediction,
            "expected_results": {
                "team1_wins": forecast.team1_expected_wins,
                "team2_wins": forecast.team2_expected_wins,
                "team1_win_percentage": round(forecast.team1_expected_wins / len(forecast.upcoming_races) * 100, 1) if len(forecast.upcoming_races) > 0 else 0,
                "team2_win_percentage": round(forecast.team2_expected_wins / len(forecast.upcoming_races) * 100, 1) if len(forecast.upcoming_races) > 0 else 0
            },
            "efficiency_scores": {
                "team1_average": round(forecast.team1_efficiency_score, 3),
                "team2_average": round(forecast.team2_efficiency_score, 3),
                "efficiency_gap": round(abs(forecast.team1_efficiency_score - forecast.team2_efficiency_score), 3)
            },
            "race_by_race_predictions": predictions,
            "reasoning": forecast.reasoning
        }
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error forecasting season: {str(e)}")


# ============================================================================
# UPGRADE RECOMMENDATION ENDPOINTS
# ============================================================================

@app.post("/upgrades/recommend")
async def recommend_upgrades(team: str, current_config: AeroConfig, budget: float = 500):
    """
    Recommend aerodynamic upgrade packages
    
    Args:
        team: Team name
        current_config: Current configuration
        budget: Available budget in thousands of dollars
    """
    # Analyze current performance
    perf_analysis = upgrade_recommender.analyze_current_performance(
        current_config.dict(),
        [],  # upcoming_races
        []   # competitor_configs
    )
    
    # Get recommendations
    upgrades = upgrade_recommender.recommend_upgrades(
        current_config.dict(),
        perf_analysis,
        budget,
        []
    )
    
    packages = []
    for pkg in upgrades[:5]:  # Top 5 recommendations
        packages.append({
            "name": pkg.package_name,
            "components": pkg.components,
            "cost_thousands": pkg.total_cost,
            "expected_improvement_seconds": pkg.expected_improvement,
            "roi": pkg.roi,
            "development_time_days": pkg.development_time,
            "risk_level": pkg.risk_level,
            "target_races": pkg.target_races
        })
    
    return {
        "team": team,
        "budget_available": budget,
        "current_performance": perf_analysis,
        "recommended_packages": packages
    }


# ============================================================================
# FASTF1 DATA ENDPOINTS
# ============================================================================

@app.get("/data/fastf1/events")
async def get_f1_events():
    """Get all F1 events from current season"""
    events = fastf1_loader.get_all_events()
    return {"season": fastf1_loader.season, "events": events}


@app.get("/data/fastf1/speed/{event}/{team}")
async def get_speed_data(event: str, team: str):
    """Get speed data from FastF1"""
    speed_data = fastf1_loader.get_speed_data(event, team)
    return {"event": event, "team": team, "speed_data": speed_data}


# ============================================================================
# VISUALIZATION ENDPOINTS
# ============================================================================

@app.get("/visualize/track-heatmap/{team}")
async def generate_track_heatmap(team: str):
    """Generate performance heatmap across all tracks"""
    # This would generate and return a heatmap
    # For now, return placeholder
    return {
        "team": team,
        "message": "Heatmap generation endpoint",
        "tracks_analyzed": len(TRACK_CONFIGS)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
