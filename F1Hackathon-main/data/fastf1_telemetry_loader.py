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
        'Racing Bulls': 'RB',
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
            
            if len(team_laps) == 0:
                return None
            
            # Get fastest lap
            fastest_lap = team_laps.pick_fastest()
            
            if fastest_lap is None:
                return None
            
            # Get telemetry for this lap
            telemetry = fastest_lap.get_telemetry()
            
            if telemetry is None or len(telemetry) == 0:
                return None
            
            # Calculate lap time
            lap_time_seconds = 0
            if hasattr(fastest_lap['LapTime'], 'total_seconds'):
                lap_time_seconds = fastest_lap['LapTime'].total_seconds()
            elif isinstance(fastest_lap['LapTime'], pd.Timedelta):
                lap_time_seconds = fastest_lap['LapTime'].total_seconds()
            
            return {
                'lap': fastest_lap,
                'telemetry': telemetry,
                'lap_time': lap_time_seconds,
                'driver': fastest_lap['Driver']
            }
            
        except Exception as e:
            # Try to get more specific error info
            error_msg = str(e)
            if 'pick_team' in error_msg or 'team' in error_msg.lower():
                # Team name might not match exactly, this is expected for some teams
                pass
            else:
                print(f"  ⚠️  Error getting team telemetry for {team_name}: {error_msg[:100]}")
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
                # Note: Corner zones might be wide (entry to exit), but we need the APEX
                zone_telemetry = telemetry_data[
                    (telemetry_data['Distance'] >= zone.start_distance) &
                    (telemetry_data['Distance'] <= zone.end_distance)
                ]
                
                if len(zone_telemetry) == 0:
                    continue
                
                # Narrow down to the actual corner apex region
                # The apex is typically in the middle 40% of the corner zone
                zone_width = zone.end_distance - zone.start_distance
                apex_start = zone.start_distance + zone_width * 0.3  # Start of apex region
                apex_end = zone.start_distance + zone_width * 0.7     # End of apex region
                
                # Extract apex region telemetry (where minimum speed occurs)
                apex_telemetry = telemetry_data[
                    (telemetry_data['Distance'] >= apex_start) &
                    (telemetry_data['Distance'] <= apex_end)
                ]
                
                # Use apex region if it has data, otherwise use full zone
                corner_telemetry = apex_telemetry if len(apex_telemetry) > 0 else zone_telemetry
                
                if len(corner_telemetry) > 0:
                    # FastF1 Speed is in km/h already
                    # For corner analysis, we need the APEX speed (minimum speed in corner zone)
                    # This represents the slowest point where the car is turning most
                    
                    # Get all speeds in the apex region
                    zone_speeds = corner_telemetry['Speed'].values
                    
                    # Remove any invalid speeds (negative, zero, or unreasonably high)
                    valid_speeds = zone_speeds[(zone_speeds > 0) & (zone_speeds < 400)]
                    
                    if len(valid_speeds) > 0:
                        # APEX SPEED = Minimum speed in the corner zone (true cornering speed)
                        apex_speed = float(np.min(valid_speeds))
                        
                        # For different corner types, use appropriate calculation:
                        # - Slow corners: Use apex speed directly (minimum speed)
                        # - Medium/Fast: Use 5th percentile (very close to apex) to avoid outliers
                        
                        if zone.corner_type == 'slow':
                            # Slow corners: Use true apex (minimum)
                            corner_speed = apex_speed
                        elif zone.corner_type == 'medium':
                            # Medium corners: Use 5th percentile (very close to apex)
                            # This gives us the speed at the tightest point while avoiding braking artifacts
                            percentile_5 = float(np.percentile(valid_speeds, 5))
                            corner_speed = min(apex_speed * 1.05, percentile_5)  # Use lower of the two
                        else:  # fast
                            # Fast corners: Use 10th percentile (slightly higher than apex due to high speeds)
                            percentile_10 = float(np.percentile(valid_speeds, 10))
                            corner_speed = min(apex_speed * 1.08, percentile_10)
                        
                        # Validate realistic ranges before adding
                        if corner_speed > 0 and corner_speed < 400:
                            results[zone.corner_type].append(corner_speed)
            
            # Calculate overall averages for each corner type
            # Each value in results[corner_type] is the APEX speed (minimum) for one corner
            # We average these apex speeds to get average apex speed for that corner type
            corner_speeds = {}
            for corner_type in ['slow', 'medium', 'fast']:
                if len(results[corner_type]) > 0:
                    # Get valid apex speeds for this corner type
                    valid_speeds = [s for s in results[corner_type] if s > 0]
                    
                    if len(valid_speeds) > 0:
                        # Average of apex speeds (real cornering performance)
                        avg_apex_speed = np.mean(valid_speeds)
                        
                        # Realistic F1 apex speed ranges (from actual telemetry):
                        # - Slow corners: 40-110 km/h apex 
                        #   * Monaco hairpin: ~50-70 km/h
                        #   * Tight chicanes: ~60-85 km/h
                        #   * General slow: ~70-100 km/h
                        # - Medium corners: 90-180 km/h apex
                        #   * Typical medium: ~100-150 km/h
                        #   * Faster medium: ~130-180 km/h
                        # - Fast corners: 180-320 km/h apex
                        #   * Spa Eau Rouge: ~280-310 km/h
                        #   * Copse, Lesmo: ~250-300 km/h
                        
                        # Use real telemetry data directly - don't reject valid low speeds!
                        # Track-specific variations are expected (Monaco vs Monza)
                        
                        if corner_type == 'slow':
                            # Accept any realistic slow corner speed (even very low for tight corners)
                            if 30 <= avg_apex_speed <= 120:
                                corner_speeds[corner_type] = avg_apex_speed
                            else:
                                # Out of range, try median
                                median_speed = np.median(valid_speeds)
                                if 30 <= median_speed <= 120:
                                    corner_speeds[corner_type] = median_speed
                                else:
                                    # Use raw average anyway - trust the telemetry
                                    corner_speeds[corner_type] = avg_apex_speed
                        elif corner_type == 'medium':
                            # Accept medium corner speeds (can overlap with slow/fast)
                            if 70 <= avg_apex_speed <= 200:
                                corner_speeds[corner_type] = avg_apex_speed
                            else:
                                # Try median or use raw value
                                median_speed = np.median(valid_speeds)
                                if 70 <= median_speed <= 200:
                                    corner_speeds[corner_type] = median_speed
                                else:
                                    corner_speeds[corner_type] = avg_apex_speed
                        else:  # fast
                            # Accept fast corner speeds
                            if 150 <= avg_apex_speed <= 330:
                                corner_speeds[corner_type] = avg_apex_speed
                            else:
                                # Try median or use raw value
                                median_speed = np.median(valid_speeds)
                                if 150 <= median_speed <= 330:
                                    corner_speeds[corner_type] = median_speed
                                else:
                                    corner_speeds[corner_type] = avg_apex_speed
                    else:
                        corner_speeds[corner_type] = None
                else:
                    # No data for this corner type - return None to indicate missing data
                    corner_speeds[corner_type] = None
            
            # Validate we have at least one valid corner type
            valid_types = [ct for ct in corner_speeds if corner_speeds[ct] is not None]
            if len(valid_types) == 0:
                # No valid data at all - this indicates telemetry issue
                return None
            
            return corner_speeds
            
        except Exception as e:
            print(f"  ⚠️  Error analyzing corners: {e}")
            # Return None instead of fallback values to indicate error
            return None
    
    def get_all_teams_corner_performance(self, track_name: str) -> Dict:
        """
        Get corner performance for all teams using REAL FastF1 data
        
        This fetches actual telemetry from the most recent race!
        Tries qualifying first, then race session if qualifying fails.
        For each team, tries both drivers if available.
        
        IMPORTANT: This fetches TRACK-SPECIFIC data for each track!
        """
        print(f"\n🔬 FETCHING REAL TELEMETRY DATA FOR TRACK: {track_name}")
        print(f"  📍 Track-specific analysis - each track has unique corner characteristics")
        
        # Try qualifying session first
        session = self.load_session(track_name, 'Q')  # Qualifying session
        
        # If qualifying fails, try race session
        if session is None:
            print("  ⚠️  Qualifying session not available, trying Race session...")
            session = self.load_session(track_name, 'R')  # Race session
        
        if session is None:
            print(f"  ❌ Could not load any session for {track_name}")
            print(f"     → This track might not have FastF1 data available")
            return None
        
        # Log track-specific info
        print(f"  ✅ Session loaded for {track_name}")
        print(f"     Event: {session.event['EventName'] if hasattr(session, 'event') else 'Unknown'}")
        print(f"     Year: {session.event.get('EventDate', 'Unknown').year if hasattr(session.event, 'get') else 'Unknown'}")
        
        # Import track definitions
        from analysis.track_definitions import get_track_definition
        track_def = get_track_definition(track_name)
        
        if track_def is None:
            print(f"  ❌ No track definition found for {track_name}")
            return None
            
        corner_zones = track_def['corner_zones']
        print(f"  📊 Analyzing {len(corner_zones)} corner zones for {track_name}")
        print(f"     Slow corners: {len([z for z in corner_zones if z.corner_type == 'slow'])}")
        print(f"     Medium corners: {len([z for z in corner_zones if z.corner_type == 'medium'])}")
        print(f"     Fast corners: {len([z for z in corner_zones if z.corner_type == 'fast'])}")
        
        # All 10 teams to analyze
        teams = self.TEAM_MAPPING
        
        results = {}
        
        for team_display_name, team_fastf1_name in teams.items():
            print(f"  📊 Analyzing {team_display_name}...")
            
            # Try to get team telemetry
            team_data = self.get_team_lap_telemetry(session, team_fastf1_name)
            
            # If team not found, try alternative team name or try both drivers
            if team_data is None:
                # Try alternative team names
                alternative_names = {
                    'RB': 'Racing Bulls',
                    'Racing Bulls': 'RB',
                    'Sauber': 'Kick Sauber',
                    'Kick Sauber': 'Sauber'
                }
                
                if team_fastf1_name in alternative_names:
                    alt_name = alternative_names[team_fastf1_name]
                    print(f"    🔄 Trying alternative name: {alt_name}")
                    team_data = self.get_team_lap_telemetry(session, alt_name)
                
                # If still None, try to get any driver data from this team
                if team_data is None:
                    try:
                        # Get all drivers for this team
                        team_laps = session.laps
                        if hasattr(session.laps, 'pick_team'):
                            team_laps_filtered = session.laps.pick_team(team_fastf1_name)
                            if len(team_laps_filtered) > 0:
                                fastest_lap = team_laps_filtered.pick_fastest()
                                if fastest_lap is not None:
                                    telemetry = fastest_lap.get_telemetry()
                                    team_data = {
                                        'lap': fastest_lap,
                                        'telemetry': telemetry,
                                        'lap_time': fastest_lap['LapTime'].total_seconds() if hasattr(fastest_lap['LapTime'], 'total_seconds') else 0,
                                        'driver': fastest_lap['Driver']
                                    }
                    except Exception as e:
                        print(f"    ⚠️  Error getting team data: {e}")
            
            if team_data is None:
                print(f"    ⚠️  No telemetry data available for {team_display_name}")
                continue
            
            telemetry = team_data['telemetry']
            
            # Validate telemetry has required columns
            if 'Speed' not in telemetry.columns or 'Distance' not in telemetry.columns:
                print(f"    ⚠️  Telemetry missing required columns for {team_display_name}")
                continue
            
            # Analyze corner performance from REAL telemetry
            corner_speeds = self.analyze_corner_performance(telemetry, corner_zones)
            
            if corner_speeds is None:
                print(f"    ⚠️  Failed to analyze corner performance for {team_display_name}")
                continue
            
            # Check we have valid data for all corner types
            valid_corner_types = [ct for ct in ['slow', 'medium', 'fast'] if corner_speeds.get(ct) is not None and corner_speeds.get(ct) > 0]
            
            if len(valid_corner_types) < 2:
                print(f"    ⚠️  Insufficient corner data for {team_display_name} (only {len(valid_corner_types)} corner types)")
                continue
            
            # Use real data where available, fill missing with calculated estimates if needed
            final_corner_speeds = {}
            for ct in ['slow', 'medium', 'fast']:
                if corner_speeds.get(ct) is not None and corner_speeds.get(ct) > 0:
                    final_corner_speeds[ct] = float(corner_speeds[ct])
                else:
                    # Missing corner type - estimate from track definition
                    # This is better than using fallback values
                    corner_zones_for_type = [z for z in corner_zones if z.corner_type == ct]
                    if len(corner_zones_for_type) > 0:
                        # Use average ideal speed from track definition as estimate
                        avg_ideal = np.mean([z.ideal_speed for z in corner_zones_for_type])
                        final_corner_speeds[ct] = float(avg_ideal)
                        print(f"    📊 {ct.capitalize()} estimated from track definition: {avg_ideal:.1f} km/h")
            
            if len(final_corner_speeds) == 3:
                results[team_display_name] = final_corner_speeds
                
                print(f"    ✅ {team_display_name} on {track_name}:")
                print(f"       Slow: {final_corner_speeds['slow']:.1f} km/h (track-specific)")
                print(f"       Medium: {final_corner_speeds['medium']:.1f} km/h (track-specific)")
                print(f"       Fast: {final_corner_speeds['fast']:.1f} km/h (track-specific)")
            else:
                print(f"    ⚠️  Incomplete corner data for {team_display_name} (missing {3 - len(final_corner_speeds)} types)")
        
        if len(results) == 0:
            print(f"  ❌ No valid data retrieved for any team on {track_name}")
            print(f"     This track might need Fallback to physics calculations")
            return None
            
        print(f"\n  ✅ Successfully fetched TRACK-SPECIFIC data for {len(results)}/{len(teams)} teams on {track_name}")
        print(f"     Each team's speeds are unique to this track's characteristics")
        
        # Log speed variance to show track-specific differences
        if len(results) > 0:
            slow_values = [results[t]['slow'] for t in results]
            medium_values = [results[t]['medium'] for t in results]
            fast_values = [results[t]['fast'] for t in results]
            print(f"\n  📊 {track_name} Speed Ranges:")
            print(f"     Slow: {min(slow_values):.1f} - {max(slow_values):.1f} km/h (range: {max(slow_values)-min(slow_values):.1f})")
            print(f"     Medium: {min(medium_values):.1f} - {max(medium_values):.1f} km/h (range: {max(medium_values)-min(medium_values):.1f})")
            print(f"     Fast: {min(fast_values):.1f} - {max(fast_values):.1f} km/h (range: {max(fast_values)-min(fast_values):.1f})")
        
        return results
    
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

