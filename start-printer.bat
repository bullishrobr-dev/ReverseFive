@echo off
echo ========================================
echo  Zero Lines Thermal Print Server
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH.
    echo Please install Python from https://python.org
    echo.
    pause
    exit /b 1
)

echo Starting print server...
echo.
python printer-server.py

pause
