@echo off
echo ========================================
echo F1 Aero Analysis - Backend Setup
echo ========================================
echo.

echo Installing Python dependencies...
echo.

pip install fastapi uvicorn pydantic numpy pandas scipy scikit-learn opencv-python pillow matplotlib seaborn

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo You can now run the backend with:
echo   python api\server.py
echo.
echo Or use the full stack launcher:
echo   ..\start-app.bat
echo.

pause

