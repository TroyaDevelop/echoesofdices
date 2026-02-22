type SpellError = {
  word: string;
  s: string[];
  message?: string;
  pos?: number;
  len?: number;
};

type SpellcheckResult = {
  errors: SpellError[];
};

const REQUEST_TIMEOUT_MS = 5500;

async function fetchJsonWithTimeout(url: string, init: RequestInit = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Non-JSON response: ${text.slice(0, 120)}`);
    }

    return response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function checkWithLanguageTool(text: string): Promise<SpellError[]> {
  const params = new URLSearchParams({
    text,
    language: 'auto',
    enabledOnly: 'false',
    level: 'picky',
  });

  const data = await fetchJsonWithTimeout('https://api.languagetool.org/v2/check', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  const matches = Array.isArray((data as any)?.matches) ? (data as any).matches : [];

  return matches
    .filter((match: any) => {
      const categoryId = String(match?.rule?.category?.id || '').toUpperCase();
      return categoryId !== 'STYLE';
    })
    .map((match: any) => {
      const pos = Number.isFinite(Number(match?.offset)) ? Number(match.offset) : undefined;
      const len = Number.isFinite(Number(match?.length)) ? Number(match.length) : undefined;
      const contextText = String(match?.context?.text || text);
      const contextOffset = Number.isFinite(Number(match?.context?.offset)) ? Number(match.context.offset) : 0;
      const contextLen = Number.isFinite(Number(match?.context?.length)) ? Number(match.context.length) : 0;
      const contextWord = contextText.slice(Math.max(0, contextOffset), Math.max(0, contextOffset + contextLen)).trim();
      const suggestions = Array.isArray(match?.replacements)
        ? match.replacements.map((item: any) => String(item?.value || '').trim()).filter(Boolean).slice(0, 8)
        : [];

      return {
        word: contextWord || String(match?.message || 'Ошибка').trim(),
        s: suggestions,
        message: String(match?.message || '').trim() || undefined,
        pos,
        len,
      } as SpellError;
    })
    .filter((row) => row.word);
}

export const toolsService = {
  async spellcheck(text: string): Promise<SpellcheckResult> {
    const normalizedText = String(text || '').slice(0, 12000).trim();
    if (!normalizedText) {
      return { errors: [] };
    }

    return {
      errors: await checkWithLanguageTool(normalizedText),
    };
  },
};
