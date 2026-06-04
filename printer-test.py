#!/usr/bin/env python3
"""
Thermal Printer Diagnostic Test
Tests different ways to send ESC/POS commands to the BIXOLON SRP-350.
"""

import ctypes
from ctypes import wintypes
import sys

PRINTER_NAME = "80mm Series Printer"

# Simple ESC/POS test receipt (no images, no QR code — just text)
def make_test_receipt():
    """Create a minimal ESC/POS receipt to test basic commands."""
    ESC = b'\x1b'
    GS = b'\x1d'
    
    data = bytearray()
    data.extend(ESC + b'@')           # Initialize
    data.extend(ESC + b'a\x01')       # Center align
    data.extend(ESC + b'E\x01')       # Bold ON
    data.extend(b'ZERO LINES\n')
    data.extend(ESC + b'E\x00')       # Bold OFF
    data.extend(b'ANDORRA\n')
    data.extend(b'----------------\n')
    data.extend(ESC + b'a\x00')       # Left align
    data.extend(b'Product: Reverse Five\n')
    data.extend(b'Price: EUR 300\n')
    data.extend(b'----------------\n')
    data.extend(ESC + b'a\x01')       # Center
    data.extend(b'Thank you!\n')
    data.extend(ESC + b'd\x03')       # Feed 3 lines
    data.extend(GS + b'V\x42\x00')    # Full cut
    return bytes(data)


def test_winspool_raw(printer_name, data):
    """Test 1: Send via Windows spooler with RAW datatype."""
    print(f"\n[Test 1] Windows Spooler (RAW) -> '{printer_name}'")
    
    try:
        winspool = ctypes.windll.LoadLibrary('winspool.drv')
    except OSError:
        winspool = ctypes.WinDLL('winspool.drv')
    
    class DOC_INFO_1(ctypes.Structure):
        _fields_ = [
            ("pDocName", wintypes.LPWSTR),
            ("pOutputFile", wintypes.LPWSTR),
            ("pDatatype", wintypes.LPWSTR),
        ]
    
    hPrinter = wintypes.HANDLE()
    if not winspool.OpenPrinterW(printer_name, ctypes.byref(hPrinter), None):
        err = ctypes.GetLastError()
        print(f"  FAILED: Cannot open printer. Error: {err}")
        return False
    
    try:
        docInfo = DOC_INFO_1()
        docInfo.pDocName = "Test Receipt"
        docInfo.pOutputFile = None
        docInfo.pDatatype = "RAW"
        
        jobId = winspool.StartDocPrinterW(hPrinter, 1, ctypes.byref(docInfo))
        if jobId == 0:
            print(f"  FAILED: Cannot start print job")
            return False
        
        try:
            if not winspool.StartPagePrinter(hPrinter):
                print(f"  FAILED: Cannot start page")
                return False
            
            written = wintypes.DWORD()
            buf = ctypes.create_string_buffer(data)
            if not winspool.WritePrinter(hPrinter, buf, len(data), ctypes.byref(written)):
                err = ctypes.GetLastError()
                print(f"  FAILED: WritePrinter error {err}")
                return False
            
            winspool.EndPagePrinter(hPrinter)
            print(f"  OK: Sent {written.value} bytes")
            return True
            
        finally:
            winspool.EndDocPrinter(hPrinter)
    finally:
        winspool.ClosePrinter(hPrinter)


def test_direct_usb():
    """Test 2: Try to find and write directly to USB printer port."""
    print(f"\n[Test 2] Direct USB Write")
    
    # Common USB printer port names on Windows
    port_names = [
        r'\\.\USB001', r'\\.\USB002', r'\\.\USB003',
        r'\\.\LPT1', r'\\.\LPT2',
        r'\\.\COM1', r'\\.\COM2', r'\\.\COM3', r'\\.\COM4',
        r'\\.\COM5', r'\\.\COM6', r'\\.\COM7', r'\\.\COM8',
    ]
    
    import serial
    
    for port in port_names:
        try:
            if 'COM' in port:
                # Try as serial port
                ser = serial.Serial(port.replace(r'\\.\', ''), baudrate=9600, timeout=1)
                ser.write(data)
                ser.close()
                print(f"  OK: Wrote to {port}")
                return True
            else:
                # Try as file handle
                handle = ctypes.windll.kernel32.CreateFileW(
                    port, 0x40000000, 0, None, 3, 0, None
                )
                if handle != -1:
                    written = wintypes.DWORD()
                    buf = ctypes.create_string_buffer(data)
                    ctypes.windll.kernel32.WriteFile(handle, buf, len(data), ctypes.byref(written), None)
                    ctypes.windll.kernel32.CloseHandle(handle)
                    print(f"  OK: Wrote {written.value} bytes to {port}")
                    return True
        except Exception as e:
            continue
    
    print(f"  FAILED: Could not find direct USB/COM port")
    return False


def test_generic_text_only():
    """Test 3: Check if Generic/Text Only printer exists."""
    print(f"\n[Test 3] Check for Generic/Text Only printer")
    
    try:
        winspool = ctypes.windll.LoadLibrary('winspool.drv')
    except OSError:
        winspool = ctypes.WinDLL('winspool.drv')
    
    # Enum printers
    needed = wintypes.DWORD()
    returned = wintypes.DWORD()
    
    winspool.EnumPrintersW(2, None, 2, None, 0, ctypes.byref(needed), ctypes.byref(returned))
    
    if needed.value == 0:
        print("  No printers found")
        return []
    
    import struct
    buf = ctypes.create_string_buffer(needed.value)
    
    if not winspool.EnumPrintersW(2, None, 2, buf, needed.value, ctypes.byref(needed), ctypes.byref(returned)):
        print("  EnumPrinters failed")
        return []
    
    printers = []
    offset = 0
    for i in range(returned.value):
        # PRINTER_INFO_2 structure: pServerName, pPrinterName, pShareName, pPortName, pDriverName, ...
        # On 64-bit Windows, each pointer is 8 bytes
        ptr_size = ctypes.sizeof(ctypes.c_void_p)
        pPrinterName = ctypes.c_void_p.from_buffer(buf, offset + ptr_size).value
        if pPrinterName:
            name = ctypes.wstring_at(pPrinterName)
            printers.append(name)
        # PRINTER_INFO_2 is roughly 84 bytes on 64-bit
        offset += 84 * ptr_size // 8 + (84 * ptr_size // 8)  # approximate
    
    print(f"  Found printers: {printers}")
    return printers


def test_find_com_port():
    """Test 4: List available COM ports."""
    print(f"\n[Test 4] List COM ports")
    
    try:
        import serial.tools.list_ports
        ports = list(serial.tools.list_ports.comports())
        if ports:
            for p in ports:
                print(f"  {p.device}: {p.description} ({p.manufacturer})")
        else:
            print("  No COM ports found")
    except ImportError:
        print("  pyserial not installed. Run: pip install pyserial")


if __name__ == '__main__':
    print("=" * 50)
    print("Thermal Printer Diagnostic")
    print("=" * 50)
    
    data = make_test_receipt()
    print(f"Test receipt: {len(data)} bytes")
    
    # Test 1: Windows spooler
    test_winspool_raw(PRINTER_NAME, data)
    
    # Test 3: List all printers
    printers = test_generic_text_only()
    
    # Test 4: List COM ports
    test_find_com_port()
    
    print("\n" + "=" * 50)
    print("Diagnostic complete.")
    print("=" * 50)
    print("""
If Test 1 prints garbage, the Windows driver is processing the data.
Solutions:
1. Add a 'Generic / Text Only' printer in Windows pointing to the same USB port.
   Then change PRINTER_NAME in printer-server.py to match.
2. If Test 4 shows a COM port for the BIXOLON printer, we can write directly to it.
""")
