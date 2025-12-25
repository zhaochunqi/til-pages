import Link from "next/link";
import { notFound } from "next/navigation";
import TILCard from "../../../components/TILCard";
import type { TIL } from "../../../types";
import { getTILsByTag } from "../../../lib/data";

interface TagPageProps {
	params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
	const { getAllTags } = await import("../../../lib/data");
	const tags = await getAllTags();
	
	return tags.map(({ tag }) => ({
		tag: encodeURIComponent(tag),
	}));
}

export default async function TagPage({ params }: TagPageProps) {
	const { tag: encodedTag } = await params;
	const tag = decodeURIComponent(encodedTag);
	const tils = await getTILsByTag(tag);

	if (tils.length === 0) {
		notFound();
	}

	return (
		<div className="max-w-4xl mx-auto px-4 py-8">
			<header className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">
					Tag: {tag}
				</h1>
				<p className="text-gray-600">
					{tils.length} {tils.length === 1 ? "entry" : "entries"} found
				</p>
			</header>

			<div className="space-y-6">
				{tils.map((til: TIL) => (
					<TILCard key={til.ulid} til={til} showFullContent={false} />
				))}
			</div>

			<div className="mt-8 text-center">
				<Link
					href="/tags"
					className="inline-block px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors mr-4"
				>
					← Back to tags
				</Link>
				<Link
					href="/"
					className="inline-block px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
				>
					← Back to all entries
				</Link>
			</div>
		</div>
	);
}