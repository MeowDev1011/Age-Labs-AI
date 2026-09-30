import React, { useState, useEffect } from 'react';
import { getRandomFact } from '../services/factsService';
import { getWaitingMessages } from '../i18n/waitingMessages';
import type { SupportedLanguage } from '../i18n/languages';
import { useTheme } from '../context/ThemeContext';

interface WaitingScreenProps {
  duration?: number; // in seconds
  language: SupportedLanguage;
  onComplete?: () => void;
}

export const WaitingScreen: React.FC<WaitingScreenProps> = ({
  duration = 120, // 2 minutes default
  language,
  onComplete,
}) => {
  const { resolvedTheme } = useTheme();
  const [secondsLeft, setSecondsLeft] = useState(duration);
  const [fact, setFact] = useState(getRandomFact(language));
  const messages = getWaitingMessages(language);
  const isLight = resolvedTheme === 'light';
  const isNavy = resolvedTheme === 'navy';

  const containerClass = isLight
    ? 'bg-slate-100 text-slate-900'
    : isNavy
    ? 'bg-[#0a1128] text-white'
    : 'bg-black text-white';

  const cardClass = isLight
    ? 'bg-white border-slate-200 text-slate-900'
    : isNavy
    ? 'bg-[#1a2847] border-blue-900/30 text-white'
    : 'bg-zinc-900 border-zinc-800 text-white';

  useEffect(() => {
    if (secondsLeft <= 0) {
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setSecondsLeft(secondsLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft, onComplete]);

  useEffect(() => {
    const factInterval = setInterval(() => {
      setFact(getRandomFact(language));
    }, 10000); // Change fact every 10 seconds

    return () => clearInterval(factInterval);
  }, [language]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = ((duration - secondsLeft) / duration) * 100;

  return (
    <div className={`w-full min-h-screen flex flex-col items-center justify-center p-4 ${containerClass} transition-colors duration-200`}>
      {/* Main card */}
      <div className={`w-full max-w-md rounded-3xl border p-8 shadow-2xl ${cardClass}`}>
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black mb-2">{messages.title}</h2>
          <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
            {messages.subtitle}
          </p>
        </div>

        {/* Animated spinner */}
        <div className="flex justify-center mb-8">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 opacity-20 blur-xl animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-sky-500 border-r-indigo-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-purple-600 border-l-sky-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-sky-400">
                {Math.floor((duration - secondsLeft) / duration * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className={`w-full h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-zinc-700'}`}>
            <div
              className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 transition-all duration-1000"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Countdown timer */}
        <div className="text-center mb-8">
          <p className={`text-xs font-semibold mb-2 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
            {messages.countdown}
          </p>
          <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 font-mono">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <p className={`text-xs mt-2 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
            {messages.pleasewait}
          </p>
        </div>

        {/* Fact or news section */}
        {fact && (
          <div className={`p-4 rounded-2xl mb-6 ${isLight ? 'bg-sky-50 border border-sky-200' : isNavy ? 'bg-blue-900/20 border border-blue-700/30' : 'bg-indigo-900/20 border border-indigo-700/30'}`}>
            <p className={`text-xs font-semibold mb-2 ${isLight ? 'text-sky-700' : 'text-sky-300'}`}>
              ✨ {messages.factLabel}
            </p>
            <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-700' : 'text-zinc-200'}`}>
              {fact.text}
            </p>
            {fact.category && (
              <p className={`text-xs mt-2 font-medium ${isLight ? 'text-sky-600' : 'text-sky-400'}`}>
                #{fact.category}
              </p>
            )}
          </div>
        )}

        {/* Tip */}
        <div className={`p-3 rounded-xl text-center ${isLight ? 'bg-amber-50 border border-amber-200' : isNavy ? 'bg-amber-900/20 border border-amber-700/30' : 'bg-amber-900/20 border border-amber-700/30'}`}>
          <p className={`text-xs ${isLight ? 'text-amber-700' : 'text-amber-300'}`}>
            💡 {messages.tip}
          </p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-sky-500/10 rounded-full filter blur-3xl pointer-events-none -z-10"></div>
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl pointer-events-none -z-10"></div>
    </div>
  );
};

export default WaitingScreen;
