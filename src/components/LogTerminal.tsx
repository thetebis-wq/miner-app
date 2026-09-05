import React, { useRef, useEffect, useState } from 'react';
import { TerminalLog } from '../types';
import { Terminal, Search, ArrowDownCircle, ShieldCheck } from 'lucide-react';

interface LogTerminalProps {
  logs: TerminalLog[];
}

export const LogTerminal: React.FC<LogTerminalProps> = ({ logs }) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const filteredLogs = filter
    ? logs.filter((l) =>
        l.message.toLowerCase().includes(filter.toLowerCase()) ||
        l.timestamp.includes(filter)
      )
    : logs;

  const renderMessage = (msg: string, type: TerminalLog['type']) => {
    // Highlight syntax
    if (msg.includes('accepted')) {
      return <span className="text-emerald-400 font-bold">{msg}</span>;
    }
    if (msg.includes('speed')) {
      return <span className="text-cyan-300 font-semibold">{msg}</span>;
    }
    if (msg.startsWith('[cpu]')) {
      return (
        <>
          <span className="text-blue-400 font-semibold">[cpu]</span>
          <span className="text-slate-200">{msg.substring(5)}</span>
        </>
      );
    }
    if (msg.startsWith('[net]')) {
      return (
        <>
          <span className="text-purple-400 font-semibold">[net]</span>
          <span className="text-slate-200">{msg.substring(5)}</span>
        </>
      );
    }
    if (msg.startsWith('[randomx]')) {
      return (
        <>
          <span className="text-amber-400 font-semibold">[randomx]</span>
          <span className="text-slate-200">{msg.substring(9)}</span>
        </>
      );
    }
    if (msg.startsWith('[!]')) {
      return <span className="text-rose-400 font-semibold">{msg}</span>;
    }
    if (msg.startsWith('[*]')) {
      return <span className="text-cyan-400">{msg}</span>;
    }

    switch (type) {
      case 'success':
        return <span className="text-emerald-300">{msg}</span>;
      case 'warning':
        return <span className="text-amber-300">{msg}</span>;
      case 'error':
        return <span className="text-rose-400">{msg}</span>;
      default:
        return <span className="text-slate-300">{msg}</span>;
    }
  };

  return (
    <div
      id="miner-log-terminal"
      className="flex flex-col h-[380px] rounded-xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden"
    >
      {/* Terminal Titlebar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs select-none">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-600"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-600"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-600"></div>
          </div>
          <span className="font-mono font-medium text-slate-400 flex items-center gap-1.5 ml-2">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            Consola de Salida del Motor (XMRig Async Threading)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter box */}
          <div className="relative">
            <Search className="w-3 h-3 text-slate-500 absolute left-2 top-2" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filtrar logs..."
              className="pl-7 pr-2 py-0.5 text-[11px] bg-slate-950 border border-slate-700/60 rounded text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 w-32 sm:w-44 font-mono"
            />
          </div>

          <button
            type="button"
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1 rounded text-[11px] flex items-center gap-1 transition-colors ${
              autoScroll
                ? 'text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 border border-cyan-800/50'
                : 'text-slate-500 hover:text-slate-400'
            }`}
            title={autoScroll ? 'Auto-scroll activado' : 'Auto-scroll pausado'}
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="flex-1 p-3.5 font-mono text-[11px] leading-relaxed overflow-y-auto space-y-1 select-text">
        {filteredLogs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-600 italic">
            Esperando inicio del motor de minería...
          </div>
        ) : (
          filteredLogs.map((l) => (
            <div key={l.id} className="flex items-start gap-2 hover:bg-slate-900/40 px-1 py-0.5 rounded">
              <span className="text-slate-600 flex-shrink-0 select-none text-[10px]">
                [{l.timestamp.split(' ')[1]}]
              </span>
              <div className="flex-1 break-all">
                {renderMessage(l.message, l.type)}
              </div>
            </div>
          ))
        )}
        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Footer */}
      <div className="px-4 py-1.5 bg-slate-900/80 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between font-mono">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          Protocolo seguro activo (TLS/SSL puerto 443)
        </span>
        <span>
          Total líneas: {logs.length} {filter && `(filtradas: ${filteredLogs.length})`}
        </span>
      </div>
    </div>
  );
};
