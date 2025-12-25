import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	basePath?: string;
}

/**
 * Pagination component for navigating between pages
 * Uses Lucide React icons for navigation
 * Maintains minimalist design principles
 */
export default function Pagination({
	currentPage,
	totalPages,
	basePath = "/page",
}: PaginationProps) {
	// Don't render pagination if there's only one page or no pages
	if (totalPages <= 1) {
		return null;
	}

	const hasPrevious = currentPage > 1;
	const hasNext = currentPage < totalPages;

	// Generate page URL
	const getPageUrl = (page: number): string => {
		if (page === 1) {
			return "/"; // First page is the home page
		}
		return `${basePath}/${page}`;
	};

	// Generate array of page numbers to display
	const getVisiblePages = (): number[] => {
		const pages: number[] = [];
		const maxVisible = 5; // Show up to 5 page numbers

		if (totalPages <= maxVisible) {
			// Show all pages if total is small
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Show pages around current page
			let start = Math.max(1, currentPage - 2);
			let end = Math.min(totalPages, currentPage + 2);

			// Adjust if we're near the beginning or end
			if (currentPage <= 3) {
				end = Math.min(totalPages, 5);
			} else if (currentPage >= totalPages - 2) {
				start = Math.max(1, totalPages - 4);
			}

			for (let i = start; i <= end; i++) {
				pages.push(i);
			}
		}

		return pages;
	};

	const visiblePages = getVisiblePages();

	return (
		<nav
			className="flex items-center justify-center space-x-2 mt-8 mb-8"
			aria-label="Pagination Navigation"
		>
			{/* Previous Page Button */}
			{hasPrevious ? (
				<Link
					href={getPageUrl(currentPage - 1)}
					className="
						flex items-center px-3 py-2 text-sm
						text-gray-600 hover:text-gray-900
						border border-gray-300 rounded-md
						hover:bg-gray-50 transition-colors
						focus:outline-none focus:ring-2 focus:ring-gray-500
					"
					aria-label="Previous page"
				>
					<ChevronLeft size={16} className="mr-1" />
					Previous
				</Link>
			) : (
				<span
					className="
						flex items-center px-3 py-2 text-sm
						text-gray-400 border border-gray-200 rounded-md
						cursor-not-allowed
					"
				>
					<ChevronLeft size={16} className="mr-1" />
					Previous
				</span>
			)}

			{/* Page Numbers */}
			<div className="flex items-center space-x-1">
				{/* Show first page if not in visible range */}
				{visiblePages[0] > 1 && (
					<>
						<Link
							href={getPageUrl(1)}
							className="
								px-3 py-2 text-sm text-gray-600 hover:text-gray-900
								border border-gray-300 rounded-md hover:bg-gray-50
								transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
							"
							aria-label="Go to page 1"
						>
							1
						</Link>
						{visiblePages[0] > 2 && (
							<span className="px-2 text-gray-400">...</span>
						)}
					</>
				)}

				{/* Visible page numbers */}
				{visiblePages.map((page) => (
					<Link
						key={page}
						href={getPageUrl(page)}
						className={`
							px-3 py-2 text-sm border rounded-md transition-colors
							focus:outline-none focus:ring-2 focus:ring-gray-500
							${
								page === currentPage
									? "bg-gray-700 text-white border-gray-700"
									: "text-gray-600 hover:text-gray-900 border-gray-300 hover:bg-gray-50"
							}
						`.trim()}
						aria-label={
							page === currentPage
								? `Current page, page ${page}`
								: `Go to page ${page}`
						}
						aria-current={page === currentPage ? "page" : undefined}
					>
						{page}
					</Link>
				))}

				{/* Show last page if not in visible range */}
				{visiblePages[visiblePages.length - 1] < totalPages && (
					<>
						{visiblePages[visiblePages.length - 1] < totalPages - 1 && (
							<span className="px-2 text-gray-400">...</span>
						)}
						<Link
							href={getPageUrl(totalPages)}
							className="
								px-3 py-2 text-sm text-gray-600 hover:text-gray-900
								border border-gray-300 rounded-md hover:bg-gray-50
								transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
							"
							aria-label={`Go to page ${totalPages}`}
						>
							{totalPages}
						</Link>
					</>
				)}
			</div>

			{/* Next Page Button */}
			{hasNext ? (
				<Link
					href={getPageUrl(currentPage + 1)}
					className="
						flex items-center px-3 py-2 text-sm
						text-gray-600 hover:text-gray-900
						border border-gray-300 rounded-md
						hover:bg-gray-50 transition-colors
						focus:outline-none focus:ring-2 focus:ring-gray-500
					"
					aria-label="Next page"
				>
					Next
					<ChevronRight size={16} className="ml-1" />
				</Link>
			) : (
				<span
					className="
						flex items-center px-3 py-2 text-sm
						text-gray-400 border border-gray-200 rounded-md
						cursor-not-allowed
					"
				>
					Next
					<ChevronRight size={16} className="ml-1" />
				</span>
			)}
		</nav>
	);
}
