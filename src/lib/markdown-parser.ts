import matter from 'gray-matter';
import { z } from 'zod';
import { decodeTime, isValid as isValidULID } from 'ulid';

// Front matter validation schema - 严格验证，不提供默认值
const FrontMatterSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  tags: z.array(z.string()).optional().default([]),
});

export interface FrontMatter {
  title: string;
  tags: string[];
  date: string;
}

export interface ParsedNote {
  ulid: string;
  title: string;
  content: string; // 原始 markdown 内容，将传递给 react-markdown
  tags: string[];
  frontMatter: FrontMatter;
}

export interface RawNote {
  filename: string;
  content: string;
  ulid: string;
}

export class MarkdownParser {
  /**
   * 解析 markdown 内容并提取元数据
   */
  parse(content: string, ulid: string): ParsedNote {
    // 验证 ULID 格式
    if (!isValidULID(ulid)) {
      throw new Error(`无效的 ULID 格式: ${ulid}`);
    }

    // 直接从 ULID 获取日期，不依赖 front matter
    const timestamp = decodeTime(ulid);
    const date = new Date(timestamp).toISOString();

    const frontMatter = this.extractFrontMatter(content);
    const { content: markdownContent } = matter(content);
    
    // 标题是必需的，不提供默认值
    if (!frontMatter.title) {
      throw new Error(`标题是必需的，但在 ULID ${ulid} 的文件中未找到有效标题`);
    }
    
    const completeFrontMatter: FrontMatter = {
      title: frontMatter.title,
      tags: frontMatter.tags,
      date,
    };
    
    return {
      ulid,
      title: frontMatter.title,
      content: markdownContent.trim(),
      tags: frontMatter.tags,
      frontMatter: completeFrontMatter,
    };
  }

  /**
   * 提取并验证 front matter
   */
  extractFrontMatter(content: string): { title: string; tags: string[] } {
    const { data } = matter(content);
    
    // 严格验证 front matter
    const result = FrontMatterSchema.safeParse(data);
    
    if (!result.success) {
      const errorMessages = result.error.issues
        .map(issue => `${issue.path.join('.')}: ${issue.message}`)
        .join('; ');
      throw new Error(`Front matter 验证失败: ${errorMessages}`);
    }
    
    return {
      title: result.data.title,
      tags: result.data.tags,
    };
  }



  /**
   * 静态方法：快速解析单个文件
   */
  static parseFile(rawNote: RawNote): ParsedNote {
    const parser = new MarkdownParser();
    return parser.parse(rawNote.content, rawNote.ulid);
  }

  /**
   * 静态方法：批量解析文件
   */
  static parseFiles(rawNotes: RawNote[]): ParsedNote[] {
    const parser = new MarkdownParser();
    return rawNotes.map(note => parser.parse(note.content, note.ulid));
  }

  /**
   * 验证 markdown 内容格式
   */
  static validateMarkdownContent(content: string): boolean {
    try {
      matter(content);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 验证 ULID 格式 - 使用 ulid 库
   */
  static validateULID(ulid: string): boolean {
    return isValidULID(ulid);
  }
}

// 导出默认实例
export const markdownParser = new MarkdownParser();