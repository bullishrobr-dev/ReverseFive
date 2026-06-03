#!/usr/bin/env python3
"""
Zero Lines Thermal Print Server
Run this on the Windows sales computer.

Usage:
    python printer-server.py

Then configure the printer name below.
"""

import os
import sys
import json
import base64
import urllib.parse
from datetime import datetime

# ============================================================
# CONFIGURE YOUR PRINTER HERE
# ============================================================
# Option 1: Windows printer name (most common)
PRINTER_NAME = "80mm Series Printer"  # Change this to match your printer

# Option 2: USB port (for direct ESC/POS)
# USB_VENDOR_ID = 0x1504   # BIXOLON vendor ID
# USB_PRODUCT_ID = 0x0006  # SRP-350 product ID
# ============================================================

def encode_receipt_text(offer):
    """Build a plain-text receipt using only ASCII characters."""
    lines = []
    lines.append("")
    lines.append("       ZERO LINES")
    lines.append("       ANDORRA")
    lines.append("----------------------------")
    lines.append("      OFERTA EXCLUSIVA")
    lines.append("")
    lines.append("      Oferta Especial")
    lines.append("      Para: " + (offer.get('customer') or 'Usted'))
    lines.append("")
    lines.append("  Preparada por: " + (offer.get('seller') or 'Vendedor'))
    lines.append("----------------------------")
    lines.append("")
    lines.append("   Reverse Five Wrinkle")
    lines.append("        Eraser")
    lines.append("")
    units = offer.get('units', 1)
    lines.append("  " + str(units) + " unidad" + ("es" if units > 1 else ""))
    lines.append("  100 tratamientos - 2 anos")
    lines.append("----------------------------")
    lines.append("")

    regular = 300 * units
    custom = offer.get('price', 300) * units
    savings = regular - custom

    lines.append("Precio regular:     EUR " + str(regular))
    lines.append("TU PRECIO:          EUR " + str(custom))
    lines.append("AHORRAS:            EUR " + str(savings))
    lines.append("----------------------------")
    lines.append("")

    gifts = offer.get('gifts', [])
    gift_names = {
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

    if gifts:
        lines.append("REGALOS INCLUIDOS (" + str(len(gifts)) + ")")
        lines.append("")
        for g in gifts:
            lines.append("+ " + gift_names.get(g, g))
        lines.append("")
        lines.append("----------------------------")
        lines.append("")

    note = offer.get('note', '')
    if note:
        lines.append('"' + note + '"')
        lines.append("")
        lines.append("----------------------------")
        lines.append("")

    # URL instead of QR code (thermal printers handle text better)
    lines.append("RECLAMA TU OFERTA:")
    lines.append("")
    url = "https://bullishrobr-dev.github.io/ReverseFive/offer.html?d=" + base64.b64encode(json.dumps(offer).encode()).decode()
    # Wrap URL to 32 chars
    for i in range(0, len(url), 28):
        lines.append(url[i:i+28])
    lines.append("")
    lines.append("----------------------------")
    lines.append("")

    expiry = offer.get('expires', '')
    if expiry:
        try:
            dt = datetime.fromisoformat(expiry.replace('Z', '+00:00'))
            lines.append("Oferta expira:")
            lines.append(dt.strftime("%d/%m/%Y %H:%M"))
        except:
            lines.append("Expira: " + str(expiry))
    lines.append("")
    lines.append("----------------------------")
    lines.append("")
    lines.append("Gracias por su confianza")
    lines.append("Zero Lines - Andorra")
    lines.append("+350 5400 5198")
    lines.append("")
    lines.append("============================")
    lines.append("")
    lines.append("")
    lines.append("")

    return "\n".join(lines)


def print_via_windows(receipt_text):
    """Print using the Windows print system."""
    import tempfile

    # Create a temporary text file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, encoding='ascii') as f:
        f.write(receipt_text)
        temp_path = f.name

    try:
        # Use the 'print' command on Windows
        os.system(f'notepad /p "{temp_path}"')
        return True
    except Exception as e:
        print("Print error:", e)
        return False
    finally:
        # Clean up temp file after a delay
        import threading
        def cleanup():
            import time
            time.sleep(5)
            try:
                os.remove(temp_path)
            except:
                pass
        threading.Thread(target=cleanup, daemon=True).start()


def start_server(port=8765):
    """Start a tiny HTTP server that accepts print jobs."""
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
                    receipt = encode_receipt_text(offer)
                    success = print_via_windows(receipt)

                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({
                        'success': success,
                        'message': 'Printed' if success else 'Print failed'
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
    print("=" * 50)
    print(f"Running at: http://127.0.0.1:{port}")
    print(f"Printer: {PRINTER_NAME}")
    print("")
    print("To use: Click 'Print Receipt' in the admin panel")
    print("Press Ctrl+C to stop")
    print("=" * 50)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...")
        server.shutdown()


if __name__ == '__main__':
    start_server()
