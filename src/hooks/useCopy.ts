"use client";

import { useState } from "react";

export function useCopy() {
	const [isCopied, setIsCopied] = useState(false);
	const [copyError, setCopyError] = useState<string | null>(null);

	const handleCopy = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setIsCopied(true);
			setCopyError(null);
			setTimeout(() => setIsCopied(false), 2000);
		} catch (err) {
			setCopyError("Copy failed");
			setTimeout(() => setCopyError(null), 2000);
		}
	};

	return { isCopied, copyError, handleCopy };
}