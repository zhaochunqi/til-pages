import { MetadataRoute } from "next";
import { decodeTime } from "ulid";
import { contentFetcher } from "../lib/content-fetcher";
import { MarkdownParser } from "../lib/markdown-parser";
import type { TIL } from "../types";

export const dynamic = "force-static";

/**
 * Convert ParsedNote to TIL interface
 */
function parsedNoteToTIL(parsedNote: {
    ulid: string;
    title: string;
    content: string;
    tags: string[];
}): TIL {
    return {
        ulid: parsedNote.ulid,
        title: parsedNote.title,
        content: parsedNote.content,
        tags: parsedNote.tags,
    };
}

/**
 * Get all TIL entries sorted by creation date (newest first)
 */
async function getAllTILs(): Promise<TIL[]> {
    try {
        const rawNotes = await contentFetcher.fetchValidNotes();
        const parsedNotes = MarkdownParser.parseFiles(rawNotes);
        const tils = parsedNotes.map(parsedNoteToTIL);
        return tils.sort((a, b) => b.ulid.localeCompare(a.ulid));
    } catch (error) {
        console.error("Error fetching TIL entries for sitemap:", error);
        return [];
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = "https://til.zhaochunqi.com";
    const allTILs = await getAllTILs();

    // Static routes
    const routes = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "daily" as const,
            priority: 1,
        },
        {
            url: `${baseUrl}/archive`,
            lastModified: new Date(),
            changeFrequency: "daily" as const,
            priority: 0.8,
        },
    ];

    // Dynamic TIL routes
    const tilRoutes = allTILs.map((til) => ({
        url: `${baseUrl}/${til.ulid.toLowerCase()}`,
        lastModified: new Date(decodeTime(til.ulid)),
        changeFrequency: "monthly" as const,
        priority: 0.6,
    }));

    return [...routes, ...tilRoutes];
}
