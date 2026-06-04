#!/usr/bin/env python3
"""
Zero Lines Thermal Print Server - IMAGE MODE
============================================
Generates receipt as a bitmap image and prints via Windows GDI.
This is the same approach your POS system uses — it works with
BIXOLON SRP-350 and any thermal printer that has a Windows driver.

Usage:  python printer-server.py
        Then click "Print Receipt" in the admin panel.

How it works:
1. Admin panel sends offer JSON to this server
2. Server builds a receipt image (logo, text, QR code) using Pillow
3. Image is sent to the printer through Windows GDI (like a photo)
4. The BIXOLON driver converts the image to thermal dots automatically
"""

import os
import sys
import traceback

# --- Catch ALL startup errors and print them ---
startup_error = None
try:
    import json
    import base64
    import tempfile
    import threading
    from datetime import datetime
    from io import BytesIO

    # ============================================================
    # AUTO-INSTALL DEPENDENCIES
    # ============================================================
    import importlib

    def install_if_missing(pip_name, import_name):
        """Install package via pip if import fails. Clear cache after install."""
        try:
            importlib.import_module(import_name)
        except ImportError:
            print(f"[INSTALL] {pip_name} not found. Installing...")
            result = os.system(f'"{sys.executable}" -m pip install "{pip_name}"')
            if result != 0:
                print(f"[ERROR] Failed to install {pip_name}")
                sys.exit(1)
            # Clear stale module cache so fresh import works
            for key in list(sys.modules.keys()):
                if key == import_name or key.startswith(import_name + '.'):
                    del sys.modules[key]

    # Install first, then import fresh
    install_if_missing('pillow', 'PIL')
    install_if_missing('qrcode[pil]', 'qrcode')

    Image = importlib.import_module('PIL.Image')
    ImageDraw = importlib.import_module('PIL.ImageDraw')
    ImageFont = importlib.import_module('PIL.ImageFont')
    qrcode_module = importlib.import_module('qrcode')

except Exception as e:
    startup_error = traceback.format_exc()
    print("=" * 60)
    print("FATAL ERROR DURING STARTUP:")
    print(startup_error)
    print("=" * 60)
    input("Press Enter to exit...")
    sys.exit(1)


# ============================================================
# CONFIGURE YOUR PRINTER HERE
# ============================================================
PRINTER_NAME = "80mm Series Printer"   # <-- Your Windows printer name
PAPER_WIDTH_MM = 80                    # 80mm or 58mm
PAPER_WIDTH_DOTS = 576                 # 80mm at ~180 DPI
# ============================================================

# Gift names (ASCII only - no accents for thermal compatibility)
GIFT_NAMES = {
    'day-cream': 'Crema de Dia',
    'night-cream': 'Crema de Noche',
    'facial-serum': 'Serum Facial',
    'eye-serum': 'Serum de Ojos',
    'eye-cream': 'Contorno de Ojos',
    'facial-peel': 'Peeling Facial',
    'body-scrub': 'Exfoliante Corporal',
    'body-butter': 'Mantequilla Corporal',
    'nail-kit': 'Kit de Unas',
    'facial-cleanser': 'Limpiador Facial',
}


# ============================================================
# FONT HELPERS
# ============================================================
def find_font(names, size):
    """Find a Windows system font by filename."""
    font_dirs = [
        os.path.expandvars(r"%WINDIR%\Fonts"),
        r"C:\Windows\Fonts",
    ]
    for d in font_dirs:
        for name in names:
            path = os.path.join(d, name)
            if os.path.exists(path):
                try:
                    return ImageFont.truetype(path, size)
                except Exception:
                    pass
    return ImageFont.load_default()


def load_font(size, bold=False):
    """Load a sans-serif system font."""
    names = []
    if bold:
        names.extend(["seguisb.ttf", "arialbd.ttf", "tahomabd.ttf", "verdanab.ttf"])
    names.extend(["segoeui.ttf", "arial.ttf", "tahoma.ttf", "verdana.ttf", "msyh.ttc"])
    return find_font(names, size)


def load_mono_font(size):
    """Load a monospace font for aligned pricing."""
    return find_font(["cour.ttf", "consola.ttf", "lucon.ttf", "courbd.ttf"], size)


# ============================================================
# RECEIPT IMAGE BUILDER
# ============================================================
def build_receipt_image(offer):
    """
    Build a receipt as a PIL Image.
    The receipt includes logo, text, pricing, QR code, and footer.
    """
    width = PAPER_WIDTH_DOTS

    # --- Load fonts ---
    font_header = load_font(32, bold=True)
    font_subheader = load_font(24, bold=True)
    font_title = load_font(20, bold=True)
    font_text = load_font(20)
    font_small = load_font(16)
    font_large = load_font(28, bold=True)

    # --- Create a tall canvas for measurement ---
    temp_img = Image.new('RGB', (width, 3000), 'white')
    temp_draw = ImageDraw.Draw(temp_img)

    def text_size(text, font):
        """Measure text dimensions."""
        bbox = temp_draw.textbbox((0, 0), text, font=font)
        return bbox[2] - bbox[0], bbox[3] - bbox[1]

    def draw_text(y, text, font, align='left', color='black'):
        """Draw a line of text and return its height."""
        tw, th = text_size(text, font)
        if align == 'center':
            x = (width - tw) // 2
        elif align == 'right':
            x = width - tw - 20
        else:
            x = 20
        temp_draw.text((x, y), text, font=font, fill=color)
        return th

    # --- Build receipt content ---
    y = 30

    # Logo (PNG file next to script, or text fallback)
    logo = None
    script_dir = os.path.dirname(os.path.abspath(__file__))
    for logo_name in ["zerolines-logo.png", "zerolines-logo.jpg", "logo.png", "logo.jpg"]:
        logo_path = os.path.join(script_dir, logo_name)
        if os.path.exists(logo_path):
            try:
                logo = Image.open(logo_path).convert('RGBA')
                logo_w = min(width - 40, 320)
                ratio = logo_w / logo.width
                logo_h = int(logo.height * ratio)
                logo = logo.resize((logo_w, logo_h), Image.LANCZOS)
                break
            except Exception:
                pass

    if logo:
        logo_x = (width - logo.width) // 2
        temp_img.paste(logo, (logo_x, y), logo)
        y += logo.height + 20
    else:
        h = draw_text(y, "ZERO LINES", font_header, 'center')
        y += h + 5

    h = draw_text(y, "ANDORRA", font_subheader, 'center')
    y += h + 15

    # Separator
    temp_draw.line([(20, y), (width - 20, y)], fill='black', width=2)
    y += 20

    # Offer title
    h = draw_text(y, "OFERTA EXCLUSIVA", font_title, 'center')
    y += h + 10

    # Calculations
    units = offer.get('units', 1)
    regular = 300 * units
    custom = offer.get('price', 300) * units
    savings = regular - custom

    h = draw_text(y, f"Para: {offer.get('customer', 'Usted')}", font_text)
    y += h + 5
    h = draw_text(y, f"Por: {offer.get('seller', 'Vendedor')}", font_small)
    y += h + 15

    temp_draw.line([(20, y), (width - 20, y)], fill='black', width=2)
    y += 20

    # Product info
    h = draw_text(y, "Reverse Five Wrinkle Eraser", font_title, 'center')
    y += h + 5
    h = draw_text(y, f"{units} unidad{'es' if units > 1 else ''}", font_text, 'center')
    y += h + 5
    h = draw_text(y, "100 tratamientos - 2 anos", font_small, 'center')
    y += h + 15

    temp_draw.line([(20, y), (width - 20, y)], fill='black', width=2)
    y += 20

    # Pricing (monospace for alignment)
    mono_font = load_mono_font(20)
    h = draw_text(y, f"Precio regular:  EUR {regular}", mono_font)
    y += h + 8
    h = draw_text(y, f"TU PRECIO:       EUR {custom}", font_large)
    y += h + 8
    h = draw_text(y, f"AHORRAS:         EUR {savings}", font_large)
    y += h + 15

    temp_draw.line([(20, y), (width - 20, y)], fill='black', width=2)
    y += 20

    # Gifts
    gifts = offer.get('gifts', [])
    if gifts:
        h = draw_text(y, f"REGALOS INCLUIDOS ({len(gifts)})", font_title, 'center')
        y += h + 10
        for g in gifts:
            h = draw_text(y, f"+ {GIFT_NAMES.get(g, g)}", font_text)
            y += h + 5
        y += 10
        temp_draw.line([(20, y), (width - 20, y)], fill='black', width=2)
        y += 20

    # Note
    note = offer.get('note', '')
    if note:
        h = draw_text(y, f'"{note}"', font_small)
        y += h + 15
        temp_draw.line([(20, y), (width - 20, y)], fill='black', width=2)
        y += 20

    # QR Code section
    h = draw_text(y, "ESCANEA PARA RECLAMAR", font_title, 'center')
    y += h + 10

    # Generate QR code image
    url = f"https://bullishrobr-dev.github.io/ReverseFive/offer.html?d="
    url += base64.b64encode(json.dumps(offer).encode()).decode()

    qr = qrcode_module.QRCode(box_size=4, border=2)
    qr.add_data(url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white")
    qr_size = min(220, width - 80)
    qr_img = qr_img.resize((qr_size, qr_size), Image.NEAREST)
    qr_img = qr_img.convert('RGB')

    qr_x = (width - qr_size) // 2
    temp_img.paste(qr_img, (qr_x, y))
    y += qr_size + 15

    temp_draw.line([(20, y), (width - 20, y)], fill='black', width=2)
    y += 20

    # Expiry
    expiry = offer.get('expires', '')
    if expiry:
        try:
            dt = datetime.fromisoformat(expiry.replace('Z', '+00:00'))
            h = draw_text(y, "Oferta expira:", font_text, 'center')
            y += h + 5
            h = draw_text(y, dt.strftime("%d/%m/%Y %H:%M"), font_subheader, 'center')
            y += h + 15
        except Exception:
            h = draw_text(y, f"Expira: {expiry}", font_text, 'center')
            y += h + 15
        temp_draw.line([(20, y), (width - 20, y)], fill='black', width=2)
        y += 20

    # Footer
    h = draw_text(y, "Gracias por su confianza", font_text, 'center')
    y += h + 5
    h = draw_text(y, "Zero Lines - Andorra", font_small, 'center')
    y += h + 5
    h = draw_text(y, "+350 5400 5198", font_small, 'center')
    y += h + 5
    h = draw_text(y, "info@zerolines.life", font_small, 'center')
    y += h + 30

    # Cut line (thick)
    temp_draw.line([(20, y), (width - 20, y)], fill='black', width=4)
    y += 40

    # --- Crop to actual content size ---
    receipt = temp_img.crop((0, 0, width, y))
    return receipt


# ============================================================
# WINDOWS GDI PRINTER (ctypes - no pywin32 needed)
# ============================================================
def print_receipt_image(image, printer_name=PRINTER_NAME):
    """
    Print a PIL Image via Windows GDI using ctypes.
    This sends the image to the printer like a photo/document,
    and the BIXOLON driver handles converting it to thermal dots.
    """
    import ctypes
    from ctypes import wintypes

    gdi32 = ctypes.windll.gdi32

    # Ensure image is RGB
    if image.mode != 'RGB':
        image = image.convert('RGB')

    width, height = image.size

    # Convert PIL RGB data to Windows BGR format for DIB
    rgb_data = image.tobytes()
    bgr_data = bytearray()
    for i in range(0, len(rgb_data), 3):
        bgr_data.extend([rgb_data[i + 2], rgb_data[i + 1], rgb_data[i]])
    bgr_data = bytes(bgr_data)

    # Create printer device context
    hdc = gdi32.CreateDCW("WINSPOOL", printer_name, None, None)
    if not hdc:
        err = ctypes.GetLastError()
        raise RuntimeError(
            f"Cannot open printer '{printer_name}'. Error: {err}.\n"
            f"Make sure the printer name matches exactly in Windows.\n"
            f"Check: Control Panel > Devices and Printers"
        )

    try:
        # Start print document
        class DOCINFOW(ctypes.Structure):
            _fields_ = [
                ("cbSize", wintypes.INT),
                ("lpszDocName", wintypes.LPCWSTR),
                ("lpszOutput", wintypes.LPCWSTR),
                ("lpszDatatype", wintypes.LPCWSTR),
                ("fwType", wintypes.DWORD),
            ]

        doc_info = DOCINFOW()
        doc_info.cbSize = ctypes.sizeof(DOCINFOW)
        doc_info.lpszDocName = "Zero Lines Receipt"
        doc_info.lpszOutput = None
        doc_info.lpszDatatype = None
        doc_info.fwType = 0

        if gdi32.StartDocW(hdc, ctypes.byref(doc_info)) <= 0:
            err = ctypes.GetLastError()
            raise RuntimeError(f"StartDoc failed. Error: {err}")

        try:
            if gdi32.StartPage(hdc) <= 0:
                err = ctypes.GetLastError()
                raise RuntimeError(f"StartPage failed. Error: {err}")

            try:
                # Create memory DC compatible with printer
                memdc = gdi32.CreateCompatibleDC(hdc)
                if not memdc:
                    raise RuntimeError("CreateCompatibleDC failed")

                try:
                    # BITMAPINFO for 24-bit DIB
                    class BITMAPINFOHEADER(ctypes.Structure):
                        _fields_ = [
                            ("biSize", wintypes.DWORD),
                            ("biWidth", wintypes.LONG),
                            ("biHeight", wintypes.LONG),
                            ("biPlanes", wintypes.WORD),
                            ("biBitCount", wintypes.WORD),
                            ("biCompression", wintypes.DWORD),
                            ("biSizeImage", wintypes.DWORD),
                            ("biXPelsPerMeter", wintypes.LONG),
                            ("biYPelsPerMeter", wintypes.LONG),
                            ("biClrUsed", wintypes.DWORD),
                            ("biClrImportant", wintypes.DWORD),
                        ]

                    class RGBQUAD(ctypes.Structure):
                        _fields_ = [
                            ("rgbBlue", wintypes.BYTE),
                            ("rgbGreen", wintypes.BYTE),
                            ("rgbRed", wintypes.BYTE),
                            ("rgbReserved", wintypes.BYTE),
                        ]

                    class BITMAPINFO(ctypes.Structure):
                        _fields_ = [
                            ("bmiHeader", BITMAPINFOHEADER),
                            ("bmiColors", RGBQUAD * 1),
                        ]

                    bmi = BITMAPINFO()
                    bmi.bmiHeader.biSize = ctypes.sizeof(BITMAPINFOHEADER)
                    bmi.bmiHeader.biWidth = width
                    bmi.bmiHeader.biHeight = -height   # Negative = top-down
                    bmi.bmiHeader.biPlanes = 1
                    bmi.bmiHeader.biBitCount = 24
                    bmi.bmiHeader.biCompression = 0    # BI_RGB
                    bmi.bmiHeader.biSizeImage = len(bgr_data)
                    bmi.bmiHeader.biXPelsPerMeter = 0
                    bmi.bmiHeader.biYPelsPerMeter = 0
                    bmi.bmiHeader.biClrUsed = 0
                    bmi.bmiHeader.biClrImportant = 0

                    # Create DIB section (memory-mapped bitmap)
                    ppvBits = ctypes.c_void_p()
                    hbitmap = gdi32.CreateDIBSection(
                        memdc, ctypes.byref(bmi), 0,
                        ctypes.byref(ppvBits), None, 0
                    )
                    if not hbitmap:
                        raise RuntimeError("CreateDIBSection failed")

                    try:
                        # Copy image pixels into DIB memory
                        ctypes.memmove(ppvBits.value, bgr_data, len(bgr_data))

                        # Select bitmap into memory DC
                        old_bitmap = gdi32.SelectObject(memdc, hbitmap)

                        # Copy from memory DC to printer DC
                        SRCCOPY = 0x00CC0020
                        result = gdi32.BitBlt(
                            hdc, 0, 0, width, height,
                            memdc, 0, 0, SRCCOPY
                        )
                        if not result:
                            err = ctypes.GetLastError()
                            raise RuntimeError(f"BitBlt failed. Error: {err}")

                        # Restore old bitmap
                        gdi32.SelectObject(memdc, old_bitmap)

                    finally:
                        gdi32.DeleteObject(hbitmap)

                finally:
                    gdi32.DeleteDC(memdc)

            finally:
                gdi32.EndPage(hdc)

        finally:
            gdi32.EndDoc(hdc)

    finally:
        gdi32.DeleteDC(hdc)

    print(f"[OK] Printed {width}x{height} receipt to '{printer_name}'")
    return True


# ============================================================
# HTTP SERVER
# ============================================================
def start_server(port=8765):
    from http.server import BaseHTTPRequestHandler, HTTPServer

    class PrintHandler(BaseHTTPRequestHandler):
        def do_OPTIONS(self):
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()

        def do_POST(self):
            if self.path == '/print':
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length).decode('utf-8')

                import traceback
                try:
                    offer = json.loads(post_data)

                    # Build receipt image
                    print(f"[BUILD] Generating receipt image...")
                    receipt_image = build_receipt_image(offer)
                    print(f"[BUILD] Receipt size: {receipt_image.size[0]} x {receipt_image.size[1]} pixels")

                    # Save debug copy (optional - for troubleshooting)
                    debug_path = os.path.join(tempfile.gettempdir(), "receipt_debug.png")
                    try:
                        receipt_image.save(debug_path)
                        print(f"[DEBUG] Saved preview to: {debug_path}")
                    except Exception:
                        pass

                    # Print via GDI
                    success = print_receipt_image(receipt_image, PRINTER_NAME)

                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({
                        'success': success,
                        'message': 'Receipt printed!'
                    }).encode())

                except Exception as e:
                    error_msg = str(e)
                    tb = traceback.format_exc()
                    print(f"[ERROR] {error_msg}")
                    print(tb)
                    self.send_response(500)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({
                        'success': False,
                        'error': error_msg,
                        'traceback': tb
                    }).encode())
            else:
                self.send_response(404)
                self.end_headers()

        def log_message(self, format, *args):
            print("[Print Server]", format % args)

    server = HTTPServer(('127.0.0.1', port), PrintHandler)
    print("=" * 56)
    print("  Zero Lines Thermal Print Server")
    print("  Image Mode (GDI) - BIXOLON Compatible")
    print("=" * 56)
    print(f"  Running at: http://127.0.0.1:{port}")
    print(f"  Printer:    {PRINTER_NAME}")
    print(f"  Paper:      {PAPER_WIDTH_MM}mm ({PAPER_WIDTH_DOTS} dots)")
    print("")
    print("  Usage: Click 'Print Receipt' in the admin panel")
    print("         Press Ctrl+C to stop")
    print("=" * 56)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...")
        server.shutdown()


if __name__ == '__main__':
    start_server()
