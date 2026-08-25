import { describe, expect, it } from 'vitest';
import { readAppearancePreference, resolveTheme } from './appearance';

describe('appearance preference', () => {
  it('falls back to system for unknown stored values', () => {
    expect(readAppearancePreference('violet')).toBe('system');
  });

  it('uses the system colour scheme only in system mode', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });
});
