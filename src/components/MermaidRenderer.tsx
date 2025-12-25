"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2, Play } from "lucide-react";

interface MermaidRendererProps {
    children: string;
}

export const MermaidRenderer = ({ children }: MermaidRendererProps) => {
    const [isClient, setIsClient] = useState(false);
    const [svg, setSvg] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [shouldRender, setShouldRender] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient || !shouldRender) return;

        const renderDiagram = async () => {
            setIsLoading(true);
            setError(null);

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
                setError(err instanceof Error ? err.message : "Failed to render diagram");
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            renderDiagram().catch(err => {
                console.error("Mermaid loading error:", err);
                setError("Failed to load diagram library");
                setIsLoading(false);
            });
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [isClient, shouldRender, children]);

    const handleRenderClick = () => {
        setShouldRender(true);
    };

    if (error) {
        return (
            <div className="flex flex-col items-center gap-2 text-red-500 my-4 p-4 border border-red-200 rounded bg-red-50">
                <span className="text-sm font-medium">渲染图表时出错</span>
                <span className="text-xs text-red-600">{error}</span>
                <button
                    onClick={() => {
                        setError(null);
                        setShouldRender(false);
                    }}
                    className="mt-2 px-3 py-1 text-xs bg-white border border-red-300 rounded hover:bg-red-50 transition-colors"
                >
                    重试
                </button>
            </div>
        );
    }

    return (
        <div className="mermaid relative min-h-[100px] flex items-center justify-center my-4 border border-gray-200 rounded bg-gray-50 p-4">
            <div className="mermaid-content hidden">{children}</div>
            {svg ? (
                <div
                    className="w-full flex justify-center"
                    dangerouslySetInnerHTML={{ __html: svg }}
                />
            ) : isLoading ? (
                <div className="mermaid-loading flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">正在渲染图表...</span>
                </div>
            ) : (
                <button
                    onClick={handleRenderClick}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors shadow-sm"
                    aria-label="渲染 Mermaid 图表"
                >
                    <Play className="w-4 h-4" />
                    <span className="text-sm font-medium">点击渲染图表</span>
                </button>
            )}
        </div>
    );
};
