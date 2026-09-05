import { AdvancedMinerConfig, BackendHealth, EngineMode, MinerState, TelemetryStats, TerminalLog } from '../types';
import { SimulatedMinerEngine, createLog } from '../utils/minerEngine';

const BACKEND_URL = 'http://127.0.0.1:8000';

export interface MinerServiceCallbacks {
  onLog: (log: TerminalLog) => void;
  onStats: (stats: TelemetryStats) => void;
  onStateChange: (state: MinerState) => void;
  onModeChange: (mode: EngineMode) => void;
  onConfigLoaded?: (config: { wallet: string; pool: string; rigId?: string }) => void;
}

export class MinerService {
  private mode: EngineMode = 'SIMULATED';
  private config: AdvancedMinerConfig;
  private callbacks: MinerServiceCallbacks;
  
  // Real engine handles
  private eventSource: EventSource | null = null;
  
  // Simulated engine handle
  private simulatedEngine: SimulatedMinerEngine;

  private healthCheckTimer: number | null = null;
  private isCheckingHealth = false;

  constructor(config: AdvancedMinerConfig, callbacks: MinerServiceCallbacks) {
    this.config = config;
    this.callbacks = callbacks;
    this.simulatedEngine = new SimulatedMinerEngine(config, {
      onLog: callbacks.onLog,
      onStats: callbacks.onStats,
      onStateChange: callbacks.onStateChange,
    });
  }

  public getMode(): EngineMode {
    return this.mode;
  }

  public updateConfig(newConfig: AdvancedMinerConfig) {
    this.config = newConfig;
    this.simulatedEngine.updateConfig(newConfig);
  }

  /**
   * Checks whether the local Python backend server is running on localhost:8000
   */
  public async checkBackendHealth(): Promise<boolean> {
    if (this.isCheckingHealth) return this.mode === 'REAL';
    this.isCheckingHealth = true;

    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 1800);

      const res = await fetch(`${BACKEND_URL}/api/health`, {
        signal: controller.signal,
      });
      window.clearTimeout(timeoutId);

      if (res.ok) {
        const data: BackendHealth = await res.json();
        if (data.savedConfig?.wallet && this.callbacks.onConfigLoaded) {
          this.callbacks.onConfigLoaded(data.savedConfig);
        }
        if (this.mode !== 'REAL') {
          this.setMode('REAL');
          this.callbacks.onLog(
            createLog(
              `[+] Backend nativo detectado en 127.0.0.1:8000. Modo de Hardware Real activado.`,
              'success'
            )
          );
          this.connectRealEvents();
        }
        return true;
      }
    } catch {
      // Backend not running or timeout -> Fallback to simulation
      if (this.mode !== 'SIMULATED') {
        this.setMode('SIMULATED');
        this.disconnectRealEvents();
        this.callbacks.onLog(
          createLog(
            `[*] Backend local desconectado. Modo Simulación (Google AI Studio / Web) activado.`,
            'info'
          )
        );
      }
    } finally {
      this.isCheckingHealth = false;
    }

    return false;
  }

  public startHealthMonitoring() {
    this.checkBackendHealth();
    this.healthCheckTimer = window.setInterval(() => {
      this.checkBackendHealth();
    }, 4000);
  }

  public stopHealthMonitoring() {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }

  private setMode(newMode: EngineMode) {
    this.mode = newMode;
    this.callbacks.onModeChange(newMode);
  }

  private connectRealEvents() {
    if (this.eventSource) {
      this.eventSource.close();
    }

    try {
      this.eventSource = new EventSource(`${BACKEND_URL}/api/events`);

      this.eventSource.addEventListener('init', (e) => {
        try {
          const data: BackendHealth = JSON.parse(e.data);
          this.callbacks.onStateChange(data.state);
          if (data.stats) {
            this.callbacks.onStats(data.stats);
          }
          if (data.savedConfig?.wallet && this.callbacks.onConfigLoaded) {
            this.callbacks.onConfigLoaded(data.savedConfig);
          }
        } catch {
          // ignore
        }
      });

      this.eventSource.addEventListener('log', (e) => {
        try {
          const log: TerminalLog = JSON.parse(e.data);
          this.callbacks.onLog(log);
        } catch {
          // ignore
        }
      });

      this.eventSource.addEventListener('stats', (e) => {
        try {
          const stats: TelemetryStats = JSON.parse(e.data);
          this.callbacks.onStats(stats);
        } catch {
          // ignore
        }
      });

      this.eventSource.addEventListener('state', (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.state) {
            this.callbacks.onStateChange(data.state);
          }
        } catch {
          // ignore
        }
      });

      this.eventSource.onerror = () => {
        // Lost SSE connection; re-check health
        this.disconnectRealEvents();
      };
    } catch {
      // ignore
    }
  }

  private disconnectRealEvents() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  public async start(): Promise<void> {
    if (this.mode === 'REAL') {
      try {
        const res = await fetch(`${BACKEND_URL}/api/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.config),
        });
        const data = await res.json();
        if (!res.ok) {
          this.callbacks.onLog(createLog(`[!] Error al iniciar minería: ${data.message}`, 'error'));
          this.callbacks.onStateChange('ERROR');
        }
      } catch (err) {
        this.callbacks.onLog(createLog(`[!] Falló la conexión con el backend local: ${err}`, 'error'));
        this.callbacks.onStateChange('ERROR');
      }
    } else {
      // Simulated
      this.simulatedEngine.start();
    }
  }

  public async stop(): Promise<void> {
    if (this.mode === 'REAL') {
      try {
        await fetch(`${BACKEND_URL}/api/stop`, { method: 'POST' });
      } catch {
        // ignore
      }
    } else {
      this.simulatedEngine.stop();
    }
  }

  public async fetchSavedConfig(): Promise<{ wallet: string; pool: string; rigId?: string } | null> {
    try {
      const res = await fetch(`${BACKEND_URL}/api/config`);
      if (res.ok) {
        const data = await res.json();
        if (data.wallet && this.callbacks.onConfigLoaded) {
          this.callbacks.onConfigLoaded(data);
        }
        return data;
      }
    } catch {
      // ignore
    }
    return null;
  }

  public destroy() {
    this.stopHealthMonitoring();
    this.disconnectRealEvents();
    this.simulatedEngine.stop();
  }
}
