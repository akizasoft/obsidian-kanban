/*
  Creates a quick action tag selector for the ItemMenu to offer an alternative for adding tags
*/
import { Notice } from 'obsidian';
import { t } from 'src/lang/helpers';

import { c } from '../helpers';
import { normalizeCardTag } from './TagUtils';

interface TagPickerPosition {
  x: number;
  y: number;
  left?: number;
}

export function constructTagPicker(
  win: Window,
  position: TagPickerPosition,
  onAddTag: (tag: string) => boolean
): void {
  const div = win.document.body.createDiv({
    cls: `${c('tag-picker')} ${c('ignore-click-outside')}`,
  });

  div.setAttribute('role', 'dialog');
  div.setAttribute('aria-label', t('Add tag'));

  div.style.left = `${position.x}px`;
  div.style.top = `${position.y}px`;

  // The 'Add tag' UI label
  const label = div.createEl('label', {
    cls: c('tag-picker-label'),
    text: t('Add tag'),
  });

  // Add the tags you want here
  // TODO: Add the ability to add multiple tags at once
  // TODO: Add the ability to add tags with spaces (this is not currently supported at all, so this may be a large change)
  const input = label.createEl('input', {
    type: 'text',
    attr: {
      placeholder: 'Tag name',
      'aria-label': t('Tag'),
    },
  });

  const actions = div.createDiv({
    cls: c('tag-picker-actions'),
  });

  // Finalize tag submission
  const addButton = actions.createEl('button', {
    text: t('Add tag'),
    cls: 'mod-cta',
    attr: { type: 'button' },
  });

  let destroyed = false;

  // Successfully closed the tag picker UI
  const close = () => {
    if (destroyed) return;
    destroyed = true;
    div.remove();

    win.document.removeEventListener('pointerdown', onOutsideClick, true);
    win.document.removeEventListener('keydown', onEscape, true);
  };

  const submit = () => {
    const tag = normalizeCardTag(input.value);

    // If a tag has spaces or is not appropiate per Obsidian's standards, we need to notify the user
    if (tag === null) {
      new Notice('Please enter a valid tag.');
      input.focus();
      return;
    }

    // Automatically close the picker when a tag is added
    if (onAddTag(tag)) {
      close();
    } else {
      // If a duplicate is added, we notify the user
      new Notice('This card already has that tag.');
      input.select();
    }
  };

  const onOutsideClick = (event: PointerEvent) => {
    if (event.target && !div.contains(event.target as Node)) {
      close();
    }
  };

  // Below are a few different keybinds for closing via ESC and submitting via Enter

  const onEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      close();
    }
  };

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      submit();
    }
  });

  addButton.addEventListener('click', (event) => {
    event.stopPropagation();
    submit();
  });

  // This is just here to help position the menu a little better after closing
  win.setTimeout(() => {
    if (destroyed) return;

    const bounds = div.getBoundingClientRect();
    const margin = 8;
    const rightLimit = Math.max(margin, win.innerWidth - bounds.width - margin);
    const leftOfMenu = position.left === undefined ? -1 : position.left - bounds.width;

    const preferredX =
      position.x + bounds.width > win.innerWidth - margin && leftOfMenu >= margin
        ? leftOfMenu
        : position.x;

    div.style.left = `${Math.max(margin, Math.min(preferredX, rightLimit))}px`;

    div.style.top = `${Math.max(
      margin,
      Math.min(position.y, win.innerHeight - bounds.height - margin)
    )}px`;

    win.document.addEventListener('pointerdown', onOutsideClick, true);
    win.document.addEventListener('keydown', onEscape, true);

    input.focus();
  });
}
