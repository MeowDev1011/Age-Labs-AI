import { GoogleGenAI } from '@google/genai';
import type { TransformResult, TransformType } from '../types';
import { STYLE_FILTERS } from '../constants/styles';
import { generateWithPuter } from './puterService';
import { generateWithPollinations } from './pollinationsService';
import { generateWithFourthBackupAI } from './fluxService';
import {
  getUploadedImageDimensions,
  enforceExactAspectRatio,
} from '../utils/aspectRatio';

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
  personName?: string,
  personVisualDescription?: string,
  aspectRatioLabel?: string
): string => {
  const ageInstruction =
    transformType === 'regress'
      ? `Transformar y rejuvenecer a la persona para que aparente exactamente ${targetAge} años de edad, piel joven, fresca, suave y luminosa.`
      : `Transformar y envejecer a la persona para que aparente exactamente ${targetAge} años de edad, con signos naturales del paso del tiempo, cabello canoso/plateado realista y líneas de expresión auténticas.`;

  let styleInstruction = '';
  if (customStylePrompt && customStylePrompt.trim().length > 0) {
    styleInstruction = `ESTILO ARTÍSTICO PERSONALIZADO: ${customStylePrompt.trim()}. Aplica este estilo manteniendo la identidad facial de la persona.`;
  } else if (styleId && styleId !== 'realista') {
    const selectedStyle = STYLE_FILTERS.find((s) => s.id === styleId);
    if (selectedStyle) {
      styleInstruction = `ESTILO ARTÍSTICO (${selectedStyle.name}): ${selectedStyle.promptModifier}. Mantén el rostro y parecido de la persona.`;
    }
  } else {
    styleInstruction = `ESTILO VISUAL: Retrato fotográfico hiperrealista 8K, iluminación cinematográfica de estudio, textura de piel natural.`;
  }

  const namePart = personName && personName.trim() ? ` (${personName.trim()})` : '';
  const traitsPart =
    personVisualDescription && personVisualDescription.trim()
      ? ` Rasgos físicos exactos del sujeto original a preservar: ${personVisualDescription.trim()}.`
      : '';
  const ratioPart = aspectRatioLabel ? ` Formato y proporción de encuadre: ${aspectRatioLabel}.` : '';

  return `Transformación de edad y estilo de retrato${namePart}: ${ageInstruction}${traitsPart}${ratioPart} Conserva la identidad facial exacta (ojos, nariz, boca, expresión y facciones). ${styleInstruction}`;
};

const extractPersonDescriptionWithGemini = async (
  ai: GoogleGenAI | null,
  rawBase64: string,
  mimeType: string
): Promise<string> => {
  if (!ai) return '';
  try {
    const visionPromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { data: rawBase64, mimeType } },
            {
              text: 'Describe this person in 22 concise English words for a portrait prompt: gender, ethnicity, skin tone, hair style/color, eye color, facial hair or glasses if any, clothing color, and expression.',
            },
          ],
        },
      ],
    });

    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3500));
    const res: any = await Promise.race([visionPromise, timeoutPromise]);
    return res?.text ? res.text.trim().replace(/\n+/g, ' ') : '';
  } catch {
    return '';
  }
};

/**
 * 4-Stage Ultra-Robust Real AI Transformation Pipeline:
 * 1. Priority 1: Google Gemini AI (gemini-3.1-flash-lite-image with native aspectRatio config)
 * 2. Priority 2: Puter.js AI with authenticated JWT Token (no login popup, works on preview & domain)
 * 3. Priority 3: Pollinations.ai Neural Generator (with matching width & height)
 * 4. Priority 4: Black Forest Labs FLUX.1-schnell AI (Hugging Face Gradio v5 API with matching width & height)
 *
 * Every stage enforces the exact aspect ratio of the uploaded image before returning.
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

  // Detect exact dimensions and aspect ratio of the user's uploaded photo
  const dims = await getUploadedImageDimensions(base64ImageData, safeMime);
  const basePrompt = generatePrompt(
    targetAge,
    transformType,
    styleId,
    customStylePrompt,
    personName,
    '',
    dims.geminiAspectRatio
  );
  const errors: string[] = [];

  const ai = getAIClient();
  const visionTraitsPromise = extractPersonDescriptionWithGemini(ai, rawBase64, safeMime);

  // ============================================================================
  // 1. PRIORIDAD 1: Google Gemini AI (gemini-3.1-flash-lite-image)
  // ============================================================================
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
              text: basePrompt,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: dims.geminiAspectRatio,
          },
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini timeout')), 4500)
      );

      const response: any = await Promise.race([apiPromise, timeoutPromise]);
      const candidate = response?.candidates?.[0];
      if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData?.data) {
            const mime = part.inlineData.mimeType || 'image/png';
            const rawImg = `data:${mime};base64,${part.inlineData.data}`;
            const finalImg = await enforceExactAspectRatio(rawImg, dims);
            return {
              image: finalImg,
              text: null,
            };
          }
        }
      }
      errors.push('Gemini sin imagen');
    } catch (geminiErr: any) {
      console.warn(
        'Prioridad 1 (Gemini) no disponible, pasando a Prioridad 2 (Puter.js con token):',
        geminiErr?.message || geminiErr
      );
      errors.push(`Gemini: ${geminiErr?.status || 'cuota agotada'}`);
    }
  } else {
    errors.push('Gemini: sin clave');
  }

  const visualDescription = await visionTraitsPromise;
  const enrichedPrompt = generatePrompt(
    targetAge,
    transformType,
    styleId,
    customStylePrompt,
    personName,
    visualDescription,
    dims.geminiAspectRatio
  );

  // ============================================================================
  // 2. PRIORIDAD 2: Puter.js AI (Token JWT integrado, sin registro)
  // ============================================================================
  try {
    const puterImage = await generateWithPuter(enrichedPrompt, rawBase64, safeMime);
    if (puterImage && puterImage.length > 50) {
      const finalImg = await enforceExactAspectRatio(puterImage, dims);
      return {
        image: finalImg,
        text: null,
      };
    }
    errors.push('Puter.js sin imagen');
  } catch (puterErr: any) {
    console.warn(
      'Prioridad 2 (Puter.js) falló, pasando a Prioridad 3 (Pollinations.ai):',
      puterErr?.message || puterErr
    );
    errors.push(`Puter.js: ${puterErr?.message || 'error'}`);
  }

  // ============================================================================
  // 3. PRIORIDAD 3 (EMERGENCIA 1): Pollinations.ai
  // ============================================================================
  try {
    const pollinationsImage = await generateWithPollinations(
      targetAge,
      transformType,
      styleId,
      customStylePrompt,
      personName,
      visualDescription,
      dims.genWidth,
      dims.genHeight
    );
    if (pollinationsImage && pollinationsImage.length > 50) {
      const finalImg = await enforceExactAspectRatio(pollinationsImage, dims);
      return {
        image: finalImg,
        text: null,
      };
    }
    errors.push('Pollinations sin imagen');
  } catch (pollinationsErr: any) {
    console.warn(
      'Prioridad 3 (Pollinations.ai) falló, pasando a Prioridad 4 (FLUX.1 AI):',
      pollinationsErr?.message || pollinationsErr
    );
    errors.push(`Pollinations: ${pollinationsErr?.message || 'error'}`);
  }

  // ============================================================================
  // 4. PRIORIDAD 4 (EMERGENCIA 2 - 4TO RESPALDO): Black Forest Labs FLUX.1 AI
  // ============================================================================
  try {
    const fluxImage = await generateWithFourthBackupAI(
      targetAge,
      transformType,
      styleId,
      customStylePrompt,
      personName,
      visualDescription,
      dims.genWidth,
      dims.genHeight
    );
    if (fluxImage && fluxImage.length > 50) {
      const finalImg = await enforceExactAspectRatio(fluxImage, dims);
      return {
        image: finalImg,
        text: null,
      };
    }
    errors.push('FLUX.1 sin imagen');
  } catch (fluxErr: any) {
    console.error('Prioridad 4 (FLUX.1 AI) también falló:', fluxErr?.message || fluxErr);
    errors.push(`FLUX.1: ${fluxErr?.message || 'error'}`);
  }

  throw new Error(
    `No se pudo completar la transformación tras intentar los 4 motores de IA (${errors.join(' → ')}). Intenta nuevamente.`
  );
};