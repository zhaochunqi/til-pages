import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { tmpdir } from "node:os";
import { isValid as isValidULID } from "ulid";
import { z } from "zod";
import { hash } from "crypto";

// ULID 验证 schema - 使用 ulid 库的内置验证
const ULIDSchema = z
	.string()
	.refine((ulid) => isValidULID(ulid), "无效的 ULID 格式");

// 内容验证 schema
const ContentSchema = z
	.string()
	.min(1, "内容不能为空")
	.refine(
		(content) => content.trim().startsWith("---"),
		"内容必须以 front matter (---) 开头",
	);

// RawNote 验证 schema
const RawNoteSchema = z.object({
	filename: z.string().endsWith(".md", "文件名必须以 .md 结尾"),
	content: ContentSchema,
	ulid: ULIDSchema,
});

export interface RawNote {
	filename: string;
	content: string;
	ulid: string;
}

// 结果类型 - 更表达性的返回值
export type FetchResult<T> = {
	success: T[];
	errors: Array<{
		filename: string;
		error: string;
		type: "read_error" | "validation_error";
	}>;
};

// 验证结果类型
export type ValidationResult =
	| { success: true; data: RawNote }
	| { success: false; error: string };

// 构建时缓存配置
const CACHE_FILE = join(process.cwd(), '.build-cache.json');
const LOCK_FILE = join(process.cwd(), '.build-cache.lock');
const CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存（构建期间足够）

// 缓存数据结构
interface CacheData {
	data: RawNote[];
}

// 内存缓存（用于同一进程内的多次调用）
let memoryCache: RawNote[] | null = null;
let memoryCacheTimestamp: number | null = null;

export class ContentFetcher {
	private readonly notesDirectory: string;

	constructor(notesDirectory: string = "source/notes") {
		this.notesDirectory = notesDirectory;
	}

	/**
	 * 获取所有笔记文件 - 返回详细的结果信息
	 */
	async fetchNotes(): Promise<FetchResult<RawNote>> {
		const files = await this.readMarkdownFiles();
		const results = await Promise.allSettled(
			files.map((filename) => this.processFile(filename)),
		);

		return this.aggregateResults(results, files);
	}

	/**
	 * 仅获取有效的笔记 - 简化的 API，带缓存和锁机制
	 */
	async fetchValidNotes(): Promise<RawNote[]> {
		const now = Date.now();
		
		// 检查内存缓存（同一进程内的多次调用）
		if (memoryCache && memoryCacheTimestamp && (now - memoryCacheTimestamp) < CACHE_TTL) {
			return memoryCache;
		}
		
		// 检查文件系统缓存（跨进程共享）
		const cachedData = await this.readCache();
		if (cachedData) {
			memoryCache = cachedData;
			memoryCacheTimestamp = now;
			return cachedData;
		}

		// 等待可能的锁
		await this.waitForLock();
		
		// 再次检查缓存，可能在等待期间其他进程已经创建了
		const retryCacheData = await this.readCache();
		if (retryCacheData) {
			memoryCache = retryCacheData;
			memoryCacheTimestamp = now;
			return retryCacheData;
		}

		// 尝试获取锁
		if (!await this.createLock()) {
			// 如果获取锁失败，等待并重试读取缓存
			await new Promise(resolve => setTimeout(resolve, 100));
			const finalCacheData = await this.readCache();
			if (finalCacheData) {
				memoryCache = finalCacheData;
				memoryCacheTimestamp = now;
				return finalCacheData;
			}
			// 如果还是失败，直接读取（避免死锁）
		}

		try {
			// 从文件系统读取数据
			const result = await this.fetchNotes();
			
			// 更新缓存
			memoryCache = result.success;
			memoryCacheTimestamp = now;
			await this.writeCache(result.success);

			return result.success;
		} finally {
			// 释放锁
			await this.releaseLock();
		}
	}

	/**
	 * 等待锁释放
	 */
	private async waitForLock(maxWait = 10000): Promise<void> {
		const start = Date.now();
		while (Date.now() - start < maxWait) {
			try {
				const stats = await import('node:fs/promises').then(fs => fs.stat(LOCK_FILE));
				// 如果锁文件存在且很新（5秒内），说明正在写入，继续等待
				if (Date.now() - stats.mtime.getTime() < 5000) {
					await new Promise(resolve => setTimeout(resolve, 100));
					continue;
				}
				// 锁文件过期，可以删除
				await import('node:fs/promises').then(fs => fs.unlink(LOCK_FILE));
				break;
			} catch (error) {
				// 锁文件不存在
				break;
			}
		}
	}

	/**
	 * 创建锁文件
	 */
	private async createLock(): Promise<boolean> {
		try {
			await writeFile(LOCK_FILE, process.pid.toString());
			return true;
		} catch (error) {
			return false;
		}
	}

	/**
	 * 释放锁
	 */
	private async releaseLock(): Promise<void> {
		try {
			await import('node:fs/promises').then(fs => fs.unlink(LOCK_FILE));
		} catch (error) {
			// 忽略错误
		}
	}

	/**
	 * 读取构建时缓存
	 */
	private async readCache(): Promise<RawNote[] | null> {
		try {
			const cacheData = await readFile(CACHE_FILE, 'utf-8');
			const parsed: CacheData = JSON.parse(cacheData);
			
			// 检查缓存是否过期（基于文件修改时间）
			const stats = await import('node:fs/promises').then(fs => fs.stat(CACHE_FILE));
			const now = Date.now();
			if (now - stats.mtime.getTime() > CACHE_TTL) {
				return null;
			}
			
			return parsed.data;
		} catch (error) {
			// 缓存文件不存在或格式错误
			return null;
		}
	}

	/**
	 * 写入构建时缓存
	 */
	private async writeCache(data: RawNote[]): Promise<void> {
		try {
			const cacheData: CacheData = {
				data,
			};
			
			await writeFile(CACHE_FILE, JSON.stringify(cacheData));
		} catch (error) {
			// 忽略写入错误，构建继续
		}
	}

	/**
	 * 清除缓存 - 用于开发时热重载
	 */
	async clearCache(): Promise<void> {
		memoryCache = null;
		memoryCacheTimestamp = null;
		
		try {
			// 删除构建缓存文件
			const fs = await import('node:fs/promises');
			await fs.unlink(CACHE_FILE);
		} catch (error) {
			// 忽略文件不存在的错误
		}
	}

	/**
	 * 验证单个笔记的结构
	 */
	private validateNote(note: RawNote): ValidationResult {
		const result = RawNoteSchema.safeParse(note);

		if (result.success) {
			return { success: true, data: note };
		}

		const errorMessage = result.error.issues
			.map((issue) => `${issue.path.join(".")}: ${issue.message}`)
			.join("; ");

		return { success: false, error: errorMessage };
	}

	/**
	 * 读取目录中的 markdown 文件
	 */
	private async readMarkdownFiles(): Promise<string[]> {
		try {
			const files = await readdir(this.notesDirectory);
			return files.filter((file) => extname(file) === ".md");
		} catch (error) {
			throw new Error(`无法访问笔记目录 ${this.notesDirectory}: ${error}`);
		}
	}

	/**
	 * 处理单个文件
	 */
	private async processFile(filename: string): Promise<RawNote> {
		const filePath = join(this.notesDirectory, filename);
		const content = await readFile(filePath, "utf-8");
		const ulid = basename(filename, ".md");

		const rawNote: RawNote = { filename, content, ulid };
		const validation = this.validateNote(rawNote);

		if (!validation.success) {
			throw new Error(validation.error);
		}

		return validation.data;
	}

	/**
	 * 聚合处理结果
	 */
	private aggregateResults(
		results: PromiseSettledResult<RawNote>[],
		filenames: string[],
	): FetchResult<RawNote> {
		const success: RawNote[] = [];
		const errors: FetchResult<RawNote>["errors"] = [];

		results.forEach((result, index) => {
			const filename = filenames[index];

			if (result.status === "fulfilled") {
				success.push(result.value);
			} else {
				const errorType =
					result.reason.message.includes("ENOENT") ||
					result.reason.message.includes("读取文件")
						? ("read_error" as const)
						: ("validation_error" as const);

				errors.push({
					filename,
					error: result.reason.message,
					type: errorType,
				});
			}
		});

		return { success, errors };
	}

	/**
	 * 静态验证方法
	 */
	static validateULID(ulid: string): boolean {
		return isValidULID(ulid);
	}

	static validateContent(content: string): boolean {
		return ContentSchema.safeParse(content).success;
	}

	static validateRawNote(note: RawNote): ValidationResult {
		const result = RawNoteSchema.safeParse(note);

		if (result.success) {
			return { success: true, data: note };
		}

		const errorMessage = result.error.issues
			.map((issue) => `${issue.path.join(".")}: ${issue.message}`)
			.join("; ");

		return { success: false, error: errorMessage };
	}

	/**
	 * 获取笔记目录路径
	 */
	getNotesDirectory(): string {
		return this.notesDirectory;
	}
}

// 导出默认实例
export const contentFetcher = new ContentFetcher();