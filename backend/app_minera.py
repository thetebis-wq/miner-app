import customtkinter as ctk
import subprocess
import json
import threading
import re
import os
import sys

# Configuración de apariencia
ctk.set_appearance_mode("dark")  
ctk.set_default_color_theme("blue") 

def obtener_ruta_base():
    """
    Obtiene la ruta base del proyecto de manera dinámica.
    Funciona tanto al ejecutar el script .py como en ejecutable empaquetado (.exe).
    Si el ejecutable está en la carpeta 'dist', busca automáticamente un nivel arriba.
    """
    if getattr(sys, 'frozen', False):
        base = os.path.dirname(sys.executable)
    else:
        base = os.path.dirname(os.path.abspath(__file__))
    
    # Si xmrig no está en la carpeta del ejecutable, revisar un nivel superior (ej. corriendo desde 'dist')
    if not os.path.exists(os.path.join(base, "xmrig", "xmrig.exe")):
        padre = os.path.dirname(base)
        if os.path.exists(os.path.join(padre, "xmrig", "xmrig.exe")):
            return padre
            
    return base

class MinerApp:
    def __init__(self):
        self.proceso_minero = None
        self.hilo_lectura = None
        
        # Rutas dinámicas
        self.ruta_base = obtener_ruta_base()
        self.ruta_motor = os.path.join(self.ruta_base, "xmrig", "xmrig.exe")
        self.ruta_config = os.path.join(self.ruta_base, "config.json")
        self.ruta_config_example = os.path.join(self.ruta_base, "config.example.json")
        self.ruta_user_settings = os.path.join(self.ruta_base, "user_settings.json")
        
        # Cargar valores iniciales desde user_settings.json si existe
        billetera_inicial, pool_inicial = self.cargar_datos_iniciales()
        
        # Crear ventana principal
        self.ventana = ctk.CTk()
        self.ventana.title("MinerApp Local v2.2 - Clean & Agile")
        self.ventana.geometry("620x620")
        self.ventana.minsize(520, 520)
        self.ventana.resizable(True, True)

        # --- ELEMENTOS VISUALES ---
        self.titulo = ctk.CTkLabel(
            self.ventana, 
            text="Control de Minería Segura (Monero XMR)", 
            font=("Arial", 20, "bold")
        )
        self.titulo.pack(pady=(15, 5))

        # Indicador de Estado (Semáforo)
        self.estado_label = ctk.CTkLabel(
            self.ventana, 
            text="⏸ DETENIDO", 
            font=("Arial", 16, "bold"), 
            text_color="red"
        )
        self.estado_label.pack(pady=5)

        # Métrica de Shares
        self.shares_label = ctk.CTkLabel(
            self.ventana, 
            text="Shares: 0 aceptados", 
            font=("Arial", 16, "bold")
        )
        self.shares_label.pack(pady=5)

        # --- PANEL DE CONFIGURACIÓN ---
        self.frame_config = ctk.CTkFrame(self.ventana)
        self.frame_config.pack(padx=20, pady=10, fill="x")

        # Campo: Billetera
        self.label_wallet = ctk.CTkLabel(
            self.frame_config, 
            text="Dirección de Billetera (XMR):", 
            font=("Arial", 12, "bold")
        )
        self.label_wallet.pack(anchor="w", padx=15, pady=(8, 2))
        
        self.entry_wallet = ctk.CTkEntry(
            self.frame_config, 
            width=540,
            font=("Consolas", 11),
            placeholder_text="Pega aquí tu dirección de Monero (XMR)..."
        )
        if billetera_inicial:
            self.entry_wallet.insert(0, billetera_inicial)
        self.entry_wallet.pack(padx=15, pady=(0, 8), fill="x")

        # Campo: Pool
        self.label_pool = ctk.CTkLabel(
            self.frame_config, 
            text="Pool de Minería (Host:Puerto):", 
            font=("Arial", 12, "bold")
        )
        self.label_pool.pack(anchor="w", padx=15, pady=(2, 2))
        
        self.entry_pool = ctk.CTkEntry(
            self.frame_config, 
            width=540,
            font=("Consolas", 11)
        )
        self.entry_pool.insert(0, pool_inicial)
        self.entry_pool.pack(padx=15, pady=(0, 10), fill="x")

        # --- BOTONES DE CONTROL ---
        self.frame_botones = ctk.CTkFrame(self.ventana, fg_color="transparent")
        self.frame_botones.pack(pady=10)
        
        self.boton_iniciar = ctk.CTkButton(
            self.frame_botones, 
            text="▶ INICIAR MINERÍA", 
            fg_color="green", 
            hover_color="darkgreen", 
            font=("Arial", 14, "bold"),
            width=200, 
            height=38,
            command=self.iniciar_mineria
        )
        self.boton_iniciar.pack(side="left", padx=10)
        
        self.boton_detener = ctk.CTkButton(
            self.frame_botones, 
            text="⏹ DETENER", 
            fg_color="red", 
            hover_color="darkred", 
            font=("Arial", 14, "bold"),
            width=200, 
            height=38,
            command=self.detener_mineria, 
            state="disabled"
        )
        self.boton_detener.pack(side="right", padx=10)

        # Consola de Logs
        self.log_textbox = ctk.CTkTextbox(self.ventana, font=("Consolas", 10))
        self.log_textbox.pack(pady=(10, 15), padx=20, fill="both", expand=True)

        # Protocolo de cierre
        self.ventana.protocol("WM_DELETE_WINDOW", self.cerrar_app)
        
        # Mensaje de bienvenida en log
        self.agregar_log(f"[*] MinerApp lista. Directorio base detectado: {self.ruta_base}")

    def cargar_datos_iniciales(self):
        """Lee la configuración local de usuario para precargar campos en la interfaz."""
        billetera = ""
        pool_defecto = "pool.supportxmr.com:443"

        # 1. Prioridad: user_settings.json (archivo local privado)
        if os.path.exists(self.ruta_user_settings):
            try:
                with open(self.ruta_user_settings, "r", encoding="utf-8") as f:
                    datos = json.load(f)
                    billetera = datos.get("wallet", "").strip()
                    pool = datos.get("pool", pool_defecto).strip()
                    if billetera:
                        return billetera, pool
            except Exception:
                pass

        # 2. Respaldo: config.json existente
        if os.path.exists(self.ruta_config):
            try:
                with open(self.ruta_config, "r", encoding="utf-8") as f:
                    datos = json.load(f)
                    pools = datos.get("pools", [])
                    if pools and isinstance(pools, list) and len(pools) > 0:
                        user_val = str(pools[0].get("user") or "").strip()
                        if user_val and "TU_DIRECCION" not in user_val:
                            billetera = user_val
                        pool = pools[0].get("url") or pool_defecto
                        return billetera, pool
            except Exception:
                pass
                
        return billetera, pool_defecto

    def guardar_user_settings(self, billetera, pool):
        """Guarda la configuración privada en user_settings.json (ignorado por Git)."""
        try:
            with open(self.ruta_user_settings, "w", encoding="utf-8") as f:
                json.dump({"wallet": billetera, "pool": pool}, f, indent=4)
        except Exception as e:
            self.agregar_log(f"[!] Aviso al guardar user_settings.json: {e}")

    def preparar_configuracion(self, billetera, pool):
        """
        Preserva todas las optimizaciones avanzadas de hardware (HugePages, MSR, etc.)
        actualizando únicamente los datos de conexión y billetera.
        Si config.json no existe, usa config.example.json como plantilla.
        """
        config = {}

        # Si no existe config.json pero existe la plantilla de ejemplo, copiarla
        if not os.path.exists(self.ruta_config) and os.path.exists(self.ruta_config_example):
            try:
                import shutil
                shutil.copyfile(self.ruta_config_example, self.ruta_config)
            except Exception:
                pass

        if os.path.exists(self.ruta_config):
            try:
                with open(self.ruta_config, "r", encoding="utf-8") as f:
                    config = json.load(f)
            except Exception as e:
                self.agregar_log(f"[!] Aviso al leer config.json: {e}. Se creará estructura básica.")

        if "pools" not in config or not isinstance(config["pools"], list) or len(config["pools"]) == 0:
            config["pools"] = [{}]

        # Actualizar pool primaria
        config["pools"][0]["url"] = pool
        config["pools"][0]["user"] = billetera
        config["pools"][0]["tls"] = True
        config["pools"][0]["tls-fingerprint"] = None
        if "enabled" not in config["pools"][0]:
            config["pools"][0]["enabled"] = True

        # Asegurar parámetros recomendados de CPU si no existieran
        if "cpu" not in config or not isinstance(config["cpu"], dict):
            config["cpu"] = {}
        if "max-threads-hint" not in config["cpu"]:
            config["cpu"]["max-threads-hint"] = 75

        if "print-time" not in config:
            config["print-time"] = 5

        with open(self.ruta_config, "w", encoding="utf-8") as f:
            json.dump(config, f, indent=4)

        # Guardar en user_settings.json local
        self.guardar_user_settings(billetera, pool)

    def iniciar_mineria(self):
        billetera = self.entry_wallet.get().strip()
        pool = self.entry_pool.get().strip()

        if not billetera:
            self.agregar_log("[!] Error: Debes ingresar una dirección de billetera válida.")
            return

        if not pool:
            self.agregar_log("[!] Error: Debes ingresar una URL de pool válida.")
            return

        if not os.path.exists(self.ruta_motor):
            self.agregar_log(f"[!] Error crítico: No se encontró xmrig.exe en:\n    {self.ruta_motor}")
            self.estado_label.configure(text="❌ MOTOR NO ENCONTRADO", text_color="red")
            return

        self.agregar_log("[*] Iniciando protocolo de seguridad...")
        self.estado_label.configure(text="🟡 CONECTANDO...", text_color="orange")
        self.boton_iniciar.configure(state="disabled")
        self.boton_detener.configure(state="normal")
        self.entry_wallet.configure(state="disabled")
        self.entry_pool.configure(state="disabled")

        try:
            # Guardar configuración preservando parámetros avanzados
            self.preparar_configuracion(billetera, pool)

            self.proceso_minero = subprocess.Popen(
                [self.ruta_motor, "--config", self.ruta_config],
                stdout=subprocess.PIPE, 
                stderr=subprocess.STDOUT, 
                text=True,
                creationflags=subprocess.CREATE_NO_WINDOW 
            )
            
            self.estado_label.configure(text="🟢 MINANDO ACTIVAMENTE", text_color="lime green")
            self.agregar_log("[*] Motor XMRig iniciado con éxito (TLS/SSL).")
            
            self.hilo_lectura = threading.Thread(target=self.leer_consola, daemon=True)
            self.hilo_lectura.start()

        except Exception as e:
            self.agregar_log(f"[!] Error crítico al iniciar el motor: {e}")
            self.detener_mineria()

    def leer_consola(self):
        """Lee la salida de XMRig línea por línea sin congelar la interfaz."""
        while self.proceso_minero and self.proceso_minero.stdout:
            linea = self.proceso_minero.stdout.readline()
            if not linea:
                self.ventana.after(0, self.error_critico)
                break
            
            linea_limpia = linea.strip()
            self.ventana.after(0, self.agregar_log, linea_limpia)
            
            if "accepted" in linea_limpia:
                match = re.search(r"accepted \((\d+)/", linea_limpia)
                if match:
                    aceptados = match.group(1)
                    self.ventana.after(0, self.actualizar_shares, aceptados)

    def actualizar_shares(self, count):
        self.shares_label.configure(text=f"Shares: {count} aceptados")

    def error_critico(self):
        """Se ejecuta si el motor se cierra inesperadamente."""
        self.estado_label.configure(text="❌ ERROR DE CONEXIÓN", text_color="red")
        self.boton_iniciar.configure(state="normal")
        self.boton_detener.configure(state="disabled")
        self.entry_wallet.configure(state="normal")
        self.entry_pool.configure(state="normal")
        self.agregar_log("[!] El motor se detuvo inesperadamente (verifique conexión o parámetros).")

    def detener_mineria(self):
        self.agregar_log("[*] Deteniendo minería de forma segura...")
        if self.proceso_minero:
            try:
                self.proceso_minero.terminate()
                self.proceso_minero.wait(timeout=3)
            except Exception:
                try:
                    self.proceso_minero.kill()
                except Exception:
                    pass
            self.proceso_minero = None
            
        self.estado_label.configure(text="⏸ DETENIDO", text_color="red")
        self.boton_iniciar.configure(state="normal")
        self.boton_detener.configure(state="disabled")
        self.entry_wallet.configure(state="normal")
        self.entry_pool.configure(state="normal")

    def agregar_log(self, texto):
        self.log_textbox.insert(ctk.END, texto + "\n")
        self.log_textbox.see(ctk.END)

    def cerrar_app(self):
        self.detener_mineria()
        self.ventana.destroy()

    def run(self):
        self.ventana.mainloop()

if __name__ == "__main__":
    app = MinerApp()
    app.run()