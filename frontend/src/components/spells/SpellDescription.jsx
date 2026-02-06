import { isRichHtmlDescription, sanitizeSpellDescriptionHtml } from '../../lib/richText.js';

export default function SpellDescription({ description }) {
  if (!description) {
    return <div className="leading-relaxed">—</div>;
  }

  if (isRichHtmlDescription(description)) {
    return (
      <div
        className="spell-description leading-relaxed"
        dangerouslySetInnerHTML={{ __html: sanitizeSpellDescriptionHtml(description) }}
      />
    );
  }

  return <div className="whitespace-pre-wrap leading-relaxed">{String(description)}</div>;
}
