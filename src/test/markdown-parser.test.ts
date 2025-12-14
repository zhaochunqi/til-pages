import { describe, expect, it } from "vitest";
import { MarkdownParser } from "../lib/markdown-parser";

describe("MarkdownParser", () => {
	const parser = new MarkdownParser();

	it("should parse markdown content with valid front matter", () => {
		const content = `---
title: Test TIL
tags: [javascript, testing]
date: 2023-01-01T00:00:00.000Z
---

# Test Content

This is a test markdown content.`;

		const ulid = "01K5RR9NFREBCCRT4YHNN94W29";
		const result = parser.parse(content, ulid);

		expect(result.ulid).toBe(ulid);
		expect(result.title).toBe("Test TIL");
		expect(result.tags).toEqual(["javascript", "testing"]);
		expect(result.content).toBe(
			"# Test Content\n\nThis is a test markdown content.",
		);
		expect(result.frontMatter.title).toBe("Test TIL");
		expect(result.frontMatter.tags).toEqual(["javascript", "testing"]);
		// Date should come from ULID, not from front matter
		expect(result.frontMatter.date).toBeDefined();
		expect(result.frontMatter.date).toMatch(
			/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
		);
	});

	it("should throw error when front matter is missing", () => {
		const content = `# Test Content

This is a test markdown content without front matter.`;

		const ulid = "01K5RR9NFREBCCRT4YHNN94W29";

		expect(() => parser.parse(content, ulid)).toThrow("Front matter 验证失败");
	});

	it("should throw error when title is missing", () => {
		const content = `---
tags: [test]
---

# Test Content

This is a test with missing title.`;

		const ulid = "01K5RR9NFREBCCRT4YHNN94W29";

		expect(() => parser.parse(content, ulid)).toThrow("Front matter 验证失败");
	});

	it("should handle partial front matter with valid title", () => {
		const content = `---
title: Partial TIL
---

# Test Content

This is a test with partial front matter.`;

		const ulid = "01K5RR9NFREBCCRT4YHNN94W29";
		const result = parser.parse(content, ulid);

		expect(result.ulid).toBe(ulid);
		expect(result.title).toBe("Partial TIL");
		expect(result.tags).toEqual([]); // Empty array when tags not provided
		expect(result.content).toBe(
			"# Test Content\n\nThis is a test with partial front matter.",
		);
		expect(result.frontMatter.title).toBe("Partial TIL");
		expect(result.frontMatter.tags).toEqual([]);
		expect(result.frontMatter.date).toBeDefined();
	});

	it("should extract front matter correctly", () => {
		const content = `---
title: Extract Test
tags: [test, extraction]
date: 2023-01-01T00:00:00.000Z
---

Content here`;

		const frontMatter = parser.extractFrontMatter(content);

		expect(frontMatter.title).toBe("Extract Test");
		expect(frontMatter.tags).toEqual(["test", "extraction"]);
		// Date is ignored from front matter, only title and tags are extracted
	});

	it("should throw error for malformed YAML front matter", () => {
		const content = `---
title: Malformed
tags: not-an-array
invalid-yaml: [unclosed
---

Content here`;

		expect(() => parser.extractFrontMatter(content)).toThrow();
	});

	it("should validate markdown content format", () => {
		const validContent = `---
title: Valid
---
Content`;

		const invalidContent = "Just plain text";

		expect(MarkdownParser.validateMarkdownContent(validContent)).toBe(true);
		expect(MarkdownParser.validateMarkdownContent(invalidContent)).toBe(true); // gray-matter can handle content without front matter
	});

	it("should parse files using static method", () => {
		const rawNote = {
			filename: "01K5RR9NFREBCCRT4YHNN94W29.md",
			content: `---
title: Static Test
tags: [static]
---

Static method test content.`,
			ulid: "01K5RR9NFREBCCRT4YHNN94W29",
		};

		const result = MarkdownParser.parseFile(rawNote);

		expect(result.ulid).toBe(rawNote.ulid);
		expect(result.title).toBe("Static Test");
		expect(result.tags).toEqual(["static"]);
		expect(result.content).toBe("Static method test content.");
	});

	it("should parse multiple files using static method", () => {
		const rawNotes = [
			{
				filename: "01K5RR9NFREBCCRT4YHNN94W29.md",
				content: `---
title: First TIL
tags: [first]
---

First content.`,
				ulid: "01K5RR9NFREBCCRT4YHNN94W29",
			},
			{
				filename: "01K5X1514G144QQSM4K4S85WMC.md",
				content: `---
title: Second TIL
tags: [second]
---

Second content.`,
				ulid: "01K5X1514G144QQSM4K4S85WMC",
			},
		];

		const results = MarkdownParser.parseFiles(rawNotes);

		expect(results).toHaveLength(2);
		expect(results[0].title).toBe("First TIL");
		expect(results[1].title).toBe("Second TIL");
		expect(results[0].tags).toEqual(["first"]);
		expect(results[1].tags).toEqual(["second"]);
	});

	it("should validate ULID format using ulid library", () => {
		// 有效的 ULID
		expect(MarkdownParser.validateULID("01K5RR9NFREBCCRT4YHNN94W29")).toBe(
			true,
		);

		// 无效的 ULID - 太短
		expect(MarkdownParser.validateULID("01K5RR9NFREBCCRT4YHNN94W2")).toBe(
			false,
		);

		// 无效的 ULID - 包含无效字符
		expect(MarkdownParser.validateULID("01K5RR9NFREBCCRT4YHNN94W2I")).toBe(
			false,
		);

		// 空字符串
		expect(MarkdownParser.validateULID("")).toBe(false);

		// 无效格式
		expect(MarkdownParser.validateULID("invalid")).toBe(false);
	});

	it("should throw error for invalid ULID", () => {
		const content = `---
title: Valid Title
tags: [test]
---

Content here`;

		const invalidUlid = "invalid-ulid";

		expect(() => parser.parse(content, invalidUlid)).toThrow(
			"无效的 ULID 格式",
		);
	});

	it("should throw error for empty title", () => {
		const content = `---
title: ""
tags: [test]
---

Content here`;

		const ulid = "01K5RR9NFREBCCRT4YHNN94W29";

		expect(() => parser.parse(content, ulid)).toThrow("Front matter 验证失败");
	});
});
