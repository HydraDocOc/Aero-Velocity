# AeroVelocity ML Integration Guide

## 🎯 Overview

This guide explains how to run the **fully integrated** AeroVelocity F1 Aerodynamic Analysis Platform with its ML backend. The system connects the React frontend in the `Main` folder with the Python ML features in the `ML` folder.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Main/)                    │
│  - Dashboard: Real-time analytics & component analysis       │
│  - Predict: Performance prediction & lap time simulation     │
│  - Simulate: Circuit-specific analysis                       │
│  - Compare: Team comparison                                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ REST API (http://localhost:5000)
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              Flask API Server (ML/api_server.py)            │
│  - Team Analysis                                             │
│  - Component Analysis                                        │
│  - Performance Estimation                                    │
│  - Circuit Simulation                                        │
│  - Team Comparison                                           │
│  - AI Insights                                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   ML Python Modules (ML/)                    │
│  - Physics: Aerodynamics, Lap Time Simulator                │
│  - Computer Vision: Car Image Analysis                      │
│  - ML Models: Performance Estimator, Upgrade Recommender    │
│  - Analysis: Component Analyzer, Circuit Analyzer           │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- pip

### Step 1: Install Frontend Dependencies

```bash
cd Main
npm install
```

### Step 2: Install ML Backend Dependencies

```bash
cd ../ML
pip install -r requirements.txt
```

## 🚀 Running the Application

You need to run **TWO servers** simultaneously:

### Terminal 1: Start ML Backend (Flask API)

```bash
cd ML
python api_server.py
```

You should see:
```
====================================================================
F1 Aero Analysis API Server
====================================================================
Starting server on http://localhost:5000
API endpoints available at /api/*
====================================================================
```

### Terminal 2: Start Frontend (React + Vite)

```bash
cd Main
npm run dev
```

You should see:
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Access the Application

Open your browser and navigate to: **http://localhost:5173/**

## 🎨 Features & Pages

### 1. Dashboard (`/dashboard`)
- **Real-time Team Analytics**
  - Select any F1 team
  - Choose a circuit
  - View AI-powered insights
  - Analyze aerodynamic components
  - See performance metrics (top speed, corner speed, downforce, L/D ratio)
  
- **Component Analysis Panel**
  - Efficiency ratings for each component (Front Wing, Rear Wing, Floor, etc.)
  - Improvement potential percentages
  - Drag contribution metrics

### 2. Predict (`/predict`)
- **Performance Prediction**
  - Team and track selection
  - Interactive parameter controls (weight, wing angle, engine power, tire grip)
  - Real-time lap time predictions
  - Aerodynamic coefficient display
  - ML-powered performance metrics

### 3. Simulate (`/simulate`)
- **Circuit-Specific Analysis**
  - Visual track selector with downforce levels
  - Team configuration
  - Adjustable aerodynamic setup (drag coefficient, downforce, wing angles)
  - Qualifying and race lap time predictions
  - Setup recommendations
  - Critical corner identification
  - Top speed and corner speed analysis

### 4. Compare (`/compare`)
- **Two Comparison Modes:**
  
  **Team Comparison Mode:**
  - Select two F1 teams
  - Choose a circuit
  - Compare component efficiencies
  - View lap time deltas
  - See performance differences (top speed, cornering)
  - AI-generated insights
  
  **Design Comparison Mode:**
  - Upload two car component images
  - Compare aerodynamic designs
  - Visual performance metrics

## 🔌 API Endpoints

The ML backend provides the following REST API endpoints:

### Health & Info
- `GET /api/health` - Health check
- `GET /api/tracks` - Get all available circuits

### Analysis
- `POST /api/analyze/team` - Complete team analysis at a specific track
- `POST /api/analyze/components` - Analyze specific components
- `POST /api/analyze/image` - Analyze car from image (base64)

### Prediction & Simulation
- `POST /api/predict/performance` - Predict performance metrics
- `POST /api/simulate/lap` - Simulate lap time
- `POST /api/simulate/circuit` - Circuit-specific simulation

### Comparison & Recommendations
- `POST /api/compare/teams` - Compare two teams
- `POST /api/upgrades/recommend` - Get upgrade recommendations
- `POST /api/ai/insights` - Get AI-powered insights

## 📁 Project Structure

```
test2/
├── Main/                          # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx     # ML-integrated dashboard
│   │   │   ├── Predict.jsx       # Performance prediction
│   │   │   ├── Simulate.jsx      # Circuit simulation
│   │   │   └── Compare.jsx       # Team/design comparison
│   │   │
│   │   ├── services/
│   │   │   └── mlService.js      # ML API service layer
│   │   │
│   │   └── ...
│   │
│   └── package.json
│
├── ML/                            # ML Backend (Python)
│   ├── api_server.py             # Flask API server ⭐
│   ├── requirements.txt          # Python dependencies
│   │
│   ├── physics/
│   │   ├── aerodynamics.py
│   │   ├── lap_time_simulator.py
│   │   └── circuit_analyzer.py
│   │
│   ├── computer_vision/
│   │   ├── car_analyzer.py
│   │   ├── component_detector.py
│   │   └── feature_extractor.py
│   │
│   ├── ml_models/
│   │   ├── aero_predictor.py
│   │   ├── performance_estimator.py
│   │   ├── upgrade_recommender.py
│   │   └── model_trainer.py
│   │
│   ├── analysis/
│   │   └── component_analyzer.py
│   │
│   └── config/
│       ├── settings.py
│       └── track_configs.py
│
└── INTEGRATION_GUIDE.md          # This file
```

## 🎛️ Configuration

### Frontend Configuration

Create `Main/.env` (optional for ML API URL):

```env
VITE_ML_API_URL=http://localhost:5000/api
```

Default: `http://localhost:5000/api`

### Backend Configuration

No additional configuration needed. The ML backend uses default settings from `ML/config/settings.py` and `ML/config/track_configs.py`.

## 🧪 Testing the Integration

### 1. Test ML Backend Health

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "message": "F1 Aero Analysis API is running",
  "timestamp": "2024-01-15T10:30:00.000000"
}
```

### 2. Test Team Analysis

```bash
curl -X POST http://localhost:5000/api/analyze/team \
  -H "Content-Type: application/json" \
  -d '{"team_name": "Red Bull Racing", "track_name": "Monaco"}'
```

### 3. Test Frontend

1. Open http://localhost:5173/
2. Navigate to Dashboard
3. Select a team and track
4. Verify that:
   - AI Insights are displayed
   - Component analysis shows real data
   - Performance metrics update

## 🔍 Troubleshooting

### ML Backend Not Starting

**Issue:** Flask server fails to start

**Solution:**
```bash
cd ML
pip install --upgrade -r requirements.txt
python api_server.py
```

### CORS Errors

**Issue:** Frontend can't connect to backend

**Solution:** Ensure Flask-CORS is installed:
```bash
pip install flask-cors
```

### Missing Python Modules

**Issue:** `ModuleNotFoundError`

**Solution:**
```bash
cd ML
pip install numpy pandas scikit-learn opencv-python pillow matplotlib seaborn scipy xgboost
```

### Frontend Not Connecting to ML

**Issue:** "ML backend not connected" message

**Solution:**
1. Verify ML backend is running on port 5000
2. Check browser console for errors
3. Test health endpoint: `curl http://localhost:5000/api/health`
4. Ensure no firewall blocking port 5000

### Port Already in Use

**Issue:** Port 5000 or 5173 already in use

**Solution:**

For Flask (port 5000):
```python
# Edit ML/api_server.py line 565
app.run(host='0.0.0.0', port=5001, debug=True)  # Change to 5001
```

For Vite (port 5173):
```bash
# Edit Main/vite.config.js
export default defineConfig({
  server: {
    port: 3000  // Change port
  }
})
```

## 🎯 Key Integration Points

### 1. ML Service Layer (`Main/src/services/mlService.js`)
- Centralized API communication
- Type-safe request/response handling
- Error handling with fallback data
- Helper functions for config building

### 2. Component Integration
- **Dashboard**: Real-time team analytics & AI insights
- **Predict**: Performance prediction & lap simulation
- **Simulate**: Circuit analysis with visual track selection
- **Compare**: Team comparison with ML-powered metrics

### 3. Data Flow
```
User Input → React Component → mlService.js → Flask API → ML Models → Response
```

## 📊 Available F1 Teams

- Red Bull Racing
- Ferrari
- Mercedes
- McLaren
- Aston Martin
- Alpine
- Williams
- AlphaTauri
- Alfa Romeo
- Haas

## 🏁 Available Circuits

The system includes configurations for all F1 circuits with:
- Track length
- Downforce level (HIGH/MEDIUM/LOW)
- Corner count
- Optimal wing angles
- Ride height recommendations

Example tracks:
- Monaco (HIGH downforce)
- Silverstone (MEDIUM downforce)
- Monza (LOW downforce)
- Spa-Francorchamps
- Suzuka
- And more...

## 🚀 Advanced Features

### 1. Real-time Updates
- Performance metrics update as you adjust parameters
- AI insights generated based on current configuration
- Component analysis updates per track/team selection

### 2. Fallback Mode
- Frontend works even if ML backend is offline
- Mock data provides realistic experience
- Graceful error handling

### 3. Responsive Design
- Works on desktop and mobile
- Glassmorphism UI
- Smooth animations

## 📝 Notes

1. **First Load:** ML backend may take a few seconds to initialize all models
2. **Mock Data:** If ML backend isn't running, frontend uses fallback data
3. **Performance:** Complex calculations may take 1-2 seconds
4. **Data Persistence:** No database required - all calculations are real-time

## 🤝 Contributing

This is a hackathon project (Formula Hacks 2025). The integration demonstrates:
- Full-stack ML application architecture
- Real-time physics-based simulations
- Modern React + Flask patterns
- RESTful API design

## 📄 License

Created for Formula Hacks 2025 competition.

---

**Built with ⚡ by the AeroVelocity Team**

For questions or issues, refer to:
- `Main/ARCHITECTURE.md` - Frontend architecture
- `Main/README.md` - Frontend documentation
- `ML/main.py` - ML system overview

