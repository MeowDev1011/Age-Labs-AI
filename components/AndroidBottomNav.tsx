import React from 'react';
import type { AppView } from '../types';
import { CameraAltIcon, PaletteIcon } from './icons/AppIcons';
import { useI18n } from '../context/I18nContext';
import { useTheme } from '../context/ThemeContext';

interface AndroidBottomNavProps {
  view: AppView;
  onNavigate: (view: AppView) => void;
  onOpenQuickCamera: () => void;
  onOpenSettings: () => void;
  creationCount: number;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  view,
  onNavigate,
  onOpenQuickCamera,
  onOpenSettings,
  creationCount,
}) => {
  const { t } = useI18n();
  const { resolvedTheme } = useTheme();

  const handleNav = (targetView: AppView) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.(12);
    }
    onNavigate(targetView);
  };

  const isLight = resolvedTheme === 'light';
  const isNavy = resolvedTheme === 'navy';

  const navBg = isLight
    ? 'bg-white/95 border-slate-200/90 shadow-2xl text-slate-700'
    : isNavy
    ? 'bg-[#0b142d]/95 border-blue-900/60 shadow-2xl text-slate-300'
    : 'bg-zinc-950/95 border-zinc-850/80 shadow-2xl text-zinc-300';

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 backdrop-blur-2xl border-t px-3 py-2 transition-colors ${navBg}`}
      style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' }}
      aria-label="Navegación principal de la app"
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Creator / Home tab */}
        <button
          onClick={() => handleNav('creator')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all relative ${
            view === 'creator'
              ? isLight
                ? 'text-sky-600 font-bold'
                : 'text-sky-400 font-bold'
              : isLight
              ? 'text-slate-500 hover:text-slate-800'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div
            className={`w-10 h-7 rounded-full flex items-center justify-center transition-colors mb-0.5 ${
              view === 'creator' ? 'bg-sky-500/20 text-sky-400' : 'bg-transparent'
            }`}
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <span className="text-[10px] tracking-tight">{t('creator')}</span>
        </button>

        {/* Quick Camera Action */}
        <button
          onClick={() => {
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              navigator.vibrate?.(25);
            }
            onOpenQuickCamera();
          }}
          className="flex flex-col items-center justify-center -mt-4 group focus:outline-none"
          title={t('quickCamera')}
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30 group-hover:scale-110 active:scale-95 transition-all">
            <CameraAltIcon className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] font-semibold text-sky-400 mt-1">{t('quickCamera')}</span>
        </button>

        {/* Saved Gallery tab */}
        <button
          onClick={() => handleNav('gallery')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all relative ${
            view === 'gallery'
              ? isLight
                ? 'text-sky-600 font-bold'
                : 'text-sky-400 font-bold'
              : isLight
              ? 'text-slate-500 hover:text-slate-800'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div
            className={`w-10 h-7 rounded-full flex items-center justify-center transition-colors mb-0.5 relative ${
              view === 'gallery' ? 'bg-sky-500/20 text-sky-400' : 'bg-transparent'
            }`}
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            {creationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-sky-500 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                {creationCount > 9 ? '9+' : creationCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">{t('gallery')}</span>
        </button>

        {/* Settings Tab (Theme & Language) */}
        <button
          onClick={() => {
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              navigator.vibrate?.(10);
            }
            onOpenSettings();
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
            isLight ? 'text-slate-500 hover:text-slate-800' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div className="w-10 h-7 rounded-full flex items-center justify-center mb-0.5 bg-transparent">
            <PaletteIcon className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight">{t('theme')}</span>
        </button>
      </div>
    </nav>
  );
};
