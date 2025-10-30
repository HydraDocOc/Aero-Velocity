import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Zap, Wind, Thermometer, Gauge, TrendingUp, Trophy, Clock, Target } from 'lucide-react';
import mlService, { TEAMS } from '../services/mlService';
import './Simulate.css';

const Simulate = () => {
  const [selectedTeam, setSelectedTeam] = useState('Red Bull Racing');
  const [selectedTrack, setSelectedTrack] = useState('Monaco');
  const [tracks, setTracks] = useState([]);
  const [circuitData, setCircuitData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aeroConfig, setAeroConfig] = useState({
    dragCoefficient: 0.70,
    clFront: 1.5,
    clRear: 2.0,
    frontWingAngle: 25,
    rearWingAngle: 35
  });

  // Load tracks
  useEffect(() => {
    const loadTracks = async () => {
      try {
        const response = await mlService.getTracks();
        setTracks(response.tracks || []);
        if (response.tracks && response.tracks.length > 0) {
          setSelectedTrack(response.tracks[0].name);
        }
      } catch (error) {
        console.error('Error loading tracks:', error);
        setTracks([
          { name: 'Monaco', length_km: 3.337, downforce_level: 'HIGH', corner_count: 19 },
          { name: 'Silverstone', length_km: 5.891, downforce_level: 'MEDIUM', corner_count: 18 },
          { name: 'Monza', length_km: 5.793, downforce_level: 'LOW', corner_count: 11 },
          { name: 'Spa-Francorchamps', length_km: 7.004, downforce_level: 'MEDIUM', corner_count: 19 },
          { name: 'Suzuka', length_km: 5.807, downforce_level: 'HIGH', corner_count: 18 }
        ]);
      }
    };
    loadTracks();
  }, []);

  // Load circuit analysis when track or config changes
  useEffect(() => {
    const loadCircuitAnalysis = async () => {
      if (!selectedTrack) return;

      setLoading(true);
      try {
        const config = mlService.buildAeroConfig(aeroConfig);
        const analysis = await mlService.simulateCircuit(selectedTrack, config);
        setCircuitData(analysis);
      } catch (error) {
        console.error('Error loading circuit analysis:', error);
        // Set fallback data
        setCircuitData({
          track: selectedTrack,
          qualifying_lap_time: '1:25.500',
          race_lap_time: '1:27.200',
          time_gain_quali: 0.5,
          time_gain_race: 0.3,
          top_speed: 320,
          avg_corner_speed: 180,
          setup_recommendations: {
            front_wing: 25,
            rear_wing: 35,
            ride_height: 'medium'
          },
          critical_corners: ['Turn 1', 'Turn 10', 'Turn 15']
        });
      } finally {
        setLoading(false);
      }
    };

    loadCircuitAnalysis();
  }, [selectedTrack, aeroConfig]);

  const handleConfigChange = (key, value) => {
    setAeroConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const currentTrack = tracks.find(t => t.name === selectedTrack);

  return (
    <div className="simulate-page">
      <div className="simulate-background">
        <div className="grid-overlay" />
        <div className="glow-effects" />
      </div>

      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="page-header"
        >
          <h1>Circuit Simulation</h1>
          <p>Advanced circuit-specific aerodynamic analysis and lap time simulation</p>
        </motion.div>

        {/* Track Selection and Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="track-selector-card glass"
        >
          <div className="track-selector-header">
            <MapPin size={24} />
            <h3>Select Circuit</h3>
          </div>
          <div className="track-selector-grid">
            {tracks.map((track) => (
              <motion.div
                key={track.name}
                className={`track-card ${selectedTrack === track.name ? 'active' : ''}`}
                onClick={() => setSelectedTrack(track.name)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="track-card-header">
                  <h4>{track.name}</h4>
                  <span 
                    className="downforce-badge"
                    style={{
                      background: track.downforce_level === 'HIGH' ? 'rgba(255, 42, 77, 0.2)' :
                                  track.downforce_level === 'MEDIUM' ? 'rgba(255, 135, 0, 0.2)' :
                                  'rgba(0, 255, 136, 0.2)',
                      color: track.downforce_level === 'HIGH' ? '#ff2a4d' :
                             track.downforce_level === 'MEDIUM' ? '#ff8700' :
                             '#00ff88'
                    }}
                  >
                    {track.downforce_level}
                  </span>
                </div>
                <div className="track-card-stats">
                  <div className="stat">
                    <span>Length:</span>
                    <span>{track.length_km} km</span>
                  </div>
                  <div className="stat">
                    <span>Corners:</span>
                    <span>{track.corner_count || 'N/A'}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="config-panel glass"
        >
          <h3>Team Configuration</h3>
          <div className="team-selector">
            <label>Select Team:</label>
            <select 
              value={selectedTeam} 
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="team-select"
            >
              {TEAMS.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Aerodynamic Configuration Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="config-panel glass"
        >
          <h3><Gauge size={20} /> Aerodynamic Setup</h3>
          <div className="config-controls">
            <div className="config-control">
              <label>
                <Zap size={16} />
                Drag Coefficient: {aeroConfig.dragCoefficient.toFixed(3)}
              </label>
              <input
                type="range"
                min="0.60"
                max="0.85"
                step="0.01"
                value={aeroConfig.dragCoefficient}
                onChange={(e) => handleConfigChange('dragCoefficient', parseFloat(e.target.value))}
              />
            </div>
            <div className="config-control">
              <label>
                Front Downforce (Cl): {aeroConfig.clFront.toFixed(2)}
              </label>
              <input
                type="range"
                min="1.0"
                max="2.5"
                step="0.1"
                value={aeroConfig.clFront}
                onChange={(e) => handleConfigChange('clFront', parseFloat(e.target.value))}
              />
            </div>
            <div className="config-control">
              <label>
                Rear Downforce (Cl): {aeroConfig.clRear.toFixed(2)}
              </label>
              <input
                type="range"
                min="1.5"
                max="3.0"
                step="0.1"
                value={aeroConfig.clRear}
                onChange={(e) => handleConfigChange('clRear', parseFloat(e.target.value))}
              />
            </div>
            <div className="config-control">
              <label>
                Front Wing Angle: {aeroConfig.frontWingAngle}°
              </label>
              <input
                type="range"
                min="15"
                max="40"
                step="1"
                value={aeroConfig.frontWingAngle}
                onChange={(e) => handleConfigChange('frontWingAngle', parseInt(e.target.value))}
              />
            </div>
            <div className="config-control">
              <label>
                Rear Wing Angle: {aeroConfig.rearWingAngle}°
              </label>
              <input
                type="range"
                min="20"
                max="50"
                step="1"
                value={aeroConfig.rearWingAngle}
                onChange={(e) => handleConfigChange('rearWingAngle', parseInt(e.target.value))}
              />
            </div>
          </div>
        </motion.div>

        {/* Circuit Analysis Results */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="loading-panel glass"
          >
            <div className="loading-spinner"></div>
            <p>Simulating circuit performance...</p>
          </motion.div>
        ) : circuitData ? (
          <>
            {/* Lap Time Results */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="results-grid"
            >
              <div className="result-card glass">
                <div className="result-icon" style={{ background: 'linear-gradient(135deg, #ff2a4d, #ff6b35)' }}>
                  <Trophy size={32} />
                </div>
                <div className="result-content">
                  <div className="result-label">Qualifying Lap Time</div>
                  <div className="result-value">{circuitData.qualifying_lap_time}</div>
                  <div className="result-subtext">Optimal single lap</div>
                </div>
              </div>

              <div className="result-card glass">
                <div className="result-icon" style={{ background: 'linear-gradient(135deg, #00d2ff, #00ff88)' }}>
                  <Clock size={32} />
                </div>
                <div className="result-content">
                  <div className="result-label">Race Lap Time</div>
                  <div className="result-value">{circuitData.race_lap_time}</div>
                  <div className="result-subtext">Average race pace</div>
                </div>
              </div>

              <div className="result-card glass">
                <div className="result-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #00d2ff)' }}>
                  <Zap size={32} />
                </div>
                <div className="result-content">
                  <div className="result-label">Top Speed</div>
                  <div className="result-value">{circuitData.top_speed?.toFixed(1) || 'N/A'} km/h</div>
                  <div className="result-subtext">Maximum velocity</div>
                </div>
              </div>

              <div className="result-card glass">
                <div className="result-icon" style={{ background: 'linear-gradient(135deg, #ff8700, #ffb800)' }}>
                  <TrendingUp size={32} />
                </div>
                <div className="result-content">
                  <div className="result-label">Avg Corner Speed</div>
                  <div className="result-value">{circuitData.avg_corner_speed?.toFixed(1) || 'N/A'} km/h</div>
                  <div className="result-subtext">Through corners</div>
                </div>
              </div>
            </motion.div>

            {/* ML-Analyzed Setup Recommendations */}
            {circuitData.setup_recommendations && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="recommendations-panel glass"
              >
                <h3><Gauge size={20} /> ML-Analyzed Setup Recommendations</h3>
                <div className="recommendations-grid">
                  {/* Wing Angles */}
                  <div className="recommendation-item">
                    <div className="rec-label">Front Wing (Optimal)</div>
                    <div className="rec-value" style={{ color: '#00d2ff' }}>
                      {circuitData.setup_recommendations.wing_angles?.front_optimal || 
                       circuitData.setup_recommendations.wing_angles?.front || 
                       circuitData.setup_recommendations.front_wing || 'N/A'}
                    </div>
                    {circuitData.setup_recommendations.wing_angles?.front_current && (
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                        Current: {circuitData.setup_recommendations.wing_angles.front_current}
                      </div>
                    )}
                  </div>
                  <div className="recommendation-item">
                    <div className="rec-label">Rear Wing (Optimal)</div>
                    <div className="rec-value" style={{ color: '#00ff88' }}>
                      {circuitData.setup_recommendations.wing_angles?.rear_optimal || 
                       circuitData.setup_recommendations.wing_angles?.rear || 
                       circuitData.setup_recommendations.rear_wing || 'N/A'}
                    </div>
                    {circuitData.setup_recommendations.wing_angles?.rear_current && (
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                        Current: {circuitData.setup_recommendations.wing_angles.rear_current}
                      </div>
                    )}
                  </div>
                  
                  {/* Ride Heights */}
                  <div className="recommendation-item">
                    <div className="rec-label">Front Ride Height</div>
                    <div className="rec-value" style={{ color: '#ff8700' }}>
                      {circuitData.setup_recommendations.ride_heights?.front_optimal || 
                       circuitData.setup_recommendations.ride_heights?.front || 
                       circuitData.setup_recommendations.ride_height || 'N/A'}
                    </div>
                  </div>
                  <div className="recommendation-item">
                    <div className="rec-label">Rear Ride Height</div>
                    <div className="rec-value" style={{ color: '#ff2a4d' }}>
                      {circuitData.setup_recommendations.ride_heights?.rear_optimal || 
                       circuitData.setup_recommendations.ride_heights?.rear || 'N/A'}
                    </div>
                  </div>

                  {/* Drag Analysis */}
                  {circuitData.setup_recommendations.drag_analysis && (
                    <div className="recommendation-item" style={{ gridColumn: '1 / -1' }}>
                      <div className="rec-label">Drag Optimization</div>
                      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginTop: '8px' }}>
                        Status: <span style={{ color: '#00d2ff', fontWeight: 'bold' }}>
                          {circuitData.setup_recommendations.drag_analysis.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
                        Impact: {circuitData.setup_recommendations.drag_analysis.impact}
                      </div>
                    </div>
                  )}

                  {/* Downforce Analysis */}
                  {circuitData.setup_recommendations.downforce_analysis && (
                    <div className="recommendation-item" style={{ gridColumn: '1 / -1' }}>
                      <div className="rec-label">Downforce Optimization</div>
                      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginTop: '8px' }}>
                        Status: <span style={{ color: '#00ff88', fontWeight: 'bold' }}>
                          {circuitData.setup_recommendations.downforce_analysis.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
                        Impact: {circuitData.setup_recommendations.downforce_analysis.impact}
                      </div>
                    </div>
                  )}

                  {/* Track Priority */}
                  {circuitData.setup_recommendations.track_specific && (
                    <div className="recommendation-item" style={{ gridColumn: '1 / -1', background: 'rgba(0, 210, 255, 0.1)', border: '1px solid rgba(0, 210, 255, 0.3)' }}>
                      <div className="rec-label" style={{ color: '#00d2ff' }}>Setup Priority</div>
                      <div style={{ fontSize: '13px', color: '#fff', marginTop: '8px', fontWeight: 'bold' }}>
                        {circuitData.setup_recommendations.track_specific.priority}
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '6px' }}>
                        {circuitData.setup_recommendations.track_specific.key_focus}
                      </div>
                    </div>
                  )}

                  {/* Time Gain */}
                  <div className="recommendation-item" style={{ textAlign: 'center' }}>
                    <div className="rec-label">Estimated Lap Time Gain</div>
                    <div className="rec-value" style={{ color: '#00ff88', fontSize: '24px' }}>
                      +{circuitData.setup_recommendations.estimated_laptime_gain || 
                         circuitData.time_gain_quali?.toFixed(3) || '0.000'}s
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ML-Analyzed Critical Corners */}
            {circuitData.critical_corners && circuitData.critical_corners.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="critical-corners-panel glass"
              >
                <h3><Target size={20} /> ML-Analyzed Critical Corners & Sections</h3>
                <div className="corners-list" style={{ display: 'grid', gap: '15px' }}>
                  {circuitData.critical_corners.map((corner, idx) => {
                    // Handle both string and object formats
                    const isObject = typeof corner === 'object';
                    const cornerType = isObject ? corner.corner_type : corner;
                    const importance = isObject ? corner.importance : '';
                    const speedRange = isObject ? corner.speed_range : '';
                    const recommendation = isObject ? corner.setup_recommendation : '';
                    const physicsNote = isObject ? corner.physics_note : '';
                    const laptimeImpact = isObject ? corner.laptime_impact : '';
                    
                    return (
                      <div 
                        key={idx} 
                        className="corner-item" 
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          borderRadius: '12px',
                          padding: '16px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="corner-number" style={{
                            background: importance?.includes('CRITICAL') ? '#ff2a4d' :
                                       importance?.includes('HIGH') ? '#ff8700' :
                                       importance?.includes('MEDIUM') ? '#00d2ff' : '#666',
                            color: '#fff',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            fontSize: '12px',
                            minWidth: '80px',
                            textAlign: 'center'
                          }}>
                            {importance || `#${idx + 1}`}
                          </div>
                          <div className="corner-name" style={{ flex: 1, fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>
                            {cornerType}
                          </div>
                        </div>
                        
                        {speedRange && (
                          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Gauge size={14} color="#00d2ff" />
                            Speed Range: <span style={{ color: '#00d2ff', fontWeight: 'bold' }}>{speedRange}</span>
                          </div>
                        )}
                        
                        {recommendation && (
                          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', background: 'rgba(0, 255, 136, 0.1)', padding: '8px', borderRadius: '6px', borderLeft: '3px solid #00ff88' }}>
                            <span style={{ color: '#00ff88', fontWeight: 'bold' }}>Recommendation: </span>
                            {recommendation}
                          </div>
                        )}
                        
                        {physicsNote && (
                          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>
                            💡 {physicsNote}
                          </div>
                        )}
                        
                        {laptimeImpact && (
                          <div style={{ fontSize: '12px', color: '#ff8700', fontWeight: 'bold', marginTop: '4px' }}>
                            ⏱️ Lap Time Impact: {laptimeImpact}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="no-data-panel glass"
          >
            <p>Select a track and configure aerodynamics to see simulation results</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Simulate;