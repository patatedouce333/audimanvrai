import React from 'react';

interface ThinkingSliderProps {
  value: number;
  onChange: (val: number) => void;
  disabled: boolean;
}

const ThinkingSlider: React.FC<ThinkingSliderProps> = ({ value, onChange, disabled }) => {
  // Map internal 0-100 slider to actual token budget 0-24000
  // Logarithmic scale might be better, but linear is easier to understand for "Time".
  // Max budget for Flash 2.5 is around 24k.
  const maxBudget = 24000;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  return (
    <div className={`w-full max-w-xs space-y-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm transition-opacity ${disabled ? 'opacity-50' : 'opacity-100'}`}>
      <div className="flex justify-between items-center">
        <label className="text-slate-200 text-sm font-semibold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-indigo-400">
            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
            <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
          </svg>
          Profondeur de réflexion
        </label>
        <span className="text-xs font-mono text-indigo-300 bg-indigo-900/40 px-2 py-0.5 rounded border border-indigo-500/30">
          {value === 0 ? 'Instant' : `${(value / 1000).toFixed(1)}k tokens`}
        </span>
      </div>

      <div className="relative h-6 flex items-center">
        {/* Track Background */}
        <div className="absolute w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
           {/* Filled Track */}
           <div 
             className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-150"
             style={{ width: `${(value / maxBudget) * 100}%` }}
           />
        </div>
        
        {/* Input */}
        <input
          type="range"
          min="0"
          max={maxBudget}
          step="1000"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className="absolute w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        {/* Custom Thumb (Visual only, positioned via calc) */}
        <div 
          className="absolute h-5 w-5 bg-white rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)] border-2 border-purple-500 pointer-events-none transition-all duration-150"
          style={{ 
            left: `calc(${(value / maxBudget) * 100}% - 10px)` 
          }}
        />
      </div>

      <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500 tracking-wider">
        <span>Rapide</span>
        <span>Intelligent</span>
      </div>
      
      {disabled && (
        <div className="text-[10px] text-center text-orange-400/80 font-medium">
          Déconnectez pour modifier
        </div>
      )}
    </div>
  );
};

export default ThinkingSlider;