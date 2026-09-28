import React, { useState } from 'react';
import { ImageComparisonSlider } from './ImageComparisonSlider';
import { ShareModal } from './ShareModal';
import { ShareVectorIcon, DownloadVectorIcon, SparklesIcon } from './icons/AppIcons';
import { useI18n } from '../context/I18nContext';
import { useTheme } from '../context/ThemeContext';
import { STYLE_FILTERS } from '../constants/styles';

interface ResultDisplayProps {
  originalImage: string;
  transformedImage: string;
  targetAge: number;
  personName: string;
  onPersonNameChange: (name: string) => void;
  selectedStyleId: string;
  onReapplyStyle: (styleId: string, customPrompt: string) => Promise<void>;
  isReapplying: boolean;
  onSaveAndReset: (name: string, personName: string, styleId: string, styleName: string) => void;
  onCancel: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  originalImage,
  transformedImage,
  targetAge,
  personName,
  onPersonNameChange,
  selectedStyleId,
  onReapplyStyle,
  isReapplying,
  onSaveAndReset,
  onCancel,
}) => {
  const { t } = useI18n();
  const { resolvedTheme } = useTheme();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [activeStyleId, setActiveStyleId] = useState(selectedStyleId || 'realista');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isCustomSelected, setIsCustomSelected] = useState(selectedStyleId === 'custom');
  const [nameInput, setNameInput] = useState(personName || 'Persona');
  const [isSaved, setIsSaved] = useState(false);

  const isLight = resolvedTheme === 'light';
  const isNavy = resolvedTheme === 'navy';

  const containerBg = isLight
    ? 'bg-white border-slate-200/90 text-slate-800'
    : isNavy
    ? 'bg-[#0d1736] border-blue-900/60 text-white'
    : 'bg-zinc-950 border-zinc-800/80 text-white';

  const secondaryBtnClass = isLight
    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
    : isNavy
    ? 'bg-[#15234f] hover:bg-[#1f3370] text-blue-200 border-blue-900/50'
    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800';

  const inputBg = isLight
    ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-sky-500'
    : isNavy
    ? 'bg-[#0a1128] border-blue-900/60 text-white focus:border-sky-400'
    : 'bg-zinc-900 border-zinc-800 text-white focus:border-sky-500';

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = transformedImage;
    const cleanPerson = (nameInput || 'Persona').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.download = `AgeLabes-${cleanPerson}-${targetAge}anos.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleApplyStyle = async (styleId: string, promptText?: string) => {
    setActiveStyleId(styleId);
    if (styleId === 'custom') {
      setIsCustomSelected(true);
      return;
    }
    setIsCustomSelected(false);
    await onReapplyStyle(styleId, promptText || '');
  };

  const handleExecuteCustomStyle = async () => {
    if (!customPrompt.trim()) return;
    await onReapplyStyle('custom', customPrompt.trim());
  };

  const currentStyleObj = STYLE_FILTERS.find((s) => s.id === activeStyleId);
  const currentStyleName = isCustomSelected
    ? customPrompt.trim()
      ? `Personalizado (${customPrompt.slice(0, 20)}...)`
      : 'Personalizado'
    : currentStyleObj?.name || 'Ultra Realista';

  const handleSave = () => {
    const finalPerson = nameInput.trim() || 'Persona';
    onPersonNameChange(finalPerson);
    const title = `${finalPerson} a los ${targetAge} años - ${currentStyleName}`;
    onSaveAndReset(title, finalPerson, activeStyleId, currentStyleName);
    setIsSaved(true);
  };

  return (
    <div className={`w-full p-4 sm:p-6 rounded-3xl border shadow-2xl flex flex-col items-center transition-colors space-y-4 ${containerBg}`}>
      {/* Header bar */}
      <div className="w-full flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
            {t('transformTitle')}
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs font-bold text-sky-400">{targetAge} años</span>
            <span className="text-zinc-500 text-xs">•</span>
            <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              {currentStyleName}
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsShareOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-xs shadow-md shadow-sky-500/20 hover:opacity-90 active:scale-95 transition-all"
        >
          <ShareVectorIcon className="w-4 h-4 text-white" />
          <span>{t('shareCreation')}</span>
        </button>
      </div>

      {/* Comparison Slider */}
      <div className="w-full relative rounded-2xl overflow-hidden shadow-inner border border-slate-800/30">
        <ImageComparisonSlider
          originalImage={originalImage}
          transformedImage={transformedImage}
          transformedFilterClass=""
        />

        {isReapplying && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
            <div className="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-sm font-bold text-white animate-pulse">
              Aplicando nuevo estilo con IA...
            </span>
          </div>
        )}
      </div>

      {/* Nombre de la persona para guardar */}
      <div className="w-full p-3.5 rounded-2xl border border-sky-500/30 bg-sky-500/5">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-sky-400 uppercase tracking-wider">
            Nombre de la Persona:
          </label>
          <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
            Se usará en la galería y para filtrar
          </span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => {
              setNameInput(e.target.value);
              onPersonNameChange(e.target.value);
            }}
            placeholder="Ej. Juan, María, Carlos..."
            className={`flex-1 px-3 py-2 rounded-xl border text-xs font-semibold outline-none transition-all ${inputBg}`}
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaved}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
              isSaved
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white active:scale-95'
            }`}
          >
            {isSaved ? '✓ Guardado' : 'Guardar en Galería'}
          </button>
        </div>
      </div>

      {/* 10 Filtros de Estilo + Personalizado con Prompt */}
      <div className="w-full space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <SparklesIcon className="w-4 h-4 text-sky-400" />
            <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
              Aplica más estilos (10 filtros + personalizado):
            </span>
          </div>
        </div>

        {/* Style chips scrollable / grid */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
          {STYLE_FILTERS.map((filter) => {
            const isSelected = activeStyleId === filter.id && !isCustomSelected;
            return (
              <button
                key={filter.id}
                type="button"
                disabled={isReapplying}
                onClick={() => handleApplyStyle(filter.id)}
                className={`px-3 py-1.5 text-xs rounded-xl whitespace-nowrap font-semibold border transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-sky-500 text-white font-bold border-sky-400 shadow-md shadow-sky-500/30'
                    : secondaryBtnClass
                }`}
                title={filter.shortDesc}
              >
                {filter.name}
              </button>
            );
          })}

          {/* Botón Personalizado */}
          <button
            type="button"
            disabled={isReapplying}
            onClick={() => {
              setActiveStyleId('custom');
              setIsCustomSelected(true);
            }}
            className={`px-3 py-1.5 text-xs rounded-xl whitespace-nowrap font-semibold border transition-all active:scale-95 ${
              isCustomSelected
                ? 'bg-purple-600 text-white font-bold border-purple-400 shadow-md shadow-purple-600/30'
                : secondaryBtnClass
            }`}
          >
            Personalizado (Prompt)
          </button>
        </div>

        {/* Input para prompt personalizado si está seleccionado */}
        {isCustomSelected && (
          <div className="p-3 rounded-2xl border border-purple-500/40 bg-purple-500/10 space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300">
                Escribe tu Prompt personalizado:
              </span>
              <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                Ej. obra de cerámica, cabaña, robótico...
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Ej. Estilo obra de cerámica con esmalte fino vidriado..."
                className={`flex-1 px-3 py-2 rounded-xl border text-xs outline-none ${inputBg}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleExecuteCustomStyle();
                }}
              />
              <button
                type="button"
                disabled={isReapplying || !customPrompt.trim()}
                onClick={handleExecuteCustomStyle}
                className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold transition-all"
              >
                {isReapplying ? '...' : 'Aplicar'}
              </button>
            </div>

            {/* Quick prompt suggestions */}
            <div className="flex flex-wrap gap-1 pt-1">
              <button
                type="button"
                onClick={() => {
                  setCustomPrompt('Estilo obra de cerámica artesanal vidriada');
                  onReapplyStyle('custom', 'Estilo obra de cerámica artesanal vidriada');
                }}
                className="text-[10px] px-2 py-0.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >
                Obra de cerámica
              </button>
              <button
                type="button"
                onClick={() => {
                  setCustomPrompt('Estilo cabaña rústica de madera en el bosque');
                  onReapplyStyle('custom', 'Estilo cabaña rústica de madera en el bosque');
                }}
                className="text-[10px] px-2 py-0.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >
                Estilo cabaña
              </button>
              <button
                type="button"
                onClick={() => {
                  setCustomPrompt('Estilo robótico cyborg de titanio futurista');
                  onReapplyStyle('custom', 'Estilo robótico cyborg de titanio futurista');
                }}
                className="text-[10px] px-2 py-0.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >
                Robótico
              </button>
              <button
                type="button"
                onClick={() => {
                  setCustomPrompt('Estilo dibujo animado en 3D moderno');
                  onReapplyStyle('custom', 'Estilo dibujo animado en 3D moderno');
                }}
                className="text-[10px] px-2 py-0.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >
                Animación 3D
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="w-full mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-800/40">
        <button
          onClick={() => setIsShareOpen(true)}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-500/20 active:scale-95 transition-all"
        >
          <ShareVectorIcon className="w-4 h-4 text-white" />
          <span>{t('shareCreation')}</span>
        </button>

        <button
          onClick={handleDownload}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold border transition-all active:scale-95 ${secondaryBtnClass}`}
        >
          <DownloadVectorIcon className="w-4 h-4" />
          <span>{t('downloadImage')}</span>
        </button>

        <button
          onClick={handleSave}
          disabled={isSaved}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
            isSaved
              ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
              : secondaryBtnClass
          }`}
        >
          <span>{isSaved ? '✓ En Galería' : 'Guardar'}</span>
        </button>

        <button
          onClick={onCancel}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold border transition-all active:scale-95 ${secondaryBtnClass}`}
        >
          <span>{t('newPhoto')}</span>
        </button>
      </div>

      {/* Share Modal Sheet */}
      {isShareOpen && (
        <ShareModal
          imageUrl={transformedImage}
          onClose={() => setIsShareOpen(false)}
          title={`Age-Labes AI - ${nameInput} a los ${targetAge} años (${currentStyleName})`}
          text={`Mira la transformación de ${nameInput} a los ${targetAge} años con estilo ${currentStyleName} creada con Age-Labes AI`}
        />
      )}
    </div>
  );
};