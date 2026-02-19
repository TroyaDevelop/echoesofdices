import DOMPurify from 'dompurify';

export const isRichHtmlDescription = (value) => {
  const s = String(value ?? '');
  return /<\s*\/?\s*(p|br|hr|strong|em|b|i|ul|li|h3|details|summary|table|thead|tbody|tr|th|td|colgroup|col)\b/i.test(s);
};

export const isRichHtmlDescriptionNoTables = (value) => {
  const s = String(value ?? '');
  return /<\s*\/?\s*(p|br|hr|strong|em|b|i|ul|li|h3|details|summary)\b/i.test(s);
};

const COLLAPSE_OPEN_RE = /^\[\[\s*collapse\s*:\s*(.+?)\s*\]\]$/i;
const COLLAPSE_CLOSE_RE = /^\[\[\s*\/\s*collapse\s*\]\]$/i;
const HEADING_RE = /^[-—]\s*(.+?)\s*[-—]$/;

const getNodeText = (node) => String(node?.textContent || '').replace(/\u00a0/g, ' ').trim();

const normalizeHeadingText = (value) =>
  String(value || '')
    .replace(/[—-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const transformEditorMarkup = (value) => {
  const html = String(value ?? '');
  if (!html.trim() || typeof window === 'undefined') return html;

  const container = window.document.createElement('div');
  container.innerHTML = html;

  const blocks = Array.from(container.childNodes);

  for (const node of blocks) {
    if (!(node instanceof window.HTMLElement)) continue;
    const tag = node.tagName;
    const text = getNodeText(node);

    if (tag === 'H3') {
      if (normalizeHeadingText(text) !== 'особенности') continue;
      const divider = window.document.createElement('hr');
      node.replaceWith(divider);
      continue;
    }

    if (tag !== 'P') continue;

    const match = text.match(HEADING_RE);
    if (!match) continue;

    const headingText = String(match[1] || '').trim();
    if (normalizeHeadingText(headingText) === 'особенности') {
      const divider = window.document.createElement('hr');
      node.replaceWith(divider);
      continue;
    }

    const heading = window.document.createElement('h3');
    heading.textContent = `— ${headingText} —`;
    node.replaceWith(heading);
  }

  let index = 0;
  while (index < container.childNodes.length) {
    const startNode = container.childNodes[index];
    if (!(startNode instanceof window.HTMLElement) || startNode.tagName !== 'P') {
      index += 1;
      continue;
    }

    const startText = getNodeText(startNode);
    const openMatch = startText.match(COLLAPSE_OPEN_RE);
    if (!openMatch) {
      index += 1;
      continue;
    }

    let endIndex = -1;
    for (let i = index + 1; i < container.childNodes.length; i += 1) {
      const endNode = container.childNodes[i];
      if (!(endNode instanceof window.HTMLElement) || endNode.tagName !== 'P') continue;
      const endText = getNodeText(endNode);
      if (COLLAPSE_CLOSE_RE.test(endText)) {
        endIndex = i;
        break;
      }
    }

    if (endIndex === -1) {
      index += 1;
      continue;
    }

    const details = window.document.createElement('details');
    details.open = true;

    const summary = window.document.createElement('summary');
    summary.textContent = openMatch[1];
    details.appendChild(summary);

    const bodyNodes = [];
    for (let i = index + 1; i < endIndex; i += 1) {
      bodyNodes.push(container.childNodes[i]);
    }

    for (const bodyNode of bodyNodes) {
      details.appendChild(bodyNode);
    }

    container.childNodes[endIndex]?.remove();
    startNode.replaceWith(details);
    index += 1;
  }

  return container.innerHTML;
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
  return DOMPurify.sanitize(transformEditorMarkup(html), {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: [
      'p',
      'h3',
      'hr',
      'br',
      'details',
      'summary',
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
    ALLOWED_ATTR: ['colspan', 'rowspan', 'open'],
  });
};

export const sanitizeNewsHtml = (html) => {
  return DOMPurify.sanitize(transformEditorMarkup(html), {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: ['p', 'h3', 'hr', 'br', 'details', 'summary', 'strong', 'em', 'b', 'i', 'ul', 'li'],
    ALLOWED_ATTR: ['open'],
  });
};
