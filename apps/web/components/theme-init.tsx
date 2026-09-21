"use client";

import { useLayoutEffect } from "react";

// Applies the stored/system theme before first paint (no flash) without
// rendering a <script> element — React 19 flags script tags rendered by
// components, even plain ones in <head>.
export default function ThemeInit() {
	useLayoutEffect(() => {
		try {
			const stored = localStorage.getItem("theme") || "system";
			const system = window.matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light";
			const resolved = stored === "system" ? system : stored;
			const root = document.documentElement;
			root.classList.remove("light", "dark");
			root.classList.add(resolved);
			root.style.colorScheme = resolved;
		} catch {
			// ignore (private mode, no matchMedia)
		}
	}, []);
	return null;
}
