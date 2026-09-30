/**
 * Pollinations.ai Real AI Image Generation Engine
 * Direct neural image generation without Gemini.
 */

export const generateWithPollinations = async (
  targetAge: number,
  transformType: 'progress' | 'regress',
  styleId: string = 'realista',
  customPrompt: string = '',
  personName: string = ''
): Promise<string> => {
  const ageDesc =
    transformType === 'regress'
      ? `youthful person looking exactly ${targetAge} years old, youthful fresh glowing face, smooth skin, lively eyes`
      : `distinguished elder person looking exactly ${targetAge} years old, realistic silver white hair, mature facial character wrinkles, natural aged expression`;

  let styleDesc = 'hyperrealistic 8k cinematic portrait photograph, sharp focus, natural skin texture, masterpiece';

  if (customPrompt && customPrompt.trim()) {
    styleDesc = customPrompt.trim();
  } else {
    switch (styleId) {
      case 'oleo':
        styleDesc = 'classical master oil painting, Rembrandt chiaroscuro golden lighting, rich canvas texture';
        break;
      case 'ceramica':
        styleDesc = 'fine glazed porcelain ceramic sculpture portrait, high gloss finish, delicate alabaster';
        break;
      case 'robotico':
        styleDesc = 'futuristic cyborg humanoid robot portrait, titanium chrome plates, glowing blue cybernetic circuits';
        break;
      case 'anime':
        styleDesc = 'vibrant anime aesthetic portrait, Makoto Shinkai style, crisp cel-shaded lines, luminous lighting';
        break;
      case 'acuarela':
        styleDesc = 'expressive watercolor painting, flowing colorful pigments, fine paper wash bleed, artistic splash';
        break;
      case 'marmol':
        styleDesc = 'classical Roman Carrara white marble sculpture bust, museum pedestal lighting, smooth stone texture';
        break;
      case 'glamour':
        styleDesc = 'retro 1980s synthwave glamour portrait, soft focus magenta and cyan bloom, vintage film';
        break;
      case 'neon':
        styleDesc = 'cyberpunk neon lighting portrait, electric cyan and vivid magenta rim light, dark futuristic backdrop';
        break;
      case 'cabana':
        styleDesc = 'rustic cozy cabin portrait, warm fireplace amber glow, timber cabin ambiance, golden hour';
        break;
      case 'realista':
      default:
        styleDesc = 'hyperrealistic 8k cinematic portrait photograph, studio lighting, natural skin pores and tones';
        break;
    }
  }

  const nameContext = personName && personName.trim() ? `named ${personName.trim()}` : '';
  const fullPrompt = `close up portrait of a person ${nameContext}, ${ageDesc}, ${styleDesc}, looking at camera, award winning portrait photography`;
  const cleanPrompt = encodeURIComponent(fullPrompt);
  const seed = Math.floor(Math.random() * 10000000);

  const url = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=768&height=768&nologo=true&seed=${seed}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'image/jpeg,image/png,image/*',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 402) {
        throw new Error('Pollinations AI requiere pago o sus servidores están saturados (Error 402). Por favor intenta de nuevo.');
      }
      if (response.status === 429) {
        throw new Error('Límite de solicitudes de Pollinations AI alcanzado (Error 429). Espera unos segundos.');
      }
      throw new Error(`La IA de Pollinations devolvió error HTTP ${response.status}.`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('image')) {
      const text = await response.text();
      throw new Error(`Respuesta no válida de la IA: ${text.slice(0, 100)}`);
    }

    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Tiempo de espera agotado al conectar con Pollinations AI (más de 12 segundos).');
    }
    throw err;
  }
};
