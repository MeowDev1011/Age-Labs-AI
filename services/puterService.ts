/**
 * Puter.js AI Image Transformation Service (Priority 2)
 * Uses authenticated Puter JWT token directly against https://api.puter.com/drivers/call
 * and configures window.puter.setAuthToken so it never prompts the user to register/login.
 */

const DEFAULT_PUTER_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InYyIn0.eyJ0IjoidCIsInYiOiIyIiwidG9rZW5fdWlkIjoiOTY4NWJiYmMtNTM4Yy00ZTI2LWE3MTctNDBjMzk5NjIyNWRkIiwidXUiOiJQdDZUMDhHa1RJNmw5K2R0akJwZUNRPT0iLCJzdSI6IlpRN21la2o3U1VtQzl3Vk81Z0U3eFE9PSIsImFpIjoiUHQ2VDA4R2tUSTZsOStkdGpCcGVDUT09IiwiZnVsbF9hY2Nlc3MiOnRydWUsImlhdCI6MTc5MTIyOTAzMn0.OdzMYSqPkzmVZ28CVRI6BwRi3ziWucS4JoDyQFEFoM0';

declare global {
  interface Window {
    puter?: {
      authToken?: string;
      setAuthToken?: (token: string) => void;
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

const getPuterToken = (): string => {
  try {
    const envToken =
      (typeof import.meta !== 'undefined' &&
        import.meta.env &&
        (import.meta.env.VITE_PUTER_TOKEN || import.meta.env.PUTER_TOKEN)) ||
      '';
    if (envToken && envToken !== 'undefined') {
      return envToken;
    }
  } catch {}
  return DEFAULT_PUTER_TOKEN;
};

const syncBrowserPuterToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('puter.auth.token', token);
  } catch {}
  if (window.puter) {
    window.puter.authToken = token;
    if (typeof window.puter.setAuthToken === 'function') {
      try {
        window.puter.setAuthToken(token);
      } catch {}
    }
  }
};

const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const callPuterDriversApi = async (
  prompt: string,
  token: string,
  rawBase64?: string,
  safeMime?: string
): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 32000);

  const args: Record<string, string> = { prompt };
  if (rawBase64 && safeMime) {
    args.input_image = rawBase64;
    args.input_image_mime_type = safeMime;
  }

  try {
    const response = await fetch('https://api.puter.com/drivers/call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        interface: 'puter-image-generation',
        driver: 'ai-image',
        method: 'generate',
        args,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') || '';

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Puter HTTP ${response.status}: ${errText.slice(0, 120)}`);
    }

    if (contentType.includes('image/')) {
      const blob = await response.blob();
      return await blobToDataUrl(blob);
    }

    const data = await response.json();
    if (data?.success && typeof data.result === 'string' && data.result.length > 50) {
      return data.result.startsWith('data:image/')
        ? data.result
        : `data:image/png;base64,${data.result}`;
    }

    if (typeof data?.result?.src === 'string') {
      return data.result.src;
    }

    if (data?.error) {
      const msg =
        typeof data.error === 'string'
          ? data.error
          : data.error.message || JSON.stringify(data.error);
      throw new Error(msg);
    }

    throw new Error('Respuesta inesperada de Puter AI');
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw err;
  }
};

export const generateWithPuter = async (
  prompt: string,
  base64ImageData: string,
  mimeType: string
): Promise<string> => {
  const token = getPuterToken();
  syncBrowserPuterToken(token);

  const rawBase64 = base64ImageData.includes(',')
    ? base64ImageData.split(',')[1]
    : base64ImageData;
  const safeMime = mimeType && mimeType.startsWith('image/') ? mimeType : 'image/jpeg';

  // 1. Direct Puter API Image-to-Image (with uploaded photo + token, no login popup)
  try {
    return await callPuterDriversApi(prompt, token, rawBase64, safeMime);
  } catch (err1: any) {
    console.warn('Puter Image-to-Image notice, retrying Puter prompt generation:', err1?.message || err1);
  }

  // 2. Direct Puter API Text-to-Image fallback with token
  return await callPuterDriversApi(prompt, token);
};
