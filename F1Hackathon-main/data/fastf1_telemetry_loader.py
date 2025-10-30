"""
FastF1 Telemetry Loader
Fetches REAL telemetry data from actual F1 races using FastF1 API
"""

import fastf1
import pandas as pd
import numpy as np
from typing import Dict, List, Tuple
import warnings
warnings.filterwarnings('ignore')

# Enable FastF1 cache for faster subsequent loads
fastf1.Cache.enable_cache('cache')


class FastF1TelemetryLoader:
    """Loads real F1 telemetry data using FastF1 API"""
    
    # Map our track names to FastF1 circuit names (2025 F1 Calendar)
    TRACK_MAPPING = {
        'Bahrain': 'Bahrain',
        'Saudi Arabia': 'Saudi Arabia',
        'Australia': 'Australia',
        'China': 'China',
        'Miami': 'Miami',
        'Imola': 'Imola',
        'Monaco': 'Monaco',
        'Barcelona': 'Spain',
        'Canada': 'Canada',
        'Austria': 'Austria',
        'Silverstone': 'Great Britain',
        'Hungary': 'Hungary',
        'Spa': 'Belgium',
        'Zandvoort': 'Netherlands',
        'Monza': 'Italy',
        'Azerbaijan': 'Azerbaijan',
        'Singapore': 'Singapore',
        'USA': 'United States',
        'Mexico': 'Mexico',
        'Brazil': 'Brazil',
        'Las Vegas': 'Las Vegas',
        'Qatar': 'Qatar',
        'Abu Dhabi': 'Abu Dhabi',
        'Suzuka': 'Japan'
    }
    
    # All 10 F1 Teams (2025 Grid)
    TEAM_MAPPING = {
        'Red Bull Racing': 'Red Bull Racing',
        'Ferrari': 'Ferrari',
        'Mercedes': 'Mercedes',
        'McLaren': 'McLaren',
        'Aston Martin': 'Aston Martin',
        'Alpine': 'Alpine',
        'Williams': 'Williams',
        'RB': 'RB',
        'Kick Sauber': 'Sauber',
        'Haas': 'Haas F1 Team'
    }
    
    # Try 2025 first, fall back to 2024
    YEAR = 2025
    FALLBACK_YEAR = 2024
    
    def __init__(self):
        """Initialize the telemetry loader"""
        print("🏎️  Initializing FastF1 Telemetry Loader...")
        
    def load_session(self, track_name: str, session_type: str = 'Q'):
        """
        Load a session from FastF1
        
        Args:
            track_name: Circuit name
            session_type: 'FP1', 'FP2', 'FP3', 'Q', 'R' (Qualifying or Race)
        """
        circuit = self.TRACK_MAPPING.get(track_name, track_name)
        
        # Try 2025 first
        try:
            print(f"  📡 Attempting {self.YEAR} {circuit} {session_type} session...")
            session = fastf1.get_session(self.YEAR, circuit, session_type)
            session.load()
            print(f"  ✅ Loaded {self.YEAR} session successfully!")
            return session
        except Exception as e2025:
            print(f"  ⚠️  2025 not available ({str(e2025)[:50]}...)")
            
            # Fall back to 2024
            try:
                print(f"  📡 Falling back to {self.FALLBACK_YEAR} {circuit}...")
                session = fastf1.get_session(self.FALLBACK_YEAR, circuit, session_type)
                session.load()
                print(f"  ✅ Loaded {self.FALLBACK_YEAR} session successfully!")
                return session
            except Exception as e2024:
                print(f"  ❌ Both 2025 and 2024 failed: {e2024}")
                return None
    
    def get_team_lap_telemetry(self, session, team_name: str):
        """Get the fastest lap telemetry for a specific team"""
        try:
            # Get laps for this team
            team_laps = session.laps.pick_team(team_name)
            
            # Get fastest lap
            fastest_lap = team_laps.pick_fastest()
            
            if fastest_lap is None:
                return None
            
            # Get telemetry for this lap
            telemetry = fastest_lap.get_telemetry()
            
            return {
                'lap': fastest_lap,
                'telemetry': telemetry,
                'lap_time': fastest_lap['LapTime'].total_seconds(),
                'driver': fastest_lap['Driver']
            }
            
        except Exception as e:
            print(f"  ⚠️  Error getting team telemetry: {e}")
            return None
    
    def analyze_corner_performance(self, telemetry_data: pd.DataFrame, corner_zones: List) -> Dict:
        """
        Analyze corner performance from real telemetry data
        
        Uses REAL speed data from actual F1 laps!
        """
        results = {
            'slow': [],
            'medium': [],
            'fast': []
        }
        
        try:
            # Get total lap distance
            total_distance = telemetry_data['Distance'].max()
            
            for zone in corner_zones:
                # Extract telemetry for this corner zone
                zone_telemetry = telemetry_data[
                    (telemetry_data['Distance'] >= zone.start_distance) &
                    (telemetry_data['Distance'] <= zone.end_distance)
                ]
                
                if len(zone_telemetry) > 0:
                    # Calculate MINIMUM speed through corner (most representative)
                    # This is the apex speed, which is what matters for corner performance
                    min_speed = zone_telemetry['Speed'].min()
                    avg_speed = zone_telemetry['Speed'].mean()
                    
                    # Use weighted average: 70% min (apex), 30% avg (entry/exit)
                    corner_speed = 0.7 * min_speed + 0.3 * avg_speed
                    
                    # Add to appropriate category
                    results[zone.corner_type].append(corner_speed)
            
            # Calculate overall averages for each corner type
            corner_speeds = {}
            for corner_type in ['slow', 'medium', 'fast']:
                if len(results[corner_type]) > 0:
                    corner_speeds[corner_type] = np.mean(results[corner_type])
                else:
                    # Fallback if no data
                    corner_speeds[corner_type] = {
                        'slow': 145,
                        'medium': 215,
                        'fast': 310
                    }[corner_type]
            
            return corner_speeds
            
        except Exception as e:
            print(f"  ⚠️  Error analyzing corners: {e}")
            return {'slow': 145, 'medium': 215, 'fast': 310}
    
    def get_all_teams_corner_performance(self, track_name: str) -> Dict:
        """
        Get corner performance for all teams using REAL FastF1 data
        
        This fetches actual telemetry from the most recent race!
        """
        print(f"\n🔬 FETCHING REAL TELEMETRY DATA - {track_name}")
        
        # Load session
        session = self.load_session(track_name, 'Q')  # Qualifying session
        
        if session is None:
            print("  ❌ Could not load session, using fallback data")
            return None
        
        # Import track definitions
        from analysis.track_definitions import get_track_definition
        track_def = get_track_definition(track_name)
        corner_zones = track_def['corner_zones']
        
        # All 10 teams to analyze
        teams = self.TEAM_MAPPING
        
        results = {}
        
        for team_display_name, team_fastf1_name in teams.items():
            print(f"  📊 Analyzing {team_display_name}...")
            
            # Get team telemetry
            team_data = self.get_team_lap_telemetry(session, team_fastf1_name)
            
            if team_data is None:
                print(f"    ⚠️  No data for {team_display_name}, using physics estimates")
                continue
            
            telemetry = team_data['telemetry']
            
            # Analyze corner performance from REAL telemetry
            corner_speeds = self.analyze_corner_performance(telemetry, corner_zones)
            
            results[team_display_name] = corner_speeds
            
            print(f"    ✅ {team_display_name}:")
            print(f"       Slow: {corner_speeds['slow']:.1f} km/h")
            print(f"       Medium: {corner_speeds['medium']:.1f} km/h")
            print(f"       Fast: {corner_speeds['fast']:.1f} km/h")
        
        return results
    
    def get_team_telemetry_summary(self, team_name: str, track_name: str) -> Dict:
        """
        Get comprehensive telemetry summary for a team at a specific track
        Returns average speeds, throttle usage, and performance metrics
        """
        print(f"\n📊 Loading telemetry summary for {team_name} at {track_name}")
        
        # Load session
        session = self.load_session(track_name, 'Q')
        if session is None:
            return None
        
        # Get team data
        team_fastf1_name = self.TEAM_MAPPING.get(team_name, team_name)
        team_data = self.get_team_lap_telemetry(session, team_fastf1_name)
        
        if team_data is None:
            return None
        
        telemetry = team_data['telemetry']
        
        # Calculate comprehensive statistics
        summary = {
            'avg_speed': telemetry['Speed'].mean(),
            'max_speed': telemetry['Speed'].max(),
            'min_speed': telemetry['Speed'].min(),
            'avg_throttle': telemetry['Throttle'].mean(),
            'avg_brake': telemetry['Brake'].mean(),
            'corner_speed': telemetry[telemetry['Throttle'] < 50]['Speed'].mean() if len(telemetry[telemetry['Throttle'] < 50]) > 0 else 0,
            'straight_speed': telemetry[telemetry['Throttle'] > 95]['Speed'].mean() if len(telemetry[telemetry['Throttle'] > 95]) > 0 else 0,
            'lap_time_seconds': team_data['lap_time']
        }
        
        print(f"   ✅ Summary loaded: Avg Speed={summary['avg_speed']:.1f} km/h, Max={summary['max_speed']:.1f}")
        
        return summary
    
    def get_sector_analysis(self, telemetry_data: pd.DataFrame) -> Dict:
        """
        Analyze telemetry by sectors
        Returns detailed speed, throttle, brake data
        """
        try:
            total_distance = telemetry_data['Distance'].max()
            sector_length = total_distance / 3
            
            sectors = {}
            
            for i in range(3):
                sector_start = i * sector_length
                sector_end = (i + 1) * sector_length
                
                sector_data = telemetry_data[
                    (telemetry_data['Distance'] >= sector_start) &
                    (telemetry_data['Distance'] < sector_end)
                ]
                
                sectors[f'sector_{i+1}'] = {
                    'avg_speed': sector_data['Speed'].mean(),
                    'max_speed': sector_data['Speed'].max(),
                    'min_speed': sector_data['Speed'].min(),
                    'avg_throttle': sector_data['Throttle'].mean(),
                    'full_throttle_pct': (sector_data['Throttle'] == 100).sum() / len(sector_data) * 100
                }
            
            return sectors
            
        except Exception as e:
            print(f"  ⚠️  Error in sector analysis: {e}")
            return {}
    
    def get_speed_trace(self, telemetry_data: pd.DataFrame, num_points: int = 100) -> List[Dict]:
        """
        Get speed trace along the lap
        Useful for visualization
        """
        try:
            # Downsample to num_points
            indices = np.linspace(0, len(telemetry_data) - 1, num_points, dtype=int)
            sampled = telemetry_data.iloc[indices]
            
            trace = []
            for _, row in sampled.iterrows():
                trace.append({
                    'distance': float(row['Distance']),
                    'speed': float(row['Speed']),
                    'throttle': float(row['Throttle']),
                    'brake': float(row['Brake'])
                })
            
            return trace
            
        except Exception as e:
            print(f"  ⚠️  Error getting speed trace: {e}")
            return []


# Singleton instance
_fastf1_loader = None

def get_fastf1_loader():
    """Get singleton FastF1 loader instance"""
    global _fastf1_loader
    if _fastf1_loader is None:
        _fastf1_loader = FastF1TelemetryLoader()
    return _fastf1_loader

