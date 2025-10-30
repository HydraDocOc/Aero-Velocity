# 🏎️ F1 Aero Analysis - Quick Start Guide

## ⚡ Get Started in 3 Steps

### 1️⃣ Install Backend Dependencies

```bash
cd F1Hackathon-main
```

**Windows:**
```bash
setup.bat
```

**Linux/Mac:**
```bash
pip install fastapi uvicorn pydantic numpy pandas scipy scikit-learn opencv-python pillow matplotlib seaborn
```

### 2️⃣ Install Frontend Dependencies (if needed)

```bash
cd ..\Main  # Windows
cd ../Main  # Linux/Mac

npm install
```

### 3️⃣ Run the Application

```bash
cd ..

# Windows
start-app.bat

# Linux/Mac
chmod +x start-app.sh
./start-app.sh
```

## 🌐 Access Points

- **Frontend:** http://localhost:5173
- **API Docs:** http://localhost:5000/docs
- **API Health:** http://localhost:5000/api/health

## 🎯 What You Can Do

### Analyze Page
- Select team & track → Get complete aero analysis
- View lap times, speeds, component ratings

### Compare Page
- Select 2 teams & track → Head-to-head comparison
- See performance deltas and winning predictions

### Predict Page
- Adjust aero parameters → Predict performance
- Get AI insights and recommendations

### Simulate Page
- Configure car setup → Run lap simulation
- Optimize for specific tracks

## 🔍 Quick Test

1. Open http://localhost:5173
2. Go to **Analyze** page
3. Select: **Ferrari** + **Monaco**
4. Click **Analyze Team**
5. See results! ✨

## ❗ Troubleshooting

**Backend won't start?**
```bash
cd F1Hackathon-main
pip install fastapi uvicorn pydantic
```

**Frontend won't start?**
```bash
cd Main
npm install
```

**Can't connect to API?**
- Check backend is running: http://localhost:5000/api/health
- Verify both services are running in separate terminals

## 📁 Project Structure

```
test2/
├── F1Hackathon-main/     # Backend (Python FastAPI)
│   └── api/server.py      # Main API server
├── Main/                  # Frontend (React + Vite)
│   └── src/pages/         # App pages
├── start-app.bat          # Windows launcher
└── start-app.sh           # Linux/Mac launcher
```

## 🚀 Running Services Separately

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

## 💡 Pro Tips

- Use `start-app.bat` to run everything at once
- Visit `/docs` for interactive API testing
- Check terminal output for request logs
- Press `Ctrl+C` in the launcher to stop all services

## 🎉 You're Ready!

Visit **http://localhost:5173** and start analyzing F1 aerodynamics!

---

For detailed setup instructions, see `SETUP_GUIDE.md`

