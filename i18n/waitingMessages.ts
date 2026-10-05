import type { SupportedLanguage } from './languages';

export interface WaitingMessages {
  title: string;
  subtitle: string;
  countdown: string;
  pleasewait: string;
  factLabel: string;
  tip: string;
}

const MESSAGES: Partial<Record<SupportedLanguage, WaitingMessages>> = {
  es: {
    title: 'Transformando con IA...',
    subtitle: 'Analizando rasgos faciales y generando tu retrato de alta precisión',
    countdown: 'TIEMPO ESTIMADO RESTANTE',
    pleasewait: 'Por favor no cierres esta ventana mientras la IA procesa tu foto',
    factLabel: '¿Sabías que?',
    tip: 'Las fotos bien iluminadas y de frente producen resultados mucho más realistas.',
  },
  en: {
    title: 'Transforming with AI...',
    subtitle: 'Analyzing facial landmarks and generating your high-precision portrait',
    countdown: 'ESTIMATED TIME REMAINING',
    pleasewait: 'Please keep this window open while the AI processes your photo',
    factLabel: 'Did you know?',
    tip: 'Well-lit, front-facing photos produce the most realistic transformations.',
  },
  pt: {
    title: 'Transformando com IA...',
    subtitle: 'Analisando traços faciais e gerando seu retrato de alta precisão',
    countdown: 'TEMPO ESTIMADO RESTANTE',
    pleasewait: 'Por favor aguarde enquanto a IA processa sua foto',
    factLabel: 'Você sabia?',
    tip: 'Fotos bem iluminadas e de frente geram resultados muito mais realistas.',
  },
  fr: {
    title: 'Transformation par IA...',
    subtitle: 'Analyse des traits du visage et génération de votre portrait',
    countdown: 'TEMPS RESTANT ESTIMÉ',
    pleasewait: 'Veuillez patienter pendant que l’IA traite votre photo',
    factLabel: 'Le saviez-vous ?',
    tip: 'Les photos bien éclairées de face donnent les meilleurs résultats.',
  },
};

export const getWaitingMessages = (language: SupportedLanguage): WaitingMessages => {
  return MESSAGES[language] || MESSAGES.es!;
};
