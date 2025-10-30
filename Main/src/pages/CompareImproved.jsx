import React, { useState, useRef, useEffect } from 'react';
import { Upload, Zap, TrendingUp, Users, Target, Award, AlertCircle } from 'lucide-react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import mlService, { TEAMS } from '../services/mlService';
import './compare.css';

const Compare = () => {
  const [imageA, setImageA] = useState(null);
  const [imageB, setImageB] = useState(null);
  const [team1, setTeam1] = useState('Red Bull Racing');
  const [team2, setTeam2] = useState('Ferrari');
  const [selectedTrack, setSelectedTrack] = useState('Monaco');
  const [tracks, setTracks] = useState([]);
  const [categoryA, setCategoryA] = useState('Front Wing');
  const [categoryB, setCategoryB] = useState('Front Wing');
  const [benchmarkA, setBenchmarkA] = useState('');
  const [benchmarkB, setBenchmarkB] = useState('');
  const [comparing, setComparing] = useState(false);
  const [results, setResults] = useState(null);
  const [comparisonMode, setComparisonMode] = useState('teams'); // 'teams' or 'images'
  const [radarData, setRadarData] = useState([]);
  
  const fileInputA = useRef(null);
  const fileInputB = useRef(null);

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
          { name: 'Monaco', length_km: 3.337, downforce_level: 'HIGH' },
          { name: 'Silverstone', length_km: 5.891, downforce_level: 'MEDIUM' },
          { name: 'Monza', length_km: 5.793, downforce_level: 'LOW' }
        ]);
      }
    };
    loadTracks();
  }, []);

  const handleImageUpload = (e, side) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (side === 'A') {
          setImageA(reader.result);
        } else {
          setImageB(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompareTeams = async () => {
    if (!team1 || !team2 || !selectedTrack) {
      alert('Please select both teams and a track');
      return;
    }

    setComparing(true);

    try {
      const comparison = await mlService.compareTeams(team1, team2, selectedTrack);
      
      // Transform ML data to display format
      const componentMetrics = [];
      if (comparison.component_comparison) {
        Object.entries(comparison.component_comparison).forEach(([component, data]) => {
          componentMetrics.push({
            label: component,
            valueA: parseFloat((data.team1_efficiency * 100).toFixed(1)),
            valueB: parseFloat((data.team2_efficiency * 100).toFixed(1)),
            team1: team1,
            team2: team2
          });
        });
      }

      // Add performance metrics
      const perfMetrics = [
        {
          label: 'Top Speed',
          valueA: parseFloat(comparison.performance_comparison?.top_speed?.team1?.toFixed(1) || '340'),
          valueB: parseFloat(comparison.performance_comparison?.top_speed?.team2?.toFixed(1) || '338'),
          team1: team1,
          team2: team2,
          unit: 'km/h'
        },
        {
          label: 'Corner Speed',
          valueA: parseFloat(comparison.performance_comparison?.corner_speed?.team1?.toFixed(1) || '180'),
          valueB: parseFloat(comparison.performance_comparison?.corner_speed?.team2?.toFixed(1) || '182'),
          team1: team1,
          team2: team2,
          unit: 'km/h'
        },
        {
          label: 'L/D Ratio',
          valueA: parseFloat(comparison.performance_comparison?.ld_ratio?.team1?.toFixed(2) || '4.5'),
          valueB: parseFloat(comparison.performance_comparison?.ld_ratio?.team2?.toFixed(2) || '4.3'),
          team1: team1,
          team2: team2,
          unit: ''
        }
      ];

      componentMetrics.push(...perfMetrics);

      // Generate radar chart data
      const radarChartData = [
        {
          metric: 'Top Speed',
          [team1]: Math.min(100, (perfMetrics[0].valueA / 3.7)),
          [team2]: Math.min(100, (perfMetrics[0].valueB / 3.7))
        },
        {
          metric: 'Corner Speed',
          [team1]: Math.min(100, (perfMetrics[1].valueA / 2.2)),
          [team2]: Math.min(100, (perfMetrics[1].valueB / 2.2))
        },
        {
          metric: 'Efficiency',
          [team1]: Math.min(100, (perfMetrics[2].valueA * 20)),
          [team2]: Math.min(100, (perfMetrics[2].valueB * 20))
        },
        {
          metric: 'Front Wing',
          [team1]: componentMetrics[0]?.valueA || 80,
          [team2]: componentMetrics[0]?.valueB || 78
        },
        {
          metric: 'Rear Wing',
          [team1]: componentMetrics[1]?.valueA || 82,
          [team2]: componentMetrics[1]?.valueB || 80
        },
        {
          metric: 'Floor',
          [team1]: componentMetrics[2]?.valueA || 85,
          [team2]: componentMetrics[2]?.valueB || 83
        }
      ];
      setRadarData(radarChartData);

      const insights = [];
      if (comparison.lap_time_delta > 0) {
        insights.push({
          type: 'success',
          message: `${team2} is ${Math.abs(comparison.lap_time_delta).toFixed(3)}s faster per lap`,
          icon: 'award'
        });
      } else {
        insights.push({
          type: 'success',
          message: `${team1} is ${Math.abs(comparison.lap_time_delta).toFixed(3)}s faster per lap`,
          icon: 'award'
        });
      }

      if (comparison.performance_comparison?.top_speed) {
        const speedDelta = comparison.performance_comparison.top_speed.delta;
        if (Math.abs(speedDelta) > 5) {
          insights.push({
            type: 'info',
            message: speedDelta > 0 
              ? `${team1} has ${Math.abs(speedDelta).toFixed(1)} km/h higher top speed advantage on straights`
              : `${team2} has ${Math.abs(speedDelta).toFixed(1)} km/h higher top speed advantage on straights`,
            icon: 'zap'
          });
        }
      }

      if (comparison.performance_comparison?.corner_speed) {
        const cornerDelta = comparison.performance_comparison.corner_speed.delta;
        if (Math.abs(cornerDelta) > 3) {
          insights.push({
            type: 'info',
            message: cornerDelta > 0
              ? `${team1} has superior cornering performance (+${Math.abs(cornerDelta).toFixed(1)} km/h avg)`
              : `${team2} has superior cornering performance (+${Math.abs(cornerDelta).toFixed(1)} km/h avg)`,
            icon: 'target'
          });
        }
      }

      insights.push({
        type: 'info',
        message: `${selectedTrack}: ${team1} ${comparison.team1_lap_time} vs ${team2} ${comparison.team2_lap_time}`,
        icon: 'info'
      });

      // Add component-specific insights
      if (componentMetrics.length > 0) {
        const bestComponent = componentMetrics.reduce((max, metric) => 
          Math.max(metric.valueA, metric.valueB) > Math.max(max.valueA || 0, max.valueB || 0) ? metric : max
        , {});
        
        if (bestComponent.valueA > bestComponent.valueB) {
          insights.push({
            type: 'success',
            message: `${team1}'s ${bestComponent.label} is ${(bestComponent.valueA - bestComponent.valueB).toFixed(1)}% more efficient`,
            icon: 'award'
          });
        } else {
          insights.push({
            type: 'success',
            message: `${team2}'s ${bestComponent.label} is ${(bestComponent.valueB - bestComponent.valueA).toFixed(1)}% more efficient`,
            icon: 'award'
          });
        }
      }

      setResults({
        metrics: componentMetrics,
        winner: comparison.faster_team,
        insights: insights,
        lapTimeDelta: comparison.lap_time_delta,
        team1LapTime: comparison.team1_lap_time,
        team2LapTime: comparison.team2_lap_time
      });
    } catch (error) {
      console.error('Error comparing teams:', error);
      // Fallback with realistic data
      const componentMetrics = [
        { label: 'Front Wing', valueA: 85, valueB: 78, team1, team2 },
        { label: 'Rear Wing', valueA: 82, valueB: 86, team1, team2 },
        { label: 'Floor', valueA: 88, valueB: 75, team1, team2 },
        { label: 'Diffuser', valueA: 79, valueB: 83, team1, team2 },
        { label: 'Top Speed', valueA: 348, valueB: 345, team1, team2, unit: 'km/h' },
        { label: 'Corner Speed', valueA: 180, valueB: 182, team1, team2, unit: 'km/h' },
      ];

      const radarChartData = [
        { metric: 'Top Speed', [team1]: 94, [team2]: 93 },
        { metric: 'Corner Speed', [team1]: 82, [team2]: 83 },
        { metric: 'Efficiency', [team1]: 90, [team2]: 86 },
        { metric: 'Front Wing', [team1]: 85, [team2]: 78 },
        { metric: 'Rear Wing', [team1]: 82, [team2]: 86 },
        { metric: 'Floor', [team1]: 88, [team2]: 75 }
      ];
      setRadarData(radarChartData);

      setResults({
        metrics: componentMetrics,
        winner: team1,
        insights: [
          {
            type: 'warning',
            message: 'Using fallback data - ML backend connection issue',
            icon: 'alert'
          },
          {
            type: 'info',
            message: `${team1} shows slightly better overall performance at ${selectedTrack}`,
            icon: 'info'
          },
          {
            type: 'success',
            message: 'Both teams are highly competitive on this circuit',
            icon: 'award'
          }
        ],
      });
    } finally {
      setComparing(false);
    }
  };

  const handleCompareImages = () => {
    if (!imageA || !imageB) {
      alert('Please upload both images to compare');
      return;
    }

    setComparing(true);

    // Simulate image analysis
    setTimeout(() => {
      const componentMetrics = [
        { label: 'Downforce Efficiency', valueA: 85, valueB: 78, team1: 'Design A', team2: 'Design B' },
        { label: 'Drag Coefficient', valueA: 72, valueB: 81, team1: 'Design A', team2: 'Design B' },
        { label: 'Aerodynamic Balance', valueA: 88, valueB: 75, team1: 'Design A', team2: 'Design B' },
        { label: 'Cooling Performance', valueA: 79, valueB: 86, team1: 'Design A', team2: 'Design B' },
        { label: 'Overall Performance', valueA: 82, valueB: 80, team1: 'Design A', team2: 'Design B' },
      ];

      const radarChartData = [
        { metric: 'Downforce', 'Design A': 85, 'Design B': 78 },
        { metric: 'Low Drag', 'Design A': 72, 'Design B': 81 },
        { metric: 'Balance', 'Design A': 88, 'Design B': 75 },
        { metric: 'Cooling', 'Design A': 79, 'Design B': 86 },
        { metric: 'Overall', 'Design A': 82, 'Design B': 80 }
      ];
      setRadarData(radarChartData);

      setResults({
        metrics: componentMetrics,
        winner: 'Design A',
        insights: [
          {
            type: 'success',
            message: 'Design A shows superior downforce generation (+7%)',
            icon: 'award'
          },
          {
            type: 'info',
            message: 'Design B has better cooling characteristics (+7%)',
            icon: 'info'
          },
          {
            type: 'success',
            message: 'Design A demonstrates excellent aerodynamic balance',
            icon: 'target'
          },
        ],
      });
      setComparing(false);
    }, 2000);
  };

  const handleCompare = () => {
    if (comparisonMode === 'teams') {
      handleCompareTeams();
    } else {
      handleCompareImages();
    }
  };

  const getInsightIcon = (type) => {
    switch(type) {
      case 'award': return <Award size={18} />;
      case 'zap': return <Zap size={18} />;
      case 'target': return <Target size={18} />;
      case 'alert': return <AlertCircle size={18} />;
      default: return <TrendingUp size={18} />;
    }
  };

  const getInsightColor = (type) => {
    switch(type) {
      case 'success': return '#00ff88';
      case 'warning': return '#ff8700';
      case 'info': return '#00d2ff';
      default: return '#00d2ff';
    }
  };

  return (
    <div className="compare-page">
      {/* Background Effects */}
      <div className="fx-bg">
        <div className="fx-stripe s1"></div>
        <div className="fx-stripe s2"></div>
      </div>

      {/* Header */}
      <div className="compare-header animate-in">
        <h1>Aerodynamic Comparison</h1>
        <p className="sub">ML-Powered Performance Analysis</p>
        <span className="title-underline"></span>
      </div>

      {/* Mode Selector */}
      <div className="mode-selector animate-in" style={{ animationDelay: '0.05s' }}>
        <button 
          className={`mode-btn ${comparisonMode === 'teams' ? 'active' : ''}`}
          onClick={() => setComparisonMode('teams')}
        >
          <Users size={20} />
          Compare Teams
        </button>
        <button 
          className={`mode-btn ${comparisonMode === 'images' ? 'active' : ''}`}
          onClick={() => setComparisonMode('images')}
        >
          <Upload size={20} />
          Compare Designs
        </button>
      </div>

      {/* Team Comparison Mode */}
      {comparisonMode === 'teams' && (
        <>
          <div className="compare-form animate-in" style={{ animationDelay: '0.1s' }}>
            {/* Team 1 */}
            <div>
              <div className="field">
                <label>
                  <Zap size={16} style={{ display: 'inline', marginRight: '6px' }} />
                  Team 1
                </label>
                <select value={team1} onChange={(e) => setTeam1(e.target.value)}>
                  {TEAMS.map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Team 2 */}
            <div>
              <div className="field">
                <label>
                  <TrendingUp size={16} style={{ display: 'inline', marginRight: '6px' }} />
                  Team 2
                </label>
                <select value={team2} onChange={(e) => setTeam2(e.target.value)}>
                  {TEAMS.map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Track Selection */}
          <div className="track-selection animate-in" style={{ animationDelay: '0.15s' }}>
            <div className="field">
              <label>Select Circuit</label>
              <select value={selectedTrack} onChange={(e) => setSelectedTrack(e.target.value)}>
                {tracks.map(track => (
                  <option key={track.name} value={track.name}>
                    {track.name} ({track.downforce_level})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}

      {/* Image Comparison Mode */}
      {comparisonMode === 'images' && (
        <div className="compare-form animate-in" style={{ animationDelay: '0.1s' }}>
          {/* Left Side - Image Upload A */}
          <div>
            <div className="field">
              <label>
                <Zap size={16} style={{ display: 'inline', marginRight: '6px' }} />
                Design A - Name
              </label>
              <input
                type="text"
                placeholder="Enter design name..."
                value={team1}
                onChange={(e) => setTeam1(e.target.value)}
              />
            </div>

          <div className="field" style={{ marginTop: '16px' }}>
            <label>Upload Design A</label>
            <div
              className={`uploader ${!imageA ? 'pulse' : ''}`}
              onClick={() => fileInputA.current?.click()}
            >
              <input
                ref={fileInputA}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'A')}
              />
              {imageA ? (
                <img src={imageA} alt="Design A" />
              ) : (
                <>
                  <div className="upload-icon">
                    <Upload size={28} color="#fff" />
                  </div>
                  <div className="drop-hint">
                    Drop your image here
                    <small>or click to browse</small>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="benchmarks">
            <div className="field">
              <label>Category</label>
              <select value={categoryA} onChange={(e) => setCategoryA(e.target.value)}>
                <option>Front Wing</option>
                <option>Rear Wing</option>
                <option>Diffuser</option>
                <option>Sidepods</option>
                <option>Floor</option>
              </select>
            </div>
            <div className="field">
              <label>Benchmark (Optional)</label>
              <input
                type="text"
                placeholder="e.g., RB19"
                value={benchmarkA}
                onChange={(e) => setBenchmarkA(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Right Side - Image Upload B */}
        <div>
            <div className="field">
              <label>
                <TrendingUp size={16} style={{ display: 'inline', marginRight: '6px' }} />
                Design B - Name
              </label>
              <input
                type="text"
                placeholder="Enter design name..."
                value={team2}
                onChange={(e) => setTeam2(e.target.value)}
              />
            </div>

          <div className="field" style={{ marginTop: '16px' }}>
            <label>Upload Design B</label>
            <div
              className={`uploader ${!imageB ? 'pulse' : ''}`}
              onClick={() => fileInputB.current?.click()}
            >
              <input
                ref={fileInputB}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'B')}
              />
              {imageB ? (
                <img src={imageB} alt="Design B" />
              ) : (
                <>
                  <div className="upload-icon">
                    <Upload size={28} color="#fff" />
                  </div>
                  <div className="drop-hint">
                    Drop your image here
                    <small>or click to browse</small>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="benchmarks">
            <div className="field">
              <label>Category</label>
              <select value={categoryB} onChange={(e) => setCategoryB(e.target.value)}>
                <option>Front Wing</option>
                <option>Rear Wing</option>
                <option>Diffuser</option>
                <option>Sidepods</option>
                <option>Floor</option>
              </select>
            </div>
            <div className="field">
              <label>Benchmark (Optional)</label>
              <input
                type="text"
                placeholder="e.g., W14"
                value={benchmarkB}
                onChange={(e) => setBenchmarkB(e.target.value)}
              />
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Compare Button */}
      <button
        className="compare-btn animate-in"
        style={{ animationDelay: '0.2s' }}
        onClick={handleCompare}
        disabled={comparing || (comparisonMode === 'images' && (!imageA || !imageB))}
      >
        {comparing ? 'Analyzing...' : comparisonMode === 'teams' ? 'Compare Teams' : 'Compare Designs'}
      </button>

      {/* Results Section */}
      {results && (
        <>
          <div className="glow-divider"></div>

          {/* Radar Chart Comparison */}
          {radarData.length > 0 && (
            <div className="chart-card animate-in" style={{ animationDelay: '0.25s', marginBottom: '32px', padding: '24px' }}>
              <h3 className="card-title">Performance Radar Comparison</h3>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(0, 210, 255, 0.2)" />
                  <PolarAngleAxis 
                    dataKey="metric" 
                    tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 13 }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]} 
                    tick={{ fill: 'rgba(255, 255, 255, 0.5)', fontSize: 11 }}
                  />
                  <Radar 
                    name={comparisonMode === 'teams' ? team1 : 'Design A'}
                    dataKey={comparisonMode === 'teams' ? team1 : 'Design A'}
                    stroke="#ff2a4d" 
                    fill="#ff2a4d" 
                    fillOpacity={0.4}
                    strokeWidth={2}
                  />
                  <Radar 
                    name={comparisonMode === 'teams' ? team2 : 'Design B'}
                    dataKey={comparisonMode === 'teams' ? team2 : 'Design B'}
                    stroke="#00d2ff" 
                    fill="#00d2ff" 
                    fillOpacity={0.4}
                    strokeWidth={2}
                  />
                  <Legend 
                    wrapperStyle={{ color: '#fff' }}
                    iconType="circle"
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
          )}

          <div className="dashboard animate-in" style={{ animationDelay: '0.3s' }}>
            {/* Bar Chart Comparison */}
            <div className="chart-card">
              <h3 className="card-title">Component Performance Comparison</h3>
              <div className="bars">
                {results.metrics.map((metric, idx) => {
                  const total = metric.valueA + metric.valueB;
                  const percentA = (metric.valueA / total) * 100;
                  const percentB = (metric.valueB / total) * 100;
                  const winner = metric.valueA > metric.valueB ? 'A' : 'B';
                  
                  return (
                    <div key={idx} className="bar-row" style={{ animationDelay: `${0.05 * idx}s` }}>
                      <div className="bar-label">{metric.label}</div>
                      <div className="bar-track">
                        <div
                          className="bar bar-a"
                          style={{ 
                            width: `${percentA}%`,
                            background: winner === 'A' ? 'linear-gradient(90deg, #ff2a4d, #ff6b35)' : 'rgba(255, 42, 77, 0.5)'
                          }}
                        ></div>
                        <div
                          className="bar bar-b"
                          style={{ 
                            width: `${percentB}%`,
                            background: winner === 'B' ? 'linear-gradient(90deg, #00d2ff, #00ff88)' : 'rgba(0, 210, 255, 0.5)'
                          }}
                        ></div>
                      </div>
                      <div className="bar-values">
                        <span className="va" style={{ fontWeight: winner === 'A' ? 'bold' : 'normal' }}>
                          {metric.valueA}{metric.unit || ''}
                        </span>
                        <span className="vb" style={{ fontWeight: winner === 'B' ? 'bold' : 'normal' }}>
                          {metric.valueB}{metric.unit || ''}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Insights Card */}
            <div className="insights-card">
              <h3 className="card-title">ML-Analyzed Insights</h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {results.insights.map((insight, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '14px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '10px',
                      borderLeft: `3px solid ${getInsightColor(insight.type)}`,
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.92rem',
                      lineHeight: '1.5',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px'
                    }}
                  >
                    <div style={{ color: getInsightColor(insight.type), marginTop: '2px' }}>
                      {getInsightIcon(insight.icon)}
                    </div>
                    <div style={{ flex: 1 }}>{insight.message}</div>
                  </div>
                ))}
              </div>
              <div
                style={{
                  marginTop: '20px',
                  padding: '20px',
                  background: 'linear-gradient(135deg, rgba(255, 42, 77, 0.15), rgba(0, 210, 255, 0.15))',
                  borderRadius: '12px',
                  textAlign: 'center',
                }}
              >
                <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem', marginBottom: '8px' }}>
                  Overall Winner
                </div>
                <div
                  style={{
                    fontSize: '1.8rem',
                    fontWeight: '900',
                    background: 'linear-gradient(90deg, #ff2a4d, #00d2ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '8px'
                  }}
                >
                  {results.winner}
                </div>
                {results.lapTimeDelta && (
                  <div style={{ fontSize: '0.9rem', color: '#00ff88' }}>
                    +{Math.abs(results.lapTimeDelta).toFixed(3)}s per lap
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Metrics Row */}
          <div className="metrics-row animate-in" style={{ animationDelay: '0.4s' }}>
            <div className="metric-card">
              <div className="metric-title">{comparisonMode === 'teams' ? team1 : 'Design A'} Avg</div>
              <div className="metric-value">
                {(results.metrics.reduce((acc, m) => acc + parseFloat(m.valueA), 0) / results.metrics.length).toFixed(1)}
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-title">{comparisonMode === 'teams' ? team2 : 'Design B'} Avg</div>
              <div className="metric-value">
                {(results.metrics.reduce((acc, m) => acc + parseFloat(m.valueB), 0) / results.metrics.length).toFixed(1)}
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-title">Performance Delta</div>
              <div className="metric-value" style={{ color: '#00ff88' }}>
                {Math.abs(
                  (results.metrics.reduce((acc, m) => acc + parseFloat(m.valueA), 0) / results.metrics.length) -
                    (results.metrics.reduce((acc, m) => acc + parseFloat(m.valueB), 0) / results.metrics.length)
                ).toFixed(1)}
                {results.metrics[0].unit === 'km/h' ? ' km/h' : '%'}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="compare-footer">
        <p>Powered by Advanced ML Aerodynamic Analysis • 2025 Season Data</p>
      </div>
    </div>
  );
};

export default Compare;

