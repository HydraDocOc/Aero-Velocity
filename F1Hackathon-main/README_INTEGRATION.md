# F1 Aero Analysis - Backend Integration Guide

## Quick Start

### Prerequisites
1. Python 3.8+ installed
2. Node.js 16+ installed
3. pip and npm available

### Installation

#### 1. Install Python Dependencies
```bash
cd F1Hackathon-main
pip install -r requirements.txt
```

#### 2. Install Frontend Dependencies (if not already installed)
```bash
cd ../Main
npm install
```

### Running the Application

#### Option 1: Run Everything Together (Windows)
```bash
# From the test2 directory
.\start-app.bat
```

#### Option 2: Run Everything Together (Linux/Mac)
```bash
# From the test2 directory
chmod +x start-app.sh
./start-app.sh
```

#### Option 3: Run Services Separately

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

## API Endpoints

The backend provides the following endpoints at `http://localhost:5000/api`:

- **GET /api/health** - Health check
- **GET /api/tracks** - Get all available tracks
- **POST /api/analyze/team** - Analyze a team at a specific track
- **POST /api/analyze/components** - Analyze specific aerodynamic components
- **POST /api/predict/performance** - Predict performance metrics
- **POST /api/simulate/lap** - Simulate lap time
- **POST /api/simulate/circuit** - Circuit-specific analysis
- **POST /api/compare/teams** - Compare two teams
- **POST /api/upgrades/recommend** - Get upgrade recommendations
- **POST /api/analyze/image** - Analyze car from image
- **POST /api/ai/insights** - Get AI-powered insights

## API Documentation

Once the backend is running, visit:
- Interactive API docs: http://localhost:5000/docs
- Alternative docs: http://localhost:5000/redoc

## Frontend Configuration

The frontend is pre-configured to connect to the backend at `http://localhost:5000/api`.

If you need to change the API URL, create a `.env` file in the `Main` directory:

```env
VITE_ML_API_URL=http://localhost:5000/api
```

## Troubleshooting

### Backend won't start
1. Make sure all Python dependencies are installed: `pip install -r requirements.txt`
2. Check if port 5000 is already in use
3. Verify Python version: `python --version` (should be 3.8+)

### Frontend won't start
1. Make sure all npm dependencies are installed: `npm install`
2. Check if port 5173 is already in use
3. Verify Node.js version: `node --version` (should be 16+)

### API connection errors
1. Verify the backend is running at http://localhost:5000
2. Check browser console for CORS errors
3. Ensure `.env` file has correct API URL

## Project Structure

```
test2/
├── F1Hackathon-main/          # Backend (FastAPI)
│   ├── api/
│   │   └── server.py          # Main API server (adapted for frontend)
│   ├── physics/               # Physics simulation modules
│   ├── ml_models/             # ML prediction models
│   ├── computer_vision/       # Image analysis
│   ├── analysis/              # Analysis tools
│   └── config/                # Configuration files
│
├── Main/                      # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/             # Page components
│   │   ├── components/        # Reusable components
│   │   └── services/          # API service layer
│   └── package.json
│
├── start-app.bat              # Windows startup script
├── start-app.sh               # Linux/Mac startup script
├── start-backend.bat          # Backend only (Windows)
└── start-frontend.bat         # Frontend only (Windows)
```

## Features

### Analyze Page
- Select a team and track
- Get comprehensive aerodynamic analysis
- View performance metrics and recommendations

### Compare Page
- Compare two teams head-to-head
- Track-specific performance comparison
- Component-by-component analysis

### Predict Page
- Adjust aerodynamic parameters
- Predict lap times and performance
- Get AI-powered insights

### Simulate Page
- Full lap simulation
- Circuit-specific optimization
- Real-time performance feedback

## Development

### Adding New Endpoints

1. Add endpoint to `F1Hackathon-main/api/server.py`
2. Add corresponding method to `Main/src/services/mlService.js`
3. Use the method in your React components

### Modifying Physics/ML Models

All physics and ML logic is in the `F1Hackathon-main` directory:
- `physics/` - Core physics simulations
- `ml_models/` - Machine learning models
- `analysis/` - Analysis algorithms

## License

MIT License - See LICENSE file for details

