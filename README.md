# 🏎️ AeroVelocity - Formula 1 Aerodynamics Analysis Platform

> **"Where Physics Meets AI in the Fast Lane"**

## 📋 Table of Contents
- [Introduction](#introduction)
- [Problem Statement](#problem-statement)
- [Tagline](#tagline)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

---

## 🎯 Introduction

**AeroVelocity** is a comprehensive Formula 1 aerodynamics analysis platform that combines real-time telemetry data, physics-based simulations, machine learning predictions, and computer vision analysis to provide deep insights into F1 car performance across all 24 tracks of the 2025 season.

This platform enables F1 teams, engineers, and enthusiasts to:
- Analyze aerodynamic components with real physics calculations
- Predict lap times using ML models trained on actual F1 data
- Compare team performances across different circuits
- Get AI-powered optimization recommendations
- Visualize corner-by-corner performance analysis

---

## ❓ Problem Statement

Formula 1 aerodynamics analysis traditionally requires:
- Complex computational fluid dynamics (CFD) software
- Extensive wind tunnel testing
- Access to proprietary telemetry data
- Expert knowledge in aerodynamics and vehicle dynamics
- Time-consuming manual analysis

**AeroVelocity solves these challenges by:**
- Providing real-time analysis accessible via a web interface
- Integrating actual FastF1 API telemetry data from the 2025 season
- Using physics-based calculations for accurate simulations
- Leveraging machine learning for predictive analytics
- Offering visual component analysis through computer vision
- Generating AI-powered insights and recommendations

---

## 🏷️ Tagline

**"Where Physics Meets AI in the Fast Lane"**

AeroVelocity bridges the gap between theoretical physics, real-world F1 data, and artificial intelligence to deliver actionable aerodynamic insights in real-time.

---

## 💻 Tech Stack

### Frontend
- **React 18.2.0** - UI framework
- **Vite 4.4.5** - Build tool and dev server
- **React Router DOM 6.8.1** - Client-side routing
- **Framer Motion 10.16.4** - Animation library
- **Recharts 2.15.4** - Data visualization and charts
- **Lucide React 0.263.1** - Icon library
- **Firebase 10.7.1** - Authentication and backend services
- **Google Generative AI 0.24.1** - AI insights generation

### Backend
- **FastAPI 0.104.0** - Python REST API framework
- **Uvicorn 0.24.0** - ASGI server
- **Pydantic 2.4.0** - Data validation

### Machine Learning & Data Science
- **NumPy 1.24.0+** - Numerical computing
- **Pandas 2.0.0+** - Data manipulation
- **Scikit-learn 1.3.0+** - Machine learning algorithms
- **XGBoost 2.0.0+** - Gradient boosting
- **LightGBM 4.0.0+** - Gradient boosting framework
- **TensorFlow 2.13.0+** - Deep learning
- **Keras 2.13.0+** - High-level neural networks API

### F1 Data & APIs
- **FastF1 3.0.0+** - Official F1 data API integration

### Computer Vision
- **OpenCV 4.8.0+** - Image processing
- **Pillow 10.0.0+** - Image manipulation
- **Scikit-image 0.20.0+** - Image analysis

### Visualization
- **Matplotlib 3.7.0+** - Plotting library
- **Seaborn 0.12.0+** - Statistical visualization
- **Plotly 5.17.0+** - Interactive charts

### Utilities
- **Python-dotenv 1.0.0+** - Environment variable management
- **Joblib 1.3.0+** - Parallel processing

---

## ✨ Features

### 🏠 Home Page (`/`)
- **Hero Section** - Animated racing track visualization
- **Features Overview** - Key platform capabilities
- **Statistics Dashboard** - Project metrics and achievements
- **Call-to-Action** - Navigation to main features

### 📊 Dashboard (`/dashboard`)
- **Real-Time Team Analytics**
  - Select any F1 team from 10 available teams
  - Choose from 24 circuits (complete 2025 F1 calendar)
  - Circuit-specific AI insights based on real FastF1 data
  - Track characteristics analysis (longest straight, corner distribution)
  
- **Performance Metrics**
  - Top Speed (km/h)
  - Corner Speed (km/h)
  - Downforce (N)
  - Lift-to-Drag Ratio (L/D)
  
- **Component Analysis Panel**
  - Efficiency ratings for each aerodynamic component:
    - Front Wing
    - Rear Wing
    - Floor
    - Sidepods
    - Diffuser
    - Halo
  - Improvement potential percentages
  - Drag contribution metrics
  
- **AI-Powered Insights**
  - Track-specific recommendations
  - Optimal aerodynamic configuration
  - Performance optimization suggestions

### 🎮 Simulate (`/simulate`)
- **Circuit-Specific Analysis**
  - Visual track selector with downforce level indicators
  - Adjustable aerodynamic setup:
    - Drag Coefficient (Cd)
    - Downforce Coefficient (Cl)
  - Simulated lap time predictions:
    - Optimal Lap Time
    - Race Pace
  - ML-Analyzed Setup Recommendations
    - Critical corner identification
    - Top speed optimization
    - Corner speed analysis
    - Aero balance recommendations

### ⚖️ Compare (`/compare`)
- **Team Comparison Mode**
  - Head-to-head team comparison
  - Select two F1 teams
  - Choose a circuit
  - Component efficiency comparison
  - Lap time delta analysis
  - Performance difference metrics
  - AI-generated insights showing which team is faster and why
  
- **Real-time Analytics**
  - Visual performance comparisons
  - Detailed component analysis
  - Speed differentials
  - Efficiency ratings
  
- **Stats Overview**
  - Dynamic corner speed ranges:
    - Slow corners: 40-110 km/h
    - Medium corners: 90-180 km/h
    - Fast corners: 180-320 km/h
  
- **AI Insights & Engineering Recommendations**
  - Backend-generated insights based on actual telemetry
  - Track-specific optimization suggestions
  - Corner-by-corner performance analysis

### 🧩 Quiz (`/quiz`)
- **F1 Team Personality Quiz**
  - 10 personality-based questions
  - Matches users to their ideal F1 team
  - 10 F1 teams supported
  - Interactive UI with animations
  - Score breakdown visualization
  - Live leaderboard during quiz

### 📜 2026 Regulations (`/regulations-2026`)
- **Hero Section**
  - "2026 F1: The New Era" introduction
  - Key features: Active Aero, 50% Electric, 100% Sustainable, -30kg Weight
  - Navigation buttons to different sections
  
- **Key Regulation Changes**
  - 5 regulation categories:
    1. **Active Aerodynamics** - Front & rear adjustable wings, MOM (Manual Override Mode)
    2. **Power Unit Evolution** - 50% electric, 350kW battery
    3. **Lighter & Agile** - ~30kg weight reduction, 768kg minimum
    4. **100% Sustainable Fuels** - E-fuel, carbon-neutral racing
    5. **Tyre & Dynamics** - Lower drag, narrower wings, 18-inch tyres
  
- **2025 vs 2026 Comparison**
  - Side-by-side specification comparison
  - Interactive slider for visual comparison
  - Detailed breakdown of changes:
    - Aerodynamics
    - Power Unit
    - Sustainability
  
- **Team Adaptation Predictions**
  - All 11 F1 teams including Cadillac/Andretti
  - Expected strengths
  - Key challenges
  - Competitive advantages

### 🔐 Authentication (`/auth`)
- Google Sign-In integration
- Firebase Authentication
- User session management

---

## 🚀 Installation

### Prerequisites

- **Node.js** 16.0.0 or higher
- **Python** 3.8 or higher
- **npm** or **yarn** package manager
- **Git** for version control

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd test2
```

### Step 2: Frontend Setup

```bash
cd Main
npm install
```

This will install all frontend dependencies including:
- React and React DOM
- Vite
- React Router
- Framer Motion
- Recharts
- Firebase
- And other dependencies listed in `Main/package.json`

### Step 3: Backend Setup

```bash
cd ../F1Hackathon-main
```

Create a Python virtual environment (recommended):

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

This will install all backend dependencies including:
- FastAPI and Uvicorn
- NumPy, Pandas, SciPy
- Scikit-learn, XGBoost, LightGBM, TensorFlow
- FastF1
- OpenCV, Pillow
- Matplotlib, Seaborn, Plotly
- And other dependencies listed in `F1Hackathon-main/requirements.txt`

### Step 4: Environment Configuration

Create a `.env` file in the `Main` directory for Firebase configuration (see [Firebase Environment Variables](#firebase-environment-variables) section below).

### Step 5: Start the Development Servers

**Terminal 1 - Frontend (Main directory):**
```bash
cd Main
npm run dev
```

The frontend will be available at `http://localhost:5173`

**Terminal 2 - Backend (F1Hackathon-main directory):**
```bash
cd F1Hackathon-main/api
python server.py
```

Or using uvicorn directly:
```bash
cd F1Hackathon-main/api
uvicorn server:app --reload --port 8000
```

The backend API will be available at `http://localhost:8000`

---

## 📁 Project Structure

```
test2/
├── Main/                          # Frontend React Application
│   ├── src/
│   │   ├── components/           # Reusable React components
│   │   │   ├── Navbar.jsx        # Navigation bar
│   │   │   └── ...
│   │   ├── pages/                # Page components
│   │   │   ├── Home.jsx          # Home page
│   │   │   ├── Dashboard.jsx     # Analytics dashboard
│   │   │   ├── Predict.jsx       # Prediction page
│   │   │   ├── Simulate.jsx      # Simulation page
│   │   │   ├── Compare.jsx       # Comparison page
│   │   │   ├── CornerPerformance.jsx
│   │   │   ├── Quiz.jsx          # F1 team quiz
│   │   │   ├── Regulations2026.jsx
│   │   │   └── ...
│   │   ├── services/             # API service layer
│   │   │   └── mlService.js      # ML backend API client
│   │   ├── config/               # Configuration files
│   │   │   └── firebase.js       # Firebase config
│   │   ├── App.jsx               # Main app component
│   │   └── main.jsx              # Entry point
│   ├── package.json              # Frontend dependencies
│   └── vite.config.js            # Vite configuration
│
├── F1Hackathon-main/             # Backend ML & API
│   ├── api/
│   │   ├── server.py             # FastAPI server
│   │   └── cache/                # FastF1 cache directory
│   ├── analysis/                 # Analysis modules
│   │   ├── component_analyzer.py
│   │   ├── corner_performance_analyzer.py
│   │   ├── team_comparison_analyzer.py
│   │   └── ...
│   ├── physics/                  # Physics calculations
│   │   ├── aerodynamics.py
│   │   ├── lap_time_simulator.py
│   │   └── circuit_analyzer.py
│   ├── ml_models/                # Machine learning models
│   │   ├── performance_estimator.py
│   │   ├── aero_predictor.py
│   │   └── upgrade_recommender.py
│   ├── data/                     # Data processing
│   │   ├── fastf1_data_loader.py
│   │   ├── fastf1_telemetry_loader.py
│   │   └── car_images/           # Car component images
│   ├── computer_vision/          # CV analysis
│   │   └── car_analyzer.py
│   ├── config/                   # Configuration
│   │   ├── track_configs.py      # 24 track configurations
│   │   └── settings.py           # General settings
│   ├── requirements.txt          # Python dependencies
│   └── README.md
│
└── .gitignore                    # Git ignore rules
```

---

## ⚙️ Configuration

### Firebase Environment Variables

Create a `.env` file in the `Main` directory with the following structure:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
```

#### How to Get Firebase Credentials:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Go to **Project Settings** (gear icon)
4. Scroll down to **Your apps** section
5. Click the **Web** icon (`</>`) to add a web app
6. Copy the configuration values from the Firebase SDK setup
7. Replace the placeholders in your `.env` file

**Example `.env` file:**

```env
# Firebase Configuration Example
VITE_FIREBASE_API_KEY=AIzaSyABC123xyz789EXAMPLE_KEY
VITE_FIREBASE_AUTH_DOMAIN=aerovelocity-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=aerovelocity-app
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
```

### Backend Configuration

The backend uses FastF1 API which automatically caches data in:
- `F1Hackathon-main/api/cache/` - API cache directory
- `F1Hackathon-main/cache/` - General cache directory

Cache files are automatically ignored by Git (see `.gitignore`).

---

## 🎮 Usage

### Starting the Application

1. **Start Backend Server:**
   ```bash
   cd F1Hackathon-main/api
   python server.py
   ```
   Server will start on `http://localhost:8000`

2. **Start Frontend Development Server:**
   ```bash
   cd Main
   npm run dev
   ```
   Application will be available at `http://localhost:5173`

3. **Access the Application:**
   Open your browser and navigate to `http://localhost:5173`

### API Endpoints

The backend provides the following REST API endpoints:

- `GET /api/health` - Health check
- `GET /api/tracks` - Get all available F1 circuits
- `POST /api/analyze/team` - Complete team analysis at a specific track
- `POST /api/analyze/components` - Component-specific analysis
- `POST /api/predict/performance` - Performance prediction
- `POST /api/simulate/lap` - Lap time simulation
- `POST /api/simulate/circuit` - Circuit-specific analysis
- `POST /api/compare/teams` - Team comparison
- `POST /api/upgrades/recommend` - Upgrade recommendations
- `POST /api/analyze/image` - Image-based car analysis
- `POST /api/ai/insights` - AI-powered insights
- `POST /api/corner-performance` - Corner performance analysis

---

## 📝 Additional Notes

### FastF1 Cache

The application uses FastF1 API which caches session data. Cache files can become large (>100MB). These are automatically excluded from Git tracking.

### Performance Optimization

- Frontend uses Vite for fast development and optimized builds
- Backend uses FastAPI for high-performance async API handling
- ML models are cached after first load for faster predictions
- FastF1 data is cached to reduce API calls

### Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Modern browsers with ES6+ support

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is part of a hackathon submission. All rights reserved.

---

## 🔗 Links

- **Frontend Repository:** Main directory
- **Backend Repository:** F1Hackathon-main directory
- **API Documentation:** Available at `http://localhost:8000/docs` when backend is running

---

## 🆘 Support

For issues and questions, please open an issue on the repository or contact the development team.

---

## 📋 Firebase Environment Variables Example

Create a `.env` file in the `Main` directory with the following structure:

### `.env.example` File

```env
# ============================================
# Firebase Configuration
# ============================================
# Get these values from: https://console.firebase.google.com/
# 1. Go to Project Settings > Your apps > Web app
# 2. Copy the configuration values from Firebase SDK setup

# Firebase API Key
VITE_FIREBASE_API_KEY=your_firebase_api_key_here

# Firebase Auth Domain (format: your-project-id.firebaseapp.com)
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com

# Firebase Project ID
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id

# Firebase App ID
VITE_FIREBASE_APP_ID=your_firebase_app_id

# Firebase Messaging Sender ID
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
```

### Step-by-Step Setup Instructions:

1. **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" or select existing project
   - Follow the setup wizard

2. **Enable Authentication:**
   - In Firebase Console, go to "Authentication"
   - Click "Get Started"
   - Enable "Google" sign-in provider
   - Add your domain to authorized domains

3. **Get Web App Configuration:**
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps" section
   - Click Web icon (`</>`)
   - Register app with a nickname (e.g., "AeroVelocity Web")
   - Copy the configuration values

4. **Create `.env` File:**
   - Copy `.env.example` to `.env` in the `Main` directory
   - Replace all placeholder values with your actual Firebase credentials
   - Save the file

5. **Verify Setup:**
   - Restart the development server: `npm run dev`
   - Try logging in with Google to verify authentication works

### Important Notes:

- ⚠️ **Never commit `.env` file to Git** - It contains sensitive credentials
- ✅ The `.env` file is already in `.gitignore`
- ✅ Use `.env.example` as a template for your `.env` file
- ✅ All Firebase env variables must start with `VITE_` for Vite to expose them

---

