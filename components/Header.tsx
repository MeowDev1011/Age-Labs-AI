import React, { useState } from 'react';
import type { AppView } from '../types';
import { SparklesIcon, PaletteIcon, GlobeIcon, SunIcon, MoonIcon, MonitorIcon } from './icons/AppIcons';
import { useI18n } from '../context/I18nContext';
import { useTheme } from '../context/ThemeContext';
import { SettingsModal } from './SettingsModal';

interface HeaderProps {
  view: AppView;
  onNavigate: (view: AppView) => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  view,
  onNavigate,
}) => {
  const { t, currentLanguageInfo } = useI18n();
  const { mode, resolvedTheme, cycleTheme } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'language' | 'theme'>('language');

  const isLight = resolvedTheme === 'light';
  const isNavy = resolvedTheme === 'navy';

  const containerClasses = isLight
    ? 'bg-white/90 border-slate-200/90 text-slate-900 shadow-sm'
    : isNavy
    ? 'bg-[#0d1736]/90 border-blue-900/60 text-white shadow-xl'
    : 'bg-zinc-950/90 border-zinc-850/80 text-white shadow-xl';

  const secondaryBtnClass = isLight
    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
    : isNavy
    ? 'bg-[#15234f] hover:bg-[#1f3370] text-blue-200 border-blue-800/60'
    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800';

  const getThemeIcon = () => {
    if (mode === 'system') return <MonitorIcon className="w-4 h-4 text-sky-400" />;
    if (resolvedTheme === 'black') return <MoonIcon className="w-4 h-4 text-emerald-400" />;
    if (resolvedTheme === 'light') return <SunIcon className="w-4 h-4 text-amber-500" />;
    return <PaletteIcon className="w-4 h-4 text-blue-400" />;
  };

  return (
    <>
      <header className={`w-full backdrop-blur-xl border rounded-2xl px-3.5 py-3 transition-colors ${containerClasses}`}>
        <div className="flex items-center justify-between gap-2">
          {/* Logo & Brand */}
          <div
            onClick={() => onNavigate('creator')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight bg-gradient-to-r from-sky-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                  Age-Labes AI
                </span>
              </div>
              <p className={`text-[10px] hidden sm:block truncate max-w-[200px] md:max-w-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                {t('tagline')}
              </p>
            </div>
          </div>

          {/* Controls: Language, Theme, Settings */}
          <div className="flex items-center gap-1.5">
            {/* Language Selector */}
            <button
              onClick={() => {
                setSettingsTab('language');
                setSettingsOpen(true);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${secondaryBtnClass}`}
              title="Cambiar idioma / Change language (27)"
            >
              <GlobeIcon className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-[11px] font-bold uppercase">{currentLanguageInfo.code}</span>
            </button>

            {/* Quick Theme Cycle */}
            <button
              onClick={cycleTheme}
              className={`p-2 rounded-xl border transition-all ${secondaryBtnClass}`}
              title={`Tema: ${mode}. Haz clic para cambiar`}
            >
              {getThemeIcon()}
            </button>

            {/* Full Settings (Theme / Lang) modal trigger */}
            <button
              onClick={() => {
                setSettingsTab('theme');
                setSettingsOpen(true);
              }}
              className={`p-2 rounded-xl border transition-all ${secondaryBtnClass}`}
              title="Ajustes de Tema e Idioma"
            >
              <PaletteIcon className="w-4 h-4 text-purple-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        defaultTab={settingsTab}
      />
    </>
  );
};