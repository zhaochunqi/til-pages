/**
 * Layout wrapper component for page content sections
 * Ensures consistent spacing and height across all pages
 */
interface PageLayoutProps {
	children: React.ReactNode;
	className?: string;
}

export default function PageLayout({ children, className = "" }: PageLayoutProps) {
	return (
		<div className={`w-full ${className}`}>
			{children}
		</div>
	);
}

/**
 * Content container with consistent spacing
 */
interface ContentContainerProps {
	children: React.ReactNode;
	className?: string;
}

export function ContentContainer({ children, className = "" }: ContentContainerProps) {
	return (
		<div className={`space-y-8 ${className}`}>
			{children}
		</div>
	);
}

/**
 * Hero section with consistent height and spacing
 */
interface HeroSectionProps {
	children: React.ReactNode;
	className?: string;
}

export function HeroSection({ children, className = "" }: HeroSectionProps) {
	return (
		<section className={`w-full py-12 ${className}`}>
			{children}
		</section>
	);
}