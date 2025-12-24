import Link from "next/link";
import { getAllTags } from "../../lib/data";

export default async function TagsPage() {
	const tags = await getAllTags();

	return (
		<div className="max-w-4xl mx-auto px-4 py-8">
			<header className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">Tags</h1>
				<p className="text-gray-600">
					Browse TIL entries by tags. Click on any tag to see related entries.
				</p>
			</header>

			{tags.length === 0 ? (
				<div className="text-center py-12">
					<p className="text-gray-500">No tags found.</p>
				</div>
			) : (
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
					{tags.map(({ tag, count }) => (
						<Link
							key={tag}
							href={`/tags/${encodeURIComponent(tag)}`}
							className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all duration-200 group"
						>
							<h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
								{tag}
							</h3>
							<p className="text-sm text-gray-500 mt-1">{count} entries</p>
						</Link>
					))}
				</div>
			)}

			<div className="mt-8 text-center">
				<Link
					href="/"
					className="inline-block px-4 py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
				>
					← Back to all entries
				</Link>
			</div>
		</div>
	);
}