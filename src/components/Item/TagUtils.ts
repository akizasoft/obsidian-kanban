/*
  Convert the tag to an already supported Markdown tag (#Tag)
*/
export function normalizeCardTag(input: string): string | null {
  const tagName = input.trim().replace(/^#/, '').trim().replace(/\s+/g, '-');

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

// Parse comma-sepearate tags, allowing spaces
export function parseCardTagsInput(input: string): string[] | null {
  const tags: string[] = [];

  for (const part of input.split(',')) {
    const tag = normalizeCardTag(part);
    if (tag === null) return null;
    tags.push(tag);
  }

  return tags;
}

// Allows the user to add multiple tags at once
// This should still block user's from adding duplicate tags
export function appendTagsToCardTitle(
  titleRaw: string,
  existingTags: readonly string[] | undefined,
  tags: readonly string[]
): string | null {
  let title = titleRaw;
  const seen = [...(existingTags ?? [])];
  let changed = false;

  for (const tag of tags) {
    const updated = appendTagToCardTitle(title, seen, tag);
    if (updated === null) continue;
    title = updated;
    seen.push(tag);
    changed = true;
  }

  return changed ? title : null;
}
