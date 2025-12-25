import Link from "next/link";
import { Tag } from "lucide-react";
import type { TIL } from "../types";

interface TagsProps {
	tags: TIL["tags"];
	variant?: "card" | "page";
	showLabel?: boolean;
}

/**
 * Tags component displays a list of tags with consistent styling
 * Can be used in TIL cards and individual TIL pages
 */
export default function Tags({ 
	tags, 
	variant = "card", 
	showLabel = false 
}: TagsProps) {
	if (tags.length === 0) return null;

	const tagClassName = variant === "page"
		? "recursive-tag-style inline-flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
		: "recursive-tag-style inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 transition-colors";

	return (
		<div className={`flex flex-wrap gap-2 ${showLabel ? "items-center" : ""}`}>
			{showLabel && (
				<span className="text-sm text-gray-500 mr-2">Tags:</span>
			)}
			{tags.map((tag) => (
				<Link
					key={tag}
					href={`/tags/${encodeURIComponent(tag)}`}
					className={tagClassName}
				>
					<Tag size={variant === "page" ? 14 : 12} />
					{tag}
				</Link>
			))}
		</div>
	);
}