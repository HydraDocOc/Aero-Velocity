import React, { useState, useEffect } from 'react';
import { Zap, TrendingUp, Users, Target, Award, AlertCircle, Check, X, ArrowRight } from 'lucide-react';
import mlService, { TEAMS } from '../services/mlService';
import './compare.css';

const Compare = () => {
  const [team1, setTeam1] = useState('McLaren');
  const [team2, setTeam2] = useState('Ferrari');
  const [selectedTrack, setSelectedTrack] = useState('Monaco');
  const [tracks, setTracks] = useState([]);
  const [comparing, setComparing] = useState(false);
  const [results, setResults] = useState(null);
  const [componentAnalysis, setComponentAnalysis] = useState(null);

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

  const handleCompareTeams = async () => {
    if (!team1 || !team2 || !selectedTrack) {
      alert('Please select both teams and a track');
      return;
    }

    if (team1 === team2) {
      alert('Please select different teams');
      return;
    }

    setComparing(true);
    setResults(null);
    setComponentAnalysis(null);

    try {
      console.log(`🏎️ Fetching FastF1-based comparison for ${team1} vs ${team2}...`);
      const comparison = await mlService.compareTeams(team1, team2, selectedTrack);
      
      console.log('FastF1 Comparison Data:', comparison);
      
      // Extract performance metrics
      const perfComparison = comparison.performance_comparison;
      
      setResults({
          team1: team1,
          team2: team2,
        track: selectedTrack,
        lapTime: {
          team1: comparison.team1_lap_time,
          team2: comparison.team2_lap_time,
          delta: comparison.lap_time_delta,
          winner: comparison.faster_team
        },
        topSpeed: {
          team1: perfComparison.top_speed.team1,
          team2: perfComparison.top_speed.team2,
          delta: perfComparison.top_speed.delta,
          winner: perfComparison.top_speed.team1 > perfComparison.top_speed.team2 ? team1 : team2
        },
        cornerSpeed: {
          team1: perfComparison.corner_speed.team1,
          team2: perfComparison.corner_speed.team2,
          delta: perfComparison.corner_speed.delta,
          winner: perfComparison.corner_speed.team1 > perfComparison.corner_speed.team2 ? team1 : team2
        },
        ldRatio: {
          team1: perfComparison.ld_ratio.team1,
          team2: perfComparison.ld_ratio.team2,
          delta: perfComparison.ld_ratio.delta,
          winner: perfComparison.ld_ratio.team1 > perfComparison.ld_ratio.team2 ? team1 : team2
        },
        acceleration: {
          team1: perfComparison.acceleration.team1,
          team2: perfComparison.acceleration.team2,
          delta: perfComparison.acceleration.delta,
          winner: perfComparison.acceleration.team1 < perfComparison.acceleration.team2 ? team1 : team2
        },
        drag: {
          team1: perfComparison.drag_coefficient.team1,
          team2: perfComparison.drag_coefficient.team2,
          delta: perfComparison.drag_coefficient.delta,
          winner: perfComparison.drag_coefficient.team1 < perfComparison.drag_coefficient.team2 ? team1 : team2
        },
        downforce: {
          team1: perfComparison.downforce.team1,
          team2: perfComparison.downforce.team2,
          delta: perfComparison.downforce.delta,
          winner: perfComparison.downforce.team1 > perfComparison.downforce.team2 ? team1 : team2
        },
        dataSource: comparison.data_source,
        team1Rank: comparison.team1_rank,
        team2Rank: comparison.team2_rank,
        insights: generateInsights(comparison, team1, team2)
      });

      // Component comparison
      const components = comparison.component_comparison;
      setComponentAnalysis({
        frontWing: {
          team1: components['Front Wing'].team1_efficiency * 100,
          team2: components['Front Wing'].team2_efficiency * 100,
          winner: components['Front Wing'].team1_efficiency > components['Front Wing'].team2_efficiency ? team1 : team2
        },
        rearWing: {
          team1: components['Rear Wing'].team1_efficiency * 100,
          team2: components['Rear Wing'].team2_efficiency * 100,
          winner: components['Rear Wing'].team1_efficiency > components['Rear Wing'].team2_efficiency ? team1 : team2
        },
        sidepods: {
          team1: components['Sidepods'].team1_efficiency * 100,
          team2: components['Sidepods'].team2_efficiency * 100,
          winner: components['Sidepods'].team1_efficiency > components['Sidepods'].team2_efficiency ? team1 : team2
        },
        diffuser: {
          team1: components['Diffuser'].team1_efficiency * 100,
          team2: components['Diffuser'].team2_efficiency * 100,
          winner: components['Diffuser'].team1_efficiency > components['Diffuser'].team2_efficiency ? team1 : team2
        },
        floor: {
          team1: components['Floor'].team1_efficiency * 100,
          team2: components['Floor'].team2_efficiency * 100,
          winner: components['Floor'].team1_efficiency > components['Floor'].team2_efficiency ? team1 : team2
        }
      });

    } catch (error) {
      console.error('Error comparing teams:', error);
    } finally {
      setComparing(false);
    }
  };

  const generateInsights = (comparison, team1, team2) => {
    const insights = [];
    
    // Lap time winner
    if (Math.abs(comparison.lap_time_delta) > 0.001) {
      const winner = comparison.faster_team;
      insights.push({
            type: 'success',
        message: `🏆 ${winner} is ${Math.abs(comparison.lap_time_delta).toFixed(2)}s faster (Avg)`
      });
    }
    
    // Speed analysis
    if (comparison.performance_comparison?.top_speed) {
      const speedDelta = comparison.performance_comparison.top_speed.delta;
      if (Math.abs(speedDelta) > 1) {
        const speedWinner = speedDelta > 0 ? team1 : team2;
        insights.push({
          type: 'info',
          message: `⚡ ${speedWinner} has ${Math.abs(speedDelta).toFixed(1)} km/h higher top speed`
        });
      }
    }
    
    // Corner performance
    if (comparison.performance_comparison?.corner_speed) {
      const cornerDelta = comparison.performance_comparison.corner_speed.delta;
      if (Math.abs(cornerDelta) > 1) {
        const cornerWinner = cornerDelta > 0 ? team1 : team2;
        insights.push({
          type: 'info',
          message: `🎯 ${cornerWinner} has ${Math.abs(cornerDelta).toFixed(1)} km/h better avg corner speed`
        });
      }
    }
    
    return insights;
  };

  return (
    <div className="compare-page">
      {/* Enhanced Animated Background Elements */}
      <div className="grid-overlay"></div>
      <div className="gradient-orb orb-purple"></div>
      <div className="gradient-orb orb-cyan"></div>
      <div className="gradient-orb orb-red"></div>
      <div className="diagonal-lines"></div>
      
      {/* Dynamic Speed Stripes */}
      <div className="fx-bg">
        <div className="fx-stripe s1"></div>
        <div className="fx-stripe s2"></div>
        <div className="fx-stripe s3"></div>
      </div>

      <div style={{ maxWidth: '1600px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

      {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: '900',
            background: 'linear-gradient(135deg, #ef4444 0%, #f97316 50%, #fbbf24 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem',
            letterSpacing: '2px'
          }}>
            TEAM COMPARISON
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.25rem', margin: 0 }}>
            Deep ML Analysis • Computer Vision • Real-time Performance Data
          </p>
      </div>

      {/* Team Comparison */}
      <div>
            {/* Team Selection */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr auto 1fr', 
              gap: '2rem', 
              marginBottom: '2rem',
              alignItems: 'center'
            }}>
              {/* Team 1 */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.9) 100%)',
                padding: '2rem',
                borderRadius: '1.5rem',
                border: '2px solid rgba(239, 68, 68, 0.4)',
                backdropFilter: 'blur(20px)'
              }}>
                <label style={{ color: '#ef4444', fontWeight: '700', fontSize: '1.1rem', display: 'block', marginBottom: '1rem' }}>
                  TEAM 1
                </label>
                <select
                  className="select-control"
                  value={team1}
                  onChange={(e) => setTeam1(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    border: '2px solid rgba(239, 68, 68, 0.3)',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: '#fff',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {TEAMS.map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              </div>

              {/* VS */}
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: '900',
                color: '#fff',
                boxShadow: '0 10px 30px rgba(239, 68, 68, 0.5)'
              }}>
                VS
            </div>

            {/* Team 2 */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.9) 100%)',
                padding: '2rem',
                borderRadius: '1.5rem',
                border: '2px solid rgba(59, 130, 246, 0.4)',
                backdropFilter: 'blur(20px)'
              }}>
                <label style={{ color: '#3b82f6', fontWeight: '700', fontSize: '1.1rem', display: 'block', marginBottom: '1rem' }}>
                  TEAM 2
                </label>
                <select
                  className="select-control"
                  value={team2}
                  onChange={(e) => setTeam2(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    border: '2px solid rgba(59, 130, 246, 0.3)',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: '#fff',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {TEAMS.map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
            </div>
          </div>

            {/* Compare Button */}
            <button
              onClick={handleCompareTeams}
              disabled={comparing}
              style={{
                width: '100%',
                padding: '1.5rem',
                borderRadius: '1rem',
                border: 'none',
                background: comparing 
                  ? 'rgba(71, 85, 105, 0.5)' 
                  : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#fff',
                fontSize: '1.25rem',
                fontWeight: '800',
                cursor: comparing ? 'not-allowed' : 'pointer',
                marginBottom: '3rem',
                boxShadow: comparing ? 'none' : '0 10px 30px rgba(239, 68, 68, 0.5)',
                transition: 'all 0.3s ease'
              }}
            >
              {comparing ? 'ANALYZING...' : 'COMPARE TEAMS'}
            </button>
          </div>

      {/* Results Section */}
      {results && (
          <div style={{ marginTop: '3rem' }}>

            {/* Winner Banner */}
            {results.lapTime && (
              <div style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                padding: '2rem',
                borderRadius: '1.5rem',
                marginBottom: '2rem',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(16, 185, 129, 0.5)'
              }}>
                <Award size={48} color="#fff" style={{ marginBottom: '1rem' }} />
                <h2 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: '900', margin: '0 0 0.5rem 0' }}>
                  {results.lapTime.winner} WINS!
                </h2>
                <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.25rem', margin: 0 }}>
                  {Math.abs(results.lapTime.delta).toFixed(2)}s faster on Avg.
                </p>
              </div>
            )}

            {/* STUNNING VISUAL PERFORMANCE COMPARISON - FastF1 Based */}
            {results.lapTime && (
              <div style={{ marginBottom: '3rem' }}>
                <div style={{ 
                  textAlign: 'center',
                  marginBottom: '3rem'
                }}>
                  <h3 style={{ 
                    color: '#e2e8f0', 
                    fontSize: '2.5rem', 
                    fontWeight: '900', 
                    marginBottom: '0.5rem'
                  }}>
                    🏎️ AERODYNAMIC PERFORMANCE COMPARISON
                  </h3>
                </div>

                {/* Visual Comparison Bars */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.9) 100%)',
                  padding: '3rem',
                  borderRadius: '2rem',
                  border: '2px solid rgba(139, 92, 246, 0.3)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
                }}>
                  <h4 style={{ 
                    color: '#a78bfa', 
                    fontSize: '1.75rem', 
                    fontWeight: '800', 
                    marginBottom: '2.5rem',
                    textAlign: 'center'
                  }}>
                    HEAD-TO-HEAD METRICS
                  </h4>

                  <VisualComparisonBar
                    label="L/D Ratio (Efficiency)"
                    value1={results.ldRatio.team1}
                    value2={results.ldRatio.team2}
                    team1={results.team1}
                    team2={results.team2}
                    max={6}
                    unit=""
                    icon="⚡"
                  />

                  <VisualComparisonBar
                    label="Downforce Coefficient"
                    value1={results.downforce.team1}
                    value2={results.downforce.team2}
                    team1={results.team1}
                    team2={results.team2}
                    max={4.5}
                    unit=""
                    icon="⬇️"
                  />

                  <VisualComparisonBar
                    label="Drag Coefficient"
                    value1={results.drag.team1}
                    value2={results.drag.team2}
                    team1={results.team1}
                    team2={results.team2}
                    max={0.8}
                    unit=""
                    inverted={true}
                    icon="💨"
                  />

                  <VisualComparisonBar
                    label="0-100 km/h Acceleration"
                    value1={results.acceleration.team1}
                    value2={results.acceleration.team2}
                    team1={results.team1}
                    team2={results.team2}
                    max={3.5}
                    unit="s"
                    inverted={true}
                    icon="⏱️"
                  />
                </div>
            </div>
          )}

            {/* ML Insights */}
            {results.insights && results.insights.length > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.9) 100%)',
                padding: '2rem',
                borderRadius: '1.5rem',
                border: '2px solid rgba(139, 92, 246, 0.4)',
                backdropFilter: 'blur(20px)'
              }}>
                <h3 style={{ color: '#8b5cf6', fontSize: '1.75rem', fontWeight: '800', marginBottom: '1.5rem' }}>
                  ML-ANALYZED INSIGHTS
                </h3>
                <div style={{ 
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(124, 58, 237, 0.2) 100%)',
                  padding: '0.75rem 2rem',
                  borderRadius: '2rem',
                  border: '2px solid rgba(139, 92, 246, 0.4)',
                  marginBottom: '1.5rem'
                }}>
                  <span style={{ color: '#a78bfa', fontSize: '0.9rem', fontWeight: '700' }}>
                    📊 Data Source: {results.dataSource || 'FASTF1_2024'} • Ranks: {results.team1} #{results.team1Rank} vs {results.team2} #{results.team2Rank}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {results.insights.map((insight, idx) => (
                    <div key={idx} style={{
                      padding: '1.5rem',
                      background: insight.type === 'success' 
                        ? 'rgba(16, 185, 129, 0.1)' 
                        : 'rgba(59, 130, 246, 0.1)',
                      borderLeft: `4px solid ${insight.type === 'success' ? '#10b981' : '#3b82f6'}`,
                      borderRadius: '0.75rem',
                      color: '#e2e8f0',
                      fontSize: '1.1rem',
                      lineHeight: '1.6'
                    }}>
                      {insight.message}
                      </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.1); opacity: 0.25; }
        }
      `}</style>
                    </div>
                  );
};

// Metric Card Component
const MetricCard = ({ label, value1, value2, team1, team2, winner, delta, format, inverted = false }) => {
  const isTeam1Winner = inverted ? value1 < value2 : value1 > value2;
                  
                  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.9) 100%)',
      padding: '2rem',
      borderRadius: '1.5rem',
      border: '2px solid rgba(71, 85, 105, 0.4)',
      backdropFilter: 'blur(20px)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        padding: '0.5rem 1rem',
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '800',
        color: '#fff'
      }}>
        Δ {delta}
                      </div>

      <h4 style={{ 
        color: '#94a3b8', 
        fontSize: '0.9rem', 
        fontWeight: '600', 
        textTransform: 'uppercase', 
        margin: '0 0 1.5rem 0',
        letterSpacing: '1px'
      }}>
        {label}
      </h4>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ flex: 1 }}>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 0.5rem 0' }}>{team1}</p>
          <p style={{ 
            color: isTeam1Winner ? '#10b981' : '#e2e8f0', 
            fontSize: '2.5rem', 
            fontWeight: '900', 
            margin: 0,
            textShadow: isTeam1Winner ? '0 0 20px rgba(16, 185, 129, 0.5)' : 'none'
          }}>
            {value1}
          </p>
            </div>

        <div style={{
          width: '3px',
          height: '60px',
          background: 'linear-gradient(180deg, #ef4444 0%, #3b82f6 100%)',
          margin: '0 2rem',
          borderRadius: '9999px'
        }}></div>

        <div style={{ flex: 1, textAlign: 'right' }}>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 0.5rem 0' }}>{team2}</p>
          <p style={{ 
            color: !isTeam1Winner ? '#10b981' : '#e2e8f0', 
            fontSize: '2.5rem', 
            fontWeight: '900', 
            margin: 0,
            textShadow: !isTeam1Winner ? '0 0 20px rgba(16, 185, 129, 0.5)' : 'none'
          }}>
            {value2}
          </p>
        </div>
      </div>

      <div style={{
                      display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.75rem',
        background: isTeam1Winner 
          ? 'rgba(239, 68, 68, 0.1)' 
          : 'rgba(59, 130, 246, 0.1)',
        borderRadius: '0.5rem'
      }}>
        <Check size={16} color={isTeam1Winner ? '#ef4444' : '#3b82f6'} />
        <span style={{ 
          color: isTeam1Winner ? '#ef4444' : '#3b82f6', 
          fontSize: '0.9rem', 
          fontWeight: '700' 
        }}>
          {winner} leads by {delta}
                        </span>
                      </div>
                    </div>
                  );
};

// ============================================================================
// STUNNING VISUAL COMPARISON COMPONENTS - FASTF1 BASED
// ============================================================================

// Visual Progress Bar Comparison
const VisualComparisonBar = ({ label, value1, value2, team1, team2, max, unit = '', color1 = '#ef4444', color2 = '#3b82f6', inverted = false, icon }) => {
  const team1Better = inverted ? value1 < value2 : value1 > value2;
  const percentage1 = (value1 / max) * 100;
  const percentage2 = (value2 / max) * 100;
  
  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>{icon}</span>
          <span style={{ color: '#e2e8f0', fontSize: '1.2rem', fontWeight: '700' }}>{label}</span>
        </div>
        <div style={{ 
          background: team1Better ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(71, 85, 105, 0.3)',
          padding: '0.4rem 1rem',
          borderRadius: '2rem',
          fontSize: '0.85rem',
          fontWeight: '800',
          color: '#fff'
        }}>
          Δ {Math.abs(value1 - value2).toFixed(2)}{unit}
              </div>
            </div>

      <div style={{ position: 'relative' }}>
        {/* Team 1 Bar */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ 
                      display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.5rem'
          }}>
            <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '600' }}>{team1}</span>
            <span style={{ color: color1, fontSize: '1.1rem', fontWeight: '800' }}>{value1.toFixed(2)}{unit}</span>
                    </div>
          <div style={{ 
            width: '100%', 
            height: '24px', 
            background: 'rgba(30, 41, 59, 0.6)',
            borderRadius: '1rem',
            overflow: 'hidden',
            border: '1px solid rgba(71, 85, 105, 0.3)'
          }}>
            <div style={{
              width: `${percentage1}%`,
              height: '100%',
              background: team1Better 
                ? `linear-gradient(90deg, ${color1} 0%, ${color1}dd 100%)`
                : `linear-gradient(90deg, ${color1}88 0%, ${color1}66 100%)`,
              borderRadius: '1rem',
              transition: 'width 1s ease',
              boxShadow: team1Better ? `0 0 20px ${color1}66` : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: '0.75rem'
            }}>
              {team1Better && <span style={{ color: '#fff', fontWeight: '800', fontSize: '0.75rem' }}>★</span>}
                  </div>
              </div>
                </div>
        
        {/* Team 2 Bar */}
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginBottom: '0.5rem'
          }}>
            <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '600' }}>{team2}</span>
            <span style={{ color: color2, fontSize: '1.1rem', fontWeight: '800' }}>{value2.toFixed(2)}{unit}</span>
          </div>
          <div style={{ 
            width: '100%', 
            height: '24px', 
            background: 'rgba(30, 41, 59, 0.6)',
            borderRadius: '1rem',
            overflow: 'hidden',
            border: '1px solid rgba(71, 85, 105, 0.3)'
          }}>
            <div style={{
              width: `${percentage2}%`,
              height: '100%',
              background: !team1Better 
                ? `linear-gradient(90deg, ${color2} 0%, ${color2}dd 100%)`
                : `linear-gradient(90deg, ${color2}88 0%, ${color2}66 100%)`,
              borderRadius: '1rem',
              transition: 'width 1s ease',
              boxShadow: !team1Better ? `0 0 20px ${color2}66` : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: '0.75rem'
            }}>
              {!team1Better && <span style={{ color: '#fff', fontWeight: '800', fontSize: '0.75rem' }}>★</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Radial Performance Indicator
const RadialPerformance = ({ label, value, max = 100, color = '#8b5cf6', icon, subtitle }) => {
  const percentage = (value / max) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.9) 100%)',
      padding: '2rem',
      borderRadius: '1.5rem',
      border: `2px solid ${color}40`,
      textAlign: 'center',
      backdropFilter: 'blur(20px)',
      boxShadow: `0 10px 30px ${color}25`
    }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{icon}</div>
      <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 1.5rem' }}>
        {/* Background Circle */}
        <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="60"
            cy="60"
            r="45"
            stroke="rgba(71, 85, 105, 0.3)"
            strokeWidth="10"
            fill="none"
          />
          <circle
            cx="60"
            cy="60"
            r="45"
            stroke={color}
            strokeWidth="10"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
                  style={{
              transition: 'stroke-dashoffset 1.5s ease',
              filter: `drop-shadow(0 0 8px ${color})`
            }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '1.75rem',
                    fontWeight: '900',
          color: color
        }}>
          {value.toFixed(1)}
                </div>
                  </div>
      <div style={{ color: '#e2e8f0', fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem' }}>{label}</div>
      {subtitle && <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{subtitle}</div>}
              </div>
  );
};

// Component Card Component - ENHANCED
const ComponentCard = ({ component, value1, value2, team1, team2, winner, details1, details2, icon, color, enhancedData = {} }) => {
  const team1Better = value1 > value2;
  
  // Render additional metrics based on component type
  const renderEnhancedMetrics = () => {
    if (!enhancedData) return null;
    
    const metrics = [];
    
    // Front Wing specific metrics
    if (component === 'Front Wing') {
      if (enhancedData.wingAngle1 !== undefined) {
        metrics.push({ label: 'Wing Angle', val1: `${enhancedData.wingAngle1.toFixed(1)}°`, val2: `${enhancedData.wingAngle2.toFixed(1)}°`, unit: '', icon: '📐' });
      }
      if (enhancedData.endplateQuality1 !== undefined) {
        metrics.push({ label: 'Endplate Quality', val1: enhancedData.endplateQuality1.toFixed(1), val2: enhancedData.endplateQuality2.toFixed(1), unit: '%', icon: '🎯' });
      }
      if (enhancedData.y250Potential1 !== undefined) {
        metrics.push({ label: 'Y250 Vortex', val1: enhancedData.y250Potential1.toFixed(1), val2: enhancedData.y250Potential2.toFixed(1), unit: '%', icon: '🌪️' });
      }
      if (enhancedData.elementCount1 !== undefined) {
        metrics.push({ label: 'Element Count', val1: enhancedData.elementCount1, val2: enhancedData.elementCount2, unit: '', icon: '📊' });
      }
      if (enhancedData.downforceCd1 !== undefined) {
        metrics.push({ label: 'Downforce Cd', val1: enhancedData.downforceCd1.toFixed(3), val2: enhancedData.downforceCd2.toFixed(3), unit: '', icon: '⬇️' });
      }
    }
    
    // Rear Wing specific metrics
    if (component === 'Rear Wing') {
      if (enhancedData.drsPotential1 !== undefined) {
        metrics.push({ label: 'DRS Potential', val1: enhancedData.drsPotential1.toFixed(1), val2: enhancedData.drsPotential2.toFixed(1), unit: '%', icon: '⚡' });
      }
      if (enhancedData.dragCd1 !== undefined) {
        metrics.push({ label: 'Drag Coefficient', val1: enhancedData.dragCd1.toFixed(3), val2: enhancedData.dragCd2.toFixed(3), unit: '', icon: '💨' });
      }
    }
    
    // Sidepods specific metrics
    if (component === 'Sidepods') {
      if (enhancedData.designType1) {
        metrics.push({ label: 'Design Type', val1: enhancedData.designType1, val2: enhancedData.designType2, unit: '', icon: '🔧' });
      }
      if (enhancedData.coolingCapacity1 !== undefined) {
        metrics.push({ label: 'Cooling Capacity', val1: enhancedData.coolingCapacity1.toFixed(1), val2: enhancedData.coolingCapacity2.toFixed(1), unit: '%', icon: '❄️' });
      }
      if (enhancedData.undercutAgg1 !== undefined) {
        metrics.push({ label: 'Undercut Aggressiveness', val1: enhancedData.undercutAgg1.toFixed(1), val2: enhancedData.undercutAgg2.toFixed(1), unit: '%', icon: '📐' });
      }
    }
    
    // Diffuser specific metrics
    if (component === 'Diffuser') {
      if (enhancedData.expansionAngle1 !== undefined) {
        metrics.push({ label: 'Expansion Angle', val1: `${enhancedData.expansionAngle1.toFixed(1)}°`, val2: `${enhancedData.expansionAngle2.toFixed(1)}°`, unit: '', icon: '📐' });
      }
      if (enhancedData.strakeCount1 !== undefined) {
        metrics.push({ label: 'Strake Count', val1: enhancedData.strakeCount1, val2: enhancedData.strakeCount2, unit: '', icon: '🔢' });
      }
      if (enhancedData.downforceContribution1 !== undefined) {
        metrics.push({ label: 'Downforce Contribution', val1: enhancedData.downforceContribution1.toFixed(1), val2: enhancedData.downforceContribution2.toFixed(1), unit: '%', icon: '⬇️' });
      }
    }
    
    // Floor specific metrics
    if (component === 'Floor') {
      if (enhancedData.fenceCount1 !== undefined) {
        metrics.push({ label: 'Fence Count', val1: enhancedData.fenceCount1, val2: enhancedData.fenceCount2, unit: '', icon: '🔢' });
      }
      if (enhancedData.edgeWingComplexity1 !== undefined) {
        metrics.push({ label: 'Edge Wing Complexity', val1: enhancedData.edgeWingComplexity1.toFixed(1), val2: enhancedData.edgeWingComplexity2.toFixed(1), unit: '%', icon: '📊' });
      }
      if (enhancedData.groundEffect1 !== undefined) {
        metrics.push({ label: 'Ground Effect', val1: enhancedData.groundEffect1.toFixed(1), val2: enhancedData.groundEffect2.toFixed(1), unit: '%', icon: '🌀' });
      }
    }
    
    if (metrics.length === 0) return null;
    
    return (
      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        background: 'rgba(15, 23, 42, 0.6)',
        borderRadius: '0.75rem',
        border: `1px solid ${color}30`
      }}>
        <h5 style={{ color: color, fontSize: '0.95rem', fontWeight: '700', margin: '0 0 0.75rem 0', textAlign: 'center' }}>
          📊 DETAILED METRICS
        </h5>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {metrics.map((metric, idx) => (
            <div key={idx} style={{
              padding: '0.75rem',
              background: 'rgba(30, 41, 59, 0.5)',
              borderRadius: '0.625rem',
              border: '1px solid rgba(71, 85, 105, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '1rem' }}>{metric.icon}</span>
                <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '600' }}>{metric.label}</span>
            </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <p style={{ color: '#64748b', fontSize: '0.65rem', margin: '0 0 0.2rem 0' }}>{team1}</p>
                  <p style={{ color: '#e2e8f0', fontSize: '1rem', fontWeight: '800', margin: 0 }}>
                    {metric.val1}{metric.unit}
                  </p>
          </div>
                <div style={{ color: '#475569', fontSize: '0.65rem', fontWeight: '700' }}>VS</div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <p style={{ color: '#64748b', fontSize: '0.65rem', margin: '0 0 0.2rem 0' }}>{team2}</p>
                  <p style={{ color: '#e2e8f0', fontSize: '1rem', fontWeight: '800', margin: 0 }}>
                    {metric.val2}{metric.unit}
                  </p>
              </div>
            </div>
              </div>
          ))}
            </div>
              </div>
    );
  };
  
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.9) 100%)',
      padding: '1.5rem',
      borderRadius: '1rem',
      border: `2px solid ${color}40`,
      backdropFilter: 'blur(20px)',
      marginBottom: '1rem',
      boxShadow: `0 15px 40px ${color}20`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Glow effect */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-50%',
        width: '150px',
        height: '150px',
        background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
        borderRadius: '50%',
        filter: 'blur(50px)',
        pointerEvents: 'none'
      }}></div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', position: 'relative', zIndex: 1 }}>
        <div style={{
          width: '45px',
          height: '45px',
          borderRadius: '0.75rem',
          background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          boxShadow: `0 8px 20px ${color}60`
        }}>
          {icon}
            </div>
        <div>
          <h4 style={{ color: color, fontSize: '1.35rem', fontWeight: '900', margin: 0 }}>
            {component}
          </h4>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
            Deep CV + ML Analysis
          </p>
          </div>
              </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1.25rem', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        {/* Team 1 */}
        <div>
          <div style={{
            padding: '1.25rem',
            background: team1Better ? 'rgba(16, 185, 129, 0.2)' : 'rgba(51, 65, 85, 0.6)',
            borderRadius: '0.875rem',
            border: team1Better ? '2px solid #10b981' : '1.5px solid rgba(71, 85, 105, 0.4)',
            textAlign: 'center',
            boxShadow: team1Better ? '0 8px 20px rgba(16, 185, 129, 0.3)' : 'none'
          }}>
            <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '0 0 0.75rem 0', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '700' }}>{team1}</p>
            <p style={{ 
              color: team1Better ? '#10b981' : '#e2e8f0', 
              fontSize: '2.5rem', 
              fontWeight: '900', 
              margin: '0 0 0.5rem 0',
              textShadow: team1Better ? '0 0 20px rgba(16, 185, 129, 0.6)' : 'none'
            }}>
              {value1.toFixed(1)}%
            </p>
            {details1 && (
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0, lineHeight: '1.4', fontWeight: '500' }}>
                {details1}
              </p>
            )}
            </div>
              </div>

        {/* Winner Arrow */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <ArrowRight 
            size={28} 
            color={team1Better ? '#ef4444' : '#3b82f6'}
            style={{
              transform: team1Better ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.3s ease',
              filter: `drop-shadow(0 0 8px ${team1Better ? '#ef4444' : '#3b82f6'})`
            }}
          />
          <span style={{ 
            color: '#fff', 
            fontSize: '0.75rem', 
            fontWeight: '800',
            textAlign: 'center',
            background: team1Better ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            padding: '0.4rem 0.75rem',
            borderRadius: '9999px',
            boxShadow: team1Better ? '0 3px 12px rgba(239, 68, 68, 0.4)' : '0 3px 12px rgba(59, 130, 246, 0.4)'
          }}>
            +{Math.abs(value1 - value2).toFixed(1)}%
          </span>
            </div>

        {/* Team 2 */}
        <div>
          <div style={{
            padding: '1.25rem',
            background: !team1Better ? 'rgba(16, 185, 129, 0.2)' : 'rgba(51, 65, 85, 0.6)',
            borderRadius: '0.875rem',
            border: !team1Better ? '2px solid #10b981' : '1.5px solid rgba(71, 85, 105, 0.4)',
            textAlign: 'center',
            boxShadow: !team1Better ? '0 8px 20px rgba(16, 185, 129, 0.3)' : 'none'
          }}>
            <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '0 0 0.75rem 0', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '700' }}>{team2}</p>
            <p style={{ 
              color: !team1Better ? '#10b981' : '#e2e8f0', 
              fontSize: '2.5rem', 
              fontWeight: '900', 
              margin: '0 0 0.5rem 0',
              textShadow: !team1Better ? '0 0 20px rgba(16, 185, 129, 0.6)' : 'none'
            }}>
              {value2.toFixed(1)}%
            </p>
            {details2 && (
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0, lineHeight: '1.4', fontWeight: '500' }}>
                {details2}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Metrics */}
      {renderEnhancedMetrics()}

      {/* Winner Banner */}
      <div style={{
        marginTop: '1.25rem',
        padding: '0.875rem',
        background: `linear-gradient(135deg, ${color}25 0%, ${color}15 100%)`,
        borderRadius: '0.75rem',
        textAlign: 'center',
        border: `1.5px solid ${color}50`,
        boxShadow: `0 6px 18px ${color}20`
      }}>
        <span style={{ color: color, fontWeight: '800', fontSize: '1rem', textShadow: `0 0 8px ${color}60` }}>
          ✓ {winner} has the superior {component.toLowerCase()}
        </span>
      </div>
    </div>
  );
};

export default Compare;
