import Link from "next/link";
import { Home, Archive } from "lucide-react";

/**
 * 404 Not Found page component
 * Handles cases where ULID doesn't correspond to any TIL entry
 * Requirements: 2.4
 */
export default function NotFound() {
	return (
		<div className="min-h-[60vh] flex items-center justify-center">
			<div className="text-center space-y-8 max-w-md mx-auto">
				{/* Error Message */}
				<div className="space-y-4">
					<h1 className="text-6xl font-bold text-gray-300">404</h1>
					<h2 className="text-2xl font-semibold text-gray-900">
						Page Not Found
					</h2>
					<p className="text-gray-600 leading-relaxed">
						The TIL entry you're looking for doesn't exist or may have been
						moved. This could happen if the ULID in the URL is invalid or the
						content is no longer available.
					</p>
				</div>

				{/* Navigation Options */}
				<div className="space-y-4">
					<div className="flex flex-col sm:flex-row gap-3 justify-center">
						<Link
							href="/"
							className="
								inline-flex items-center justify-center space-x-2 px-6 py-3
								border border-gray-300 text-gray-700 rounded-lg
								hover:bg-gray-50 transition-colors
								text-sm font-medium
							"
						>
							<Home size={16} />
							<span>Back to Home</span>
						</Link>
						<Link
							href="/archive"
							className="
								inline-flex items-center justify-center space-x-2 px-6 py-3
								border border-gray-300 text-gray-600 rounded-lg
								hover:bg-gray-50 transition-colors
								text-sm
							"
						>
							<Archive size={16} />
							<span>Browse Archive</span>
						</Link>
					</div>

					{/* Additional Help */}
					<div className="pt-4 border-t border-gray-100">
						<p className="text-sm text-gray-500">
							Looking for something specific?{" "}
							<Link
								href="/archive"
								className="text-gray-700 hover:text-gray-900 underline"
							>
								Browse all entries
							</Link>{" "}
							to find what you need.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}