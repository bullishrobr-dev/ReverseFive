# Print Bridge — Thermal Printer Integration Guide

> **What this is:** A complete guide for integrating BIXOLON SRP-350 (or any Windows thermal printer) into ANY web project. Built for Zero Lines / Reverse Five, reusable for Quick Prints or any other project.
>
> **Why it works:** Instead of fighting with raw ESC/POS commands (which Windows drivers mess up), we generate a receipt as an **image** and print it through Windows GDI — exactly how POS systems do it.

---

## Architecture Overview

```
Browser (your web app)
    ↓  fetch('http://127.0.0.1:8765/print', { body: JSON.stringify(data) })
Python HTTP Server (printer-server.py)
    ↓  Receives JSON, builds receipt image
Pillow (PIL)
    ↓  Draws text, logo, QR code on canvas
Threshold Filter
    ↓  Forces pure black/white (no gray = crisp thermal output)
Windows GDI (ctypes)
    ↓  Sends image to printer driver
BIXOLON Driver
    ↓  Converts image to thermal dots
Printer
    →  Physical receipt with logo, text, QR code, auto-cut
```

**Key insight:** The BIXOLON Windows driver expects **images/documents**, not raw ESC/POS bytes. This bridge generates an image and prints it the same way your POS system does.

---

## Quick Start

### 1. Copy the printer server

Copy `printer-server.py` and `start-printer.bat` to your project folder (or Desktop).

### 2. Configure your printer name

Open `printer-server.py` and change:

```python
PRINTER_NAME = "80mm Series Printer"   # Your exact Windows printer name
PAPER_WIDTH_MM = 80                    # 80mm or 58mm
PAPER_WIDTH_DOTS = 576                 # 80mm at ~180 DPI
```

To find your printer name: `Control Panel > Devices and Printers`

### 3. Start the server

Double-click `start-printer.bat`. A black window should show:

```
Zero Lines Thermal Print Server
Image Mode (GDI)
Running at: http://127.0.0.1:8765
```

Leave it running. It listens for print requests from your web app.

### 4. Send print jobs from your web app

From any JavaScript in your web project:

```javascript
async function printReceipt(data) {
    try {
        const response = await fetch('http://127.0.0.1:8765/print', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            alert('Printed!');
        } else {
            alert('Print failed: ' + result.error);
        }
    } catch (err) {
        alert('Print server not running. Start start-printer.bat first.');
    }
}

// Example: print a discount voucher
printReceipt({
    type: 'voucher',
    customer: 'Juan Garcia',
    business: 'Quick Prints',
    offer: '20% OFF next visit',
    code: 'SAVE20',
    expires: '2026-06-30T23:59:00'
});
```

The server receives the JSON, builds a receipt image, and prints it.

---

## Customizing the Receipt Layout

### Where to edit

In `printer-server.py`, the function `build_receipt_image(data)` draws the receipt.

### Current structure (Zero Lines / Reverse Five)

```
Logo (auto-detected from zerolines-logo.png)
────────────────────────
OFERTA EXCLUSIVA
Para: [Customer]
Por: [Seller]
────────────────────────
Reverse Five Wrinkle Eraser
[N] unidades
────────────────────────
Precio regular:  EUR [amount]
TU PRECIO:       EUR [amount]
AHORRAS:         EUR [amount]
────────────────────────
REGALOS INCLUIDOS (N)
+ [Gift 1]
+ [Gift 2]
...
────────────────────────
"[Note]"
────────────────────────
ESCANEA PARA RECLAMAR
[QR CODE]
────────────────────────
Oferta expira:
[Date/Time]
────────────────────────
Gracias por su confianza
Zero Lines - Andorra
+350 5400 5198
info@zerolines.life

════════════════════════  ← thick cut line
```

### How to customize for Quick Prints

1. **Change the header:** Replace "ZERO LINES" / "ANDORRA" with your business name
2. **Change the sections:** Add/remove sections based on your voucher type
3. **Change colors:** Text is always black, background white (thermal printers are monochrome)
4. **Add your logo:** Put `logo.png` next to the script
5. **Change the QR code URL:** Point to your own offer/validation page

Example for a discount voucher:

```python
def build_receipt_image(data):
    width = PAPER_WIDTH_DOTS
    # ... setup fonts ...
    
    y = 30
    # Business logo or name
    h = draw_text(y, "QUICK PRINTS", font_header, 'center')
    y += h + 5
    h = draw_text(y, "Andorra", font_subheader, 'center')
    y += h + 15
    
    temp_draw.line([(20, y), (width - 20, y)], fill='black', width=2)
    y += 20
    
    # Voucher details
    h = draw_text(y, "VOUCHER DESCUENTO", font_title, 'center')
    y += h + 10
    
    h = draw_text(y, f"Cliente: {data.get('customer', '')}", font_text)
    y += h + 5
    h = draw_text(y, f"Oferta: {data.get('offer', '')}", font_large)
    y += h + 15
    
    # QR code with validation URL
    qr = qrcode_module.QRCode(box_size=4, border=2)
    qr.add_data(data.get('validation_url', ''))
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white")
    # ... paste QR code ...
    
    # Threshold and return
    receipt = temp_img.crop((0, 0, width, y))
    gray = receipt.convert('L')
    bw = gray.point(lambda x: 0 if x < 200 else 255)
    return bw.convert('RGB')
```

---

## The Core Printing Engine (Reusable)

The `print_receipt_image()` function is the **universal printer driver**. It works with ANY Windows printer, ANY driver, ANY project.

### How to use it in any Python script

```python
from PIL import Image

# 1. Create your image (any size, any content)
img = Image.new('RGB', (576, 800), 'white')
# ... draw your content ...

# 2. Threshold to pure black/white (critical for thermal)
gray = img.convert('L')
bw = gray.point(lambda x: 0 if x < 200 else 255)
img = bw.convert('RGB')

# 3. Print via GDI (copy print_receipt_image() from printer-server.py)
print_receipt_image(img, "Your Printer Name")
```

### What `print_receipt_image()` does

1. Creates a Windows **Device Context** (DC) for the printer
2. Starts a **print document** via `StartDocW`
3. Creates a **memory DC** and a **DIB section** (memory-mapped bitmap)
4. Copies your image pixels into the DIB memory
5. Uses **BitBlt** to copy from memory DC to printer DC
6. The printer driver converts the bitmap to thermal/ink dots
7. Ends the page and document, auto-cuts if the driver is configured

**No ESC/POS knowledge needed. No driver configuration. Just image → printer.**

---

## Dependencies

| Package | Purpose | Install |
|---------|---------|---------|
| Pillow | Image generation | `pip install pillow` |
| qrcode | QR code generation | `pip install qrcode[pil]` |
| Python 3.x | Runtime | https://python.org |
| ctypes | Windows GDI (built-in) | Included with Python |

The script auto-installs missing packages on first run.

---

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| Server window closes immediately | Python not in PATH | Install Python and check "Add to PATH" |
| "module PIL has no attribute Image" | Stale cache after install | Restart the server (fixed in latest version) |
| "Cannot create DC for printer" | Wrong printer name | Check exact name in Control Panel > Printers |
| Text looks faded/gray | Anti-aliased grays being dithered | Threshold step forces pure black/white |
| QR code doesn't scan | Too small or blurry | Increase `box_size` in QRCode constructor |
| Logo not showing | Wrong filename or location | Name it `logo.png` and put it next to the script |
| Paper feeds too much | Driver cut settings | Check printer properties > Cut options |

---

## Files in This Bridge

| File | Purpose |
|------|---------|
| `printer-server.py` | Main server — HTTP listener + image builder + GDI printer |
| `start-printer.bat` | Windows launcher — finds script, installs deps, starts server |
| `logo.png` | Optional — your business logo (auto-detected by script) |

---

## API Reference

### Endpoint: `POST /print`

**URL:** `http://127.0.0.1:8765/print`

**Headers:**
```
Content-Type: application/json
```

**Body:** Any JSON object. The script's `build_receipt_image()` function decides how to render it.

**Response:**
```json
{
  "success": true,
  "message": "Receipt printed!"
}
```

**Error response:**
```json
{
  "success": false,
  "error": "Cannot create DC for 'BadPrinterName'",
  "traceback": "..."
}
```

### CORS

The server sends `Access-Control-Allow-Origin: *` so any webpage (localhost, GitHub Pages, etc.) can call it.

---

## Credits

Built for **Zero Lines / Reverse Five** by Hermetise Professional.  
Adapted for **Quick Prints** and any other project that needs reliable thermal printing on Windows.

The GDI approach was inspired by how POS systems (Square, Toast, etc.) print receipts — they generate images, not raw ESC/POS bytes.
