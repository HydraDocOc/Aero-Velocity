# Team Comparison & Season Forecast Guide

## Overview

The Team Comparison module provides comprehensive aerodynamic analysis comparing two F1 teams on any given track, with detailed insights into:

- **Component-level efficiency comparison** (front wing, rear wing, floor, diffuser, sidepods, beam wing)
- **Performance metrics** (top speed, corner speed, downforce, drag)
- **Track suitability analysis** matching car characteristics to circuit requirements
- **Lap time predictions** with confidence scores
- **Strengths & weaknesses** for each team's aerodynamic package
- **Season forecasting** predicting which team will be more efficient across upcoming races

---

## Features

### 1. Single Track Comparison

Compare two teams on a specific track with detailed aerodynamic analysis.

**Key Outputs:**
- Predicted lap times with winning margin
- Aerodynamic efficiency gap
- Component-by-component efficiency breakdown
- Performance metrics (speed, downforce, drag)
- Track suitability scores
- Key differentiators explaining performance gaps

### 2. Season Efficiency Forecast

Predict which team will perform better across multiple upcoming races.

**Key Outputs:**
- Race-by-race winner predictions
- Win distribution and percentages
- Average efficiency scores
- Track-specific suitability analysis
- Confidence levels for each prediction
- Strategic reasoning for forecasts

---

## API Usage

### Endpoint 1: Compare Teams on a Track

**Endpoint:** `POST /compare/teams`

**Request Body:**
```json
{
  "team1": "Red Bull Racing",
  "team2": "Ferrari",
  "track": "Monza"
}
```

**Example Response:**
```json
{
  "track": "Monza",
  "teams": {
    "team1": "Red Bull Racing",
    "team2": "Ferrari"
  },
  "predicted_winner": "Ferrari",
  "confidence_percent": 78.5,
  "winning_margin_seconds": 0.392,
  "lap_times": {
    "team1_predicted": 80.245,
    "team2_predicted": 79.853,
    "difference": 0.392
  },
  "aerodynamic_efficiency": {
    "team1": 3.425,
    "team2": 3.561,
    "gap": -0.136
  },
  "performance_comparison": {
    "top_speed_kmh": {
      "team1": 348.2,
      "team2": 351.5,
      "delta": -3.3
    },
    "corner_speed_kmh": {
      "team1": 168.5,
      "team2": 172.3,
      "delta": -3.8
    },
    "downforce_n": {
      "team1": 18500,
      "team2": 19200,
      "delta": -700
    },
    "drag_n": {
      "team1": 5400.2,
      "team2": 5390.8,
      "delta": 9.4
    }
  },
  "component_analysis": [
    {
      "component": "Front Wing",
      "team1_efficiency": 76.5,
      "team2_efficiency": 82.3,
      "difference_percent": -7.05,
      "advantage": "team2",
      "lap_time_impact_seconds": 0.0986,
      "analysis": "Ferrari's front wing generates superior front-end downforce, providing better turn-in stability. Critical for low-downforce tracks."
    },
    {
      "component": "Rear Wing",
      "team1_efficiency": 78.2,
      "team2_efficiency": 79.8,
      "difference_percent": -2.01,
      "advantage": "team2",
      "lap_time_impact_seconds": 0.0312,
      "analysis": "Ferrari's rear wing configuration offers better balance between downforce and drag, optimizing straight-line speed and cornering."
    },
    {
      "component": "Floor",
      "team1_efficiency": 81.3,
      "team2_efficiency": 85.7,
      "difference_percent": -5.13,
      "advantage": "team2",
      "lap_time_impact_seconds": 0.1184,
      "analysis": "Ferrari's floor design creates more efficient ground effect, crucial for consistent downforce through corners."
    }
  ],
  "team_profiles": {
    "team1": {
      "strengths": [
        "Excellent straight-line speed with low-drag configuration",
        "Well-balanced aero distribution front-to-rear"
      ],
      "weaknesses": [
        "Weak cornering speed indicating insufficient downforce"
      ],
      "track_suitability_score": 72.3
    },
    "team2": {
      "strengths": [
        "Excellent straight-line speed with low-drag configuration",
        "Strong cornering performance with high downforce",
        "Excellent aerodynamic efficiency (high L/D ratio)"
      ],
      "weaknesses": [],
      "track_suitability_score": 81.8
    }
  },
  "track_characteristics": {
    "straight_line_ratio": 0.52,
    "corner_complexity": 2.2,
    "high_speed_corners": 0.36,
    "downforce_importance": 0.3,
    "drs_zones": 2,
    "elevation_change": 0.05
  },
  "key_differentiators": [
    "Floor: 5.1% advantage (~0.118s/lap)",
    "Front Wing: 7.0% advantage (~0.099s/lap)",
    "Top speed difference: 3.3 km/h",
    "Cornering speed difference: 3.8 km/h",
    "Straight-line speed crucial on this power circuit"
  ]
}
```

---

### Endpoint 2: Season Forecast

**Endpoint:** `POST /forecast/season`

**Request Body:**
```json
{
  "team1": "Red Bull Racing",
  "team2": "McLaren",
  "upcoming_tracks": [
    "Silverstone",
    "Spa",
    "Monza",
    "Singapore",
    "Suzuka"
  ]
}
```

**Example Response:**
```json
{
  "teams": {
    "team1": "Red Bull Racing",
    "team2": "McLaren"
  },
  "upcoming_races": [
    "Silverstone",
    "Spa",
    "Monza",
    "Singapore",
    "Suzuka"
  ],
  "race_count": 5,
  "overall_prediction": "McLaren is predicted to be more efficient",
  "expected_results": {
    "team1_wins": 2,
    "team2_wins": 3,
    "team1_win_percentage": 40.0,
    "team2_win_percentage": 60.0
  },
  "efficiency_scores": {
    "team1_average": 3.412,
    "team2_average": 3.589,
    "efficiency_gap": 0.177
  },
  "race_by_race_predictions": [
    {
      "track": "Silverstone",
      "predicted_winner": "McLaren",
      "confidence_percent": 82.4,
      "lap_time_gap_seconds": 0.412,
      "track_suitability": {
        "team1": 68.5,
        "team2": 79.3
      },
      "key_factors": [
        "Floor: 6.2% advantage (~0.142s/lap)",
        "Rear Wing: 4.8% advantage (~0.089s/lap)",
        "High downforce essential for this technical circuit"
      ]
    },
    {
      "track": "Spa",
      "predicted_winner": "Red Bull Racing",
      "confidence_percent": 71.2,
      "lap_time_gap_seconds": 0.356,
      "track_suitability": {
        "team1": 81.7,
        "team2": 73.4
      },
      "key_factors": [
        "Top speed difference: 5.2 km/h",
        "Straight-line speed crucial on this power circuit"
      ]
    },
    {
      "track": "Monza",
      "predicted_winner": "McLaren",
      "confidence_percent": 68.9,
      "lap_time_gap_seconds": 0.345,
      "track_suitability": {
        "team1": 76.2,
        "team2": 82.1
      },
      "key_factors": [
        "Front Wing: 7.1% advantage (~0.102s/lap)",
        "Straight-line speed crucial on this power circuit"
      ]
    },
    {
      "track": "Singapore",
      "predicted_winner": "McLaren",
      "confidence_percent": 91.5,
      "lap_time_gap_seconds": 0.458,
      "track_suitability": {
        "team1": 62.3,
        "team2": 85.7
      },
      "key_factors": [
        "Floor: 8.3% advantage (~0.186s/lap)",
        "Cornering speed difference: 5.2 km/h",
        "High downforce essential for this technical circuit"
      ]
    },
    {
      "track": "Suzuka",
      "predicted_winner": "Red Bull Racing",
      "confidence_percent": 76.8,
      "lap_time_gap_seconds": 0.384,
      "track_suitability": {
        "team1": 79.8,
        "team2": 74.5
      },
      "key_factors": [
        "Rear Wing: 5.5% advantage (~0.095s/lap)",
        "Top speed difference: 4.1 km/h"
      ]
    }
  ],
  "reasoning": [
    "Red Bull Racing predicted to win 2 races, McLaren predicted to win 3 races",
    "McLaren has superior aerodynamic efficiency (3.59 vs 3.41)",
    "Upcoming calendar: 2 power circuits, 3 technical circuits",
    "High confidence predictions in 4/5 races"
  ]
}
```

---

## Python Usage Examples

### Example 1: Compare Teams on a Single Track

```python
from analysis.team_comparator import TeamComparator

# Initialize comparator
comparator = TeamComparator()

# Compare teams on a specific track
comparison = comparator.compare_teams_on_track(
    team1="Mercedes",
    team2="Ferrari",
    track_name="Silverstone",
    year=2025
)

# Access results
print(f"Winner: {comparison.predicted_winner}")
print(f"Confidence: {comparison.confidence:.1f}%")
print(f"Winning margin: {comparison.winning_margin_seconds:.3f}s")

# View aerodynamic efficiency
print(f"\nAero Efficiency:")
print(f"  {comparison.team1_name}: {comparison.team1_aero_efficiency:.3f}")
print(f"  {comparison.team2_name}: {comparison.team2_aero_efficiency:.3f}")

# Analyze components
print(f"\nComponent Analysis:")
for comp in comparison.component_comparisons:
    if abs(comp.difference_percent) > 5:  # Significant differences
        print(f"  {comp.component_name}: {comp.difference_percent:+.1f}% "
              f"(~{comp.impact_on_laptime:.3f}s/lap)")

# Team strengths
print(f"\n{comparison.team1_name} Strengths:")
for strength in comparison.team1_strengths:
    print(f"  - {strength}")

print(f"\n{comparison.team2_name} Strengths:")
for strength in comparison.team2_strengths:
    print(f"  - {strength}")

# Key differentiators
print(f"\nKey Differentiators:")
for diff in comparison.key_differentiators:
    print(f"  - {diff}")
```

### Example 2: Forecast Season Efficiency

```python
from analysis.team_comparator import TeamComparator

# Initialize comparator
comparator = TeamComparator()

# Define upcoming tracks
upcoming_tracks = [
    "Bahrain",
    "Saudi_Arabia",
    "Australia",
    "Japan",
    "China"
]

# Forecast season
forecast = comparator.forecast_season_efficiency(
    team1="Red Bull Racing",
    team2="McLaren",
    upcoming_tracks=upcoming_tracks,
    year=2025
)

# Overall prediction
print(f"Overall: {forecast.overall_prediction}")
print(f"\nExpected Wins:")
print(f"  {forecast.team1_name}: {forecast.team1_expected_wins}")
print(f"  {forecast.team2_name}: {forecast.team2_expected_wins}")

print(f"\nAverage Efficiency:")
print(f"  {forecast.team1_name}: {forecast.team1_efficiency_score:.3f}")
print(f"  {forecast.team2_name}: {forecast.team2_efficiency_score:.3f}")

# Race-by-race predictions
print(f"\nRace-by-Race Predictions:")
for pred in forecast.race_predictions:
    print(f"\n  {pred['track']}:")
    print(f"    Winner: {pred['predicted_winner']}")
    print(f"    Confidence: {pred['confidence']:.1f}%")
    print(f"    Gap: {pred['laptime_gap']:.3f}s")
    print(f"    Key Factors:")
    for factor in pred['key_factors'][:2]:
        print(f"      - {factor}")

# Strategic reasoning
print(f"\nReasoning:")
for reason in forecast.reasoning:
    print(f"  - {reason}")
```

---

## Use Cases

### 1. Race Weekend Strategy
Before a race weekend, compare your team with your main competitor to:
- Identify weak aerodynamic components needing urgent setup changes
- Understand track-specific advantages/disadvantages
- Predict qualifying and race performance
- Plan development priorities

### 2. Development Planning
Use season forecast to:
- Prioritize component upgrades based on upcoming track types
- Understand which circuits favor your car vs competitors
- Plan resource allocation for development
- Set realistic performance targets

### 3. Championship Analysis
Compare championship contenders to:
- Predict championship outcome based on remaining races
- Identify which team has the aerodynamic advantage
- Understand circuit-specific strengths and weaknesses
- Forecast swing races that could decide the championship

### 4. Technical Analysis
Deep-dive into aerodynamic performance:
- Component-level efficiency benchmarking
- Track suitability matching
- Performance metric comparison (speed, downforce, drag)
- Identify key technical differentiators

---

## Technical Details

### Track Suitability Calculation

The system calculates how well each car suits a specific track based on:

1. **Straight-line performance matching**
   - High-speed tracks reward low drag and high top speed
   - Twisty tracks reward balanced downforce

2. **Downforce requirements**
   - High-downforce tracks need strong corner performance
   - Low-downforce tracks prioritize straight-line speed

3. **Aerodynamic efficiency (L/D ratio)**
   - Better efficiency improves performance on all track types

4. **DRS effectiveness**
   - Multiple DRS zones reward effective DRS systems

### Component Efficiency Scoring

Each component (front wing, rear wing, floor, diffuser, sidepods, beam wing) is scored 0-100 based on:

- **Angle of attack** for wings (optimal balance between downforce and drag)
- **Rake angle** for floor (ground effect efficiency)
- **Undercut depth** for sidepods (airflow channeling)
- **Track-specific weighting** (downforce vs drag importance)

### Confidence Calculation

Prediction confidence is based on:
- **Lap time gap**: Larger gaps = higher confidence
- **Aerodynamic efficiency gap**: Clear technical advantage = higher confidence
- **Track suitability difference**: Better-suited car = higher confidence

---

## Integration with Existing System

The Team Comparator integrates with:

- **Physics Module**: Aerodynamic calculations, lap time simulation
- **Data Module**: Real FastF1 telemetry data
- **ML Models**: Performance estimation, configuration prediction
- **Visualization**: Charts and graphs for comparison data

---

## Future Enhancements

Potential additions:
- **Weather impact**: Compare teams in wet vs dry conditions
- **Tire strategy**: Include tire degradation in predictions
- **Race simulation**: Predict race outcomes with overtaking, strategy
- **Historical comparison**: Compare current cars with past seasons
- **Multi-team comparison**: Compare 3+ teams simultaneously

---

## API Testing with cURL

### Test Single Track Comparison
```bash
curl -X POST "http://localhost:8000/compare/teams" \
  -H "Content-Type: application/json" \
  -d '{
    "team1": "Red Bull Racing",
    "team2": "Ferrari",
    "track": "Monza"
  }'
```

### Test Season Forecast
```bash
curl -X POST "http://localhost:8000/forecast/season" \
  -H "Content-Type: application/json" \
  -d '{
    "team1": "Mercedes",
    "team2": "McLaren",
    "upcoming_tracks": ["Silverstone", "Spa", "Monza"]
  }'
```

---

## Troubleshooting

### Common Issues

**Issue:** `ValueError: Invalid team names`
- **Solution**: Check team names match exactly with `config.settings.TEAMS`

**Issue:** `ValueError: Invalid track`
- **Solution**: Check track names match `config.track_configs.TRACK_CONFIGS`

**Issue:** `Could not load data for [team] at [track]`
- **Warning only**: System continues with predicted data if FastF1 data unavailable

**Issue:** Low confidence predictions
- **Normal**: Indicates evenly matched teams or insufficient performance gap

---

## Contributing

To extend the team comparison system:

1. **Add new comparison metrics**: Extend `TrackPerformanceComparison` dataclass
2. **Improve efficiency calculations**: Modify `_calculate_component_efficiency`
3. **Add new components**: Update `_compare_components` method
4. **Enhance track analysis**: Extend `_analyze_track_characteristics`

---

## License & Credits

Part of the F1 Hackathon Aerodynamics Analysis System.

Powered by:
- FastF1 for real telemetry data
- Physics-based aerodynamic calculations
- Machine learning performance prediction
