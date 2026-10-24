/**
 * Aspect Ratio Detection & Enforcement Utilities
 * Ensures the AI-generated image always matches the exact aspect ratio of the uploaded photo.
 */

export type GeminiAspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

export interface ImageDimensionInfo {
  origWidth: number;
  origHeight: number;
  ratio: number;
  geminiAspectRatio: GeminiAspectRatio;
  genWidth: number;
  genHeight: number;
}

const STANDARD_RATIOS: { label: GeminiAspectRatio; value: number; w: number; h: number }[] = [
  { label: '1:1', value: 1.0, w: 768, h: 768 },
  { label: '3:4', value: 3 / 4, w: 576, h: 768 },
  { label: '4:3', value: 4 / 3, w: 768, h: 576 },
  { label: '9:16', value: 9 / 16, w: 576, h: 1024 },
  { label: '16:9', value: 16 / 9, w: 1024, h: 576 },
];

export const computeDimensionInfo = (width: number, height: number): ImageDimensionInfo => {
  const safeW = width > 0 ? width : 768;
  const safeH = height > 0 ? height : 768;
  const ratio = safeW / safeH;

  let closest = STANDARD_RATIOS[0];
  let minDiff = Math.abs(ratio - closest.value);

  for (const candidate of STANDARD_RATIOS) {
    const diff = Math.abs(ratio - candidate.value);
    if (diff < minDiff) {
      minDiff = diff;
      closest = candidate;
    }
  }

  // Also compute custom multiples of 64 that closely match the exact uploaded ratio (clamped between 512 and 1024)
  let genWidth = 768;
  let genHeight = 768;
  if (ratio >= 1) {
    genWidth = 768;
    genHeight = Math.max(512, Math.min(1024, Math.round((768 / ratio) / 64) * 64));
  } else {
    genHeight = 768;
    genWidth = Math.max(512, Math.min(1024, Math.round((768 * ratio) / 64) * 64));
  }

  return {
    origWidth: safeW,
    origHeight: safeH,
    ratio,
    geminiAspectRatio: closest.label,
    genWidth,
    genHeight,
  };
};

/**
 * Reads the natural width and height of a base64 image in the browser (or returns 1:1 default in SSR/Node).
 */
export const getUploadedImageDimensions = (
  base64Data: string,
  mimeType: string = 'image/jpeg'
): Promise<ImageDimensionInfo> => {
  if (typeof window === 'undefined' || typeof Image === 'undefined') {
    return Promise.resolve(computeDimensionInfo(768, 768));
  }

  const dataUrl = base64Data.startsWith('data:')
    ? base64Data
    : `data:${mimeType};base64,${base64Data}`;

  return new Promise((resolve) => {
    const img = new Image();
    const timer = setTimeout(() => {
      resolve(computeDimensionInfo(768, 768));
    }, 2500);

    img.onload = () => {
      clearTimeout(timer);
      resolve(computeDimensionInfo(img.naturalWidth || img.width || 768, img.naturalHeight || img.height || 768));
    };

    img.onerror = () => {
      clearTimeout(timer);
      resolve(computeDimensionInfo(768, 768));
    };

    img.src = dataUrl;
  });
};

/**
 * Ensures the generated AI image matches the exact aspect ratio of the user's uploaded image.
 * Uses smart portrait framing (slight upper-center bias so heads/hair are never clipped).
 */
export const enforceExactAspectRatio = (
  generatedImageUrl: string,
  dims: ImageDimensionInfo
): Promise<string> => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.resolve(generatedImageUrl);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const timer = setTimeout(() => {
      resolve(generatedImageUrl);
    }, 5000);

    img.onload = () => {
      clearTimeout(timer);
      try {
        const srcW = img.naturalWidth || img.width;
        const srcH = img.naturalHeight || img.height;
        if (!srcW || !srcH) {
          resolve(generatedImageUrl);
          return;
        }

        const srcRatio = srcW / srcH;
        const targetRatio = dims.ratio;

        // If aspect ratio already matches within 2%, return as-is
        if (Math.abs(srcRatio - targetRatio) / targetRatio < 0.02) {
          resolve(generatedImageUrl);
          return;
        }

        // Determine target canvas dimensions (max 1280px on longest side for crisp quality)
        const maxSide = 1024;
        let destW: number;
        let destH: number;
        if (targetRatio >= 1) {
          destW = maxSide;
          destH = Math.round(maxSide / targetRatio);
        } else {
          destH = maxSide;
          destW = Math.round(maxSide * targetRatio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = destW;
        canvas.height = destH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(generatedImageUrl);
          return;
        }

        // Calculate source crop rectangle (cover mode with 40% vertical bias for portraits)
        let cropW = srcW;
        let cropH = srcH;
        let cropX = 0;
        let cropY = 0;

        if (srcRatio > targetRatio) {
          // Source is wider than target -> crop horizontally from center
          cropW = Math.round(srcH * targetRatio);
          cropX = Math.round((srcW - cropW) * 0.5);
        } else {
          // Source is taller than target -> crop vertically with upper-center portrait bias
          cropH = Math.round(srcW / targetRatio);
          cropY = Math.round((srcH - cropH) * 0.38);
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, destW, destH);

        resolve(canvas.toDataURL('image/jpeg', 0.94));
      } catch {
        resolve(generatedImageUrl);
      }
    };

    img.onerror = () => {
      clearTimeout(timer);
      resolve(generatedImageUrl);
    };

    img.src = generatedImageUrl;
  });
};
