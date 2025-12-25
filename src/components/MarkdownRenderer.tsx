import React from "react";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { PreBlock } from "./PreBlock";

// Lazy load MermaidRenderer to reduce initial bundle size
// Note: We can't use ssr: false in Server Components, but the component itself is a Client Component
const MermaidRenderer = dynamic(
	() => import("./MermaidRenderer").then((mod) => ({ default: mod.MermaidRenderer })),
	{
		loading: () => (
			<div className="mermaid relative min-h-[100px] flex items-center justify-center my-4 border border-gray-200 rounded bg-gray-50 p-4">
				<div className="text-gray-500 text-sm">Loading diagram...</div>
			</div>
		),
	}
);

interface MarkdownRendererProps {
	content: string;
	className?: string;
}

/**
 * MarkdownRenderer component that renders markdown content using react-markdown
 * with GitHub Flavored Markdown support, syntax highlighting on the server, 
 * and Mermaid diagrams on the client.
 */
export default function MarkdownRenderer({
	content,
	className = "",
}: MarkdownRendererProps) {
	return (
		<div className={`prose prose-gray max-w-none ${className}`}>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				rehypePlugins={[rehypeRaw, [rehypeHighlight, { detect: true }]]}
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
							return <MermaidRenderer>{String(children)}</MermaidRenderer>;
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
							className="text-gray-600 hover:text-gray-800 underline"
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
									alt={alt || ""}
									className="max-w-full h-auto rounded-lg shadow-md"
									{...rest}
									loading="lazy"
									decoding="async"
								/>
							);
						}
						return (
							<img
								src={src}
								alt={alt || ""}
								className="max-w-full h-auto rounded-lg shadow-md"
								{...rest}
								loading="lazy"
								decoding="async"
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