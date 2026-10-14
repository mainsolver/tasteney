export interface WikiLinkSegment {
  type: 'text' | 'link';
  text: string;
  targetId?: string;
  customLabel?: string;
  isExternal?: boolean;
  externalUrl?: string;
}

/**
 * Parses wiki-style links in a text string.
 * Syntax supported:
 * - [[article-id|Custom Label]] -> type: 'link', text: 'Custom Label', targetId: 'article-id', customLabel: 'Custom Label'
 * - [[article-id]] -> type: 'link', text: 'article-id', targetId: 'article-id'
 * - [[https://en.wikipedia.org/...|Wikipedia]] -> type: 'link', text: 'Wikipedia', isExternal: true, externalUrl: '...'
 * - [[wikipedia:Article_Title|Custom Label]] -> type: 'link', text: 'Custom Label', isExternal: true, externalUrl: 'https://en.wikipedia.org/wiki/Article_Title'
 */
export function parseWikiLinks(content: string): WikiLinkSegment[] {
  if (!content) return [];

  const segments: WikiLinkSegment[] = [];
  const wikiLinkRegex = /\[\[([^\|\]]+)(?:\|([^\]]+))?\]\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = wikiLinkRegex.exec(content)) !== null) {
    const matchStart = match.index;
    const matchEnd = wikiLinkRegex.lastIndex;

    // Plain text before the link
    if (matchStart > lastIndex) {
      segments.push({
        type: 'text',
        text: content.slice(lastIndex, matchStart),
      });
    }

    const rawTarget = match[1].trim();
    const customLabel = match[2]?.trim();

    let isExternal = false;
    let externalUrl: string | undefined;

    if (rawTarget.startsWith('http://') || rawTarget.startsWith('https://')) {
      isExternal = true;
      externalUrl = rawTarget;
    } else if (rawTarget.startsWith('wikipedia:') || rawTarget.startsWith('wiki:')) {
      isExternal = true;
      const stripped = rawTarget.replace(/^(wikipedia:|wiki:)/, '');
      if (stripped.startsWith('http://') || stripped.startsWith('https://')) {
        externalUrl = stripped;
      } else if (stripped.startsWith('de:')) {
        externalUrl = `https://de.wikipedia.org/wiki/${stripped.slice(3)}`;
      } else if (stripped.startsWith('en:')) {
        externalUrl = `https://en.wikipedia.org/wiki/${stripped.slice(3)}`;
      } else {
        externalUrl = `https://en.wikipedia.org/wiki/${stripped}`;
      }
    }

    const label = customLabel || (isExternal ? (externalUrl || rawTarget) : rawTarget);

    segments.push({
      type: 'link',
      text: label,
      targetId: rawTarget,
      customLabel,
      isExternal,
      externalUrl,
    });

    lastIndex = matchEnd;
  }

  // Trailing text
  if (lastIndex < content.length) {
    segments.push({
      type: 'text',
      text: content.slice(lastIndex),
    });
  }

  return segments;
}
