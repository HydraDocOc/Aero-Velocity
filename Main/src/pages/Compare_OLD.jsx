import React, { useState, useRef, useEffect } from 'react';
import { Upload, Zap, TrendingUp, Users } from 'lucide-react';
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
  const [comparing, setComparing] = useState(false);
  const [results, setResults] = useState(null);
  const [comparisonMode, setComparisonMode] = useState('teams'); // 'teams' or 'images'
  
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
            valueA: (data.team1_efficiency * 100).toFixed(1),
            valueB: (data.team2_efficiency * 100).toFixed(1)
          });
        });
      }

      // Add performance metrics
      componentMetrics.push(
        {
          label: 'Top Speed',
          valueA: comparison.performance_comparison?.top_speed?.team1?.toFixed(1) || '0',
          valueB: comparison.performance_comparison?.top_speed?.team2?.toFixed(1) || '0'
        },
        {
          label: 'Corner Speed',
          valueA: comparison.performance_comparison?.corner_speed?.team1?.toFixed(1) || '0',
          valueB: comparison.performance_comparison?.corner_speed?.team2?.toFixed(1) || '0'
        }
      );

      const insights = [];
      if (comparison.lap_time_delta > 0) {
        insights.push(`${team2} is ${Math.abs(comparison.lap_time_delta).toFixed(3)}s faster per lap`);
      } else {
        insights.push(`${team1} is ${Math.abs(comparison.lap_time_delta).toFixed(3)}s faster per lap`);
      }

      if (comparison.performance_comparison?.top_speed) {
        const speedDelta = comparison.performance_comparison.top_speed.delta;
        if (Math.abs(speedDelta) > 5) {
          insights.push(
            speedDelta > 0 
              ? `${team1} has ${Math.abs(speedDelta).toFixed(1)} km/h higher top speed`
              : `${team2} has ${Math.abs(speedDelta).toFixed(1)} km/h higher top speed`
          );
        }
      }

      if (comparison.performance_comparison?.corner_speed) {
        const cornerDelta = comparison.performance_comparison.corner_speed.delta;
        if (Math.abs(cornerDelta) > 3) {
          insights.push(
            cornerDelta > 0
              ? `${team1} has superior cornering performance`
              : `${team2} has superior cornering performance`
          );
        }
      }

      insights.push(`Lap times: ${team1} ${comparison.team1_lap_time} vs ${team2} ${comparison.team2_lap_time}`);

      setResults({
        metrics: componentMetrics,
        winner: comparison.faster_team,
        insights: insights,
        lapTimeDelta: comparison.lap_time_delta
      });
    } catch (error) {
      console.error('Error comparing teams:', error);
      // Fallback to mock data
      setResults({
        metrics: [
          { label: 'Front Wing', valueA: 85, valueB: 78 },
          { label: 'Rear Wing', valueA: 82, valueB: 86 },
          { label: 'Floor', valueA: 88, valueB: 75 },
          { label: 'Diffuser', valueA: 79, valueB: 83 },
          { label: 'Top Speed', valueA: 320, valueB: 318 },
          { label: 'Corner Speed', valueA: 180, valueB: 182 },
        ],
        winner: team1,
        insights: [
          'ML backend not connected. Using fallback data.',
          `${team1} shows slightly better overall performance`,
          'Both teams are competitive at this track',
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
      setResults({
        metrics: [
          { label: 'Downforce Efficiency', valueA: 85, valueB: 78 },
          { label: 'Drag Coefficient', valueA: 72, valueB: 81 },
          { label: 'Aerodynamic Balance', valueA: 88, valueB: 75 },
          { label: 'Cooling Performance', valueA: 79, valueB: 86 },
          { label: 'Overall Performance', valueA: 82, valueB: 80 },
        ],
        winner: 'Design A',
        insights: [
          'Design A shows superior downforce generation',
          'Design B has better cooling characteristics',
          'Both designs show excellent aerodynamic balance',
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
        <p className="sub">AI-Powered Performance Analysis</p>
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

          <div className="dashboard animate-in" style={{ animationDelay: '0.3s' }}>
            {/* Chart Card */}
            <div className="chart-card">
              <h3 className="card-title">Performance Comparison</h3>
              <div className="bars">
                {results.metrics.map((metric, idx) => (
                  <div key={idx} className="bar-row" style={{ animationDelay: `${0.1 * idx}s` }}>
                    <div className="bar-label">{metric.label}</div>
                    <div className="bar-track">
                      <div
                        className="bar bar-a"
                        style={{ width: `${(metric.valueA / (metric.valueA + metric.valueB)) * 100}%` }}
                      ></div>
                      <div
                        className="bar bar-b"
                        style={{ width: `${(metric.valueB / (metric.valueA + metric.valueB)) * 100}%` }}
                      ></div>
                    </div>
                    <div className="bar-values">
                      <span className="va">{metric.valueA}</span>
                      <span className="vb">{metric.valueB}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights Card */}
            <div className="insights-card">
              <h3 className="card-title">Key Insights</h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                {results.insights.map((insight, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '16px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      borderRadius: '12px',
                      borderLeft: '3px solid #ff2a4d',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.95rem',
                      lineHeight: '1.6',
                    }}
                  >
                    {insight}
                  </div>
                ))}
              </div>
              <div
                style={{
                  marginTop: '24px',
                  padding: '20px',
                  background: 'linear-gradient(135deg, rgba(255, 42, 77, 0.15), rgba(0, 210, 255, 0.15))',
                  borderRadius: '12px',
                  textAlign: 'center',
                }}
              >
                <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', marginBottom: '8px' }}>
                  Winner
                </div>
                <div
                  style={{
                    fontSize: '1.8rem',
                    fontWeight: '900',
                    background: 'linear-gradient(90deg, #ff2a4d, #00d2ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {results.winner}
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Row */}
          <div className="metrics-row animate-in" style={{ animationDelay: '0.4s' }}>
            <div className="metric-card">
              <div className="metric-title">Avg Performance A</div>
              <div className="metric-value">
                {(results.metrics.reduce((acc, m) => acc + m.valueA, 0) / results.metrics.length).toFixed(1)}
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-title">Avg Performance B</div>
              <div className="metric-value">
                {(results.metrics.reduce((acc, m) => acc + m.valueB, 0) / results.metrics.length).toFixed(1)}
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-title">Performance Delta</div>
              <div className="metric-value">
                {Math.abs(
                  (results.metrics.reduce((acc, m) => acc + m.valueA, 0) / results.metrics.length) -
                    (results.metrics.reduce((acc, m) => acc + m.valueB, 0) / results.metrics.length)
                ).toFixed(1)}
                %
              </div>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="compare-footer">
        <p>Powered by Advanced AI Aerodynamic Analysis</p>
      </div>
    </div>
  );
};

export default Compare;