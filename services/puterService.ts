/**
 * Puter.js AI Image Transformation Service (Priority 2)
 * Uses puter.ai.txt2img with input_image support and fast timeout for iframe previews.
 */

declare global {
  interface Window {
    puter?: {
      ai?: {
        txt2img: (
          prompt: string,
          optionsOrTestMode?:
            | boolean
            | {
                model?: string;
                provider?: string;
                input_image?: string;
                input_image_mime_type?: string;
                testMode?: boolean;
              }
        ) => Promise<HTMLImageElement | string>;
      };
    };
  }
}

const ensurePuterLoaded = async (): Promise<void> => {
  if (typeof window === 'undefined') {
    throw new Error('Puter.js requires a browser environment');
  }
  if (window.puter?.ai?.txt2img) {
    return;
  }

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[src*="js.puter.com/v2"]');
    if (existingScript) {
      let checks = 0;
      const interval = setInterval(() => {
        checks++;
        if (window.puter?.ai?.txt2img) {
          clearInterval(interval);
          resolve();
        } else if (checks > 20) {
          clearInterval(interval);
          reject(new Error('Timeout waiting for Puter.js to initialize'));
        }
      }, 150);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.puter.com/v2/';
    script.async = true;
    script.onload = () => {
      if (window.puter?.ai?.txt2img) {
        resolve();
      } else {
        reject(new Error('Puter.js loaded without ai.txt2img'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load Puter.js script'));
    document.head.appendChild(script);
  });
};

const normalizeImageResult = async (res: HTMLImageElement | string): Promise<string> => {
  const src = typeof res === 'string' ? res : res?.src;
  if (!src) {
    throw new Error('Puter.js did not return a valid image source');
  }

  if (src.startsWith('data:image/')) {
    return src;
  }

  try {
    const response = await fetch(src);
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return src;
  }
};

export const generateWithPuter = async (
  prompt: string,
  base64ImageData: string,
  mimeType: string
): Promise<string> => {
  await ensurePuterLoaded();

  const txt2img = window.puter?.ai?.txt2img;
  if (!txt2img) {
    throw new Error('Puter.js AI no está disponible');
  }

  const rawBase64 = base64ImageData.includes(',')
    ? base64ImageData.split(',')[1]
    : base64ImageData;
  const safeMime = mimeType && mimeType.startsWith('image/') ? mimeType : 'image/jpeg';

  const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
    new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Puter.js timeout in preview')), ms);
      promise
        .then((val) => {
          clearTimeout(timer);
          resolve(val);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });

  // Fast 5.5s timeout so sandboxed preview iframes (which block Puter login popups) immediately fall back to Pollinations.ai
  const imgRes = await withTimeout(
    txt2img(prompt, {
      model: 'gemini-2.5-flash-image-preview',
      input_image: rawBase64,
      input_image_mime_type: safeMime,
    }),
    5500
  );

  return await normalizeImageResult(imgRes);
};
