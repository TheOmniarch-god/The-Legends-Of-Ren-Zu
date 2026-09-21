"use client";

import * as React from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "theme";

type ThemeContextValue = {
	theme: Theme;
	resolvedTheme: ResolvedTheme;
	systemTheme: ResolvedTheme;
	setTheme: (theme: Theme) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function applyTheme(resolved: ResolvedTheme) {
	const root = document.documentElement;
	root.classList.remove("light", "dark");
	root.classList.add(resolved);
	root.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setThemeState] = React.useState<Theme>("system");
	const [systemTheme, setSystemTheme] = React.useState<ResolvedTheme>("light");

	React.useEffect(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
			if (stored === "light" || stored === "dark" || stored === "system") {
				setThemeState(stored);
			}
		} catch {
			// ignore
		}
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		const update = () => setSystemTheme(mq.matches ? "dark" : "light");
		update();
		mq.addEventListener("change", update);
		return () => mq.removeEventListener("change", update);
	}, []);

	const resolvedTheme: ResolvedTheme = theme === "system" ? systemTheme : theme;

	React.useEffect(() => {
		applyTheme(resolvedTheme);
	}, [resolvedTheme]);

	const setTheme = React.useCallback((next: Theme) => {
		setThemeState(next);
		try {
			localStorage.setItem(STORAGE_KEY, next);
		} catch {
			// ignore
		}
	}, []);

	const value = React.useMemo(
		() => ({ theme, resolvedTheme, systemTheme, setTheme }),
		[theme, resolvedTheme, systemTheme, setTheme],
	);

	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
}

export function useTheme(): ThemeContextValue {
	const ctx = React.useContext(ThemeContext);
	if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
	return ctx;
}
