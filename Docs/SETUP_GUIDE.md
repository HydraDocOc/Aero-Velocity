# F1 Aero Analysis - Complete Setup Guide

## 🚀 Quick Setup (Recommended)

### Windows Users

1. **Install Backend Dependencies:**
   ```bash
   cd F1Hackathon-main
   setup.bat
   ```

2. **Install Frontend Dependencies (if needed):**
   ```bash
   cd ..\Main
   npm install
   ```

3. **Run the Full Application:**
   ```bash
   cd ..
   start-app.bat
   ```

### Linux/Mac Users

1. **Install Backend Dependencies:**
   ```bash
   cd F1Hackathon-main
   pip install -r requirements.txt
   ```

2. **Install Frontend Dependencies:**
   ```bash
   cd ../Main
   npm install
   ```

3. **Run the Full Application:**
   ```bash
   cd ..
   chmod +x start-app.sh
   ./start-app.sh
   ```

## 📋 Prerequisites

Before starting, make sure you have:

- **Python 3.8 or higher** ([Download](https://www.python.org/downloads/))
- **Node.js 16 or higher** ([Download](https://nodejs.org/))
- **pip** (comes with Python)
- **npm** (comes with Node.js)

### Verify Installations

```bash
python --version   # Should show Python 3.8+
node --version     # Should show v16+
pip --version      # Should show pip version
npm --version      # Should show npm version
```

## 🔧 Detailed Setup

### Step 1: Backend Setup

```bash
cd F1Hackathon-main
```

**Option A - Minimal Installation (Faster):**
```bash
pip install fastapi uvicorn pydantic numpy pandas scipy scikit-learn opencv-python pillow matplotlib seaborn
```

**Option B - Full Installation (All features):**
```bash
pip install -r requirements.txt
```

### Step 2: Frontend Setup

```bash
cd ../Main
npm install
```

This will install:
- React
- Vite
- React Router
- Recharts (for charts)
- Lucide React (for icons)
- Framer Motion (for animations)
- Firebase & Gemini AI (for chat features)

### Step 3: Test Backend

```bash
cd ../F1Hackathon-main/api
python server.py
```

You should see:
```
Starting server on http://localhost:5000
API endpoints available at /api/*
```

Visit http://localhost:5000/docs to see the API documentation.

Press `Ctrl+C` to stop the server.

### Step 4: Test Frontend

```bash
cd ../../Main
npm run dev
```

You should see:
```
VITE v4.x.x ready in xxx ms
Local: http://localhost:5173/
```

Visit http://localhost:5173 to see the frontend.

Press `Ctrl+C` to stop the server.

## 🎯 Running the Application

### Method 1: All-in-One Launcher (Easiest)

**Windows:**
```bash
start-app.bat
```

**Linux/Mac:**
```bash
./start-app.sh
```

This will:
1. Start the backend API on port 5000
2. Start the frontend on port 5173
3. Open both in separate terminal windows

### Method 2: Manual Start (Separate Terminals)

**Terminal 1 - Backend:**
```bash
cd F1Hackathon-main/api
python server.py
```

**Terminal 2 - Frontend:**
```bash
cd Main
npm run dev
```

## 🌐 Access the Application

Once both services are running:

- **Frontend UI:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **API Documentation:** http://localhost:5000/docs
- **Alternative API Docs:** http://localhost:5000/redoc

## 🧪 Testing the Integration

1. **Open the frontend** at http://localhost:5173
2. **Navigate to the Analyze page**
3. **Select a team** (e.g., "Ferrari")
4. **Select a track** (e.g., "Monaco")
5. **Click Analyze**

You should see:
- Lap time predictions
- Performance metrics
- Aerodynamic analysis
- Component efficiency ratings

## ❓ Troubleshooting

### Backend Issues

**Problem:** `ModuleNotFoundError: No module named 'fastapi'`
**Solution:**
```bash
pip install fastapi uvicorn pydantic
```

**Problem:** Port 5000 already in use
**Solution:**
```bash
# Find and kill the process using port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -i :5000
kill -9 <PID>
```

**Problem:** Import errors from physics/ml_models modules
**Solution:**
```bash
cd F1Hackathon-main
python -c "import sys; from pathlib import Path; sys.path.append(str(Path.cwd())); from config.track_configs import TRACK_CONFIGS; print('Success')"
```

### Frontend Issues

**Problem:** `npm: command not found`
**Solution:** Install Node.js from https://nodejs.org/

**Problem:** Port 5173 already in use
**Solution:** Vite will automatically try the next available port (5174, 5175, etc.)

**Problem:** Cannot connect to backend (fetch errors)
**Solution:**
1. Verify backend is running: http://localhost:5000/api/health
2. Check browser console for CORS errors
3. Ensure both services are running

### Connection Issues

**Problem:** Frontend can't reach backend
**Solution:**
1. Check backend is running at http://localhost:5000
2. Test health endpoint: http://localhost:5000/api/health
3. Check browser console for errors
4. Verify `Main/.env` has correct API URL (if it exists)

## 📁 Project Structure

```
test2/
├── F1Hackathon-main/              # Backend (Python + FastAPI)
│   ├── api/
│   │   ├── server.py              # Main API server
│   │   └── main.py                # Alternative API (more features)
│   ├── physics/                   # Physics simulation
│   ├── ml_models/                 # ML models
│   ├── computer_vision/           # Image analysis
│   ├── analysis/                  # Analysis tools
│   ├── config/                    # Configuration
│   ├── requirements.txt           # Python dependencies
│   └── setup.bat                  # Quick setup script
│
├── Main/                          # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/                 # Page components
│   │   │   ├── Analyze.jsx        # Team analysis page
│   │   │   ├── Compare.jsx        # Team comparison page
│   │   │   ├── Predict.jsx        # Performance prediction
│   │   │   └── Simulate.jsx       # Lap simulation
│   │   ├── components/            # Reusable components
│   │   ├── services/
│   │   │   └── mlService.js       # Backend API client
│   │   └── App.jsx
│   ├── package.json               # Node dependencies
│   └── vite.config.js             # Vite configuration
│
├── start-app.bat                  # Windows launcher
├── start-app.sh                   # Linux/Mac launcher
├── start-backend.bat              # Backend only
├── start-frontend.bat             # Frontend only
└── SETUP_GUIDE.md                 # This file
```

## 🎮 Using the Application

### Analyze Page
1. Select a team from the dropdown
2. Select a track from the dropdown
3. Click "Analyze Team"
4. View:
   - Lap time predictions
   - Top speed and corner speed
   - Component analysis
   - Performance insights

### Compare Page
1. Select Team 1
2. Select Team 2
3. Select a track
4. Click "Compare Teams"
5. View:
   - Head-to-head lap time comparison
   - Performance metrics delta
   - Component-by-component analysis
   - Win probability

### Predict Page
1. Adjust aerodynamic parameters:
   - Drag coefficient
   - Downforce (front/rear)
   - Wing angles
   - Ride heights
2. Select a track
3. Click "Predict Performance"
4. View:
   - Predicted lap time
   - Top speed
   - Corner speed
   - AI insights

### Simulate Page
1. Configure car parameters:
   - Mass
   - Power
   - Tire grip
2. Set aerodynamic configuration
3. Select a track
4. Click "Simulate Lap"
5. View:
   - Detailed lap simulation
   - Sector times
   - Speed traces
   - Optimization suggestions

## 🔐 Security & Configuration

### Environment Variables

The application uses environment variables for configuration.

**Backend (.env in F1Hackathon-main/):**
```env
API_HOST=0.0.0.0
API_PORT=5000
LOG_LEVEL=INFO
```

**Frontend (.env in Main/):**
```env
VITE_ML_API_URL=http://localhost:5000/api
```

## 📚 Additional Resources

- **FastAPI Documentation:** https://fastapi.tiangolo.com/
- **React Documentation:** https://react.dev/
- **Vite Documentation:** https://vitejs.dev/

## 💡 Tips

1. **Keep both terminals open** while using the application
2. **Check the backend terminal** for API request logs
3. **Use the browser console** (F12) to debug frontend issues
4. **Visit /docs** for interactive API testing
5. **The frontend auto-reloads** when you make changes

## 🤝 Support

If you encounter any issues:

1. Check this guide's troubleshooting section
2. Verify all prerequisites are installed
3. Ensure both backend and frontend are running
4. Check browser console and terminal for error messages

## 🎉 You're All Set!

The application should now be fully functional. Enjoy exploring F1 aerodynamics!

