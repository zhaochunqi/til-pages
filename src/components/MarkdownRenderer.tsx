"use client";

import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { Check, Copy, Loader2 } from "lucide-react";


interface PreBlockProps extends React.HTMLAttributes<HTMLPreElement> {
	children?: React.ReactNode;
}

const PreBlock = ({ children, ...rest }: PreBlockProps) => {
	const preRef = useRef<HTMLPreElement>(null);
	const [isCopied, setIsCopied] = useState(false);

	const handleCopy = async () => {
		if (preRef.current) {
			const text = preRef.current.textContent || "";
			await navigator.clipboard.writeText(text);
			setIsCopied(true);
			setTimeout(() => setIsCopied(false), 2000);
		}
	};

	return (
		<div className="relative group mb-4">
			<pre
				ref={preRef}
				className="bg-gray-50 border border-gray-200 p-4 rounded-none overflow-x-auto"
				{...rest}
			>
				{children}
			</pre>
			<button
				type="button"
				onClick={handleCopy}
				className="absolute top-3 right-3 p-1.5 bg-white/90 hover:bg-gray-50 backdrop-blur-sm border border-gray-200 rounded-none shadow-xs text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-150 focus:opacity-100 z-10"
				aria-label="Copy code"
			>
				{isCopied ? (
					<Check className="w-3.5 h-3.5 text-gray-700" />
				) : (
					<Copy className="w-3.5 h-3.5" />
				)}
			</button>
		</div>
	);
};

interface MarkdownRendererProps {
	content: string;
	className?: string;
}

/**
 * MarkdownRenderer component that renders markdown content using react-markdown
 * with GitHub Flavored Markdown support, syntax highlighting, and Mermaid diagrams
 */
export default function MarkdownRenderer({
	content,
	className = "",
}: MarkdownRendererProps) {
	const [isClient, setIsClient] = useState(false);
	const mermaidRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setIsClient(true);
	}, []);

	// Only process mermaid on client and after component mounts
	useEffect(() => {
		if (!isClient) return;

		const processMermaid = async () => {
			const mermaid = (await import("mermaid")).default;

			mermaid.initialize({
				startOnLoad: false,
				theme: "default",
				securityLevel: "loose",
			});

			if (mermaidRef.current) {
				const elements = mermaidRef.current.querySelectorAll(".mermaid");
				elements.forEach(async (element) => {
					if (!element.hasAttribute("data-processed")) {
						const id = `mermaid-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
						const contentElement = element.querySelector(".mermaid-content") as HTMLElement;
						const loadingElement = element.querySelector(".mermaid-loading") as HTMLElement;
						const code = contentElement?.textContent || "";

						try {
							// Hide loading, show content during render
							if (loadingElement) loadingElement.style.display = "none";
							if (contentElement) contentElement.style.display = "block";

							const { svg } = await mermaid.render(id, code);
							element.innerHTML = svg;
							element.setAttribute("data-processed", "true");
						} catch (error) {
							console.error("Mermaid rendering error:", error);
							if (loadingElement) {
								loadingElement.innerHTML = `
									<div class="flex items-center gap-2 text-red-500">
										<span class="text-sm">Failed to render diagram</span>
									</div>
								`;
								loadingElement.style.display = "flex";
							}
							if (contentElement) contentElement.style.display = "none";
						}
					}
				});
			}
		};

		// Small delay to ensure DOM is ready
		const timeoutId = setTimeout(processMermaid, 100);
		return () => clearTimeout(timeoutId);
	}, [isClient]);

	return (
		<div
			className={`prose prose-gray max-w-none ${className}`}
			ref={mermaidRef}
		>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				rehypePlugins={[rehypeRaw, rehypeHighlight]}
				components={{
					h1: ({ children }) => (
						<h1 className="text-2xl font-bold mb-4 text-gray-900">
							{children}
						</h1>
					),
					h2: ({ children }) => (
						<h2 className="text-xl font-semibold mb-3 text-gray-800">
							{children}
						</h2>
					),
					h3: ({ children }) => (
						<h3 className="text-lg font-medium mb-2 text-gray-700">
							{children}
						</h3>
					),
					p: ({ children }) => (
						<p className="mb-4 text-gray-600 leading-relaxed">{children}</p>
					),
					ul: ({ children }) => (
						<ul className="list-disc list-inside mb-4 text-gray-600">
							{children}
						</ul>
					),
					ol: ({ children }) => (
						<ol className="list-decimal list-inside mb-4 text-gray-600">
							{children}
						</ol>
					),
					li: ({ children }) => <li className="mb-1">{children}</li>,
					blockquote: ({ children }) => (
						<blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-4">
							{children}
						</blockquote>
					),
					code: (props: any) => {
						const { children, className, node, ...rest } = props;

						// Check if this is a Mermaid code block
						if (
							className &&
							typeof className === "string" &&
							className.includes("language-mermaid")
						) {
							return (
								<div className="mermaid relative min-h-[100px] flex items-center justify-center">
									<div className="mermaid-content hidden">{children}</div>
									<div className="mermaid-loading flex items-center gap-2 text-gray-500">
										<Loader2 className="w-4 h-4 animate-spin" />
										<span className="text-sm">Rendering diagram...</span>
									</div>
								</div>
							);
						}

						// Check if this is a code block
						const isCodeBlock =
							node?.tagName === "code" &&
							className &&
							typeof className === "string" &&
							className.includes("language-");

						if (isCodeBlock) {
							return (
								<code
									className={`text-sm font-mono ${className || ""}`}
									{...rest}
								>
									{children}
								</code>
							);
						}

						// Inline code
						return (
							<code
								className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800"
								{...rest}
							>
								{children}
							</code>
						);
					},
					pre: PreBlock,
					details: ({ children, open }) => (
						<details
							className="mb-4 border border-gray-200 rounded-lg p-2"
							open={open}
						>
							{children}
						</details>
					),
					summary: ({ children }) => (
						<summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900 select-none">
							{children}
						</summary>
					),
					a: ({ children, href }) => (
						<a
							href={href}
							className="text-blue-600 hover:text-blue-800 underline"
							target="_blank"
							rel="noopener noreferrer"
						>
							{children}
						</a>
					),
					table: ({ children }) => (
						<div className="overflow-x-auto mb-4">
							<table className="min-w-full border-collapse border border-gray-300">
								{children}
							</table>
						</div>
					),
					th: ({ children }) => (
						<th className="border border-gray-300 px-4 py-2 bg-gray-50 font-semibold text-left">
							{children}
						</th>
					),
					td: ({ children }) => (
						<td className="border border-gray-300 px-4 py-2">{children}</td>
					),
					img: ({ src, alt, ...rest }: any) => {
						// 如果是本地路径，转换为 CDN URL
						const srcStr = typeof src === "string" ? src : "";
						if (srcStr.startsWith("../assets/") || srcStr.startsWith("../")) {
							const cdnPrefix =
								"https://cdn.jsdelivr.net/gh/zhaochunqi/til@main";
							const cleanSrc = srcStr.startsWith("../")
								? srcStr.slice(2)
								: srcStr;
							const fullSrc = `${cdnPrefix}/${cleanSrc}`;
							return (
								<img
									src={fullSrc}
									alt={alt}
									className="max-w-full h-auto rounded-lg shadow-md"
									{...rest}
								/>
							);
						}
						return (
							<img
								src={src}
								alt={alt}
								className="max-w-full h-auto rounded-lg shadow-md"
								{...rest}
							/>
						);
					},
				}}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
}