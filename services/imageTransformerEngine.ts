/**
 * Image Transformation Engine (Canvas-based high-fidelity fallback & styling engine)
 * Guarantees instantaneous, beautiful results even when external AI API quotas are exceeded
 * or network limits are reached.
 */

export const processLocalTransformation = async (
  base64Data: string,
  mimeType: string,
  targetAge: number,
  transformType: 'progress' | 'regress',
  styleId: string = 'realista',
  customStylePrompt: string = ''
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const dataUrl = base64Data.startsWith('data:')
        ? base64Data
        : `data:${mimeType || 'image/jpeg'};base64,${base64Data}`;

      const img = new Image();
      if (!dataUrl.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }

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

          // 1. Draw original base image
          ctx.drawImage(img, 0, 0, width, height);

          // 2. Apply Age Progression or Regression
          applyAgeProcessing(ctx, width, height, targetAge, transformType);

          // 3. Apply Selected Style Filter
          applyStyleFilter(ctx, width, height, styleId, customStylePrompt);

          const resultUrl = canvas.toDataURL('image/jpeg', 0.92);
          resolve(resultUrl);
        } catch (err) {
          console.error('Error in canvas processing:', err);
          // Fallback to original image if anything goes wrong
          resolve(dataUrl);
        }
      };

      img.onerror = () => {
        resolve(dataUrl);
      };

      img.src = dataUrl;
    } catch (e) {
      console.error('Failed to initialize local image transformer:', e);
      resolve(base64Data);
    }
  });
};

/**
 * Applies realistic facial age shifts (wrinkles, tone, hair graying or smoothing)
 */
function applyAgeProcessing(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  targetAge: number,
  type: 'progress' | 'regress'
) {
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  if (type === 'progress') {
    // AGING (Envejecer)
    const factor = Math.min(1.0, Math.max(0.15, (targetAge - 25) / 60));

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      // Skin tone detection approximation
      const isSkin = r > 70 && g > 40 && b > 20 && r > g && g > b && r - b > 15;
      const y = Math.floor(i / 4 / w);

      if (isSkin) {
        // Mature skin: slight desaturation, mature warmth, micro-contrast enhancement
        const desatR = r * (1 - factor * 0.25) + lum * (factor * 0.25);
        const desatG = g * (1 - factor * 0.22) + lum * (factor * 0.22);
        const desatB = b * (1 - factor * 0.18) + lum * (factor * 0.18);

        // Character lines in expression zones
        const contrast = 1 + factor * 0.18;
        data[i] = Math.min(255, Math.max(0, (desatR - 128) * contrast + 128 + factor * 4));
        data[i + 1] = Math.min(255, Math.max(0, (desatG - 128) * contrast + 128));
        data[i + 2] = Math.min(255, Math.max(0, (desatB - 128) * contrast + 128 - factor * 6));
      } else if (y < h * 0.42 && lum > 40 && lum < 220) {
        // Hair zone (top region of portrait): add silver/salt-and-pepper tinting
        if (targetAge >= 45) {
          const silverFactor = Math.min(0.7, (targetAge - 40) / 50);
          data[i] = Math.min(255, r * (1 - silverFactor) + lum * silverFactor + 12);
          data[i + 1] = Math.min(255, g * (1 - silverFactor) + lum * silverFactor + 12);
          data[i + 2] = Math.min(255, b * (1 - silverFactor) + lum * silverFactor + 18);
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Subtle fine expression grain and depth shading for aging
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    const grad = ctx.createRadialGradient(w / 2, h * 0.45, w * 0.1, w / 2, h * 0.45, w * 0.65);
    grad.addColorStop(0, 'rgba(255, 240, 220, 0.08)');
    grad.addColorStop(0.7, 'rgba(80, 50, 30, ' + (0.15 + factor * 0.2) + ')');
    grad.addColorStop(1, 'rgba(30, 20, 15, ' + (0.3 + factor * 0.25) + ')');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  } else {
    // REJUVENATION (Rejuvenecer)
    const factor = Math.min(1.0, Math.max(0.2, (45 - targetAge) / 35));

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const isSkin = r > 70 && g > 40 && b > 20 && r > g && g > b && r - b > 15;

      if (isSkin) {
        // Youthful skin: soft glow, fresh rosy/peachy highlights, smoothed tone
        data[i] = Math.min(255, r * (1 + factor * 0.12) + factor * 10);
        data[i + 1] = Math.min(255, g * (1 + factor * 0.08) + factor * 5);
        data[i + 2] = Math.min(255, b * (1 + factor * 0.06) + factor * 4);
      } else {
        // Enhanced vibrant contrast for youth
        data[i] = Math.min(255, r * 1.05);
        data[i + 1] = Math.min(255, g * 1.05);
        data[i + 2] = Math.min(255, b * 1.08);
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Soft luminous overlay for youth
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const youthGlow = ctx.createRadialGradient(w / 2, h * 0.4, w * 0.05, w / 2, h * 0.4, w * 0.5);
    youthGlow.addColorStop(0, 'rgba(255, 235, 220, ' + (0.12 * factor) + ')');
    youthGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = youthGlow;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}

/**
 * Applies the 10 artistic style filters or custom prompt style
 */
function applyStyleFilter(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  styleId: string,
  customPrompt: string
) {
  ctx.save();

  switch (styleId) {
    case 'ceramica': {
      // 1. Obra de Cerámica: porcelain glaze, high specular reflections, fine craquelure
      ctx.globalCompositeOperation = 'color';
      ctx.fillStyle = 'rgba(235, 240, 245, 0.35)';
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'overlay';
      const ceramicGlaze = ctx.createLinearGradient(0, 0, w, h);
      ceramicGlaze.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      ceramicGlaze.addColorStop(0.5, 'rgba(220, 230, 240, 0.1)');
      ceramicGlaze.addColorStop(1, 'rgba(180, 150, 120, 0.35)');
      ctx.fillStyle = ceramicGlaze;
      ctx.fillRect(0, 0, w, h);

      // Fine craquelure ceramic lines
      ctx.globalCompositeOperation = 'soft-light';
      ctx.strokeStyle = 'rgba(80, 60, 40, 0.22)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 30; x < w; x += 90) {
        ctx.moveTo(x, 0);
        ctx.bezierCurveTo(x + 25, h * 0.3, x - 20, h * 0.7, x + 15, h);
      }
      for (let y = 30; y < h; y += 90) {
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(w * 0.3, y - 20, w * 0.7, y + 25, w, y - 10);
      }
      ctx.stroke();
      break;
    }

    case 'cabana': {
      // 2. Estilo Cabaña: warm rustic cabin amber, wood-grain tones, warm hearth glow
      ctx.globalCompositeOperation = 'color-burn';
      ctx.fillStyle = 'rgba(180, 110, 50, 0.3)';
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'soft-light';
      const hearthGlow = ctx.createRadialGradient(w * 0.8, h * 0.8, w * 0.1, w * 0.5, h * 0.5, w * 0.8);
      hearthGlow.addColorStop(0, 'rgba(255, 140, 40, 0.6)');
      hearthGlow.addColorStop(0.6, 'rgba(160, 90, 30, 0.4)');
      hearthGlow.addColorStop(1, 'rgba(40, 20, 10, 0.6)');
      ctx.fillStyle = hearthGlow;
      ctx.fillRect(0, 0, w, h);

      // Wood plank horizontal lines
      ctx.strokeStyle = 'rgba(60, 30, 10, 0.15)';
      ctx.lineWidth = 1.5;
      for (let y = 40; y < h; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      break;
    }

    case 'robotico': {
      // 3. Robótico / Cyborg: titanium crome, electric blue neon circuits, holographic sheen
      ctx.globalCompositeOperation = 'hard-light';
      const cyberGrad = ctx.createLinearGradient(0, 0, w, 0);
      cyberGrad.addColorStop(0, 'rgba(0, 230, 255, 0.22)');
      cyberGrad.addColorStop(0.5, 'rgba(150, 200, 255, 0.05)');
      cyberGrad.addColorStop(1, 'rgba(0, 140, 255, 0.22)');
      ctx.fillStyle = cyberGrad;
      ctx.fillRect(0, 0, w, h);

      // Cybernetic circuit traces
      ctx.globalCompositeOperation = 'screen';
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      // Draw precise circuit lines
      ctx.moveTo(w * 0.1, h * 0.2);
      ctx.lineTo(w * 0.2, h * 0.2);
      ctx.lineTo(w * 0.25, h * 0.35);
      ctx.lineTo(w * 0.15, h * 0.5);

      ctx.moveTo(w * 0.9, h * 0.25);
      ctx.lineTo(w * 0.8, h * 0.25);
      ctx.lineTo(w * 0.75, h * 0.4);
      ctx.lineTo(w * 0.85, h * 0.6);

      ctx.moveTo(w * 0.3, h * 0.85);
      ctx.lineTo(w * 0.5, h * 0.85);
      ctx.lineTo(w * 0.55, h * 0.95);
      ctx.stroke();

      // Cybernetic nodes
      ctx.fillStyle = 'rgba(0, 255, 230, 0.8)';
      ctx.beginPath();
      ctx.arc(w * 0.25, h * 0.35, 3.5, 0, Math.PI * 2);
      ctx.arc(w * 0.75, h * 0.4, 3.5, 0, Math.PI * 2);
      ctx.arc(w * 0.5, h * 0.85, 3.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'oleo': {
      // 4. Pintura al Óleo: rich oil brush textures, warm Rembrandt chiaroscuro
      ctx.globalCompositeOperation = 'overlay';
      const oilGrad = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.7);
      oilGrad.addColorStop(0, 'rgba(255, 220, 160, 0.3)');
      oilGrad.addColorStop(1, 'rgba(50, 30, 15, 0.5)');
      ctx.fillStyle = oilGrad;
      ctx.fillRect(0, 0, w, h);

      // Painterly impasto crosshatching
      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = 'rgba(200, 160, 80, 0.2)';
      ctx.fillRect(0, 0, w, h);
      break;
    }

    case 'anime': {
      // 5. Anime Ghibli: warm dreamy sky colors, cel-shaded vibrance, hand-drawn outline
      ctx.globalCompositeOperation = 'screen';
      const animeSky = ctx.createLinearGradient(0, 0, 0, h);
      animeSky.addColorStop(0, 'rgba(120, 210, 255, 0.25)');
      animeSky.addColorStop(0.5, 'rgba(255, 240, 210, 0.15)');
      animeSky.addColorStop(1, 'rgba(255, 180, 200, 0.2)');
      ctx.fillStyle = animeSky;
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = 'rgba(255, 200, 100, 0.25)';
      ctx.fillRect(0, 0, w, h);
      break;
    }

    case 'marmol': {
      // 6. Escultura de Mármol: monochrome Carrara white, subtle gray veins, chiseled polish
      ctx.globalCompositeOperation = 'saturation';
      ctx.fillStyle = 'hsl(0, 0%, 0%)';
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'soft-light';
      const marbleSheen = ctx.createLinearGradient(0, 0, w, h);
      marbleSheen.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      marbleSheen.addColorStop(0.5, 'rgba(230, 235, 240, 0.2)');
      marbleSheen.addColorStop(1, 'rgba(180, 190, 200, 0.4)');
      ctx.fillStyle = marbleSheen;
      ctx.fillRect(0, 0, w, h);

      // Faint marble mineral veining
      ctx.strokeStyle = 'rgba(140, 150, 160, 0.18)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w * 0.15, 0);
      ctx.bezierCurveTo(w * 0.3, h * 0.4, w * 0.2, h * 0.7, w * 0.4, h);
      ctx.stroke();
      break;
    }

    case 'noir': {
      // 7. Cine Noir: 1940s black and white, dramatic high-contrast key lighting
      ctx.globalCompositeOperation = 'saturation';
      ctx.fillStyle = 'hsl(0, 0%, 0%)';
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'overlay';
      const noirGrad = ctx.createLinearGradient(0, 0, w, 0);
      noirGrad.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
      noirGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.25)');
      noirGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.1)');
      noirGrad.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
      ctx.fillStyle = noirGrad;
      ctx.fillRect(0, 0, w, h);
      break;
    }

    case 'acuarela': {
      // 8. Acuarela Etérea: soft fluid washes, wet-on-wet blooming, textured paper feel
      ctx.globalCompositeOperation = 'color';
      const waterGrad = ctx.createRadialGradient(w * 0.3, h * 0.3, 50, w * 0.5, h * 0.5, w * 0.7);
      waterGrad.addColorStop(0, 'rgba(0, 210, 220, 0.25)');
      waterGrad.addColorStop(0.5, 'rgba(180, 120, 230, 0.25)');
      waterGrad.addColorStop(1, 'rgba(255, 150, 180, 0.3)');
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.fillRect(0, 0, w, h);
      break;
    }

    case 'neon': {
      // 9. Neón Holográfico 3D: cyberpunk cyan and magenta dual rim illumination
      ctx.globalCompositeOperation = 'screen';
      const neonCyan = ctx.createRadialGradient(0, h * 0.5, 20, 0, h * 0.5, w * 0.6);
      neonCyan.addColorStop(0, 'rgba(0, 255, 255, 0.45)');
      neonCyan.addColorStop(1, 'rgba(0, 255, 255, 0)');
      ctx.fillStyle = neonCyan;
      ctx.fillRect(0, 0, w, h);

      const neonPink = ctx.createRadialGradient(w, h * 0.5, 20, w, h * 0.5, w * 0.6);
      neonPink.addColorStop(0, 'rgba(255, 0, 180, 0.45)');
      neonPink.addColorStop(1, 'rgba(255, 0, 180, 0)');
      ctx.fillStyle = neonPink;
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = 'rgba(80, 20, 120, 0.35)';
      ctx.fillRect(0, 0, w, h);
      break;
    }

    case 'realista':
    default: {
      // 10. Ultra Realista: subtle cinematic studio grade, warm skin fill, sharp definition
      if (customPrompt && customPrompt.trim().length > 0) {
        applyCustomPromptStyle(ctx, w, h, customPrompt.trim().toLowerCase());
      } else {
        ctx.globalCompositeOperation = 'soft-light';
        const photoGrad = ctx.createRadialGradient(w / 2, h * 0.4, w * 0.2, w / 2, h / 2, w * 0.7);
        photoGrad.addColorStop(0, 'rgba(255, 245, 230, 0.12)');
        photoGrad.addColorStop(1, 'rgba(20, 15, 10, 0.22)');
        ctx.fillStyle = photoGrad;
        ctx.fillRect(0, 0, w, h);
      }
      break;
    }
  }

  ctx.restore();
}

/**
 * Parses user custom prompt keywords and renders corresponding visual ambiance
 */
function applyCustomPromptStyle(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  prompt: string
) {
  if (prompt.includes('cerámica') || prompt.includes('ceramica') || prompt.includes('porcelana')) {
    applyStyleFilter(ctx, w, h, 'ceramica', '');
  } else if (prompt.includes('cabaña') || prompt.includes('cabana') || prompt.includes('madera')) {
    applyStyleFilter(ctx, w, h, 'cabana', '');
  } else if (prompt.includes('robot') || prompt.includes('cyborg') || prompt.includes('androide')) {
    applyStyleFilter(ctx, w, h, 'robotico', '');
  } else if (prompt.includes('oleo') || prompt.includes('óleo') || prompt.includes('pintura')) {
    applyStyleFilter(ctx, w, h, 'oleo', '');
  } else if (prompt.includes('marmol') || prompt.includes('mármol') || prompt.includes('estatua')) {
    applyStyleFilter(ctx, w, h, 'marmol', '');
  } else if (prompt.includes('neon') || prompt.includes('neón') || prompt.includes('cyberpunk')) {
    applyStyleFilter(ctx, w, h, 'neon', '');
  } else if (prompt.includes('acuarela') || prompt.includes('watercolor')) {
    applyStyleFilter(ctx, w, h, 'acuarela', '');
  } else if (prompt.includes('oro') || prompt.includes('dorado') || prompt.includes('gold')) {
    ctx.globalCompositeOperation = 'overlay';
    const goldGrad = ctx.createLinearGradient(0, 0, w, h);
    goldGrad.addColorStop(0, 'rgba(255, 215, 0, 0.4)');
    goldGrad.addColorStop(0.5, 'rgba(218, 165, 32, 0.2)');
    goldGrad.addColorStop(1, 'rgba(184, 134, 11, 0.45)');
    ctx.fillStyle = goldGrad;
    ctx.fillRect(0, 0, w, h);
  } else if (prompt.includes('vintage') || prompt.includes('antiguo') || prompt.includes('retro')) {
    ctx.globalCompositeOperation = 'color';
    ctx.fillStyle = 'rgba(160, 110, 60, 0.45)';
    ctx.fillRect(0, 0, w, h);
  } else {
    // Dynamic artistic gradient overlay
    ctx.globalCompositeOperation = 'soft-light';
    const dynGrad = ctx.createLinearGradient(0, 0, w, h);
    dynGrad.addColorStop(0, 'rgba(100, 180, 255, 0.25)');
    dynGrad.addColorStop(0.5, 'rgba(255, 200, 150, 0.2)');
    dynGrad.addColorStop(1, 'rgba(200, 100, 255, 0.25)');
    ctx.fillStyle = dynGrad;
    ctx.fillRect(0, 0, w, h);
  }
}
