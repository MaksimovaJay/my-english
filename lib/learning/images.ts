const MAX_SIDE = 1600;
const JPEG_QUALITY = 0.75;

/** Downsizes an image (long side ≤ 1600px) and re-encodes it as a JPEG data URL, so screenshots fit in browser storage. */
export function compressImage(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Не удалось обработать картинку.'));
      ctx.fillStyle = '#fff'; // transparent PNG areas would turn black in JPEG
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Это не картинка или файл повреждён.'));
    };
    img.src = url;
  });
}

export function isQuotaError(err: unknown): boolean {
  return err instanceof DOMException && (err.name === 'QuotaExceededError' || err.code === 22);
}

export const QUOTA_MESSAGE = 'Место в браузере закончилось — удалите старые скрины.';
