import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NotFound from "../app/not-found";

describe("NotFound Component", () => {
	it("renders 404 error message", () => {
		render(<NotFound />);

		expect(screen.getByText("404")).toBeTruthy();
		expect(screen.getByText("Page Not Found")).toBeTruthy();
	});

	it("displays helpful error message about ULID", () => {
		render(<NotFound />);

		expect(
			screen.getByText(/The TIL entry you're looking for doesn't exist/),
		).toBeTruthy();
		expect(screen.getByText(/ULID in the URL is invalid/)).toBeTruthy();
	});

	it("provides navigation links", () => {
		render(<NotFound />);

		const homeLink = screen.getByRole("link", { name: /Back to Home/i });
		const archiveLink = screen.getByRole("link", { name: /Browse Archive/i });

		expect(homeLink.getAttribute("href")).toBe("/");
		expect(archiveLink.getAttribute("href")).toBe("/archive");
	});

	it("includes additional help text", () => {
		render(<NotFound />);

		expect(screen.getByText(/Looking for something specific?/)).toBeTruthy();
		expect(
			screen
				.getByRole("link", { name: /Browse all entries/i })
				.getAttribute("href"),
		).toBe("/archive");
	});

	it("maintains minimal design with proper styling", () => {
		render(<NotFound />);

		// Find the main container with text-center class
		const mainContainer = screen.getByText("404").closest(".text-center");
		expect(mainContainer).toBeTruthy();

		const homeButton = screen.getByRole("link", { name: /Back to Home/i });
		expect(homeButton.className).toContain("border-gray-300");
		expect(homeButton.className).toContain("text-gray-700");
	});
});
