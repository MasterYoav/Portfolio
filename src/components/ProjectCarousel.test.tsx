import * as React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';

import { projects } from '../lib/projects';

import { ProjectCarousel } from './ProjectCarousel';

beforeAll(() => {
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(cleanup);

it('renders every project as a labelled card action', () => {
  render(<ProjectCarousel projects={projects} onSelect={vi.fn()} />);

  expect(screen.getByRole('button', { name: /open IceSniff/i })).toBeTruthy();
  expect(screen.getByRole('button', { name: /open Cluck Invaders/i })).toBeTruthy();
});

it('selects a project with its originating button', () => {
  const onSelect = vi.fn();
  render(<ProjectCarousel projects={projects} onSelect={onSelect} />);
  const button = screen.getByRole<HTMLButtonElement>('button', { name: /open IceSniff/i });

  fireEvent.click(button);

  expect(onSelect).toHaveBeenCalledWith(projects[0], button);
});
