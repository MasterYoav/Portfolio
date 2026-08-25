import * as React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { projects } from '@/lib/projects';

import { PortfolioExperience } from './PortfolioExperience';
import { ProjectSheet } from './ProjectSheet';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('labels project details as a dialog and exposes a close action', () => {
  render(<ProjectSheet project={projects[0]} trigger={null} onOpenChange={vi.fn()} />);

  expect(screen.getByRole('dialog', { name: /IceSniff/i })).toBeTruthy();
  expect(screen.getByRole('button', { name: /close/i })).toBeTruthy();
});

it('restores focus to the originating card when the sheet closes', async () => {
  const trigger = document.createElement('button');
  const onOpenChange = vi.fn();
  document.body.append(trigger);

  function Harness() {
    const [project, setProject] = React.useState(projects[0]);
    return (
      <ProjectSheet
        project={project}
        trigger={trigger}
        onOpenChange={(open) => {
          onOpenChange(open);
          if (!open) setProject(null);
        }}
      />
    );
  }

  render(<Harness />);
  fireEvent.click(screen.getByRole('button', { name: /close/i }));

  await waitFor(() => expect(document.activeElement).toBe(trigger));
  expect(onOpenChange).toHaveBeenCalledWith(false);
  trigger.remove();
});

it('sanitises README markdown and rewrites relative repository assets', async () => {
  vi.stubGlobal('fetch', vi.fn((url: string) => {
    if (url.includes('/releases?')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    }

    return Promise.resolve({
      ok: true,
      text: () => Promise.resolve([
        '# README',
        '![Logo](docs/logo.png)',
        '[Guide](docs/guide.md)',
        '<script>document.body.dataset.compromised = "true"</script>',
      ].join('\n\n')),
    });
  }));

  render(<ProjectSheet project={projects[0]} trigger={null} onOpenChange={vi.fn()} />);

  const logo = await screen.findByRole<HTMLImageElement>('img', { name: 'Logo' });
  const guide = screen.getByRole<HTMLAnchorElement>('link', { name: 'Guide' });
  expect(logo.src).toBe('https://raw.githubusercontent.com/MasterYoav/IceSniff/main/docs/logo.png');
  expect(guide.href).toBe('https://github.com/MasterYoav/IceSniff/blob/main/docs/guide.md');
  expect(document.querySelector('script')).toBeNull();
});

it('offers the latest installable release for each platform', async () => {
  vi.stubGlobal('fetch', vi.fn((url: string) => {
    if (url.includes('/releases?')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          {
            assets: [
              { name: 'IceSniff.dmg', state: 'uploaded', browser_download_url: 'https://example.com/mac' },
              { name: 'source.zip', state: 'uploaded', browser_download_url: 'https://example.com/source' },
            ],
          },
          {
            assets: [
              { name: 'IceSniff.exe', state: 'uploaded', browser_download_url: 'https://example.com/windows' },
              { name: 'icesniff.deb', state: 'uploaded', browser_download_url: 'https://example.com/linux' },
            ],
          },
        ]),
      });
    }

    return Promise.resolve({ ok: true, text: () => Promise.resolve('# README') });
  }));

  render(<ProjectSheet project={projects[0]} trigger={null} onOpenChange={vi.fn()} />);

  expect(await screen.findByRole('link', { name: /download latest macOS build/i })).toHaveProperty('href', 'https://example.com/mac');
  expect(screen.getByRole('link', { name: /download latest Windows build/i })).toHaveProperty('href', 'https://example.com/windows');
  expect(screen.getByRole('link', { name: /download latest Linux build/i })).toHaveProperty('href', 'https://example.com/linux');
  expect(screen.queryByRole('link', { name: /source\.zip/i })).toBeNull();
  expect(screen.getByRole('link', { name: /repository/i })).toHaveProperty('href', projects[0].repoUrl);
});

it('keeps repository and release-page fallbacks when GitHub is unavailable', async () => {
  render(<ProjectSheet project={projects[0]} trigger={null} onOpenChange={vi.fn()} />);

  expect(await screen.findByText(/could not load releases/i)).toBeTruthy();
  expect(screen.getByRole('link', { name: /release page/i })).toHaveProperty('href', projects[0].releaseUrl);
  expect(screen.getByRole('link', { name: /repository/i })).toHaveProperty('href', projects[0].repoUrl);
  expect(screen.getByText(/could not load the README/i)).toBeTruthy();
});

it('retains the local Cluck Invaders game view', () => {
  const project = projects.find(({ id }) => id === 'cluck-invaders')!;
  render(<ProjectSheet project={project} trigger={null} onOpenChange={vi.fn()} />);

  expect(screen.getByTitle(/Cluck Invaders game/i)).toHaveProperty('src', `${window.location.origin}/cluck-invaders.html`);
});

it('opens project details from the portfolio carousel', () => {
  render(<PortfolioExperience projects={projects} />);

  fireEvent.click(screen.getByRole('button', { name: /open IceSniff/i }));

  expect(screen.getByRole('dialog', { name: /IceSniff/i })).toBeTruthy();
});
