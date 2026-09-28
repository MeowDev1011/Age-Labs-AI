import React, { useState } from 'react';
import { useI18n } from '../context/I18nContext';
import { useTheme, type ThemeMode } from '../context/ThemeContext';
import { CloseVectorIcon, GlobeIcon, PaletteIcon, SunIcon, MoonIcon, MonitorIcon } from './icons/AppIcons';
import type { SupportedLanguage } from '../i18n/languages';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'language' | 'theme';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, defaultTab = 'language' }) => {
  const { language, setLanguage, t, availableLanguages } = useI18n();
  const { mode, resolvedTheme, setMode } = useTheme();
  const [tab, setTab] = useState<'language' | 'theme'>(defaultTab);
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredLanguages = availableLanguages.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(search.toLowerCase()) ||
      l.code.toLowerCase().includes(search.toLowerCase())
  );

  const themeOptions: { mode: ThemeMode; label: string; desc: string; icon: React.ReactNode; previewBg: string }[] = [
    {
      mode: 'system',
      label: t('themeSystem'),
      desc: 'Sigue el modo oscuro/claro de tu dispositivo',
      icon: <MonitorIcon className="w-5 h-5 text-sky-400" />,
      previewBg: 'bg-gradient-to-r from-zinc-900 to-slate-200',
    },
    {
      mode: 'black',
      label: t('themeBlack'),
      desc: 'Negro puro AMOLED para máximo contraste',
      icon: <MoonIcon className="w-5 h-5 text-emerald-400" />,
      previewBg: 'bg-black border border-zinc-700',
    },
    {
      mode: 'light',
      label: t('themeLight'),
      desc: 'Blanco puro nítido y luminoso',
      icon: <SunIcon className="w-5 h-5 text-amber-500" />,
      previewBg: 'bg-white border border-slate-300',
    },
    {
      mode: 'navy',
      label: t('themeNavy'),
      desc: 'Azul oscuro medianoche personalizado',
      icon: <PaletteIcon className="w-5 h-5 text-blue-400" />,
      previewBg: 'bg-[#0a1128] border border-blue-800',
    },
  ];

  const isLight = resolvedTheme === 'light';
  const isNavy = resolvedTheme === 'navy';

  const modalBg = isLight ? 'bg-white text-slate-900 border-slate-200' : isNavy ? 'bg-[#101b3b] text-white border-blue-900/60' : 'bg-zinc-950 text-white border-zinc-800';
  const headerBg = isLight ? 'bg-slate-50 border-slate-200' : isNavy ? 'bg-[#0d1633] border-blue-900/50' : 'bg-zinc-900/60 border-zinc-800';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-end sm:items-center z-50 p-0 sm:p-4 animate-fadeIn">
      <div className={`w-full sm:max-w-md max-h-[85vh] rounded-t-3xl sm:rounded-3xl border shadow-2xl flex flex-col overflow-hidden modal-fade-in ${modalBg}`}>
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${headerBg}`}>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab('language')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                tab === 'language'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : isLight
                  ? 'text-slate-600 hover:bg-slate-200'
                  : 'text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              <GlobeIcon className="w-4 h-4" />
              <span>{t('language')} (27)</span>
            </button>
            <button
              onClick={() => setTab('theme')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                tab === 'theme'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : isLight
                  ? 'text-slate-600 hover:bg-slate-200'
                  : 'text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              <PaletteIcon className="w-4 h-4" />
              <span>{t('theme')}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-zinc-800 text-zinc-400'
            }`}
            aria-label={t('close')}
          >
            <CloseVectorIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 overscroll-contain">
          {tab === 'language' ? (
            <div className="space-y-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar idioma / Search language..."
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition-all ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-sky-500 focus:bg-white'
                    : isNavy
                    ? 'bg-[#0a1128] border-blue-900/60 text-white focus:border-sky-400'
                    : 'bg-zinc-900 border-zinc-800 text-white focus:border-sky-500'
                }`}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[55vh] overflow-y-auto pr-1">
                {filteredLanguages.map((lang) => {
                  const isSelected = language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as SupportedLanguage);
                      }}
                      className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-sky-500 bg-sky-500/10 ring-1 ring-sky-500/30 font-bold'
                          : isLight
                          ? 'border-slate-200 bg-slate-50/80 hover:bg-slate-100 text-slate-800'
                          : isNavy
                          ? 'border-blue-900/40 bg-[#0d1736] hover:bg-[#15234f] text-slate-200'
                          : 'border-zinc-800/80 bg-zinc-900/70 hover:bg-zinc-900 text-zinc-200'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{lang.nativeName}</span>
                        <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                          {lang.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        {lang.code}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                Selecciona tu apariencia visual preferida. Por defecto se adapta automáticamente al tema de tu dispositivo:
              </p>

              <div className="space-y-2.5">
                {themeOptions.map((opt) => {
                  const isSelected = mode === opt.mode;
                  return (
                    <button
                      key={opt.mode}
                      onClick={() => setMode(opt.mode)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left ${
                        isSelected
                          ? 'border-sky-500 bg-sky-500/10 ring-2 ring-sky-500/40 shadow-sm'
                          : isLight
                          ? 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                          : isNavy
                          ? 'border-blue-900/40 bg-[#0d1736] hover:bg-[#15234f] text-slate-200'
                          : 'border-zinc-800/80 bg-zinc-900/70 hover:bg-zinc-900 text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-slate-500/10">{opt.icon}</div>
                        <div>
                          <div className="text-sm font-bold flex items-center gap-2">
                            <span>{opt.label}</span>
                            {isSelected && (
                              <span className="text-[10px] bg-sky-500 text-white px-2 py-0.5 rounded-full font-semibold">
                                Activo
                              </span>
                            )}
                          </div>
                          <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                            {opt.desc}
                          </div>
                        </div>
                      </div>
                      <div className={`w-8 h-8 rounded-full ${opt.previewBg} shadow-inner shrink-0 ml-2`} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer info (action button) */}
        <div className={`p-3 border-t text-center ${headerBg}`}>
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};
