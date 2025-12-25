import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Pagination from "../components/Pagination";

// Mock Next.js Link component
vi.mock("next/link", () => ({
	default: ({
		href,
		children,
		...props
	}: {
		href: string;
		children: React.ReactNode;
		[key: string]: unknown;
	}) => (
		<a href={href} {...props}>
			{children}
		</a>
	),
}));

describe("Pagination Component", () => {
	it("should not render when totalPages is 1 or less", () => {
		const { container } = render(<Pagination currentPage={1} totalPages={1} />);
		expect(container.firstChild).toBe(null);

		const { container: container2 } = render(
			<Pagination currentPage={1} totalPages={0} />,
		);
		expect(container2.firstChild).toBe(null);
	});

	it("should render pagination controls when totalPages > 1", () => {
		render(<Pagination currentPage={1} totalPages={3} />);

		expect(screen.getByText("Previous")).toBeTruthy();
		expect(screen.getByText("Next")).toBeTruthy();
		expect(screen.getByText("1")).toBeTruthy();
		expect(screen.getByText("2")).toBeTruthy();
		expect(screen.getByText("3")).toBeTruthy();
	});

	it("should disable Previous button on first page", () => {
		render(<Pagination currentPage={1} totalPages={3} />);

		const prevButton = screen.getByText("Previous").closest("span");
		expect(prevButton?.className).toContain("cursor-not-allowed");
		expect(prevButton?.className).toContain("text-gray-400");
	});

	it("should disable Next button on last page", () => {
		render(<Pagination currentPage={3} totalPages={3} />);

		const nextButton = screen.getByText("Next").closest("span");
		expect(nextButton?.className).toContain("cursor-not-allowed");
		expect(nextButton?.className).toContain("text-gray-400");
	});

	it("should highlight current page", () => {
		render(<Pagination currentPage={2} totalPages={5} />);

		const currentPageButton = screen.getByText("2");
		expect(currentPageButton.className).toContain("bg-gray-700");
		expect(currentPageButton.className).toContain("text-white");
	});

	it("should generate correct URLs for pages", () => {
		render(<Pagination currentPage={2} totalPages={3} />);

		// First page should link to "/"
		const page1Link = screen.getByText("1").closest("a");
		expect(page1Link?.getAttribute("href")).toBe("/");

		// Other pages should link to "/page/[number]"
		const page3Link = screen.getByText("3").closest("a");
		expect(page3Link?.getAttribute("href")).toBe("/page/3");
	});

	it("should use custom basePath when provided", () => {
		render(<Pagination currentPage={2} totalPages={3} basePath="/custom" />);

		const page3Link = screen.getByText("3").closest("a");
		expect(page3Link?.getAttribute("href")).toBe("/custom/3");
	});

	it("should show ellipsis for large page counts", () => {
		render(<Pagination currentPage={5} totalPages={10} />);

		// Should show ellipsis when there are many pages
		const ellipsis = screen.getAllByText("...");
		expect(ellipsis.length).toBeGreaterThan(0);
	});

	it("should show all pages when totalPages <= 5", () => {
		render(<Pagination currentPage={3} totalPages={5} />);

		// All pages should be visible
		for (let i = 1; i <= 5; i++) {
			expect(screen.getByText(i.toString())).toBeTruthy();
		}

		// No ellipsis should be present
		expect(screen.queryByText("...")).toBe(null);
	});
});
