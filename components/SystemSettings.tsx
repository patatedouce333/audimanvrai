
import React from 'react';

interface SystemSettingsProps {
  instruction: string;
  onInstructionChange: (val: string) => void;
  onClose: () => void;
}

const SystemSettings: React.FC<SystemSettingsProps> = ({ 
  instruction, 
  onInstructionChange,
  onClose 
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto p-8 space-y-8 animate-in fade-in zoom-in-95 duration-300">
      
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Core Directives</h2>
        <button 
          onClick={onClose}
          className="p-2 text-slate-500 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Protocole Système (Gemini 2.5 Flash)</label>
        <textarea
          value={instruction}
          onChange={(e) => onInstructionChange(e.target.value)}
          className="w-full h-80 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-sm text-slate-200 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all resize-none font-mono leading-relaxed shadow-inner"
          placeholder="Entrez les ordres de l'Oracle..."
        />
      </div>

      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6">
        <h3 className="text-xs font-bold text-emerald-400 uppercase mb-2">Statut de l'IA</h3>
        <p className="text-[10px] text-slate-500 leading-loose">
          Le modèle est configuré en mode <span className="text-emerald-300">Natif Audio</span>. Il dispose d'un budget de réflexion de <span className="text-emerald-300">24k tokens</span> et d'un accès illimité à <span className="text-emerald-300">Google Search</span>. Le protocole de barge-in est forcé au niveau du noyau.
        </p>
      </div>
      
      <button 
        onClick={onClose}
        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-black font-black uppercase tracking-widest rounded-2xl shadow-2xl transition-all transform active:scale-95"
      >
        Déployer les Directives
      </button>
    </div>
  );
};

export default SystemSettings;
