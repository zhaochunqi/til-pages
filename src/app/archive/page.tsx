import type { Metadata } from "next";
import { Archive, Calendar, Home } from "lucide-react";
import Link from "next/link";
import ArchiveItem from "../../components/ArchiveItem";
import { Breadcrumb } from "../../components/Navigation";
import { getAllTILs } from "../../lib/data";
import type { TIL } from "../../types";

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
