/**
 * Pollinations.ai Real AI Image Generation Engine (Emergency Fallback - Priority 3)
 * Works in both AI Studio Preview (via /api/pollinations proxy) and production domains.
 */

const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

export const generateWithPollinations = async (
  targetAge: number,
  transformType: 'progress' | 'regress',
  styleId: string = 'realista',
  customPrompt: string = '',
  personName: string = '',
  personVisualDescription: string = ''
): Promise<string> => {
  const ageDesc =
    transformType === 'regress'
      ? `youthful person looking ${targetAge} years old, fresh smooth skin, bright eyes`
      : `elderly person looking ${targetAge} years old, natural silver white hair, realistic facial wrinkles`;

  let styleDesc = 'hyperrealistic 8k studio portrait photograph, sharp focus, natural skin texture';

  if (customPrompt && customPrompt.trim()) {
    styleDesc = customPrompt.trim();
  } else {
    switch (styleId) {
      case 'oleo':
        styleDesc = 'classical master oil painting portrait, Rembrandt chiaroscuro golden lighting';
        break;
      case 'ceramica':
        styleDesc = 'fine glazed porcelain ceramic sculpture portrait, high gloss alabaster';
        break;
      case 'robotico':
        styleDesc = 'futuristic cyborg humanoid robot portrait, titanium chrome plates, glowing blue circuits';
        break;
      case 'anime':
        styleDesc = 'vibrant anime aesthetic portrait, Makoto Shinkai style, cel-shaded, luminous lighting';
        break;
      case 'acuarela':
        styleDesc = 'expressive watercolor painting portrait, flowing pigments, fine paper texture';
        break;
      case 'marmol':
        styleDesc = 'classical Roman Carrara white marble sculpture bust, museum lighting';
        break;
      case 'glamour':
        styleDesc = 'retro 1980s synthwave glamour portrait, soft focus magenta and cyan glow';
        break;
      case 'neon':
        styleDesc = 'cyberpunk neon lighting portrait, electric cyan and vivid magenta rim light';
        break;
      case 'cabana':
        styleDesc = 'rustic cozy cabin portrait, warm fireplace amber glow, golden hour';
        break;
      case 'realista':
      default:
        styleDesc = 'hyperrealistic 8k cinematic portrait photograph, studio lighting, natural skin pores';
        break;
    }
  }

  const subjectDesc = personVisualDescription.trim()
    ? personVisualDescription.trim()
    : personName.trim()
    ? `person named ${personName.trim()}`
    : 'person';

  const fullPrompt = `close up portrait of ${subjectDesc}, ${ageDesc}, ${styleDesc}, looking at camera`;
  const cleanPrompt = encodeURIComponent(fullPrompt);
  const seed = Math.floor(Math.random() * 100000);
  const query = `?width=512&height=512&nologo=true&seed=${seed}`;

  // Endpoint 1: Local Vite Proxy (/api/pollinations) — injects Referer: https://pollinations.ai/ so preview works 100%
  // Endpoint 2: Direct Pollinations with no-referrer policy for static domains
  const endpoints = [
    `/api/pollinations/prompt/${cleanPrompt}${query}`,
    `https://image.pollinations.ai/prompt/${cleanPrompt}${query}`,
  ];

  let lastError = 'No se pudo conectar con Pollinations.ai';

  for (const url of endpoints) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 14000);

    try {
      const response = await fetch(url, {
        method: 'GET',
        referrerPolicy: 'no-referrer',
        headers: {
          Accept: 'image/jpeg,image/png,image/*',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('image')) {
          const blob = await response.blob();
          if (blob.size > 1000) {
            return await blobToDataUrl(blob);
          }
        }
      } else {
        lastError = `HTTP ${response.status}`;
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      lastError = err?.name === 'AbortError' ? 'Timeout' : err?.message || 'Error de red';
    }
  }

  throw new Error(`Pollinations.ai no disponible (${lastError})`);
};
