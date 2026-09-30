import type { TransformResult, TransformType } from '../types';
import { generateWithPollinations } from './pollinationsService';

/**
 * AI Transformation Service - Powered directly by Pollinations.ai
 * Completely without Gemini or local canvas filter fallbacks.
 * Direct error reporting if the AI model fails.
 */
export const transformImageAge = async (
  _base64ImageData: string,
  _mimeType: string,
  targetAge: number,
  transformType: TransformType,
  styleId: string = 'realista',
  customStylePrompt: string = '',
  personName: string = ''
): Promise<TransformResult> => {
  // Direct Pollinations AI generation
  const pollinationsImage = await generateWithPollinations(
    targetAge,
    transformType,
    styleId,
    customStylePrompt,
    personName
  );

  if (!pollinationsImage) {
    throw new Error('La IA no devolvió ninguna imagen.');
  }

  return {
    image: pollinationsImage,
    text: null,
  };
};