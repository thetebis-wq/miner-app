# MinerApp Local v2.2 — "Clean, Agile & Portable Edition"

Control de Minería Segura para Monero (XMR) migrado a aplicación web interactiva con monitoreo de hardware, soporte de telemetría en tiempo real, generador de configuración y compatibilidad completa con XMRig.

## Características

- **Control de Minería Seguro**: Gestión de billetera (XMR) y pool con forzado de protocolo de grado militar (TLS/SSL por puerto 443).
- **Semáforo de Estado**: Indicador en vivo de estado del motor (DETENIDO, CONECTANDO, MINANDO ACTIVAMENTE, ERROR).
- **Métricas y Telemetría**: Monitoreo de shares aceptados/rechazados, potencia de hash (H/s a 10s, 60s, 15m), latencia (ping), dificultad y estimación de rendimiento.
- **Optimizaciones de Hardware**: Preserva y configura parámetros avanzados como HugePages de 1GB, límites de hilos CPU (threads hint para prevención térmica), y afinidad de núcleos.
- **Generador de `config.json`**: Visualiza, copia y descarga el archivo `config.json` de 225 líneas completo y optimizado, listo para ejecutar con XMRig en Windows o Linux.
- **Consola en Tiempo Real**: Visualización asíncrona de registros de ejecución con filtros de búsqueda y exportación.

## Guía de Uso

1. Ingresa tu dirección de billetera de Monero (XMR).
2. Especifica o selecciona el pool de minería (por defecto `pool.supportxmr.com:443`).
3. Haz clic en **▶ INICIAR MINERÍA** para iniciar el motor.
4. Para exportar la configuración para tu equipo local, usa el botón **Exportar config.json**.
