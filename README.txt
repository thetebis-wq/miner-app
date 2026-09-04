================================================================================
                     M I N E R A P P   L O C A L   v 2 . 2
                        "Clean, Agile & Portable Edition"
================================================================================

Autor      : Usuario
Mentoría   : Senior Software Engineer (IA)
Fecha      : Septiembre 2026
Lenguaje   : Python 3.x
Estado     : Activo, Optimizado, Portable, Generando Ingresos Pasivos.

--------------------------------------------------------------------------------
                           OBJETIVO DEL PROYECTO
--------------------------------------------------------------------------------

Desarrollar una aplicación de escritorio local, segura y sin dependencias de 
terceros, capaz de minar criptomonedas (Monero - XMR) en una laptop de 
consumo, utilizando protocolos de red de grado militar (TLS/SSL) y garantizando 
la seguridad del hardware y del usuario.

--------------------------------------------------------------------------------
                         HISTORIAL DE VERSIONES
--------------------------------------------------------------------------------

Fase 1: Conceptualización y Arquitectura (Pre-Código)
- Se descartó Bitcoin (BTC) por inviabilidad frente a hardware ASIC.
- Se seleccionó Monero (XMR) por su algoritmo resistente (RandomX).
- Creación de entorno virtual aislado (mi_entorno_seguro) en Windows.

Fase 2: Adquisición y Validación del Motor (Backend)
- Integración de XMRig (C++) como motor de cómputo controlado por Python.
- Validación de descargas mediante verificación de huellas digitales (SHA-256).
- Configuración de exclusiones quirúrgicas en Windows Defender.

Fase 3: El Wrapper de Seguridad (v1.0 - Modo Consola)
- Primer script en Python generando config.json dinámico.
- Forzado de conexión por puerto 443 (TLS/SSL), rechazando texto plano.
- Implementación de billetera local no custodial (Feather Wallet).

Fase 4: Interfaz Gráfica y Empaquetado (v2.0 - GUI)
- Migración a interfaz moderna usando CustomTkinter (modo oscuro).
- Implementación de 'threading' para lectura asíncrona de logs.

Fase 5: Portabilidad Total y GUI Configurable (v2.2)
- Reubicación y detección dinámica de rutas relativas (soporte portable).
- Inclusión de campos editables en la GUI para Billetera (XMR) y Pool.
- Preservación inteligente de las 139 líneas de optimizaciones de config.json.

--------------------------------------------------------------------------------
                           GUÍA DE EJECUCIÓN
--------------------------------------------------------------------------------

:: 1. Ir a la carpeta del proyecto
cd C:\Proyectos\miner-app

:: 2. Activar el entorno virtual o ejecutar directamente:
.\mi_entorno_seguro\Scripts\python.exe app_minera.py

:: 3. COMPILAR / ACTUALIZAR EL .EXE
.\mi_entorno_seguro\Scripts\python.exe -m PyInstaller --noconsole --onefile --collect-data customtkinter --name "MinerApp_Turbo" app_minera.py