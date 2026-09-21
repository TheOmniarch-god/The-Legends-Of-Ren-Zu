"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { orpc } from "@/lib/orpc";

function deviceId() {
	if (typeof window === "undefined") return "";
	let id = window.localStorage.getItem("renzu-device-id");
	if (!id) {
		id = crypto.randomUUID();
		window.localStorage.setItem("renzu-device-id", id);
	}
	return id;
}

export default function AskPage() {
	const [question, setQuestion] = useState("");
	const [answer, setAnswer] = useState("");
	const [provider, setProvider] = useState("");
	const [error, setError] = useState("");
	const spend = useMutation(orpc.reader.spend.mutationOptions());

	async function ask() {
		const q = question.trim();
		if (!q || spend.isPending) return;
		setError("");
		setAnswer("");
		setProvider("");
		try {
			await spend.mutateAsync({ deviceId: deviceId(), type: "chat" });
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: " Daily chat allowance spent. Login or ascend realm for more.",
			);
			return;
		}
		try {
			const res = await fetch("/api/ask", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ message: q }),
			});
			const data = await res.json();
			if (!res.ok)
				throw new Error(data.error || "The scholar is silent right now.");
			setAnswer(data.reply);
			setProvider(data.provider || "");
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Ask failed. Try again shortly.",
			);
		}
	}

	return (
		<main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
			<div className="mx-auto max-w-3xl">
				<p className="mb-3 font-sans text-muted-foreground text-xs uppercase tracking-[0.18em]">
					Ask Ren Zu
				</p>
				<h1 className="text-balance font-display font-semibold text-4xl tracking-tight sm:text-5xl">
					The scholar answers
				</h1>
				<p className="mt-4 max-w-2xl font-body text-muted-foreground text-xl leading-relaxed">
					Grounded in the legends, the canon source pack, and Reverend Insanity
					logic. Mortals receive a small daily allowance.
				</p>
				<hr className="rule-double my-10" />
				<div className="flex flex-col gap-4">
					<label
						htmlFor="scholar-question"
						className="font-sans text-muted-foreground text-sm"
					>
						Put your question to the scholar
					</label>
					<textarea
						id="scholar-question"
						value={question}
						onChange={(e) => setQuestion(e.target.value)}
						rows={4}
						placeholder="What does Hope Gu mean when Strength and Wisdom are gone?"
						className="w-full border border-rule bg-card p-4 font-body text-lg leading-relaxed placeholder:text-muted-foreground/70"
					/>
					<button
						type="button"
						onClick={ask}
						disabled={spend.isPending || !question.trim()}
						className="self-start whitespace-nowrap bg-primary px-7 py-2.5 font-medium font-sans text-primary-foreground text-sm transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-55"
					>
						{spend.isPending ? "Consulting…" : "Ask the scholar"}
					</button>
				</div>
				{error && (
					<p className="mt-8 border border-destructive/40 p-4 font-body text-base">
						{error}
					</p>
				)}
				{answer && (
					<article className="mt-10 border-rule border-t pt-8">
						<div className="legend-prose whitespace-pre-wrap">{answer}</div>
						{provider && (
							<p className="mt-4 font-sans text-muted-foreground text-xs">
								via {provider}
							</p>
						)}
					</article>
				)}
			</div>
		</main>
	);
}
