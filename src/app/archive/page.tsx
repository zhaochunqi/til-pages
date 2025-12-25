import type { Metadata } from "next";
import { Archive, Home } from "lucide-react";
import Link from "next/link";
import ArchiveItem from "../../components/ArchiveItem";
import PageHeader from "../../components/PageHeader";
import { ContentContainer } from "../../components/PageLayout";
import { getAllTILs } from "../../lib/data";

export const metadata: Metadata = {
	title: "Archive",
	description: "Browse the full history of my daily learnings and technical notes.",
};



/**
 * Archive page component displaying all TIL entries as title-link pairs
 * Requirements: 3.1, 3.2, 3.4
 */
export default async function ArchivePage() {
	// Get all TIL entries sorted by time (newest first)
	const allTILs = await getAllTILs();

	return (
		<ContentContainer>
			{/* Page Header */}
			<PageHeader
				title="Archive"
				description={`All ${allTILs.length} TIL entries, sorted by date`}
				icon={Archive}
				actions={
					<Link
						href="/"
						className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors text-sm"
					>
						<Home size={14} />
						<span>Back to latest entries</span>
					</Link>
				}
			/>

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
		</ContentContainer>
	);
}
