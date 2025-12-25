import { render, screen } from "@testing-library/react";
import { ulid } from "ulid";
import { describe, expect, it } from "vitest";
import TILCard from "../components/TILCard";
import type { TIL } from "../types";

describe("TILCard", () => {
	const mockTIL: TIL = {
		ulid: ulid(),
		title: "Test TIL Entry",
		content: "# Hello World\n\nThis is a **test** TIL entry with some content.",
		tags: ["javascript", "testing"],
	};

	it("renders TIL title", () => {
		render(<TILCard til={mockTIL} />);
		expect(screen.getByText("Test TIL Entry")).toBeTruthy();
	});

	it("renders formatted date from ULID", () => {
		render(<TILCard til={mockTIL} />);
		// Should render a date element
		const timeElement = screen.getByRole("time");
		expect(timeElement).toBeTruthy();
		expect(timeElement.getAttribute("dateTime")).toBeTruthy();
	});

	it("renders full content by default", () => {
		render(<TILCard til={mockTIL} />);
		// Should render markdown content
		expect(screen.getByText("Hello World")).toBeTruthy();
		expect(screen.getByText("test")).toBeTruthy();
	});

	it("renders tags when present", () => {
		render(<TILCard til={mockTIL} />);
		expect(screen.getByText("javascript")).toBeTruthy();
		expect(screen.getByText("testing")).toBeTruthy();
	});

	it("does not render tags section when no tags", () => {
		const tilWithoutTags: TIL = {
			...mockTIL,
			tags: [],
		};
		const { container } = render(<TILCard til={tilWithoutTags} />);
		expect(container.querySelector("footer")).toBeFalsy();
	});

	it("applies custom className", () => {
		const { container } = render(
			<TILCard til={mockTIL} className="custom-class" />,
		);
		const article = container.querySelector("article");
		expect(article?.className).toContain("custom-class");
	});



	it("renders article with proper semantic structure", () => {
		const { container } = render(<TILCard til={mockTIL} />);
		const article = container.querySelector("article");
		const header = container.querySelector("header");
		const footer = container.querySelector("footer");

		expect(article).toBeTruthy();
		expect(header).toBeTruthy();
		expect(footer).toBeTruthy();
	});

	it("has responsive and accessible styling", () => {
		const { container } = render(<TILCard til={mockTIL} />);
		const article = container.querySelector("article");

		// Check for responsive classes
		expect(article?.className).toContain("p-6");
		expect(article?.className).toContain("mb-6");
		expect(article?.className).toContain("rounded-lg");
	});
});
