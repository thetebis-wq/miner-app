import React from 'react';
import { Play, Square, RefreshCw, Trash2, Copy, Check } from 'lucide-react';
import { MinerState } from '../types';

interface ControlsProps {
  state: MinerState;
  onStart: () => void;
  onStop: () => void;
  onClearLogs: () => void;
  onCopyLogs: () => void;
  logsCopied: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  state,
  onStart,
  onStop,
  onClearLogs,
  onCopyLogs,
  logsCopied,
}) => {
  const isMiningOrConnecting = state === 'MINING' || state === 'CONNECTING';

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        {/* INICIAR MINERÍA */}
        <button
          id="btn-iniciar-mineria"
          type="button"
          onClick={onStart}
          disabled={isMiningOrConnecting}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          <Play className="w-4 h-4 fill-white" />
          ▶ INICIAR MINERÍA
        </button>

        {/* DETENER */}
        <button
          id="btn-detener-mineria"
          type="button"
          onClick={onStop}
          disabled={!isMiningOrConnecting}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-sm bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          <Square className="w-4 h-4 fill-white" />
          ⏹ DETENER
        </button>
      </div>

      {/* Terminal Tools */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button
          id="btn-copy-terminal-logs"
          type="button"
          onClick={onCopyLogs}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          title="Copiar registros de consola"
        >
          {logsCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copiar Logs</span>
            </>
          )}
        </button>

        <button
          id="btn-clear-terminal-logs"
          type="button"
          onClick={onClearLogs}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          title="Limpiar consola"
        >
          <Trash2 className="w-3.5 h-3.5 text-slate-400" />
          <span>Limpiar</span>
        </button>
      </div>
    </div>
  );
};
