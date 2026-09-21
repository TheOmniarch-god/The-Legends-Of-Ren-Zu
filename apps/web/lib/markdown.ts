// Minimal markdown renderer for recovered guide content (no new dependencies).
// Supports headings, paragraphs, bullet lists, links, bold, italic.

function escapeHtml(value: string) {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

function inlineMd(value: string) {
	let out = escapeHtml(value);
	out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
	out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
	out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
	return out;
}

export function renderMarkdown(markdown: string) {
	const blocks = markdown.split(/\n\s*\n/);
	const html: string[] = [];
	for (const block of blocks) {
		const trimmed = block.trim();
		if (!trimmed) continue;
		if (trimmed.startsWith("### ")) {
			html.push(`<h3>${inlineMd(trimmed.slice(4))}</h3>`);
		} else if (trimmed.startsWith("## ")) {
			html.push(`<h2>${inlineMd(trimmed.slice(3))}</h2>`);
		} else if (trimmed.startsWith("# ")) {
			html.push(`<h2>${inlineMd(trimmed.slice(2))}</h2>`);
		} else if (/^(- |\* )/m.test(trimmed)) {
			const items = trimmed
				.split("\n")
				.map((l) => l.replace(/^(- |\* )/, "").trim())
				.filter(Boolean)
				.map((l) => `<li>${inlineMd(l)}</li>`)
				.join("");
			html.push(`<ul>${items}</ul>`);
		} else {
			const text = trimmed
				.split("\n")
				.map((l) => inlineMd(l))
				.join("<br />");
			html.push(`<p>${text}</p>`);
		}
	}
	return html.join("\n");
}
