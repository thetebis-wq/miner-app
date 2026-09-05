import React, { useState } from 'react';
import { AdvancedMinerConfig } from '../types';
import { generateFullXmrigConfig } from '../data/defaultConfig';
import { X, Copy, Download, Check, FileCode, Terminal } from 'lucide-react';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AdvancedMinerConfig;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  config,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  if (!isOpen) return null;

  const fullJson = JSON.stringify(generateFullXmrigConfig(config), null, 4);

  const commandLine = `xmrig.exe -o ${config.pool || 'pool.supportxmr.com:443'} -u ${config.wallet || 'TU_BILLETERA'} -p ${config.rigId || 'laptop'} ${config.tlsEnabled ? '--tls' : ''} --max-threads-hint=${config.threadsHint}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(commandLine);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([fullJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="config-export-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <FileCode className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-white font-mono">
                Generador de config.json para XMRig
              </h3>
              <p className="text-xs text-slate-400">
                Preserva las 139 líneas de optimizaciones nativas de hardware
              </p>
            </div>
          </div>
          <button
            id="btn-close-config-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {/* Quick Command */}
          <div className="p-3.5 bg-slate-950/90 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 font-mono">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                Comando Rápido para Ejecutar en Windows / Linux:
              </span>
              <button
                type="button"
                onClick={handleCopyCmd}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-mono"
              >
                {copiedCmd ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedCmd ? 'Copiado' : 'Copiar comando'}
              </button>
            </div>
            <pre className="p-2.5 bg-black/60 rounded border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto select-all">
              {commandLine}
            </pre>
          </div>

          {/* JSON File Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 font-mono">
                Archivo config.json Completo:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  {copied ? 'Copiado al Portapapeles' : 'Copiar JSON'}
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white shadow-md transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar config.json
                </button>
              </div>
            </div>
            <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 max-h-[300px] overflow-y-auto leading-relaxed select-all">
              {fullJson}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 text-xs text-slate-400">
          <span>Coloca este archivo en el mismo directorio que <code className="text-cyan-400">xmrig.exe</code></span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
