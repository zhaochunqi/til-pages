import { describe, it, expect } from 'vitest';
import { ContentFetcher } from '../lib/content-fetcher';

describe('ContentFetcher Error Handling', () => {
  it('should handle non-existent directory gracefully', async () => {
    const fetcher = new ContentFetcher('non-existent-directory');
    
    await expect(fetcher.fetchNotes()).rejects.toThrow('无法访问笔记目录');
  });

  it('should return correct notes directory path', () => {
    const defaultFetcher = new ContentFetcher();
    expect(defaultFetcher.getNotesDirectory()).toBe('source/notes');
    
    const customFetcher = new ContentFetcher('custom/path');
    expect(customFetcher.getNotesDirectory()).toBe('custom/path');
  });
});