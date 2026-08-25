import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { AppearanceControl } from './AppearanceControl';

it('exposes System, Light, and Dark choices with the active value', () => {
  render(<AppearanceControl value="system" onChange={vi.fn()} />);

  expect(screen.getByRole('radiogroup', { name: 'Appearance' })).toBeTruthy();
  expect(screen.getByRole<HTMLInputElement>('radio', { name: 'System' }).checked).toBe(true);
  expect(screen.getByRole('radio', { name: 'Light' })).toBeTruthy();
  expect(screen.getByRole('radio', { name: 'Dark' })).toBeTruthy();
});
