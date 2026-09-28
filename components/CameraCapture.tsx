import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { ImageData } from '../types';
import { CameraAltIcon, CloseVectorIcon } from './icons/AppIcons';
import { useI18n } from '../context/I18nContext';
import { useTheme } from '../context/ThemeContext';

interface CameraCaptureProps {
  onCapture: (imageData: ImageData) => void;
  onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const { t } = useI18n();
  const { resolvedTheme } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);

  const isLight = resolvedTheme === 'light';

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        if (videoInputs.length > 1) {
          setHasMultipleCameras(true);
        }
      }).catch(() => {});
    }
  }, []);

  const startCamera = useCallback(async (mode: 'user' | 'environment') => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode,
            width: { ideal: 1280 },
            height: { ideal: 1280 },
          },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
        setStream(newStream);
        setError(null);
      } else {
        setError('Tu navegador o dispositivo no soporta el acceso directo a la cámara.');
      }
    } catch (err) {
      console.error('Error al acceder a la cámara:', err);
      setError('No se pudo acceder a la cámara. Por favor concede permisos de cámara en Android/Navegador.');
    }
  }, [stream]);

  useEffect(() => {
    startCamera(facingMode);

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  const toggleCamera = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 640;

      const context = canvas.getContext('2d');
      if (context) {
        if (facingMode === 'user') {
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
        }

        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/png');
        const base64 = dataUrl.split(',')[1];

        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try { navigator.vibrate(30); } catch {}
        }

        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }

        onCapture({
          url: dataUrl,
          base64: base64,
          mimeType: 'image/png',
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <CameraAltIcon className="w-5 h-5 text-sky-400" />
            <span className="font-bold text-sm text-white">Age-Labes AI</span>
          </div>

          <div className="flex items-center gap-2">
            {hasMultipleCameras && (
              <button
                onClick={toggleCamera}
                className="px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] font-semibold text-zinc-300 hover:text-white transition-colors"
              >
                {facingMode === 'user' ? 'Frontal' : 'Trasera'}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <CloseVectorIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video stream container */}
        <div className="relative aspect-square w-full bg-black overflow-hidden flex items-center justify-center">
          {error ? (
            <div className="p-6 text-center text-red-400 text-xs">{error}</div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />

              {/* Face Guide Overlay */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-56 h-72 border-2 border-dashed border-sky-400/60 rounded-[50%] shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]" />
                <span className="mt-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold border border-white/20">
                  {t('cameraGuidance')}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Action Controls */}
        <div className="p-5 flex items-center justify-around bg-zinc-900/90 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            {t('cancel')}
          </button>

          {/* Big Shutter button */}
          <button
            onClick={handleCapture}
            disabled={!!error}
            className="w-16 h-16 rounded-full border-4 border-white bg-sky-500 hover:bg-sky-400 active:scale-95 flex items-center justify-center shadow-xl shadow-sky-500/30 transition-all disabled:opacity-50"
            title={t('capture')}
          >
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <CameraAltIcon className="w-7 h-7 text-white" />
            </div>
          </button>

          {hasMultipleCameras ? (
            <button
              onClick={toggleCamera}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
            >
              {t('switchCamera')}
            </button>
          ) : (
            <div className="w-12" />
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};
