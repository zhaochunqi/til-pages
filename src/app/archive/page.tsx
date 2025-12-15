import { Archive, Calendar, Home } from "lucide-react";
import Link from "next/link";
import { decodeTime } from "ulid";
import ArchiveItem from "../../components/ArchiveItem";
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
 * Archive page component displaying all TIL entries as title-link pairs
 * Requirements: 3.1, 3.2, 3.4
 */
export default async function ArchivePage() {
	// Get all TIL entries sorted by time (newest first)
	const allTILs = await getAllTILs();

	return (
		<div className="space-y-8">
			{/* Breadcrumb Navigation */}
			<Breadcrumb
				items={[
					{ label: "Home", href: "/", icon: <Home size={12} /> },
					{ label: "Archive", icon: <Archive size={12} /> },
				]}
			/>

			{/* Page Header */}
			<div className="text-center">
				<div className="flex items-baseline justify-center space-x-3 mb-2">
					<Archive size={28} className="text-gray-700" />
					<h1 className="text-3xl font-bold text-gray-900">Archive</h1>
				</div>
				<p className="text-gray-600 flex items-center justify-center space-x-1">
					<Calendar size={14} />
					<span>All {allTILs.length} TIL entries, sorted by date</span>
				</p>
			</div>

			{/* Archive List */}
			{allTILs.length > 0 ? (
				<div className="bg-white border border-gray-200 rounded-lg">
					<div className="p-6">
						<div className="space-y-0">
							{allTILs.map((til) => (
								<ArchiveItem key={til.ulid} til={til} />
							))}
						</div>
					</div>
				</div>
			) : (
				<div className="text-center py-12">
					<p className="text-gray-500 text-lg">
						No TIL entries found. Start learning and sharing!
					</p>
				</div>
			)}

			{/* Footer Navigation */}
			<div className="flex justify-center">
				<Link
					href="/"
					className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors text-sm"
				>
					<Home size={14} />
					<span>Back to latest entries</span>
				</Link>
			</div>
		</div>
	);
}
