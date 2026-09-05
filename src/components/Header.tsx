import React from 'react';
import { Cpu, ShieldCheck, FileText, Download, Activity } from 'lucide-react';

interface HeaderProps {
  onOpenConfigModal: () => void;
  onOpenGuideModal: () => void;
  isRunning: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenConfigModal,
  onOpenGuideModal,
  isRunning,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 py-4 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative p-2.5 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-xl shadow-lg shadow-cyan-900/30">
            <Cpu className="w-6 h-6 text-white" />
            {isRunning && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-mono">
                MinerApp Local <span className="text-cyan-400 text-sm font-semibold">v2.2</span>
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 rounded-md">
                Clean & Agile
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Control de Minería Segura (Monero XMR) • TLS/SSL Grado Militar
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-open-config-modal"
            onClick={onOpenConfigModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-colors shadow-sm"
            title="Ver y exportar config.json compatible con XMRig"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            Exportar config.json
          </button>
          
          <button
            id="btn-open-guide-modal"
            onClick={onOpenGuideModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-colors shadow-sm"
            title="Ver Guía de Arquitectura y Fases del README original"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            Guía y Arquitectura
          </button>
        </div>
      </div>
    </header>
  );
};
