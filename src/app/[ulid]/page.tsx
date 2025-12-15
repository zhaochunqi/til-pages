import { notFound } from "next/navigation";
import { decodeTime, isValid as isValidULID } from "ulid";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import MarkdownRenderer from "../../components/MarkdownRenderer";
import { contentFetcher } from "../../lib/content-fetcher";
import { MarkdownParser } from "../../lib/markdown-parser";
import type { TIL } from "../../types";

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
 * Generate static parameters for all ULID routes
 * This pre-generates all possible TIL pages at build time
 * Requirements: 2.1, 2.3
 */
export async function generateStaticParams() {
	try {
		const allTILs = await getAllTILs();

		// Generate params for each ULID (lowercase for URLs)
		return allTILs.map((til) => ({
			ulid: til.ulid.toLowerCase(),
		}));
	} catch (error) {
		console.error("Error generating static params for ULID routes:", error);
		return [];
	}
}

interface IndividualPageProps {
	params: Promise<{
		ulid: string;
	}>;
}

/**
 * Individual TIL page component displaying a single TIL entry
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */
export default async function IndividualTILPage({
	params,
}: IndividualPageProps) {
	// Await params since it's a Promise in Next.js 15+
	const resolvedParams = await params;
	const { ulid: urlUlid } = resolvedParams;

	// Convert URL ULID (lowercase) to uppercase for validation and lookup
	const ulid = urlUlid.toUpperCase();

	// Validate ULID format first
	if (!isValidULID(ulid)) {
		notFound();
	}

	// Get all TIL entries
	const allTILs = await getAllTILs();

	// Find the specific TIL entry by ULID
	const til = allTILs.find((t) => t.ulid === ulid);

	// If TIL not found, return 404
	if (!til) {
		notFound();
	}

	// Extract timestamp from ULID for display
	const createdAt = new Date(decodeTime(til.ulid));
	const formattedDate = createdAt.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
		weekday: "long",
	});

	return (
		<div className="space-y-8">
			{/* Navigation */}
			<nav className="flex items-center space-x-2 text-sm">
				<Link
					href="/"
					className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
				>
					<ChevronLeft size={16} />
					<span>Back to Home</span>
				</Link>
			</nav>

			{/* Article */}
			<article className="bg-white border border-gray-200 rounded-lg p-8">
				{/* Header */}
				<header className="mb-8 pb-6 border-b border-gray-100">
					<h1 className="text-3xl font-bold text-gray-900 mb-4">
						{til.title}
					</h1>
					<div className="flex items-center justify-between">
						<time
							dateTime={createdAt.toISOString()}
							className="text-gray-500"
						>
							{formattedDate}
						</time>
						<div className="text-xs text-gray-400 font-mono">
							id: {til.ulid}
						</div>
					</div>
				</header>

				{/* Content */}
				<div className="mb-8">
					<MarkdownRenderer
						content={til.content}
						className="prose-lg max-w-none"
					/>
				</div>

				{/* Tags */}
				{til.tags.length > 0 && (
					<footer className="pt-6 border-t border-gray-100">
						<div className="flex flex-wrap gap-2">
							<span className="text-sm text-gray-500 mr-2">Tags:</span>
							{til.tags.map((tag) => (
								<span
									key={tag}
									className="
										inline-block px-3 py-1 text-sm
										bg-gray-100 text-gray-700 rounded-full
										hover:bg-gray-200 transition-colors
									"
								>
									{tag}
								</span>
							))}
						</div>
					</footer>
				)}
			</article>

			{/* Additional Navigation */}
			<div className="flex justify-center">
				<Link
					href="/archive"
					className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
				>
					View all entries in archive →
				</Link>
			</div>
		</div>
	);
}