export interface StorageAdapter {
  list<T>(collection: string): T[];
  get<T>(collection: string, id: string): T | undefined;
  set<T extends { id: string }>(collection: string, item: T): void;
  remove(collection: string, id: string): void;
  clear(collection: string): void;
  replaceAll<T extends { id: string }>(collection: string, items: T[]): void;
}
