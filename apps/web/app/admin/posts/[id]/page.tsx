import PostEditor from "@/components/admin/post-editor";

export default async function EditPostPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	return (
		<div>
			<h2 className="mb-6 font-display font-semibold text-2xl">Edit post</h2>
			<PostEditor initialId={id} />
		</div>
	);
}
