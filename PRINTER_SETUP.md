# Thermal Printer Setup Guide

## The Problem

Your thermal printer (BIXOLON SRP-350) speaks **ESC/POS** — a special language. Browsers cannot speak this language. That's why printing from a web page produces garbled text.

Your POS system works because it has native software that speaks ESC/POS directly.

## The Solution

We provide a **tiny local print server** that runs on your Windows computer. It receives the receipt data from the browser and sends it to the printer using plain text (which the Windows printer driver can handle).

---

## Setup (One-time)

### Step 1: Check if Python is installed

1. Press `Windows + R`
2. Type `cmd` and press Enter
3. In the black window, type: `python --version`
4. If you see a version number (e.g., `Python 3.11.0`), you're good! Skip to Step 3.

### Step 2: Install Python (if not installed)

1. Go to https://python.org/downloads
2. Click **Download Python 3.x**
3. Run the installer
4. **IMPORTANT**: Check the box "Add Python to PATH" before clicking Install
5. Click Install Now

### Step 3: Start the print server

1. Open the `reverse five` folder on your computer
2. Double-click **`start-printer.bat`**
3. A black window will open showing:
   ```
   Zero Lines Thermal Print Server
   Running at: http://127.0.0.1:8765
   ```
4. **Leave this window open** while you're working

---

## Using It

1. Open the admin panel in your browser:
   `https://bullishrobr-dev.github.io/ReverseFive/admin.html`

2. Create a custom deal

3. Click **Generate Offer**

4. Click **Print Receipt**

5. The receipt prints instantly!

---

## If It Doesn't Print

### Check 1: Is the print server running?
Look for the black window with "Zero Lines Thermal Print Server". If it's not there, double-click `start-printer.bat` again.

### Check 2: Is the printer name correct?
Open `printer-server.py` in Notepad and change this line:
```python
PRINTER_NAME = "80mm Series Printer"
```
To match your printer's exact name (as shown in Windows Settings > Printers).

### Check 3: Use the fallback method
If the local server doesn't work, the **Print Receipt** button will automatically fall back to opening a simple receipt page. Just click **PRINT RECEIPT** on that page and select your thermal printer in the dialog.

---

## How It Works

```
Browser (Admin Panel)
    |
    | POST offer data
    v
Local Print Server (localhost:8765)
    |
    | Convert to plain ASCII text
    v
Windows Print System
    |
    | Send to printer driver
    v
Thermal Printer (BIXOLON SRP-350)
```

The receipt uses **only ASCII characters** (A-Z, 0-9, basic symbols) so the thermal printer always understands it. No euro symbols, no accents, no images — just clean text.

---

## File Reference

| File | Purpose |
|------|---------|
| `printer-server.py` | The Python print server (runs locally) |
| `start-printer.bat` | Double-click to start the server |
| `admin.html` | The admin panel (works from browser) |
| `print.html` | Fallback receipt page (no server needed) |
