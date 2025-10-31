import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Zap, Wind, Thermometer, Gauge, TrendingUp, Trophy, Clock, Target } from 'lucide-react';
import mlService, { TEAMS } from '../services/mlService';
import './Simulate.css';

// Reusable MetricCard component to reduce duplicated inline markup
const MetricCard = ({ icon, label, value, unit = '', subtitle = '', gradient = null, borderColor = null, delta = null, formatter }) => {
  const formatted = typeof formatter === 'function' ? formatter(value) : (value ?? 'N/A');
  const styleDelta = borderColor ? { background: borderColor } : { background: 'rgba(16,185,129,0.9)' };
  return (
    <div className="metric-card">
      {delta !== null && (
        <div className="metric-delta" style={styleDelta}>Δ {delta}</div>
      )}
      <div className="metric-deco" aria-hidden="true" style={{ background: gradient || 'radial-gradient(circle, rgba(255,255,255,0.06), transparent 40%)' }} />
      <div className="metric-icon" style={{ background: borderColor || 'linear-gradient(135deg,#ef4444,#ff1040)' }}>
        {icon}
      </div>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{formatted}{unit}</div>
      {subtitle && <div className="metric-subtext">{subtitle}</div>}
    </div>
  );
};

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
            {/* Hero Lap Time Banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              style={{
                background: 'linear-gradient(135deg, rgba(255, 42, 77, 0.15) 0%, rgba(255, 135, 0, 0.1) 50%, rgba(0, 210, 255, 0.15) 100%)',
                borderRadius: '1.5rem',
                padding: '2.5rem',
                marginBottom: '2rem',
                border: '1px solid rgba(255, 42, 77, 0.3)',
                boxShadow: '0 20px 60px rgba(255, 42, 77, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Background Glow Effect */}
              <div style={{
                position: 'absolute',
                top: '-50%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
                height: '200%',
                background: 'radial-gradient(ellipse at center, rgba(255, 42, 77, 0.2) 0%, transparent 60%)',
                filter: 'blur(40px)',
                pointerEvents: 'none'
              }}></div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ 
                  textAlign: 'center', 
                  marginBottom: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.5rem 1.5rem',
                    background: 'rgba(255, 42, 77, 0.2)',
                    borderRadius: '2rem',
                    border: '1px solid rgba(255, 42, 77, 0.4)'
                  }}>
                    <Trophy size={20} color="#ff2a4d" />
                    <span style={{ color: '#ff2a4d', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      Simulated Lap Times
                    </span>
                  </div>
                  <h2 style={{ 
                    fontSize: '2.5rem', 
                    fontWeight: '800', 
                    color: '#fff',
                    margin: 0,
                    textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
                  }}>
                    {selectedTrack}
                  </h2>
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)', 
                  gap: '1.5rem',
                  maxWidth: '600px',
                  margin: '0 auto'
                }}>
                  {
                    // Build a small metrics array and map to MetricCard to avoid duplication
                    [
                      {
                        label: 'Top Speed',
                        icon: <Zap size={28} color="#fff" />,
                        value: circuitData.top_speed ?? null,
                        subtitle: 'km/h maximum',
                        formatter: (v) => v ? Math.round(v) : 'N/A',
                        gradient: 'radial-gradient(circle, rgba(139, 92, 246, 0.1), transparent 40%)',
                        borderColor: 'linear-gradient(135deg,#8b5cf6,#00d2ff)'
                      },
                      {
                        label: 'Corner Speed',
                        icon: <TrendingUp size={28} color="#fff" />,
                        value: circuitData.avg_corner_speed ?? null,
                        subtitle: 'km/h average',
                        formatter: (v) => v ? Math.round(v) : 'N/A',
                        gradient: 'radial-gradient(circle, rgba(255, 135, 0, 0.1), transparent 40%)',
                        borderColor: 'linear-gradient(135deg,#ff8700,#ffb800)'
                      }
                    ].map((m, i) => (
                      <MetricCard
                        key={i}
                        icon={m.icon}
                        label={m.label}
                        value={m.value}
                        unit={m.unit}
                        subtitle={m.subtitle}
                        gradient={m.gradient}
                        borderColor={m.borderColor}
                        delta={m.delta}
                        formatter={m.formatter}
                      />
                    ))
                  }
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
                </div>
              </motion.div>
            )}

            {/* ML-Analyzed Critical Corners */}
            {circuitData.critical_corners && circuitData.critical_corners.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                style={{
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: '1.5rem',
                  padding: '2rem',
                  border: '1px solid rgba(0, 210, 255, 0.2)',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Header Glow Effect */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '80%',
                  height: '100px',
                  background: 'radial-gradient(ellipse at center, rgba(0, 210, 255, 0.15) 0%, transparent 70%)',
                  filter: 'blur(30px)',
                  pointerEvents: 'none'
                }}></div>

                <h3 style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#e2e8f0',
                  marginBottom: '1.75rem',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #00d2ff 0%, #0096ff 100%)',
                    padding: '0.5rem',
                    borderRadius: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(0, 210, 255, 0.3)'
                  }}>
                    <Target size={20} />
                  </div>
                  ML-Analyzed Critical Corners & Sections
                </h3>

                <div style={{ 
                  display: 'grid', 
                  gap: '1.25rem',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {circuitData.critical_corners.map((corner, idx) => {
                    // Handle both string and object formats
                    const isObject = typeof corner === 'object';
                    const cornerType = isObject ? corner.corner_type : corner;
                    const importance = isObject ? corner.importance : '';
                    const speedRange = isObject ? corner.speed_range : '';
                    const recommendation = isObject ? corner.setup_recommendation : '';
                    const physicsNote = isObject ? corner.physics_note : '';
                    const laptimeImpact = isObject ? corner.laptime_impact : '';
                    
                    const isCritical = importance?.includes('CRITICAL');
                    const isHigh = importance?.includes('HIGH');
                    const isMedium = importance?.includes('MEDIUM');
                    
                    return (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        whileHover={{ 
                          scale: 1.02,
                          transition: { duration: 0.2 }
                        }}
                        style={{
                          background: `linear-gradient(135deg, 
                            ${isCritical ? 'rgba(255, 42, 77, 0.1)' : 
                              isHigh ? 'rgba(255, 135, 0, 0.1)' : 
                              isMedium ? 'rgba(0, 210, 255, 0.1)' : 'rgba(100, 116, 139, 0.1)'} 0%, 
                            rgba(255, 255, 255, 0.02) 100%)`,
                          borderRadius: '1rem',
                          padding: '1.25rem',
                          border: `1px solid ${
                            isCritical ? 'rgba(255, 42, 77, 0.3)' :
                            isHigh ? 'rgba(255, 135, 0, 0.3)' :
                            isMedium ? 'rgba(0, 210, 255, 0.3)' : 'rgba(100, 116, 139, 0.2)'
                          }`,
                          boxShadow: `0 4px 20px ${
                            isCritical ? 'rgba(255, 42, 77, 0.1)' :
                            isHigh ? 'rgba(255, 135, 0, 0.1)' :
                            isMedium ? 'rgba(0, 210, 255, 0.1)' : 'rgba(0, 0, 0, 0.2)'
                          }`,
                          position: 'relative',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {/* Corner Number Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                          <div style={{
                            background: isCritical ? 'linear-gradient(135deg, #ff2a4d 0%, #ff1040 100%)' :
                                       isHigh ? 'linear-gradient(135deg, #ff8700 0%, #ff6b00 100%)' :
                                       isMedium ? 'linear-gradient(135deg, #00d2ff 0%, #0096ff 100%)' : 
                                       'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                            color: '#fff',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.75rem',
                            fontWeight: '800',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            boxShadow: `0 4px 12px ${
                              isCritical ? 'rgba(255, 42, 77, 0.4)' :
                              isHigh ? 'rgba(255, 135, 0, 0.4)' :
                              isMedium ? 'rgba(0, 210, 255, 0.4)' : 'rgba(100, 116, 139, 0.3)'
                            }`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            {isCritical && '🔴'}
                            {isHigh && '🟠'}
                            {isMedium && '🔵'}
                            {importance || `#${idx + 1}`}
                          </div>
                          <div style={{ 
                            flex: 1, 
                            fontSize: '1.125rem', 
                            fontWeight: '700', 
                            color: '#f1f5f9',
                            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                          }}>
                            {cornerType}
                          </div>
                        </div>
                        
                        {/* Speed Range */}
                        {speedRange && (
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.75rem',
                            padding: '0.75rem',
                            background: 'rgba(0, 210, 255, 0.05)',
                            borderRadius: '0.75rem',
                            marginBottom: '0.75rem',
                            border: '1px solid rgba(0, 210, 255, 0.2)'
                          }}>
                            <div style={{
                              background: 'linear-gradient(135deg, #00d2ff 0%, #0096ff 100%)',
                              padding: '0.5rem',
                              borderRadius: '0.5rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 8px rgba(0, 210, 255, 0.3)'
                            }}>
                              <Gauge size={16} color="#fff" />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                                Speed Range
                              </div>
                              <div style={{ fontSize: '0.9rem', color: '#00d2ff', fontWeight: '700' }}>
                                {speedRange}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Recommendation */}
                        {recommendation && (
                          <div style={{ 
                            fontSize: '0.875rem', 
                            color: '#cbd5e1', 
                            background: 'rgba(0, 255, 136, 0.08)', 
                            padding: '0.875rem', 
                            borderRadius: '0.75rem', 
                            borderLeft: '3px solid #00ff88',
                            marginBottom: '0.75rem',
                            lineHeight: '1.5'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <span style={{ fontSize: '1rem' }}>💡</span>
                              <span style={{ color: '#00ff88', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Recommendation
                              </span>
                            </div>
                            <div style={{ color: '#e2e8f0' }}>
                              {recommendation}
                            </div>
                          </div>
                        )}
                        
                        {/* Physics Note */}
                        {physicsNote && (
                          <div style={{ 
                            fontSize: '0.8rem', 
                            color: '#94a3b8', 
                            fontStyle: 'italic',
                            padding: '0.625rem 0.875rem',
                            background: 'rgba(100, 116, 139, 0.1)',
                            borderRadius: '0.5rem',
                            marginBottom: '0.75rem',
                            borderLeft: '2px solid rgba(100, 116, 139, 0.3)'
                          }}>
                            ⚡ {physicsNote}
                          </div>
                        )}
                        
                        {/* Lap Time Impact */}
                        {laptimeImpact && (
                          <div style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.875rem', 
                            color: '#fbbf24', 
                            fontWeight: '700',
                            padding: '0.625rem',
                            background: 'rgba(251, 191, 36, 0.1)',
                            borderRadius: '0.5rem',
                            border: '1px solid rgba(251, 191, 36, 0.2)'
                          }}>
                            <span style={{ fontSize: '1rem' }}>⏱️</span>
                            <span>Lap Time Impact:</span>
                            <span style={{ color: '#fff' }}>{laptimeImpact}</span>
                    </div>
                        )}
                      </motion.div>
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