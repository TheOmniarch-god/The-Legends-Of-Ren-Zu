"use client";

import { Toaster } from "@renzu-bts/ui/components/sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { queryClient } from "@/lib/orpc";

import { ThemeProvider, useTheme } from "./theme-provider";

function ThemedToaster() {
	const { resolvedTheme } = useTheme();
	return <Toaster richColors theme={resolvedTheme} />;
}

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider>
			<QueryClientProvider client={queryClient}>
				{children}
				{process.env.NODE_ENV === "development" && <ReactQueryDevtools />}
			</QueryClientProvider>
			<ThemedToaster />
		</ThemeProvider>
	);
}
