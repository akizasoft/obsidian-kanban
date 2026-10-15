/*
  Convert the tag to an already supported Markdown tag (#Tag)
*/
export function normalizeCardTag(input: string): string | null {
  const tagName = input.trim().replace(/^#/, '');

  // Obsidian tags cannot contain spaces or be entirely numeric
  if (
    !tagName ||
    !/^[\p{L}\p{N}_/-]+$/u.test(tagName) ||
    !/[\p{L}_-]/u.test(tagName) ||
    tagName.startsWith('/') ||
    tagName.endsWith('/') ||
    tagName.includes('//')
  ) {
    return null;
  }

  return `#${tagName}`;
}

// Return null if the card already has the same tag
// The user should still be able to add as many tags as they want outside of this caveat
export function appendTagToCardTitle(
  titleRaw: string,
  existingTags: readonly string[] | undefined,
  tag: string
): string | null {
  const canonical = tag.replace(/^#/, '').toLowerCase();

  if (existingTags?.some((existing) => existing.replace(/^#/, '').toLowerCase() === canonical)) {
    return null;
  }

  const title = titleRaw.replace(/\s+$/, '');
  return title ? `${title} ${tag}` : tag;
}
