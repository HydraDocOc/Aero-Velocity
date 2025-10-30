# AeroVelocity - AI Aerodynamic Simulation Platform

**A futuristic AI-based aerodynamic simulation platform built for Formula Hacks 2025**

🏆 **Selected in Top 40 Teams**  
🏛️ **Chitkara University Team**

## 🚀 Project Overview

AeroVelocity is an AI-powered platform that enables users to:
- Upload car data and race datasets
- Get AI predictions on drag, downforce, lap times, and efficiency
- View real-time analytics dashboards
- Simulate race conditions (wind speed, track surface, temperature)
- Interact with an AI chat engineer for optimization strategies

## 🛠 Tech Stack

### Current (Phase 2 - Completed)
- **Frontend:** React 19 + Vite
- **Routing:** React Router DOM v7
- **Styling:** Pure CSS with custom variables (no Tailwind)
- **Animations:** CSS transitions, transforms, and keyframes
- **Backend:** Firebase (Auth + Firestore + Storage)
- **Authentication:** Google Sign-In via Firebase Auth
- **File Upload:** Firebase Storage with progress tracking
- **Database:** Firestore for metadata storage

### Future Integrations (Phase 3+)
- **ML Integration:** Python scripts for model inference
- **Analytics:** Recharts for data visualization
- **API:** RESTful API for ML model integration

## 📁 Project Structure

```
Aero Velocity/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.jsx       # Navigation bar with glassmorphism
│   │   ├── Navbar.css
│   │   ├── GlowingButton.jsx # Neon button component
│   │   ├── GlowingButton.css
│   │   ├── AnimatedCard.jsx  # Glass morphism card
│   │   └── AnimatedCard.css
│   │
│   ├── pages/               # Route pages
│   │   ├── Home.jsx        # Landing page with hero section
│   │   ├── Home.css
│   │   ├── Dashboard.jsx   # Analytics dashboard (coming soon)
│   │   ├── Dashboard.css
│   │   ├── Predict.jsx     # Prediction page
│   │   ├── Simulate.jsx    # Simulation page
│   │   ├── Chat.jsx        # AI chat interface
│   │   ├── Team.jsx        # Team information
│   │   ├── Team.css
│   │   ├── Contact.jsx     # Contact form
│   │   └── Contact.css
│   │
│   ├── utils/              # Utility functions
│   │   └── constants.js    # App-wide constants
│   │
│   ├── App.jsx             # Main app with routing
│   ├── App.css             # App-level styles
│   ├── index.css           # Global theme & variables
│   └── main.jsx            # Entry point
│
├── public/                 # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies
└── vite.config.js          # Vite configuration
```

## 🎨 Design System

### Theme Variables
The design uses CSS custom properties (variables) defined in `src/index.css`:

- **Colors:**
  - `--color-accent-red` (#ff0040)
  - `--color-accent-blue` (#00d4ff)
  - `--color-accent-purple` (#8b5cf6)
  - `--color-accent-gold` (#ffb800)

- **Glass Morphism:**
  - `--glass-bg`: Semi-transparent background
  - `--glass-border`: Subtle border
  - `--glass-blur`: Blur effect

- **Animations:**
  - `slideInUp`: Slide-in animation
  - `glowPulse`: Pulsing glow effect
  - `float`: Floating orb animation
  - `gradientShift`: Gradient animation

### Key Design Features
1. **Glassmorphism:** Semi-transparent cards with blur effects
2. **Neon Gradients:** Multi-color gradient effects
3. **Smooth Transitions:** 0.2s - 0.5s ease transitions
4. **Responsive:** Mobile-first approach
5. **Futuristic UI:** Bold, modern, racing-inspired design

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Start development server:**
```bash
npm run dev
```

The app works in **mock mode** immediately - no Firebase setup needed!

### Optional: Configure Firebase

To enable real authentication and file storage:

1. **Create `.env` file in the project root:**
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

2. Get your credentials from [Firebase Console](https://console.firebase.google.com/)

3. See `FIREBASE_SETUP.md` for detailed instructions

### Build Commands

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📄 Available Routes

- `/` - Home page with hero section
- `/dashboard` - Analytics dashboard (coming soon)
- `/predict` - Prediction page (coming soon)
- `/simulate` - Simulation page (coming soon)
- `/chat` - AI chat interface (coming soon)
- `/team` - Team information
- `/contact` - Contact form

## 🔌 Integration Points (Future)

The architecture is designed for easy integration:

1. **ML Models (Python):**
   - Create API endpoints in `/src/api/mlService.js`
   - Add file upload handling in `/src/utils/fileUpload.js`
   - Integrate with backend service

2. **Firebase Backend:**
   - Add Firebase config in `/src/config/firebase.js`
   - Create auth service in `/src/services/auth.js`
   - Add Firestore service in `/src/services/database.js`

3. **Real-Time Features:**
   - WebSocket support for live updates
   - WebRTC for streaming (if needed)

## 🎯 Current Status

### ✅ Phase 1 (Completed)
- [x] Folder structure setup
- [x] React Router configuration
- [x] Navbar component
- [x] Home page with hero section
- [x] Placeholder pages for all routes
- [x] Futuristic CSS theme
- [x] Sample components (GlowingButton, AnimatedCard)
- [x] Responsive design

### 🚧 Phase 2 (Next Steps)
- [ ] Firebase authentication
- [ ] File upload functionality
- [ ] Dashboard with real data
- [ ] ML model integration
- [ ] Real-time analytics
- [ ] AI chat interface

## 👥 Team Members

1. **Natansh** - Full-Stack Developer (Website & Backend)
2. **Member 2** - ML Engineer (Model Training)
3. **Member 3** - Data Scientist (Data Analysis)
4. **Member 4** - ML Specialist (Python Scripts)

## 📝 Notes

- This is a hackathon project for Formula Hacks 2025
- Selected in Top 40 teams
- Team from Chitkara University
- Built with modern web technologies
- Designed for scalability and easy ML integration

## 🎨 Design Inspiration

The design is inspired by:
- F1 racing aesthetics
- Futuristic UI trends (2034 vision)
- Glassmorphism and neon effects
- Racing simulation games
- Modern AI dashboards

## 📄 License

This project is created for Formula Hacks 2025 competition.

---

**Built with ⚡ by the AeroVelocity Team**
