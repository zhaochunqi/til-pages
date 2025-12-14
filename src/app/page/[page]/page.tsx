import { notFound } from "next/navigation";
import { decodeTime } from "ulid";
import Pagination from "../../../components/Pagination";
import TILCard from "../../../components/TILCard";
import { contentFetcher } from "../../../lib/content-fetcher";
import { MarkdownParser } from "../../../lib/markdown-parser";
import { Page, type TIL } from "../../../types";

/**
 * Convert ParsedNote to TIL interface
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
 * Get all TIL entries sorted by creation date (newest first)
 */
async function getAllTILs(): Promise<TIL[]> {
	try {
		// Fetch raw notes from the content fetcher
		const rawNotes = await contentFetcher.fetchValidNotes();

		// Parse markdown content and extract metadata
		const parsedNotes = MarkdownParser.parseFiles(rawNotes);

		// Convert to TIL format
		const tils = parsedNotes.map(parsedNoteToTIL);

		// Sort by creation date (newest first) using ULID timestamp
		return tils.sort((a, b) => {
			const timeA = decodeTime(a.ulid);
			const timeB = decodeTime(b.ulid);
			return timeB - timeA; // Descending order (newest first)
		});
	} catch (error) {
		console.error("Error fetching TIL entries:", error);
		return [];
	}
}

/**
 * Generate static parameters for all pagination pages
 * This pre-generates all possible page routes at build time
 */
export async function generateStaticParams() {
	try {
		const allTILs = await getAllTILs();
		const totalPages = Page.getTotalPages(allTILs.length);

		// Generate params for pages 2 and onwards (page 1 is handled by the home route)
		const params = [];
		for (let i = 2; i <= totalPages; i++) {
			params.push({ page: i.toString() });
		}

		return params;
	} catch (error) {
		console.error("Error generating static params:", error);
		return [];
	}
}

interface PageProps {
	params: Promise<{
		page: string;
	}>;
}

/**
 * Pagination page component displaying TIL entries for a specific page
 * Requirements: 1.3, 1.4
 */
export default async function PaginationPage({ params }: PageProps) {
	// Await params since it's a Promise in Next.js 15+
	const resolvedParams = await params;

	// Parse page number from params
	const pageNumber = parseInt(resolvedParams.page, 10);

	// Validate page number
	if (Number.isNaN(pageNumber) || pageNumber < 1) {
		notFound();
	}

	// Get all TIL entries
	const allTILs = await getAllTILs();
	const totalPages = Page.getTotalPages(allTILs.length);

	// Check if page number is valid
	if (pageNumber > totalPages) {
		notFound();
	}

	// Create the requested page
	const currentPage = Page.fromAllTILs(allTILs, pageNumber);

	return (
		<div className="space-y-8">
			{/* Page Header */}
			<div className="text-center">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">
					Today I Learned
				</h1>
				<p className="text-gray-600">
					A collection of things I learn every day - Page {pageNumber}
				</p>
			</div>

			{/* TIL Entries */}
			{currentPage.tils.length > 0 ? (
				<div className="space-y-6">
					{currentPage.tils.map((til) => (
						<TILCard key={til.ulid} til={til} showFullContent={true} />
					))}
				</div>
			) : (
				<div className="text-center py-12">
					<p className="text-gray-500 text-lg">
						No TIL entries found on this page.
					</p>
				</div>
			)}

			{/* Pagination */}
			{totalPages > 1 && (
				<Pagination
					currentPage={pageNumber}
					totalPages={totalPages}
					basePath="/page"
				/>
			)}
		</div>
	);
}
