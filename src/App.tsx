import React, { useState, useEffect, useRef } from 'react';
import { MinerState, AdvancedMinerConfig, TelemetryStats, TerminalLog, EngineMode } from './types';
import { DEFAULT_CONFIG } from './data/defaultConfig';
import { createLog } from './utils/minerEngine';
import { MinerService } from './services/minerService';
import { Header } from './components/Header';
import { StatusSemaforo } from './components/StatusSemaforo';
import { ConfigPanel } from './components/ConfigPanel';
import { Controls } from './components/Controls';
import { LogTerminal } from './components/LogTerminal';
import { TelemetryCards } from './components/TelemetryCards';
import { ConfigModal } from './components/ConfigModal';
import { ReadmeModal } from './components/ReadmeModal';

const STORAGE_KEY = 'minerapp_user_settings_v2';

export default function App() {
  // Load configuration from local persistence
  const [config, setConfig] = useState<AdvancedMinerConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_CONFIG,
          ...parsed,
          wallet: parsed.wallet || DEFAULT_CONFIG.wallet,
        };
      }
    } catch {
      // ignore
    }
    return DEFAULT_CONFIG;
  });

  const [minerState, setMinerState] = useState<MinerState>('STOPPED');
  const [engineMode, setEngineMode] = useState<EngineMode>('SIMULATED');
  const [logs, setLogs] = useState<TerminalLog[]>(() => [
    createLog('[*] MinerApp lista. Interfaz cargada en entorno web seguro.'),
    createLog('[*] Parámetros de seguridad TLS/SSL listos para iniciar.'),
  ]);
  const [stats, setStats] = useState<TelemetryStats>({
    hashrate10s: 0,
    hashrate60s: 0,
    hashrate15m: 0,
    acceptedShares: 0,
    rejectedShares: 0,
    difficulty: 100000,
    pingMs: 0,
    uptimeSeconds: 0,
    cpuUsage: 0,
    activeThreads: 0,
    totalHashes: 0,
    estEarningsXmrPerDay: 0,
  });

  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [logsCopied, setLogsCopied] = useState(false);

  // Service ref
  const serviceRef = useRef<MinerService | null>(null);

  // Initialize unified MinerService on mount
  useEffect(() => {
    const service = new MinerService(config, {
      onLog: (newLog) => setLogs((prev) => [...prev.slice(-300), newLog]),
      onStats: (newStats) => setStats(newStats),
      onStateChange: (newState) => setMinerState(newState),
      onModeChange: (newMode) => setEngineMode(newMode),
      onConfigLoaded: (saved) => {
        if (saved.wallet) {
          setConfig((prev) => {
            if (!prev.wallet || prev.wallet !== saved.wallet) {
              const updated = {
                ...prev,
                wallet: saved.wallet,
                pool: saved.pool || prev.pool,
                rigId: saved.rigId || prev.rigId,
              };
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
              } catch {
                // ignore
              }
              return updated;
            }
            return prev;
          });
        }
      },
    });

    serviceRef.current = service;
    service.fetchSavedConfig();
    service.startHealthMonitoring();

    return () => {
      service.destroy();
    };
  }, []);

  // Save user settings when updated
  const handleConfigChange = (updated: Partial<AdvancedMinerConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      if (serviceRef.current) {
        serviceRef.current.updateConfig(next);
      }
      return next;
    });
  };

  const handleStartMining = () => {
    if (!config.wallet) {
      setLogs((prev) => [
        ...prev,
        createLog('[!] Error: Debes ingresar una dirección de billetera válida.', 'error'),
      ]);
      return;
    }
    if (!config.pool) {
      setLogs((prev) => [
        ...prev,
        createLog('[!] Error: Debes ingresar una URL de pool válida.', 'error'),
      ]);
      return;
    }

    if (serviceRef.current) {
      serviceRef.current.updateConfig(config);
      serviceRef.current.start();
    }
  };

  const handleStopMining = () => {
    if (serviceRef.current) {
      serviceRef.current.stop();
    }
  };

  const handleClearLogs = () => {
    setLogs([createLog('[*] Consola de registros reiniciada.')]);
  };

  const handleCopyLogs = () => {
    const rawText = logs
      .map((l) => `[${l.timestamp}] ${l.message}`)
      .join('\n');
    navigator.clipboard.writeText(rawText);
    setLogsCopied(true);
    setTimeout(() => setLogsCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Header
        onOpenConfigModal={() => setIsConfigModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        isRunning={minerState === 'MINING'}
        mode={engineMode}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* Status Indicator & Metrics */}
        <StatusSemaforo state={minerState} stats={stats} />

        {/* Live Telemetry Stats */}
        <TelemetryCards stats={stats} state={minerState} />

        {/* Configuration Section */}
        <ConfigPanel
          config={config}
          onChange={handleConfigChange}
          disabled={minerState === 'MINING' || minerState === 'CONNECTING'}
        />

        {/* Control Buttons */}
        <Controls
          state={minerState}
          onStart={handleStartMining}
          onStop={handleStopMining}
          onClearLogs={handleClearLogs}
          onCopyLogs={handleCopyLogs}
          logsCopied={logsCopied}
        />

        {/* Real-time Console Terminal */}
        <LogTerminal logs={logs} />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-4 px-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>MinerApp Local v2.2 • "Clean, Agile & Portable Edition"</span>
          <span className="text-slate-400">
            Algoritmo RandomX (Monero XMR) • Soporte TLSv1.3 puerto 443
          </span>
        </div>
      </footer>

      {/* Modals */}
      <ConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        config={config}
      />

      <ReadmeModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />
    </div>
  );
}
