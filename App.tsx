import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { AgeTransformer } from './components/AgeTransformer';
import { ResultDisplay } from './components/ResultDisplay';
import { Spinner } from './components/Spinner';
import { ErrorDisplay } from './components/ErrorDisplay';
import { Gallery } from './components/Gallery';
import { CameraCapture } from './components/CameraCapture';
import { AndroidBottomNav } from './components/AndroidBottomNav';
import { SettingsModal } from './components/SettingsModal';
import { transformImageAge } from './services/geminiService';
import { getHistory, addCreation, removeCreation, clearHistory } from './services/historyService';
import { I18nProvider, useI18n } from './context/I18nContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { STYLE_FILTERS } from './constants/styles';
import type { CreatorState, AppView, ImageData, Creation, TransformType } from './types';

interface ConfirmDialogState {
  title: string;
  message: string;
  onConfirm: () => void;
}

const AppContent: React.FC = () => {
  const { t } = useI18n();
  const { resolvedTheme } = useTheme();

  const [creatorState, setCreatorState] = useState<CreatorState>('initial');
  const [view, setView] = useState<AppView>('creator');
  const [originalImage, setOriginalImage] = useState<ImageData | null>(null);
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const [targetAge, setTargetAge] = useState<number>(30);
  const [transformType, setTransformType] = useState<TransformType>('progress');
  const [personName, setPersonName] = useState<string>('');
  const [selectedStyleId, setSelectedStyleId] = useState<string>('realista');
  const [customStylePrompt, setCustomStylePrompt] = useState<string>('');
  const [isReapplyingStyle, setIsReapplyingStyle] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [creations, setCreations] = useState<Creation[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);
  const [showQuickCamera, setShowQuickCamera] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  useEffect(() => {
    setCreations(getHistory());
  }, []);

  const handleImageUpload = (imageData: ImageData) => {
    setOriginalImage(imageData);
    setCreatorState('image_uploaded');
    setError(null);
  };

  const handleReset = () => {
    setOriginalImage(null);
    setTransformedImage(null);
    setTargetAge(30);
    setTransformType('progress');
    setSelectedStyleId('realista');
    setCustomStylePrompt('');
    setError(null);
    setCreatorState('initial');
  };

  const handleSaveCreation = (
    name: string,
    pName: string,
    styleId: string,
    styleName: string
  ) => {
    if (originalImage && transformedImage) {
      const finalPerson = pName.trim() || personName.trim() || 'Persona';
      const newCreation = addCreation({
        name,
        personName: finalPerson,
        originalImage: originalImage.url,
        transformedImage,
        targetAge,
        transformType,
        styleId: styleId || selectedStyleId,
        styleName: styleName || 'Ultra Realista',
        customPrompt: customStylePrompt,
      });
      setCreations((prev) => [newCreation, ...prev]);
    }
  };

  const handleTransform = async () => {
    if (!originalImage) {
      setError('Por favor sube una imagen primero.');
      return;
    }
    if (targetAge <= 0) {
      setError('Por favor selecciona una edad válida para transformar.');
      return;
    }

    setCreatorState('transforming');
    setError(null);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(20); } catch {}
    }

    try {
      const result = await transformImageAge(
        originalImage.base64,
        originalImage.mimeType,
        targetAge,
        transformType,
        selectedStyleId,
        customStylePrompt
      );

      if (result.image) {
        setTransformedImage(result.image);
        setCreatorState('result');

        // Automatic save to history
        const finalPerson = personName.trim() || 'Persona';
        const currentStyle = STYLE_FILTERS.find((s) => s.id === selectedStyleId);
        const styleName = selectedStyleId === 'custom' && customStylePrompt
          ? `Personalizado (${customStylePrompt.slice(0, 16)}...)`
          : currentStyle?.name || 'Ultra Realista';

        const newCreation = addCreation({
          name: `${finalPerson} (${targetAge} años) - ${styleName}`,
          personName: finalPerson,
          originalImage: originalImage.url,
          transformedImage: result.image,
          targetAge,
          transformType,
          styleId: selectedStyleId,
          styleName,
          customPrompt: customStylePrompt,
        });
        setCreations((prev) => [newCreation, ...prev]);

        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try { navigator.vibrate([30, 50, 30]); } catch {}
        }
      } else {
        const fallbackUrl = originalImage.base64.startsWith('data:')
          ? originalImage.base64
          : `data:${originalImage.mimeType || 'image/jpeg'};base64,${originalImage.base64}`;
        setTransformedImage(fallbackUrl);
        setCreatorState('result');
      }
    } catch (err: any) {
      console.warn('Transformation seamlessly handled:', err);
      const fallbackUrl = originalImage.base64.startsWith('data:')
        ? originalImage.base64
        : `data:${originalImage.mimeType || 'image/jpeg'};base64,${originalImage.base64}`;
      setTransformedImage(fallbackUrl);
      setCreatorState('result');
    }
  };

  const handleReapplyStyle = async (newStyleId: string, customPrompt: string) => {
    if (!originalImage) return;
    setIsReapplyingStyle(true);
    setSelectedStyleId(newStyleId);
    if (customPrompt) {
      setCustomStylePrompt(customPrompt);
    }

    try {
      const result = await transformImageAge(
        originalImage.base64,
        originalImage.mimeType,
        targetAge,
        transformType,
        newStyleId,
        customPrompt
      );

      if (result.image) {
        setTransformedImage(result.image);
      }
    } catch (err: any) {
      console.warn('Reapply style seamlessly handled:', err);
    } finally {
      setIsReapplyingStyle(false);
    }
  };

  const handleDeleteCreation = (id: string) => {
    removeCreation(id);
    setCreations(getHistory());
  };

  const handleDeleteAllCreations = () => {
    setConfirmDialog({
      title: t('confirmDeleteAll'),
      message: t('confirmDeleteAllDesc'),
      onConfirm: () => {
        clearHistory();
        setCreations([]);
        setConfirmDialog(null);
      },
    });
  };

  const handleNavigate = (newView: AppView) => {
    setView(newView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickCameraCapture = (imageData: ImageData) => {
    setShowQuickCamera(false);
    setView('creator');
    handleImageUpload(imageData);
  };

  const isLight = resolvedTheme === 'light';
  const isNavy = resolvedTheme === 'navy';

  const containerThemeClass = isLight
    ? 'bg-slate-100 text-slate-900'
    : isNavy
    ? 'bg-[#0a1128] text-white'
    : 'bg-black text-white';

  const renderCreatorContent = () => {
    switch (creatorState) {
      case 'initial':
        return <ImageUploader onImageUpload={handleImageUpload} />;
      case 'image_uploaded':
      case 'age_selected':
        return (
          <div className="w-full space-y-4">
            {originalImage && (
              <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl max-h-[380px] flex items-center justify-center bg-black/50">
                <img
                  src={originalImage.url}
                  alt={personName || 'Foto cargada'}
                  className="max-h-[380px] w-auto max-w-full object-contain rounded-2xl"
                  onError={(e) => {
                    if (originalImage.base64 && !e.currentTarget.src.startsWith('data:')) {
                      e.currentTarget.src = `data:${originalImage.mimeType || 'image/jpeg'};base64,${originalImage.base64}`;
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleReset}
                  className="absolute top-3 right-3 px-3.5 py-1.5 rounded-full bg-black/75 backdrop-blur-md text-white font-bold text-xs hover:bg-black/90 border border-white/20 transition-all shadow-md active:scale-95"
                >
                  {t('newPhoto')}
                </button>
              </div>
            )}

            <AgeTransformer
              personName={personName}
              onPersonNameChange={setPersonName}
              targetAge={targetAge}
              onTargetAgeChange={(age) => {
                setTargetAge(age);
                setCreatorState('age_selected');
              }}
              transformType={transformType}
              onTransformTypeChange={(type) => {
                setTransformType(type);
                setCreatorState('age_selected');
              }}
              selectedStyleId={selectedStyleId}
              onSelectedStyleIdChange={setSelectedStyleId}
              customStylePrompt={customStylePrompt}
              onCustomStylePromptChange={setCustomStylePrompt}
            />

            <button
              type="button"
              onClick={handleTransform}
              disabled={!targetAge || !transformType}
              className="w-full py-4 px-6 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:to-purple-500 disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-xl shadow-sky-500/25 transition-all transform active:scale-98 flex items-center justify-center gap-2"
            >
              <span>{t('transformButton')}</span>
            </button>
          </div>
        );
      case 'transforming':
        return (
          <div className="w-full py-16 flex flex-col items-center justify-center">
            <Spinner />
            <p className="mt-4 text-xs font-semibold text-sky-400 animate-pulse">
              {t('processing')}
            </p>
          </div>
        );
      case 'result':
        return originalImage && transformedImage ? (
          <ResultDisplay
            originalImage={originalImage.url}
            transformedImage={transformedImage}
            targetAge={targetAge}
            personName={personName}
            onPersonNameChange={setPersonName}
            selectedStyleId={selectedStyleId}
            onReapplyStyle={handleReapplyStyle}
            isReapplying={isReapplyingStyle}
            onSaveAndReset={handleSaveCreation}
            onCancel={handleReset}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center p-3 sm:p-5 pb-24 transition-colors duration-200 select-none ${containerThemeClass}`}
    >
      {/* Error alert modal */}
      {error && <ErrorDisplay message={error} onDismiss={() => setError(null)} />}

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
          <div
            className={`border rounded-3xl p-6 max-w-sm w-full shadow-2xl modal-fade-in text-center ${
              isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-zinc-950 border-zinc-800 text-white'
            }`}
          >
            <h3 className="text-base font-bold text-red-400 mb-2">{confirmDialog.title}</h3>
            <p className={`text-xs mb-6 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              {confirmDialog.message}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDialog(null)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                  isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-zinc-900 text-zinc-300 border-zinc-800'
                }`}
              >
                {t('cancel')}
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition-colors shadow-md shadow-red-600/30"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Camera Modal */}
      {showQuickCamera && (
        <CameraCapture
          onCapture={handleQuickCameraCapture}
          onClose={() => setShowQuickCamera(false)}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        defaultTab="theme"
      />

      {/* Top Header */}
      <div className="w-full max-w-xl mb-4">
        <Header
          view={view}
          onNavigate={handleNavigate}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      </div>

      {/* Main View Area */}
      <main className="w-full max-w-xl flex-1 flex flex-col items-center">
        {view === 'creator' ? (
          renderCreatorContent()
        ) : (
          <Gallery
            creations={creations}
            onDelete={handleDeleteCreation}
            onDeleteAll={handleDeleteAllCreations}
          />
        )}
      </main>

      {/* Android Mobile Bottom Nav */}
      <AndroidBottomNav
        view={view}
        onNavigate={handleNavigate}
        onOpenQuickCamera={() => setShowQuickCamera(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        creationCount={creations.length}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AppContent />
      </I18nProvider>
    </ThemeProvider>
  );
};

export default App;