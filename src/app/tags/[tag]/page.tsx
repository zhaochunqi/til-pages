import Link from "next/link";
import { notFound } from "next/navigation";
import TILCard from "../../../components/TILCard";
import type { TIL } from "../../../types";
import { getTILsByTag, getAllTags } from "../../../lib/data";
import { slugToTag, tagToSlug } from "../../../lib/slug";
import PageHeader from "../../../components/PageHeader";
import { ContentContainer } from "../../../components/PageLayout";

interface TagPageProps {
	params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
	const tags = await getAllTags();
	
	return tags.map(({ tag }) => ({
		tag: tagToSlug(tag),
	}));
}

export default async function TagPage({ params }: TagPageProps) {
	const { tag: tagSlug } = await params;
	const tag = slugToTag(tagSlug);
	const tils = await getTILsByTag(tag);

	if (tils.length === 0) {
		notFound();
	}

	return (
		<ContentContainer>
			{/* Page Header */}
			<PageHeader
				title={`Tag: ${tag}`}
				description={`${tils.length} ${tils.length === 1 ? "entry" : "entries"} found`}
			/>

			{/* TIL Cards */}
			<div className="space-y-6">
				{tils.map((til: TIL) => (
					<TILCard key={til.ulid} til={til} />
				))}
			</div>

			{/* Back Navigation */}
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
		</ContentContainer>
	);
}