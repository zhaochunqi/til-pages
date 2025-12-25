import type { TIL } from "../types";
import { contentFetcher } from "./content-fetcher";
import { MarkdownParser } from "./markdown-parser";

/**
 * 转换 ParsedNote 到 TIL 接口
 */
function parsedNoteToTIL(parsedNote: {
	ulid: string;
	title: string;
	content: string;
	tags: string[];
}): TIL {
	return {
		ulid: parsedNote.ulid,
		title: parsedNote.title,
		content: parsedNote.content,
		tags: parsedNote.tags,
	};
}

/**
 * 构建时缓存 - 避免在静态生成时重复读取文件
 */
let buildTimeCache: TIL[] | null = null;

/**
 * 获取所有 TIL 条目并按创建日期排序（最新的在前）
 * 在生产构建时使用缓存以提高性能
 */
export async function getAllTILs(): Promise<TIL[]> {
	// 在生产构建时使用缓存
	if (process.env.NODE_ENV === 'production' && buildTimeCache) {
		return buildTimeCache;
	}

	try {
		// 从内容获取器获取原始笔记
		const rawNotes = await contentFetcher.fetchValidNotes();

		// 解析 markdown 内容并提取元数据
		const parsedNotes = MarkdownParser.parseFiles(rawNotes);

		// 转换为 TIL 格式
		const tils = parsedNotes.map(parsedNoteToTIL);

		// 按创建日期排序（最新的在前），直接使用 ULID 字符串比较
		// ULID 本身就是按时间排序的，可以直接进行字符串比较
		const sorted = tils.sort((a, b) => b.ulid.localeCompare(a.ulid));

		// 在生产环境缓存结果
		if (process.env.NODE_ENV === 'production') {
			buildTimeCache = sorted;
		}

		return sorted;
	} catch (error) {
		console.error("Error fetching TIL entries:", error);
		return [];
	}
}

/**
 * 根据标签筛选 TIL 条目
 */
export async function getTILsByTag(tag: string): Promise<TIL[]> {
	try {
		const allTILs = await getAllTILs();
		return allTILs.filter((til) => til.tags.includes(tag));
	} catch (error) {
		console.error(`Error fetching TIL entries for tag ${tag}:`, error);
		return [];
	}
}

/**
 * 获取所有唯一的标签及其使用次数
 */
export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
	try {
		const allTILs = await getAllTILs();
		const tagCounts = new Map<string, number>();

		allTILs.forEach((til) => {
			til.tags.forEach((tag) => {
				tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
			});
		});

		return Array.from(tagCounts.entries())
			.map(([tag, count]) => ({ tag, count }))
			.sort((a, b) => b.count - a.count);
	} catch (error) {
		console.error("Error fetching tags:", error);
		return [];
	}
}

/**
 * 清除内容获取器的缓存
 * 用于开发时的热重载
 */
export async function clearContentCache(): Promise<void> {
	await contentFetcher.clearCache();
}