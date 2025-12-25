import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "highlight.js/styles/github.css";
import Navigation from "../components/Navigation";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	display: "optional",
	adjustFontFallback: true,
});

export const metadata: Metadata = {
	metadataBase: new URL("https://til.zhaochunqi.com"),
	title: {
		default: "TIL - Today I Learned",
		template: "%s | TIL",
	},
	description: "A minimal collection of things I learn every day",
	keywords: ["TIL", "Today I Learned", "learning", "notes", "knowledge"],
	authors: [{ name: "Chunqi Zhao", url: "https://zhaochunqi.com" }],
	creator: "Chunqi Zhao",
	robots: "index, follow",
	icons: {
		icon: [
			{ url: "/til.svg", type: "image/svg+xml" }
		],
		shortcut: "/til.svg",
		apple: "/til.svg",
	},
	openGraph: {
		type: "website",
		locale: "zh_CN",
		url: "https://til.zhaochunqi.com",
		siteName: "TIL - Today I Learned",
		title: "TIL - Today I Learned",
		description: "A minimal collection of things I learn every day",
		images: [
			{
				url: "/til.svg",
				width: 800,
				height: 600,
				alt: "TIL Logo",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "TIL - Today I Learned",
		description: "A minimal collection of things I learn every day",
		images: ["/til.svg"],
	},
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="zh-CN" className={inter.variable}>
			<body className="font-sans antialiased bg-white text-gray-900 dark:bg-gray-50 dark:text-gray-900">
				<div className="min-h-screen">
					<header className="border-b border-gray-200 bg-white" style={{ contain: 'layout style' }}>
						<div className="max-w-4xl mx-auto px-4 py-6" style={{ minHeight: '72px' }}>
							<Navigation />
						</div>
					</header>
					<main className="max-w-4xl mx-auto px-4 py-8" style={{ contain: 'layout style', minHeight: '400px' }}>{children}</main>
					<footer className="border-t border-gray-200 bg-white mt-16" style={{ contain: 'layout style' }}>
						<div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-500" style={{ minHeight: '60px' }}>
							<p>A minimal collection of daily learnings</p>
						</div>
					</footer>
				</div>
				<script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "1bb6f2a2df13460c9174d657e08e7e6b"}'></script>
			</body>
		</html>
	);
}
