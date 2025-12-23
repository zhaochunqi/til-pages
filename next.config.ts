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
	},
};

export default nextConfig;
