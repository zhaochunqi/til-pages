import { Archive, BookOpen } from "lucide-react";
import Link from "next/link";

import Pagination from "../components/Pagination";
import TILCard from "../components/TILCard";
import PageHeader from "../components/PageHeader";
import { ContentContainer } from "../components/PageLayout";
import { getAllTILs } from "../lib/data";
import { Page } from "../types";

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
		<ContentContainer>
			{/* Page Header */}
			<PageHeader
				title="Today I Learned"
				description="A collection of things I learn every day"
				icon={BookOpen}
				showStats={allTILs.length > 0}
				statsText={allTILs.length > 0 ? `${allTILs.length} total entries` : undefined}
				actions={allTILs.length > 0 ? (
					<Link
						href="/archive"
						className="inline-flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
					>
						<Archive size={14} />
						<span>View all entries</span>
					</Link>
				) : undefined}
			/>

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
		</ContentContainer>
	);
}
