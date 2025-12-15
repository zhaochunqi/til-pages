import {
	Archive,
	Calendar,
	ChevronLeft,
	ChevronRight,
	Home,
	Tag,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { decodeTime, isValid as isValidULID } from "ulid";
import MarkdownRenderer from "../../components/MarkdownRenderer";
import { Breadcrumb } from "../../components/Navigation";
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

	// Find previous and next entries for navigation
	const currentIndex = allTILs.findIndex((t) => t.ulid === ulid);
	const previousTIL =
		currentIndex < allTILs.length - 1 ? allTILs[currentIndex + 1] : null;
	const nextTIL = currentIndex > 0 ? allTILs[currentIndex - 1] : null;

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
			{/* Breadcrumb Navigation */}
			<Breadcrumb
				items={[
					{ label: "Home", href: "/", icon: <Home size={12} /> },
					{ label: til.title, icon: <Calendar size={12} /> },
				]}
			/>

			{/* Article */}
			<article className="bg-white border border-gray-200 rounded-lg p-8">
				{/* Header */}
				<header className="mb-8 pb-6 border-b border-gray-100">
					<h1 className="text-3xl font-bold text-gray-900 mb-4">{til.title}</h1>
					<div className="flex items-center justify-between">
						<time dateTime={createdAt.toISOString()} className="text-gray-500">
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
						<div className="flex flex-wrap gap-2 items-center">
							<div className="flex items-center space-x-1 text-sm text-gray-500 mr-2">
								<Tag size={14} />
								<span>Tags:</span>
							</div>
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

			{/* Previous/Next Navigation */}
			{(previousTIL || nextTIL) && (
				<nav className="flex justify-between items-center py-6 border-t border-gray-200">
					<div className="flex-1">
						{previousTIL && (
							<Link
								href={`/${previousTIL.ulid.toLowerCase()}`}
								className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors group"
							>
								<ChevronLeft
									size={16}
									className="group-hover:-translate-x-1 transition-transform"
								/>
								<div className="text-left">
									<div className="text-xs text-gray-500">Previous</div>
									<div className="text-sm font-medium">{previousTIL.title}</div>
								</div>
							</Link>
						)}
					</div>
					<div className="flex-1 text-right">
						{nextTIL && (
							<Link
								href={`/${nextTIL.ulid.toLowerCase()}`}
								className="flex items-center justify-end space-x-2 text-gray-600 hover:text-gray-900 transition-colors group"
							>
								<div className="text-right">
									<div className="text-xs text-gray-500">Next</div>
									<div className="text-sm font-medium">{nextTIL.title}</div>
								</div>
								<ChevronRight
									size={16}
									className="group-hover:translate-x-1 transition-transform"
								/>
							</Link>
						)}
					</div>
				</nav>
			)}

			{/* Additional Navigation */}
			<div className="flex justify-center space-x-6 text-sm">
				<Link
					href="/"
					className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
				>
					<Home size={14} />
					<span>Back to Home</span>
				</Link>
				<Link
					href="/archive"
					className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
				>
					<Archive size={14} />
					<span>View all entries</span>
				</Link>
			</div>
		</div>
	);
}
