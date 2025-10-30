"""
Track Corner Type Definitions
Defines corner zones and characteristics for each F1 circuit
"""

from dataclasses import dataclass
from typing import List, Tuple

@dataclass
class CornerZone:
    """Represents a corner zone on the track"""
    start_distance: float  # meters
    end_distance: float    # meters
    corner_type: str      # 'slow', 'medium', 'fast'
    corner_number: int
    name: str
    ideal_speed: float    # km/h - ideal speed through this zone

# Track length in meters and corner definitions
TRACK_DEFINITIONS = {
    "Monza": {
        "length": 5793,
        "downforce_level": "very_low",
        "corner_zones": [
            # Chicane Variante del Rettifilo (Slow)
            CornerZone(500, 650, "slow", 1, "Variante del Rettifilo", 145),
            CornerZone(650, 750, "slow", 2, "Variante del Rettifilo", 148),
            
            # Curva Biassono (Medium)
            CornerZone(1200, 1350, "medium", 3, "Curva Biassono", 215),
            
            # Variante della Roggia (Slow)
            CornerZone(1850, 1950, "slow", 4, "Variante della Roggia", 150),
            CornerZone(1950, 2050, "slow", 5, "Variante della Roggia", 152),
            
            # Lesmo 1 (Fast)
            CornerZone(2400, 2550, "fast", 6, "Lesmo 1", 315),
            
            # Lesmo 2 (Fast)
            CornerZone(2700, 2850, "fast", 7, "Lesmo 2", 320),
            
            # Variante Ascari (Medium)
            CornerZone(3350, 3450, "medium", 8, "Variante Ascari", 218),
            CornerZone(3450, 3550, "medium", 9, "Variante Ascari", 220),
            CornerZone(3550, 3650, "medium", 10, "Variante Ascari", 222),
            
            # Parabolica (Fast)
            CornerZone(4200, 4500, "fast", 11, "Parabolica", 325),
        ]
    },
    
    "Silverstone": {
        "length": 5891,
        "downforce_level": "medium_high",
        "corner_zones": [
            # Abbey (Fast)
            CornerZone(350, 500, "fast", 1, "Abbey", 310),
            
            # Farm Curve (Fast)
            CornerZone(750, 900, "fast", 2, "Farm Curve", 315),
            
            # Village (Medium)
            CornerZone(1150, 1300, "medium", 3, "Village", 218),
            
            # The Loop (Slow)
            CornerZone(1600, 1750, "slow", 4, "The Loop", 142),
            
            # Aintree (Medium)
            CornerZone(2100, 2250, "medium", 5, "Aintree", 225),
            
            # Brooklands (Slow)
            CornerZone(2500, 2650, "slow", 6, "Brooklands", 145),
            
            # Luffield (Slow)
            CornerZone(2850, 3000, "slow", 7, "Luffield", 148),
            
            # Copse (Fast)
            CornerZone(3450, 3650, "fast", 8, "Copse", 320),
            
            # Maggotts (Fast)
            CornerZone(3950, 4150, "fast", 9, "Maggotts", 318),
            
            # Becketts (Fast)
            CornerZone(4200, 4400, "fast", 10, "Becketts", 315),
            
            # Chapel (Fast)
            CornerZone(4450, 4600, "fast", 11, "Chapel", 312),
            
            # Stowe (Medium)
            CornerZone(4950, 5100, "medium", 12, "Stowe", 220),
        ]
    },
    
    "Monaco": {
        "length": 3337,
        "downforce_level": "very_high",
        "corner_zones": [
            # Sainte Devote (Slow)
            CornerZone(180, 280, "slow", 1, "Sainte Devote", 140),
            
            # Massenet (Slow)
            CornerZone(450, 550, "slow", 2, "Massenet", 145),
            
            # Casino (Slow)
            CornerZone(600, 700, "slow", 3, "Casino", 142),
            
            # Mirabeau (Slow)
            CornerZone(850, 950, "slow", 4, "Mirabeau", 138),
            
            # Grand Hotel Hairpin (Slow)
            CornerZone(1050, 1180, "slow", 5, "Grand Hotel", 135),
            
            # Portier (Medium)
            CornerZone(1380, 1480, "medium", 6, "Portier", 210),
            
            # Tunnel (Fast)
            CornerZone(1650, 1900, "fast", 7, "Tunnel Exit", 305),
            
            # Nouvelle Chicane (Slow)
            CornerZone(2150, 2250, "slow", 8, "Nouvelle Chicane", 148),
            CornerZone(2250, 2350, "slow", 9, "Nouvelle Chicane", 150),
            
            # Tabac (Medium)
            CornerZone(2500, 2600, "medium", 10, "Tabac", 215),
            
            # Swimming Pool (Medium)
            CornerZone(2750, 2850, "medium", 11, "Swimming Pool", 212),
            CornerZone(2850, 2950, "medium", 12, "Swimming Pool", 214),
            
            # La Rascasse (Slow)
            CornerZone(3100, 3200, "slow", 13, "La Rascasse", 143),
        ]
    },
    
    "Spa": {
        "length": 7004,
        "downforce_level": "medium",
        "corner_zones": [
            # La Source (Slow)
            CornerZone(300, 450, "slow", 1, "La Source", 148),
            
            # Eau Rouge (Fast)
            CornerZone(850, 1100, "fast", 2, "Eau Rouge", 320),
            
            # Raidillon (Fast)
            CornerZone(1100, 1300, "fast", 3, "Raidillon", 325),
            
            # Les Combes (Medium)
            CornerZone(2100, 2250, "medium", 4, "Les Combes", 220),
            CornerZone(2250, 2400, "medium", 5, "Les Combes", 218),
            
            # Rivage (Slow)
            CornerZone(2850, 3000, "slow", 6, "Rivage", 152),
            
            # Pouhon (Fast)
            CornerZone(3400, 3650, "fast", 7, "Pouhon", 318),
            
            # Campus (Fast)
            CornerZone(4100, 4300, "fast", 8, "Campus", 315),
            
            # Stavelot (Fast)
            CornerZone(4900, 5100, "fast", 9, "Stavelot", 312),
            
            # Blanchimont (Fast)
            CornerZone(5650, 5900, "fast", 10, "Blanchimont", 322),
            
            # Bus Stop Chicane (Slow)
            CornerZone(6450, 6580, "slow", 11, "Bus Stop", 145),
            CornerZone(6580, 6700, "slow", 12, "Bus Stop", 150),
        ]
    },
    
    "Hungary": {
        "length": 4381,
        "downforce_level": "high",
        "corner_zones": [
            # Turn 1 (Medium)
            CornerZone(250, 400, "medium", 1, "Turn 1", 215),
            
            # Turn 2 (Slow)
            CornerZone(550, 680, "slow", 2, "Turn 2", 145),
            
            # Turn 3 (Slow)
            CornerZone(850, 980, "slow", 3, "Turn 3", 142),
            
            # Turn 4 (Slow)
            CornerZone(1150, 1280, "slow", 4, "Turn 4", 148),
            
            # Turn 5 (Slow)
            CornerZone(1450, 1580, "slow", 5, "Turn 5", 150),
            
            # Turn 6 (Medium)
            CornerZone(1750, 1900, "medium", 6, "Turn 6", 218),
            
            # Turn 7 (Medium)
            CornerZone(2050, 2200, "medium", 7, "Turn 7", 220),
            
            # Turn 8 (Slow)
            CornerZone(2400, 2530, "slow", 8, "Turn 8", 143),
            
            # Turn 9 (Medium)
            CornerZone(2700, 2850, "medium", 9, "Turn 9", 222),
            
            # Turn 10 (Medium)
            CornerZone(3000, 3150, "medium", 10, "Turn 10", 225),
            
            # Turn 11 (Slow)
            CornerZone(3350, 3480, "slow", 11, "Turn 11", 147),
            
            # Turn 12 (Fast)
            CornerZone(3650, 3850, "fast", 12, "Turn 12", 310),
            
            # Turn 13 (Medium)
            CornerZone(4000, 4150, "medium", 13, "Turn 13", 218),
            
            # Turn 14 (Slow)
            CornerZone(4250, 4350, "slow", 14, "Turn 14", 145),
        ]
    },
    
    "Suzuka": {
        "length": 5807,
        "downforce_level": "medium_high",
        "corner_zones": [
            # Turn 1 (Fast)
            CornerZone(350, 550, "fast", 1, "Turn 1", 315),
            
            # Turn 2 (Fast)
            CornerZone(700, 900, "fast", 2, "Turn 2", 318),
            
            # S Curves (Medium)
            CornerZone(1150, 1300, "medium", 3, "S Curves", 220),
            CornerZone(1300, 1450, "medium", 4, "S Curves", 218),
            CornerZone(1450, 1600, "medium", 5, "S Curves", 222),
            
            # Dunlop Curve (Fast)
            CornerZone(1900, 2100, "fast", 6, "Dunlop", 312),
            
            # Degner 1 (Medium)
            CornerZone(2350, 2500, "medium", 7, "Degner 1", 215),
            
            # Degner 2 (Fast)
            CornerZone(2600, 2800, "fast", 8, "Degner 2", 310),
            
            # Hairpin (Slow)
            CornerZone(3150, 3350, "slow", 9, "Hairpin", 140),
            
            # Spoon Curve (Fast)
            CornerZone(3750, 4050, "fast", 10, "Spoon", 320),
            
            # 130R (Fast)
            CornerZone(4800, 5100, "fast", 11, "130R", 325),
            
            # Casio Triangle (Slow)
            CornerZone(5450, 5580, "slow", 12, "Casio", 148),
            CornerZone(5580, 5700, "slow", 13, "Casio", 152),
        ]
    },
    
    # 2025 F1 CALENDAR - Additional Tracks
    
    "Bahrain": {
        "length": 5412,
        "downforce_level": "medium",
        "corner_zones": [
            CornerZone(300, 450, "medium", 1, "Turn 1", 215),
            CornerZone(850, 1000, "slow", 2, "Turn 2", 148),
            CornerZone(1200, 1350, "slow", 3, "Turn 3", 145),
            CornerZone(1650, 1800, "medium", 4, "Turn 4", 220),
            CornerZone(2350, 2550, "fast", 5, "Turn 5-6", 318),
            CornerZone(3100, 3250, "medium", 6, "Turn 8", 218),
            CornerZone(3750, 3900, "slow", 7, "Turn 10", 142),
            CornerZone(4450, 4650, "medium", 8, "Turn 11-12", 222),
            CornerZone(5050, 5250, "slow", 9, "Turn 13-14", 150),
        ]
    },
    
    "Saudi Arabia": {
        "length": 6174,
        "downforce_level": "medium",
        "corner_zones": [
            CornerZone(400, 600, "fast", 1, "Turn 1", 320),
            CornerZone(1100, 1300, "fast", 2, "Turn 4-5", 315),
            CornerZone(2200, 2400, "medium", 3, "Turn 10-11", 220),
            CornerZone(3350, 3550, "fast", 4, "Turn 13", 325),
            CornerZone(4200, 4400, "slow", 5, "Turn 17", 145),
            CornerZone(5100, 5300, "medium", 6, "Turn 22-23", 218),
            CornerZone(5850, 6050, "fast", 7, "Turn 26-27", 312),
        ]
    },
    
    "Australia": {
        "length": 5278,
        "downforce_level": "medium_high",
        "corner_zones": [
            CornerZone(350, 500, "medium", 1, "Turn 1", 218),
            CornerZone(850, 1000, "medium", 2, "Turn 3", 215),
            CornerZone(1450, 1600, "slow", 3, "Turn 6", 148),
            CornerZone(2150, 2350, "fast", 4, "Turn 9-10", 315),
            CornerZone(2900, 3050, "slow", 5, "Turn 11-12", 142),
            CornerZone(3650, 3850, "medium", 6, "Turn 13", 222),
            CornerZone(4450, 4650, "fast", 7, "Turn 15", 318),
        ]
    },
    
    "Miami": {
        "length": 5410,
        "downforce_level": "medium",
        "corner_zones": [
            CornerZone(400, 550, "slow", 1, "Turn 1", 150),
            CornerZone(1100, 1300, "medium", 2, "Turn 5-7", 220),
            CornerZone(2200, 2400, "slow", 3, "Turn 11", 145),
            CornerZone(3100, 3300, "medium", 4, "Turn 13-14", 215),
            CornerZone(4050, 4250, "fast", 5, "Turn 16-17", 312),
        ]
    },
    
    "Imola": {
        "length": 4909,
        "downforce_level": "medium_high",
        "corner_zones": [
            CornerZone(300, 450, "slow", 1, "Tamburello", 148),
            CornerZone(950, 1100, "fast", 2, "Villeneuve", 315),
            CornerZone(1650, 1800, "slow", 3, "Tosa", 142),
            CornerZone(2450, 2650, "medium", 4, "Piratella", 220),
            CornerZone(3250, 3450, "fast", 5, "Acque Minerali", 318),
            CornerZone(4150, 4350, "slow", 6, "Variante Alta", 150),
        ]
    },
    
    "Barcelona": {
        "length": 4675,
        "downforce_level": "high",
        "corner_zones": [
            CornerZone(300, 450, "slow", 1, "Turn 1", 145),
            CornerZone(850, 1000, "fast", 2, "Turn 3", 315),
            CornerZone(1550, 1750, "medium", 3, "Turn 5-6", 222),
            CornerZone(2350, 2500, "fast", 4, "Turn 9", 320),
            CornerZone(3150, 3300, "slow", 5, "Turn 10", 148),
            CornerZone(3950, 4150, "medium", 6, "Turn 12-13", 218),
        ]
    },
    
    "Austria": {
        "length": 4318,
        "downforce_level": "low",
        "corner_zones": [
            CornerZone(300, 450, "medium", 1, "Turn 1", 220),
            CornerZone(1050, 1200, "slow", 2, "Turn 3", 150),
            CornerZone(1850, 2050, "fast", 3, "Turn 4-5", 325),
            CornerZone(2750, 2900, "medium", 4, "Turn 7", 215),
            CornerZone(3550, 3750, "fast", 5, "Turn 9-10", 318),
        ]
    },
    
    "Canada": {
        "length": 4361,
        "downforce_level": "low",
        "corner_zones": [
            CornerZone(300, 450, "slow", 1, "Turn 1-2", 145),
            CornerZone(1100, 1250, "slow", 2, "Turn 3-4", 148),
            CornerZone(1950, 2100, "slow", 3, "Turn 6-7", 142),
            CornerZone(2750, 2900, "slow", 4, "Turn 8-9", 150),
            CornerZone(3550, 3700, "slow", 5, "Turn 10", 145),
            CornerZone(4050, 4200, "medium", 6, "Turn 13-14", 215),
        ]
    },
    
    "Singapore": {
        "length": 4940,
        "downforce_level": "very_high",
        "corner_zones": [
            CornerZone(300, 450, "slow", 1, "Turn 1-2", 142),
            CornerZone(1050, 1200, "slow", 2, "Turn 5", 145),
            CornerZone(1850, 2000, "medium", 3, "Turn 7-8", 215),
            CornerZone(2650, 2800, "slow", 4, "Turn 10", 148),
            CornerZone(3450, 3600, "medium", 5, "Turn 14", 220),
            CornerZone(4250, 4400, "slow", 6, "Turn 18-19", 140),
        ]
    },
    
    "Zandvoort": {
        "length": 4259,
        "downforce_level": "high",
        "corner_zones": [
            CornerZone(300, 450, "medium", 1, "Turn 1", 218),
            CornerZone(950, 1100, "slow", 2, "Turn 3", 148),
            CornerZone(1650, 1850, "fast", 3, "Hugenholtz", 315),
            CornerZone(2450, 2600, "medium", 4, "Turn 9", 220),
            CornerZone(3250, 3400, "fast", 5, "Turn 11-12", 312),
            CornerZone(3950, 4100, "slow", 6, "Turn 14", 145),
        ]
    },
    
    "Las Vegas": {
        "length": 6120,
        "downforce_level": "low",
        "corner_zones": [
            CornerZone(450, 600, "slow", 1, "Turn 1-2", 150),
            CornerZone(2200, 2350, "slow", 2, "Turn 5-6", 148),
            CornerZone(3850, 4000, "slow", 3, "Turn 9-10", 145),
            CornerZone(5450, 5600, "medium", 4, "Turn 14", 218),
        ]
    },
    
    "Brazil": {
        "length": 4309,
        "downforce_level": "medium_high",
        "corner_zones": [
            CornerZone(300, 450, "slow", 1, "Senna S", 145),
            CornerZone(850, 1000, "slow", 2, "Senna S", 148),
            CornerZone(1550, 1700, "medium", 3, "Turn 4", 220),
            CornerZone(2250, 2400, "fast", 4, "Turn 6-7", 315),
            CornerZone(2950, 3100, "slow", 5, "Turn 8", 142),
            CornerZone(3650, 3850, "fast", 6, "Turn 12", 318),
        ]
    },
    
    "Qatar": {
        "length": 5380,
        "downforce_level": "medium",
        "corner_zones": [
            CornerZone(400, 550, "medium", 1, "Turn 1", 220),
            CornerZone(1200, 1400, "fast", 2, "Turn 4-5", 318),
            CornerZone(2100, 2250, "medium", 3, "Turn 6", 215),
            CornerZone(3050, 3250, "fast", 4, "Turn 12-13", 315),
            CornerZone(4150, 4300, "slow", 5, "Turn 14", 148),
            CornerZone(4950, 5150, "medium", 6, "Turn 16", 222),
        ]
    },
    
    "Abu Dhabi": {
        "length": 5281,
        "downforce_level": "medium_high",
        "corner_zones": [
            CornerZone(350, 500, "medium", 1, "Turn 1", 218),
            CornerZone(1100, 1250, "slow", 2, "Turn 5-6", 145),
            CornerZone(1900, 2100, "fast", 3, "Turn 8-9", 315),
            CornerZone(2750, 2900, "slow", 4, "Turn 11", 148),
            CornerZone(3600, 3800, "medium", 5, "Turn 14-15", 220),
            CornerZone(4450, 4650, "fast", 6, "Turn 17-18", 312),
        ]
    },
    
    # Additional 2025 Tracks to Complete 24-Race Calendar
    
    "China": {
        "length": 5451,
        "downforce_level": "medium",
        "corner_zones": [
            CornerZone(350, 500, "slow", 1, "Turn 1", 148),
            CornerZone(1100, 1400, "fast", 2, "Turn 3-4", 318),
            CornerZone(2150, 2300, "medium", 3, "Turn 6", 220),
            CornerZone(3100, 3250, "slow", 4, "Turn 8", 145),
            CornerZone(4050, 4250, "medium", 5, "Turn 11-12", 215),
            CornerZone(4950, 5150, "fast", 6, "Turn 13-14", 312),
        ]
    },
    
    "Azerbaijan": {
        "length": 6003,
        "downforce_level": "medium",
        "corner_zones": [
            CornerZone(400, 550, "slow", 1, "Turn 1-2", 142),
            CornerZone(1200, 1350, "slow", 2, "Turn 3", 148),
            CornerZone(2100, 2250, "medium", 3, "Turn 7-8", 218),
            CornerZone(3200, 3400, "slow", 4, "Turn 15-16", 145),
            CornerZone(4300, 4500, "fast", 5, "Turn 20", 328),
            CornerZone(5450, 5800, "fast", 6, "Main Straight", 330),
        ]
    },
    
    "USA": {
        "length": 5513,
        "downforce_level": "medium_high",
        "corner_zones": [
            CornerZone(350, 550, "slow", 1, "Turn 1", 150),
            CornerZone(1150, 1350, "medium", 2, "Turn 3-6", 220),
            CornerZone(2200, 2400, "fast", 3, "Turn 9", 318),
            CornerZone(3150, 3300, "slow", 4, "Turn 11", 142),
            CornerZone(4100, 4300, "medium", 5, "Turn 16-18", 222),
            CornerZone(5050, 5300, "fast", 6, "Turn 19", 315),
        ]
    },
    
    "Mexico": {
        "length": 4304,
        "downforce_level": "medium_high",
        "corner_zones": [
            CornerZone(300, 450, "slow", 1, "Turn 1", 145),
            CornerZone(950, 1100, "medium", 2, "Turn 3-4", 218),
            CornerZone(1650, 1850, "fast", 3, "Turn 6-7", 315),
            CornerZone(2450, 2600, "slow", 4, "Turn 8-9", 148),
            CornerZone(3250, 3450, "medium", 5, "Turn 12", 220),
            CornerZone(3950, 4150, "fast", 6, "Turn 16-17", 312),
        ]
    },
}

def get_track_definition(track_name: str) -> dict:
    """Get track definition by name"""
    return TRACK_DEFINITIONS.get(track_name, TRACK_DEFINITIONS["Monza"])

def get_corner_zones_by_type(track_name: str, corner_type: str) -> List[CornerZone]:
    """Get all corner zones of a specific type for a track"""
    track = get_track_definition(track_name)
    return [zone for zone in track["corner_zones"] if zone.corner_type == corner_type]

def get_all_corner_types(track_name: str) -> dict:
    """Get all corner zones grouped by type"""
    track = get_track_definition(track_name)
    result = {"slow": [], "medium": [], "fast": []}
    
    for zone in track["corner_zones"]:
        result[zone.corner_type].append(zone)
    
    return result

