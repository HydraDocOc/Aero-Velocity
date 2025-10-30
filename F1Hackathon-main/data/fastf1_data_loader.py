"""
FastF1 Data Integration Module
Fetches real telemetry, lap times, and session data for all teams and tracks
"""
import fastf1
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

from config.settings import FASTF1_CACHE_DIR, CURRENT_SEASON, F1_TEAMS

# Enable FastF1 cache
fastf1.Cache.enable_cache(FASTF1_CACHE_DIR)


class FastF1DataLoader:
    """
    Loads real F1 data using FastF1 API
    """
    
    def __init__(self, season: int = CURRENT_SEASON):
        self.season = season
        self.cache = {}
    
    def get_session(self, event_name: str, session_type: str = 'R') -> Optional[fastf1.core.Session]:
        """
        Load F1 session
        
        Args:
            event_name: Race name (e.g., 'Monaco', 'Silverstone')
            session_type: 'R' (Race), 'Q' (Qualifying), 'FP1', 'FP2', 'FP3', 'S' (Sprint)
            
        Returns:
            FastF1 Session object
        """
        cache_key = f"{self.season}_{event_name}_{session_type}"
        
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        try:
            session = fastf1.get_session(self.season, event_name, session_type)
            session.load()
            self.cache[cache_key] = session
            return session
        except Exception as e:
            print(f"Error loading session {event_name} {session_type}: {e}")
            return None
    
    def get_fastest_lap(self, event_name: str, team_name: str, session_type: str = 'Q') -> Optional[pd.Series]:
        """
        Get fastest lap for a team
        
        Args:
            event_name: Race name
            team_name: Team name
            session_type: Session type
            
        Returns:
            Fastest lap data
        """
        session = self.get_session(event_name, session_type)
        
        if session is None:
            return None
        
        try:
            laps = session.laps
            team_laps = laps[laps['Team'] == team_name]
            
            if team_laps.empty:
                return None
            
            fastest = team_laps.loc[team_laps['LapTime'].idxmin()]
            return fastest
        except Exception as e:
            print(f"Error getting fastest lap: {e}")
            return None
    
    def get_lap_telemetry(self, event_name: str, team_name: str, lap_number: Optional[int] = None) -> Optional[pd.DataFrame]:
        """
        Get detailed telemetry for a specific lap
        
        Args:
            event_name: Race name
            team_name: Team name
            lap_number: Specific lap (None for fastest)
            
        Returns:
            Telemetry dataframe with Speed, Throttle, Brake, DRS, etc.
        """
        session = self.get_session(event_name, 'Q')
        
        if session is None:
            return None
        
        try:
            laps = session.laps
            team_laps = laps[laps['Team'] == team_name]
            
            if team_laps.empty:
                return None
            
            if lap_number:
                lap = team_laps[team_laps['LapNumber'] == lap_number].iloc[0]
            else:
                lap = team_laps.loc[team_laps['LapTime'].idxmin()]
            
            telemetry = lap.get_telemetry()
            return telemetry
        except Exception as e:
            print(f"Error getting telemetry: {e}")
            return None
    
    def get_speed_data(self, event_name: str, team_name: str) -> Dict[str, float]:
        """
        Extract speed statistics from telemetry
        
        Args:
            event_name: Race name
            team_name: Team name
            
        Returns:
            Dictionary with speed metrics
        """
        telemetry = self.get_lap_telemetry(event_name, team_name)
        
        if telemetry is None or telemetry.empty:
            return {
                'max_speed': 0,
                'avg_speed': 0,
                'min_speed': 0,
                'speed_variance': 0
            }
        
        try:
            speeds = telemetry['Speed'].values
            
            return {
                'max_speed': float(np.max(speeds)),
                'avg_speed': float(np.mean(speeds)),
                'min_speed': float(np.min(speeds[speeds > 0])),
                'speed_variance': float(np.var(speeds))
            }
        except Exception as e:
            print(f"Error extracting speed data: {e}")
            return {'max_speed': 0, 'avg_speed': 0, 'min_speed': 0, 'speed_variance': 0}
    
    def get_drs_usage(self, event_name: str, team_name: str) -> Dict[str, float]:
        """
        Analyze DRS usage from telemetry
        
        Args:
            event_name: Race name
            team_name: Team name
            
        Returns:
            DRS usage statistics
        """
        telemetry = self.get_lap_telemetry(event_name, team_name)
        
        if telemetry is None or telemetry.empty:
            return {'drs_percentage': 0, 'drs_activations': 0}
        
        try:
            drs = telemetry['DRS'].values
            total_points = len(drs)
            drs_active_points = np.sum(drs > 0)
            
            # Count DRS activations (transitions from 0 to >0)
            drs_activations = np.sum(np.diff(drs > 0).astype(int) > 0)
            
            return {
                'drs_percentage': (drs_active_points / total_points * 100) if total_points > 0 else 0,
                'drs_activations': int(drs_activations)
            }
        except Exception as e:
            print(f"Error analyzing DRS usage: {e}")
            return {'drs_percentage': 0, 'drs_activations': 0}
    
    def get_corner_speeds(self, event_name: str, team_name: str, num_corners: int = 10) -> List[float]:
        """
        Extract average speeds through corners
        
        Args:
            event_name: Race name
            team_name: Team name
            num_corners: Number of corners to analyze
            
        Returns:
            List of average corner speeds
        """
        telemetry = self.get_lap_telemetry(event_name, team_name)
        
        if telemetry is None or telemetry.empty:
            return [0] * num_corners
        
        try:
            # Corners identified by throttle off + braking
            speeds = telemetry['Speed'].values
            throttle = telemetry['Throttle'].values
            brake = telemetry['Brake'].values
            
            # Find corner sections (low throttle or braking)
            corner_mask = (throttle < 50) | (brake > 0)
            
            if not np.any(corner_mask):
                return [0] * num_corners
            
            # Split into corner segments
            corner_indices = np.where(np.diff(corner_mask.astype(int)) != 0)[0]
            corner_speeds = []
            
            for i in range(0, len(corner_indices) - 1, 2):
                if i + 1 < len(corner_indices):
                    segment = speeds[corner_indices[i]:corner_indices[i+1]]
                    if len(segment) > 0:
                        corner_speeds.append(float(np.mean(segment)))
            
            # Pad or trim to num_corners
            if len(corner_speeds) < num_corners:
                corner_speeds.extend([0] * (num_corners - len(corner_speeds)))
            
            return corner_speeds[:num_corners]
        except Exception as e:
            print(f"Error extracting corner speeds: {e}")
            return [0] * num_corners
    
    def get_lap_times_all_teams(self, event_name: str, session_type: str = 'Q') -> Dict[str, float]:
        """
        Get fastest lap times for all teams
        
        Args:
            event_name: Race name
            session_type: Session type
            
        Returns:
            Dictionary mapping team name to lap time (seconds)
        """
        session = self.get_session(event_name, session_type)
        
        if session is None:
            return {}
        
        try:
            laps = session.laps
            team_times = {}
            
            for team in F1_TEAMS:
                team_laps = laps[laps['Team'] == team]
                if not team_laps.empty:
                    fastest_time = team_laps['LapTime'].min()
                    if pd.notna(fastest_time):
                        team_times[team] = fastest_time.total_seconds()
            
            return team_times
        except Exception as e:
            print(f"Error getting team lap times: {e}")
            return {}
    
    def get_race_pace(self, event_name: str, team_name: str) -> Dict[str, float]:
        """
        Analyze race pace (average lap times excluding outliers)
        
        Args:
            event_name: Race name
            team_name: Team name
            
        Returns:
            Race pace statistics
        """
        session = self.get_session(event_name, 'R')
        
        if session is None:
            return {'avg_lap_time': 0, 'std_lap_time': 0}
        
        try:
            laps = session.laps
            team_laps = laps[laps['Team'] == team_name]
            
            if team_laps.empty:
                return {'avg_lap_time': 0, 'std_lap_time': 0}
            
            # Filter out pit laps and outliers
            valid_laps = team_laps[
                (team_laps['PitInTime'].isna()) & 
                (team_laps['PitOutTime'].isna())
            ]
            
            if valid_laps.empty:
                return {'avg_lap_time': 0, 'std_lap_time': 0}
            
            lap_times = valid_laps['LapTime'].apply(lambda x: x.total_seconds() if pd.notna(x) else 0)
            lap_times = lap_times[lap_times > 0]
            
            if len(lap_times) == 0:
                return {'avg_lap_time': 0, 'std_lap_time': 0}
            
            # Remove outliers (> 3 std deviations)
            mean = lap_times.mean()
            std = lap_times.std()
            filtered = lap_times[(lap_times >= mean - 3*std) & (lap_times <= mean + 3*std)]
            
            return {
                'avg_lap_time': float(filtered.mean()),
                'std_lap_time': float(filtered.std()),
                'num_laps': len(filtered)
            }
        except Exception as e:
            print(f"Error analyzing race pace: {e}")
            return {'avg_lap_time': 0, 'std_lap_time': 0}
    
    def get_track_info(self, event_name: str) -> Dict:
        """
        Get track information
        
        Args:
            event_name: Race name
            
        Returns:
            Track information dictionary
        """
        session = self.get_session(event_name, 'R')
        
        if session is None:
            return {}
        
        try:
            event = session.event
            
            return {
                'country': event['Country'],
                'location': event['Location'],
                'event_name': event['EventName'],
                'event_format': event['EventFormat'],
                'session_date': str(session.date)
            }
        except Exception as e:
            print(f"Error getting track info: {e}")
            return {}
    
    def compare_teams_at_track(self, event_name: str, team1: str, team2: str) -> Dict:
        """
        Compare two teams at a specific track
        
        Args:
            event_name: Race name
            team1: First team
            team2: Second team
            
        Returns:
            Comparison data
        """
        # Get qualifying lap times
        lap1 = self.get_fastest_lap(event_name, team1, 'Q')
        lap2 = self.get_fastest_lap(event_name, team2, 'Q')
        
        # Get speed data
        speed1 = self.get_speed_data(event_name, team1)
        speed2 = self.get_speed_data(event_name, team2)
        
        # Get race pace
        pace1 = self.get_race_pace(event_name, team1)
        pace2 = self.get_race_pace(event_name, team2)
        
        comparison = {
            'event': event_name,
            'team1': {
                'name': team1,
                'quali_time': lap1['LapTime'].total_seconds() if lap1 is not None and 'LapTime' in lap1 else None,
                'max_speed': speed1['max_speed'],
                'avg_speed': speed1['avg_speed'],
                'race_pace': pace1['avg_lap_time']
            },
            'team2': {
                'name': team2,
                'quali_time': lap2['LapTime'].total_seconds() if lap2 is not None and 'LapTime' in lap2 else None,
                'max_speed': speed2['max_speed'],
                'avg_speed': speed2['avg_speed'],
                'race_pace': pace2['avg_lap_time']
            }
        }
        
        # Calculate deltas
        if comparison['team1']['quali_time'] and comparison['team2']['quali_time']:
            comparison['quali_delta'] = comparison['team1']['quali_time'] - comparison['team2']['quali_time']
        
        comparison['speed_delta'] = speed1['max_speed'] - speed2['max_speed']
        
        return comparison
    
    def get_all_events(self) -> List[str]:
        """
        Get list of all events in the season
        
        Returns:
            List of event names
        """
        try:
            schedule = fastf1.get_event_schedule(self.season)
            return schedule['EventName'].tolist()
        except Exception as e:
            print(f"Error getting event schedule: {e}")
            return []