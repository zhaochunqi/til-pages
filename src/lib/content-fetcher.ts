import { readdir, readFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { isValid as isValidULID } from "ulid";
import { z } from "zod";

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
	 * 仅获取有效的笔记 - 简化的 API
	 */
	async fetchValidNotes(): Promise<RawNote[]> {
		const result = await this.fetchNotes();
		return result.success;
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
