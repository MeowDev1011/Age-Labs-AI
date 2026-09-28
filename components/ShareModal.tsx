import React, { useState } from 'react';
import {
  ShareVectorIcon,
  WhatsAppVectorIcon,
  TelegramVectorIcon,
  TwitterXVectorIcon,
  CopyVectorIcon,
  DownloadVectorIcon,
  CheckVectorIcon,
  CloseVectorIcon,
} from './icons/AppIcons';
import { useI18n } from '../context/I18nContext';
import { useTheme } from '../context/ThemeContext';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  name?: string;
  targetAge?: number;
  imageUrl: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  targetAge,
  imageUrl,
}) => {
  const { t } = useI18n();
  const { resolvedTheme } = useTheme();
  const [copied, setCopied] = useState<string | null>(null);
  const [isSharingNative, setIsSharingNative] = useState(false);

  if (!isOpen) return null;

  const isLight = resolvedTheme === 'light';
  const isNavy = resolvedTheme === 'navy';

  const modalBg = isLight
    ? 'bg-white text-slate-900 border-slate-200'
    : isNavy
    ? 'bg-[#101b3b] text-white border-blue-900/60'
    : 'bg-zinc-950 text-white border-zinc-800';

  const cardOptionBg = isLight
    ? 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
    : isNavy
    ? 'border-blue-900/40 bg-[#0d1736] hover:bg-[#15234f] text-slate-200'
    : 'border-zinc-800/80 bg-zinc-900/70 hover:bg-zinc-900 text-zinc-200';

  const shareText = `Age-Labes AI ${targetAge ? `(${targetAge} ${t('yearsOld')})` : ''} - Check out this age transformation!`;
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      setIsSharingNative(true);
      try {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        const file = new File([blob], `age-labes-${Date.now()}.png`, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: title || 'Age-Labes AI',
            text: shareText,
            files: [file],
          });
        } else {
          await navigator.share({
            title: title || 'Age-Labes AI',
            text: shareText,
            url: shareUrl,
          });
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.warn('Native share failed:', err);
        }
      } finally {
        setIsSharingNative(false);
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied('link');
      setTimeout(() => setCopied(null), 2500);
    } catch {
      setCopied(null);
    }
  };

  const handleCopyImage = async () => {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      setCopied('image');
      setTimeout(() => setCopied(null), 2500);
    } catch {
      handleDownload();
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `age-labes-creation-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-end sm:items-center z-50 p-0 sm:p-4 animate-fadeIn">
      <div className={`w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border shadow-2xl p-5 overflow-hidden modal-fade-in ${modalBg}`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/40">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <ShareVectorIcon className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm">{t('shareCreation')}</h3>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Age-Labes AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-zinc-800 text-zinc-400'
            }`}
          >
            <CloseVectorIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Thumbnail Preview */}
        <div className="my-3.5 flex items-center gap-3 p-2.5 rounded-2xl bg-slate-500/10 border border-slate-700/30">
          <img
            src={imageUrl}
            alt="Preview"
            className="w-14 h-14 rounded-xl object-cover border border-slate-700/50 shadow-sm shrink-0"
          />
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold truncate block">Age-Labes AI</span>
            <span className={`text-[11px] truncate block ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              {targetAge ? `${targetAge} ${t('yearsOld')}` : t('transformed')}
            </span>
          </div>
        </div>

        {/* Share Options */}
        <div className="space-y-2">
          {hasNativeShare && (
            <button
              onClick={handleNativeShare}
              disabled={isSharingNative}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-sky-500/20 active:scale-98 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <ShareVectorIcon className="w-4 h-4 text-white" />
                <span>{isSharingNative ? 'Abriendo menú...' : t('shareNative')}</span>
              </div>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                Nativo
              </span>
            </button>
          )}

          <div className="grid grid-cols-3 gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all ${cardOptionBg}`}
            >
              <WhatsAppVectorIcon className="w-6 h-6 mb-1 text-emerald-400" />
              <span className="text-[11px] font-semibold">{t('shareWhatsApp')}</span>
            </a>

            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all ${cardOptionBg}`}
            >
              <TelegramVectorIcon className="w-6 h-6 mb-1 text-sky-400" />
              <span className="text-[11px] font-semibold">{t('shareTelegram')}</span>
            </a>

            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all ${cardOptionBg}`}
            >
              <TwitterXVectorIcon className="w-6 h-6 mb-1 text-white" />
              <span className="text-[11px] font-semibold">{t('shareX')}</span>
            </a>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleCopyImage}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-2xl border transition-all text-xs font-semibold ${cardOptionBg}`}
            >
              {copied === 'image' ? (
                <>
                  <CheckVectorIcon className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">¡Copiada!</span>
                </>
              ) : (
                <>
                  <CopyVectorIcon className="w-4 h-4 text-sky-400" />
                  <span>Copiar Imagen</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyLink}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-2xl border transition-all text-xs font-semibold ${cardOptionBg}`}
            >
              {copied === 'link' ? (
                <>
                  <CheckVectorIcon className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">¡Copiado!</span>
                </>
              ) : (
                <>
                  <CopyVectorIcon className="w-4 h-4 text-sky-400" />
                  <span>Copiar Enlace</span>
                </>
              )}
            </button>
          </div>

          <button
            onClick={handleDownload}
            className={`w-full flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all text-xs font-bold ${cardOptionBg}`}
          >
            <DownloadVectorIcon className="w-4 h-4 text-sky-400" />
            <span>{t('downloadImage')}</span>
          </button>
        </div>

        {/* Close Button */}
        <div className="mt-4 pt-2">
          <button
            onClick={onClose}
            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all border ${cardOptionBg}`}
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};
