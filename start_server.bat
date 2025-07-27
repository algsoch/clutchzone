@echo off
echo Starting ClutchZone Backend Server...
cd /d "%~dp0backend"
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
pause
