interface PageHeaderProps {
	title: string;
	description?: string;
	date?: string;
	tags?: string[];
}

/**
 * Unified page header component for consistent styling across all pages
 * Ensures consistent height and spacing from navigation to main content
 */
export default function PageHeader({
	title,
	description,
	date,
	tags,
}: PageHeaderProps) {
	return (
		<header className="w-full mb-0">
			<div className="max-w-3xl mx-auto h-40 md:h-48 flex items-center justify-center">
				{/* Content wrapper for centering */}
				<div className="text-center px-4">
					{/* Title */}
					<h1
						className="text-lg md:text-xl font-bold text-gray-600 break-words hyphens-auto max-w-full leading-tight"
						style={{
							fontFamily: 'var(--font-recursive), system-ui, -apple-system, sans-serif',
							fontVariationSettings: '"MONO" 0, "CASL" 1, "wght" 600, "slnt" -15',
							fontStyle: 'italic',
							transform: 'skewX(-8deg)'
						}}
					>
						{title}
					</h1>

					{/* Description */}
					{description && (
						<p className="text-gray-600 mt-3 max-w-2xl mx-auto mb-0">
							{description}
						</p>
					)}

					{/* Decorative title with Ma Shan Zheng font for individual TIL pages */}
					{(date || tags) && (
						<div className="ma-shan-zheng-regular text-gray-400 text-2xl md:text-4xl mt-3">
							{title}
						</div>
					)}

					{/* Date and Tags for individual TIL pages */}
					{(date || tags) && (
						<div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-3 text-gray-600 text-sm">
							{date && <span>{date}</span>}
							{tags && tags.length > 0 && (
								<div className="flex flex-wrap justify-center gap-2">
									{tags.map((tag) => (
										<span key={tag} className="text-gray-500 hover:text-gray-700 transition-colors">
											#{tag}
										</span>
									))}
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</header>
	);
}