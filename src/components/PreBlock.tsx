"use client";

import React, { useRef } from "react";
import { Check, Copy } from "lucide-react";
import { useCopy } from "../hooks/useCopy";

interface PreBlockProps extends React.HTMLAttributes<HTMLPreElement> {
    children?: React.ReactNode;
}

export const PreBlock = ({ children, ...rest }: PreBlockProps) => {
    const preRef = useRef<HTMLPreElement>(null);
    const { isCopied, handleCopy } = useCopy();

    const copyContent = () => {
        if (preRef.current) {
            const text = preRef.current.textContent || "";
            handleCopy(text);
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
                onClick={copyContent}
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
