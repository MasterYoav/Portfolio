import * as React from 'react';
import { cleanup, createEvent, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { projects } from '@/lib/projects';

import { PortfolioExperience } from './PortfolioExperience';
import { ProjectSheet } from './ProjectSheet';

vi.mock('motion', () => ({
  animate: vi.fn((element: HTMLElement, keyframes: Record<string, string | number>) => {
    for (const [property, value] of Object.entries(keyframes)) {
      Object.assign(element.style, { [property]: Array.isArray(value) ? value.at(-1) : value });
    }
    return Promise.resolve();
  }),
}));

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

function projectWithRepository(name: string) {
  return {
    ...projects[0],
    id: name,
    repoUrl: `https://github.com/example/${name}`,
    releaseUrl: `https://github.com/example/${name}/releases/latest`,
    readmeUrl: `https://raw.githubusercontent.com/example/${name}/main/README.md`,
    rawBaseUrl: `https://raw.githubusercontent.com/example/${name}/main/`,
    blobBaseUrl: `https://github.com/example/${name}/blob/main/`,
  };
}

function withTimeStamp<T extends Event>(event: T, timeStamp: number) {
  Object.defineProperty(event, 'timeStamp', { value: timeStamp });
  return event;
}

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
  const project = projectWithRepository('sanitise-test');
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

  render(<ProjectSheet project={project} trigger={null} onOpenChange={vi.fn()} />);

  const logo = await screen.findByRole<HTMLImageElement>('img', { name: 'Logo' });
  const guide = screen.getByRole<HTMLAnchorElement>('link', { name: 'Guide' });
  expect(logo.src).toBe('https://raw.githubusercontent.com/example/sanitise-test/main/docs/logo.png');
  expect(guide.href).toBe('https://github.com/example/sanitise-test/blob/main/docs/guide.md');
  expect(document.querySelector('script')).toBeNull();
});

it('offers the latest installable release for each platform', async () => {
  const project = projectWithRepository('downloads-test');
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

  render(<ProjectSheet project={project} trigger={null} onOpenChange={vi.fn()} />);

  expect(await screen.findByRole('link', { name: /download latest macOS build/i })).toHaveProperty('href', 'https://example.com/mac');
  expect(screen.getByRole('link', { name: /download latest Windows build/i })).toHaveProperty('href', 'https://example.com/windows');
  expect(screen.getByRole('link', { name: /download latest Linux build/i })).toHaveProperty('href', 'https://example.com/linux');
  expect(screen.queryByRole('link', { name: /source\.zip/i })).toBeNull();
  expect(screen.getByRole('link', { name: /repository/i })).toHaveProperty('href', project.repoUrl);
});

it('keeps repository and release-page fallbacks when GitHub is unavailable', async () => {
  const project = projectWithRepository('fallback-test');
  render(<ProjectSheet project={project} trigger={null} onOpenChange={vi.fn()} />);

  expect(await screen.findByText(/could not load releases/i)).toBeTruthy();
  expect(screen.getByRole('link', { name: /release page/i })).toHaveProperty('href', project.releaseUrl);
  expect(screen.getByRole('link', { name: /repository/i })).toHaveProperty('href', project.repoUrl);
  expect(screen.getByText(/could not load the README/i)).toBeTruthy();
});

it('retains the local Cluck Invaders game view', () => {
  const project = projects.find(({ id }) => id === 'cluck-invaders')!;
  render(<ProjectSheet project={project} trigger={null} onOpenChange={vi.fn()} />);

  expect(screen.getByTitle(/Cluck Invaders game/i)).toHaveProperty('src', `${window.location.origin}/cluck-invaders.html`);
});

it('reuses successful release and README requests without bypassing sanitisation', async () => {
  const fetchMock = vi.fn((url: string) => Promise.resolve(
    url.includes('/releases?')
      ? { ok: true, json: () => Promise.resolve([]) }
      : {
          ok: true,
          text: () => Promise.resolve('[Unsafe](javascript:alert(1))'),
        },
  ));
  vi.stubGlobal('fetch', fetchMock);
  const project = {
    ...projects[0],
    id: 'cache-test',
    repoUrl: 'https://github.com/example/cache-test',
    readmeUrl: 'https://raw.githubusercontent.com/example/cache-test/main/README.md',
    rawBaseUrl: 'https://raw.githubusercontent.com/example/cache-test/main/',
    blobBaseUrl: 'https://github.com/example/cache-test/blob/main/',
  };

  const first = render(<ProjectSheet project={project} trigger={null} onOpenChange={vi.fn()} />);
  expect((await screen.findByText('Unsafe')).hasAttribute('href')).toBe(false);
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  first.unmount();

  render(<ProjectSheet project={project} trigger={null} onOpenChange={vi.fn()} />);
  expect((await screen.findByText('Unsafe')).hasAttribute('href')).toBe(false);
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

it('closes from a deliberate handle drag without hijacking sheet scrolling', async () => {
  const onOpenChange = vi.fn();
  const { container } = render(
    <ProjectSheet project={projects[0]} trigger={null} onOpenChange={onOpenChange} />,
  );
  const handle = container.ownerDocument.querySelector('.project-sheet-handle')!;
  const scrollArea = container.ownerDocument.querySelector('.project-sheet-scroll')!;

  fireEvent.pointerDown(scrollArea, { button: 0, clientY: 100, pointerId: 1 });
  fireEvent.pointerMove(scrollArea, { clientY: 240, pointerId: 1 });
  fireEvent.pointerUp(scrollArea, { clientY: 240, pointerId: 1 });
  expect(onOpenChange).not.toHaveBeenCalled();

  fireEvent(handle, withTimeStamp(createEvent.pointerDown(handle, {
    button: 0,
    clientY: 100,
    pointerId: 2,
  }), 1000));
  fireEvent(handle, withTimeStamp(createEvent.pointerMove(handle, {
    clientY: 140,
    pointerId: 2,
  }), 1200));
  fireEvent(handle, withTimeStamp(createEvent.pointerUp(handle, {
    clientY: 140,
    pointerId: 2,
  }), 1210));
  await new Promise((resolve) => window.setTimeout(resolve, 0));
  expect(onOpenChange).not.toHaveBeenCalled();

  fireEvent.pointerDown(handle, { button: 0, clientY: 100, pointerId: 3 });
  fireEvent.pointerMove(handle, { clientY: 240, pointerId: 3 });
  fireEvent.pointerUp(handle, { clientY: 240, pointerId: 3 });

  await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
});

it('does not dismiss from a stale early flick velocity', async () => {
  const onOpenChange = vi.fn();
  const { container } = render(
    <ProjectSheet project={projects[0]} trigger={null} onOpenChange={onOpenChange} />,
  );
  const handle = container.ownerDocument.querySelector('.project-sheet-handle')!;

  fireEvent(handle, withTimeStamp(createEvent.pointerDown(handle, {
    button: 0,
    clientY: 100,
    pointerId: 4,
  }), 1000));
  fireEvent(handle, withTimeStamp(createEvent.pointerMove(handle, {
    clientY: 120,
    pointerId: 4,
  }), 1010));
  fireEvent(handle, withTimeStamp(createEvent.pointerUp(handle, {
    clientY: 120,
    pointerId: 4,
  }), 2000));

  await new Promise((resolve) => window.setTimeout(resolve, 0));
  expect(onOpenChange).not.toHaveBeenCalled();
});

it('springs back instead of dismissing when pointer capture is cancelled', async () => {
  const onOpenChange = vi.fn();
  const { container } = render(
    <ProjectSheet project={projects[0]} trigger={null} onOpenChange={onOpenChange} />,
  );
  const handle = container.ownerDocument.querySelector('.project-sheet-handle')!;

  fireEvent.pointerDown(handle, { button: 0, clientY: 100, pointerId: 5 });
  fireEvent.pointerMove(handle, { clientY: 240, pointerId: 5 });
  fireEvent.pointerCancel(handle, { clientY: 240, pointerId: 5 });

  await new Promise((resolve) => window.setTimeout(resolve, 0));
  expect(onOpenChange).not.toHaveBeenCalled();
});

it('opens project details from the portfolio carousel', () => {
  render(<PortfolioExperience projects={projects} />);

  fireEvent.click(screen.getByRole('button', { name: /open IceSniff/i }));

  expect(screen.getByRole('dialog', { name: /IceSniff/i })).toBeTruthy();
});
