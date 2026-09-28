import React, { useState } from 'react';
import type { TransformType } from '../types';
import { BabyFaceIcon, ElderlyFaceIcon, SparklesIcon } from './icons/AppIcons';
import { useI18n } from '../context/I18nContext';
import { useTheme } from '../context/ThemeContext';
import { STYLE_FILTERS } from '../constants/styles';

interface AgeTransformerProps {
  personName: string;
  onPersonNameChange: (name: string) => void;
  targetAge: number;
  onTargetAgeChange: (age: number) => void;
  transformType: TransformType;
  onTransformTypeChange: (type: TransformType) => void;
  selectedStyleId: string;
  onSelectedStyleIdChange: (id: string) => void;
  customStylePrompt: string;
  onCustomStylePromptChange: (prompt: string) => void;
}

export const AgeTransformer: React.FC<AgeTransformerProps> = ({
  personName,
  onPersonNameChange,
  targetAge,
  onTargetAgeChange,
  transformType,
  onTransformTypeChange,
  selectedStyleId,
  onSelectedStyleIdChange,
  customStylePrompt,
  onCustomStylePromptChange,
}) => {
  const { t } = useI18n();
  const { resolvedTheme } = useTheme();
  const [showAllStyles, setShowAllStyles] = useState(false);
  const [isCustomActive, setIsCustomActive] = useState(
    selectedStyleId === 'custom' || customStylePrompt.trim().length > 0
  );

  const isLight = resolvedTheme === 'light';
  const isNavy = resolvedTheme === 'navy';

  const cardBg = isLight
    ? 'bg-white border-slate-200/90 text-slate-800 shadow-sm'
    : isNavy
    ? 'bg-[#0d1736] border-blue-900/60 text-white shadow-xl'
    : 'bg-zinc-950 border-zinc-800/80 text-white shadow-xl';

  const inputBg = isLight
    ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-sky-500'
    : isNavy
    ? 'bg-[#0a1128] border-blue-900/60 text-white focus:border-sky-400'
    : 'bg-zinc-900 border-zinc-800 text-white focus:border-sky-500';

  const presetAges = [5, 12, 18, 30, 45, 60, 75, 90];

  const handleSelectStyle = (id: string) => {
    onSelectedStyleIdChange(id);
    if (id === 'custom') {
      setIsCustomActive(true);
    } else {
      setIsCustomActive(false);
    }
  };

  return (
    <div className={`p-4 sm:p-5 rounded-3xl border transition-colors space-y-5 ${cardBg}`}>
      {/* 1. Nombre de la Persona */}
      <div>
        <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
          Nombre de la Persona
        </label>
        <div className="relative">
          <input
            type="text"
            value={personName}
            onChange={(e) => onPersonNameChange(e.target.value)}
            placeholder="Ej. Juan, Mamá, Carlos, Mi Foto..."
            className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium outline-none transition-all ${inputBg}`}
          />
          {personName && (
            <button
              type="button"
              onClick={() => onPersonNameChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300 px-2 py-1"
            >
              ✕
            </button>
          )}
        </div>
        <p className={`text-[11px] mt-1.5 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
          Se usará para organizar y filtrar tu galería personal.
        </p>
      </div>

      {/* 2. Modo de Edad: Rejuvenecer / Envejecer */}
      <div>
        <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
          Dirección del Tiempo
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onTransformTypeChange('regress')}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center ${
              transformType === 'regress'
                ? 'border-sky-500 bg-sky-500/15 ring-2 ring-sky-500/30 font-bold shadow-sm'
                : isLight
                ? 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                : isNavy
                ? 'border-blue-900/40 bg-[#121e42] hover:bg-[#1a2b5e] text-slate-300'
                : 'border-zinc-800/80 bg-zinc-900/70 hover:bg-zinc-900 text-zinc-300'
            }`}
          >
            <div className="mb-1 flex items-center justify-center">
              <BabyFaceIcon className="w-7 h-7 text-sky-400" />
            </div>
            <span className="text-xs font-bold">{t('regressLabel')}</span>
            <span className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              {t('regressDesc')}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onTransformTypeChange('progress')}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center ${
              transformType === 'progress'
                ? 'border-indigo-500 bg-indigo-500/15 ring-2 ring-indigo-500/30 font-bold shadow-sm'
                : isLight
                ? 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                : isNavy
                ? 'border-blue-900/40 bg-[#121e42] hover:bg-[#1a2b5e] text-slate-300'
                : 'border-zinc-800/80 bg-zinc-900/70 hover:bg-zinc-900 text-zinc-300'
            }`}
          >
            <div className="mb-1 flex items-center justify-center">
              <ElderlyFaceIcon className="w-7 h-7 text-indigo-400" />
            </div>
            <span className="text-xs font-bold">{t('progressLabel')}</span>
            <span className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              {t('progressDesc')}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Edad Objetivo con Slider y Presets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
            {t('targetAge')}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
              {targetAge}
            </span>
            <span className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              {t('yearsOld')}
            </span>
          </div>
        </div>

        <input
          type="range"
          min="1"
          max="100"
          value={targetAge}
          onChange={(e) => onTargetAgeChange(Number(e.target.value))}
          className="w-full h-2.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
        />

        <div className="flex items-center justify-between text-[11px] text-zinc-500">
          <span>1 año</span>
          <span>50 años</span>
          <span>100 años</span>
        </div>

        {/* Quick Age Presets */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {presetAges.map((age) => (
            <button
              key={age}
              type="button"
              onClick={() => onTargetAgeChange(age)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                targetAge === age
                  ? 'bg-sky-500 text-white font-bold shadow-md shadow-sky-500/30 scale-105'
                  : isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  : isNavy
                  ? 'bg-[#121f47] hover:bg-[#1a2d66] text-slate-300'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400'
              }`}
            >
              {age}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Estilos y Filtros Artísticos (10 Filtros + Personalizado con Prompt) */}
      <div className="space-y-3 pt-3 border-t border-zinc-800/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <SparklesIcon className="w-4 h-4 text-sky-400" />
            <span className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Filtro de Estilo Artístico (10+ opciones)
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowAllStyles(!showAllStyles)}
            className="text-[11px] text-sky-400 hover:underline font-semibold"
          >
            {showAllStyles ? 'Ver menos' : 'Ver todos'}
          </button>
        </div>

        {/* Style chips / grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {STYLE_FILTERS.slice(0, showAllStyles ? STYLE_FILTERS.length : 6).map((style) => {
            const isSelected = selectedStyleId === style.id && !isCustomActive;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => handleSelectStyle(style.id)}
                className={`p-2.5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'border-sky-500 bg-sky-500/15 ring-2 ring-sky-500/30 font-bold shadow-sm'
                    : isLight
                    ? 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    : isNavy
                    ? 'border-blue-900/40 bg-[#121e42] hover:bg-[#1a2b5e] text-slate-300'
                    : 'border-zinc-800/80 bg-zinc-900/70 hover:bg-zinc-900 text-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold truncate">{style.name}</span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-sky-400 shadow-sm shadow-sky-400" />
                  )}
                </div>
                <p className={`text-[10px] line-clamp-1 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  {style.shortDesc}
                </p>
              </button>
            );
          })}

          {/* Botón de Estilo Personalizado */}
          <button
            type="button"
            onClick={() => handleSelectStyle('custom')}
            className={`p-2.5 rounded-2xl border text-left transition-all ${
              isCustomActive
                ? 'border-purple-500 bg-purple-500/15 ring-2 ring-purple-500/30 font-bold shadow-sm'
                : isLight
                ? 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                : isNavy
                ? 'border-blue-900/40 bg-[#121e42] hover:bg-[#1a2b5e] text-slate-300'
                : 'border-zinc-800/80 bg-zinc-900/70 hover:bg-zinc-900 text-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-purple-400">Personalizado</span>
              {isCustomActive && (
                <span className="w-2 h-2 rounded-full bg-purple-400 shadow-sm shadow-purple-400" />
              )}
            </div>
            <p className={`text-[10px] line-clamp-1 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Escribe tu propio prompt
            </p>
          </button>
        </div>

        {/* Input para prompt personalizado si está activo */}
        {isCustomActive && (
          <div className="p-3 rounded-2xl border border-purple-500/40 bg-purple-500/5 space-y-2 mt-2">
            <label className="block text-xs font-semibold text-purple-400">
              Describe el estilo deseado (Prompt):
            </label>
            <textarea
              rows={2}
              value={customStylePrompt}
              onChange={(e) => onCustomStylePromptChange(e.target.value)}
              placeholder="Ej. Estilo obra de cerámica con esmalte fino, estilo cabaña rústica, robótico con circuitos de luz, etc..."
              className={`w-full px-3 py-2 rounded-xl border text-xs outline-none transition-all resize-none ${inputBg}`}
            />
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => onCustomStylePromptChange('Estilo obra de cerámica artesanal esmaltada')}
                className="text-[10px] px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >
                Cerámica
              </button>
              <button
                type="button"
                onClick={() => onCustomStylePromptChange('Estilo cabaña rústica de madera en el bosque')}
                className="text-[10px] px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >
                Cabaña
              </button>
              <button
                type="button"
                onClick={() => onCustomStylePromptChange('Estilo robótico cyborg de titanio futurista')}
                className="text-[10px] px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >
                Robótico
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};