// lib/utils.ts

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const HTML_ENTITY_MAP: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&quot;': '"',
  '&#39;': "'",
  '&lt;': '<',
  '&gt;': '>',
};

export function stripHtmlToText(value: string | null | undefined): string {
  if (!value) return '';

  let output = value
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?\s*>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');

  output = output.replace(/&nbsp;|&amp;|&quot;|&#39;|&lt;|&gt;/g, (entity) => HTML_ENTITY_MAP[entity] || entity);
  return output.replace(/\s+/g, ' ').trim();
}

export function truncateAtWord(value: string, limit: number): string {
  if (!value) return '';
  if (value.length <= limit) return value;

  const sliced = value.slice(0, limit).trim();
  const lastSpace = sliced.lastIndexOf(' ');

  if (lastSpace > Math.floor(limit * 0.5)) {
    return `${sliced.slice(0, lastSpace)}...`;
  }

  return `${sliced}...`;
}

export function getPreviewText(
  excerpt: string | null | undefined,
  content: string | null | undefined,
  limit: number,
): string {
  const source = excerpt && excerpt.trim() ? excerpt : content;
  const plain = stripHtmlToText(source);
  return truncateAtWord(plain, limit);
}