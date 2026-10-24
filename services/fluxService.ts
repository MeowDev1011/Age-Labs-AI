/**
 * 4th AI Backup Service: Hugging Face FLUX.1-schnell (Gradio v5 API)
 * Works in both AI Studio Preview and external domains with full CORS support and custom aspect ratio dimensions.
 */

const blobToDataUrl = async (blob: Blob): Promise<string> => {
  if (typeof FileReader !== 'undefined') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  const buf = await blob.arrayBuffer();
  const mime = blob.type || 'image/webp';
  const b64 = Buffer.from(buf).toString('base64');
  return `data:${mime};base64,${b64}`;
};

const buildFluxPrompt = (
  targetAge: number,
  transformType: 'progress' | 'regress',
  styleId: string,
  customPrompt: string,
  personName: string,
  personVisualDescription: string
): string => {
  const ageDesc =
    transformType === 'regress'
      ? `youthful person looking exactly ${targetAge} years old, fresh glowing smooth skin, bright eyes`
      : `distinguished elder person looking exactly ${targetAge} years old, natural silver white hair, realistic facial character wrinkles`;

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

  return `close up portrait of ${subjectDesc}, ${ageDesc}, ${styleDesc}, looking at camera, masterpiece`;
};

const callHuggingFaceFluxSpace = async (
  spaceHost: string,
  prompt: string,
  width: number,
  height: number
): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const seed = Math.floor(Math.random() * 1000000);
    const callRes = await fetch(`https://${spaceHost}/gradio_api/call/infer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [prompt, seed, true, width, height, 4],
      }),
      signal: controller.signal,
    });

    if (!callRes.ok) {
      throw new Error(`HF Space ${spaceHost} HTTP ${callRes.status}`);
    }

    const callData = await callRes.json();
    const eventId = callData?.event_id;
    if (!eventId) {
      throw new Error('HF Space no devolvió event_id');
    }

    const streamRes = await fetch(`https://${spaceHost}/gradio_api/call/infer/${eventId}`, {
      signal: controller.signal,
    });

    if (!streamRes.ok) {
      throw new Error(`HF Stream HTTP ${streamRes.status}`);
    }

    const streamText = await streamRes.text();
    clearTimeout(timeoutId);

    const lines = streamText.split('\n');
    for (const line of lines) {
      if (line.startsWith('data:')) {
        const jsonStr = line.replace(/^data:\s*/, '').trim();
        if (!jsonStr || jsonStr === 'null') continue;
        let parsed: any;
        try {
          parsed = JSON.parse(jsonStr);
        } catch {
          continue;
        }
        const firstItem = Array.isArray(parsed) ? parsed[0] : parsed;
        const fileUrl =
          firstItem?.url ||
          (firstItem?.path
            ? `https://${spaceHost}/gradio_api/file=${firstItem.path}`
            : null);

        if (fileUrl) {
          try {
            const imgRes = await fetch(fileUrl);
            if (imgRes.ok) {
              const blob = await imgRes.blob();
              return await blobToDataUrl(blob);
            }
          } catch {}
          return fileUrl;
        }
      }
    }

    throw new Error('No se encontró URL de imagen en la respuesta de FLUX');
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
};

export const generateWithFourthBackupAI = async (
  targetAge: number,
  transformType: 'progress' | 'regress',
  styleId: string = 'realista',
  customPrompt: string = '',
  personName: string = '',
  personVisualDescription: string = '',
  width: number = 768,
  height: number = 768
): Promise<string> => {
  const prompt = buildFluxPrompt(
    targetAge,
    transformType,
    styleId,
    customPrompt,
    personName,
    personVisualDescription
  );

  const safeW = Math.max(512, Math.min(1024, Math.round(width / 64) * 64));
  const safeH = Math.max(512, Math.min(1024, Math.round(height / 64) * 64));

  const spaces = [
    'black-forest-labs-flux-1-schnell.hf.space',
    'multimodalart-flux-1-merged.hf.space',
  ];

  let lastErr = 'Error en 4to respaldo FLUX AI';
  for (const space of spaces) {
    try {
      return await callHuggingFaceFluxSpace(space, prompt, safeW, safeH);
    } catch (e: any) {
      lastErr = e?.message || String(e);
    }
  }

  throw new Error(lastErr);
};
