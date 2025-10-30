import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import FileUpload from '../components/FileUpload';
import mlService, { TEAMS } from '../services/mlService';
import './Predict.css';

const Predict = () => {
  const { user, isConfigured } = useAuth();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [params, setParams] = useState({ 
    weight: 740, 
    wing: 15, 
    wind: 20, 
    tyre: 'soft',
    dragCoefficient: 0.70,
    clFront: 1.5,
    clRear: 2.0,
    power: 850,
    tireGrip: 1.8
  });
  const [selectedTeam, setSelectedTeam] = useState('Red Bull Racing');
  const [selectedTrack, setSelectedTrack] = useState('Monaco');
  const [tracks, setTracks] = useState([]);
  const [performanceData, setPerformanceData] = useState(null);
  const [lapTimeData, setLapTimeData] = useState(null);
  const [loading, setLoading] = useState(false);

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

  // Update performance prediction when parameters change
  useEffect(() => {
    const predictPerformance = async () => {
      if (!selectedTrack) return;
      
      setLoading(true);
      try {
        const aeroConfig = mlService.buildAeroConfig({
          dragCoefficient: params.dragCoefficient,
          clFront: params.clFront,
          clRear: params.clRear
        });

        // Get performance prediction
        const perfData = await mlService.predictPerformance(aeroConfig, selectedTrack);
        setPerformanceData(perfData);

        // Get lap time simulation
        const carParams = mlService.buildCarParams({
          mass: params.weight,
          power: params.power,
          tire_grip: params.tireGrip
        });
        const lapData = await mlService.simulateLap(aeroConfig, carParams);
        setLapTimeData(lapData);

      } catch (error) {
        console.error('Error predicting performance:', error);
        // Set fallback data
        setPerformanceData({
          top_speed: 320,
          avg_corner_speed: 180,
          total_downforce: 35,
          ld_ratio: 5.0
        });
        setLapTimeData({
          lap_time: 85.5,
          lap_time_formatted: '1:25.500'
        });
      } finally {
        setLoading(false);
      }
    };

    predictPerformance();
  }, [params.dragCoefficient, params.clFront, params.clRear, params.weight, params.power, params.tireGrip, selectedTrack]);

  const handleUploadComplete = (fileData) => {
    setUploadedFiles((prev) => [fileData, ...prev]);
  };

  const handleParamChange = (key, value) => {
    setParams(prev => ({
      ...prev,
      [key]: value
    }));

    // Auto-calculate drag and downforce based on wing angle
    if (key === 'wing') {
      const wingAngle = Number(value);
      setParams(prev => ({
        ...prev,
        dragCoefficient: 0.65 + (wingAngle / 50) * 0.20, // Higher wing = more drag
        clFront: 1.0 + (wingAngle / 50) * 1.0,
        clRear: 1.5 + (wingAngle / 50) * 1.0
      }));
    }
  };

  return (
    <div className="predict-page">
      <div className="container">
        <div className="page-header">
          <h1>Predict Performance</h1>
          <p>Upload your car data to get AI-powered predictions</p>
        </div>

        {!isConfigured && (
          <div className="config-notice glass">
            <h3>⚠️ Firebase Configuration Required</h3>
            <p>
              To enable file uploads and predictions, please configure Firebase:
            </p>
            <ol>
              <li>Copy <code>.env.example</code> to <code>.env</code></li>
              <li>Fill in your Firebase project credentials</li>
              <li>Restart the development server</li>
            </ol>
            <p>
              <strong>For now, the app works in mock mode.</strong>
            </p>
          </div>
        )}

        <div className="predict-content">
          <div className="predict-top">
            <div className="upload-section">
              <FileUpload onUploadComplete={handleUploadComplete} />
            </div>
            <aside className="tips-panel">
              <h3>Tips</h3>
              <ul>
                <li>CSV should include headers on the first row.</li>
                <li>Recommended columns: speed, angle, surface, tyre_temp, pressure.</li>
                <li>Drop unused columns to speed up model processing.</li>
                <li>Use JSON array of objects for structured data.</li>
              </ul>
            </aside>
          </div>

          {/* Team and Track Selection */}
          <div className="predict-grid">
            <div className="panel">
              <h3>Configuration</h3>
              <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Team</label>
                  <select 
                    className="select-control"
                    value={selectedTeam} 
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    style={{ width: '100%', padding: '10px', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '8px', color: 'white' }}
                  >
                    {TEAMS.map(team => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Track</label>
                  <select 
                    className="select-control"
                    value={selectedTrack} 
                    onChange={(e) => setSelectedTrack(e.target.value)}
                    style={{ width: '100%', padding: '10px', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '8px', color: 'white' }}
                  >
                    {tracks.map(track => (
                      <option key={track.name} value={track.name}>
                        {track.name} ({track.downforce_level})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="panel">
              <h3>Predicted Performance</h3>
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#00d2ff' }}>
                  Calculating...
                </div>
              ) : performanceData ? (
                <div className="metrics">
                  <div className="metric">
                    <div className="label">Top Speed</div>
                    <div className="value">{performanceData.top_speed?.toFixed(2) || 'N/A'} km/h</div>
                  </div>
                  <div className="metric">
                    <div className="label">Corner Speed</div>
                    <div className="value">{performanceData.avg_corner_speed?.toFixed(2) || 'N/A'} km/h</div>
                  </div>
                  <div className="metric">
                    <div className="label">Downforce</div>
                    <div className="value">{performanceData.total_downforce?.toFixed(1) || 'N/A'} kN</div>
                  </div>
                  <div className="metric">
                    <div className="label">Projected Lap Time</div>
                    <div className="value" style={{ fontSize: '24px', color: '#00ff88' }}>
                      {lapTimeData?.lap_time_formatted || 'N/A'}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)' }}>
                  ML backend not connected
                </div>
              )}
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="predict-grid">
            <div className="panel">
              <h3>Aerodynamic Coefficients</h3>
              <div className="metrics">
                <div className="metric">
                  <div className="label">Drag Coefficient (Cd)</div>
                  <div className="value">{params.dragCoefficient.toFixed(3)}</div>
                </div>
                <div className="metric">
                  <div className="label">Front Downforce (Cl)</div>
                  <div className="value">{params.clFront.toFixed(2)}</div>
                </div>
                <div className="metric">
                  <div className="label">Rear Downforce (Cl)</div>
                  <div className="value">{params.clRear.toFixed(2)}</div>
                </div>
                <div className="metric">
                  <div className="label">L/D Ratio</div>
                  <div className="value">{((params.clFront + params.clRear) / params.dragCoefficient).toFixed(2)}</div>
                </div>
              </div>
            </div>
            <div className="panel">
              <h3>Simulation Controls</h3>
              <div className="controls">
                <div className="control">
                  <label>Car Weight: {params.weight} kg</label>
                  <input 
                    type="range" 
                    min="700" 
                    max="800" 
                    value={params.weight}
                    onChange={(e) => handleParamChange('weight', Number(e.target.value))} 
                  />
                </div>
                <div className="control">
                  <label>Wing Angle: {params.wing}°</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="50" 
                    value={params.wing}
                    onChange={(e) => handleParamChange('wing', Number(e.target.value))} 
                  />
                </div>
                <div className="control">
                  <label>Engine Power: {params.power} HP</label>
                  <input 
                    type="range" 
                    min="800" 
                    max="1000" 
                    value={params.power}
                    onChange={(e) => handleParamChange('power', Number(e.target.value))} 
                  />
                </div>
                <div className="control">
                  <label>Tire Grip: {params.tireGrip.toFixed(2)}</label>
                  <input 
                    type="range" 
                    min="1.0" 
                    max="2.5" 
                    step="0.1" 
                    value={params.tireGrip}
                    onChange={(e) => handleParamChange('tireGrip', Number(e.target.value))} 
                  />
                </div>
              </div>
              <p style={{marginTop: 20, padding: '15px', background: 'rgba(0, 210, 255, 0.1)', borderRadius: '8px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)'}}>
                💡 Adjust parameters in real-time to see how they affect lap time and performance. Higher wing angles provide more downforce but increase drag.
              </p>
            </div>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="uploaded-files">
              <h3>Your Uploads</h3>
              <div className="files-grid">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="file-card glass">
                    <div className="file-icon">📊</div>
                    <div className="file-info">
                      <h4>{file.metadata?.datasetName || file.fileName}</h4>
                      <p>{file.fileName}</p>
                      <p className="file-meta">
                        {file.fileSize
                          ? `${(file.fileSize / 1024 / 1024).toFixed(2)} MB`
                          : 'N/A'}{' '}
                        • {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="file-status success">Ready</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="coming-soon-banner glass">
          <h3>🎯 Coming Soon</h3>
          <p>
            ML prediction features will be integrated here. Upload your files
            now to prepare!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Predict;

