"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { orpc } from "@/lib/orpc";

export default function AdminUsersPage() {
	const listQuery = useQuery(orpc.admin.users.list.queryOptions());
	const roleMutation = useMutation({
		mutationFn: (args: { id: string; role: "admin" | "editor" | "reader" }) =>
			orpc.admin.users.setRole.call(args),
		onSuccess: () => {
			toast.success("Role updated");
			listQuery.refetch();
		},
		onError: (error) => toast.error(error.message),
	});
	return (
		<div>
			<p className="mb-4 font-sans text-muted-foreground text-sm">
				Only admins can open this page. Editors cannot change roles. Bootstrap
				admins from ADMIN_EMAILS always keep admin access.
			</p>
			{listQuery.isPending ? (
				<p className="font-sans text-muted-foreground text-sm">
					Loading users…
				</p>
			) : listQuery.isError ? (
				<p className="font-sans text-sm">Could not load users.</p>
			) : (
				<ul className="divide-y divide-rule border-rule border-y">
					{(listQuery.data?.users || []).map((u) => (
						<li
							key={u.id}
							className="flex flex-wrap items-center justify-between gap-3 py-3"
						>
							<div>
								<p className="font-medium font-sans text-sm">
									{u.name || u.email}
								</p>
								<p className="font-mono text-muted-foreground text-xs">
									{u.email}
								</p>
							</div>
							<select
								className="border border-rule bg-background px-3 py-1 font-sans text-sm"
								value={u.role || "reader"}
								onChange={(e) =>
									roleMutation.mutate({
										id: u.id,
										role: e.target.value as "admin" | "editor" | "reader",
									})
								}
							>
								<option value="reader">Reader</option>
								<option value="editor">Editor</option>
								<option value="admin">Admin</option>
							</select>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
