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
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Legend,
  BarChart as RechartsBarChart,
  Bar,
  CartesianGrid,
  LineChart,
  Line,
  Area,
  AreaChart,
  Cell
} from 'recharts';
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
  const [componentData, setComponentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [performanceData, setPerformanceData] = useState(null);
  const [radarData, setRadarData] = useState([]);
  const [scatterData, setScatterData] = useState([]);
  const [trendData, setTrendData] = useState([]);

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
        console.log('🔧 Fetching component analysis...');
        const componentsResponse = await mlService.analyzeComponents(
          selectedTeam, 
          aeroConfig, 
          selectedTrack
        );
        console.log('🔧 Components response:', componentsResponse);
        setComponentData(componentsResponse);

        // Get performance prediction
        const perfResponse = await mlService.predictPerformance(aeroConfig, selectedTrack);
        setPerformanceData(perfResponse);

        // Generate radar chart data (Performance Metrics)
        const radarChartData = [
          {
            metric: 'Top Speed',
            value: Math.min(100, (perfResponse.top_speed || 340) / 3.7),
            fullMark: 100
          },
          {
            metric: 'Corner Speed',
            value: Math.min(100, (perfResponse.avg_corner_speed || 180) / 2.2),
            fullMark: 100
          },
          {
            metric: 'Downforce',
            value: Math.min(100, ((carSettings.clFront + carSettings.clRear) / 4.5) * 100),
            fullMark: 100
          },
          {
            metric: 'Efficiency',
            value: Math.min(100, (perfResponse.ld_ratio || 4) * 20),
            fullMark: 100
          },
          {
            metric: 'Acceleration',
            value: Math.min(100, 100 - ((perfResponse.acceleration_0_100 || 2.6) - 2.0) * 40),
            fullMark: 100
          },
          {
            metric: 'Balance',
            value: Math.abs((perfResponse.overall_balance || 40) - 50) < 10 ? 90 : 70,
            fullMark: 100
          }
        ];
        setRadarData(radarChartData);

        // Generate scatter plot data (Drag vs Downforce trade-off)
        const scatter = [];
        for (let cd = 0.60; cd <= 0.85; cd += 0.05) {
          for (let cl = 2.5; cl <= 4.5; cl += 0.4) {
            const isCurrentConfig = Math.abs(cd - carSettings.dragCoefficient) < 0.03 && 
                                   Math.abs(cl - (carSettings.clFront + carSettings.clRear)) < 0.3;
            scatter.push({
              drag: cd,
              downforce: cl,
              ldRatio: cl / cd,
              current: isCurrentConfig,
              performance: (cl / cd) * ((370 - cd * 200) / 100) // Combined metric
            });
          }
        }
        setScatterData(scatter);

        // Generate performance trend data (Wing angle vs Lap Time)
        const trends = [];
        const baseTime = 82.5; // Base lap time in seconds
        const currentDrag = carSettings.dragCoefficient;
        const currentDownforce = carSettings.clFront + carSettings.clRear;
        
        // Generate data points for different wing angles
        for (let angle = 18; angle <= 32; angle += 2) {
          const angleRatio = angle / 25; // 25 is mid-point
          const dragPenalty = (angleRatio - 1) * 0.5; // More wing = more drag
          const downforceGain = (angleRatio - 1) * 0.3; // More wing = more downforce
          
          const lapTime = baseTime + dragPenalty - downforceGain + (Math.random() - 0.5) * 0.1;
          const topSpeed = 340 - (angle - 25) * 2.5; // Higher angle = lower top speed
          const cornerSpeed = 180 + (angle - 25) * 1.8; // Higher angle = higher corner speed
          
          trends.push({
            angle: angle,
            lapTime: parseFloat(lapTime.toFixed(2)),
            topSpeed: parseFloat(topSpeed.toFixed(1)),
            cornerSpeed: parseFloat(cornerSpeed.toFixed(1)),
            isCurrent: Math.abs(angle - 25) < 1
          });
        }
        setTrendData(trends);

      } catch (error) {
        console.error('Error loading dashboard data:', error);
        
        // Set fallback trend data on error
        const fallbackTrends = [];
        for (let angle = 18; angle <= 32; angle += 2) {
          fallbackTrends.push({
            angle: angle,
            lapTime: 82.5 + (angle - 25) * 0.08,
            topSpeed: 340 - (angle - 25) * 2.5,
            cornerSpeed: 180 + (angle - 25) * 1.8,
            isCurrent: Math.abs(angle - 25) < 1
          });
        }
        setTrendData(fallbackTrends);
        
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
    
    if (setting === 'aeroEfficiency') {
      setCarSettings(prev => ({
        ...prev,
        dragCoefficient: 0.85 - (value / 100) * 0.20,
        clFront: 1.0 + (value / 100) * 1.0,
        clRear: 1.5 + (value / 100) * 1.0
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

  // Custom tooltip for scatter plot
  const CustomScatterTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          background: 'rgba(0, 0, 0, 0.9)',
          border: `2px solid ${data.current ? '#00ff88' : '#00d2ff'}`,
          borderRadius: '8px',
          padding: '12px',
          color: '#fff'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: data.current ? '#00ff88' : '#00d2ff' }}>
            {data.current ? '● CURRENT CONFIG' : 'Configuration'}
          </p>
          <p style={{ margin: '8px 0 4px 0', fontSize: '13px' }}>Drag: {data.drag.toFixed(3)}</p>
          <p style={{ margin: '4px 0', fontSize: '13px' }}>Downforce: {data.downforce.toFixed(2)}</p>
          <p style={{ margin: '4px 0', fontSize: '13px', color: '#00ff88' }}>L/D: {data.ldRatio.toFixed(2)}</p>
        </div>
      );
    }
    return null;
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
            <div className="car-list" style={{ maxHeight: '200px', overflowY: 'auto' }}>
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
                  <span style={{ fontSize: '13px' }}>{team}</span>
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
          </div>
        </motion.div>

        {/* Center Panel - Main Visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="dashboard-center"
          style={{ width: '100%', maxWidth: '900px', margin: '0 20px' }}
        >
          <div className="center-header">
            <h2>Performance Analytics</h2>
            <div className="live-indicator">
              <div className="pulse-dot" />
              <span>LIVE ML DATA</span>
            </div>
          </div>

          {/* Charts Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            {/* Radar Chart - Performance Metrics */}
            <div className="chart-card" style={{ padding: '20px' }}>
              <h4 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Target size={18} color="#00d2ff" />
                Performance Radar
              </h4>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(0, 210, 255, 0.2)" />
                  <PolarAngleAxis 
                    dataKey="metric" 
                    tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]} 
                    tick={{ fill: 'rgba(255, 255, 255, 0.5)', fontSize: 10 }}
                  />
                  <Radar 
                    name="Performance" 
                    dataKey="value" 
                    stroke="#00d2ff" 
                    fill="#00d2ff" 
                    fillOpacity={0.4}
                    strokeWidth={2}
                  />
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(0, 0, 0, 0.9)',
                      border: '2px solid #00d2ff',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Scatter Plot - Drag vs Downforce */}
            <div className="chart-card" style={{ padding: '20px' }}>
              <h4 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <TrendingUp size={18} color="#00ff88" />
                Drag vs Downforce Map
              </h4>
              <ResponsiveContainer width="100%" height={250}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 210, 255, 0.1)" />
                  <XAxis 
                    type="number" 
                    dataKey="drag" 
                    name="Drag Coefficient" 
                    domain={[0.58, 0.87]}
                    tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 11 }}
                    label={{ value: 'Drag (Cd)', position: 'insideBottom', offset: -5, fill: '#fff', fontSize: 12 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="downforce" 
                    name="Downforce" 
                    domain={[2.3, 4.7]}
                    tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 11 }}
                    label={{ value: 'Downforce (CL)', angle: -90, position: 'insideLeft', fill: '#fff', fontSize: 12 }}
                  />
                  <ZAxis type="number" dataKey="ldRatio" range={[20, 400]} />
                  <Tooltip content={<CustomScatterTooltip />} />
                  <Scatter data={scatterData.filter(d => !d.current)} fill="#00d2ff" fillOpacity={0.3} />
                  <Scatter data={scatterData.filter(d => d.current)} fill="#00ff88" fillOpacity={1}>
                    {scatterData.filter(d => d.current).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#00ff88" />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
            <div className="chart-card" style={{ padding: '15px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px' }}>
                Top Speed
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#00ff88' }}>
                {performanceData?.top_speed?.toFixed(2) || 'N/A'}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)' }}>km/h</div>
            </div>
            <div className="chart-card" style={{ padding: '15px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px' }}>
                Corner Speed
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#00d2ff' }}>
                {performanceData?.avg_corner_speed?.toFixed(2) || 'N/A'}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)' }}>km/h</div>
            </div>
            <div className="chart-card" style={{ padding: '15px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px' }}>
                L/D Ratio
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ff8700' }}>
                {performanceData?.ld_ratio?.toFixed(2) || ((carSettings.clFront + carSettings.clRear) / carSettings.dragCoefficient).toFixed(2)}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)' }}>efficiency</div>
            </div>
            <div className="chart-card" style={{ padding: '15px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px' }}>
                Balance
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ff2a4d' }}>
                {performanceData?.overall_balance?.toFixed(0) || '40'}%
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)' }}>front bias</div>
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

          {/* Configuration Summary */}
          <div className="chart-card" style={{ padding: '15px', marginTop: '20px' }}>
            <h4 style={{ marginBottom: '12px', fontSize: '14px' }}>Current Config</h4>
            <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)' }}>
              <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Drag (Cd):</span>
                <span style={{ color: '#00ff88', fontWeight: 'bold' }}>
                  {carSettings.dragCoefficient.toFixed(3)}
                </span>
              </div>
              <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Front CL:</span>
                <span style={{ color: '#00d2ff', fontWeight: 'bold' }}>
                  {carSettings.clFront.toFixed(2)}
                </span>
              </div>
              <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Rear CL:</span>
                <span style={{ color: '#ff8700', fontWeight: 'bold' }}>
                  {carSettings.clRear.toFixed(2)}
                </span>
              </div>
              <div style={{ marginTop: '15px', padding: '12px', background: 'rgba(0, 210, 255, 0.1)', borderRadius: '6px', borderLeft: '3px solid #00d2ff' }}>
                <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>
                  Track
                </div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  {selectedTrack}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;

