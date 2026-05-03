import sanitizeHtml from 'sanitize-html';

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderInline(text: string): string {
  let out = escapeHtml(text).replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
  out = out.replace(/ {2,}/g, (spaces) => '&nbsp;'.repeat(spaces.length - 1) + ' ');
  out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/~~(.+?)~~/g, '<s>$1</s>');
  out = out.replace(/`(.+?)`/g, '<code>$1</code>');
  out = out.replace(/\*(.+?)\*/g, '<em>$1</em>');
  out = out.replace(/__(.+?)__/g, '<u>$1</u>');
  return out;
}

const allowedTags = [
  'a',
  'abbr',
  'b',
  'blockquote',
  'br',
  'caption',
  'code',
  'div',
  'em',
  'figure',
  'figcaption',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'img',
  'li',
  'ol',
  'p',
  'pre',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'u',
  'ul',
];

const allowedAttributes = {
  a: ['href', 'name', 'target', 'rel', 'title'],
  img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
  table: ['border', 'cellpadding', 'cellspacing', 'class'],
  td: ['colspan', 'rowspan', 'class'],
  th: ['colspan', 'rowspan', 'class'],
  div: ['class'],
  span: ['class'],
  pre: ['class'],
  code: ['class'],
  figure: ['class'],
  figcaption: ['class'],
};

function sanitizeArticleHtml(value: string): string {
  return sanitizeHtml(value, {
    allowedTags,
    allowedAttributes,
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName: string, attribs: Record<string, string | undefined>) => ({
        tagName,
        attribs: {
          ...attribs,
          rel: attribs.rel || 'noreferrer noopener',
          target: attribs.target || '_blank',
        },
      }),
    },
  });
}

function looksLikeHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

export function markdownLikeToHtml(input: string): string {
  const normalized = input.replace(/\r\n/g, '\n');
  if (!normalized) return '';

  if (looksLikeHtml(normalized)) {
    return sanitizeArticleHtml(normalized);
  }

  const lines = normalized.split('\n');
  const html: string[] = [];
  let listMode: 'ul' | 'ol' | null = null;

  const closeList = () => {
    if (listMode === 'ul') html.push('</ul>');
    if (listMode === 'ol') html.push('</ol>');
    listMode = null;
  };

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    if (!trimmed) {
      closeList();
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      if (listMode !== 'ul') {
        closeList();
        html.push('<ul>');
        listMode = 'ul';
      }
      html.push(`<li>${renderInline(trimmed.replace(/^[-*]\s+/, ''))}</li>`);
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      if (listMode !== 'ol') {
        closeList();
        html.push('<ol>');
        listMode = 'ol';
      }
      html.push(`<li>${renderInline(trimmed.replace(/^\d+\.\s+/, ''))}</li>`);
      continue;
    }

    closeList();

    if (/^>{1}\s+/.test(trimmed)) {
      html.push(`<blockquote><p>${renderInline(trimmed.replace(/^>{1}\s+/, ''))}</p></blockquote>`);
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      html.push('<hr />');
      continue;
    }

    if (/^###\s+/.test(trimmed)) {
      html.push(`<h3>${renderInline(trimmed.replace(/^###\s+/, ''))}</h3>`);
      continue;
    }

    if (/^##\s+/.test(trimmed)) {
      html.push(`<h2>${renderInline(trimmed.replace(/^##\s+/, ''))}</h2>`);
      continue;
    }

    if (/^#\s+/.test(trimmed)) {
      html.push(`<h1>${renderInline(trimmed.replace(/^#\s+/, ''))}</h1>`);
      continue;
    }

    const paragraph = rawLine.replace(/\s+$/, '');
    html.push(`<p>${renderInline(paragraph)}</p>`);
  }

  closeList();

  return sanitizeArticleHtml(html.join(''));
}

export const articleContentToHtml = markdownLikeToHtml;

export function parseReferencesInput(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 30);
}

export function referencesToText(value: unknown): string {
  if (!Array.isArray(value)) return '';
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)
    .join('\n');
}
