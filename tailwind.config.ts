import type { Config } from "tailwindcss";

const config: Config = {
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				// Minimal color palette
				background: "var(--background)",
				foreground: "var(--foreground)",
			},
			fontFamily: {
				// Clean, readable fonts
				sans: [
					"system-ui",
					"-apple-system",
					"BlinkMacSystemFont",
					"Segoe UI",
					"Roboto",
					"sans-serif",
				],
				mono: ["SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "monospace"],
			},
			typography: {
				DEFAULT: {
					css: {
						// Minimal typography styles
						maxWidth: "none",
						color: "inherit",
						a: {
							color: "inherit",
							textDecoration: "underline",
							fontWeight: "500",
						},
						"code::before": {
							content: '""',
						},
						"code::after": {
							content: '""',
						},
					},
				},
			},
		},
	},
	plugins: [],
};

export default config;
