import { describe, it, expect } from 'vitest';
import { ContentFetcher } from '../lib/content-fetcher';

describe('ContentFetcher Integration', () => {
  it('should read actual TIL files from source/notes with detailed results', async () => {
    const fetcher = new ContentFetcher();
    const result = await fetcher.fetchNotes();
    
    // 应该有一些成功的笔记
    expect(result.success.length).toBeGreaterThan(0);
    expect(Array.isArray(result.errors)).toBe(true);
    
    // 检查一个具体的笔记
    const gitNote = result.success.find(note => note.ulid === '01K5RR9NFREBCCRT4YHNN94W29');
    expect(gitNote).toBeDefined();
    expect(gitNote?.content).toContain('git 中删除没有被追踪的文件');
    expect(gitNote?.content).toContain('---');
    expect(gitNote?.content).toContain('title:');
    expect(gitNote?.content).toContain('tags:');
    
    // 验证所有成功的笔记都有有效的结构
    for (const note of result.success) {
      expect(ContentFetcher.validateULID(note.ulid)).toBe(true);
      expect(note.content).toContain('---');
      expect(note.filename).toMatch(/\.md$/);
    }
  });

  it('should read actual TIL files with simplified API', async () => {
    const fetcher = new ContentFetcher();
    const notes = await fetcher.fetchValidNotes();
    
    // 应该有一些笔记
    expect(notes.length).toBeGreaterThan(0);
    
    // 检查一个具体的笔记
    const gitNote = notes.find(note => note.ulid === '01K5RR9NFREBCCRT4YHNN94W29');
    expect(gitNote).toBeDefined();
    expect(gitNote?.content).toContain('git 中删除没有被追踪的文件');
    
    // 验证所有笔记都有有效的结构
    for (const note of notes) {
      expect(ContentFetcher.validateULID(note.ulid)).toBe(true);
      expect(note.content).toContain('---');
      expect(note.filename).toMatch(/\.md$/);
    }
  });
});