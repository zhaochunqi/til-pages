"use client";

import { Check, Copy, Link } from "lucide-react";
import { useCopy } from "../hooks/useCopy";

interface TILReferenceProps {
	title: string;
	url: string;
}

export default function TILReference({ title, url }: TILReferenceProps) {
	const markdownReference = `[${title}](${url})`;
	const { isCopied, copyError, handleCopy } = useCopy();

	const handleButtonClick = () => {
		handleCopy(markdownReference);
	};

	return (
		<div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-6 relative group">
			<div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
				<Link size={12} />
				<span>引用此 TIL</span>
			</div>
			<code className="block bg-white border border-gray-200 rounded p-2 text-xs font-mono text-gray-600">
				{markdownReference}
			</code>
			<button
				type="button"
				onClick={handleButtonClick}
				className="absolute top-3 right-3 p-1.5 bg-white/90 hover:bg-gray-50 backdrop-blur-sm border border-gray-200 rounded shadow-xs text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-150 focus:opacity-100 z-10"
				aria-label="Copy markdown reference"
			>
				{copyError ? (
					<span className="text-red-600 text-xs">Error</span>
				) : isCopied ? (
					<Check className="w-3.5 h-3.5 text-gray-700" />
				) : (
					<Copy className="w-3.5 h-3.5" />
				)}
			</button>
		</div>
	);
}