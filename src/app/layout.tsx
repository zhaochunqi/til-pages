import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "../components/Navigation";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	display: "swap",
});

export const metadata: Metadata = {
	title: "TIL - Today I Learned",
	description: "A minimal collection of things I learn every day",
	keywords: ["TIL", "Today I Learned", "learning", "notes", "knowledge"],
	authors: [{ name: "TIL Author" }],
	robots: "index, follow",
	icons: {
		icon: "/til.svg",
		shortcut: "/til.svg",
		apple: "/til.svg",
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
		<html lang="en" className={inter.variable}>
			<body className="font-sans antialiased bg-white text-gray-900 dark:bg-gray-50 dark:text-gray-900">
				<div className="min-h-screen">
					<header className="border-b border-gray-200 bg-white">
						<div className="max-w-4xl mx-auto px-4 py-6">
							<Navigation />
						</div>
					</header>
					<main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
					<footer className="border-t border-gray-200 bg-white mt-16">
						<div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
							<p>A minimal collection of daily learnings</p>
						</div>
					</footer>
				</div>
			</body>
		</html>
	);
}
