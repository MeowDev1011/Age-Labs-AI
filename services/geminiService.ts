import { GoogleGenAI } from '@google/genai';
import type { TransformResult, TransformType } from '../types';
import { STYLE_FILTERS } from '../constants/styles';

const getAIClient = (): GoogleGenAI => {
  // Try import.meta.env first, then process.env
  const apiKey =
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) ||
    (typeof process !== 'undefined' && process.env && (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY)) ||
    '';

  return new GoogleGenAI({
    apiKey: apiKey || undefined,
  });
};

const generatePrompt = (
  targetAge: number,
  transformType: TransformType,
  styleId?: string,
  customStylePrompt?: string
): string => {
  const ageInstruction =
    transformType === 'regress'
      ? `Rejuvenecer a la persona en la imagen para que aparente exactamente ${targetAge} años de edad.`
      : `Envejecer a la persona en la imagen para que aparente exactamente ${targetAge} años de edad, con signos naturales y cronológicos del paso del tiempo.`;

  // Determine style modifier
  let styleInstruction = '';
  if (customStylePrompt && customStylePrompt.trim().length > 0) {
    styleInstruction = `**ESTILO ARTÍSTICO PERSONALIZADO SOLICITADO POR EL USUARIO:**
${customStylePrompt.trim()}
Aplica este estilo visual y ambientación con maestría artística sin perder la semejanza fisonómica de la persona.`;
  } else if (styleId && styleId !== 'realista') {
    const selectedStyle = STYLE_FILTERS.find((s) => s.id === styleId);
    if (selectedStyle) {
      styleInstruction = `**ESTILO ARTÍSTICO ESPECÍFICO (${selectedStyle.name.toUpperCase()}):**
${selectedStyle.promptModifier}
Transforma el acabado, texturas, iluminación y estética general siguiendo fielmente este estilo artístico, manteniendo el rostro y parecido de la persona.`;
    }
  } else {
    styleInstruction = `**ESTILO VISUAL:**
Fotorrealismo ultra detallado, iluminación fotográfica cinematográfica de alta gama, textura de piel natural y máxima definición 8K.`;
  }

  return `
    **MISIÓN CRÍTICA: TRANSFORMACIÓN DE EDAD Y ESTILO MANTENIENDO LA IDENTIDAD FACIAL**
    
    1. OBJETIVO DE EDAD: ${ageInstruction}
    2. REGLA FUNDAMENTAL DE IDENTIDAD: La estructura facial (forma de ojos, nariz, boca, proporciones anatómicas, sonrisa y expresión) DEBE ser inconfundiblemente la misma persona.
    
    ${styleInstruction}

    3. ACABADO Y COMPOSICIÓN:
    - Retrato de primer plano o plano medio de calidad excepcional.
    - Alta resolución, sin artefactos extraños ni deformaciones.
    - Devuelve únicamente la imagen resultante de alta calidad.
  `;
};

export const transformImageAge = async (
  base64ImageData: string,
  mimeType: string,
  targetAge: number,
  transformType: TransformType,
  styleId: string = 'realista',
  customStylePrompt: string = ''
): Promise<TransformResult> => {
  const prompt = generatePrompt(targetAge, transformType, styleId, customStylePrompt);
  const ai = getAIClient();

  // Normalize mime type
  const safeMime = mimeType && mimeType.startsWith('image/') ? mimeType : 'image/jpeg';

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: safeMime,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    const result: TransformResult = { image: null, text: null };

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          result.image = `data:${mime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          result.text = (result.text || '') + part.text;
        }
      }
    }

    if (!result.image && !result.text) {
      throw new Error('Respuesta inválida de la IA. No se devolvió imagen ni texto.');
    }

    return result;
  } catch (error) {
    console.error('Error al llamar a la API de Gemini:', error);

    if (error instanceof Error) {
      const lowerCaseErrorMessage = error.message.toLowerCase();

      if (
        lowerCaseErrorMessage.includes('permission denied') ||
        lowerCaseErrorMessage.includes('api key not valid') ||
        lowerCaseErrorMessage.includes('403')
      ) {
        throw new Error('Error de permisos o clave de API no válida. Asegúrate de tener acceso habilitado.');
      }
      if (
        lowerCaseErrorMessage.includes('rate limit') ||
        lowerCaseErrorMessage.includes('resource_exhausted') ||
        lowerCaseErrorMessage.includes('429')
      ) {
        throw new Error('Se ha excedido la cuota o el límite de solicitudes a la IA. Espera un momento y reintenta.');
      }
      if (
        lowerCaseErrorMessage.includes('invalid') &&
        (lowerCaseErrorMessage.includes('argument') || lowerCaseErrorMessage.includes('request'))
      ) {
        throw new Error('La imagen no pudo ser procesada. Intenta con una foto con mejor iluminación o resolución.');
      }
      if (lowerCaseErrorMessage.includes('deadline exceeded')) {
        throw new Error('La solicitud tardó demasiado en responder. Inténtalo de nuevo.');
      }

      throw new Error(error.message || 'Error al procesar la imagen con Gemini.');
    }

    throw new Error('No se pudo comunicar con el servicio de IA. Inténtalo de nuevo más tarde.');
  }
};