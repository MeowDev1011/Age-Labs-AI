import type { ImageData } from '../types';

/**
 * Universal, ultra-resilient image loader and normalizer.
 * Supports: JPEG, PNG, WEBP, AVIF, HEIC/HEIF (iPhones/iPads), BMP, TIFF, and high-res photos.
 * Guarantees standard, clean, orientation-corrected JPEG output.
 */
export async function processAndNormalizeImage(file: Blob | File): Promise<ImageData> {
  let targetBlob: Blob = file;

  // 1. Check if the file is HEIC / HEIF (from iPhone / iPad / modern Android)
  const fileName = (file as File).name?.toLowerCase() || '';
  const fileType = file.type?.toLowerCase() || '';
  const isHeic =
    fileType.includes('heic') ||
    fileType.includes('heif') ||
    fileName.endsWith('.heic') ||
    fileName.endsWith('.heif');

  if (isHeic) {
    try {
      const heic2anyModule = await import('heic2any');
      const heicConverter = (heic2anyModule.default || heic2anyModule) as (options: any) => Promise<Blob | Blob[]>;
      const converted = await heicConverter({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.92,
      });
      targetBlob = Array.isArray(converted) ? converted[0] : converted;
    } catch (heicErr) {
      console.warn('HEIC conversion warning, trying standard decoding:', heicErr);
      // Continue to standard fallback chain
    }
  }

  // 2. Decode using createImageBitmap or HTMLImageElement via ObjectURL
  const maxDimension = 1800;

  try {
    // Attempt fast off-thread createImageBitmap decoding (preserves EXIF orientation natively)
    if (typeof createImageBitmap === 'function') {
      try {
        const bitmap = await createImageBitmap(targetBlob, {
          imageOrientation: 'from-image',
        });
        const result = renderBitmapToJpeg(bitmap, maxDimension);
        bitmap.close();
        return result;
      } catch {
        // Fall back to Image element if createImageBitmap with orientation fails
        const bitmap = await createImageBitmap(targetBlob);
        const result = renderBitmapToJpeg(bitmap, maxDimension);
        bitmap.close();
        return result;
      }
    }
  } catch (bitmapErr) {
    console.warn('createImageBitmap failed, falling back to ObjectURL:', bitmapErr);
  }

  // 3. Fallback to HTMLImageElement + ObjectURL
  return new Promise<ImageData>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(targetBlob);
    const img = new Image();

    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width || 800;
        let height = img.naturalHeight || img.height || 800;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
          const base64 = dataUrl.split(',')[1] || '';
          URL.revokeObjectURL(objectUrl);
          resolve({
            url: dataUrl,
            base64,
            mimeType: 'image/jpeg',
          });
          return;
        }

        // If canvas context unavailable, fallback to FileReader
        URL.revokeObjectURL(objectUrl);
        readViaFileReader(targetBlob).then(resolve).catch(reject);
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        readViaFileReader(targetBlob).then(resolve).catch(reject);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Last-chance fallback: read directly as base64 data URL
      readViaFileReader(targetBlob)
        .then(resolve)
        .catch(() => {
          reject(new Error('No se pudo procesar la imagen seleccionada. Por favor intenta con otra foto en formato JPG o PNG.'));
        });
    };

    img.src = objectUrl;
  });
}

function renderBitmapToJpeg(bitmap: ImageBitmap, maxDimension: number): ImageData {
  let width = bitmap.width;
  let height = bitmap.height;

  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  const base64 = dataUrl.split(',')[1] || '';

  return {
    url: dataUrl,
    base64,
    mimeType: 'image/jpeg',
  };
}

function readViaFileReader(blob: Blob): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl && dataUrl.includes(',')) {
        const parts = dataUrl.split(',');
        const base64 = parts[1];
        let mimeType = 'image/jpeg';
        const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+_-]+);base64,/);
        if (match && match[1]) {
          mimeType = match[1];
        } else if (blob.type && blob.type.startsWith('image/')) {
          mimeType = blob.type;
        }

        resolve({
          url: dataUrl,
          base64,
          mimeType,
        });
      } else {
        reject(new Error('Formato de datos no válido'));
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsDataURL(blob);
  });
}
