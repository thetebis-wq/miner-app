# MinerApp Local v2.2 — "Clean, Agile & Portable Edition"

Control de Minería Segura para Monero (XMR) con arquitectura híbrida: interfaz web moderna (React 19, TypeScript, Tailwind CSS) + motor nativo de hardware (XMRig C++ en Windows).

---

## 🏛️ Arquitectura Híbrida

MinerApp v2.2 utiliza un diseño desacoplado de dos niveles:

1. **Frontend Web (`src/`)**: Panel de control interactivo con modo oscuro, telemetría en tiempo real, semáforo de estado, terminal de registros y generador de `config.json`.
2. **Backend Local (`backend/`)**: Servidor ligero en Python (puerto 8000) que administra el subproceso de `xmrig.exe`, preservando las optimizaciones de hardware (HugePages, MSR, límite de hilos térmicos) y transmitiendo telemetría vía Server-Sent Events (SSE).

### 🔄 Detección Automática de Modo (Dual-Mode):
* **🟢 Hardware Real (Local)**: Si el backend local está encendido en tu PC, el frontend se conecta a él automáticamente y controla el proceso real de `xmrig.exe`.
* **🟣 Simulación Web (Google AI Studio)**: Si abres el proyecto en el navegador sin backend o dentro del entorno en la nube de **Google AI Studio**, la interfaz conmuta de inmediato a simulación interactiva sin generar errores.

---

## 🤖 Directrices para Google AI Studio / Asistentes IA

> [!IMPORTANT]
> **REGLAS PARA MODIFICACIONES AUTOMATIZADAS:**
> * La carpeta `backend/` contiene los binarios nativos del motor de cómputo (`backend/xmrig/xmrig.exe`), controladores del kernel (`WinRing0x64.sys`) y el servidor de control en Python.
> * **NO ELIMINAR NI SOBREESCRIBIR LA CARPETA `backend/`** al realizar mejoras o generar nuevas versiones del frontend.
> * Cualquier cambio visual o de interfaz debe limitarse exclusivamente a la carpeta `src/`.

---

## 🚀 Inicio Rápido en Windows

### Opción 1: Un solo clic (Recomendada)
Doble clic sobre el archivo ejecutable:
```bat
iniciar_minerapp.bat
```
Este script iniciará el backend de Python, el servidor web y abrirá automáticamente tu navegador en `http://localhost:3000`.

### Opción 2: Manual por terminal
1. **Iniciar el Backend (en una terminal):**
   ```powershell
   .\mi_entorno_seguro\Scripts\python.exe backend\server.py
   ```
2. **Iniciar el Frontend (en otra terminal):**
   ```powershell
   npm run dev
   ```
3. Abrir `http://localhost:3000` en el navegador.

---

## 🛡️ Seguridad y Optimización
* **Cifrado TLS/SSL Grado Militar:** Forzado en el puerto 443 para pools compatibles.
* **Control Térmico (Threads Hint):** Configurado al 75% por defecto para evitar sobrecalentamiento en laptops.
* **Preservación de Configuración:** Genera y exporta archivos `config.json` auténticos de 225 líneas listos para XMRig.
