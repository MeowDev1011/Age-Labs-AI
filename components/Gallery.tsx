import React, { useState, useMemo, useEffect } from 'react';
import type { Creation } from '../types';
import { ImageComparisonSlider } from './ImageComparisonSlider';
import { ShareModal } from './ShareModal';
import {
  EmptyGalleryIcon,
  ShareVectorIcon,
  DownloadVectorIcon,
  CloseVectorIcon,
  TrashVectorIcon,
} from './icons/AppIcons';
import { useI18n } from '../context/I18nContext';
import { useTheme } from '../context/ThemeContext';

interface GalleryProps {
  creations: Creation[];
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
}

const SearchIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 text-slate-400"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
      clipRule="evenodd"
    />
  </svg>
);

const EmptyState: React.FC = () => {
  const { t } = useI18n();
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';
  const isNavy = resolvedTheme === 'navy';

  const cardBg = isLight
    ? 'bg-white border-slate-200 text-slate-800'
    : isNavy
    ? 'bg-[#0d1736] border-blue-900/60 text-white'
    : 'bg-zinc-950 border-zinc-800/80 text-white';

  return (
    <div
      className={`text-center w-full max-w-md border rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col items-center mx-auto my-6 transition-colors ${cardBg}`}
    >
      <div className="p-4 rounded-2xl bg-slate-500/10 border border-slate-500/20 mb-4">
        <EmptyGalleryIcon className="w-14 h-14 text-sky-400" />
      </div>
      <h3 className="text-xl font-bold text-sky-400">{t('noCreationsYet')}</h3>
      <p className={`mt-2 text-xs sm:text-sm ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
        {t('noCreationsDesc')}
      </p>
    </div>
  );
};

interface CreationDetailViewProps {
  creation: Creation;
  onClose: () => void;
  onDelete: (id: string) => void;
  onShare: (creation: Creation) => void;
}

const CreationDetailView: React.FC<CreationDetailViewProps> = ({
  creation,
  onClose,
  onDelete,
  onShare,
}) => {
  const { t } = useI18n();
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';
  const isNavy = resolvedTheme === 'navy';

  const modalBg = isLight
    ? 'bg-white text-slate-900 border-slate-200'
    : isNavy
    ? 'bg-[#0d1736] text-white border-blue-900/60'
    : 'bg-zinc-950 text-white border-zinc-800';

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = creation.transformedImage;
    const cleanPerson = (creation.personName || 'Persona').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.download = `AgeLabes-${cleanPerson}-${creation.targetAge}yo-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formattedDate = new Date(
    creation.createdAt || creation.timestamp || Date.now()
  ).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className="fixed inset-0 bg-black/85 backdrop-blur-md flex justify-center items-center z-50 p-3 sm:p-5 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className={`border rounded-3xl p-5 sm:p-6 max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden transition-colors ${modalBg}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/40">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-sky-400">
                {creation.personName || 'Persona'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                {creation.targetAge} años
              </span>
              {creation.styleName && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {creation.styleName}
                </span>
              )}
            </div>
            <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              {formattedDate}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-500/20 text-slate-400 hover:text-white transition-colors"
          >
            <CloseVectorIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Comparison Slider */}
        <div className="my-4 flex-1 min-h-[260px] max-h-[52vh] flex items-center justify-center rounded-2xl overflow-hidden border border-zinc-800/40 bg-black/40">
          <ImageComparisonSlider
            originalImage={creation.originalImage}
            transformedImage={creation.transformedImage}
            transformedFilterClass=""
          />
        </div>

        {/* Modal Actions */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/40">
          <button
            onClick={() => onShare(creation)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-500/20 active:scale-95 transition-all"
          >
            <ShareVectorIcon className="w-4 h-4 text-white" />
            <span>{t('shareCreation')}</span>
          </button>

          <button
            onClick={handleDownload}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                : isNavy
                ? 'bg-[#15234f] hover:bg-[#1f3370] text-blue-200 border-blue-900/50'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-800'
            }`}
          >
            <DownloadVectorIcon className="w-4 h-4" />
            <span>{t('downloadImage')}</span>
          </button>

          <button
            onClick={() => {
              onDelete(creation.id);
              onClose();
            }}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 active:scale-95 transition-all"
          >
            <TrashVectorIcon className="w-4 h-4" />
            <span>{t('delete')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const Gallery: React.FC<GalleryProps> = ({
  creations,
  onDelete,
  onDeleteAll,
}) => {
  const { t } = useI18n();
  const { resolvedTheme } = useTheme();
  const [selectedCreation, setSelectedCreation] = useState<Creation | null>(null);
  const [shareTargetCreation, setShareTargetCreation] = useState<Creation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPersonFilter, setSelectedPersonFilter] = useState<string>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const isLight = resolvedTheme === 'light';
  const isNavy = resolvedTheme === 'navy';

  const cardBg = isLight
    ? 'bg-white border-slate-200/90 text-slate-800'
    : isNavy
    ? 'bg-[#0d1736] border-blue-900/60 text-white'
    : 'bg-zinc-950 border-zinc-800/80 text-white';

  const inputBg = isLight
    ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-sky-500'
    : isNavy
    ? 'bg-[#0a1128] border-blue-900/60 text-white focus:border-sky-400'
    : 'bg-zinc-900 border-zinc-800 text-white focus:border-sky-500';

  // Compute unique person names and counts
  const personStats = useMemo(() => {
    const counts: Record<string, number> = {};
    creations.forEach((c) => {
      const p = c.personName?.trim() || 'Persona';
      counts[p] = (counts[p] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [creations]);

  // Filter creations
  const filteredCreations = useMemo(() => {
    return creations.filter((item) => {
      const pName = item.personName?.trim() || 'Persona';
      const matchesPerson =
        selectedPersonFilter === 'all' || pName.toLowerCase() === selectedPersonFilter.toLowerCase();

      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        pName.toLowerCase().includes(term) ||
        (item.name && item.name.toLowerCase().includes(term)) ||
        (item.styleName && item.styleName.toLowerCase().includes(term)) ||
        String(item.targetAge).includes(term);

      return matchesPerson && matchesSearch;
    });
  }, [creations, selectedPersonFilter, searchTerm]);

  const handleDownloadItem = (creation: Creation, e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = creation.transformedImage;
    const cleanPerson = (creation.personName || 'Persona').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.download = `AgeLabes-${cleanPerson}-${creation.targetAge}yo.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareItem = (creation: Creation, e: React.MouseEvent) => {
    e.stopPropagation();
    setShareTargetCreation(creation);
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(id);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      {/* Gallery Header Bar */}
      <div className={`p-4 sm:p-5 rounded-3xl border shadow-xl transition-colors space-y-3 ${cardBg}`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-xl font-black bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
              {t('savedCreations')}
            </h2>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              {creations.length} {creations.length === 1 ? 'imagen guardada' : 'imágenes guardadas'}
            </p>
          </div>

          {creations.length > 0 && (
            <button
              onClick={onDeleteAll}
              className="text-xs px-3 py-1.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold transition-all"
            >
              {t('deleteAll')}
            </button>
          )}
        </div>

        {/* Search bar */}
        {creations.length > 0 && (
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por persona, edad o estilo..."
              className={`w-full pl-9 pr-4 py-2.5 rounded-2xl border text-xs font-medium outline-none transition-all ${inputBg}`}
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <SearchIcon />
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Person filter chips: si ya tienes una persona, hace un filtro */}
        {creations.length > 0 && personStats.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Filtrar por Persona:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedPersonFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                  selectedPersonFilter === 'all'
                    ? 'bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/25'
                    : isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
                }`}
              >
                Todas ({creations.length})
              </button>

              {personStats.map(([name, count]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedPersonFilter(name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                    selectedPersonFilter.toLowerCase() === name.toLowerCase()
                      ? 'bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/25'
                      : isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
                  }`}
                >
                  {name} ({count})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Gallery Cards Grid */}
      {filteredCreations.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCreations.map((item) => {
            const formattedDate = new Date(
              item.createdAt || item.timestamp || Date.now()
            ).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={item.id}
                onClick={() => setSelectedCreation(item)}
                className={`rounded-3xl border overflow-hidden shadow-lg transition-all duration-300 cursor-pointer flex flex-col group hover:-translate-y-1 hover:shadow-2xl ${cardBg}`}
              >
                {/* Image presentation */}
                <div className="relative aspect-square w-full overflow-hidden bg-black/40">
                  <img
                    src={item.transformedImage}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Overlays / badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-black/75 backdrop-blur-md text-sky-400 border border-white/10 shadow-md">
                      {item.targetAge} años
                    </span>
                    {item.styleName && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950/80 backdrop-blur-md text-purple-300 border border-purple-500/30">
                        {item.styleName}
                      </span>
                    )}
                  </div>

                  <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-black/80 backdrop-blur-md text-white border border-white/15">
                    Persona: {item.personName || 'Persona'}
                  </span>
                </div>

                {/* Card Info and Action Buttons */}
                <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-sky-400 truncate max-w-[70%]">
                        {item.personName || 'Persona'}
                      </span>
                      <span className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                        {formattedDate}
                      </span>
                    </div>
                    <p className={`text-[11px] mt-0.5 line-clamp-1 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                      {item.styleName || 'Ultra Realista'} • {item.transformType === 'regress' ? 'Rejuvenecido' : 'Envejecido'}
                    </p>
                  </div>

                  {/* Quick Action buttons on card: Compartir, Descargar, Borrar */}
                  <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-zinc-800/40">
                    <button
                      type="button"
                      onClick={(e) => handleShareItem(item, e)}
                      title="Compartir"
                      className="flex items-center justify-center gap-1 py-1.5 px-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-xl text-[11px] font-bold shadow-sm active:scale-95 transition-all"
                    >
                      <ShareVectorIcon className="w-3.5 h-3.5 text-white" />
                      <span>{t('shareCreation')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDownloadItem(item, e)}
                      title="Descargar"
                      className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all active:scale-95 ${
                        isLight
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                          : isNavy
                          ? 'bg-[#15234f] hover:bg-[#1f3370] text-blue-200 border-blue-900/50'
                          : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
                      }`}
                    >
                      <DownloadVectorIcon className="w-3.5 h-3.5" />
                      <span>{t('downloadImage')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteItem(item.id, e)}
                      title="Borrar"
                      className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-[11px] font-bold border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 active:scale-95 transition-all"
                    >
                      <TrashVectorIcon className="w-3.5 h-3.5" />
                      <span>{t('delete')}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation modal for item deletion */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
          <div
            className={`border rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 ${
              isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-zinc-950 border-zinc-800 text-white'
            }`}
          >
            <h3 className="text-base font-bold text-red-400">¿Eliminar esta imagen?</h3>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              Esta acción no se puede deshacer. Se eliminará de tu galería guardada.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border ${
                  isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-zinc-900 text-zinc-300 border-zinc-800'
                }`}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/30"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail View */}
      {selectedCreation && (
        <CreationDetailView
          creation={selectedCreation}
          onClose={() => setSelectedCreation(null)}
          onDelete={onDelete}
          onShare={(c) => {
            setSelectedCreation(null);
            setShareTargetCreation(c);
          }}
        />
      )}

      {/* Share Modal */}
      {shareTargetCreation && (
        <ShareModal
          imageUrl={shareTargetCreation.transformedImage}
          onClose={() => setShareTargetCreation(null)}
          title={`Age-Labes AI - ${shareTargetCreation.personName} (${shareTargetCreation.targetAge} años)`}
          text={`Mira la transformación de ${shareTargetCreation.personName} a los ${shareTargetCreation.targetAge} años creada con Age-Labes AI`}
        />
      )}
    </div>
  );
};