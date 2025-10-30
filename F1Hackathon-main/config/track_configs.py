"""
Track Configurations for 2025 F1 Season
Based on actual track characteristics and 2024 season baseline data
2024 lap times used as reference for 2025 performance predictions
"""
from dataclasses import dataclass
from enum import Enum
from typing import Dict, Optional


class DownforceLevel(Enum):
    """Track downforce requirement classification"""
    LOW = "low"          # High-speed circuits (Monza, Spa)
    MEDIUM = "medium"    # Balanced circuits (Most tracks)
    HIGH = "high"        # Slow, twisty circuits (Monaco, Hungary, Singapore)


@dataclass
class TrackConfig:
    """Configuration for a specific F1 track"""
    name: str
    circuit_length: float  # km
    corner_count: int
    downforce_level: DownforceLevel
    average_speed: float  # km/h (historical)
    longest_straight: float  # meters
    elevation_change: float  # meters
    
    # Optimal aerodynamic setup (based on historical data)
    optimal_front_wing_angle: float  # degrees
    optimal_rear_wing_angle: float  # degrees
    optimal_ride_height_front: float  # mm
    optimal_ride_height_rear: float  # mm
    
    # Track-specific factors
    drs_zones: int
    surface_grip: float  # 0.0-1.0
    bumpy_surface: bool
    
    # Historical lap time references (2024 season baseline for 2025 predictions)
    fastest_quali_2024: Optional[str] = None  # Format: "1:23.456" - Used as reference
    fastest_race_2024: Optional[str] = None   # 2025 season uses 2024 as baseline


# 2025 F1 Season Track Configurations
# Using 2024 lap times as baseline reference for 2025 predictions
TRACK_CONFIGS: Dict[str, TrackConfig] = {
    # Round 1
    "Bahrain": TrackConfig(
        name="Bahrain International Circuit",
        circuit_length=5.412,
        corner_count=15,
        downforce_level=DownforceLevel.MEDIUM,
        average_speed=205,
        longest_straight=1090,
        elevation_change=8,
        optimal_front_wing_angle=22,
        optimal_rear_wing_angle=25,
        optimal_ride_height_front=12,
        optimal_ride_height_rear=14,
        drs_zones=3,
        surface_grip=0.85,
        bumpy_surface=False,
        fastest_quali_2024="1:29.179",
        fastest_race_2024="1:32.028"
    ),
    
    # Round 2
    "Saudi Arabia": TrackConfig(
        name="Jeddah Corniche Circuit",
        circuit_length=6.174,
        corner_count=27,
        downforce_level=DownforceLevel.MEDIUM,
        average_speed=252,  # Fastest average speed
        longest_straight=1000,
        elevation_change=19,
        optimal_front_wing_angle=20,
        optimal_rear_wing_angle=23,
        optimal_ride_height_front=13,
        optimal_ride_height_rear=15,
        drs_zones=3,
        surface_grip=0.88,
        bumpy_surface=False,
        fastest_quali_2024="1:27.472",
        fastest_race_2024="1:30.734"
    ),
    
    # Round 3
    "Australia": TrackConfig(
        name="Albert Park Circuit",
        circuit_length=5.278,
        corner_count=14,
        downforce_level=DownforceLevel.MEDIUM,
        average_speed=235,
        longest_straight=850,
        elevation_change=15,
        optimal_front_wing_angle=24,
        optimal_rear_wing_angle=27,
        optimal_ride_height_front=11,
        optimal_ride_height_rear=13,
        drs_zones=3,
        surface_grip=0.83,
        bumpy_surface=True,
        fastest_quali_2024="1:15.915",
        fastest_race_2024="1:20.235"
    ),
    
    # Round 4
    "Japan": TrackConfig(
        name="Suzuka International Racing Course",
        circuit_length=5.807,
        corner_count=18,
        downforce_level=DownforceLevel.MEDIUM,
        average_speed=221,
        longest_straight=700,
        elevation_change=40,
        optimal_front_wing_angle=25,
        optimal_rear_wing_angle=28,
        optimal_ride_height_front=10,
        optimal_ride_height_rear=12,
        drs_zones=2,
        surface_grip=0.90,
        bumpy_surface=False,
        fastest_quali_2024="1:28.197",
        fastest_race_2024="1:32.800"
    ),
    
    # Round 5
    "China": TrackConfig(
        name="Shanghai International Circuit",
        circuit_length=5.451,
        corner_count=16,
        downforce_level=DownforceLevel.MEDIUM,
        average_speed=205,
        longest_straight=1170,
        elevation_change=8,
        optimal_front_wing_angle=23,
        optimal_rear_wing_angle=26,
        optimal_ride_height_front=12,
        optimal_ride_height_rear=14,
        drs_zones=2,
        surface_grip=0.86,
        bumpy_surface=False,
        fastest_quali_2024="1:33.660",
        fastest_race_2024="1:37.275"
    ),
    
    # Round 6
    "Miami": TrackConfig(
        name="Miami International Autodrome",
        circuit_length=5.412,
        corner_count=19,
        downforce_level=DownforceLevel.MEDIUM,
        average_speed=223,
        longest_straight=1050,
        elevation_change=5,
        optimal_front_wing_angle=23,
        optimal_rear_wing_angle=26,
        optimal_ride_height_front=11,
        optimal_ride_height_rear=13,
        drs_zones=3,
        surface_grip=0.84,
        bumpy_surface=True,
        fastest_quali_2024="1:27.241",
        fastest_race_2024="1:30.567"
    ),
    
    # Round 7
    "Emilia Romagna": TrackConfig(
        name="Autodromo Enzo e Dino Ferrari (Imola)",
        circuit_length=4.909,
        corner_count=19,
        downforce_level=DownforceLevel.MEDIUM,
        average_speed=201,
        longest_straight=650,
        elevation_change=36,
        optimal_front_wing_angle=26,
        optimal_rear_wing_angle=29,
        optimal_ride_height_front=10,
        optimal_ride_height_rear=12,
        drs_zones=2,
        surface_grip=0.87,
        bumpy_surface=True,
        fastest_quali_2024="1:14.746",
        fastest_race_2024="1:17.945"
    ),
    
    # Round 8
    "Monaco": TrackConfig(
        name="Circuit de Monaco",
        circuit_length=3.337,
        corner_count=19,
        downforce_level=DownforceLevel.HIGH,  # Maximum downforce
        average_speed=162,  # Slowest track
        longest_straight=580,
        elevation_change=42,
        optimal_front_wing_angle=32,
        optimal_rear_wing_angle=37,
        optimal_ride_height_front=8,
        optimal_ride_height_rear=10,
        drs_zones=1,
        surface_grip=0.92,
        bumpy_surface=True,
        fastest_quali_2024="1:10.270",
        fastest_race_2024="1:12.909"
    ),
    
    # Round 9
    "Spain": TrackConfig(
        name="Circuit de Barcelona-Catalunya",
        circuit_length=4.657,
        corner_count=16,
        downforce_level=DownforceLevel.MEDIUM,
        average_speed=200,
        longest_straight=1047,
        elevation_change=38,
        optimal_front_wing_angle=24,
        optimal_rear_wing_angle=27,
        optimal_ride_height_front=11,
        optimal_ride_height_rear=13,
        drs_zones=2,
        surface_grip=0.89,
        bumpy_surface=False,
        fastest_quali_2024="1:11.403",
        fastest_race_2024="1:14.454"
    ),
    
    # Round 10
    "Canada": TrackConfig(
        name="Circuit Gilles Villeneuve",
        circuit_length=4.361,
        corner_count=14,
        downforce_level=DownforceLevel.LOW,
        average_speed=220,
        longest_straight=900,
        elevation_change=13,
        optimal_front_wing_angle=18,
        optimal_rear_wing_angle=21,
        optimal_ride_height_front=14,
        optimal_ride_height_rear=16,
        drs_zones=3,
        surface_grip=0.82,
        bumpy_surface=True,
        fastest_quali_2024="1:12.000",
        fastest_race_2024="1:15.500"
    ),
    
    # Round 11
    "Austria": TrackConfig(
        name="Red Bull Ring",
        circuit_length=4.318,
        corner_count=10,
        downforce_level=DownforceLevel.LOW,
        average_speed=235,
        longest_straight=710,
        elevation_change=65,  # Significant elevation
        optimal_front_wing_angle=19,
        optimal_rear_wing_angle=22,
        optimal_ride_height_front=13,
        optimal_ride_height_rear=15,
        drs_zones=3,
        surface_grip=0.88,
        bumpy_surface=False,
        fastest_quali_2024="1:04.314",
        fastest_race_2024="1:07.163"
    ),
    
    # Round 12
    "Great Britain": TrackConfig(
        name="Silverstone Circuit",
        circuit_length=5.891,
        corner_count=18,
        downforce_level=DownforceLevel.MEDIUM,
        average_speed=240,
        longest_straight=770,
        elevation_change=19,
        optimal_front_wing_angle=23,
        optimal_rear_wing_angle=26,
        optimal_ride_height_front=11,
        optimal_ride_height_rear=13,
        drs_zones=2,
        surface_grip=0.90,
        bumpy_surface=False,
        fastest_quali_2024="1:25.819",
        fastest_race_2024="1:28.780"
    ),
    
    # Round 13
    "Hungary": TrackConfig(
        name="Hungaroring",
        circuit_length=4.381,
        corner_count=14,
        downforce_level=DownforceLevel.HIGH,
        average_speed=195,
        longest_straight=650,
        elevation_change=33,
        optimal_front_wing_angle=30,
        optimal_rear_wing_angle=35,
        optimal_ride_height_front=9,
        optimal_ride_height_rear=11,
        drs_zones=2,
        surface_grip=0.85,
        bumpy_surface=False,
        fastest_quali_2024="1:15.227",
        fastest_race_2024="1:19.477"
    ),
    
    # Round 14
    "Belgium": TrackConfig(
        name="Circuit de Spa-Francorchamps",
        circuit_length=7.004,
        corner_count=19,
        downforce_level=DownforceLevel.LOW,  # Low drag setup
        average_speed=238,
        longest_straight=730,  # Kemmel Straight
        elevation_change=104,  # Most elevation change
        optimal_front_wing_angle=17,
        optimal_rear_wing_angle=20,
        optimal_ride_height_front=14,
        optimal_ride_height_rear=16,
        drs_zones=2,
        surface_grip=0.87,
        bumpy_surface=False,
        fastest_quali_2024="1:53.159",
        fastest_race_2024="1:56.196"
    ),
    
    # Round 15
    "Netherlands": TrackConfig(
        name="Circuit Zandvoort",
        circuit_length=4.259,
        corner_count=14,
        downforce_level=DownforceLevel.HIGH,
        average_speed=215,
        longest_straight=570,
        elevation_change=7,
        optimal_front_wing_angle=28,
        optimal_rear_wing_angle=32,
        optimal_ride_height_front=9,
        optimal_ride_height_rear=11,
        drs_zones=2,
        surface_grip=0.88,
        bumpy_surface=False,
        fastest_quali_2024="1:09.673",
        fastest_race_2024="1:13.047"
    ),
    
    # Round 16
    "Italy": TrackConfig(
        name="Autodromo Nazionale di Monza",
        circuit_length=5.793,
        corner_count=11,
        downforce_level=DownforceLevel.LOW,  # Lowest downforce track
        average_speed=264,  # Fastest track
        longest_straight=1150,  # Longest straight
        elevation_change=23,
        optimal_front_wing_angle=15,
        optimal_rear_wing_angle=18,
        optimal_ride_height_front=15,
        optimal_ride_height_rear=18,
        drs_zones=2,
        surface_grip=0.86,
        bumpy_surface=True,
        fastest_quali_2024="1:19.327",
        fastest_race_2024="1:22.234"
    ),
    
    # Round 17
    "Azerbaijan": TrackConfig(
        name="Baku City Circuit",
        circuit_length=6.003,
        corner_count=20,
        downforce_level=DownforceLevel.MEDIUM,
        average_speed=215,
        longest_straight=2200,  # Exceptionally long straight
        elevation_change=21,
        optimal_front_wing_angle=21,
        optimal_rear_wing_angle=24,
        optimal_ride_height_front=12,
        optimal_ride_height_rear=14,
        drs_zones=2,
        surface_grip=0.81,
        bumpy_surface=True,
        fastest_quali_2024="1:40.445",
        fastest_race_2024="1:43.009"
    ),
    
    # Round 18
    "Singapore": TrackConfig(
        name="Marina Bay Street Circuit",
        circuit_length=4.940,
        corner_count=19,
        downforce_level=DownforceLevel.HIGH,
        average_speed=172,
        longest_straight=800,
        elevation_change=18,
        optimal_front_wing_angle=31,
        optimal_rear_wing_angle=36,
        optimal_ride_height_front=8,
        optimal_ride_height_rear=10,
        drs_zones=3,
        surface_grip=0.79,
        bumpy_surface=True,
        fastest_quali_2024="1:29.525",
        fastest_race_2024="1:38.494"
    ),
    
    # Round 19
    "United States": TrackConfig(
        name="Circuit of The Americas",
        circuit_length=5.513,
        corner_count=20,
        downforce_level=DownforceLevel.MEDIUM,
        average_speed=215,
        longest_straight=1200,
        elevation_change=41,
        optimal_front_wing_angle=24,
        optimal_rear_wing_angle=27,
        optimal_ride_height_front=11,
        optimal_ride_height_rear=13,
        drs_zones=2,
        surface_grip=0.83,
        bumpy_surface=True,
        fastest_quali_2024="1:32.312",
        fastest_race_2024="1:36.042"
    ),
    
    # Round 20
    "Mexico": TrackConfig(
        name="Autódromo Hermanos Rodríguez",
        circuit_length=4.304,
        corner_count=17,
        downforce_level=DownforceLevel.HIGH,  # High altitude = less air density
        average_speed=198,
        longest_straight=900,
        elevation_change=12,
        optimal_front_wing_angle=29,
        optimal_rear_wing_angle=33,
        optimal_ride_height_front=10,
        optimal_ride_height_rear=12,
        drs_zones=3,
        surface_grip=0.82,
        bumpy_surface=True,
        fastest_quali_2024="1:15.946",
        fastest_race_2024="1:17.797"
    ),
    
    # Round 21
    "Brazil": TrackConfig(
        name="Autódromo José Carlos Pace (Interlagos)",
        circuit_length=4.309,
        corner_count=15,
        downforce_level=DownforceLevel.MEDIUM,
        average_speed=210,
        longest_straight=980,
        elevation_change=41,
        optimal_front_wing_angle=23,
        optimal_rear_wing_angle=26,
        optimal_ride_height_front=11,
        optimal_ride_height_rear=13,
        drs_zones=2,
        surface_grip=0.85,
        bumpy_surface=True,
        fastest_quali_2024="1:10.087",
        fastest_race_2024="1:13.011"
    ),
    
    # Round 22
    "Las Vegas": TrackConfig(
        name="Las Vegas Street Circuit",
        circuit_length=6.120,
        corner_count=17,
        downforce_level=DownforceLevel.LOW,
        average_speed=246,
        longest_straight=1900,
        elevation_change=6,
        optimal_front_wing_angle=18,
        optimal_rear_wing_angle=21,
        optimal_ride_height_front=13,
        optimal_ride_height_rear=15,
        drs_zones=2,
        surface_grip=0.80,
        bumpy_surface=True,
        fastest_quali_2024="1:32.312",
        fastest_race_2024="1:35.490"
    ),
    
    # Round 23
    "Qatar": TrackConfig(
        name="Losail International Circuit",
        circuit_length=5.380,
        corner_count=16,
        downforce_level=DownforceLevel.MEDIUM,
        average_speed=230,
        longest_straight=1068,
        elevation_change=10,
        optimal_front_wing_angle=23,
        optimal_rear_wing_angle=26,
        optimal_ride_height_front=12,
        optimal_ride_height_rear=14,
        drs_zones=2,
        surface_grip=0.88,
        bumpy_surface=False,
        fastest_quali_2024="1:20.520",
        fastest_race_2024="1:24.250"
    ),
    
    # Round 24 (Final)
    "Abu Dhabi": TrackConfig(
        name="Yas Marina Circuit",
        circuit_length=5.281,
        corner_count=16,
        downforce_level=DownforceLevel.MEDIUM,
        average_speed=195,
        longest_straight=1170,
        elevation_change=14,
        optimal_front_wing_angle=24,
        optimal_rear_wing_angle=27,
        optimal_ride_height_front=11,
        optimal_ride_height_rear=13,
        drs_zones=2,
        surface_grip=0.87,
        bumpy_surface=False,
        fastest_quali_2024="1:22.595",
        fastest_race_2024="1:26.103"
    ),
}


def get_track_by_name(track_name: str) -> Optional[TrackConfig]:
    """
    Get track configuration by name
    
    Args:
        track_name: Track name (partial match supported)
        
    Returns:
        TrackConfig or None
    """
    # Exact match
    if track_name in TRACK_CONFIGS:
        return TRACK_CONFIGS[track_name]
    
    # Partial match
    track_name_lower = track_name.lower()
    for key, config in TRACK_CONFIGS.items():
        if track_name_lower in key.lower() or track_name_lower in config.name.lower():
            return config
    
    return None


def get_all_track_names() -> list[str]:
    """Get list of all track names"""
    return list(TRACK_CONFIGS.keys())