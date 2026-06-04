@echo off
echo ========================================
echo  Zero Lines Thermal Print Server
echo  Image Mode (GDI)
echo ========================================
echo.

REM Go to the folder where this batch file is located
cd /d "%~dp0"

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

echo Looking for printer-server.py in: %cd%
echo.

REM Check for the file with various possible names
if exist "printer-server.py" (
    echo Found printer-server.py
echo.
    python "printer-server.py"
) else if exist "printer-server.py.txt" (
    echo Found printer-server.py.txt - renaming to printer-server.py...
    rename "printer-server.py.txt" "printer-server.py"
    echo.
    python "printer-server.py"
) else (
    echo.
    echo ERROR: Cannot find printer-server.py
    echo.
    echo Files in this folder:
    dir /b
    echo.
    echo Make sure you downloaded printer-server.py and put it
    echo in the SAME folder as this batch file.
    echo.
    pause
    exit /b 1
)

REM Always pause so user can see any error messages
echo.
echo Server exited.
if exist "printer-error.log" (
    echo.
    echo Error log found:
    type "printer-error.log"
)
echo.
pause
