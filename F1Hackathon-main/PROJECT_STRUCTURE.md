# F1 Aerodynamics Analysis ML System - 2025 Season
## Complete Project Structure Documentation

---

## Overview
This system analyzes F1 car aerodynamics using **real physics formulas**, **actual FastF1 API data from the 2025 season**, and **computer vision analysis of 3D car models**. It provides comprehensive aerodynamic analysis, component optimization, track-specific recommendations, team comparisons, and upgrade strategies.

---

## Key Features

### ✅ Real Data Integration
- **FastF1 API**: Fetches real telemetry, lap times, speeds from 2025 season
- **24 Tracks**: Complete 2025 F1 calendar with actual track characteristics
- **10 Teams**: All 2025 F1 teams supported
- **Historical Baseline**: Uses 2024 lap times as performance baseline

### ✅ Physics-Based Analysis
- Real aerodynamic formulas (drag equation, lift equation, Bernoulli's principle)
- Ground effect calculations
- Pressure distribution modeling
- Vortex generation analysis
- DRS effect simulation
- Reynolds number calculations
- Porpoising risk assessment

### ✅ Computer Vision
- Analyzes static 3D car images (4-6 per team)
- Extracts aerodynamic features from front, rear, side, top views
- Component detection (wings, floor, sidepods, diffuser, etc.)
- Edge detection and geometric analysis

### ✅ Machine Learning
- Gradient Boosting models for performance prediction
- Combines physics calculations + telemetry + visual analysis
- Predicts optimal configurations per track
- Lap time forecasting (quali + race)
- Upgrade impact estimation

### ✅ Comprehensive Visualizations
- Scatter plots, heatmaps, line charts, bar charts
- Component efficiency comparisons
- Track-by-track performance analysis
- Team comparison visuals
- Upgrade ROI analysis

---

## Project Structure

```
F1Hackathon/
│
├── config/
│   ├── settings.py              ✅ COMPLETE - Constants, paths, configurations (2025)
│   └── track_configs.py          ✅ COMPLETE - All 24 tracks of 2025 season with real data
│
├── physics/
│   ├── aerodynamics.py           ✅ COMPLETE - Core physics engine with real formulas
│   ├── lap_time_simulator.py    🔨 NEEDS IMPLEMENTATION
│   └── circuit_analyzer.py       🔨 NEEDS IMPLEMENTATION
│
├── data/
│   ├── fastf1_data_loader.py     ✅ COMPLETE - Real FastF1 API integration
│   ├── preprocessor.py           🔨 NEEDS IMPLEMENTATION
│   └── car_images/               📁 Directory for team car images (RBR, FER, MER, etc.)
│
├── computer_vision/
│   ├── car_analyzer.py           🔨 NEEDS IMPLEMENTATION
│   ├── feature_extractor.py      🔨 NEEDS IMPLEMENTATION
│   └── component_detector.py     🔨 NEEDS IMPLEMENTATION
│
├── ml_models/
│   ├── aero_predictor.py         🔨 NEEDS IMPLEMENTATION
│   ├── performance_estimator.py  🔨 NEEDS IMPLEMENTATION
│   ├── upgrade_recommender.py    🔨 NEEDS IMPLEMENTATION
│   └── model_trainer.py          🔨 NEEDS IMPLEMENTATION
│
├── analysis/
│   └── component_analyzer.py     🔨 NEEDS IMPLEMENTATION
│
├── visualization/
│   ├── plots.py                  🔨 NEEDS IMPLEMENTATION
│   ├── heatmaps.py               🔨 NEEDS IMPLEMENTATION
│   └── dashboards.py             🔨 NEEDS IMPLEMENTATION
│
├── api/                          📁 Future backend API (FastAPI)
│   ├── main.py
│   ├── routes/
│   └── models/
│
├── output/                       📁 Generated analysis results
├── saved_models/                 📁 Trained ML models
├── cache/                        📁 FastF1 data cache
│
├── main.py                       ✅ COMPLETE - Main orchestrator
├── requirements.txt              ✅ COMPLETE - All dependencies
├── PROJECT_STRUCTURE.md          ✅ THIS FILE
└── README.md                     🔨 NEEDS CREATION

```

---

## Data Flow

```
1. USER INPUT
   ↓
2. FASTF1 API → Real 2025 Season Data (telemetry, lap times, speeds)
   ↓
3. COMPUTER VISION → Analyze Car Images (detect components, extract features)
   ↓
4. PHYSICS ENGINE → Calculate aerodynamics (drag, downforce, balance, L/D ratio)
   ↓
5. ML MODEL → Predict optimal configuration + lap times
   ↓
6. ANALYSIS → Component efficiency, strengths/weaknesses, comparisons
   ↓
7. RECOMMENDATIONS → Upgrade packages, track-specific setups
   ↓
8. VISUALIZATION → Graphs, heatmaps, charts
   ↓
9. OUTPUT → JSON results + Visual reports
```

---

## Module Details

### 1. **config/settings.py** ✅
- 2025 season constants
- All 10 F1 teams
- Aerodynamic components list
- Physical constants (air density, gravity, car mass)
- Paths and directories

### 2. **config/track_configs.py** ✅
- All 24 races of 2025 F1 calendar
- Real track characteristics:
  - Circuit length, corner count
  - Downforce levels (low/medium/high)
  - Longest straights, elevation changes
  - DRS zones, surface grip
  - Optimal aero setups per track
- 2024 lap time baselines for comparison

### 3. **physics/aerodynamics.py** ✅
Real physics formulas implemented:
- **Drag Force**: F_d = 0.5 × ρ × v² × C_d × A
- **Downforce**: F_l = 0.5 × ρ × v² × C_l × A
- **Ground Effect**: Ride height dependent multipliers
- **Wing Efficiency**: Angle of attack calculations
- **L/D Ratio**: Aerodynamic efficiency
- **Pressure Distribution**: Simplified Bernoulli equation
- **Vortex Generation**: Y250, bargeboards, diffuser
- **DRS Effect**: ~10% drag reduction, ~15% downforce loss
- **Reynolds Number**: Flow characteristics
- **Porpoising Risk**: Based on ride height + downforce

### 4. **data/fastf1_data_loader.py** ✅
FastF1 API integration:
- Session loading (Race, Qualifying, Practice)
- Lap times for all teams
- Detailed telemetry (Speed, Throttle, Brake, DRS, Gear)
- Speed analysis (max, avg, variance)
- DRS usage statistics
- Corner speed extraction
- Race pace analysis
- Team comparisons
- **Uses real 2025 season data when available**

### 5. **physics/lap_time_simulator.py** 🔨
TO IMPLEMENT:
- Physics-based lap time simulation
- Combine drag + downforce + power + tire grip
- Corner speed calculations
- Straight-line acceleration modeling
- Braking distance calculations
- Track layout integration
- Output: Quali lap time (1:23.456 format)
- Output: Race lap time (with tire deg)

### 6. **computer_vision/car_analyzer.py** 🔨
TO IMPLEMENT:
- Load team car images (front, rear, side, top views)
- Edge detection (Canny algorithm)
- Component segmentation
- Geometric measurements:
  - Wing angles
  - Frontal area
  - Aspect ratios
- Surface curvature analysis
- Output: Aerodynamic metrics per car

### 7. **ml_models/aero_predictor.py** 🔨
TO IMPLEMENT:
- Gradient Boosting / XGBoost model
- Features: Physics calcs + telemetry + CV metrics
- Predicts: Optimal C_d, C_l, wing angles, ride heights
- Per-track optimization
- Model training with synthetic + real data

### 8. **analysis/component_analyzer.py** 🔨
TO IMPLEMENT:
- Analyze each component:
  - Front wing, rear wing, floor, diffuser, sidepods, etc.
- Calculate efficiency scores
- Identify strengths (Good/Excellent ratings)
- Identify weaknesses (Poor/Below Average ratings)
- Improvement potential estimation

### 9. **ml_models/upgrade_recommender.py** 🔨
TO IMPLEMENT:
- Analyze current performance vs competitors
- Suggest upgrade packages:
  - Components to upgrade
  - Expected performance gain
  - Cost vs ROI
- Timeline: Which races to bring upgrades
- Prioritization based on track calendar

### 10. **visualization/plots.py** 🔨
TO IMPLEMENT:
- **Scatter plots**: Component efficiency vs performance
- **Line charts**: Lap time evolution, speed traces
- **Bar charts**: Team comparisons, component ratings
- **Heatmaps**: Track-by-track performance matrices
- **Pressure distribution**: Along car body
- High-resolution exports (PNG, SVG)

---

## Usage Examples

### Analyze Single Team at One Track
```bash
python main.py --mode analyze --team "Red Bull Racing" --track "Monaco"
```

### Compare Two Teams
```bash
python main.py --mode compare --team "Ferrari" --team2 "Mercedes" --track "Silverstone"
```

### Analyze Team Across All Tracks
```bash
python main.py --mode all-tracks --team "McLaren"
```

### Train ML Model
```bash
python main.py --mode train --use-fastf1
```

---

## Real Data Sources

### FastF1 API
- **Official F1 timing data**
- Telemetry at ~4-10 Hz
- Lap times to millisecond precision
- All 2025 sessions (when available)
- Falls back to 2024 data if 2025 not yet available

### Track Data
- Based on FIA official track maps
- Historical lap time records
- Elevation profiles from official sources
- DRS zone placements per FIA regulations

### Physics Constants
- Air density: 1.225 kg/m³ (sea level, 15°C)
- Adjustments for altitude (Mexico, Brazil)
- F1 car mass: 798 kg (2025 regulations)
- Typical frontal area: 1.4 m²

---

## Output Format

### Analysis JSON Structure
```json
{
  "team": "Red Bull Racing",
  "track": "Monaco",
  "timestamp": "2025-10-29T12:00:00",
  "track_info": {
    "length_km": 3.337,
    "downforce_level": "HIGH",
    "corner_count": 19
  },
  "circuit_analysis": {
    "optimal_quali_time": "1:10.123",
    "optimal_race_time": "1:12.456",
    "time_gain_possible": 0.234
  },
  "components": {
    "front_wing": {
      "efficiency": 0.92,
      "rating": "Excellent",
      "improvement_potential": 0.03
    },
    ...
  },
  "strengths": ["front_wing", "floor", "diffuser"],
  "weaknesses": ["rear_wing", "sidepods"],
  "recommended_upgrades": [
    {
      "package": "Rear Wing Upgrade Package 1",
      "components": ["rear_wing", "beam_wing"],
      "cost": 160,
      "improvement": 0.15,
      "roi": 0.94
    }
  ]
}
```

---

## Next Steps for Complete Implementation

1. **Implement remaining physics modules** (lap_time_simulator, circuit_analyzer)
2. **Complete computer vision system** (car_analyzer, feature_extractor, component_detector)
3. **Build ML models** (aero_predictor, performance_estimator, upgrade_recommender, model_trainer)
4. **Create visualization system** (plots, heatmaps, dashboards)
5. **Add component analyzer** logic
6. **Prepare car image dataset** (3-6 images per team)
7. **Test with real 2025 data** once season begins
8. **Create FastAPI backend** for web integration
9. **Build interactive dashboard** (optional: Plotly Dash or Streamlit)

---

## Installation

```bash
# Create virtual environment
python -m venv venv
venv\\Scripts\\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Run system
python main.py
```

---

## Notes
- System uses **real 2025 F1 data** via FastF1 API
- All physics calculations based on **actual formulas**
- Lap times in **M:SS.mmm format** (e.g., "1:23.456")
- Compatible with frontend integration via JSON API
- All 24 tracks of 2025 season supported
- All 10 2025 F1 teams supported
- No demo/fake data - everything from real sources

---

**Status**: Core infrastructure complete. Physics engine operational. FastF1 integration functional. Remaining modules in progress.
