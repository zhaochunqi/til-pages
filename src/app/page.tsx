import { decodeTime } from "ulid";
import Link from "next/link";
import { Archive, Calendar, BookOpen } from "lucide-react";
import Pagination from "../components/Pagination";
import TILCard from "../components/TILCard";
import { contentFetcher } from "../lib/content-fetcher";
import { MarkdownParser } from "../lib/markdown-parser";
import { Page, type TIL } from "../types";

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
 * Homepage component displaying the latest TIL entries with pagination
 * Requirements: 1.1, 1.2, 1.5
 */
export default async function Home() {
	// Get all TIL entries
	const allTILs = await getAllTILs();

	// Create first page (10 items)
	const firstPage = Page.fromAllTILs(allTILs, 1);
	const totalPages = Page.getTotalPages(allTILs.length);

	return (
		<div className="space-y-8">
			{/* Page Header */}
			<div className="text-center">
				<div className="flex items-baseline justify-center space-x-3 mb-2">
					<BookOpen size={28} className="text-gray-700" />
					<h1 className="text-3xl font-bold text-gray-900">
						Today I Learned
					</h1>
				</div>
				<p className="text-gray-600 flex items-center justify-center space-x-1">
					<Calendar size={14} />
					<span>A collection of things I learn every day</span>
				</p>
				{allTILs.length > 0 && (
					<div className="mt-4">
						<Link
							href="/archive"
							className="inline-flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
						>
							<Archive size={14} />
							<span>View all {allTILs.length} entries</span>
						</Link>
					</div>
				)}
			</div>

			{/* TIL Entries */}
			{firstPage.tils.length > 0 ? (
				<div className="space-y-6">
					{firstPage.tils.map((til) => (
						<TILCard key={til.ulid} til={til} showFullContent={true} />
					))}
				</div>
			) : (
				<div className="text-center py-12">
					<p className="text-gray-500 text-lg">
						No TIL entries found. Start learning and sharing!
					</p>
				</div>
			)}

			{/* Pagination */}
			{totalPages > 1 && (
				<Pagination currentPage={1} totalPages={totalPages} basePath="/page" />
			)}
		</div>
	);
}
