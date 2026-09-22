// Minimal markdown renderer for recovered guide content (no new dependencies).
// Supports headings, paragraphs, bullet lists, links, images, videos,
// bold, italic.

function escapeHtml(value: string) {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

const VIDEO_EXT = /\.(mp4|webm|ogg|ogv|mov)(\?|#|$)/i;

function inlineMd(value: string) {
	// Pull ![alt](url) out first so escaping + inline formatting can't
	// corrupt the generated tags. Restored after all other replacements.
	const media: string[] = [];
	const withPlaceholders = value.replace(
		/!\[([^\]]*)\]\(([^)\s]+)\)/g,
		(_match, alt: string, url: string) => {
			const safeAlt = escapeHtml(alt);
			const safeUrl = escapeHtml(url);
			media.push(
				VIDEO_EXT.test(url)
					? `<video src="${safeUrl}" controls preload="metadata" class="content-media">Your browser does not support the video tag.</video>`
					: `<img src="${safeUrl}" alt="${safeAlt}" loading="lazy" class="content-media" />`,
			);
			return `\uE000${media.length - 1}\uE000`;
		},
	);
	let out = escapeHtml(withPlaceholders);
	out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
	out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
	out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
	out = out.replace(
		/\uE000(\d+)\uE000/g,
		(_match, index: string) => media[Number(index)] ?? "",
	);
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
