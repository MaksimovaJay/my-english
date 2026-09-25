import { describe, it, expect, vi, afterEach } from 'vitest';
import { uploadImage } from './images';

const DATA_URL = 'data:image/jpeg;base64,/9j/AA==';

describe('uploadImage', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('returns the public storage URL after a successful upload', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) =>
      url.startsWith('data:') ? new Response(new Blob(['x'])) : new Response('{}', { status: 200 })
    ));
    const url = await uploadImage(DATA_URL);
    expect(url).toMatch(/\/storage\/v1\/object\/public\/homework-images\/\d{4}-\d{2}-\d{2}\/.+\.jpg$/);
  });

  it('keeps the data URL when the upload fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) =>
      url.startsWith('data:') ? new Response(new Blob(['x'])) : new Response('Bucket not found', { status: 400 })
    ));
    expect(await uploadImage(DATA_URL)).toBe(DATA_URL);
  });
});
