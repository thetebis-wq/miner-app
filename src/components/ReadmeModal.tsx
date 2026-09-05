import React from 'react';
import { X, BookOpen, Shield, CheckCircle, Cpu, Lock } from 'lucide-react';

interface ReadmeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReadmeModal: React.FC<ReadmeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="readme-guide-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-base font-bold text-white font-mono">
                MinerApp Local v2.2 — Documentación y Arquitectura
              </h3>
              <p className="text-xs text-slate-400">
                Manual y Protocolo de Seguridad original (README.txt)
              </p>
            </div>
          </div>
          <button
            id="btn-close-readme-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed font-sans">
          {/* Objective */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-emerald-400" />
              Objetivo del Proyecto
            </h4>
            <p className="text-slate-300">
              Desarrollar una aplicación de control local, segura y sin dependencias de terceros, capaz de gestionar la minería de Monero (XMR) en hardware de consumo, utilizando protocolos de red de grado militar (TLS/SSL por puerto 443) y garantizando la seguridad del hardware y del usuario.
            </p>
          </div>

          {/* Version History / Phases */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm">
              Historial de Fases de Ingeniería
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-cyan-400 font-mono">Fase 1: Conceptualización</span>
                <p className="text-xs text-slate-400">
                  Selección de Monero (XMR) por su algoritmo RandomX resistente a ASIC, permitiendo minado eficiente en CPUs convencionales.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-cyan-400 font-mono">Fase 2: Motor de Cómputo</span>
                <p className="text-xs text-slate-400">
                  Integración de XMRig (C++) con verificación criptográfica SHA-256 de binarios para asegurar integridad total del hardware.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-cyan-400 font-mono">Fase 3: Wrapper de Seguridad</span>
                <p className="text-xs text-slate-400">
                  Forzado de conexión por puerto 443 (TLS/SSL), rechazando texto plano. Billeteras no custodiales recomendadas (Feather / GUI oficial).
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-cyan-400 font-mono">Fase 4 & 5: GUI y Portabilidad</span>
                <p className="text-xs text-slate-400">
                  Interfaz reactiva con threading asíncrono para lectura de logs sin congelamiento, detección dinámica de rutas y preservación de 139 líneas de optimizaciones.
                </p>
              </div>
            </div>
          </div>

          {/* Hardware Security Guidelines */}
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/40 space-y-2">
            <h4 className="font-bold text-cyan-300 flex items-center gap-2 text-sm">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Recomendaciones de Seguridad Térmica
            </h4>
            <ul className="list-disc list-inside space-y-1 text-xs text-cyan-200/90">
              <li>Configurar el límite de hilos (threads hint) al 75% o menos en laptops para evitar estrangulamiento térmico (thermal throttling).</li>
              <li>Mantener el equipo sobre una superficie plana y despejada para optimizar la disipación de calor.</li>
              <li>HugePages activadas requieren permisos administrativos en el sistema anfitrión para asignar memoria fija de 1GB sin fragmentación.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 border-t border-slate-800 bg-slate-950/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors font-medium text-xs"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
