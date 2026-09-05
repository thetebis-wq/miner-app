import React from 'react';
import { MinerState, TelemetryStats } from '../types';
import { CheckCircle2, PauseCircle, Loader2, AlertTriangle, Zap, Clock } from 'lucide-react';

interface StatusSemaforoProps {
  state: MinerState;
  stats: TelemetryStats;
}

export const StatusSemaforo: React.FC<StatusSemaforoProps> = ({ state, stats }) => {
  const formatUptime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getStatusDisplay = () => {
    switch (state) {
      case 'MINING':
        return {
          text: '🟢 MINANDO ACTIVAMENTE',
          color: 'text-emerald-400',
          bg: 'bg-emerald-950/40 border-emerald-800/60',
          dot: 'bg-emerald-500 animate-pulse',
          icon: <Zap className="w-5 h-5 text-emerald-400 animate-pulse" />,
        };
      case 'CONNECTING':
        return {
          text: '🟡 CONECTANDO...',
          color: 'text-amber-400',
          bg: 'bg-amber-950/40 border-amber-800/60',
          dot: 'bg-amber-500 animate-ping',
          icon: <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />,
        };
      case 'ERROR':
        return {
          text: '❌ ERROR DE CONEXIÓN',
          color: 'text-rose-400',
          bg: 'bg-rose-950/40 border-rose-800/60',
          dot: 'bg-rose-500',
          icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
        };
      case 'STOPPED':
      default:
        return {
          text: '⏸ DETENIDO',
          color: 'text-rose-400',
          bg: 'bg-rose-950/30 border-rose-900/40',
          dot: 'bg-rose-500',
          icon: <PauseCircle className="w-5 h-5 text-rose-400" />,
        };
    }
  };

  const status = getStatusDisplay();

  return (
    <div
      id="status-semaforo-container"
      className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-900/70 border border-slate-800 shadow-inner"
    >
      {/* Primary Semáforo */}
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${status.bg} transition-all`}>
        <div className="flex-shrink-0">{status.icon}</div>
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Estado del Motor
          </span>
          <span className={`text-base font-bold font-mono ${status.color}`}>
            {status.text}
          </span>
        </div>
      </div>

      {/* Shares Metric (as in app_minera.py) */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-800 bg-slate-950/50">
        <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
        <div className="flex-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Métrica de Validación
          </span>
          <span className="text-base font-bold font-mono text-cyan-300">
            Shares: {stats.acceptedShares} aceptados
          </span>
          {stats.rejectedShares > 0 && (
            <span className="text-xs text-rose-400 ml-2">
              ({stats.rejectedShares} rech.)
            </span>
          )}
        </div>
      </div>

      {/* Hashrate & Uptime */}
      <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-slate-800 bg-slate-950/50">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Velocidad (10s)
          </span>
          <span className="text-base font-bold font-mono text-emerald-400">
            {state === 'MINING' ? `${stats.hashrate10s.toLocaleString()} H/s` : '0 H/s'}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-end gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            Tiempo
          </span>
          <span className="text-sm font-mono text-slate-300">
            {formatUptime(stats.uptimeSeconds)}
          </span>
        </div>
      </div>
    </div>
  );
};
