@echo off
title MinerApp Local v2.2 - Launcher Hibrido
color 0b

echo ======================================================================
echo               M I N E R A P P   L O C A L   v 2 . 2
echo               Arquitectura Hibrida: Web UI + Motor Nativo
echo ======================================================================
echo.

cd /d "%~dp0"

echo [*] Verificando entorno seguro de Python...
if exist ".\mi_entorno_seguro\Scripts\python.exe" (
    set "PYTHON_EXE=.\mi_entorno_seguro\Scripts\python.exe"
) else (
    set "PYTHON_EXE=python"
)

echo [*] Iniciando Backend nativo en segundo plano (puerto 8000)...
start "MinerApp Backend (XMRig Control)" /min cmd /c "%PYTHON_EXE% backend\server.py"

echo [*] Iniciando Servidor Web Frontend (puerto 3000)...
start "MinerApp Web (Vite)" /min cmd /c "npm.cmd run dev"

echo [*] Esperando inicializacion de servicios...
timeout /t 3 /nobreak >nul

echo [*] Abriendo interfaz en el navegador...
start http://localhost:3000

echo.
echo ======================================================================
echo  MinerApp iniciado con exito!
echo  - Frontend Web : http://localhost:3000
echo  - Backend API  : http://127.0.0.1:8000
echo ======================================================================
echo.
echo Puedes minimizar esta ventana. Para cerrar MinerApp, cierra las ventanas
echo minimizadas de los servicios.
echo.
pause
