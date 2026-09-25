'use client';

import { useEffect, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { compressImage } from '@/lib/learning/images';
import { uploadImage } from '@/lib/sync/images';

interface ImagePickerProps {
  images: string[];
  onChange: (images: string[]) => void;
  compress?: (file: Blob) => Promise<string>;
  upload?: (dataUrl: string) => Promise<string>;
}

/** Screenshots: pick files or paste with Ctrl+V anywhere on the page. Click a preview to open it full size. */
export function ImagePicker({ images, onChange, compress = compressImage, upload = uploadImage }: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Paste handler is registered once; keep the latest images/onChange in a ref.
  const latest = useRef({ images, onChange });
  latest.current = { images, onChange };

  async function addFiles(files: Blob[]) {
    const pictures = files.filter((f) => f.type.startsWith('image/'));
    if (pictures.length === 0) return;
    setBusy(true);
    try {
      const added = await Promise.all(pictures.map(async (f) => upload(await compress(f))));
      latest.current.onChange([...latest.current.images, ...added]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось добавить картинку.');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const files = Array.from(e.clipboardData?.files ?? []);
      if (files.some((f) => f.type.startsWith('image/'))) {
        e.preventDefault();
        void addFiles(files);
      }
    }
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {images.map((src, i) => (
          <div key={i} className="relative">
            <a href={src} target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Скриншот ${i + 1}`} className="h-24 w-24 rounded border object-cover" />
            </a>
            <button
              type="button"
              aria-label={`Удалить скриншот ${i + 1}`}
              className="absolute -right-2 -top-2 rounded-full bg-red-600 p-0.5 text-white"
              onClick={() => onChange(images.filter((_, j) => j !== i))}
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded border border-dashed text-xs text-gray-500"
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus size={20} />
          Добавить фото
        </button>
      </div>
      <p className="mt-1 text-xs text-gray-500">{busy ? 'Загружаю…' : 'Можно вставить скриншот через Ctrl+V.'}</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        aria-label="Выбрать фото"
        onChange={(e) => {
          void addFiles(Array.from(e.target.files ?? []));
          e.target.value = '';
        }}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
