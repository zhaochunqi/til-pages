import Link from "next/link";
import { Tag } from "lucide-react";
import { getAllTags } from "../../lib/data";
import PageHeader from "../../components/PageHeader";
import { ContentContainer } from "../../components/PageLayout";

export default async function TagsPage() {
	const tags = await getAllTags();

	return (
		<ContentContainer>
			{/* Page Header */}
			<PageHeader
				title="Tags"
				description="Browse TIL entries by tags. Click on any tag to see related entries."
			/>

			{/* Tags Grid */}
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
							className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-gray-400 transition-all duration-200 group"
						>
							<div className="flex items-center space-x-3 mb-2">
								<div className="p-2 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
									<Tag size={20} className="text-gray-600" />
								</div>
								<h3 className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
									{tag}
								</h3>
							</div>
							<p className="text-sm text-gray-500">{count} entries</p>
						</Link>
					))}
				</div>
			)}
		</ContentContainer>
	);
}