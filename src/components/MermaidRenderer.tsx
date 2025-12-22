"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface MermaidRendererProps {
    children: string;
}

export const MermaidRenderer = ({ children }: MermaidRendererProps) => {
    const [isClient, setIsClient] = useState(false);
    const [isRendered, setIsRendered] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);

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

                if (elementRef.current) {
                    const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;
                    const { svg } = await mermaid.render(id, children.trim());
                    elementRef.current.innerHTML = svg;
                    setIsRendered(true);
                }
            } catch (error) {
                console.error("Mermaid rendering error:", error);
                if (elementRef.current) {
                    elementRef.current.innerHTML = `
						<div class="flex items-center gap-2 text-red-500">
							<span class="text-sm">Failed to render diagram</span>
						</div>
					`;
                }
            }
        };

        const timeoutId = setTimeout(renderDiagram, 100);
        return () => clearTimeout(timeoutId);
    }, [isClient, children]);

    return (
        <div
            ref={elementRef}
            className="mermaid relative min-h-[100px] flex items-center justify-center my-4"
        >
            {!isRendered && (
                <div className="mermaid-loading flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Rendering diagram...</span>
                </div>
            )}
        </div>
    );
};
