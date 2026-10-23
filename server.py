import http.server
import socketserver
import socket
import webbrowser
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 1))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

def main():
    local_ip = get_local_ip()
    print("=" * 65)
    print(" 🎂 ASHWU'S BIRTHDAY SURPRISE SERVER RUNNING! 🌷")
    print("=" * 65)
    print(f"\n[+] Local Browser Access:   http://localhost:{PORT}")
    print(f"[+] Phone / QR Code Access:  http://{local_ip}:{PORT}")
    print(f"[+] Printable QR Card:       http://localhost:{PORT}/qr.html")
    print("\nScan the QR code from Ashwu's phone (make sure both devices are on Wi-Fi).")
    print("Press Ctrl+C to stop the server at any time.\n" + "=" * 65)

    webbrowser.open(f"http://localhost:{PORT}")

    server_address = ("", PORT)
    with http.server.ThreadingHTTPServer(server_address, Handler) as httpd:
        httpd.daemon_threads = True
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped. Happy Birthday Ashwu!")

if __name__ == "__main__":
    main()
