import type { Metadata } from "next";
import {
	Archive,
	Calendar,
	ChevronLeft,
	ChevronRight,
	Home,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { decodeTime, isValid as isValidULID } from "ulid";
import MarkdownRenderer from "../../components/MarkdownRenderer";
import { Breadcrumb } from "../../components/Navigation";
import Tags from "../../components/Tags";
import TILReference from "../../components/TILReference";
import { getAllTILs } from "../../lib/data";
import type { TIL } from "../../types";



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

export async function generateMetadata({
	params,
}: IndividualPageProps): Promise<Metadata> {
	const { ulid } = await params;
	const til = (await getAllTILs()).find((t) => t.ulid === ulid.toUpperCase());

	if (!til) {
		return {
			title: "TIL Not Found",
		};
	}

	const description =
		til.content.slice(0, 160).replace(/[#*`]/g, "").trim() + "...";

	return {
		title: til.title,
		description: description,
		keywords: [...til.tags, "TIL", "Today I Learned"],
		openGraph: {
			title: til.title,
			description: description,
			type: "article",
			publishedTime: new Date(decodeTime(til.ulid)).toISOString(),
			authors: ["Chunqi Zhao"],
			tags: til.tags,
		},
		twitter: {
			card: "summary_large_image",
			title: til.title,
			description: description,
		},
	};
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
	const formattedDate = createdAt.toLocaleDateString("zh-CN", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	// JSON-LD structured data
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: til.title,
		datePublished: createdAt.toISOString(),
		dateModified: createdAt.toISOString(),
		author: {
			"@type": "Person",
			name: "Chunqi Zhao",
			url: "https://zhaochunqi.com",
		},
		description: til.content.slice(0, 160).replace(/[#*`]/g, "").trim(),
		keywords: til.tags.join(", "),
	};

	return (
		<div className="space-y-8">
			{/* Add JSON-LD to the page */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>

			{/* Breadcrumb Navigation */}
			<Breadcrumb
				items={[
					{ label: "Home", href: "/", icon: <Home size={12} /> },
					{ label: til.title, icon: <Calendar size={12} /> },
				]}
			/>

			{/* Article with enhanced single-page layout */}
			<article className="bg-white border border-gray-200 rounded-lg overflow-hidden">
				{/* Header with enhanced styling for single page */}
				<header className="px-8 pt-8 pb-4">
					<h1 className="text-3xl font-bold text-gray-900 mb-4">{til.title}</h1>
					<div className="flex items-center gap-4 mb-4">
						<time dateTime={createdAt.toISOString()} className="text-gray-500 whitespace-nowrap">
							{formattedDate}
						</time>
						{til.tags.length > 0 && (
							<div className="flex-1">
								<Tags tags={til.tags} variant="card" />
							</div>
						)}
						<div className="text-xs text-gray-400 font-mono whitespace-nowrap">
							id: {til.ulid}
						</div>
					</div>

					{/* TIL Reference - moved to header */}
					<TILReference
						title={til.title}
						url={`https://til.zhaochunqi.com/${til.ulid.toLowerCase()}`}
					/>
				</header>

				{/* Content */}
				<div className="px-8 pb-8">
					<MarkdownRenderer
						content={til.content}
						className="prose-lg max-w-none"
					/>
				</div>

				
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
