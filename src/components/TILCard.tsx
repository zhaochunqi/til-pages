import { decodeTime } from "ulid";
import Link from "next/link";
import { Calendar, ExternalLink } from "lucide-react";
import type { TIL } from "../types";
import MarkdownRenderer from "./MarkdownRenderer";

interface TILCardProps {
	til: TIL;
	showFullContent?: boolean;
	className?: string;
}

/**
 * TILCard component displays a TIL entry with minimalist styling
 * Integrates MarkdownRenderer for content display
 * Supports responsive design and clean typography
 */
export default function TILCard({
	til,
	showFullContent = true,
	className = "",
}: TILCardProps) {
	// Extract timestamp from ULID for display
	const createdAt = new Date(decodeTime(til.ulid));
	const formattedDate = createdAt.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	return (
		<article
			className={`
				bg-white border border-gray-200 rounded-lg p-6 mb-6
				hover:shadow-sm transition-shadow duration-200
				${className}
			`.trim()}
		>
			{/* Header with title and date */}
			<header className="mb-4">
				<h2 className="text-xl font-semibold text-gray-900 mb-2">
					<Link
						href={`/${til.ulid.toLowerCase()}`}
						className="hover:text-blue-600 transition-colors duration-200 group flex items-center space-x-1"
					>
						<span>{til.title}</span>
						<ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
					</Link>
				</h2>
				<div className="flex items-center space-x-1 text-sm text-gray-500">
					<Calendar size={12} />
					<time dateTime={createdAt.toISOString()}>
						{formattedDate}
					</time>
				</div>
			</header>

			{/* Content */}
			<div className="mb-4">
				{showFullContent ? (
					<MarkdownRenderer
						content={til.content}
						className="prose-sm max-w-none"
					/>
				) : (
					<div className="text-gray-600 line-clamp-3">
						{/* For preview mode, show first paragraph without markdown */}
						{til.content.split("\n\n")[0].replace(/[#*`]/g, "")}
					</div>
				)}
			</div>

			{/* Tags */}
			{til.tags.length > 0 && (
				<footer className="flex flex-wrap gap-2">
					{til.tags.map((tag) => (
						<span
							key={tag}
							className="
								inline-block px-2 py-1 text-xs
								bg-gray-100 text-gray-700 rounded
								hover:bg-gray-200 transition-colors
							"
						>
							{tag}
						</span>
					))}
				</footer>
			)}
		</article>
	);
}
