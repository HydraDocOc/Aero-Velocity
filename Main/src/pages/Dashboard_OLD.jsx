import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Zap, 
  Gauge, 
  Car, 
  TrendingUp, 
  Activity,
  Target,
  BarChart3,
  Brain,
  Clock,
  Award
} from 'lucide-react';
import mlService, { TEAMS } from '../services/mlService';
import './Dashboard.css';

const Dashboard = () => {
  const [selectedTeam, setSelectedTeam] = useState('Red Bull Racing');
  const [selectedTrack, setSelectedTrack] = useState('Monaco');
  const [tracks, setTracks] = useState([]);
  const [carSettings, setCarSettings] = useState({
    aeroEfficiency: 85,
    enginePower: 92,
    tireGrip: 78,
    trackType: 'high-downforce',
    dragCoefficient: 0.70,
    clFront: 1.5,
    clRear: 2.0
  });
  const [aiInsights, setAiInsights] = useState([]);
  const [performanceHistory, setPerformanceHistory] = useState([]);
  const [componentData, setComponentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [performanceData, setPerformanceData] = useState(null);

  // Load tracks on mount
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
        // Fallback to default tracks
        setTracks([
          { name: 'Monaco', length_km: 3.337, downforce_level: 'HIGH' },
          { name: 'Silverstone', length_km: 5.891, downforce_level: 'MEDIUM' },
          { name: 'Monza', length_km: 5.793, downforce_level: 'LOW' }
        ]);
      }
    };
    loadTracks();
  }, []);

  // Load team data and AI insights
  useEffect(() => {
    const loadData = async () => {
      if (!selectedTeam || !selectedTrack) return;
      
      setLoading(true);
      try {
        // Build aero config from settings
        const aeroConfig = mlService.buildAeroConfig({
          dragCoefficient: carSettings.dragCoefficient,
          clFront: carSettings.clFront,
          clRear: carSettings.clRear
        });

        // Get AI insights
        const insightsResponse = await mlService.getAIInsights(
          aeroConfig,
          {},
          selectedTrack
        );
        
        if (insightsResponse.insights) {
          setAiInsights(insightsResponse.insights.map((insight, idx) => ({
            id: idx + 1,
            type: insight.type,
            message: insight.message,
            timestamp: 'Just now'
          })));
        }

        // Get component analysis
        const componentsResponse = await mlService.analyzeComponents(
          selectedTeam,
          aeroConfig,
          selectedTrack
        );
        setComponentData(componentsResponse);

        // Get performance prediction
        const perfResponse = await mlService.predictPerformance(aeroConfig, selectedTrack);
        setPerformanceData(perfResponse);

      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Set fallback data
        setAiInsights([
          {
            id: 1,
            type: 'info',
            message: 'ML backend not connected. Using mock data.',
            timestamp: 'Just now'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedTeam, selectedTrack, carSettings.dragCoefficient, carSettings.clFront, carSettings.clRear]);

  const handleSettingChange = (setting, value) => {
    setCarSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    
    // Update drag coefficient and downforce based on aeroEfficiency
    if (setting === 'aeroEfficiency') {
      setCarSettings(prev => ({
        ...prev,
        dragCoefficient: 0.85 - (value / 100) * 0.20, // 0.65 to 0.85
        clFront: 1.0 + (value / 100) * 1.0, // 1.0 to 2.0
        clRear: 1.5 + (value / 100) * 1.0  // 1.5 to 2.5
      }));
    }
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'warning': return <Activity size={16} />;
      case 'success': return <Award size={16} />;
      case 'info': return <Brain size={16} />;
      default: return <Brain size={16} />;
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'warning': return '#ff6b35';
      case 'success': return '#00ff88';
      case 'info': return '#00d2be';
      default: return '#00d2be';
    }
  };

  return (
    <div className="dashboard-page">
      {/* Background Effects */}
      <div className="dashboard-background">
        <div className="dashboard-grid-overlay" />
        <div className="dashboard-glow-effects" />
        <div className="dashboard-particles" />
      </div>

      {/* Main Dashboard Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="dashboard-container"
      >
        {/* Left Sidebar - Car Settings Panel */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="dashboard-sidebar"
        >
          <div className="sidebar-header">
            <Settings size={24} />
            <h3>Car Settings</h3>
          </div>

          {/* Team Selection */}
          <div className="car-selection">
            <h4>Select Team</h4>
            <div className="car-list">
              {TEAMS.map((team) => (
                <motion.div
                  key={team}
                  className={`car-item ${selectedTeam === team ? 'active' : ''}`}
                  onClick={() => setSelectedTeam(team)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div 
                    className="car-color-indicator" 
                    style={{ backgroundColor: '#00d2ff' }}
                  />
                  <span>{team}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Track Selection */}
          <div className="car-selection" style={{ marginTop: '20px' }}>
            <h4>Select Track</h4>
            <select 
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
              className="track-select"
              style={{ width: '100%', padding: '10px' }}
            >
              {tracks.map((track) => (
                <option key={track.name} value={track.name}>
                  {track.name} ({track.downforce_level})
                </option>
              ))}
            </select>
          </div>

          {/* Settings Controls */}
          <div className="settings-controls">
            <h4>Performance Parameters</h4>
            
            <div className="control-group">
              <label>
                <Gauge size={16} />
                Aerodynamic Efficiency
              </label>
              <div className="slider-container">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={carSettings.aeroEfficiency}
                  onChange={(e) => handleSettingChange('aeroEfficiency', parseInt(e.target.value))}
                  className="modern-slider"
                />
                <span className="slider-value">{carSettings.aeroEfficiency}%</span>
              </div>
            </div>

            <div className="control-group">
              <label>
                <Zap size={16} />
                Engine Power
              </label>
              <div className="slider-container">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={carSettings.enginePower}
                  onChange={(e) => handleSettingChange('enginePower', parseInt(e.target.value))}
                  className="modern-slider"
                />
                <span className="slider-value">{carSettings.enginePower}%</span>
              </div>
            </div>

            <div className="control-group">
              <label>
                <Car size={16} />
                Tire Grip
              </label>
              <div className="slider-container">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={carSettings.tireGrip}
                  onChange={(e) => handleSettingChange('tireGrip', parseInt(e.target.value))}
                  className="modern-slider"
                />
                <span className="slider-value">{carSettings.tireGrip}%</span>
              </div>
            </div>

            <div className="control-group">
              <label>
                <Target size={16} />
                Track Type
              </label>
              <select 
                value={carSettings.trackType}
                onChange={(e) => handleSettingChange('trackType', e.target.value)}
                className="track-select"
              >
                <option value="high-downforce">High Downforce</option>
                <option value="low-downforce">Low Downforce</option>
                <option value="balanced">Balanced</option>
                <option value="street-circuit">Street Circuit</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Center Panel - Main Visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="dashboard-center"
        >
          <div className="center-header">
            <h2>Performance Analytics</h2>
            <div className="live-indicator">
              <div className="pulse-dot" />
              <span>LIVE</span>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="charts-container">
            <div className="chart-card">
              <h4>Performance Metrics</h4>
              {performanceData ? (
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '8px' }}>
                        Top Speed
                      </div>
                      <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#00ff88' }}>
                        {performanceData.top_speed?.toFixed(1) || 'N/A'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>km/h</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '8px' }}>
                        Corner Speed
                      </div>
                      <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#00d2ff' }}>
                        {performanceData.avg_corner_speed?.toFixed(1) || 'N/A'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>km/h</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '8px' }}>
                        Downforce
                      </div>
                      <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff8700' }}>
                        {performanceData.total_downforce?.toFixed(1) || 'N/A'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>kN</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '8px' }}>
                        Efficiency (L/D)
                      </div>
                      <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff2a4d' }}>
                        {performanceData.ld_ratio?.toFixed(2) || 
                         ((carSettings.clFront + carSettings.clRear) / carSettings.dragCoefficient).toFixed(2)}
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>ratio</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)' }}>
                  {loading ? 'Loading performance data...' : 'Adjust settings to see performance metrics'}
                </div>
              )}
            </div>

            <div className="chart-card">
              <h4>Configuration</h4>
              <div style={{ padding: '20px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
                <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Drag Coefficient (Cd):</span>
                  <span style={{ color: '#00ff88', fontWeight: 'bold' }}>
                    {carSettings.dragCoefficient.toFixed(3)}
                  </span>
                </div>
                <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Front Downforce (Cl):</span>
                  <span style={{ color: '#00d2ff', fontWeight: 'bold' }}>
                    {carSettings.clFront.toFixed(2)}
                  </span>
                </div>
                <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Rear Downforce (Cl):</span>
                  <span style={{ color: '#ff8700', fontWeight: 'bold' }}>
                    {carSettings.clRear.toFixed(2)}
                  </span>
                </div>
                <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total Downforce:</span>
                  <span style={{ color: '#ff2a4d', fontWeight: 'bold' }}>
                    {(carSettings.clFront + carSettings.clRear).toFixed(2)}
                  </span>
                </div>
                <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(0, 210, 255, 0.1)', borderRadius: '8px', borderLeft: '3px solid #00d2ff' }}>
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '5px' }}>
                    Selected Track
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    {selectedTrack}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Car Visual */}
          <div className="car-visual">
            <div className="car-silhouette">
              <Car size={120} />
            </div>
          </div>
        </motion.div>

        {/* Right Panel - AI Insights */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="dashboard-insights"
        >
          <div className="insights-header">
            <Brain size={24} />
            <h3>AI Insights</h3>
          </div>

          <div className="insights-list">
            <AnimatePresence>
              {aiInsights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`insight-card ${insight.type}`}
                >
                  <div className="insight-icon" style={{ color: getInsightColor(insight.type) }}>
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="insight-content">
                    <p>{insight.message}</p>
                    <span className="insight-timestamp">
                      <Clock size={12} />
                      {insight.timestamp}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Bottom Section - Component Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="dashboard-history"
        >
          <div className="history-header">
            <BarChart3 size={24} />
            <h3>Component Analysis</h3>
            {loading && <span style={{ fontSize: '14px', color: '#00d2ff' }}>Loading...</span>}
          </div>

          {componentData && Object.keys(componentData).length > 0 ? (
            <div className="history-scroll">
              {Object.entries(componentData).map(([name, data], index) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.05 }}
                  className="history-card"
                >
                  <div className="history-card-header">
                    <span className="car-name">{name}</span>
                    <span 
                      className="record-date"
                      style={{ 
                        color: data.rating === 'Excellent' ? '#00ff88' : 
                               data.rating === 'Good' ? '#00d2ff' : 
                               data.rating === 'Below Average' ? '#ff8700' : '#ff2a4d'
                      }}
                    >
                      {data.rating}
                    </span>
                  </div>
                  <div className="history-stats">
                    <div className="stat">
                      <span className="stat-label">Efficiency</span>
                      <span className="stat-value">{(data.efficiency * 100).toFixed(1)}%</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Improvement</span>
                      <span className="stat-value">{(data.improvement_potential * 100).toFixed(1)}%</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Drag</span>
                      <span className="stat-value">{(data.drag_contribution || 0).toFixed(3)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)' }}>
              {loading ? 'Loading component data...' : 'No component data available. Check ML backend connection.'}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;