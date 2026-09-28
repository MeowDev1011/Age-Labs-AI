
import React from 'react';

interface ErrorDisplayProps {
  message: string;
  onReset?: () => void;
  onDismiss?: () => void;
}

const ErrorIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onReset, onDismiss }) => {
  const handleAction = () => {
    if (onDismiss) onDismiss();
    else if (onReset) onReset();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
      <div className="w-full max-w-sm bg-zinc-950 border border-red-500/40 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center relative modal-fade-in">
        <button
          onClick={handleAction}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900 border border-zinc-800 transition-colors"
          aria-label="Cerrar"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <ErrorIcon />
        <h2 className="text-lg font-bold text-red-400 mt-3 mb-2">¡Ups! Ocurrió un Error</h2>
        <p className="text-zinc-300 text-xs leading-relaxed mb-6">
          {message}
        </p>
        <button
          onClick={handleAction}
          className="w-full py-3 px-5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 transition-all active:scale-95"
        >
          Continuar
        </button>
      </div>
    </div>
  );
};
