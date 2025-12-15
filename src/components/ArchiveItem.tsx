import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { TIL } from "../types";

interface ArchiveItemProps {
	til: TIL;
	className?: string;
}

/**
 * ArchiveItem component displays a TIL entry as a title-link pair
 * Used in the archive page to show only title and clickable link
 * Maintains minimalist design consistent with site theme
 */
export default function ArchiveItem({ til, className = "" }: ArchiveItemProps) {
	return (
		<div
			className={`
				py-2 border-b border-gray-100 last:border-b-0
				hover:bg-gray-50 transition-colors duration-150
				${className}
			`.trim()}
		>
			<Link
				href={`/${til.ulid.toLowerCase()}`}
				className="
					flex items-center justify-between text-gray-900 hover:text-blue-600
					transition-colors duration-150
					focus:outline-none focus:text-blue-600
					group
				"
			>
				<span>{til.title}</span>
				<ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
			</Link>
		</div>
	);
}
