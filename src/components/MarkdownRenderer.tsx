"use client";

import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import React, { useEffect, useRef, useState } from "react";

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

	useEffect(() => {
		if (!isClient) return;

		// Dynamic import mermaid only on client side
		const initMermaid = async () => {
			const mermaid = (await import('mermaid')).default;
			
			// Initialize Mermaid
			mermaid.initialize({
				startOnLoad: false,
				theme: "default",
				securityLevel: "loose",
			});

			// Render Mermaid diagrams
			if (mermaidRef.current) {
				const mermaidElements = mermaidRef.current.querySelectorAll(".mermaid");
				mermaidElements.forEach(async (element) => {
					if (!element.hasAttribute("data-processed")) {
						const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;
						const code = element.textContent || "";
						
						try {
							const { svg } = await mermaid.render(id, code);
							element.innerHTML = svg;
							element.setAttribute("data-processed", "true");
						} catch (error) {
							console.error("Mermaid rendering error:", error);
							element.innerHTML = `<div class="text-red-500">Error rendering Mermaid diagram: ${error instanceof Error ? error.message : 'Unknown error'}</div>`;
						}
					}
				});
			}
		};

		initMermaid();
	}, [content, isClient]);

	return (
		<div className={`prose prose-gray max-w-none ${className}`} ref={mermaidRef}>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				rehypePlugins={[rehypeRaw, rehypeHighlight]}
				components={{
					// Custom components for better styling
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
						if (className && typeof className === 'string' && className.includes('language-mermaid')) {
							return (
								<div className="mermaid">
									{children}
								</div>
							);
						}
						
						// Check if this is a code block (has a parent pre element) or inline code
						const isCodeBlock = node?.tagName === 'code' && 
							className && 
							typeof className === 'string' && 
							className.includes('language-');
						
						if (isCodeBlock) {
							return (
								<code
									className={`block bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm font-mono ${className || ""}`}
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
					pre: ({ children, ...rest }: any) => (
						<pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto mb-4" {...rest}>
							{children}
						</pre>
					),
					details: ({ children, open }) => (
						<details className="mb-4 border border-gray-200 rounded-lg p-2" open={open}>
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
						const srcStr = typeof src === 'string' ? src : '';
						if (srcStr.startsWith("../assets/") || srcStr.startsWith("../")) {
							const cdnPrefix = "https://cdn.jsdelivr.net/gh/zhaochunqi/til@main";
							const cleanSrc = srcStr.startsWith("../") ? srcStr.slice(2) : srcStr;
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