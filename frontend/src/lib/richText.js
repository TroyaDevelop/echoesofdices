import DOMPurify from 'dompurify';

export const isRichHtmlDescription = (value) => {
  const s = String(value ?? '');
  return /<\s*\/?\s*(p|br|strong|em|b|i|ul|li|table|thead|tbody|tr|th|td|colgroup|col)\b/i.test(s);
};

export const isRichHtmlDescriptionNoTables = (value) => {
  const s = String(value ?? '');
  return /<\s*\/?\s*(p|br|strong|em|b|i|ul|li)\b/i.test(s);
};

const escapeHtml = (value) => {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
};

export const plainTextToHtml = (value) => {
  const text = String(value ?? '');
  const normalized = text.replaceAll('\r\n', '\n');
  const blocks = normalized.split(/\n{2,}/g);
  const html = blocks
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      const withBreaks = escapeHtml(trimmed).replaceAll('\n', '<br>');
      return `<p>${withBreaks}</p>`;
    })
    .filter(Boolean)
    .join('');

  return html;
};

const htmlToPlainText = (value) => {
  const s = String(value ?? '');
  return s
    .replaceAll(/<\s*br\s*\/?\s*>/gi, '\n')
    .replaceAll(/<\s*\/\s*p\s*>/gi, '\n\n')
    .replaceAll(/<[^>]*>/g, '')
    .replaceAll('&nbsp;', ' ')
    .trim();
};

export const normalizeSpellDescriptionForSave = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) return null;

  const text = isRichHtmlDescription(raw) ? htmlToPlainText(raw) : String(raw).trim();
  if (!text) return null;

  return raw;
};

export const sanitizeSpellDescriptionHtml = (html) => {
  return DOMPurify.sanitize(String(html ?? ''), {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'b',
      'i',
      'ul',
      'li',
      'table',
      'thead',
      'tbody',
      'tfoot',
      'tr',
      'th',
      'td',
      'colgroup',
      'col',
    ],
    ALLOWED_ATTR: ['colspan', 'rowspan'],
  });
};

export const sanitizeNewsHtml = (html) => {
  return DOMPurify.sanitize(String(html ?? ''), {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'b', 'i', 'ul', 'li'],
    ALLOWED_ATTR: [],
  });
};
