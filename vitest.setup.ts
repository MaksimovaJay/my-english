import '@testing-library/jest-dom/vitest';

// Enable localStorage for jsdom
if (typeof window !== 'undefined' && !window.localStorage) {
  const storage: Record<string, string> = {};
  window.localStorage = {
    getItem: (key: string) => storage[key] ?? null,
    setItem: (key: string, value: string) => {
      storage[key] = value;
    },
    removeItem: (key: string) => {
      delete storage[key];
    },
    clear: () => {
      Object.keys(storage).forEach(key => delete storage[key]);
    },
    key: (index: number) => {
      const keys = Object.keys(storage);
      return keys[index] ?? null;
    },
    length: 0,
  } as any;
  Object.defineProperty(window.localStorage, 'length', {
    get: () => Object.keys(storage).length,
  });
}

// jsdom does not implement matchMedia
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }) as unknown as MediaQueryList;
}
