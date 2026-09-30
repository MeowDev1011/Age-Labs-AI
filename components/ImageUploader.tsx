import React, { useState, useCallback } from 'react';
import type { ImageData } from '../types';
import { CameraCapture } from './CameraCapture';
import { useI18n } from '../context/I18nContext';
import { useTheme } from '../context/ThemeContext';
import { processAndNormalizeImage } from '../utils/imageProcessor';

interface ImageUploaderProps {
  onImageUpload: (imageData: ImageData) => void;
}

const FileIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-12 w-12 text-sky-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const CameraIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M2 6a2 2 0 012-2h1.586a1 1 0 01.707.293l1.414 1.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l1.414-1.414A1 1 0 0114.414 4H16a2 2 0 012 2v1h-2a3 3 0 00-3 3v2a3 3 0 003 3h2v1a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
    <path d="M15 10a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1z" />
  </svg>
);

const MAX_SIZE_MB = 25;

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const { t } = useI18n();
  const { resolvedTheme } = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const isLight = resolvedTheme === 'light';
  const isNavy = resolvedTheme === 'navy';

  const containerBg = isLight
    ? 'bg-white border-slate-200/90 text-slate-800'
    : isNavy
    ? 'bg-[#0d1736] border-blue-900/60 text-white'
    : 'bg-zinc-950 border-zinc-800/80 text-white';

  const dropZoneBg = isLight
    ? 'border-slate-300 hover:border-sky-500 bg-slate-50/80 hover:bg-slate-100/80'
    : isNavy
    ? 'border-blue-900/60 hover:border-sky-400 bg-[#0a1128]/80 hover:bg-[#121f47]/80'
    : 'border-zinc-800 hover:border-sky-500 bg-zinc-900/60 hover:bg-zinc-900';

  const processImageFile = async (file: Blob | File) => {
    setIsProcessing(true);
    setError(null);

    try {
      const imageData = await processAndNormalizeImage(file);
      setIsProcessing(false);
      onImageUpload(imageData);
    } catch (err: any) {
      console.error('Error processing image:', err);
      setIsProcessing(false);
      setError('No se pudo procesar la imagen seleccionada. Intenta con otra foto en JPG o PNG.');
    }
  };

  const handleFileChange = useCallback(
    (files: FileList | null) => {
      setError(null);
      if (!files || files.length === 0) return;

      const file = files[0];
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`La imagen es demasiado grande. El tamaño máximo es ${MAX_SIZE_MB}MB.`);
        return;
      }

      processImageFile(file);
    },
    [onImageUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      handleFileChange(e.dataTransfer.files);
    },
    [handleFileChange]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleCameraCapture = (imageData: ImageData) => {
    setShowCamera(false);
    onImageUpload(imageData);
  };

  const sampleImages = [
    {
      label: 'Joven',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
    },
    {
      label: 'Adulto',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80',
    },
    {
      label: 'Mayor',
      url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=80',
    },
  ];

  const handleSampleClick = async (sampleUrl: string) => {
    setIsProcessing(true);
    setError(null);
    try {
      const response = await fetch(sampleUrl);
      const blob = await response.blob();
      processImageFile(blob);
    } catch (err) {
      setIsProcessing(false);
      setError('No se pudo cargar la imagen de ejemplo.');
    }
  };

  return (
    <div className={`w-full p-4 sm:p-6 rounded-3xl border shadow-xl transition-colors ${containerBg}`}>
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center flex flex-col items-center justify-center transition-all cursor-pointer ${dropZoneBg}`}
        onClick={() => document.getElementById('file-upload-input')?.click()}
      >
        <input
          id="file-upload-input"
          type="file"
          accept="image/*,.heic,.heif,.jpg,.jpeg,.png,.webp,.avif,.bmp,.tiff"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files)}
        />

        <FileIcon />

        <div className="mt-4 flex flex-col items-center">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
            <span className="font-bold text-sm text-sky-400">
              {isProcessing ? 'Cargando imagen...' : t('choosePhoto')}
            </span>
            <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              {t('orDragDrop')}
            </span>
          </div>

          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
            {t('uploadHint')}
          </p>
        </div>
      </div>

      {/* Camera Capture Button */}
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => setShowCamera(true)}
          className="w-full flex items-center justify-center py-3.5 px-4 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-sky-500/20 active:scale-98"
        >
          <CameraIcon />
          <span>{t('takePhoto')}</span>
        </button>
      </div>

      {/* Sample presets */}
      <div className="mt-6 pt-5 border-t border-zinc-800/40">
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
            {t('tryDemos')}
          </span>
          <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
            1-Click
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {sampleImages.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSampleClick(sample.url)}
              disabled={isProcessing}
              className={`group relative rounded-2xl overflow-hidden aspect-square border transition-all text-left ${
                isLight
                  ? 'border-slate-200 hover:border-sky-500'
                  : 'border-zinc-800 hover:border-sky-400'
              }`}
            >
              <img
                src={sample.url}
                alt={sample.label}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2">
                <span className="text-white text-[11px] font-bold">
                  {sample.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-white font-bold ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Camera Capture Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
};