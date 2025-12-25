import { LucideIcon } from "lucide-react";
import { Calendar } from "lucide-react";

interface PageHeaderProps {
	title: string;
	description: string;
	icon: LucideIcon;
	showStats?: boolean;
	statsText?: string;
	breadcrumb?: React.ReactNode;
	actions?: React.ReactNode;
}

/**
 * Unified page header component for consistent styling across all pages
 * Ensures consistent height and spacing from navigation to main content
 */
export default function PageHeader({
	title,
	description,
	icon: Icon,
	showStats = false,
	statsText,
	breadcrumb,
	actions,
}: PageHeaderProps) {
	return (
		<header className="w-full">
			<div className="max-w-3xl mx-auto">
				{/* Breadcrumb (if provided) - positioned above main header */}
				{breadcrumb && (
					<div className="flex items-center min-h-[24px] mb-6">
						{breadcrumb}
					</div>
				)}

				{/* Main header content with fixed minimum height */}
				<div className="min-h-[200px] flex flex-col justify-center space-y-6">
					{/* Title with icon */}
					<div className="flex items-baseline justify-center space-x-3">
						<Icon size={28} className="text-gray-700 flex-shrink-0" />
						<h1 className="text-3xl font-bold text-gray-900 leading-tight">
							{title}
						</h1>
					</div>

					{/* Description with calendar icon */}
					<p className="text-gray-600 flex items-center justify-center space-x-1 text-center max-w-2xl mx-auto">
						<Calendar size={14} className="flex-shrink-0" />
						<span>{description}</span>
					</p>

					{/* Stats (if provided) */}
					{showStats && statsText && (
						<p className="text-sm text-gray-500 text-center">
							{statsText}
						</p>
					)}

					{/* Actions (if provided) */}
					{actions && (
						<div className="flex justify-center pt-2">
							{actions}
						</div>
					)}
				</div>
			</div>
		</header>
	);
}