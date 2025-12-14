import { isValid as isValidULID } from "ulid";
import { describe, expect, it } from "vitest";
import { ContentFetcher } from "../lib/content-fetcher";

describe("ContentFetcher", () => {
	it("should fetch notes with detailed results", async () => {
		const fetcher = new ContentFetcher();
		const result = await fetcher.fetchNotes();

		expect(result).toBeDefined();
		expect(result).toHaveProperty("success");
		expect(result).toHaveProperty("errors");
		expect(Array.isArray(result.success)).toBe(true);
		expect(Array.isArray(result.errors)).toBe(true);
		expect(result.success.length).toBeGreaterThan(0);

		// 验证第一个成功的笔记结构
		const firstNote = result.success[0];
		expect(firstNote).toHaveProperty("filename");
		expect(firstNote).toHaveProperty("content");
		expect(firstNote).toHaveProperty("ulid");
		expect(firstNote.filename).toMatch(/\.md$/);
		expect(firstNote.ulid).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/);
		expect(firstNote.content).toContain("---");
	});

	it("should fetch only valid notes with simplified API", async () => {
		const fetcher = new ContentFetcher();
		const notes = await fetcher.fetchValidNotes();

		expect(notes).toBeDefined();
		expect(Array.isArray(notes)).toBe(true);
		expect(notes.length).toBeGreaterThan(0);

		// 验证所有返回的笔记都是有效的
		notes.forEach((note) => {
			expect(note).toHaveProperty("filename");
			expect(note).toHaveProperty("content");
			expect(note).toHaveProperty("ulid");
			expect(note.filename).toMatch(/\.md$/);
			expect(ContentFetcher.validateULID(note.ulid)).toBe(true);
			expect(note.content).toContain("---");
		});
	});

	it("should validate note structure with detailed results", () => {
		// 有效的笔记
		const validNote = {
			filename: "01K5RR9NFREBCCRT4YHNN94W29.md",
			content: "---\ntitle: Test\n---\nContent",
			ulid: "01K5RR9NFREBCCRT4YHNN94W29",
		};
		const validResult = ContentFetcher.validateRawNote(validNote);
		expect(validResult.success).toBe(true);
		if (validResult.success) {
			expect(validResult.data).toEqual(validNote);
		}

		// 无效的 ULID
		const invalidUlidNote = {
			filename: "invalid.md",
			content: "---\ntitle: Test\n---\nContent",
			ulid: "invalid",
		};
		const invalidUlidResult = ContentFetcher.validateRawNote(invalidUlidNote);
		expect(invalidUlidResult.success).toBe(false);
		if (!invalidUlidResult.success) {
			expect(invalidUlidResult.error).toContain("无效的 ULID 格式");
		}

		// 空内容
		const emptyContentNote = {
			filename: "01K5RR9NFREBCCRT4YHNN94W29.md",
			content: "",
			ulid: "01K5RR9NFREBCCRT4YHNN94W29",
		};
		const emptyContentResult = ContentFetcher.validateRawNote(emptyContentNote);
		expect(emptyContentResult.success).toBe(false);
		if (!emptyContentResult.success) {
			expect(emptyContentResult.error).toContain("内容不能为空");
		}

		// 缺少 front matter
		const noFrontMatterNote = {
			filename: "01K5RR9NFREBCCRT4YHNN94W29.md",
			content: "Just content without front matter",
			ulid: "01K5RR9NFREBCCRT4YHNN94W29",
		};
		const noFrontMatterResult =
			ContentFetcher.validateRawNote(noFrontMatterNote);
		expect(noFrontMatterResult.success).toBe(false);
		if (!noFrontMatterResult.success) {
			expect(noFrontMatterResult.error).toContain("front matter");
		}
	});

	it("should validate ULID format using ulid library", () => {
		// 有效的 ULID
		expect(ContentFetcher.validateULID("01K5RR9NFREBCCRT4YHNN94W29")).toBe(
			true,
		);
		expect(isValidULID("01K5RR9NFREBCCRT4YHNN94W29")).toBe(true);

		// 无效的 ULID - 太短
		expect(ContentFetcher.validateULID("01K5RR9NFREBCCRT4YHNN94W2")).toBe(
			false,
		);
		expect(isValidULID("01K5RR9NFREBCCRT4YHNN94W2")).toBe(false);

		// 无效的 ULID - 包含无效字符 (I, L, O, U 不允许)
		expect(ContentFetcher.validateULID("01K5RR9NFREBCCRT4YHNN94W2I")).toBe(
			false,
		);
		expect(isValidULID("01K5RR9NFREBCCRT4YHNN94W2I")).toBe(false);

		// 有效的 ULID - 小写字母 (ulid 库支持大小写不敏感)
		expect(ContentFetcher.validateULID("01k5rr9nfrebccrt4yhnn94w29")).toBe(
			true,
		);
		expect(isValidULID("01k5rr9nfrebccrt4yhnn94w29")).toBe(true);

		// 验证我们的方法与 ulid 库的结果一致
		const testCases = [
			"01K5RR9NFREBCCRT4YHNN94W29", // 有效 - 大写
			"01k5rr9nfrebccrt4yhnn94w29", // 有效 - 小写
			"01ARZ3NDEKTSV4RRFFQ69G5FAV", // 有效 - 标准示例
			"invalid", // 无效 - 格式错误
			"01K5RR9NFREBCCRT4YHNN94W2", // 无效 - 太短
			"01K5RR9NFREBCCRT4YHNN94W2I", // 无效 - 包含 I
			"01K5RR9NFREBCCRT4YHNN94W2L", // 无效 - 包含 L
			"01K5RR9NFREBCCRT4YHNN94W2O", // 无效 - 包含 O
			"01K5RR9NFREBCCRT4YHNN94W2U", // 无效 - 包含 U
			"", // 无效 - 空字符串
			"01K5RR9NFREBCCRT4YHNN94W299", // 无效 - 太长
		];

		testCases.forEach((testCase) => {
			expect(ContentFetcher.validateULID(testCase)).toBe(isValidULID(testCase));
		});
	});

	it("should validate content format using static method", () => {
		// 有效的内容
		expect(
			ContentFetcher.validateContent("---\ntitle: Test\n---\nContent"),
		).toBe(true);

		// 无效的内容 - 空字符串
		expect(ContentFetcher.validateContent("")).toBe(false);

		// 无效的内容 - 缺少 front matter
		expect(ContentFetcher.validateContent("Just content")).toBe(false);

		// 有效的内容 - 仅有 front matter
		expect(ContentFetcher.validateContent("---\ntitle: Test\n---")).toBe(true);
	});
});
