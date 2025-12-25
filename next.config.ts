import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "export",
	trailingSlash: false,
	images: {
		unoptimized: true,
	},
	// Disable server-side features for static export
	experimental: {
		esmExternals: true,
		// Optimize package imports to reduce bundle size
		optimizePackageImports: ['lucide-react', 'react-markdown'],
	},
	// Enable compression
	compress: true,
	// Disable source maps in production to reduce build size
	productionBrowserSourceMaps: false,
};

export default nextConfig;
