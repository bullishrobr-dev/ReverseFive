@echo off
echo ========================================
echo  Zero Lines Thermal Print Server
echo  ESC/POS Direct Mode
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed.
    echo.
    echo Please install Python from https://python.org
echo Make sure to check "Add Python to PATH" during installation.
    echo.
    pause
    exit /b 1
)

echo Starting print server...
echo This will send raw ESC/POS commands directly to your thermal printer.
echo.
python printer-server.py

pause
