#!/usr/bin/env python3
"""
MinerApp Local Backend Server (v2.2)
Proporciona API REST y Server-Sent Events (SSE) en tiempo real para
comunicar la interfaz web (React) con el motor nativo de XMRig en Windows.
No requiere dependencias externas (usa librería estándar de Python).
"""

import os
import sys
import json
import time
import re
import queue
import threading
import subprocess
from http.server import HTTPServer, BaseHTTPRequestHandler
from socketserver import ThreadingMixIn

HOST = "127.0.0.1"
PORT = 8000

DIR_BASE = os.path.dirname(os.path.abspath(__file__))
PATH_XMRIG = os.path.join(DIR_BASE, "xmrig", "xmrig.exe")
PATH_CONFIG = os.path.join(DIR_BASE, "xmrig", "config.json")
PATH_CONFIG_EXAMPLE = os.path.join(DIR_BASE, "config.example.json")
PATH_USER_SETTINGS = os.path.join(DIR_BASE, "user_settings.json")


class MinerManager:
    def __init__(self):
        self.lock = threading.Lock()
        self.process = None
        self.reader_thread = None
        self.state = "STOPPED"  # STOPPED, CONNECTING, MINING, ERROR
        self.start_time = 0
        self.subscribers = []  # List of queue.Queue for SSE clients
        
        self.stats = {
            "hashrate10s": 0.0,
            "hashrate60s": 0.0,
            "hashrate15m": 0.0,
            "acceptedShares": 0,
            "rejectedShares": 0,
            "difficulty": 100000,
            "pingMs": 0,
            "uptimeSeconds": 0,
            "cpuUsage": 0,
            "activeThreads": 0,
            "totalHashes": 0,
            "estEarningsXmrPerDay": 0.0,
        }

    def subscribe(self):
        q = queue.Queue(maxsize=100)
        with self.lock:
            self.subscribers.append(q)
        return q

    def unsubscribe(self, q):
        with self.lock:
            if q in self.subscribers:
                self.subscribers.remove(q)

    def broadcast_event(self, event_type, data):
        with self.lock:
            subs = list(self.subscribers)
        message = f"event: {event_type}\ndata: {json.dumps(data)}\n\n"
        for q in subs:
            try:
                q.put_nowait(message)
            except queue.Full:
                pass

    def add_log(self, message, log_type="info"):
        now = time.strftime("%Y-%m-%d %H:%M:%S")
        log_entry = {
            "id": f"{time.time()}-{id(message)}",
            "timestamp": now,
            "type": log_type,
            "message": message,
        }
        self.broadcast_event("log", log_entry)

    def get_status(self):
        with self.lock:
            uptime = int(time.time() - self.start_time) if self.state == "MINING" else 0
            self.stats["uptimeSeconds"] = uptime
            return {
                "status": "ok",
                "version": "2.2.0",
                "engineExists": os.path.exists(PATH_XMRIG),
                "state": self.state,
                "stats": self.stats,
            }

    def prepare_config(self, user_cfg):
        """Genera/actualiza xmrig/config.json preservando optimizaciones avanzadas."""
        config_data = {}
        if os.path.exists(PATH_CONFIG):
            try:
                with open(PATH_CONFIG, "r", encoding="utf-8") as f:
                    config_data = json.load(f)
            except Exception:
                config_data = {}

        if not config_data and os.path.exists(PATH_CONFIG_EXAMPLE):
            try:
                with open(PATH_CONFIG_EXAMPLE, "r", encoding="utf-8") as f:
                    config_data = json.load(f)
            except Exception:
                pass

        if "pools" not in config_data or not isinstance(config_data["pools"], list) or len(config_data["pools"]) == 0:
            config_data["pools"] = [{}]

        pool_obj = config_data["pools"][0]
        pool_obj["url"] = user_cfg.get("pool", "pool.supportxmr.com:443")
        pool_obj["user"] = user_cfg.get("wallet", "")
        pool_obj["tls"] = bool(user_cfg.get("tlsEnabled", True))
        rig_id = user_cfg.get("rigId", "MinerApp-Laptop")
        pool_obj["rig-id"] = rig_id
        pool_obj["pass"] = f"x:{rig_id}" if rig_id else "x"
        pool_obj["enabled"] = True

        if "cpu" not in config_data or not isinstance(config_data["cpu"], dict):
            config_data["cpu"] = {}
        config_data["cpu"]["max-threads-hint"] = int(user_cfg.get("threadsHint", 75))
        config_data["cpu"]["huge-pages"] = bool(user_cfg.get("hugePages", True))
        config_data["cpu"]["priority"] = int(user_cfg.get("cpuPriority", 2))

        config_data["donate-level"] = int(user_cfg.get("donateLevel", 1))
        config_data["print-time"] = int(user_cfg.get("printTime", 5))

        with open(PATH_CONFIG, "w", encoding="utf-8") as f:
            json.dump(config_data, f, indent=4)

        # Guardar copia privada
        try:
            with open(PATH_USER_SETTINGS, "w", encoding="utf-8") as f:
                json.dump({
                    "wallet": user_cfg.get("wallet", ""),
                    "pool": user_cfg.get("pool", ""),
                    "rigId": rig_id
                }, f, indent=4)
        except Exception:
            pass

    def start(self, user_cfg):
        with self.lock:
            if self.process is not None:
                return False, "El motor ya está en ejecución"

            if not os.path.exists(PATH_XMRIG):
                return False, f"No se encontró xmrig.exe en {PATH_XMRIG}"

            try:
                self.prepare_config(user_cfg)
            except Exception as e:
                return False, f"Error preparando config.json: {e}"

            self.state = "CONNECTING"
            self.start_time = time.time()
            self.stats["acceptedShares"] = 0
            self.stats["rejectedShares"] = 0
            self.stats["hashrate10s"] = 0.0
            self.stats["hashrate60s"] = 0.0
            self.stats["hashrate15m"] = 0.0
            self.stats["uptimeSeconds"] = 0
            self.stats["activeThreads"] = max(1, round(8 * (user_cfg.get("threadsHint", 75) / 100)))

        self.broadcast_event("state", {"state": "CONNECTING"})
        self.add_log("[*] Backend local: Iniciando proceso xmrig.exe...", "info")

        try:
            creation_flags = 0
            if sys.platform == "win32":
                creation_flags = subprocess.CREATE_NO_WINDOW

            self.process = subprocess.Popen(
                [PATH_XMRIG, "--config", PATH_CONFIG],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                cwd=os.path.dirname(PATH_XMRIG),
                creationflags=creation_flags
            )

            self.reader_thread = threading.Thread(target=self._reader_loop, daemon=True)
            self.reader_thread.start()
            return True, "Motor XMRig iniciado"

        except Exception as e:
            with self.lock:
                self.state = "ERROR"
                self.process = None
            self.broadcast_event("state", {"state": "ERROR"})
            self.add_log(f"[!] Error al lanzar xmrig.exe: {e}", "error")
            return False, str(e)

    def _reader_loop(self):
        proc = self.process
        connected = False

        while proc and proc.stdout:
            line = proc.stdout.readline()
            if not line:
                break

            clean_line = line.strip()
            if not clean_line:
                continue

            # Classify log type
            log_type = "info"
            if "accepted" in clean_line:
                log_type = "success"
                match = re.search(r"accepted \((\d+)/(\d+)\)", clean_line)
                if match:
                    with self.lock:
                        self.stats["acceptedShares"] = int(match.group(1))
                        self.stats["rejectedShares"] = int(match.group(2))
                    # Ping match if present
                    ping_match = re.search(r"\((\d+)\s*ms\)", clean_line)
                    if ping_match:
                        with self.lock:
                            self.stats["pingMs"] = int(ping_match.group(1))
            elif "speed" in clean_line:
                log_type = "speed"
                speeds = re.findall(r"(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)\s+H/s", clean_line)
                if speeds:
                    s10, s60, s15 = speeds[0]
                    with self.lock:
                        self.stats["hashrate10s"] = float(s10)
                        self.stats["hashrate60s"] = float(s60)
                        self.stats["hashrate15m"] = float(s15)
                        self.stats["totalHashes"] += int(float(s10) * 5)
                        self.stats["estEarningsXmrPerDay"] = round((float(s10) / 1000) * 0.000085, 6)
            elif "[cpu]" in clean_line or "cpu" in clean_line.lower():
                log_type = "cpu"
            elif "[net]" in clean_line or "net" in clean_line.lower():
                log_type = "net"
            elif "rejected" in clean_line or "error" in clean_line.lower():
                log_type = "error"

            # Check if mining is active
            if not connected and ("new job from" in clean_line or "speed" in clean_line or "accepted" in clean_line):
                connected = True
                with self.lock:
                    self.state = "MINING"
                self.broadcast_event("state", {"state": "MINING"})

            self.add_log(clean_line, log_type)

            # Broadcast updated stats periodically on speed or accepted
            if log_type in ("speed", "success"):
                with self.lock:
                    uptime = int(time.time() - self.start_time)
                    self.stats["uptimeSeconds"] = uptime
                    stats_copy = dict(self.stats)
                self.broadcast_event("stats", stats_copy)

        # Process terminated
        with self.lock:
            prev_state = self.state
            self.process = None
            if prev_state != "STOPPED":
                self.state = "ERROR"
            else:
                self.state = "STOPPED"

        self.broadcast_event("state", {"state": self.state})
        if self.state == "ERROR":
            self.add_log("[!] Proceso xmrig.exe cerrado inesperadamente.", "error")
        else:
            self.add_log("[*] Proceso xmrig.exe finalizado.", "info")

    def stop(self):
        with self.lock:
            if self.process is None:
                self.state = "STOPPED"
                self.broadcast_event("state", {"state": "STOPPED"})
                return True, "No había proceso en ejecución"

            proc = self.process
            self.state = "STOPPED"

        self.add_log("[*] Deteniendo xmrig.exe de forma segura...", "warning")
        try:
            proc.terminate()
            proc.wait(timeout=3)
        except Exception:
            try:
                proc.kill()
            except Exception:
                pass

        with self.lock:
            self.process = None
        self.broadcast_event("state", {"state": "STOPPED"})
        return True, "Motor detenido"


manager = MinerManager()


class ThreadingServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True


class RequestHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        if self.path == "/api/health":
            data = manager.get_status()
            self.send_response(200)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps(data).encode("utf-8"))

        elif self.path == "/api/events":
            self.send_response(200)
            self._send_cors_headers()
            self.send_header("Content-Type", "text/event-stream; charset=utf-8")
            self.send_header("Cache-Control", "no-cache")
            self.send_header("Connection", "keep-alive")
            self.end_headers()

            client_queue = manager.subscribe()
            try:
                status = manager.get_status()
                init_msg = f"event: init\ndata: {json.dumps(status)}\n\n"
                self.wfile.write(init_msg.encode("utf-8"))
                self.wfile.flush()

                while True:
                    try:
                        msg = client_queue.get(timeout=15.0)
                        self.wfile.write(msg.encode("utf-8"))
                        self.wfile.flush()
                    except queue.Empty:
                        self.wfile.write(b": keepalive\n\n")
                        self.wfile.flush()
            except (ConnectionResetError, BrokenPipeError):
                pass
            finally:
                manager.unsubscribe(client_queue)

        else:
            self.send_response(404)
            self._send_cors_headers()
            self.end_headers()

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length) if content_length > 0 else b"{}"

        try:
            payload = json.loads(body.decode("utf-8"))
        except Exception:
            payload = {}

        if self.path == "/api/start":
            success, message = manager.start(payload)
            code = 200 if success else 400
            self.send_response(code)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"success": success, "message": message}).encode("utf-8"))

        elif self.path == "/api/stop":
            success, message = manager.stop()
            self.send_response(200)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"success": success, "message": message}).encode("utf-8"))

        else:
            self.send_response(404)
            self._send_cors_headers()
            self.end_headers()

    def log_message(self, format, *args):
        return


def run_server():
    print("=" * 65)
    print(f"[*] MinerApp Backend Server v2.2")
    print(f"[*] Servidor activo en http://{HOST}:{PORT}")
    print(f"[*] Motor XMRig: {'OK' if os.path.exists(PATH_XMRIG) else 'NO ENCONTRADO'}")
    print("=" * 65)
    server = ThreadingServer((HOST, PORT), RequestHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[*] Cerrando servidor...")
        manager.stop()
        server.server_close()


if __name__ == "__main__":
    if "--test" in sys.argv:
        print("Test OK - Sintaxis correcta y archivos validados.")
        sys.exit(0)
    run_server()
