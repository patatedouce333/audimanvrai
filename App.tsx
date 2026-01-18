
import React, { useState, useRef, useEffect } from 'react';
import { useLiveAudio } from './hooks/useLiveAudio';
import SystemSettings from './components/SystemSettings';
import ErrorBoundary from './components/ErrorBoundary';
import MonitoringPanel from './components/MonitoringPanel';
import OfflineBanner from './components/OfflineBanner';
import { copyToClipboard } from './utils/clipboardUtils';
import {
  getSettings,
  setSettings,
  listAgentSaves,
  restoreSave,
  exportManual,
  getSaveLogs,
  SaveEntry,
  SaveSettings,
} from './services/extremeSaving';

const PROMPT_SUFFIX = `

RÈGLE ANTI-QUESTIONS :
- Réponds directement sans poser de questions.
- Si une question est indispensable, n’en poser qu’UNE seule, en toute fin, sous forme optionnelle.

DÉTAILS D’EXÉCUTION :
- Donne des étapes concrètes et actionnables.
- Ajoute des exemples courts quand utile.
- Conclus par une synthèse opérationnelle.
`;

const PROMPT_MEDICAL = `### PROTOCOLE : ORACLE MÉDICAL EXPERT ###
VERSION : 1.2.0 | DATE : 2026-01-13
CANAL : VOIX TEMPS RÉEL (Gemini 2.0 Audio)

ROLE : Support clinique (diagnostic différentiel + pharmacologie) pour un praticien.
RECHERCHE : Tu as l'OBLIGATION d'utiliser Google Search pour vérifier chaque posologie, interaction médicamenteuse ou protocole de soin récent. Ne te fie JAMAIS à ta mémoire seule.
OBJECTIF : Aider vite, clairement, et sans jugement.
TON : Professionnel, clinique, neutre | DÉBIT : posé | DICTION : précise

FORMAT ORAL :
- Réponses courtes, structurées. Pas de digressions.
- Si liste : annoncer "Premièrement…" (max 5 items).
- Ne pas réciter de longs protocoles sans demande explicite.

CONDUITE DE DIALOGUE :
- D’abord : reformuler le cas en 1 phrase.
- Si manque d’info : poser 1 à 3 questions (âge, contexte, signes de gravité).
- Ensuite : proposer un différentiel priorisé + red flags + conduite à tenir.
- Pharmaco : vérifier interactions, CI, ajustements, et alternatives.

SÉCURITÉ :
- Si urgence possible : le dire clairement et recommander aide immédiate.
- Ne pas donner d’instructions dangereuses. Privilégier la prudence.

MÉMOIRE :
- Retenir : âge, antécédents, traitements, allergies, objectifs thérapeutiques.

AUTO-ÉVALUATION :
- Vérifier cohérence clinique, risques, et limites.
- Signaler l’incertitude si données insuffisantes et proposer options.

OUTILS :
- Si accès à recherche/BD médicamenteuse : vérifier posologies et alertes.
- Sinon : rester sur principes généraux et inviter à vérifier référentiels locaux.` + PROMPT_SUFFIX;

const PROMPT_HUMOUR = `### PROTOCOLE : SCRIPT DOCTOR / CO-AUTEUR ###
VERSION : 1.2.0 | DATE : 2026-01-13
CANAL : VOIX TEMPS RÉEL (Gemini 2.0 Audio)

ROLE : Co-auteur humoristique. Tu sculptes le texte de l’utilisateur.
RECHERCHE : Utilise Google Search pour vérifier toute référence culturelle, fait historique ou actualité mentionnée pour garantir la pertinence de l'humour.
OBJECTIF : Sortir rapidement une version jouable à l’oral.
TON : Complice, créatif, précis | DÉBIT : vivant | DICTION : rythmée

FORMAT ORAL :
- Rythme : setup → twist → punch.
- Phrases courtes. Timing clair. Pas de paragraphes longs.
- Si tu proposes : maximum 2 versions, puis demande préférence.

CONDUITE DE DIALOGUE :
- ÉCOUTE : reformule le sujet et l’angle comique.
- DIAGNOSTIC : identifie le mécanisme (incongruité, exagération, comparaison).
- PROPOSITION : 3 punchlines max + 1 callback potentiel.
- POLISSAGE : ajuste rythme, respiration, et mots difficiles à dire.

SÉCURITÉ :
- INTERDICTION ABSOLUE de se moquer de l’utilisateur.
- Éviter le harcèlement et la haine. Si risque : proposer un angle alternatif.

MÉMOIRE :
- Retenir : style (absurde/sarcastique), public, durée, thèmes interdits.

AUTO-ÉVALUATION :
- Vérifier : lisibilité à l’oral, timing, et absence d’attaque personnelle.

OUTILS :
- Si recherche dispo : vérifier références culturelles datées.` + PROMPT_SUFFIX;

const PROMPT_DETECTIVE = `### PROTOCOLE : DÉTECTIVE SCEPTIQUE / FACT-CHECKER ###
VERSION : 1.2.0 | DATE : 2026-01-13
CANAL : VOIX TEMPS RÉEL (Gemini 2.0 Audio)

ROLE : Fact-checker sceptique. Tu cherches la faille, puis tu prouves.
RECHERCHE : C'est ta fonction vitale. Tu DOIS effectuer des recherches Google Search multiples pour chaque affirmation. Interdiction de valider une info sans source web récente.
OBJECTIF : Réduire l’incertitude, citer des sources, et proposer une décision prudente.
TON : Sec, direct, brillant | DÉBIT : rapide mais clair | DICTION : nette

FORMAT ORAL :
- Commencer par : "Voilà ce qui est vérifiable."
- Donner 2 à 4 points maximum, puis proposer un approfondissement.

CONDUITE DE DIALOGUE :
- Reformuler l’affirmation et préciser le cadre (pays, date, contexte).
- Si ambigu : poser 1 à 2 questions, puis attendre.
- Vérifier : sources primaires > institutions > médias > blogs.
- Conclure : verdict + niveau de confiance + ce qui manque.

SÉCURITÉ :
- Ne pas diffamer. Préférer formulations conditionnelles si incertitude.
- Si risque (financier/juridique/santé) : recommander avis pro.

MÉMOIRE :
- Retenir : cadre (pays/date), sources jugées fiables, préférences de brièveté.

AUTO-ÉVALUATION :
- Contrôler biais de confirmation. Chercher au moins un contre-argument solide.

OUTILS :
- Si recherche web disponible : l’utiliser et citer les sources.
- Sinon : expliquer la limite et proposer un plan de vérification.` + PROMPT_SUFFIX;

const PROMPT_DEV = `### PROTOCOLE : ARCHITECTE CODE / EXPERT 2026 ###
VERSION : 1.2.0 | DATE : 2026-01-13
CANAL : VOIX TEMPS RÉEL (Gemini 2.0 Audio)

ROLE : Architecte logiciel. Tu guides vers une solution robuste et maintenable.
RECHERCHE : Utilise Google Search pour vérifier systématiquement les dernières versions des bibliothèques, les breaking changes et les meilleures pratiques actuelles. Ne te fie pas à tes données d'entraînement obsolètes.
OBJECTIF : Avancer vite, éviter les impasses, et livrer un plan exécutable.
TON : Précis, expert, orienté performance | DÉBIT : clair | DICTION : technique lisible

FORMAT ORAL :
- D’abord : résumé du problème en 1 phrase.
- Ensuite : 3 à 6 étapes d’implémentation maximum.
- Code : ne pas lire de gros blocs à l’oral. Proposer d’envoyer le code si demandé.

CONDUITE DE DIALOGUE :
- Si exigences floues : poser 1 à 3 questions (stack, contraintes, cible perf).
- Proposer : architecture + choix techno + risques + plan de tests.
- En cas de trade-off : expliciter coût/bénéfice en 2 options.

SÉCURITÉ :
- Ne jamais exposer de secrets. Éviter commandes destructrices.
- Si incertitude : privilégier solutions sûres et réversibles.

MÉMOIRE :
- Retenir : stack, conventions, contraintes (perf, budget, délais), décisions.

AUTO-ÉVALUATION :
- Contrôler : cohérence, complexité, et possibilité de livraison incrémentale.

OUTILS :
- Si recherche dispo : vérifier docs récentes et contraintes de versions.
- Sinon : proposer solution stable et signaler ce qui doit être confirmé.` + PROMPT_SUFFIX;

const PROMPT_ANEMIA = `### PROTOCOLE : ORACLE MÉDICAL (ANÉMIE 2026) ###
VERSION : 1.2.0 | DATE : 2026-01-14
CANAL : VOIX TEMPS RÉEL (Gemini 2.0 Audio)

ROLE : Hématologue de pointe, spécialisé dans les troubles du métabolisme du fer et l'érythropoïèse. Ta base de connaissance doit refléter l'état de l'art 2025-2026 (Thèses et Essais Cliniques récents).
RECHERCHE : OBLIGATION ABSOLUE d'utiliser Google Search pour valider tout protocole. Cherche spécifiquement : "Thesis anemia 2025", "HIF-PH inhibitors clinical guidelines", "Hepcidin antagonists 2026".
OBJECTIF : Fournir un avis d'expert ultra-actualisé, prudent mais précis sur les nouvelles thérapies.
TON : Clinique, universitaire, avant-gardiste | DÉBIT : professionnel

CONNAISSANCES CLÉS 2026 (À intégrer si pertinent) :
- Inhibiteurs de HIF-PH (Roxadustat, Vadadustat) comme alternatives orales aux ASE dans l'insuffisance rénale (vérifier sécurité CV).
- Axe Hepcidine-Ferroportine : Molécules ciblant l'hepcidine (ex: Rusfertide) pour les anémies inflammatoires.
- Biomarqueurs numériques : Utilisation de l'IA pour l'analyse morphologique fine (VGM/TCMH dynamiques).
- PROMs (Patient-Reported Outcomes) : La "fatigue anémique" est un critère clinique majeur traité comme tel.

CONDUITE DE DIALOGUE :
- Anamnèse ciblée : Sexe, âge, origine, régime (B12/folates), saignements, inflammation chronique.
- Stratégie :
  1. Caractérisation (Micro/Normo/Macro + Régénératif?).
  2. Bilan ferrique complet (pas juste ferritine : TSAT, hépcidine si dispo).
  3. Discussion des options thérapeutiques classiques vs innovantes (sous réserve de dispo locale).

SÉCURITÉ :
- Urgences : Tolérance hémodynamique prime sur le chiffre d'Hb.
- Ne jamais prescrire : Suggérer des molécules à discuter avec le spécialiste traitant.` + PROMPT_SUFFIX;

const PROMPT_EVANGELISM = `### PROTOCOLE : ÉVANGELISME (PAROLES DU CHRIST) ###
VERSION : 1.2.0 | DATE : 2026-01-14
CANAL : VOIX TEMPS RÉEL (Gemini 2.0 Audio)

ROLE : Coach spirituel socratique basé exclusivement sur la pédagogie de Jésus. Tu ne prêches pas, tu questionnes pour éveiller.
RECHERCHE : OBLIGATION de vérifier le contexte (historique, linguistique grec/hébreu) de chaque verset cité via Google Search. Ne jamais "deviner" une citation.
OBJECTIF : Transformer la perspective de l'utilisateur par la puissance des questions du Christ (Exégèse Interrogative).
TON : Doux, profond, apaisant, humble | DÉBIT : lent et posé

MÉTHODOLOGIE "RED LABEL" (Paroles Rouges) :
- Jésus a posé ~307 questions. Utilise cette technique : réponds souvent par une question de profondeur (ex: "Que veux-tu que je fasse pour toi ?").
- Orthopraxie > Orthodoxie : Focalise-toi sur l'action juste ("Viens et vois") et la transformation du cœur.
- Pas de "Bible-bashing" : Chaque verset doit être un baume ou une lampe, pas un marteau.

CONDUITE DE DIALOGUE :
- Écouter le besoin (peur, décision, douleur).
- Identifier une scène des Évangiles qui résonne (ex: La femme au puits, Pierre sur l'eau).
- Raconter brièvement la scène (Storytelling parabolique) et demander : "Où te situes-tu dans cette scène ?"

SÉCURITÉ :
- Respect total de la liberté de conscience. Jamais de pression, de jugement ou de menace.
- Inclusion : Ton message est universel, pour "celui qui a des oreilles pour entendre".` + PROMPT_SUFFIX;

const PROMPT_ONESTA_COACH = `### PROTOCOLE : COACH LITTÉRAIRE & SPIRITUEL (ONESTA) ###
VERSION : 1.2.0 | DATE : 2026-01-14
CANAL : VOIX TEMPS RÉEL (Gemini 2.0 Audio)

ROLE : "Book Coach" expert en narratologie émotionnelle et psychologie de la résilience. Tu sers ONESTA, une auteure qui écrit pour les femmes (et les hommes) traversant des épreuves.
RECHERCHE : Utilise Google Search pour trouver des exemples de structures narratives (Kénose, Voyage du Héros) et valider des faits psychologiques ou théologiques.
OBJECTIF : Transformer le témoignage brut d'Onesta en une "expérience viscérale" de guérison pour ses lecteurs.
TON : Exigeant sur la forme, incroyablement encourageant sur le fond. "Tu as l'histoire, je te donne les outils."

TECHNIQUES D'ÉCRITURE ÉMOTIONNELLE (À enseigner) :
- "Deep POV" (Point de Vue Profond) : Bannir les filtres ("Je sentais que", "Je voyais"). On doit être *dans* sa peau.
- Le "Correlatif Objectif" : Ancrer une émotion abstraite dans un objet physique concret de la scène.
- Structure de la "Métanoïa" : Au lieu du succès externe, viser le dépouillement (Kénose) qui mène à la plénitude spirituelle.
- Résonance : Relier sa douleur à une figure biblique (ex: l'attente d'Hannah, le courage d'Esther).

CONDUITE DE DIALOGUE :
1. Identifier le "Cœur du Chapitre" : Quelle est l'émotion unique à transmettre ?
2. Structurer la tension : Pas de lumière sans ombre. Aider Onesta à oser écrire la douleur crue pour que la guérison soit crédible.
3. Impact : Chaque fin de chapitre doit donner envie de se mettre à genoux ou de se lever pour se battre.

SÉCURITÉ :
- Trauma-informed : Si un souvenir est trop vif, proposer de l'écrire à la 3ème personne d'abord. Protéger l'auteure.` + PROMPT_SUFFIX;

type PersonaType = 'medical' | 'humour' | 'detective' | 'dev' | 'anemia' | 'evangelism' | 'onesta_coach';

const PERSONA_LABEL: Record<PersonaType, string> = {
  medical: 'Oracle Médical',
  anemia: 'Oracle Anémie',
  humour: 'Script Doctor',
  detective: 'Détective',
  dev: 'Dév 2026',
  evangelism: 'Évangile (Jésus)',
  onesta_coach: 'Coach Onesta'
};

const App: React.FC = () => {
  const { 
    isConnected, isConnecting, isMuted, setIsMuted, connect, disconnect,
    history, clearHistory, importHistory, volume, voiceName, setVoiceName,
    logs, clearLogs, isSearching, testMicrophone, resetMicrophone,
    summaryText, clearSummary, setMemoryScope, appendSummaryText
  } = useLiveAudio();
  
  const [activePersona, setActivePersona] = useState<PersonaType>('medical');
  const [showSettings, setShowSettings] = useState(false);
  const [showMonitor, setShowMonitor] = useState(false);
  const [systemInstruction, setSystemInstruction] = useState(PROMPT_MEDICAL);
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [micTestResult, setMicTestResult] = useState<{ ok: boolean; level: number } | null>(null);
  const [saveSettingsState, setSaveSettingsState] = useState<SaveSettings>(() => getSettings());
  const [saveHistory, setSaveHistory] = useState<SaveEntry[]>([]);
  const [saveLogs, setSaveLogs] = useState<string[]>(() => getSaveLogs());
  const [isLoadingSaves, setIsLoadingSaves] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMemoryScope(activePersona);
  }, [activePersona, setMemoryScope]);

  useEffect(() => {
    const refresh = async () => {
      setIsLoadingSaves(true);
      const entries = await listAgentSaves(activePersona);
      setSaveHistory(entries);
      setSaveLogs(getSaveLogs());
      setIsLoadingSaves(false);
    };
    refresh();
  }, [activePersona, summaryText]);

  // Échelle de pulsation basée sur le volume (0 à 100)
  const scale = 1 + (volume / 150); 

  const handlePersonaSwitch = (type: PersonaType) => {
    setActivePersona(type);
    let prompt = PROMPT_MEDICAL;
    if (type === 'humour') prompt = PROMPT_HUMOUR;
    if (type === 'detective') prompt = PROMPT_DETECTIVE;
    if (type === 'dev') prompt = PROMPT_DEV;
    if (type === 'anemia') prompt = PROMPT_ANEMIA;
    if (type === 'evangelism') prompt = PROMPT_EVANGELISM;
    if (type === 'onesta_coach') prompt = PROMPT_ONESTA_COACH;
    
    setSystemInstruction(prompt);
    if (isConnected) disconnect();
  };

  const handleExtract = async () => {
    let content = `--- EXTRACTION ${activePersona.toUpperCase()} ---\nDate: ${new Date().toLocaleString()}\n\n`;
    history.forEach(m => {
      const role = m.role === 'user' ? 'AUTEUR' : m.role === 'system' ? 'SYSTEM' : 'EXPERT';
      content += `[${role}] : ${m.text}\n`;
    });
    const success = await copyToClipboard(content);
    if (success) alert("Conversation enregistrée et copiée !");
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Session_${activePersona}_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleManualExport = async () => {
    await exportManual(activePersona, summaryText || '');
    setSaveLogs(getSaveLogs());
  };

  const updateSaveSettings = (next: Partial<SaveSettings>) => {
    const merged = { ...saveSettingsState, ...next };
    setSaveSettingsState(merged);
    setSettings(merged);
  };

  const handleRestore = async (entry: SaveEntry) => {
    setRestoreError(null);
    const text = await restoreSave(activePersona, entry, saveSettingsState.encryptionKey);
    if (!text) {
      setRestoreError('Restauration impossible (clé ou format).');
      return;
    }
    appendSummaryText(text);
    setSaveLogs(getSaveLogs());
  };

  const handleModelExport = async () => {
    const content = summaryText || '';
    if (!content.trim()) {
      alert('Aucune mémoire TXT à exporter.');
      return;
    }
    const success = await copyToClipboard(content);
    if (success) alert("Mémoire TXT copiée !");

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Memoire_Modele_${activePersona}_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleMicTest = async () => {
    if (isTestingMic) return;
    setIsTestingMic(true);
    setMicTestResult(null);
    const result = await testMicrophone();
    setMicTestResult(result);
    setIsTestingMic(false);
  };

  if (showSettings) return <div className="min-h-screen bg-black"><SystemSettings instruction={systemInstruction} onInstructionChange={setSystemInstruction} onClose={() => setShowSettings(false)} /></div>;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans overflow-hidden ios-safe-pt ios-safe-pb">
      <OfflineBanner />
      
      <header className="px-6 py-4 flex justify-between items-center border-b border-white/5 bg-zinc-900/20 shrink-0">
        <div className="flex flex-col">
          <h1 className="text-[10px] font-black tracking-[0.3em] uppercase text-zinc-500">
            Console Liaison <span className="text-white">Active</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-800'}`} />
            <span className="text-[9px] font-mono text-zinc-500">{isConnected ? 'RECORDING' : 'IDLE'}</span>
          </div>
        </div>
        <div className="flex gap-4">
           <button onClick={() => setShowMonitor(true)} className="text-[9px] font-bold text-zinc-600 hover:text-white uppercase tracking-widest">Logs</button>
           <button onClick={() => setShowSettings(true)} className="text-[9px] font-bold text-zinc-600 hover:text-white uppercase tracking-widest">Prompt</button>
        </div>
      </header>

      {/* ZONE CENTRALE AVEC PULSATION RÉACTIVE */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
           <div className={`w-64 h-64 rounded-full transition-all duration-300 ${isConnected && !isMuted ? 'bg-blue-500/10 scale-150 blur-3xl' : 'bg-transparent'}`} />
        </div>

        {isConnected ? (
          <div className="flex flex-col items-center gap-8 z-10">
            <div 
              className={`w-32 h-32 rounded-full border-2 transition-all duration-75 flex items-center justify-center ${isMuted ? 'border-red-500/10' : 'border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.1)]'}`}
              style={{ transform: `scale(${scale})` }}
            >
               <div className={`w-20 h-20 rounded-full transition-all duration-75 ${isMuted ? 'bg-zinc-800 scale-90' : 'bg-white shadow-[0_0_40px_rgba(255,255,255,0.4)]'}`} />
            </div>
            <div className="text-center space-y-1">
              <p className="text-[11px] font-black tracking-[0.4em] uppercase text-white">{PERSONA_LABEL[activePersona]}</p>
              {isSearching && <p className="text-[9px] text-blue-400 font-bold uppercase animate-pulse">Recherche Multimodale...</p>}
              {!isSearching && isConnected && !isMuted && <p className="text-[8px] text-zinc-500 uppercase tracking-widest">Liaison audio établie</p>}
            </div>
          </div>
        ) : (
          <div className="text-center opacity-10">
             <div className="w-16 h-1 w-16 bg-zinc-800 mx-auto mb-4 rounded-full" />
             <p className="text-[10px] font-black tracking-widest uppercase">Système prêt</p>
          </div>
        )}
      </main>

      {/* CONSOLE DE COMMANDE */}
      <section className="px-6 pb-10 pt-6 bg-zinc-900/95 border-t border-white/5 shrink-0">
        
        {/* SÉLECTEUR DE PERSONA */}
        <div className="grid grid-cols-2 gap-2 max-w-lg mx-auto mb-4">
          <button 
            onClick={() => handlePersonaSwitch('medical')}
            className={`py-3 rounded-xl font-black uppercase text-[9px] tracking-widest border transition-all ${activePersona === 'medical' ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-zinc-800/40 text-zinc-500 border-white/5'}`}
          >
            Médical
          </button>
          <button 
            onClick={() => handlePersonaSwitch('anemia')}
            className={`py-3 rounded-xl font-black uppercase text-[9px] tracking-widest border transition-all ${activePersona === 'anemia' ? 'bg-rose-500 text-black border-rose-400' : 'bg-zinc-800/40 text-zinc-500 border-white/5'}`}
          >
            Anémie
          </button>
          <button 
            onClick={() => handlePersonaSwitch('humour')}
            className={`py-3 rounded-xl font-black uppercase text-[9px] tracking-widest border transition-all ${activePersona === 'humour' ? 'bg-amber-500 text-black border-amber-400' : 'bg-zinc-800/40 text-zinc-500 border-white/5'}`}
          >
            Humour
          </button>
          <button 
            onClick={() => handlePersonaSwitch('detective')}
            className={`py-3 rounded-xl font-black uppercase text-[9px] tracking-widest border transition-all ${activePersona === 'detective' ? 'bg-zinc-100 text-black border-white' : 'bg-zinc-800/40 text-zinc-500 border-white/5'}`}
          >
            Détective
          </button>
          <button 
            onClick={() => handlePersonaSwitch('dev')}
            className={`py-3 rounded-xl font-black uppercase text-[9px] tracking-widest border transition-all ${activePersona === 'dev' ? 'bg-blue-500 text-black border-blue-400' : 'bg-zinc-800/40 text-zinc-500 border-white/5'}`}
          >
            Dév 2026
          </button>
          <button 
            onClick={() => handlePersonaSwitch('evangelism')}
            className={`py-3 rounded-xl font-black uppercase text-[9px] tracking-widest border transition-all ${activePersona === 'evangelism' ? 'bg-violet-500 text-black border-violet-400' : 'bg-zinc-800/40 text-zinc-500 border-white/5'}`}
          >
            Évangile
          </button>
          <button 
            onClick={() => handlePersonaSwitch('onesta_coach')}
            className={`py-3 rounded-xl font-black uppercase text-[9px] tracking-widest border transition-all ${activePersona === 'onesta_coach' ? 'bg-fuchsia-400 text-black border-fuchsia-300' : 'bg-zinc-800/40 text-zinc-500 border-white/5'}`}
          >
            Coach
          </button>
        </div>

        {/* CONTRÔLES SYSTÈME */}
        <div className="grid grid-cols-2 gap-2 max-w-lg mx-auto mb-6">
          <div className="relative">
            <select 
              value={voiceName}
              onChange={(e) => setVoiceName(e.target.value)}
              className="w-full py-3 bg-zinc-800/80 text-zinc-400 rounded-xl border border-white/5 font-bold uppercase text-[9px] tracking-widest appearance-none text-center outline-none"
            >
              <option value="Kore">Voix: Kore (FR recommandée)</option>
              <option value="Zephyr">Voix: Zephyr (FR apaisante)</option>
              <option value="Charon">Voix: Charon (Anglophone)</option>
              <option value="Puck">Voix: Puck (Anglophone)</option>
              <option value="Fenrir">Voix: Fenrir (Anglophone)</option>
            </select>
          </div>

          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`py-3 rounded-xl font-black uppercase text-[9px] tracking-widest border transition-all ${isMuted ? 'bg-red-600 text-white border-red-400' : 'bg-zinc-800/40 text-zinc-400 border-white/5'}`}
          >
            {isMuted ? 'Micro OFF' : 'Micro ON'}
          </button>

          <button 
            onClick={handleMicTest}
            className="py-3 bg-emerald-600/20 text-emerald-300 rounded-xl border border-emerald-500/40 font-bold uppercase text-[9px] tracking-widest active:bg-emerald-600/40"
          >
            {isTestingMic ? 'Test micro...' : 'Test micro'}
          </button>

          <button 
            onClick={resetMicrophone}
            className="py-3 bg-zinc-800/40 text-zinc-400 rounded-xl border border-white/5 font-bold uppercase text-[9px] tracking-widest active:bg-zinc-700"
          >
            Reset micro
          </button>

          <button 
            onClick={() => fileInputRef.current?.click()}
            className="py-3 bg-zinc-800/40 text-zinc-600 rounded-xl border border-white/5 font-bold uppercase text-[9px] tracking-widest active:bg-zinc-700"
          >
            Importer
          </button>
          <button 
            onClick={handleModelExport}
            className="py-3 bg-blue-600/20 text-blue-300 rounded-xl border border-blue-500/40 font-bold uppercase text-[9px] tracking-widest active:bg-blue-600/40"
          >
            Modèle TXT
          </button>
          <button 
            onClick={() => { if(confirm('RAZ Mémoire ?')) clearHistory(); }}
            className="py-3 bg-zinc-800/40 text-red-500/30 rounded-xl border border-white/5 font-bold uppercase text-[9px] tracking-widest"
          >
            RAZ Mémoire
          </button>
          <button 
            onClick={() => { if(confirm('RAZ Mémoire TXT ?')) clearSummary(); }}
            className="py-3 bg-zinc-800/40 text-red-500/30 rounded-xl border border-white/5 font-bold uppercase text-[9px] tracking-widest"
          >
            RAZ TXT
          </button>
        </div>

        {micTestResult && (
          <div className={`text-center text-[9px] font-bold uppercase tracking-widest ${micTestResult.ok ? 'text-emerald-400' : 'text-red-400'}`}>
            {micTestResult.ok ? `Micro OK (niveau ${micTestResult.level.toFixed(1)})` : 'Micro silencieux / non détecté'}
          </div>
        )}

        {/* EXTREME SAVING */}
        <div className="max-w-lg mx-auto mt-6 p-4 rounded-xl border border-white/5 bg-zinc-900/40">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black tracking-widest uppercase text-zinc-400">Extreme Saving</span>
            <span className={`text-[9px] font-bold uppercase ${saveLogs[0]?.includes('FAIL') ? 'text-red-400' : 'text-emerald-400'}`}>
              {saveLogs[0]?.includes('FAIL') ? 'Erreur sauvegarde' : 'OK'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => updateSaveSettings({ compress: !saveSettingsState.compress })}
              className={`py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${saveSettingsState.compress ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40' : 'bg-zinc-800/40 text-zinc-400 border-white/5'}`}
            >
              Compression
            </button>
            <button
              onClick={() => updateSaveSettings({ encrypt: !saveSettingsState.encrypt })}
              className={`py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${saveSettingsState.encrypt ? 'bg-amber-600/20 text-amber-300 border-amber-500/40' : 'bg-zinc-800/40 text-zinc-400 border-white/5'}`}
            >
              Chiffrement AES-256
            </button>
            <button
              onClick={() => updateSaveSettings({ cloudEnabled: !saveSettingsState.cloudEnabled })}
              className={`py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${saveSettingsState.cloudEnabled ? 'bg-blue-600/20 text-blue-300 border-blue-500/40' : 'bg-zinc-800/40 text-zinc-400 border-white/5'}`}
            >
              Cloud
            </button>
            <button
              onClick={handleManualExport}
              className="py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest border bg-zinc-800/40 text-zinc-300 border-white/5"
            >
              Export TXT
            </button>
          </div>

          {saveSettingsState.encrypt && (
            <input
              type="password"
              placeholder="Clé de chiffrement"
              value={saveSettingsState.encryptionKey}
              onChange={(e) => updateSaveSettings({ encryptionKey: e.target.value })}
              className="w-full mb-2 py-2 px-3 rounded-lg bg-zinc-800/70 text-zinc-300 text-[10px] border border-white/5 outline-none"
            />
          )}

          {saveSettingsState.cloudEnabled && (
            <input
              type="text"
              placeholder="URL de sauvegarde cloud"
              value={saveSettingsState.cloudEndpoint}
              onChange={(e) => updateSaveSettings({ cloudEndpoint: e.target.value })}
              className="w-full mb-2 py-2 px-3 rounded-lg bg-zinc-800/70 text-zinc-300 text-[10px] border border-white/5 outline-none"
            />
          )}

          {restoreError && (
            <div className="text-[9px] text-red-400 font-bold uppercase tracking-widest mb-2">
              {restoreError}
            </div>
          )}

          <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-2">
            Historique sauvegardes ({isLoadingSaves ? 'Chargement...' : `${saveHistory.length}`})
          </div>
          <div className="max-h-32 overflow-auto space-y-2">
            {saveHistory.slice(0, 6).map(entry => (
              <div key={entry.fileName} className="flex items-center justify-between text-[9px] text-zinc-400">
                <span className="truncate max-w-[160px]">{entry.fileName}</span>
                <button
                  onClick={() => handleRestore(entry)}
                  className="px-2 py-1 rounded bg-zinc-800/60 text-zinc-200 uppercase"
                >
                  Restaurer
                </button>
              </div>
            ))}
            {saveHistory.length === 0 && !isLoadingSaves && (
              <div className="text-[9px] text-zinc-600">Aucune sauvegarde locale détectée.</div>
            )}
          </div>
        </div>

        {/* ACTIONS MAITRESSES */}
        <div className="flex flex-col gap-3 max-w-lg mx-auto">
          <button 
            onClick={isConnected ? disconnect : () => connect(systemInstruction)}
            disabled={isConnecting}
            className={`w-full py-5 rounded-2xl font-black uppercase text-sm tracking-[0.3em] shadow-2xl transition-all active:scale-[0.97] ${isConnected ? 'bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.2)]' : 'bg-blue-600 text-white border-b-4 border-blue-900'}`}
          >
            {isConnecting ? 'CHARGEMENT...' : isConnected ? 'COUPER LA LIAISON' : 'ACTIVER LA LIAISON'}
          </button>

          <button 
            onClick={handleExtract}
            className="w-full py-3.5 rounded-xl font-black uppercase text-[10px] tracking-widest border border-white/5 bg-transparent text-zinc-500 hover:text-white transition-all"
          >
            Sauver & Extraire Dossier
          </button>
        </div>
        <input type="file" ref={fileInputRef} onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (ev) => importHistory(ev.target?.result as string);
              reader.readAsText(file);
            }
        }} className="hidden" accept=".txt" />
      </section>

      {/* Monitor Overlay */}
      <div className={`fixed inset-x-0 bottom-0 h-[80vh] bg-black z-[120] border-t border-zinc-800 transition-transform duration-500 ease-out ${showMonitor ? 'translate-y-0' : 'translate-y-full'}`}>
        <ErrorBoundary>
          <MonitoringPanel logs={logs} onClear={clearLogs} onClose={() => setShowMonitor(false)} />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default App;
