import React from 'react';
import { TelemetryStats, MinerState } from '../types';
import { Activity, Gauge, Server, Coins, Zap } from 'lucide-react';

interface TelemetryCardsProps {
  stats: TelemetryStats;
  state: MinerState;
}

export const TelemetryCards: React.FC<TelemetryCardsProps> = ({ stats, state }) => {
  const isMining = state === 'MINING';

  return (
    <div
      id="telemetry-metrics-grid"
      className="grid grid-cols-2 sm:grid-cols-4 gap-3"
    >
      {/* Hashrate Card */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Potencia Hash (10s)</span>
          <Gauge className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="text-xl font-bold font-mono text-cyan-300">
          {isMining ? `${stats.hashrate10s.toLocaleString()}` : '0'}{' '}
          <span className="text-xs font-normal text-slate-400">H/s</span>
        </div>
        <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
          <span>60s: {isMining ? stats.hashrate60s : 0} H/s</span>
          <span>15m: {isMining ? stats.hashrate15m : 0} H/s</span>
        </div>
      </div>

      {/* CPU Affinity & Load */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Carga CPU</span>
          <Activity className="w-4 h-4 text-blue-400" />
        </div>
        <div className="text-xl font-bold font-mono text-blue-300">
          {isMining ? `${stats.cpuUsage}%` : '0%'}{' '}
          <span className="text-xs font-normal text-slate-400">
            ({isMining ? `${stats.activeThreads} hilos` : 'en reposo'})
          </span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
          <div
            className="bg-blue-500 h-full transition-all duration-500"
            style={{ width: `${isMining ? stats.cpuUsage : 0}%` }}
          />
        </div>
      </div>

      {/* Network Latency & Pool */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Latencia Pool (Ping)</span>
          <Server className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-xl font-bold font-mono text-emerald-300">
          {isMining ? `${stats.pingMs}` : '--'}{' '}
          <span className="text-xs font-normal text-slate-400">ms</span>
        </div>
        <div className="text-[10px] text-slate-400 mt-1">
          Dificultad: {isMining ? stats.difficulty.toLocaleString() : '--'}
        </div>
      </div>

      {/* Est Earnings */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Est. Ganancia Diaria</span>
          <Coins className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-xl font-bold font-mono text-amber-300">
          {isMining ? `~${stats.estEarningsXmrPerDay}` : '0.000000'}{' '}
          <span className="text-xs font-normal text-slate-400">XMR</span>
        </div>
        <div className="text-[10px] text-slate-400 mt-1">
          Calculado con dificultad RandomX
        </div>
      </div>
    </div>
  );
};
