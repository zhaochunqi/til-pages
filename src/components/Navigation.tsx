import { Archive, ChevronLeft, Home } from "lucide-react";
import Link from "next/link";

interface NavigationProps {
	currentPath?: string;
	showBackButton?: boolean;
	backHref?: string;
	backLabel?: string;
}

/**
 * Navigation component with icons for enhanced user experience
 * Maintains minimalist design while providing clear navigation cues
 */
export default function Navigation({
	currentPath = "/",
	showBackButton = false,
	backHref = "/",
	backLabel = "Back to Home",
}: NavigationProps) {
	const isHome = currentPath === "/";
	const isArchive = currentPath === "/archive";

	return (
		<nav className="flex items-center justify-between">
			{/* Left side - Back button or Logo */}
			<div className="flex items-center space-x-4">
				{showBackButton ? (
					<Link
						href={backHref}
						className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
					>
						<ChevronLeft size={16} />
						<span className="text-sm">{backLabel}</span>
					</Link>
				) : (
					<Link
						href="/"
						className="text-xl font-semibold text-gray-900 no-underline hover:text-gray-700 flex items-center space-x-2"
					>
						<Home size={20} />
						<span>TIL</span>
					</Link>
				)}
			</div>

			{/* Right side - Main navigation */}
			<div className="flex items-center space-x-6 text-sm">
				<Link
					href="/"
					className={`
						flex items-center space-x-1 no-underline transition-colors
						${
							isHome
								? "text-gray-900 font-medium"
								: "text-gray-600 hover:text-gray-900"
						}
					`.trim()}
				>
					<Home size={14} />
					<span>Home</span>
				</Link>
				<Link
					href="/archive"
					className={`
						flex items-center space-x-1 no-underline transition-colors
						${
							isArchive
								? "text-gray-900 font-medium"
								: "text-gray-600 hover:text-gray-900"
						}
					`.trim()}
				>
					<Archive size={14} />
					<span>Archive</span>
				</Link>
			</div>
		</nav>
	);
}

/**
 * Breadcrumb navigation component for showing page hierarchy
 */
interface BreadcrumbProps {
	items: Array<{
		label: string;
		href?: string;
		icon?: React.ReactNode;
	}>;
}

export function Breadcrumb({ items }: BreadcrumbProps) {
	return (
		<nav className="flex items-center space-x-2 text-sm text-gray-600">
			{items.map((item, index) => (
				<div
					key={`${item.label}-${index}`}
					className="flex items-center space-x-2"
				>
					{index > 0 && <span className="text-gray-400">/</span>}
					{item.href ? (
						<Link
							href={item.href}
							className="flex items-center space-x-1 hover:text-gray-900 transition-colors"
						>
							{item.icon}
							<span>{item.label}</span>
						</Link>
					) : (
						<span className="flex items-center space-x-1 text-gray-900">
							{item.icon}
							<span>{item.label}</span>
						</span>
					)}
				</div>
			))}
		</nav>
	);
}
