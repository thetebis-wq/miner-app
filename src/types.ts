export type MinerState = 'STOPPED' | 'CONNECTING' | 'MINING' | 'ERROR';

export type EngineMode = 'REAL' | 'SIMULATED';

export interface BackendHealth {
  status: string;
  version: string;
  engineExists: boolean;
  state: MinerState;
  stats: TelemetryStats;
  savedConfig?: {
    wallet: string;
    pool: string;
    rigId?: string;
  };
}

export interface PoolConfig {
  algo?: string | null;
  coin?: string | null;
  url: string;
  user: string;
  pass: string | null;
  'rig-id': string | null;
  nicehash: boolean;
  keepalive: boolean;
  enabled: boolean;
  tls: boolean;
  sni: boolean;
  'tls-fingerprint': string | null;
  daemon: boolean;
  socks5: string | null;
  'self-select': string | null;
  'submit-to-origin': boolean;
}

export interface AdvancedMinerConfig {
  wallet: string;
  pool: string;
  threadsHint: number;
  hugePages: boolean;
  tlsEnabled: boolean;
  donateLevel: number;
  printTime: number;
  cpuPriority: number;
  randomxMode: string;
  rigId: string;
}

export interface TelemetryStats {
  hashrate10s: number;
  hashrate60s: number;
  hashrate15m: number;
  acceptedShares: number;
  rejectedShares: number;
  difficulty: number;
  pingMs: number;
  uptimeSeconds: number;
  cpuUsage: number;
  activeThreads: number;
  totalHashes: number;
  estEarningsXmrPerDay: number;
}

export interface TerminalLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'net' | 'cpu' | 'speed';
  message: string;
}
