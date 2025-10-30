"""
Configuration settings for F1 Aerodynamic Analysis System - 2025 Season
"""
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / 'data'
CAR_IMAGES_DIR = DATA_DIR / 'car_images'
OUTPUT_DIR = BASE_DIR / 'output'
MODELS_DIR = BASE_DIR / 'saved_models'
CACHE_DIR = BASE_DIR / 'cache'

# Create directories if they don't exist
for dir_path in [DATA_DIR, CAR_IMAGES_DIR, OUTPUT_DIR, MODELS_DIR, CACHE_DIR]:
    dir_path.mkdir(parents=True, exist_ok=True)

# F1 Physical Constants
AIR_DENSITY = 1.225  # kg/m³ at sea level, 15°C
GRAVITY = 9.81  # m/s²
F1_CAR_MASS = 798  # kg (minimum including driver)
F1_FRONTAL_AREA_TYPICAL = 1.4  # m² (typical)
F1_WHEELBASE = 3.6  # meters (typical)
F1_TRACK_WIDTH = 2.0  # meters (typical)

# Aerodynamic Constants
CD_BASELINE = 0.70  # Baseline drag coefficient
CL_FRONT_BASELINE = 1.5  # Front downforce coefficient
CL_REAR_BASELINE = 2.0  # Rear downforce coefficient
L_D_RATIO_TARGET = 4.0  # Target lift-to-drag ratio

# Performance Constants
DRS_DRAG_REDUCTION = 0.10  # 10% drag reduction with DRS
SLIPSTREAM_EFFECT = 0.08  # 8% drag reduction in slipstream
TIRE_DEGRADATION_FACTOR = 0.002  # per lap

# F1 Teams (2025)
F1_TEAMS = [
    "Red Bull Racing",
    "Ferrari",
    "Mercedes",
    "McLaren",
    "Aston Martin",
    "Alpine",
    "Williams",
    "RB",  # Racing Bulls
    "Kick Sauber",
    "Haas F1 Team"
]

# Team abbreviations for image loading
TEAM_ABBREV = {
    "Red Bull Racing": "RBR",
    "Ferrari": "FER",
    "Mercedes": "MER",
    "McLaren": "MCL",
    "Aston Martin": "AMR",
    "Alpine": "ALP",
    "Williams": "WIL",
    "RB": "RB",
    "Kick Sauber": "SAU",
    "Haas F1 Team": "HAA"
}

# Aerodynamic Components to Analyze
AERODYNAMIC_COMPONENTS = [
    "front_wing",
    "rear_wing",
    "floor",
    "diffuser",
    "sidepods",
    "bargeboards",
    "beam_wing",
    "nose",
    "halo",
    "engine_cover"
]

# Component efficiency weights (importance factor)
COMPONENT_WEIGHTS = {
    "front_wing": 0.20,
    "rear_wing": 0.18,
    "floor": 0.25,
    "diffuser": 0.15,
    "sidepods": 0.08,
    "bargeboards": 0.05,
    "beam_wing": 0.04,
    "nose": 0.03,
    "halo": 0.01,
    "engine_cover": 0.01
}

# Component typical cost (in thousands of dollars)
COMPONENT_COST = {
    "front_wing": 150,
    "rear_wing": 100,
    "floor": 300,
    "diffuser": 200,
    "sidepods": 180,
    "bargeboards": 80,
    "beam_wing": 60,
    "nose": 120,
    "halo": 50,
    "engine_cover": 70
}

# FastF1 Configuration
FASTF1_CACHE_DIR = str(CACHE_DIR / 'fastf1')
CURRENT_SEASON = 2025

# Computer Vision Configuration
CV_IMAGE_SIZE = (1024, 1024)
CV_EDGE_DETECTION_THRESHOLD = 100
CV_MIN_COMPONENT_AREA = 500  # pixels

# ML Model Configuration
ML_TRAIN_TEST_SPLIT = 0.2
ML_VALIDATION_SPLIT = 0.1
ML_RANDOM_STATE = 42
ML_N_ESTIMATORS = 200
ML_LEARNING_RATE = 0.05
ML_MAX_DEPTH = 8

# Visualization Configuration
VIZ_DPI = 300
VIZ_FIGSIZE = (12, 8)
VIZ_STYLE = 'seaborn-v0_8-darkgrid'
VIZ_COLOR_PALETTE = 'viridis'

# API Configuration (for future backend)
API_HOST = '0.0.0.0'
API_PORT = 8000
API_WORKERS = 4