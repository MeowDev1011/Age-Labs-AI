import type { SupportedLanguage } from '../i18n/languages';

export interface FactItem {
  text: string;
  category?: string;
}

const FACTS_BY_LANGUAGE: Partial<Record<SupportedLanguage, FactItem[]>> = {
  es: [
    {
      text: 'El rostro humano utiliza más de 40 músculos para expresar emociones, y las líneas de expresión reflejan las emociones más repetidas a lo largo de la vida.',
      category: 'AnatomíaFacial',
    },
    {
      text: 'Las orejas y la punta de la nariz continúan cambiando sutilmente durante toda la vida debido al efecto de la gravedad sobre el cartílago.',
      category: 'CienciaDeLaEdad',
    },
    {
      text: 'Las canas aparecen cuando los melanocitos dejan de producir melanina; en realidad el cabello canoso es translúcido y refleja la luz como plata.',
      category: 'Curiosidades',
    },
    {
      text: 'Los modelos de visión e IA generativa identifican más de 128 puntos biométricos clave para preservar tu identidad al simular el paso del tiempo.',
      category: 'InteligenciaArtificial',
    },
    {
      text: 'Sonreír frecuentemente en la juventud moldea los pliegues nasolabiales de forma ascendente, haciendo que el rostro maduro luzca más cálido y jovial.',
      category: 'Bienestar',
    },
  ],
  en: [
    {
      text: 'The human face uses over 40 muscles to express emotions, and expression lines map out our most frequent feelings over a lifetime.',
      category: 'FacialAnatomy',
    },
    {
      text: 'Ears and noses subtly change throughout life due to gravity acting on cartilage and collagen.',
      category: 'AgeScience',
    },
    {
      text: 'Gray hair is actually translucent—it appears silver or white because light reflects off air bubbles inside the hair shaft.',
      category: 'Trivia',
    },
    {
      text: 'Generative AI models track over 128 facial landmarks to preserve your unique identity while transforming your age.',
      category: 'ArtificialIntelligence',
    },
  ],
  pt: [
    {
      text: 'O rosto humano utiliza mais de 40 músculos para expressar emoções, moldando nossas linhas de expressão ao longo da vida.',
      category: 'AnatomiaFacial',
    },
    {
      text: 'Modelos de IA generativa analisam mais de 128 pontos faciais para manter sua identidade ao transformar sua idade.',
      category: 'InteligenciaArtificial',
    },
  ],
  fr: [
    {
      text: 'Le visage humain utilise plus de 40 muscles pour exprimer des émotions tout au long de la vie.',
      category: 'AnatomieFaciale',
    },
    {
      text: "L'IA générative analyse plus de 128 points biométriques pour préserver votre identité lors de la transformation d'âge.",
      category: 'IntelligenceArtificielle',
    },
  ],
};

export const getRandomFact = (language: SupportedLanguage): FactItem => {
  const list = FACTS_BY_LANGUAGE[language] || FACTS_BY_LANGUAGE.es || FACTS_BY_LANGUAGE.en!;
  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
};
