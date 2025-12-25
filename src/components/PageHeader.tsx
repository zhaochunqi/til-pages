interface PageHeaderProps {
	title: string;
	description: string;
}

/**
 * Unified page header component for consistent styling across all pages
 * Ensures consistent height and spacing from navigation to main content
 */
export default function PageHeader({
	title,
	description,
}: PageHeaderProps) {
	return (
		<header className="w-full">
			<div className="max-w-3xl mx-auto h-32 flex items-center justify-center">
				{/* Content wrapper for centering */}
				<div className="text-center">
					{/* Title */}
					<h1 className="text-3xl font-bold text-gray-900">
						{title}
					</h1>

					{/* Description */}
					<p className="text-gray-600 mt-2 max-w-2xl mx-auto">
						{description}
					</p>
				</div>
			</div>
		</header>
	);
}