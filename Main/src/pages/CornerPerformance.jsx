import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, Zap, AlertCircle, Info, Wrench, BarChart3, Target, Trophy, Flag, MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, Area, ComposedChart } from 'recharts';
import mlService from '../services/mlService';

const CornerPerformanceMatrix = () => {
  const [selectedTrack, setSelectedTrack] = useState('Monza');
  const [selectedCar, setSelectedCar] = useState(null);
  const [animateIn, setAnimateIn] = useState(false);
  const [showExplanation, setShowExplanation] = useState(true);
  const [loading, setLoading] = useState(false);
  const [dataMetadata, setDataMetadata] = useState({});

  // 2025 F1 CALENDAR - All 24 Races
  const ALL_2025_TRACKS = [
    { name: 'Bahrain', flag: '🇧🇭', location: 'Sakhir' },
    { name: 'Saudi Arabia', flag: '🇸🇦', location: 'Jeddah' },
    { name: 'Australia', flag: '🇦🇺', location: 'Melbourne' },
    { name: 'China', flag: '🇨🇳', location: 'Shanghai' },
    { name: 'Miami', flag: '🇺🇸', location: 'Miami' },
    { name: 'Imola', flag: '🇮🇹', location: 'Imola' },
    { name: 'Monaco', flag: '🇲🇨', location: 'Monte Carlo' },
    { name: 'Barcelona', flag: '🇪🇸', location: 'Barcelona' },
    { name: 'Canada', flag: '🇨🇦', location: 'Montreal' },
    { name: 'Austria', flag: '🇦🇹', location: 'Spielberg' },
    { name: 'Silverstone', flag: '🇬🇧', location: 'Silverstone' },
    { name: 'Hungary', flag: '🇭🇺', location: 'Budapest' },
    { name: 'Spa', flag: '🇧🇪', location: 'Spa-Francorchamps' },
    { name: 'Zandvoort', flag: '🇳🇱', location: 'Zandvoort' },
    { name: 'Monza', flag: '🇮🇹', location: 'Monza' },
    { name: 'Azerbaijan', flag: '🇦🇿', location: 'Baku' },
    { name: 'Singapore', flag: '🇸🇬', location: 'Marina Bay' },
    { name: 'USA', flag: '🇺🇸', location: 'Austin' },
    { name: 'Mexico', flag: '🇲🇽', location: 'Mexico City' },
    { name: 'Brazil', flag: '🇧🇷', location: 'São Paulo' },
    { name: 'Las Vegas', flag: '🇺🇸', location: 'Las Vegas' },
    { name: 'Qatar', flag: '🇶🇦', location: 'Lusail' },
    { name: 'Abu Dhabi', flag: '🇦🇪', location: 'Yas Marina' },
    { name: 'Suzuka', flag: '🇯🇵', location: 'Suzuka' },
  ];

  // All 10 F1 Teams for 2025
  const ALL_TEAMS = [
    'Red Bull Racing',
    'Ferrari',
    'Mercedes',
    'McLaren',
    'Aston Martin',
    'Alpine',
    'Williams',
    'Racing Bulls',
    'Kick Sauber',
    'Haas'
  ];

  const [performanceData, setPerformanceData] = useState(() => {
    const initialData = {};
    ALL_2025_TRACKS.forEach(track => {
      initialData[track.name] = {};
      ALL_TEAMS.forEach((team, idx) => {
        // Generate slightly different initial values for each team based on index
        // This ensures the UI shows something until real data loads
        const variance = (idx - 4.5) * 0.5; // Range from -2.25 to 2.25
        initialData[track.name][team] = { 
          slow: parseFloat((150 + variance).toFixed(2)), 
          medium: parseFloat((215 + variance * 1.5).toFixed(2)), 
          fast: parseFloat((315 + variance * 2).toFixed(2)) 
        };
      });
    });
    return initialData;
  });

  const cornerTypes = ['slow', 'medium', 'fast'];

  useEffect(() => {
    setAnimateIn(true);
  }, []);

  // Load real data from backend
  useEffect(() => {
    const loadRealData = async () => {
      setLoading(true);
      try {
        console.log(`🔄 Loading data for ${selectedTrack}...`);
        const response = await mlService.getCornerPerformance(selectedTrack);
        console.log(`✅ Received response for ${selectedTrack}:`, response);
        
        // Handle new response structure with teams + metadata
        const teamData = response.teams || response; // Backwards compatible
        const metadata = response.metadata || { data_quality: 'UNKNOWN' };
        
        // Store metadata
        setDataMetadata(prev => ({
          ...prev,
          [selectedTrack]: metadata
        }));
        
        // Log data source info
        console.log(`📡 DATA SOURCE: ${metadata.data_quality}`);
        console.log(`   Real Telemetry: ${metadata.real_telemetry_count || 0}/${metadata.total_teams || 0} teams`);
        
        // Verify data has variance
        const teams = Object.keys(teamData);
        if (teams.length > 0) {
          console.log(`📊 Sample data comparison:`, {
            [teams[0]]: teamData[teams[0]],
            [teams[teams.length-1]]: teamData[teams[teams.length-1]]
          });
          
          // Check Racing Bulls specifically
          if (teamData['Racing Bulls']) {
            console.log(`🏎️ Racing Bulls data:`, teamData['Racing Bulls']);
          } else {
            console.warn(`⚠️ Racing Bulls data NOT FOUND in response. Available teams:`, teams);
          }
        }
        
        setPerformanceData(prev => ({
          ...prev,
          [selectedTrack]: teamData
        }));
      } catch (error) {
        console.error('❌ Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadRealData();
  }, [selectedTrack]);

  const getColor = (value, type) => {
    // Realistic F1 apex speed ranges (from real telemetry):
    // Slow: Monaco hairpin ~50-70 km/h, tight chicanes ~60-85 km/h, general ~70-100 km/h
    // Medium: ~100-150 km/h typical, faster ~130-180 km/h
    // Fast: Spa Eau Rouge ~280-310 km/h, Copse/Lesmo ~250-300 km/h
    const ranges = {
      slow: { min: 40, max: 110 },    // Monaco hairpin ~50-70 km/h
      medium: { min: 90, max: 180 },   // Typical medium corners
      fast: { min: 180, max: 320 }     // Spa Eau Rouge ~280-310 km/h
    };
    const range = ranges[type];
    const normalized = (value - range.min) / (range.max - range.min);
    
    if (normalized >= 0.7) return { bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', text: '#fff', glow: 'rgba(16, 185, 129, 0.5)' };
    if (normalized >= 0.4) return { bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', text: '#fff', glow: 'rgba(245, 158, 11, 0.5)' };
    return { bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', text: '#fff', glow: 'rgba(239, 68, 68, 0.5)' };
  };

  const getPerformanceLevel = (value, type) => {
    // Realistic F1 apex speed ranges (from real telemetry):
    // Slow corners: 40-110 km/h apex (Monaco hairpin ~50-70 km/h, general ~70-100 km/h)
    // Medium corners: 90-180 km/h apex (typical ~100-150 km/h)
    // Fast corners: 180-320 km/h apex (Spa Eau Rouge ~280-310 km/h)
    const ranges = {
      slow: { min: 40, max: 110 },
      medium: { min: 90, max: 180 },
      fast: { min: 180, max: 320 }
    };
    const range = ranges[type];
    const normalized = (value - range.min) / (range.max - range.min);
    
    // More realistic thresholds based on F1 performance distribution
    if (normalized >= 0.75) return 'Excellent';  // Top 25%
    if (normalized >= 0.50) return 'Average';    // Middle 50%
    return 'Needs Improvement';                   // Bottom 25%
  };

  const getAIInsights = (car) => {
    const data = performanceData[selectedTrack]?.[car];
    if (!data) return [];
    
    // Use backend-generated insights if available (from real FastF1 data)
    if (data.ai_insights && Array.isArray(data.ai_insights) && data.ai_insights.length > 0) {
      return data.ai_insights;
    }
    
    // Fallback to frontend-generated insights if backend didn't provide them
    const insights = [];
    
    // Realistic thresholds for apex speeds (track-specific):
    // Slow corners: Excellent >=85 km/h (tight tracks), >=75 km/h (normal), Poor <=55 km/h
    // Medium corners: Excellent >=150 km/h, Poor <=110 km/h
    // Fast corners: Excellent >=280 km/h, Poor <=220 km/h
    
    if (data.slow >= 85) {
      insights.push({ type: 'strength', text: 'Dominant in slow-speed corners - excellent mechanical grip' });
    } else if (data.slow <= 55) {
      insights.push({ type: 'weakness', text: 'Struggles in slow corners - improve low-speed downforce' });
    }
    
    if (data.fast >= 280) {
      insights.push({ type: 'strength', text: 'Superior high-speed stability - strong aerodynamic package' });
    } else if (data.fast <= 220) {
      insights.push({ type: 'weakness', text: 'Losing time in fast corners - increase rear downforce by ~5%' });
    }
    
    if (data.medium >= 150) {
      insights.push({ type: 'strength', text: 'Excellent mid-corner balance' });
    } else if (data.medium <= 110) {
      insights.push({ type: 'weakness', text: 'Mid-corner instability detected' });
    }
    
    return insights;
  };

  const getEngineeringRecommendations = (car) => {
    const data = performanceData[selectedTrack]?.[car];
    if (!data) return [];
    
    // Use backend-generated recommendations if available (from real FastF1 data)
    if (data.engineering_recommendations && Array.isArray(data.engineering_recommendations) && data.engineering_recommendations.length > 0) {
      return data.engineering_recommendations;
    }
    
    // Fallback to frontend-generated recommendations if backend didn't provide them
    const recommendations = [];

    // Realistic thresholds for apex speeds:
    // Slow corners: Poor <=55 km/h, Marginal 55-70 km/h
    // Medium corners: Poor <=110 km/h, Marginal 110-130 km/h
    // Fast corners: Poor <=220 km/h, Marginal 220-260 km/h
    
    if (data.slow <= 55) {
      recommendations.push({
        priority: 'High',
        area: 'Slow Corners',
        issue: 'Insufficient mechanical grip',
        solutions: [
          'Increase front wing angle by 2-3° to improve front-end grip',
          'Soften front suspension by 10% for better compliance over kerbs',
          'Review differential settings - consider more locking on entry',
          'Optimize tire pressure: reduce front by 0.2 PSI for better contact patch'
        ]
      });
    } else if (data.slow <= 70) {
      recommendations.push({
        priority: 'Medium',
        area: 'Slow Corners',
        issue: 'Marginal performance deficit',
        solutions: ['Fine-tune front wing angle (+1°)', 'Adjust brake bias forward by 1-2% for better rotation']
      });
    }

    if (data.medium <= 110) {
      recommendations.push({
        priority: 'High',
        area: 'Medium Corners',
        issue: 'Balance issues affecting mid-corner speed',
        solutions: [
          'Increase rear wing angle by 1-2° for better stability',
          'Stiffen anti-roll bars by 5% to reduce body roll',
          'Review suspension geometry - adjust toe angles',
          'Consider raising ride height by 2mm for better aero balance'
        ]
      });
    } else if (data.medium <= 130) {
      recommendations.push({
        priority: 'Medium',
        area: 'Medium Corners',
        issue: 'Minor stability concerns',
        solutions: ['Adjust rear wing flap angle (+0.5°)', 'Review damper settings for better weight transfer']
      });
    }

    if (data.fast <= 220) {
      recommendations.push({
        priority: 'Critical',
        area: 'Fast Corners',
        issue: 'Aerodynamic efficiency deficit',
        solutions: [
          'Reduce drag coefficient by 3-4% - optimize rear wing profile',
          'Increase rear downforce by 5% without compromising drag',
          'Review floor design - seal edges to prevent flow separation',
          'Lower ride height by 3mm (if regulations permit)',
          'Consider DRS optimization for straight-line speed recovery'
        ]
      });
    } else if (data.fast <= 260) {
      recommendations.push({
        priority: 'Medium',
        area: 'Fast Corners',
        issue: 'Aerodynamic refinement needed',
        solutions: ['Fine-tune rear wing angle (-0.5° to reduce drag)', 'Optimize floor edge sealing']
      });
    }

    const speedDiff = Math.abs(data.slow - 150) + Math.abs(data.medium - 218) + Math.abs(data.fast - 315);
    if (speedDiff > 30) {
      recommendations.push({
        priority: 'High',
        area: 'Overall Balance',
        issue: 'Car setup lacks consistency across corner types',
        solutions: [
          'Complete aerodynamic mapping session to identify balance issues',
          'Review weight distribution - consider ballast repositioning',
          'Correlation study between CFD data and track performance'
        ]
      });
    }

    return recommendations.sort((a, b) => {
      const priority = { 'Critical': 0, 'High': 1, 'Medium': 2 };
      return priority[a.priority] - priority[b.priority];
    });
  };

  const getBarChartData = () => {
    const data = ALL_TEAMS.map(car => {
      const teamData = performanceData[selectedTrack]?.[car] || { slow: 0, medium: 0, fast: 0 };
      return {
        name: car.replace(' Racing', '').substring(0, 12),
        Slow: parseFloat((teamData.slow || 0).toFixed(2)),
        Medium: parseFloat((teamData.medium || 0).toFixed(2)),
        Fast: parseFloat((teamData.fast || 0).toFixed(2))
      };
    });
    
    // Log for debugging
    console.log(`📊 Bar Chart Data for ${selectedTrack}:`, data);
    return data;
  };

  const getRadarChartData = (car) => {
    const data = performanceData[selectedTrack][car];
    if (!data) return [];
    return [
      { corner: 'Slow', value: parseFloat((((data.slow - 140) / 20) * 100).toFixed(2)) },
      { corner: 'Medium', value: parseFloat((((data.medium - 205) / 25) * 100).toFixed(2)) },
      { corner: 'Fast', value: parseFloat((((data.fast - 300) / 30) * 100).toFixed(2)) }
    ];
  };

  const getLineChartData = () => {
    const data = cornerTypes.map(type => {
      const cornerData = { name: type.charAt(0).toUpperCase() + type.slice(1) };
      ALL_TEAMS.forEach(team => {
        const teamData = performanceData[selectedTrack]?.[team] || {};
        const shortName = team.replace(' Racing', '').substring(0, 12);
        cornerData[shortName] = parseFloat((teamData[type] || 0).toFixed(2));
      });
      return cornerData;
    });
    
    // Log for debugging
    console.log(`📈 Line Chart Data for ${selectedTrack}:`, data);
    return data;
  };

  const teamColors = {
    'Red Bull Racing': '#1E41FF',
    'Ferrari': '#DC0000',
    'Mercedes': '#00D2BE',
    'McLaren': '#FF8700',
    'Aston Martin': '#006F62',
    'Alpine': '#0090FF',
    'Williams': '#005AFF',
    'Racing Bulls': '#2B4562',
    'Kick Sauber': '#00E701',
    'Haas': '#B6BABD'
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a0f2e 25%, #0f0a1e 50%, #1e1b4b 75%, #0a0e27 100%)',
      color: '#fff',
      padding: '2rem 1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        animation: 'pulse 8s ease-in-out infinite',
        pointerEvents: 'none'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '5%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        animation: 'pulse 10s ease-in-out infinite',
        animationDelay: '2s',
        pointerEvents: 'none'
      }}></div>

      <div style={{
        maxWidth: '1600px',
        margin: '0 auto',
        opacity: animateIn ? 1 : 0,
        transform: animateIn ? 'translateY(0)' : 'translateY(-20px)',
        transition: 'all 1s ease',
        position: 'relative',
        zIndex: 1
      }}>
        
        {/* Header */}
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
            <Trophy size={56} color="#ef4444" style={{ animation: 'float 3s ease-in-out infinite' }} />
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: '900',
              background: 'linear-gradient(135deg, #ef4444 0%, #f97316 50%, #fbbf24 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0,
              letterSpacing: '2px',
              textShadow: '0 0 30px rgba(239, 68, 68, 0.5)'
            }}>
              CORNER PERFORMANCE MATRIX
            </h1>
            <Flag size={56} color="#f97316" style={{ animation: 'float 3s ease-in-out infinite', animationDelay: '0.5s' }} />
          </div>
          <p style={{ color: '#94a3b8', fontSize: '1.25rem', margin: '0 0 1rem 0', fontWeight: '500' }}>
            2025 F1 Season • Advanced Telemetry Analysis • Real-time ML Insights
          </p>
          {dataMetadata[selectedTrack] && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1.5rem',
              borderRadius: '9999px',
              background: dataMetadata[selectedTrack].data_quality === 'REAL' 
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : dataMetadata[selectedTrack].data_quality === 'MIXED'
                ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: '#fff',
              fontSize: '0.875rem',
              fontWeight: '700',
              letterSpacing: '0.5px',
              boxShadow: dataMetadata[selectedTrack].data_quality === 'REAL'
                ? '0 6px 20px rgba(16, 185, 129, 0.5)'
                : dataMetadata[selectedTrack].data_quality === 'MIXED'
                ? '0 6px 20px rgba(251, 191, 36, 0.5)'
                : '0 6px 20px rgba(139, 92, 246, 0.5)'
            }}>
              <span style={{ fontSize: '1.25rem' }}>
                {dataMetadata[selectedTrack].data_quality === 'REAL' ? '📡' : 
                 dataMetadata[selectedTrack].data_quality === 'MIXED' ? '⚡' : '🤖'}
              </span>
              <span>
                {dataMetadata[selectedTrack].data_quality === 'REAL' && `REAL FASTF1 DATA (${dataMetadata[selectedTrack].real_telemetry_count}/${dataMetadata[selectedTrack].total_teams} teams)`}
                {dataMetadata[selectedTrack].data_quality === 'MIXED' && `MIXED DATA (${dataMetadata[selectedTrack].real_telemetry_count} real, ${dataMetadata[selectedTrack].ml_physics_count} simulated)`}
                {dataMetadata[selectedTrack].data_quality === 'SIMULATED' && 'ML + PHYSICS SIMULATION'}
              </span>
            </div>
          )}
        </div>

        {/* Explanation Section */}
        {showExplanation && (
          <div style={{
            marginBottom: '2rem',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)',
            padding: '2rem',
            borderRadius: '1.5rem',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            backdropFilter: 'blur(20px)',
            position: 'relative',
            boxShadow: '0 10px 40px rgba(59, 130, 246, 0.2)',
            animation: 'slideDown 0.6s ease-out'
          }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
              <Info size={28} color="#3b82f6" style={{ flexShrink: 0, marginTop: '0.25rem' }} />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#3b82f6', marginBottom: '1rem', marginTop: 0 }}>
                  How to Interpret This Matrix
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: '#cbd5e1', lineHeight: '1.7', fontSize: '1.05rem' }}>
                  <p style={{ margin: 0 }}>
                    <strong style={{ color: '#fff' }}>Corner Types:</strong> Corners are categorized by speed - 
                    <span style={{ color: '#facc15', fontWeight: '700' }}> Slow (140-160 km/h)</span> tests mechanical grip and suspension, 
                    <span style={{ color: '#3b82f6', fontWeight: '700' }}> Medium (205-230 km/h)</span> evaluates overall balance, and 
                    <span style={{ color: '#10b981', fontWeight: '700' }}> Fast (300-330 km/h)</span> measures aerodynamic efficiency.
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong style={{ color: '#fff' }}>Performance Levels:</strong> 
                    <span style={{ color: '#10b981', fontWeight: '700' }}> Excellent</span> means the car is in the top 30%, 
                    <span style={{ color: '#facc15', fontWeight: '700' }}> Average</span> indicates mid-pack performance, and 
                    <span style={{ color: '#ef4444', fontWeight: '700' }}> Needs Improvement</span> signals significant laptime loss.
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong style={{ color: '#fff' }}>Racing Impact:</strong> A 5 km/h deficit in fast corners can cost 0.3-0.5 seconds per lap. 
                    Slow corner deficits typically cost 0.1-0.2 seconds but affect tire wear and race strategy.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowExplanation(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '1.75rem',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  transition: 'all 0.3s ease',
                  borderRadius: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#94a3b8';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Track Selector */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '1rem', 
            marginBottom: '1.5rem' 
          }}>
            <MapPin size={32} color="#ef4444" />
            <h2 style={{ 
              fontSize: '2rem', 
              fontWeight: '800', 
              color: '#ef4444', 
              margin: 0,
              letterSpacing: '1px'
            }}>
              SELECT CIRCUIT
            </h2>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: '1rem',
            maxHeight: '400px',
            overflowY: 'auto',
            padding: '1rem',
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '1rem',
            border: '1px solid rgba(71, 85, 105, 0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            {ALL_2025_TRACKS.map((track, idx) => (
              <button
                key={track.name}
                onClick={() => {
                  setSelectedTrack(track.name);
                  setSelectedCar(null);
                }}
                style={{
                  padding: '1rem 1.5rem',
                  borderRadius: '1rem',
                  fontWeight: '700',
                  fontSize: '1rem',
                  border: 'none',
                  cursor: 'pointer',
                  background: selectedTrack === track.name 
                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                    : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                  color: '#fff',
                  boxShadow: selectedTrack === track.name 
                    ? '0 10px 30px rgba(239, 68, 68, 0.5), 0 0 20px rgba(239, 68, 68, 0.3)'
                    : '0 4px 6px rgba(0, 0, 0, 0.3)',
                  transform: selectedTrack === track.name ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  alignItems: 'center',
                  animation: `fadeIn 0.5s ease-out ${0.05 * idx}s forwards`,
                  opacity: 0
                }}
                onMouseEnter={(e) => {
                  if (selectedTrack !== track.name) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #334155 0%, #475569 100%)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedTrack !== track.name) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #1e293b 0%, #334155 100%)';
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
                  }
                }}
              >
                <span style={{ fontSize: '2rem' }}>{track.flag}</span>
                <span style={{ fontSize: '0.95rem', fontWeight: '800' }}>{track.name}</span>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '400' }}>{track.location}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Minimalist Heatmap Table */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          padding: '2rem',
          borderRadius: '1rem',
          border: '1px solid rgba(71, 85, 105, 0.3)',
          backdropFilter: 'blur(10px)',
          marginBottom: '3rem',
          overflowX: 'auto'
        }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#e2e8f0', marginBottom: '1.5rem', marginTop: 0 }}>
            Performance Matrix • {selectedTrack}
          </h2>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>
                <th style={{ 
                  padding: '0.75rem 1rem', 
                  textAlign: 'left', 
                  color: '#64748b', 
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>Team</th>
                {cornerTypes.map(type => (
                  <th key={type} style={{ 
                    padding: '0.75rem 1rem', 
                    textAlign: 'center', 
                    color: '#64748b', 
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {type}
                  </th>
                ))}
                <th style={{ 
                  padding: '0.75rem 1rem', 
                  textAlign: 'center', 
                  color: '#64748b', 
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}></th>
              </tr>
            </thead>
            <tbody>
              {ALL_TEAMS.map((car, idx) => (
                <tr key={car} style={{
                  borderBottom: '1px solid rgba(71, 85, 105, 0.2)',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(71, 85, 105, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}>
                  <td style={{ 
                    padding: '1rem', 
                    fontWeight: '600', 
                    fontSize: '0.95rem',
                    color: '#e2e8f0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: '3px',
                        height: '20px',
                        background: teamColors[car] || '#8b5cf6',
                        borderRadius: '2px'
                      }}></div>
                      {car}
                    </div>
                  </td>
                  {cornerTypes.map(type => {
                    const value = performanceData[selectedTrack][car]?.[type] || 0;
                    const colorData = getColor(value, type);
                    const level = getPerformanceLevel(value, type);
                    return (
                      <td key={type} style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                          <div style={{
                            fontSize: '1.125rem',
                            fontWeight: '700',
                            color: level === 'Excellent' ? '#10b981' : level === 'Average' ? '#f59e0b' : '#ef4444'
                          }}>
                            {parseFloat(value).toFixed(2)}
                          </div>
                          <div style={{
                            fontSize: '0.625rem',
                            color: '#64748b',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            km/h
                          </div>
                        </div>
                      </td>
                    );
                  })}
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button
                      onClick={() => setSelectedCar(selectedCar === car ? null : car)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: selectedCar === car ? '#ef4444' : 'transparent',
                        color: selectedCar === car ? '#fff' : '#64748b',
                        borderRadius: '0.375rem',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        border: selectedCar === car ? 'none' : '1px solid rgba(100, 116, 139, 0.3)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedCar !== car) {
                          e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.6)';
                          e.currentTarget.style.color = '#94a3b8';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedCar !== car) {
                          e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.3)';
                          e.currentTarget.style.color = '#64748b';
                        }
                      }}
                    >
                      {selectedCar === car ? 'Hide' : 'Details'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '2rem', fontSize: '0.875rem', color: '#64748b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></div>
              <span>Excellent</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }}></div>
              <span>Average</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></div>
              <span>Needs Improvement</span>
            </div>
          </div>
        </div>

        {/* Detailed Analysis */}
        {selectedCar && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', animation: 'fadeIn 0.6s ease-out' }}>
            
            {/* Radar Chart */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.95) 100%)',
              padding: '2.5rem',
              borderRadius: '1.5rem',
              border: '2px solid rgba(139, 92, 246, 0.4)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 60px rgba(139, 92, 246, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 30px rgba(139, 92, 246, 0.5)'
                }}>
                  <Target size={28} color="#fff" />
                </div>
                <h2 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#8b5cf6', margin: 0, letterSpacing: '0.5px' }}>
                  Performance Balance - {selectedCar}
                </h2>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={getRadarChartData(selectedCar)}>
                  <PolarGrid stroke="#374151" strokeWidth={2} />
                  <PolarAngleAxis 
                    dataKey="corner" 
                    stroke="#9CA3AF" 
                    style={{ fontSize: '1rem', fontWeight: '700' }}
                    tick={{ fill: '#CBD5E1' }}
                  />
                  <PolarRadiusAxis stroke="#9CA3AF" angle={90} domain={[0, 100]} />
                  <Radar 
                    name={selectedCar} 
                    dataKey="value" 
                    stroke={teamColors[selectedCar] || '#ef4444'}
                    strokeWidth={3}
                    fill={teamColors[selectedCar] || '#ef4444'}
                    fillOpacity={0.5}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                      border: '2px solid #8b5cf6', 
                      borderRadius: '0.75rem',
                      padding: '1rem'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
              <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '1.5rem', marginBottom: 0, fontSize: '1rem', fontWeight: '600' }}>
                Values shown as percentage of optimal performance (100% = excellent)
              </p>
            </div>

            {/* AI Insights */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.95) 100%)',
              padding: '2.5rem',
              borderRadius: '1.5rem',
              border: '2px solid rgba(239, 68, 68, 0.4)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 60px rgba(239, 68, 68, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 30px rgba(239, 68, 68, 0.5)'
                }}>
                  <AlertCircle size={28} color="#fff" />
                </div>
                <h2 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#ef4444', margin: 0, letterSpacing: '0.5px' }}>
                  AI Performance Analysis - {selectedCar}
                </h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {getAIInsights(selectedCar).map((insight, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '1.75rem 2rem',
                      borderRadius: '1rem',
                      borderLeft: `5px solid ${insight.type === 'strength' ? '#10b981' : '#ef4444'}`,
                      background: insight.type === 'strength' 
                        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)' 
                        : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)',
                      display: 'flex',
                      gap: '1.5rem',
                      alignItems: 'flex-start',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      boxShadow: `0 4px 12px ${insight.type === 'strength' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(10px)';
                      e.currentTarget.style.boxShadow = `0 8px 24px ${insight.type === 'strength' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.boxShadow = `0 4px 12px ${insight.type === 'strength' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`;
                    }}
                  >
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: insight.type === 'strength' ? '#10b981' : '#ef4444',
                      marginTop: '0.5rem',
                      flexShrink: 0,
                      boxShadow: `0 0 10px ${insight.type === 'strength' ? '#10b981' : '#ef4444'}`
                    }}></div>
                    <p style={{ fontSize: '1.15rem', color: '#e2e8f0', margin: 0, lineHeight: '1.7', fontWeight: '500' }}>
                      {insight.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Engineering Recommendations */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.95) 100%)',
              padding: '2.5rem',
              borderRadius: '1.5rem',
              border: '2px solid rgba(249, 115, 22, 0.4)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 60px rgba(249, 115, 22, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 30px rgba(249, 115, 22, 0.5)'
                }}>
                  <Wrench size={28} color="#fff" />
                </div>
                <h2 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#f97316', margin: 0, letterSpacing: '0.5px' }}>
                  Engineering Recommendations - {selectedCar}
                </h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {getEngineeringRecommendations(selectedCar).length === 0 ? (
                  <div style={{
                    padding: '2.5rem',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)',
                    border: '2px solid rgba(16, 185, 129, 0.4)',
                    borderRadius: '1rem',
                    boxShadow: '0 10px 30px rgba(16, 185, 129, 0.2)'
                  }}>
                    <p style={{ fontSize: '1.5rem', color: '#10b981', fontWeight: '800', margin: '0 0 1rem 0' }}>
                      ✓ Excellent performance across all corner types!
                    </p>
                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '1.1rem', lineHeight: '1.6' }}>
                      No critical improvements required. Focus on maintaining current setup and fine-tuning for specific track conditions.
                    </p>
                  </div>
                ) : (
                  getEngineeringRecommendations(selectedCar).map((rec, idx) => (
                    <div key={idx} style={{
                      padding: '2.5rem',
                      background: 'rgba(51, 65, 85, 0.6)',
                      borderRadius: '1rem',
                      border: '2px solid rgba(71, 85, 105, 0.5)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#f97316';
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 15px 40px rgba(249, 115, 22, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.5)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', margin: '0 0 0.75rem 0', letterSpacing: '0.5px' }}>
                            {rec.area}
                          </h3>
                          <p style={{ color: '#94a3b8', margin: 0, fontSize: '1.1rem', fontWeight: '500' }}>{rec.issue}</p>
                        </div>
                        <span style={{
                          padding: '0.75rem 1.5rem',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          fontWeight: '800',
                          background: rec.priority === 'Critical' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' :
                                     rec.priority === 'High' ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                          color: '#fff',
                          letterSpacing: '1px',
                          boxShadow: rec.priority === 'Critical' ? '0 6px 20px rgba(239, 68, 68, 0.5)' :
                                     rec.priority === 'High' ? '0 6px 20px rgba(249, 115, 22, 0.5)' : '0 6px 20px rgba(251, 191, 36, 0.5)'
                        }}>
                          {rec.priority} Priority
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <p style={{ fontSize: '1rem', fontWeight: '800', color: '#cbd5e1', margin: '0 0 1rem 0', letterSpacing: '1px' }}>
                          RECOMMENDED SOLUTIONS:
                        </p>
                        {rec.solutions.map((solution, sIdx) => (
                          <div key={sIdx} style={{
                            display: 'flex',
                            gap: '1.5rem',
                            padding: '1.25rem 1.5rem',
                            background: 'rgba(30, 41, 59, 0.6)',
                            borderRadius: '0.75rem',
                            alignItems: 'flex-start',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(30, 41, 59, 0.9)';
                            e.currentTarget.style.transform = 'translateX(10px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
                            e.currentTarget.style.transform = 'translateX(0)';
                          }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.875rem',
                              fontWeight: '800',
                              flexShrink: 0,
                              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.5)'
                            }}>
                              {sIdx + 1}
                            </div>
                            <p style={{ color: '#cbd5e1', margin: 0, lineHeight: '1.7', flex: 1, fontSize: '1.05rem' }}>{solution}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Performance Summary */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.95) 100%)',
              padding: '2.5rem',
              borderRadius: '1.5rem',
              border: '2px solid rgba(139, 92, 246, 0.4)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 60px rgba(139, 92, 246, 0.3)'
            }}>
              <h3 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#8b5cf6', marginBottom: '2.5rem', marginTop: 0, letterSpacing: '0.5px' }}>
                Performance Summary - {selectedCar}
              </h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '2rem' 
              }}>
                {cornerTypes.map(type => {
                  const value = performanceData[selectedTrack][selectedCar]?.[type] || 0;
                  const level = getPerformanceLevel(value, type);
                  const levelColor = level === 'Excellent' ? '#10b981' :
                                    level === 'Average' ? '#facc15' : '#ef4444';
                  const levelGradient = level === 'Excellent' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                                       level === 'Average' ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                  return (
                    <div key={type} style={{
                      textAlign: 'center',
                      padding: '2.5rem',
                      background: 'rgba(51, 65, 85, 0.6)',
                      borderRadius: '1rem',
                      border: `2px solid ${levelColor}40`,
                      transition: 'all 0.4s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-10px) scale(1.03)';
                      e.currentTarget.style.boxShadow = `0 20px 50px ${levelColor}60`;
                      e.currentTarget.style.borderColor = levelColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = `${levelColor}40`;
                    }}>
                      <p style={{ fontSize: '1rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '1.5rem', fontWeight: '800', margin: '0 0 1.5rem 0', letterSpacing: '1px' }}>
                        {type} Corners
                      </p>
                      <p style={{ fontSize: '3.5rem', fontWeight: '900', color: levelColor, margin: '1rem 0', textShadow: `0 0 20px ${levelColor}60` }}>
                        {parseFloat(value).toFixed(2)}
                      </p>
                      <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 1.5rem 0', fontWeight: '600' }}>km/h</p>
                      <span style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '9999px',
                        fontSize: '0.875rem',
                        fontWeight: '800',
                        background: levelGradient,
                        color: '#fff',
                        display: 'inline-block',
                        letterSpacing: '0.5px',
                        boxShadow: `0 6px 20px ${levelColor}60`
                      }}>
                        {level}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: '4rem', textAlign: 'center', color: '#64748b', fontSize: '1rem', padding: '2rem', borderTop: '1px solid rgba(71, 85, 105, 0.3)' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: '700', letterSpacing: '0.5px' }}>
            🏎️ Powered by Advanced Telemetry Analysis • AI-Enhanced Engineering Insights • FastF1 API Integration
          </p>
          <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.7 }}>
            Data updated in real-time for the 2025 F1 Season
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.15;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.25;
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
        }
      `}</style>
    </div>
  );
};

export default CornerPerformanceMatrix;
