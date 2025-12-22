"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface MermaidRendererProps {
    children: string;
}

export const MermaidRenderer = ({ children }: MermaidRendererProps) => {
    const [isClient, setIsClient] = useState(false);
    const [svg, setSvg] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient) return;

        const renderDiagram = async () => {
            try {
                const mermaid = (await import("mermaid")).default;
                mermaid.initialize({
                    startOnLoad: false,
                    theme: "default",
                    securityLevel: "loose",
                });

                const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;
                const { svg: renderedSvg } = await mermaid.render(id, children.trim());
                setSvg(renderedSvg);
            } catch (err) {
                console.error("Mermaid rendering error:", err);
                setError("Failed to render diagram");
            }
        };

        const timeoutId = setTimeout(renderDiagram, 100);
        return () => clearTimeout(timeoutId);
    }, [isClient, children]);

    if (error) {
        return (
            <div className="flex items-center gap-2 text-red-500 my-4">
                <span className="text-sm">{error}</span>
            </div>
        );
    }

    return (
        <div className="mermaid relative min-h-[100px] flex items-center justify-center my-4">
            {svg ? (
                <div
                    className="w-full flex justify-center"
                    dangerouslySetInnerHTML={{ __html: svg }}
                />
            ) : (
                <div className="mermaid-loading flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Rendering diagram...</span>
                </div>
            )}
        </div>
    );
};
