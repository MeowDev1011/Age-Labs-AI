
import React from 'react';

interface ErrorDisplayProps {
  message: string;
  onReset: () => void;
}

const ErrorIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onReset }) => {
  return (
    <div className="w-full max-w-md bg-slate-800 border border-red-500/50 rounded-lg p-8 shadow-2xl flex flex-col items-center text-center">
      <ErrorIcon />
      <h2 className="text-2xl font-semibold text-red-400 mt-4 mb-2">¡Ups! Ocurrió un Error</h2>
      <p className="text-slate-300 mb-6">
        {message}
      </p>
      <button
        onClick={onReset}
        className="bg-slate-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-slate-500 transition-colors"
      >
        Intentar de Nuevo
      </button>
    </div>
  );
};
