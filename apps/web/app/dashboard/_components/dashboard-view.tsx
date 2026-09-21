"use client";

import { useQuery } from "@tanstack/react-query";

import { orpc } from "@/lib/orpc";

export default function DashboardView() {
	const privateData = useQuery(orpc.privateData.queryOptions());

	return <p>API: {privateData.data?.message}</p>;
}
