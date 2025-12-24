import Link from "next/link";
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
		? "inline-block px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
		: "inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-blue-100 hover:text-blue-700 transition-colors";

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
					{tag}
				</Link>
			))}
		</div>
	);
}