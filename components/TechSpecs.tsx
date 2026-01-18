import React from 'react';

interface TechSpecsProps {
  onBack: () => void;
}

const TechSpecs: React.FC<TechSpecsProps> = ({ onBack }) => {
  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="bg-indigo-500/20 text-indigo-400 p-2.5 rounded-lg border border-indigo-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.64c-.166.132-.331.149-.453.077L6.05 5.215a1.875 1.875 0 00-2.47 2.47l.74 1.264c.072.122.055.287-.077.453-.195.244-.413.575-.64.986-.089.182-.228.277-.349.297L1.917 10.85a1.875 1.875 0 000 3.75l1.264.168c.12.02.26.115.348.297.227.411.445.742.64.986.132.166.149.331.077.453l-.74 1.264a1.875 1.875 0 002.47 2.47l1.264-.74c.122-.072.287-.055.453.077.244.195.575.413.986.64.182.089.277.228.297.349L12.922 2.25a1.875 1.875 0 00-3.75 0v-.001zM12 9a3 3 0 100 6 3 3 0 000-6z" clipRule="evenodd" />
              </svg>
            </span>
            Documentation Technique Gemini Live
          </h2>
          <p className="text-slate-400 text-sm mt-2 font-mono">
            API Reference: @google/genai | Protocol: WebSocket (Bidirectional Streaming)
          </p>
        </div>
        <button 
          onClick={onBack}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-600 hover:border-indigo-500/50 transition-all text-sm font-semibold shadow-lg"
        >
          Retour à l'app
        </button>
      </div>

      <div className="space-y-12">

        {/* SECTION 1: CORE CONFIGURATION */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-indigo-300 border-l-4 border-indigo-500 pl-3">
            1. Configuration du Noyau (Core Config)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-6">
              <h4 className="text-white font-semibold mb-4">Modèle & Connexion</h4>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="space-y-1">
                  <div className="flex justify-between font-mono text-xs text-slate-500 uppercase">Target Model</div>
                  <div className="font-mono bg-slate-900 px-3 py-1.5 rounded text-cyan-400 border border-slate-700/50">
                    gemini-2.5-flash-native-audio-preview-09-2025
                  </div>
                  <p className="text-slate-400 text-xs italic">Modèle multimodal natif optimisé pour la latence ultra-faible.</p>
                </li>
                <li className="space-y-1">
                  <div className="flex justify-between font-mono text-xs text-slate-500 uppercase">Modalités de Réponse</div>
                  <div className="font-mono bg-slate-900 px-3 py-1.5 rounded text-yellow-400 border border-slate-700/50">
                    responseModalities: [Modality.AUDIO]
                  </div>
                  <p className="text-slate-400 text-xs italic">Note: Mutuellement exclusif avec TEXT. L'audio est prioritaire.</p>
                </li>
              </ul>
            </div>

            <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-6">
              <h4 className="text-white font-semibold mb-4">Thinking Config (Raisonnement)</h4>
              <div className="space-y-4">
                 <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700 font-mono text-xs text-purple-300 overflow-x-auto">
{`config: {
  thinkingConfig: { 
    thinkingBudget: number 
  }
}`}
                 </div>
                 <p className="text-sm text-slate-300 leading-relaxed">
                   Le <span className="text-white font-semibold">Thinking Budget</span> alloue un nombre de tokens (jusqu'à ~24k pour Flash 2.5) permettant au modèle de générer une chaîne de pensée interne avant de produire la réponse audio.
                 </p>
                 <ul className="text-xs text-slate-400 list-disc pl-4 space-y-1">
                   <li><strong className="text-slate-200">Budget 0 :</strong> Réponse quasi-instantanée, raisonnement réflexe.</li>
                   <li><strong className="text-slate-200">Budget Max :</strong> Capacité à résoudre des problèmes complexes, mathématiques ou logique, au prix d'une latence accrue.</li>
                 </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: AUDIO PIPELINE */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-green-300 border-l-4 border-green-500 pl-3">
            2. Pipeline Audio & Voix
          </h3>
          <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               
               {/* Input Spec */}
               <div className="space-y-2">
                 <h4 className="text-white font-semibold text-sm uppercase tracking-wider border-b border-slate-700 pb-2">Entrée (Input)</h4>
                 <div className="font-mono text-xs text-slate-300 space-y-2">
                    <div className="flex justify-between"><span>Format:</span> <span className="text-green-400">PCM 16-bit</span></div>
                    <div className="flex justify-between"><span>Sample Rate:</span> <span className="text-green-400">16,000 Hz</span></div>
                    <div className="flex justify-between"><span>Channels:</span> <span className="text-green-400">1 (Mono)</span></div>
                    <div className="flex justify-between"><span>Transport:</span> <span className="text-green-400">WebSocket / Blob</span></div>
                 </div>
                 <p className="text-xs text-slate-500 mt-2">
                   Le client doit envoyer des chunks audio bruts via <code>session.sendRealtimeInput()</code>.
                 </p>
               </div>

               {/* Output Spec */}
               <div className="space-y-2">
                 <h4 className="text-white font-semibold text-sm uppercase tracking-wider border-b border-slate-700 pb-2">Sortie (Output)</h4>
                 <div className="font-mono text-xs text-slate-300 space-y-2">
                    <div className="flex justify-between"><span>Format:</span> <span className="text-blue-400">PCM 16-bit</span></div>
                    <div className="flex justify-between"><span>Sample Rate:</span> <span className="text-blue-400">24,000 Hz</span></div>
                    <div className="flex justify-between"><span>Channels:</span> <span className="text-blue-400">1 (Mono)</span></div>
                    <div className="flex justify-between"><span>Header:</span> <span className="text-red-400">Aucun (Raw)</span></div>
                 </div>
                 <p className="text-xs text-slate-500 mt-2">
                   L'audio reçu ne contient pas d'en-tête WAV. Il doit être décodé manuellement via <code>AudioContext</code>.
                 </p>
               </div>

               {/* Voice Config */}
               <div className="space-y-2">
                 <h4 className="text-white font-semibold text-sm uppercase tracking-wider border-b border-slate-700 pb-2">Voix Disponibles</h4>
                 <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
                    <code className="text-xs text-green-300 block mb-2">voiceConfig.prebuiltVoiceConfig.voiceName</code>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-400">
                      <span className="text-green-400 font-bold" title="Voix féminine équilibrée - Recommandée pour français">Kore ⭐</span>
                      <span className="hover:text-white cursor-help" title="Voix masculine douce (anglophone)">Puck</span>
                      <span className="hover:text-white cursor-help" title="Voix masculine grave (anglophone)">Charon</span>
                      <span className="hover:text-white cursor-help" title="Voix masculine intense (anglophone)">Fenrir</span>
                      <span className="hover:text-white cursor-help" title="Voix féminine calme (anglophone)">Zephyr</span>
                    </div>
                    <p className="text-xs text-amber-400 mt-2 italic">⚠️ Note: Toutes les voix sont anglophones natives. Kore offre la meilleure adaptation au français.</p>
                 </div>
               </div>

             </div>
          </div>
        </section>

        {/* SECTION 3: ADVANCED INTERACTION */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-orange-300 border-l-4 border-orange-500 pl-3">
            3. Interactions Avancées & Outils
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* System Instructions */}
            <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-6">
              <h4 className="text-white font-semibold mb-3">System Instruction</h4>
              <p className="text-sm text-slate-300 mb-4">
                Définit la persona, le ton, et les contraintes de sécurité du modèle. C'est le "prompt racine".
              </p>
              <div className="bg-slate-900 p-4 rounded-lg border border-slate-700/80 relative group">
                <div className="absolute top-2 right-2 text-[10px] text-slate-500 font-mono uppercase">Current Value</div>
                <code className="text-xs font-mono text-orange-200 block leading-relaxed">
                  "Tu es une IA sophistiquée, experte et perspicace. Tu parles français. Tes réponses sont intelligentes, nuancées et vont droit au but..."
                </code>
              </div>
            </div>

            {/* Function Calling */}
            <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-6">
              <h4 className="text-white font-semibold mb-3">Tools & Function Calling</h4>
              <p className="text-sm text-slate-300 mb-4">
                Permet au modèle d'interagir avec l'application (ex: allumer une lumière, chercher sur le web).
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded border border-slate-700">
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-900/20 px-1.5 py-0.5 rounded">tools</span>
                  <span className="text-xs text-slate-400">Tableau de <code>FunctionDeclaration</code></span>
                </div>
                <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded border border-slate-700">
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-900/20 px-1.5 py-0.5 rounded">toolConfig</span>
                  <span className="text-xs text-slate-400">Configuration d'exécution (Auto vs Any)</span>
                </div>
                <p className="text-xs text-slate-500 italic mt-2">
                  Workflow: Le modèle envoie un <code>toolCall</code> via WebSocket {'->'} Le client exécute le JS {'->'} Le client renvoie un <code>toolResponse</code>.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 4: DEBUG & DATA */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-pink-300 border-l-4 border-pink-500 pl-3">
            4. Transcriptions & Logs
          </h3>
          <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-6">
            <p className="text-sm text-slate-300 mb-4">
              Puisque l'audio est opaque, ces options permettent de recevoir le texte équivalent en temps réel pour l'interface utilisateur.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-700 rounded p-3 bg-slate-900/30">
                <div className="font-mono text-sm text-pink-400 mb-1">inputAudioTranscription</div>
                <div className="text-xs text-slate-400">
                  Si configuré à <code>{`{}`}</code>, le serveur renvoie la transcription de ce que l'utilisateur dit (Speech-to-Text).
                </div>
              </div>
              <div className="border border-slate-700 rounded p-3 bg-slate-900/30">
                <div className="font-mono text-sm text-pink-400 mb-1">outputAudioTranscription</div>
                <div className="text-xs text-slate-400">
                  Si configuré à <code>{`{}`}</code>, le serveur renvoie le texte généré par le modèle synchronisé avec l'audio.
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700">
              <h5 className="text-xs font-semibold text-slate-200 mb-2 uppercase tracking-wide">Événements WebSocket</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono text-slate-400">
                 <span className="bg-slate-900 px-2 py-1 rounded border border-slate-700">serverContent</span>
                 <span className="bg-slate-900 px-2 py-1 rounded border border-slate-700">toolCall</span>
                 <span className="bg-slate-900 px-2 py-1 rounded border border-slate-700">toolResponse</span>
                 <span className="bg-slate-900 px-2 py-1 rounded border border-slate-700 text-red-400">interrupted</span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default TechSpecs;