#!/usr/bin/env python3
"""
Zero Lines Thermal Print Server - ESC/POS Direct Mode
Sends raw ESC/POS commands to the thermal printer.
No Windows print driver conversion. No HTML. Just raw bytes.

Usage:  python printer-server.py
        Then click "Print Receipt" in the admin panel.

Requirements: Python 3.x (already installed)
"""

import os
import sys
import json
import base64
import tempfile
import threading
from datetime import datetime

# ============================================================
# CONFIGURE YOUR PRINTER HERE
# ============================================================
PRINTER_NAME = "80mm Series Printer"   # <-- Change this if needed
PAPER_WIDTH = 384                      # 384 dots = 58mm paper
# PAPER_WIDTH = 576                    # 576 dots = 80mm paper
# ============================================================

# Gift names (ASCII only - no accents)
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
# EMBEDDED LOGO RASTER DATA (384x231, 1-bit, 48 bytes/line)
# ============================================================
# This is the Zero Lines logo pre-converted to ESC/POS raster format.
# It was generated from assets/zerolines-logo.png
LOGO_B64 = (
    "/////////////////////////////////AAD////////////////////////////////////////"
    "////////////////////8AAAf///////////////////////////////////////////////////"
    "////////AAAAH//////////////////////////////////////////////////////////8AAAA"
    "D//////////////////////////////////////////////////////////wAAAAA///////////"
    "///////////////////////////////////////////////AAAAAAf//////////////////////"
    "//////////////////////////////////8AAAAAAP//////////////////////////////////"
    "//////////////////////wAAAAAAH//////////////////////////////////////////////"
    "//////////AAAAAAAD///////////////////////////////////////////////////////8AA"
    "AAAAAB///////////////////////////////////////////////////////wAAAAAAAB//////"
    "/////////////////////////////////////////////////AAAAAAAAA//////////////////"
    "////////////////////////////////////8AAAAAAAAA//////////////////////////////"
    "////////////////////////wAAAAAAAAAf/////////////////////////////////////////"
    "////////////AAAAAAAAAAf////////////////////////////////////////////////////+"
    "AAAAAAAAAAP////////////////////////////////////////////////////4AAAAAAAAAAP/"
    "///////////////////////////////////////////////////gAAAAAAAAAAP/////////////"
    "//////////////////////////////////////+AAAAAAAAAAAP/////////////////////////"
    "//////////////////////////4AAAAAAAAAAAH/////////////////////////////////////"
    "//////////////gAAAAAAAAAAAH/////////////////////////////////////////////////"
    "//AAAAAAAAAAAAH//////////////////////////////////////////////////8AAAAAAAAAA"
    "AAH//////////////////////////////////////////////////gAAAAAAAAAAAAH/////////"
    "/////////////////////////////////////////AAAAAAAAAAAAAH/////////////////////"
    "////////////////////////////4AAAAAAAAAAAAAH/////////////////////////////////"
    "////////////////wAAAAAAAAAAAAAH/////////////////////////////////////////////"
    "////AAAAAAAAAAAAAAH////////////////////////////////////////////////8AAAAAAAA"
    "AYAAAAH////////////////////////////////////////////////wAAAAAAAAA4AAAAH/////"
    "///////////////////////////////////////////AAAAAAAAAD4AAAAH/////////////////"
    "//////////////////////////////8AAAAAAAAAP4AAAAH/////////////////////////////"
    "//////////////////4AAAAAAAAA/4AAAAH/////////////////////////////////////////"
    "//////gAAAAAAAAD/4AAAAH//////////////////////////////////////////////+AAAAAA"
    "AAAP/4AAAAH//////////////////////////////////////////////4AAAAAAAAAf/4AAAAH/"
    "/////////////////////////////////////////////gAAAAAAAAB//wAAAAH/////////////"
    "////////////////////////////////+AAAAAAAAAH//wAAAAH/////////////////////////"
    "////////////////////4AAAAAAAAAf//4AAAAH/////////////////////////////////////"
    "////////gAAAAAAAAB///4AAAAH////////////////////////////////////////////+AAAA"
    "AAAAAH///wAAAAH////////////////////////////////////////////4AAAAAAAAAf///wAA"
    "AAH////////////////////////////////////////////gAAAAAAAAB////wAAAAH/////////"
    "///////////////////////////////////AAAAAAAAAH////4AAAAH/////////////////////"
    "//////////////////////8AAAAAAAAAf////wAAAAH/////////////////////////////////"
    "//////////8AAAAAAAAB///x/wAAAAH///////////////////////////////////////////+A"
    "AAAAAAAD///h/wAAAAH////////////////////////////////////////////AAAAAAAAP//8B"
    "/wAAAAH////////////////////////////////////////////wAAAAAAA///wB/wAAAAH/////"
    "///////////////////////////////////////8AAAAAAD///gB/wAAAAH/////////////////"
    "///////////////////////////+AAAAAAP//+AB/wAAAAH/////////////////////////////"
    "////////////////gAAAAA///4AB/wAAAAH/////////////////////////////////////////"
    "////4AAAAD///gAB/wAAAAH/////////////////////////////////////////////+AAAAP//"
    "+AAB/wAAAAH//////////////////////////////////////////////AAAAf//4AAB/wAAAAH/"
    "/////////////////////////////////////////////wAAD///wAAB/wAAAAH/////////////"
    "/////////////////////////////////8AAH///AAAB/wAAAAH/////////////////////////"
    "//////////////////////AAf//8AAAB/wAAAAP/////////////////////////////////////"
    "//////////gB///gAAAB/wAAAAP///////////////////////////////////////////////4H"
    "///AAAAB/wAAAAP///////////////////////////////////////////////+f//8AAAAB/wAA"
    "AAP///////////////////////////////////////////////////8AAAAB/wAAAAP/////////"
    "//////////////////////////////////////////8AAAAB/wAAAAP/////////////////////"
    "//////////////////////////////8AAAAB/wAAAAP/////////////////////////////////"
    "//////////////////8AAAAB/wAAAAP/////////////////////////////////////////////"
    "//////8AAAAB/wAAAAP///////////////////////////////////////////////////8AAAAD"
    "/wAAAAP///P///////////////////////////////////////////////8AAAAD/wAAAAP//8H/"
    "//////////////////////////////////////////////8AAAAD/wAAAAf//wB/////////////"
    "//////////////////////////////////8AAAAD/wAAAB///gAf////////////////////////"
    "//////////////////////8AAAAD/wAAAH//8AAH////////////////////////////////////"
    "//////////8AAAAD/wAAAf//4AAB//////////////////////////////////////////////8A"
    "AAAD/wAAB///gAAA//////////////////////////////////////////////8AAAAD/wAAH//+"
    "AAAAP/////////////////////////////////////////////8AAAAD/wAAf//4AAAAD///////"
    "//////////////////////////////////////8AAAAD/gAA///gAAAAB///////////////////"
    "//////////////////////////8AAAAD/wAD//+AAAAAAP//////////////////////////////"
    "//////////////8AAAAD/wAP//8AAAAAAH//////////////////////////////////////////"
    "//8AAAAD/wA///gAAAAAAB////////////////////////////////////////////8AAAAD/wD/"
    "//AAAAAAAAf///////////////////////////////////////////8AAAAD/wP//8AAAAAAAAP/"
    "//////////////////////////////////////////8AAAAD/w///wAAAAAAAAD/////////////"
    "//////////////////////////////8AAAAD/z///AAAAAAAAAH/////////////////////////"
    "//////////////////8AAAAD////8AAAAAAAAAP/////////////////////////////////////"
    "//////8AAAAD////wAAAAAAAAA////////////////////////////////////////////8AAAAD"
    "////AAAAAAAAAD////////////////////////////////////////////8AAAAD///8AAAAAAAA"
    "AP////////////////////////////////////////////8AAAAD///wAAAAAAAAA///////////"
    "//////////////////////////////////8AAAAD///AAAAAAAAAD///////////////////////"
    "//////////////////////8AAAAD//+AAAAAAAAAP///////////////////////////////////"
    "//////////8AAAAD//4AAAAAAAAA//////////////////////////////////////////////8A"
    "AAAD//gAAAAAAAAB//////////////////////////////////////////////8AAAAD/+AAAAAA"
    "AAAH//////////////////////////////////////////////8AAAAD/4AAAAAAAAAf////////"
    "//////////////////////////////////////8AAAAD/gAAAAAAAAB/////////////////////"
    "//////////////////////////4AAAAD+AAAAAAAAAH/////////////////////////////////"
    "//////////////8AAAAD4AAAAAAAAAf/////////////////////////////////////////////"
    "//8AAAADwAAAAAAAAB////////////////////////////////////////////////8AAAADAAAA"
    "AAAAAH////////////////////////////////////////////////8AAAAAAAAAAAAAAf//////"
    "//////////////////////////////////////////8AAAAAAAAAAAAAA///////////////////"
    "//////////////////////////////8AAAAAAAAAAAAAD///////////////////////////////"
    "//////////////////8AAAAAAAAAAAAAP///////////////////////////////////////////"
    "//////8AAAAAAAAAAAAA//////////////////////////////////////////////////8AAAAA"
    "AAAAAAAD//////////////////////////////////////////////////8AAAAAAAAAAAAP////"
    "//////////////////////////////////////////////8AAAAAAAAAAAA/////////////////"
    "//////////////////////////////////8AAAAAAAAAAAD/////////////////////////////"
    "//////////////////////8AAAAAAAAAAAP/////////////////////////////////////////"
    "//////////+AAAAAAAAAAA////////////////////////////////////////////////////+A"
    "AAAAAAAAAD////////////////////////////////////////////////////+AAAAAAAAAAH//"
    "///////////////////////////////////////////////////AAAAAAAAAAf//////////////"
    "///////////////////////////////////////AAAAAAAAAB///////////////////////////"
    "///////////////////////////AAAAAAAAAH///////////////////////////////////////"
    "///////////////gAAAAAAAAf///////////////////////////////////////////////////"
    "///gAAAAAAAB///////////////////////////////////////////////////////wAAAAAAAD"
    "///////////////////////////////////////////////////////4AAAAAAAP////////////"
    "///////////////////////////////////////////4AAAAAAA/////////////////////////"
    "///////////////////////////////8AAAAAAD/////////////////////////////////////"
    "////////////////////AAAAAAP/////////////////////////////////////////////////"
    "////////gAAAAA//////////////////////////////////////////////////////////4AAA"
    "AD//////////////////////////////////////////////////////////8AAAAf//////////"
    "/////////////////////////////////////////////////AAAD///////////////////////"
    "/////////////////////////////////////4AAf///////////////////////////////////"
    "//////////////////////////fX////////////////////////////////////////////////"
    "////////////////////////////////////////////////////////////////////////////"
    "////////////////////////////////////////////////////////////////////////////"
    "////////////////////////////////////////////////////////////////////////////"
    "////////////////////////////////////////////////////////////////////////////"
    "////////////////////////////////////////////////////////////////////////////"
    "////////////////////////////////////////////////////////////////////////////"
    "////////////////////////////////////////////////////////////////////////////"
    "////////////////////////////////////////////////////////////////////////////"
    "////////////////////////////////////////////////////////////////////////////"
    "////////////////////////////////////////////////////////////////////////////"
    "////////////////////////////////////////////////////////////////////////////"
    "////////////////////////////////////////////////////////////////////////////"
    "////////////////////////////////////////////////////////////////////////////"
    "////////////////////////////////////////////////////////////////////////////"
    "////////////////////////////////////////////////////////////////////////////"
    "////////////////////////////////////////////////////////////////////////////"
    "////////////////////////////////////////////////////////////////////////////"
    "////////////////////////////////////////////////////////////////////////////"
    "////////////////////////////////////////////////////////////////////////////"
    "////////////////////////////////////////////////////////////////////////////"
    "////////////////////////////////////////////////////////////////////////////"
    "////////////////////////////////////////////////////////////////////////////"
    "////////////////////////////////////////////////////////////////////////////"
    "////////////////////////////////////////////////////////////////////////////"
    "////////////////////////////////////////////////////////////////////////////"
    "////////////////////////////////////////////////////////////////////////////"
    "///////////////////////////////P////////////////////////////////////////////"
    "//////////////////gAf///////////////////////////////////////////////////////"
    "/////+AYf////////////////////////////////////////////////////////////4PYf///"
    "//////////////////////////////////////////////////////wf/4nAf///////////////"
    "//////////////////////////////////////////wP/xnCf///////////////////////////"
    "//////////////////////////////wP/xmAf///////////////////////////////////////"
    "//////////////////wP/hkAf///////////////////////////////////////////////////"
    "//////wP/hgef/////////////////////////////////////////////////////////wP/Bw+"
    "f/////////////////////////////////////////////////////////wP/Bg+f///////////"
    "//////////////////////////////////////////////wP/JAAf///////////////////////"
    "//////////////////////////////////wP/IHg////////////////////////////////////"
    "//////////////////////wP/MP4////////////////////////////////////////////////"
    "//////////wP/IPx//////////////////////////////////////////////////////////wP"
    "/AAB//////////////////////////////////////////////////////////wP/B4D////////"
    "//////////////////////////////////////////////////wP/BIH////////////////////"
    "//////////////////////////////////////wP/gAf////////////////////////////////"
    "//////////////////////////wP/z9/////////////////////////////////////////////"
    "//////////////wP////////////////////////////////////////////////////////////"
    "//wP//////////////////////////////////////////////////////////////wP////////"
    "//////////////////////////////wA///////4H///4AP///////wP//////4AP//////wA///"
    "///8AD//gAAAAAf//8AAD///8H+AAf/+AAA///////wP/A/8D/AAB/////8AAB/////AAAP/wAAA"
    "AAf//wAAA///8H4AAD/4AAAP//////wP/A/8D4AAAf////wAAA////8AAAD/wAAAAAf//AAAAP//"
    "8HgAAB/gAAAD//////wP/A/8DwAAAH////AAAAH///wAAAAfwAAAAAf/8AAAAD//8HAAAD/AAAAB"
    "//////wP/A/8DgAAAB///8AAAAD///gAAAAPwAAAAA//4ABsAB//8GAAAH8AAYgAf/////wP/A/8"
    "DAAbAA///4AH8AB///ABBQAH////+B//wA//wA//8EAf+H4AP/8AP/////wP/A/8AAP/4Af//wA/"
    "/4A//+AH//gD////8B//gD//8Af/8AB///wA///AH/////wP/A/8AA///AP//gD//+Af/8A///4D"
    "////8D//AP///AP/8AH///gD///gH/////wP/A/8AD///gP//AP///gP/8B///8H////4H/+Af//"
    "/gP/8AP///AP///4D/////wP/A/8AH///wH/+Af///wH/4D////P////wP/8B////4H/8Af///Af"
    "///8B/////wP/A/8AP///4H/+A////4D/4H/////////gf/8D////4H/8A///+A////+A/////wP"
    "/A/8Af///4D/8B////8D/4P/////////gf/4H////8D/8B///+B/////A/////wP/A/8A////8D/"
    "4D////+B/4P/////////A//4H////+D/8B///8B/////Af////wP/A/8A////+B/4H////+B/4P/"
    "///////+B//wP/////B/8D///8D/////gf////wP/A/8B////+B/wP/////B/4P////////+D//w"
    "P/////B/8D///8H/////gf////wP/A/8B/////B/wP/////A/4H////////8D//wf/////B/8H//"
    "/4H/////wP////wP/A/8B////+A/wP/////g/4H////////4H//g//////A/8H///4H/////wP//"
    "//wP/A/8D/////B/gf/////gf8D////////wP//g//////g/8H///4P/////4P////wP/A/8D///"
    "//B/gf/////g/8B////////wP//g//////g/8H///4P/////4H////wP/A/8D/////B/gf/////g"
    "/+Af///////gf//A//////g/8H///wP/////4H////wP/A/8D/////B/g//////g//AB///////A"
    "///A//////g/8H///wP/////4H////wP/A/8D/////B/A//////g//gAB/////+B///AAAAAAAA/"
    "8H///wP/////4H////wP/A/8D/////B/AAAAAAAA//wAAH////+B///AAAAAAAA/8H///wf/////"
    "4H////wP/A/8D/////B/AAAAAAAA//8AAAP///8D///AAAAAAAA/8H///wf/////4H////wP/A/8"
    "D/////B/AAAAAAAA///AAAD///4H///AAAAAAAA/8H///wf/////4H////wP/A/8D/////B/AAAA"
    "AAAA///4AAAf//wH///AAAAAAAA/8H///wP/////4H////wP/A/8D/////B/AAAAAAAAf///wAAP"
    "//wP///A////////8H///wP/////4H////wP/A/8D/////B/Af/////+/////+AH//gf///A////"
    "////8H///wP/////4H////wP/A/8D/////B/A/////////////gD//A////g////////8H///wP/"
    "////4H////wP/A/8D/////B/g/////////////4B/+B////g////////8H///wP/////4P////wP"
    "/A/8D/////B/gf////////////8B/+B////g////////8H///4P/////wP////wP/A/8D/////B/"
    "gf////////////+A/8D////wf///////8H///4H/////wP////wP/A/8D/////B/wf//////////"
    "///A/4H////wf///////8H///4H/////gf////wP/A/8D/////B/wP/////////////A/4H////w"
    "P///////8H///8D/////gf////wP/A/8D/////B/wP/////////////A/wP////wP///////8H//"
    "/8D/////Af////wP/A/8D/////B/4H/////////////A/gf////4H///////8H///+B/////A///"
    "//wP/A/8D/////B/4D///////9/////A/A/////4D////+//8H///+A////+A/////wP/A/8D///"
    "//B/8B////+f/4f////A/B/////8B////8P/8H////Af///8B/////wP/A/8D/////B/8A////8P"
    "/wP////A+B/////+A////wH/8H////AP///4D/////wP/A/8D/////B/+Af///4D/gH///+B8D//"
    "////Af///gP/8H////gH///wD/////wP/A/8D/////B//AP///gH/wD///8B8D//////AH//+Af/"
    "8H////wB///AH/////wP/A/8D/////B//gH//+AP/4A///4D4P//////gB//4A//8H////4Af/8A"
    "P/////wP/A/8D/////B//wA//4Af/8Af//gDwAAAAAf/wAH8AB//8H////8AB/AAf/////wP/A/8"
    "D/////B//4AD8AA//+AA/8AHgAAAAAf/8AAAAD//8H////+AAAAB//////wP/A/8D/////B//8AA"
    "AAD///AAAAAPgAAAAAf/+AAAAP//8H/////gAAAD//////wP/A/8D/////B///AAAAH///gAAAA/"
    "AAAAAAf//gAAA///8H/////4AAAP//////wP/A/8D/////B///wAAAf///8AAAB/AAAAAAf//8AA"
    "D///8H/////+AAA///////wP/A/8D/////B///8AAD/////AAAH///////////gA////////////"
    "4AP////////////////////////wAf/////8AB//"
)


# ============================================================
# ESC/POS COMMAND BUILDER
# ============================================================
class ESCPOS:
    """Builds ESC/POS command sequences."""

    # Commands
    ESC = b'\x1b'
    GS = b'\x1d'
    LF = b'\x0a'
    INIT = ESC + b'@'                    # Initialize printer
    CUT = GS + b'V\x42\x00'              # Full cut
    CUT_PARTIAL = GS + b'V\x41\x00'      # Partial cut
    FEED = ESC + b'd'                    # Feed n lines
    ALIGN_LEFT = ESC + b'a\x00'
    ALIGN_CENTER = ESC + b'a\x01'
    ALIGN_RIGHT = ESC + b'a\x02'
    BOLD_ON = ESC + b'E\x01'
    BOLD_OFF = ESC + b'E\x00'
    DOUBLE_ON = ESC + b'!\x30'
    DOUBLE_OFF = ESC + b'!\x00'
    UNDERLINE_ON = ESC + b'-\x01'
    UNDERLINE_OFF = ESC + b'-\x00'

    def __init__(self):
        self.buf = bytearray()

    def add(self, data):
        if isinstance(data, str):
            self.buf.extend(data.encode('ascii', 'replace'))
        else:
            self.buf.extend(data)

    def text(self, s):
        """Add text (ASCII only)."""
        self.add(s.replace('\n', '\r\n'))

    def line(self, s=''):
        self.text(s + '\n')

    def bold(self, s):
        self.add(self.BOLD_ON)
        self.text(s)
        self.add(self.BOLD_OFF)

    def center(self):
        self.add(self.ALIGN_CENTER)

    def left(self):
        self.add(self.ALIGN_LEFT)

    def right(self):
        self.add(self.ALIGN_RIGHT)

    def feed(self, n=1):
        self.add(self.ESC + b'd' + bytes([n]))

    def cut(self):
        self.add(self.CUT)

    def qr_code(self, data):
        """Print QR code using ESC/POS commands."""
        d = data.encode('utf-8')
        pL = len(d) & 0xFF
        pH = (len(d) >> 8) & 0xFF

        self.add(self.GS + b'(k')
        self.add(bytes([4, 0, 49, 65, 50, 0]))     # Model 2

        self.add(self.GS + b'(k')
        self.add(bytes([3, 0, 49, 67, 6]))         # Size 6

        self.add(self.GS + b'(k')
        self.add(bytes([3, 0, 49, 69, 48]))        # Error correction L

        self.add(self.GS + b'(k')
        self.add(bytes([pL, pH, 49, 80, 48]))
        self.add(d)

        self.add(self.GS + b'(k')
        self.add(bytes([3, 0, 49, 81, 48]))        # Print QR

    def raster_image(self, width, height, bytes_per_line, raster_data):
        """Print raster bit image using GS v 0 command."""
        xl = width & 0xFF
        xh = (width >> 8) & 0xFF
        yl = height & 0xFF
        yh = (height >> 8) & 0xFF

        self.add(self.GS + b'v0\x00')
        self.add(bytes([xl, xh, yl, yh]))
        self.add(raster_data)

    def get_bytes(self):
        return bytes(self.buf)


# ============================================================
# WINDOWS PRINTER (ctypes + winspool)
# ============================================================
def print_raw(data, printer_name=PRINTER_NAME):
    """Send raw bytes to a Windows printer using winspool API."""
    import ctypes
    from ctypes import wintypes

    # Structures
    class DOC_INFO_1(ctypes.Structure):
        _fields_ = [
            ("pDocName", wintypes.LPWSTR),
            ("pOutputFile", wintypes.LPWSTR),
            ("pDatatype", wintypes.LPWSTR),
        ]

    # Open printer
    hPrinter = wintypes.HANDLE()
    if not ctypes.windll.winspool.OpenPrinterW(printer_name, ctypes.byref(hPrinter), None):
        err = ctypes.GetLastError()
        raise RuntimeError(f"Cannot open printer '{printer_name}'. Error: {err}. "
                           f"Check the PRINTER_NAME in this script.")

    try:
        # Start document in RAW mode
        docInfo = DOC_INFO_1()
        docInfo.pDocName = "Zero Lines Receipt"
        docInfo.pOutputFile = None
        docInfo.pDatatype = "RAW"

        jobId = ctypes.windll.winspool.StartDocPrinterW(hPrinter, 1, ctypes.byref(docInfo))
        if jobId == 0:
            raise RuntimeError("Cannot start print job")

        try:
            # Start page
            if not ctypes.windll.winspool.StartPagePrinter(hPrinter):
                raise RuntimeError("Cannot start print page")

            try:
                # Write data
                written = wintypes.DWORD()
                c_data = ctypes.c_char_p(data)
                if not ctypes.windll.winspool.WritePrinter(
                    hPrinter, c_data, len(data), ctypes.byref(written)
                ):
                    raise RuntimeError("WritePrinter failed")

            finally:
                ctypes.windll.winspool.EndPagePrinter(hPrinter)

        finally:
            ctypes.windll.winspool.EndDocPrinter(hPrinter)

    finally:
        ctypes.windll.winspool.ClosePrinter(hPrinter)

    print(f"[OK] Sent {len(data)} bytes to {printer_name}")
    return True


# ============================================================
# RECEIPT BUILDER
# ============================================================
def build_receipt(offer):
    """Build ESC/POS receipt from offer data."""
    e = ESCPOS()

    # Initialize
    e.add(e.INIT)
    e.center()

    units = offer.get('units', 1)
    regular = 300 * units
    custom = offer.get('price', 300) * units
    savings = regular - custom

    # Logo (if available)
    try:
        logo_data = base64.b64decode(LOGO_B64)
        e.raster_image(384, 231, 48, logo_data)
        e.feed(1)
    except:
        pass  # Skip logo if data is missing

    # Header
    e.bold("ZERO LINES")
    e.line("ANDORRA")
    e.line("-" * 32)
    e.bold("OFERTA EXCLUSIVA")
    e.feed(1)
    e.bold("Oferta Especial")
    e.line(f"Para: {offer.get('customer', 'Usted')}")
    e.feed(1)
    e.line(f"Preparada por: {offer.get('seller', 'Vendedor')}")
    e.line("-" * 32)
    e.feed(1)

    # Product
    e.bold("Reverse Five Wrinkle Eraser")
    e.line(f"{units} unidad{'es' if units > 1 else ''}")
    e.line("100 tratamientos - 2 anos")
    e.line("-" * 32)
    e.feed(1)

    # Pricing
    e.left()
    e.line(f"Precio regular:     EUR {regular}")
    e.bold(f"TU PRECIO:          EUR {custom}")
    e.bold(f"AHORRAS:            EUR {savings}")
    e.center()
    e.line("-" * 32)
    e.feed(1)

    # Gifts
    gifts = offer.get('gifts', [])
    if gifts:
        e.bold(f"REGALOS INCLUIDOS ({len(gifts)})")
        e.feed(1)
        for g in gifts:
            e.line(f"+ {GIFT_NAMES.get(g, g)}")
        e.feed(1)
        e.line("-" * 32)
        e.feed(1)

    # Note
    note = offer.get('note', '')
    if note:
        e.line(f'"{note}"')
        e.feed(1)
        e.line("-" * 32)
        e.feed(1)

    # QR Code
    url = f"https://bullishrobr-dev.github.io/ReverseFive/offer.html?d="
    url += base64.b64encode(json.dumps(offer).encode()).decode()

    e.bold("ESCANEA PARA RECLAMAR")
    e.feed(1)
    e.qr_code(url)
    e.feed(1)
    e.line("-" * 32)
    e.feed(1)

    # Expiry
    expiry = offer.get('expires', '')
    if expiry:
        try:
            dt = datetime.fromisoformat(expiry.replace('Z', '+00:00'))
            e.line("Oferta expira:")
            e.bold(dt.strftime("%d/%m/%Y %H:%M"))
        except:
            e.line(f"Expira: {expiry}")
    e.feed(1)
    e.line("-" * 32)
    e.feed(1)

    # Footer
    e.line("Gracias por su confianza")
    e.line("Zero Lines - Andorra")
    e.line("+350 5400 5198")
    e.line("info@zerolines.life")
    e.feed(3)
    e.cut()

    return e.get_bytes()


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

                try:
                    offer = json.loads(post_data)
                    receipt_bytes = build_receipt(offer)
                    success = print_raw(receipt_bytes)

                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({
                        'success': success,
                        'message': 'Receipt printed!'
                    }).encode())
                except Exception as e:
                    self.send_response(500)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({
                        'success': False,
                        'error': str(e)
                    }).encode())
            else:
                self.send_response(404)
                self.end_headers()

        def log_message(self, format, *args):
            print("[Print Server]", format % args)

    server = HTTPServer(('127.0.0.1', port), PrintHandler)
    print("=" * 50)
    print("Zero Lines Thermal Print Server")
    print("ESC/POS Direct Mode")
    print("=" * 50)
    print(f"Running at: http://127.0.0.1:{port}")
    print(f"Printer: {PRINTER_NAME}")
    print(f"Paper width: {PAPER_WIDTH} dots")
    print("")
    print("Usage: Click 'Print Receipt' in the admin panel")
    print("Press Ctrl+C to stop")
    print("=" * 50)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...")
        server.shutdown()


if __name__ == '__main__':
    start_server()
