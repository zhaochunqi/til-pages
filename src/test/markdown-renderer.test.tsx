import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MarkdownRenderer from "../components/MarkdownRenderer";

describe("MarkdownRenderer", () => {
	it("renders basic markdown content", () => {
		const content = "# Hello World\n\nThis is a **bold** text.";
		const { container } = render(<MarkdownRenderer content={content} />);

		expect(container.querySelector("h1")).toBeTruthy();
		expect(container.querySelector("p")).toBeTruthy();
		expect(container.querySelector("strong")).toBeTruthy();
	});

	it("renders code blocks with syntax highlighting", () => {
		const content = '```javascript\nconst hello = "world";\n```';
		const { container } = render(<MarkdownRenderer content={content} />);

		expect(container.querySelector("pre")).toBeTruthy();
		expect(container.querySelector("code")).toBeTruthy();
	});

	it("renders inline code", () => {
		const content = "This is `inline code` in text.";
		const { container } = render(<MarkdownRenderer content={content} />);

		const codeElement = container.querySelector("code");
		expect(codeElement).toBeTruthy();
		expect(codeElement?.textContent).toBe("inline code");
	});

	it("renders GitHub Flavored Markdown features", () => {
		const content = `
| Column 1 | Column 2 |
|----------|----------|
| Cell 1   | Cell 2   |

- [x] Completed task
- [ ] Incomplete task
`;
		const { container } = render(<MarkdownRenderer content={content} />);

		expect(container.querySelector("table")).toBeTruthy();
		expect(container.querySelector("th")).toBeTruthy();
		expect(container.querySelector("td")).toBeTruthy();
		expect(container.querySelector('input[type="checkbox"]')).toBeTruthy();
	});

	it("applies custom className", () => {
		const content = "# Test";
		const { container } = render(
			<MarkdownRenderer content={content} className="custom-class" />,
		);

		const wrapper = container.firstChild as HTMLElement;
		expect(wrapper.className).toContain("custom-class");
	});

	it("renders links with proper attributes", () => {
		const content = "[Example Link](https://example.com)";
		const { container } = render(<MarkdownRenderer content={content} />);

		const link = container.querySelector("a");
		expect(link).toBeTruthy();
		expect(link?.getAttribute("href")).toBe("https://example.com");
		expect(link?.getAttribute("target")).toBe("_blank");
		expect(link?.getAttribute("rel")).toBe("noopener noreferrer");
	});

	it("renders blockquotes", () => {
		const content = "> This is a blockquote";
		const { container } = render(<MarkdownRenderer content={content} />);

		expect(container.querySelector("blockquote")).toBeTruthy();
	});

	it("renders lists", () => {
		const content = `
1. First item
2. Second item

- Bullet one
- Bullet two
`;
		const { container } = render(<MarkdownRenderer content={content} />);

		expect(container.querySelector("ol")).toBeTruthy();
		expect(container.querySelector("ul")).toBeTruthy();
		expect(container.querySelectorAll("li")).toHaveLength(4);
	});

	it("renders Mermaid diagrams", () => {
		const content = `\`\`\`mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
\`\`\``;
		const { container } = render(<MarkdownRenderer content={content} />);

		const mermaidElement = container.querySelector(".mermaid");
		expect(mermaidElement).toBeTruthy();
		expect(mermaidElement?.textContent).toContain("graph TD");
	});
});
