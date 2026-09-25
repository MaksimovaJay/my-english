import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MJay English',
    short_name: 'MJay English',
    description: 'Мой учебник английского: темы, игры, повторение и домашки.',
    start_url: '/',
    display: 'standalone',
    background_color: '#07060b',
    theme_color: '#7c3aed',
    lang: 'ru',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
