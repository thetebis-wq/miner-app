import { AdvancedMinerConfig, TelemetryStats, TerminalLog } from '../types';

export function getFormattedTime(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const ms = d.getMilliseconds().toString().padStart(3, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${ms}`;
}

export function createLog(
  message: string,
  type: TerminalLog['type'] = 'info'
): TerminalLog {
  return {
    id: Math.random().toString(36).substring(2, 9),
    timestamp: getFormattedTime(),
    type,
    message,
  };
}

export class SimulatedMinerEngine {
  private config: AdvancedMinerConfig;
  private onLog: (log: TerminalLog) => void;
  private onStats: (stats: TelemetryStats) => void;
  private onStateChange: (state: 'CONNECTING' | 'MINING' | 'ERROR' | 'STOPPED') => void;
  
  private isRunning = false;
  private startTime = 0;
  private timer: number | null = null;
  private statsTimer: number | null = null;
  private shareCounter = 0;
  private rejectedCounter = 0;
  private baseHashrate = 0;
  private totalHashes = 0;

  constructor(
    config: AdvancedMinerConfig,
    callbacks: {
      onLog: (log: TerminalLog) => void;
      onStats: (stats: TelemetryStats) => void;
      onStateChange: (state: 'CONNECTING' | 'MINING' | 'ERROR' | 'STOPPED') => void;
    }
  ) {
    this.config = config;
    this.onLog = callbacks.onLog;
    this.onStats = callbacks.onStats;
    this.onStateChange = callbacks.onStateChange;
  }

  public updateConfig(newConfig: AdvancedMinerConfig) {
    this.config = newConfig;
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.startTime = Date.now();
    this.shareCounter = 0;
    this.rejectedCounter = 0;
    this.totalHashes = 0;

    // Calculate base hashrate based on hardware threads hint (typical laptop 2.5kH/s to 4.5kH/s)
    const hardwareCores = 8;
    const threadCount = Math.max(1, Math.round((hardwareCores * this.config.threadsHint) / 100));
    this.baseHashrate = threadCount * 520 + (Math.random() * 80 - 40);

    this.onStateChange('CONNECTING');
    this.onLog(createLog(`[*] MinerApp v2.2 - Iniciando protocolo de seguridad...`, 'info'));
    this.onLog(createLog(`[cpu] Detected hardware: AMD Ryzen / Intel Core x86_64, ${hardwareCores} logical processors`, 'cpu'));
    this.onLog(createLog(`[cpu] CPU affinity: enabled (${threadCount} threads configured from hint ${this.config.threadsHint}%)`, 'cpu'));
    
    if (this.config.hugePages) {
      this.onLog(createLog(`[cpu] HUGE PAGES: available, enabled (100% 1GB memory pages allocated)`, 'cpu'));
      this.onLog(createLog(`[cpu] MSR: register mod wrmsr 0xc0011020 0x0 succeeded`, 'cpu'));
    } else {
      this.onLog(createLog(`[cpu] HUGE PAGES: disabled by configuration`, 'warning'));
    }

    // Step 1: Simulated TLS connection
    setTimeout(() => {
      if (!this.isRunning) return;
      this.onLog(createLog(`[net] Connecting to ${this.config.pool} (${this.config.tlsEnabled ? 'TLS 1.3' : 'plain TCP'})...`, 'net'));
      
      setTimeout(() => {
        if (!this.isRunning) return;
        this.onLog(createLog(`[net] Connected to ${this.config.pool} via TLS/SSL handshake OK`, 'success'));
        this.onLog(createLog(`[net] Pool session authenticated for wallet: ${this.config.wallet.substring(0, 10)}...${this.config.wallet.substring(this.config.wallet.length - 8)}`, 'net'));
        this.onLog(createLog(`[randomx] init dataset algo rx/0 (${threadCount} threads) seed 4f981a...`, 'info'));
        this.onLog(createLog(`[randomx] dataset ready (2080 MB allocated in 1.4s)`, 'success'));
        this.onLog(createLog(`[net] new job from ${this.config.pool} diff 100000 algo rx/0 height 3128490`, 'net'));

        this.onStateChange('MINING');
        this.startMiningLoops(threadCount);
      }, 1000);
    }, 600);
  }

  private startMiningLoops(threadCount: number) {
    // Stat updates every second
    this.statsTimer = window.setInterval(() => {
      if (!this.isRunning) return;
      const uptime = Math.floor((Date.now() - this.startTime) / 1000);
      const jitter = (Math.random() - 0.5) * 60;
      const currentH = Math.max(100, this.baseHashrate + jitter);
      this.totalHashes += currentH;

      const stats: TelemetryStats = {
        hashrate10s: Math.round(currentH),
        hashrate60s: Math.round(currentH * 0.98),
        hashrate15m: Math.round(currentH * 0.96),
        acceptedShares: this.shareCounter,
        rejectedShares: this.rejectedCounter,
        difficulty: 100000,
        pingMs: Math.round(35 + Math.random() * 20),
        uptimeSeconds: uptime,
        cpuUsage: Math.min(99, Math.round(this.config.threadsHint * 0.95 + Math.random() * 4)),
        activeThreads: threadCount,
        totalHashes: Math.round(this.totalHashes),
        // Est ~0.000085 XMR / kH/s / day at typical difficulty
        estEarningsXmrPerDay: Number(((currentH / 1000) * 0.000085).toFixed(6)),
      };
      this.onStats(stats);
    }, 1000);

    // Simulated share submission & speed logs
    let tickCount = 0;
    this.timer = window.setInterval(() => {
      if (!this.isRunning) return;
      tickCount++;

      // Speed log every ~15 seconds (matching print-time)
      if (tickCount % 3 === 0) {
        const jitter = (Math.random() - 0.5) * 40;
        const currentSpeed = (this.baseHashrate + jitter).toFixed(1);
        this.onLog(
          createLog(
            `speed 10s/60s/15m ${currentSpeed} ${currentSpeed} n/a H/s max ${(this.baseHashrate + 120).toFixed(1)} H/s`,
            'speed'
          )
        );
      }

      // Share finding event
      if (Math.random() > 0.45) {
        this.shareCounter++;
        const ping = Math.round(38 + Math.random() * 25);
        this.onLog(
          createLog(
            `accepted (${this.shareCounter}/${this.rejectedCounter}) diff 100000 (${ping} ms)`,
            'success'
          )
        );
      } else if (Math.random() < 0.2) {
        this.onLog(
          createLog(
            `[net] new job from ${this.config.pool} diff 100000 algo rx/0 height ${3128490 + tickCount}`,
            'net'
          )
        );
      }
    }, 5000);
  }

  public stop() {
    this.isRunning = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.statsTimer) {
      clearInterval(this.statsTimer);
      this.statsTimer = null;
    }
    this.onLog(createLog(`[*] Deteniendo minería de forma segura...`, 'warning'));
    this.onLog(createLog(`[cpu] Mining threads halted, memory deallocated`, 'cpu'));
    this.onLog(createLog(`[net] Connection to ${this.config.pool} closed cleanly`, 'net'));
    this.onStateChange('STOPPED');
  }
}
