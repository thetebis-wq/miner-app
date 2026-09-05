import React, { useState } from 'react';
import { AdvancedMinerConfig } from '../types';
import { POOL_PRESETS } from '../data/defaultConfig';
import { Wallet, Globe, Sliders, ChevronDown, ChevronUp, Lock, Cpu, Sparkles } from 'lucide-react';

interface ConfigPanelProps {
  config: AdvancedMinerConfig;
  onChange: (updated: Partial<AdvancedMinerConfig>) => void;
  disabled: boolean;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  config,
  onChange,
  disabled,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const fillSampleWallet = () => {
    // Standard Monero public address format (95 chars starting with 4)
    onChange({
      wallet: '44AFFq5AxmcWngAAiocBgGeBz7rKa8TrLS4G6aUhn5P56TwitkgCZD4BLqqYwSkjVC29jiC4ZFuQBhTWoiWoiQ9Te355C5d',
    });
  };

  return (
    <div
      id="miner-config-panel"
      className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md space-y-4"
    >
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          Panel de Configuración de Minería
        </h2>
        <span className="text-xs text-slate-400">
          Preserva 139 líneas de optimizaciones en <code className="text-cyan-400 font-mono">config.json</code>
        </span>
      </div>

      {/* Wallet Input */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="input-wallet"
            className="text-xs font-bold text-slate-300 flex items-center gap-1.5"
          >
            <Wallet className="w-3.5 h-3.5 text-cyan-400" />
            Dirección de Billetera (XMR):
          </label>
          {!config.wallet && (
            <button
              id="btn-fill-sample-wallet"
              type="button"
              onClick={fillSampleWallet}
              disabled={disabled}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline transition-colors cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              Usar dirección de prueba
            </button>
          )}
        </div>
        <div className="relative">
          <input
            id="input-wallet"
            type="text"
            disabled={disabled}
            value={config.wallet}
            onChange={(e) => onChange({ wallet: e.target.value.trim() })}
            placeholder="Pega aquí tu dirección de Monero (XMR)..."
            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-lg text-xs font-mono text-cyan-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
        </div>
        <p className="text-[11px] text-slate-400">
          Compatible con billeteras oficiales de Monero GUI, CLI, Cake Wallet y Feather Wallet.
        </p>
      </div>

      {/* Pool Input and Presets */}
      <div className="space-y-1.5">
        <label
          htmlFor="input-pool"
          className="text-xs font-bold text-slate-300 flex items-center gap-1.5"
        >
          <Globe className="w-3.5 h-3.5 text-blue-400" />
          Pool de Minería (Host:Puerto):
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            id="input-pool"
            type="text"
            disabled={disabled}
            value={config.pool}
            onChange={(e) => onChange({ pool: e.target.value.trim() })}
            placeholder="pool.supportxmr.com:443"
            className="flex-1 px-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-lg text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-400 mr-1">Presets recomendados:</span>
          {POOL_PRESETS.map((p) => (
            <button
              key={p.url}
              type="button"
              disabled={disabled}
              onClick={() => onChange({ pool: p.url, tlsEnabled: p.tls })}
              className={`text-[11px] px-2.5 py-1 rounded-md border font-mono transition-all ${
                config.pool === p.url
                  ? 'bg-cyan-950/70 border-cyan-500 text-cyan-300 font-semibold'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-700/60'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Toggle */}
      <div className="pt-2 border-t border-slate-800/80">
        <button
          id="btn-toggle-advanced-config"
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full py-1 text-xs font-semibold text-slate-300 hover:text-cyan-400 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            Parámetros Avanzados de Hardware (HugePages, MSR, Hilos)
          </span>
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 mt-2 border-t border-slate-800/60">
            {/* Thread Hint */}
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 flex justify-between">
                <span>Límite de Hilos CPU:</span>
                <span className="text-cyan-400 font-mono">{config.threadsHint}%</span>
              </label>
              <input
                type="range"
                min="25"
                max="100"
                step="5"
                disabled={disabled}
                value={config.threadsHint}
                onChange={(e) => onChange({ threadsHint: Number(e.target.value) })}
                className="w-full mt-2 accent-cyan-500 cursor-pointer disabled:opacity-50"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                75% recomendado para laptops para prevenir sobrecalentamiento.
              </span>
            </div>

            {/* TLS Enforce */}
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  Protocolo TLS/SSL:
                </span>
                <input
                  type="checkbox"
                  disabled={disabled}
                  checked={config.tlsEnabled}
                  onChange={(e) => onChange({ tlsEnabled: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer disabled:opacity-50"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-2 block">
                Cifra el tráfico de shares a través del puerto 443.
              </span>
            </div>

            {/* Huge Pages */}
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  Páginas HugePages (1GB):
                </span>
                <input
                  type="checkbox"
                  disabled={disabled}
                  checked={config.hugePages}
                  onChange={(e) => onChange({ hugePages: e.target.checked })}
                  className="w-4 h-4 accent-cyan-500 rounded cursor-pointer disabled:opacity-50"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-2 block">
                Optimización de caché L3 para algoritmo RandomX.
              </span>
            </div>

            {/* Rig ID */}
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Identificador de Equipo (Rig ID):
              </label>
              <input
                type="text"
                disabled={disabled}
                value={config.rigId}
                onChange={(e) => onChange({ rigId: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-slate-200"
              />
            </div>

            {/* Donate Level */}
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Nivel Donación Desarrollador XMRig:
              </label>
              <select
                disabled={disabled}
                value={config.donateLevel}
                onChange={(e) => onChange({ donateLevel: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-200"
              >
                <option value={0}>0% (Mínimo absoluto)</option>
                <option value={1}>1% (Predeterminado recomendado)</option>
                <option value={2}>2%</option>
                <option value={5}>5%</option>
              </select>
            </div>

            {/* Print Time */}
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Intervalo de Telemetría (print-time):
              </label>
              <select
                disabled={disabled}
                value={config.printTime}
                onChange={(e) => onChange({ printTime: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-200"
              >
                <option value={5}>Cada 5 segundos</option>
                <option value={15}>Cada 15 segundos</option>
                <option value={30}>Cada 30 segundos</option>
                <option value={60}>Cada 60 segundos</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
