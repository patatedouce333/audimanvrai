
import React from 'react';
import { AppLog } from '../hooks/useLiveAudio';
import { copyToClipboard } from '../utils/clipboardUtils';

interface MonitoringPanelProps {
  logs: AppLog[];
  onClear: () => void;
  onClose: () => void;
}

const MonitoringPanel: React.FC<MonitoringPanelProps> = ({ logs, onClear, onClose }) => {
  const handleCopyLogs = async () => {
    if (logs.length === 0) {
      alert("Aucun log à copier.");
      return;
    }
    const text = logs.map(l => `[${new Date(l.timestamp).toLocaleTimeString()}] [${l.type.toUpperCase()}] ${l.message} ${l.data ? JSON.stringify(l.data) : ''}`).join('\n');
    const success = await copyToClipboard(text);
    if (success) {
      alert('Logs d\'activité copiés dans le presse-papier.');
    } else {
      alert('Erreur lors de la copie des logs.');
    }
  };

  return (
    <div className="flex flex-col h-full text-slate-300 font-mono text-[10px]">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500">Log Moniteur d'Activité</h3>
        </div>
        <div className="flex gap-4">
          <button onClick={handleCopyLogs} className="hover:text-white flex items-center gap-1 uppercase tracking-widest text-[8px] font-bold">
             Copier Logs
          </button>
          <button onClick={onClear} className="hover:text-white flex items-center gap-1 uppercase tracking-widest text-[8px] font-bold">
             Effacer
          </button>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-[#020202]">
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center opacity-20 italic">
            Aucun événement enregistré.
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="group border-b border-slate-900 pb-2 animate-in fade-in slide-in-from-left-2 duration-300">
              <div className="flex items-start gap-4">
                <span className="opacity-30 whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                <span className={`uppercase font-bold tracking-widest w-12 ${
                  log.type === 'error' ? 'text-red-500' : 
                  log.type === 'tool' ? 'text-amber-500' : 
                  log.type === 'success' ? 'text-emerald-500' : 'text-blue-500'
                }`}>
                  {log.type}
                </span>
                <div className="flex-1 space-y-1">
                  <p className={`${log.type === 'error' ? 'text-red-400' : 'text-slate-200'}`}>{log.message}</p>
                  {log.data && (
                    <pre className="mt-2 p-2 bg-slate-900/50 rounded border border-slate-800 text-[9px] text-slate-500 overflow-x-auto whitespace-pre-wrap max-h-40">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MonitoringPanel;
