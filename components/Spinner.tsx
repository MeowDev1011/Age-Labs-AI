
import React, { useState, useEffect } from 'react';

const messages = [
  "Analizando rasgos faciales...",
  "Mapeando estructura corporal...",
  "Consultando modelos de IA...",
  "Aplicando cambios de edad...",
  "Preservando la identidad original...",
  "Renderizando la imagen final...",
  "Casi listo..."
];

export const Spinner: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-sky-400"></div>
      <p className="text-slate-300 text-lg mt-6 text-center transition-opacity duration-500">
        {messages[messageIndex]}
      </p>
      <p className="text-sm text-slate-500 mt-2">Esto puede tardar unos momentos.</p>
    </div>
  );
};
