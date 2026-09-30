/**
 * High-Impact Photographic Age & Style Engine
 * Produces bold, visibly distinct age transformations (silver hair, mature texture, or porcelain youth)
 * and rich artistic styling without ANY artificial drawn lines or geometric stripes.
 */

export const processPhotographicTransform = async (
  base64Data: string,
  mimeType: string,
  targetAge: number,
  transformType: 'progress' | 'regress',
  styleId: string = 'realista',
  customStylePrompt: string = ''
): Promise<string> => {
  return new Promise((resolve) => {
    try {
      const dataUrl = base64Data.startsWith('data:')
        ? base64Data
        : `data:${mimeType || 'image/jpeg'};base64,${base64Data}`;

      const img = new Image();

      img.onload = () => {
        try {
          const maxDim = 1200;
          let width = img.naturalWidth || img.width || 800;
          let height = img.naturalHeight || img.height || 800;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(dataUrl);
            return;
          }

          // 1. Draw base photo
          ctx.drawImage(img, 0, 0, width, height);

          // 2. Apply Noticeable Age Progression or Rejuvenation
          applyNoticeableAgeShift(ctx, width, height, targetAge, transformType);

          // 3. Apply Noticeable Style Atmosphere
          applyNoticeableStyleAtmosphere(ctx, width, height, styleId, customStylePrompt);

          const resultUrl = canvas.toDataURL('image/jpeg', 0.94);
          resolve(resultUrl);
        } catch (err) {
          console.error('Processing error:', err);
          resolve(dataUrl);
        }
      };

      img.onerror = () => {
        resolve(dataUrl);
      };

      img.src = dataUrl;
    } catch (e) {
      console.error('Initialization error:', e);
      resolve(base64Data);
    }
  });
};

/**
 * Applies a bold, visibly unmistakable age transformation
 */
function applyNoticeableAgeShift(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  targetAge: number,
  type: 'progress' | 'regress'
) {
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  const original = new Uint8ClampedArray(data);

  const cx = w * 0.5;

  if (type === 'progress') {
    // ==========================================
    // AGING (Envejecer):
    // 1. Silver / Platinum White Hair transformation
    // 2. High-pass real feature amplification (deepens real wrinkles & expression)
    // 3. Mature parchment skin tone
    // ==========================================
    const ageFactor = Math.min(1.0, Math.max(0.2, (targetAge - 28) / 52));
    const hairSilverIntensity = targetAge >= 42 ? Math.min(0.88, (targetAge - 35) / 45) : 0;
    const detailBoost = 1.0 + ageFactor * 2.8;

    for (let y = 1; y < h - 1; y++) {
      const yOffset = y * w * 4;
      const isTopHair = y < h * 0.42;

      for (let x = 1; x < w - 1; x++) {
        const i = yOffset + x * 4;

        const isSideHair = Math.abs(x - cx) > w * 0.20 && y < h * 0.70;
        const isBeardZone = y > h * 0.56 && y < h * 0.88 && Math.abs(x - cx) < w * 0.24;
        const isHairCandidate = isTopHair || isSideHair || isBeardZone;

        const r = original[i];
        const g = original[i + 1];
        const b = original[i + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        // Sample 4 cardinal neighbors
        const up = i - w * 4;
        const down = i + w * 4;
        const left = i - 4;
        const right = i + 4;

        const avgLum =
          (0.299 * (original[up] + original[down] + original[left] + original[right]) +
            0.587 * (original[up + 1] + original[down + 1] + original[left + 1] + original[right + 1]) +
            0.114 * (original[up + 2] + original[down + 2] + original[left + 2] + original[right + 2])) *
          0.25;

        const realFeatureDetail = lum - avgLum;

        // Check if pixel is hair: darker than skin or not heavy red-dominant
        const isSkin = r > 80 && g > 50 && b > 30 && r > g && g > b && r - b > 25;
        const isHairPixel = isHairCandidate && (!isSkin || lum < 85) && lum > 20 && lum < 205;

        if (isHairPixel && hairSilverIntensity > 0) {
          // BOLD SILVER / PLATINUM WHITE HAIR
          const silverLum = lum * 0.45 + 155; // Transform dark into shimmering silver
          data[i] = Math.min(255, r * (1 - hairSilverIntensity) + silverLum * hairSilverIntensity);
          data[i + 1] = Math.min(255, g * (1 - hairSilverIntensity) + silverLum * hairSilverIntensity);
          data[i + 2] = Math.min(255, b * (1 - hairSilverIntensity) + (silverLum + 12) * hairSilverIntensity);
        } else {
          // BOLD REAL FACIAL AGING:
          // Amplify real micro-creases and expression folds
          const boostedDetail = realFeatureDetail * detailBoost;

          // Mature contrast curve (deepens eye sockets, cheek hollows, brow ridges)
          const contrast = 1.0 + ageFactor * 0.35;
          const matureR = (r - 128) * contrast + 128 + boostedDetail;
          const matureG = (g - 128) * contrast + 128 + boostedDetail;
          const matureB = (b - 128) * contrast + 128 + boostedDetail;

          // Warm parchment mature skin
          data[i] = Math.min(255, Math.max(0, matureR * (1 - ageFactor * 0.12) + ageFactor * 12));
          data[i + 1] = Math.min(255, Math.max(0, matureG * (1 - ageFactor * 0.12) + ageFactor * 5));
          data[i + 2] = Math.min(255, Math.max(0, matureB * (1 - ageFactor * 0.18) - ageFactor * 8));
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Dignified mature portrait studio vignette
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    const elderVignette = ctx.createRadialGradient(cx, h * 0.45, w * 0.1, cx, h * 0.45, w * 0.7);
    elderVignette.addColorStop(0, 'rgba(255, 245, 230, 0.15)');
    elderVignette.addColorStop(0.65, `rgba(100, 65, 40, ${0.18 + ageFactor * 0.22})`);
    elderVignette.addColorStop(1, `rgba(20, 10, 5, ${0.35 + ageFactor * 0.25})`);
    ctx.fillStyle = elderVignette;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

  } else {
    // ==========================================
    // REJUVENATION (Rejuvenecer):
    // 1. Clear porcelain skin smoothing (erases all lines, pores, bags)
    // 2. Vibrant rosy-peach youthful flush
    // 3. Bright, radiant youthful glow
    // ==========================================
    const youthFactor = Math.min(1.0, Math.max(0.25, (45 - targetAge) / 35));

    for (let y = 1; y < h - 1; y++) {
      const yOffset = y * w * 4;

      for (let x = 1; x < w - 1; x++) {
        const i = yOffset + x * 4;

        const r = original[i];
        const g = original[i + 1];
        const b = original[i + 2];

        // Multi-point neighborhood smoothing for porcelain skin
        const up = i - w * 4;
        const down = i + w * 4;
        const left = i - 4;
        const right = i + 4;

        const smoothR = (r * 3 + original[up] + original[down] + original[left] + original[right]) / 7;
        const smoothG = (g * 3 + original[up + 1] + original[down + 1] + original[left + 1] + original[right + 1]) / 7;
        const smoothB = (b * 3 + original[up + 2] + original[down + 2] + original[left + 2] + original[right + 2]) / 7;

        // Smooth skin while preserving facial structure
        const blendR = r * (1 - youthFactor * 0.6) + smoothR * (youthFactor * 0.6);
        const blendG = g * (1 - youthFactor * 0.6) + smoothG * (youthFactor * 0.6);
        const blendB = b * (1 - youthFactor * 0.6) + smoothB * (youthFactor * 0.6);

        // Youthful rosy saturation & lightness lift
        data[i] = Math.min(255, blendR * (1 + youthFactor * 0.15) + youthFactor * 14);
        data[i + 1] = Math.min(255, blendG * (1 + youthFactor * 0.1) + youthFactor * 8);
        data[i + 2] = Math.min(255, blendB * (1 + youthFactor * 0.08) + youthFactor * 5);
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Radiant youthful dewy glow
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const youthBloom = ctx.createRadialGradient(cx, h * 0.45, 10, cx, h * 0.45, w * 0.6);
    youthBloom.addColorStop(0, `rgba(255, 230, 210, ${0.28 * youthFactor})`);
    youthBloom.addColorStop(0.5, `rgba(255, 195, 175, ${0.14 * youthFactor})`);
    youthBloom.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = youthBloom;
    ctx.fillRect(0, 0, w, h);

    // Fresh rosy cheek flush
    ctx.globalCompositeOperation = 'soft-light';
    const rosyCheek = ctx.createRadialGradient(cx, h * 0.5, w * 0.08, cx, h * 0.5, w * 0.5);
    rosyCheek.addColorStop(0, `rgba(255, 130, 160, ${0.35 * youthFactor})`);
    rosyCheek.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = rosyCheek;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}

/**
 * Applies bold, distinctive photographic styles
 */
function applyNoticeableStyleAtmosphere(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  styleId: string,
  customPrompt: string
) {
  ctx.save();

  switch (styleId) {
    case 'ceramica': {
      // 1. Cerámica / Porcelana: Pure porcelain glaze with alabaster highlights
      ctx.globalCompositeOperation = 'color';
      ctx.fillStyle = 'rgba(235, 242, 250, 0.55)';
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'overlay';
      const ceramicGlaze = ctx.createLinearGradient(0, 0, w, h);
      ceramicGlaze.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
      ceramicGlaze.addColorStop(0.5, 'rgba(220, 235, 245, 0.25)');
      ceramicGlaze.addColorStop(1, 'rgba(190, 165, 140, 0.45)');
      ctx.fillStyle = ceramicGlaze;
      ctx.fillRect(0, 0, w, h);
      break;
    }

    case 'cabana': {
      // 2. Estilo Cabaña: Warm rustic hearth fire, amber woods
      ctx.globalCompositeOperation = 'color-burn';
      ctx.fillStyle = 'rgba(180, 105, 40, 0.35)';
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'soft-light';
      const hearthGlow = ctx.createRadialGradient(w * 0.8, h * 0.8, w * 0.1, w * 0.5, h * 0.5, w * 0.8);
      hearthGlow.addColorStop(0, 'rgba(255, 150, 40, 0.7)');
      hearthGlow.addColorStop(0.6, 'rgba(180, 95, 30, 0.5)');
      hearthGlow.addColorStop(1, 'rgba(50, 25, 10, 0.65)');
      ctx.fillStyle = hearthGlow;
      ctx.fillRect(0, 0, w, h);
      break;
    }

    case 'robotico': {
      // 3. Robótico / Cyborg: Chrome titanium steel, electric cobalt & cyan
      ctx.globalCompositeOperation = 'hard-light';
      ctx.fillStyle = 'rgba(10, 120, 230, 0.3)';
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'overlay';
      const cyberGrad = ctx.createLinearGradient(0, 0, w, h);
      cyberGrad.addColorStop(0, 'rgba(0, 245, 255, 0.45)');
      cyberGrad.addColorStop(0.5, 'rgba(170, 195, 230, 0.2)');
      cyberGrad.addColorStop(1, 'rgba(0, 130, 255, 0.45)');
      ctx.fillStyle = cyberGrad;
      ctx.fillRect(0, 0, w, h);
      break;
    }

    case 'oleo': {
      // 4. Pintura al Óleo: Rembrandt golden chiaroscuro, rich canvas texture
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgba(245, 220, 180, 0.45)';
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'overlay';
      const oilGrad = ctx.createRadialGradient(w / 2, h / 2, 30, w / 2, h / 2, w * 0.7);
      oilGrad.addColorStop(0, 'rgba(255, 215, 120, 0.45)');
      oilGrad.addColorStop(1, 'rgba(70, 30, 5, 0.65)');
      ctx.fillStyle = oilGrad;
      ctx.fillRect(0, 0, w, h);
      break;
    }

    case 'marmol': {
      // 5. Escultura de Mármol: Classical Roman Carrara marble sculpture
      ctx.globalCompositeOperation = 'color';
      ctx.fillStyle = 'rgba(245, 245, 252, 0.9)';
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'overlay';
      const marbleGlow = ctx.createLinearGradient(0, 0, w, h);
      marbleGlow.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      marbleGlow.addColorStop(0.5, 'rgba(205, 200, 190, 0.25)');
      marbleGlow.addColorStop(1, 'rgba(165, 160, 150, 0.4)');
      ctx.fillStyle = marbleGlow;
      ctx.fillRect(0, 0, w, h);
      break;
    }

    case 'anime': {
      // 6. Anime / Manga: High vibrance, soft pastel dreamy aura
      ctx.globalCompositeOperation = 'saturation';
      ctx.fillStyle = 'rgba(255, 100, 190, 0.85)';
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'screen';
      const animeGlow = ctx.createLinearGradient(0, 0, 0, h);
      animeGlow.addColorStop(0, 'rgba(140, 185, 255, 0.35)');
      animeGlow.addColorStop(1, 'rgba(255, 180, 220, 0.35)');
      ctx.fillStyle = animeGlow;
      ctx.fillRect(0, 0, w, h);
      break;
    }

    case 'acuarela': {
      // 7. Acuarela Artística: Flowing pigments, soft paper texture wash
      ctx.globalCompositeOperation = 'color-burn';
      ctx.fillStyle = 'rgba(225, 215, 205, 0.4)';
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'soft-light';
      const waterGrad = ctx.createLinearGradient(0, 0, w, h);
      waterGrad.addColorStop(0, 'rgba(75, 150, 235, 0.45)');
      waterGrad.addColorStop(0.5, 'rgba(245, 120, 190, 0.35)');
      waterGrad.addColorStop(1, 'rgba(255, 200, 95, 0.45)');
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, 0, w, h);
      break;
    }

    case 'glamour': {
      // 8. Glamour Años 80: Synthwave neon sunset, magenta & cyan
      ctx.globalCompositeOperation = 'screen';
      const discoGrad = ctx.createLinearGradient(0, 0, w, h);
      discoGrad.addColorStop(0, 'rgba(255, 0, 140, 0.45)');
      discoGrad.addColorStop(1, 'rgba(0, 225, 255, 0.45)');
      ctx.fillStyle = discoGrad;
      ctx.fillRect(0, 0, w, h);
      break;
    }

    case 'neon': {
      // 9. Cyberpunk Neón: Dual-tone electric blue and hot magenta lighting
      ctx.globalCompositeOperation = 'screen';
      const neonCyan = ctx.createRadialGradient(0, h * 0.5, 20, 0, h * 0.5, w * 0.6);
      neonCyan.addColorStop(0, 'rgba(0, 255, 255, 0.55)');
      neonCyan.addColorStop(1, 'rgba(0, 255, 255, 0)');
      ctx.fillStyle = neonCyan;
      ctx.fillRect(0, 0, w, h);

      const neonPink = ctx.createRadialGradient(w, h * 0.5, 20, w, h * 0.5, w * 0.6);
      neonPink.addColorStop(0, 'rgba(255, 0, 190, 0.55)');
      neonPink.addColorStop(1, 'rgba(255, 0, 190, 0)');
      ctx.fillStyle = neonPink;
      ctx.fillRect(0, 0, w, h);
      break;
    }

    case 'realista':
    default: {
      // 10. Ultra Realista: Studio key-lighting, crisp photographic color balance
      if (customPrompt && customPrompt.trim().length > 0) {
        applyCustomPromptStyle(ctx, w, h, customPrompt.trim().toLowerCase());
      } else {
        ctx.globalCompositeOperation = 'soft-light';
        const photoGrad = ctx.createRadialGradient(w / 2, h * 0.4, w * 0.15, w / 2, h / 2, w * 0.7);
        photoGrad.addColorStop(0, 'rgba(255, 245, 230, 0.22)');
        photoGrad.addColorStop(1, 'rgba(20, 15, 10, 0.25)');
        ctx.fillStyle = photoGrad;
        ctx.fillRect(0, 0, w, h);
      }
      break;
    }
  }

  ctx.restore();
}

function applyCustomPromptStyle(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  prompt: string
) {
  if (prompt.includes('cerámica') || prompt.includes('ceramica') || prompt.includes('porcelana')) {
    applyNoticeableStyleAtmosphere(ctx, w, h, 'ceramica', '');
  } else if (prompt.includes('cabaña') || prompt.includes('cabana') || prompt.includes('madera')) {
    applyNoticeableStyleAtmosphere(ctx, w, h, 'cabana', '');
  } else if (prompt.includes('robot') || prompt.includes('cyborg') || prompt.includes('androide')) {
    applyNoticeableStyleAtmosphere(ctx, w, h, 'robotico', '');
  } else if (prompt.includes('oleo') || prompt.includes('óleo') || prompt.includes('pintura')) {
    applyNoticeableStyleAtmosphere(ctx, w, h, 'oleo', '');
  } else if (prompt.includes('marmol') || prompt.includes('mármol') || prompt.includes('estatua')) {
    applyNoticeableStyleAtmosphere(ctx, w, h, 'marmol', '');
  } else if (prompt.includes('neon') || prompt.includes('neón') || prompt.includes('cyberpunk')) {
    applyNoticeableStyleAtmosphere(ctx, w, h, 'neon', '');
  } else if (prompt.includes('acuarela') || prompt.includes('watercolor')) {
    applyNoticeableStyleAtmosphere(ctx, w, h, 'acuarela', '');
  } else if (prompt.includes('oro') || prompt.includes('dorado') || prompt.includes('gold')) {
    ctx.globalCompositeOperation = 'overlay';
    const goldGrad = ctx.createLinearGradient(0, 0, w, h);
    goldGrad.addColorStop(0, 'rgba(255, 215, 0, 0.45)');
    goldGrad.addColorStop(0.5, 'rgba(218, 165, 32, 0.25)');
    goldGrad.addColorStop(1, 'rgba(184, 134, 11, 0.5)');
    ctx.fillStyle = goldGrad;
    ctx.fillRect(0, 0, w, h);
  } else if (prompt.includes('vintage') || prompt.includes('antiguo') || prompt.includes('retro')) {
    ctx.globalCompositeOperation = 'color';
    ctx.fillStyle = 'rgba(160, 110, 60, 0.5)';
    ctx.fillRect(0, 0, w, h);
  } else {
    ctx.globalCompositeOperation = 'soft-light';
    const dynGrad = ctx.createLinearGradient(0, 0, w, h);
    dynGrad.addColorStop(0, 'rgba(100, 180, 255, 0.3)');
    dynGrad.addColorStop(0.5, 'rgba(255, 200, 150, 0.25)');
    dynGrad.addColorStop(1, 'rgba(200, 100, 255, 0.3)');
    ctx.fillStyle = dynGrad;
    ctx.fillRect(0, 0, w, h);
  }
}
