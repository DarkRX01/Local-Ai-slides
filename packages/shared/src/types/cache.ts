export interface CacheEntry {
  id: string;
  key: string;
  value: string;
  type: 'ai' | 'image' | 'translation' | 'other';
  createdAt: string;
  expiresAt?: string;
}
