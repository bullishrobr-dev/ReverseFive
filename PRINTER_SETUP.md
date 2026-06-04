# BIXOLON SRP-350 Printer Setup for Raw ESC/POS

## Problem
The BIXOLON Windows driver intercepts ESC/POS commands and converts them to GDI graphics, producing garbage output.

## Solution: Add a "Generic / Text Only" Printer

### Step 1: Find which USB port your BIXOLON printer uses
1. Press `Win + R`, type `control printers`, press Enter
2. Right-click "80mm Series Printer" → "Printer properties"
3. Click the "Ports" tab
4. Note which port is checked (e.g., `USB001`, `USB002`, `COM3`, etc.)

### Step 2: Add Generic/Text Only printer
1. Press `Win + R`, type `control printers`, press Enter
2. Click "Add a printer" at the top
3. Click "The printer that I want isn't listed"
4. Select "Add a local printer or network printer with manual settings"
5. Select the SAME port as your BIXOLON printer (e.g., `USB001`)
6. In the manufacturer list, select **"Generic"**
7. On the right, select **"Generic / Text Only"**
8. Name it: **`ThermalRaw`** (or any name you like)
9. Do NOT share it, do NOT print a test page
10. Click Finish

### Step 3: Update the Python script
Open `printer-server.py` and change:
```python
PRINTER_NAME = "80mm Series Printer"
```
to:
```python
PRINTER_NAME = "ThermalRaw"
```

### Step 4: Restart and test
1. Close the Python server window (Ctrl+C)
2. Double-click `start-printer.bat` to restart
3. Click "Print Receipt" in the admin panel

The receipt should now print correctly with proper text, formatting, logo, and QR code.

---

## Alternative: Direct COM Port (if printer exposes one)

Some BIXOLON printers appear as a COM port. If you see `COM3`, `COM4`, etc. in the Ports tab:

1. Install pyserial: `pip install pyserial`
2. We can modify the script to write directly to the COM port, bypassing Windows entirely

Let us know the port name and we can set that up instead.
