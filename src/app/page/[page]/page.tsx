import type { Metadata } from "next";
import { Archive, BookOpen, Calendar, Home } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "../../../components/Navigation";
import Pagination from "../../../components/Pagination";
import TILCard from "../../../components/TILCard";
import { getAllTILs } from "../../../lib/data";
import { Page, type TIL } from "../../../types";

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const resolvedParams = await params;
	return {
		title: `Page ${resolvedParams.page}`,
		description: `Browse page ${resolvedParams.page} of my daily learnings and technical notes.`,
	};
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
			{/* Breadcrumb Navigation */}
			<Breadcrumb
				items={[
					{ label: "Home", href: "/", icon: <Home size={12} /> },
					{ label: `Page ${pageNumber}`, icon: <Calendar size={12} /> },
				]}
			/>

			{/* Page Header */}
			<div className="text-center">
				<div className="flex items-baseline justify-center space-x-3 mb-2">
					<BookOpen size={28} className="text-gray-700" />
					<h1 className="text-3xl font-bold text-gray-900">Today I Learned</h1>
				</div>
				<p className="text-gray-600 flex items-center justify-center space-x-1">
					<Calendar size={14} />
					<span>
						A collection of things I learn every day - Page {pageNumber}
					</span>
				</p>
				<div className="mt-4">
					<Link
						href="/archive"
						className="inline-flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
					>
						<Archive size={14} />
						<span>View all {allTILs.length} entries</span>
					</Link>
				</div>
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
