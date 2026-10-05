import { GoogleGenAI } from '@google/genai';
import type { TransformResult, TransformType } from '../types';
import { STYLE_FILTERS } from '../constants/styles';
import { generateWithPuter } from './puterService';
import { generateWithPollinations } from './pollinationsService';

const getAIClient = (): GoogleGenAI | null => {
  try {
    const apiKey =
      (typeof process !== 'undefined' &&
        process.env &&
        (process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.VITE_GEMINI_API_KEY)) ||
      (typeof import.meta !== 'undefined' &&
        import.meta.env &&
        (import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY)) ||
      '';

    if (!apiKey || apiKey === 'undefined' || apiKey === 'null') {
      return null;
    }

    return new GoogleGenAI({ apiKey });
  } catch {
    return null;
  }
};

const generatePrompt = (
  targetAge: number,
  transformType: TransformType,
  styleId?: string,
  customStylePrompt?: string,
  personName?: string
): string => {
  const ageInstruction =
    transformType === 'regress'
      ? `Rejuvenecer a la persona en la imagen para que aparente exactamente ${targetAge} años de edad, piel fresca, suave y luminosa.`
      : `Envejecer a la persona en la imagen para que aparente exactamente ${targetAge} años de edad, con signos naturales del paso del tiempo, canas realistas y líneas de expresión auténticas.`;

  let styleInstruction = '';
  if (customStylePrompt && customStylePrompt.trim().length > 0) {
    styleInstruction = `ESTILO ARTÍSTICO PERSONALIZADO: ${customStylePrompt.trim()}. Aplica este estilo manteniendo la identidad facial de la persona.`;
  } else if (styleId && styleId !== 'realista') {
    const selectedStyle = STYLE_FILTERS.find((s) => s.id === styleId);
    if (selectedStyle) {
      styleInstruction = `ESTILO ARTÍSTICO (${selectedStyle.name}): ${selectedStyle.promptModifier}. Mantén el rostro y parecido de la persona.`;
    }
  } else {
    styleInstruction = `ESTILO VISUAL: Fotorrealismo ultra detallado 8K, iluminación fotográfica de estudio, textura de piel natural.`;
  }

  const namePart = personName && personName.trim() ? ` (${personName.trim()})` : '';

  return `Transformación de edad y estilo de retrato${namePart}: ${ageInstruction} Conserva la identidad facial exacta (ojos, nariz, boca, expresión y facciones). ${styleInstruction} Devuelve únicamente la imagen resultante en alta calidad.`;
};

/**
 * 3-Stage Real AI Transformation Pipeline:
 * 1. Google Gemini AI (gemini-3.1-flash-lite-image)
 * 2. Puter.js AI (puter.ai.txt2img with input_image)
 * 3. Pollinations.ai Neural Generator
 */
export const transformImageAge = async (
  base64ImageData: string,
  mimeType: string,
  targetAge: number,
  transformType: TransformType,
  styleId: string = 'realista',
  customStylePrompt: string = '',
  personName: string = ''
): Promise<TransformResult> => {
  const safeMime = mimeType && mimeType.startsWith('image/') ? mimeType : 'image/jpeg';
  const rawBase64 = base64ImageData.includes(',')
    ? base64ImageData.split(',')[1]
    : base64ImageData;
  const prompt = generatePrompt(targetAge, transformType, styleId, customStylePrompt, personName);
  const errors: string[] = [];

  // 1. Intento 1: Google Gemini AI
  const ai = getAIClient();
  if (ai) {
    try {
      const apiPromise = ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: rawBase64,
                mimeType: safeMime,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini timeout')), 6000)
      );

      const response: any = await Promise.race([apiPromise, timeoutPromise]);
      const candidate = response?.candidates?.[0];
      if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData?.data) {
            const mime = part.inlineData.mimeType || 'image/png';
            return {
              image: `data:${mime};base64,${part.inlineData.data}`,
              text: null,
            };
          }
        }
      }
      errors.push('Gemini no devolvió imagen');
    } catch (geminiErr: any) {
      console.warn('Gemini falló, intentando con Puter.js:', geminiErr?.message || geminiErr);
      errors.push(`Gemini: ${geminiErr?.status || geminiErr?.message || 'Error de cuota'}`);
    }
  } else {
    errors.push('Gemini: Sin API Key configurada');
  }

  // 2. Intento 2: Puter.js AI
  try {
    const puterImage = await generateWithPuter(prompt, rawBase64, safeMime);
    if (puterImage && puterImage.length > 50) {
      return {
        image: puterImage,
        text: null,
      };
    }
    errors.push('Puter.js no devolvió imagen');
  } catch (puterErr: any) {
    console.warn('Puter.js falló, intentando con Pollinations.ai:', puterErr?.message || puterErr);
    errors.push(`Puter.js: ${puterErr?.message || 'No disponible'}`);
  }

  // 3. Intento 3: Pollinations.ai
  try {
    const pollinationsImage = await generateWithPollinations(
      targetAge,
      transformType,
      styleId,
      customStylePrompt,
      personName
    );
    if (pollinationsImage && pollinationsImage.length > 50) {
      return {
        image: pollinationsImage,
        text: null,
      };
    }
    errors.push('Pollinations.ai no devolvió imagen');
  } catch (pollinationsErr: any) {
    console.error('Pollinations.ai también falló:', pollinationsErr?.message || pollinationsErr);
    errors.push(`Pollinations: ${pollinationsErr?.message || 'Error de conexión'}`);
  }

  throw new Error(
    `No se pudo generar la imagen con IA tras intentar los 3 motores (${errors.join(' | ')}). Por favor intenta nuevamente.`
  );
};