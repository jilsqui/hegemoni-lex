export const DEFAULT_EDITOR_HTML = '<p></p>';

// Keep this serializer side-effect free so it can run in client components.
export function normalizeHtml(html: string): string {
  if (!html || !html.trim()) return DEFAULT_EDITOR_HTML;

  return html
    .replace(/\r\n/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/<br\s*>/gi, '<br/>')
    .replace(/<p>\s*<\/p>/gi, '<p></p>')
    .trim();
}

export function importEditorContent(html: string | null | undefined): string {
  if (!html) return DEFAULT_EDITOR_HTML;
  return normalizeHtml(html);
}

export function exportEditorContent(html: string | null | undefined): string {
  if (!html) return DEFAULT_EDITOR_HTML;
  return normalizeHtml(html);
}

export function extractPlainText(html: string | null | undefined): string {
  if (!html) return '';

  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
