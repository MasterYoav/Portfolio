import * as React from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import { ExternalLinkIcon } from 'lucide-react';
import { marked } from 'marked';
import { animate } from 'motion';

import type { Project } from '@/lib/projects';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

type Platform = 'apple' | 'windows' | 'linux';

type Download = {
  platform: Platform;
  label: string;
  icon: string;
  url: string;
};

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

const installableAssetPattern = /\.(dmg|pkg|exe|msi|deb|appimage|rpm|flatpak|snap|run)$/i;
const platformOrder: Platform[] = ['apple', 'windows', 'linux'];
const releaseCache = new Map<string, Promise<Download[]>>();
const readmeCache = new Map<string, Promise<string>>();
const closeDistance = 112;
const closeVelocity = 700;

type DragState = {
  pointerId: number;
  startY: number;
  lastY: number;
  lastTime: number;
  velocity: number;
};

function cachedRequest<T>(cache: Map<string, Promise<T>>, key: string, load: () => Promise<T>) {
  const cached = cache.get(key);
  if (cached) return cached;

  const request = load();
  cache.set(key, request);
  void request.catch(() => cache.delete(key));
  return request;
}

function projectOriginTransform(sheet: HTMLElement, trigger: HTMLElement | null) {
  if (!trigger) return 'translate3d(0, 1rem, 0) scale(0.98)';

  const source = trigger.getBoundingClientRect();
  const target = sheet.getBoundingClientRect();
  if (!source.width || !source.height || !target.width || !target.height) {
    return 'translate3d(0, 1rem, 0) scale(0.98)';
  }

  const x = source.left + source.width / 2 - target.left - target.width / 2;
  const y = source.top + source.height / 2 - target.top - target.height / 2;
  const scale = Math.max(0.1, Math.min(1, source.width / target.width, source.height / target.height));
  return `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
}

function classifyPlatform(name: string): Platform {
  if (/\.(dmg|pkg)$/i.test(name)) return 'apple';
  if (/\.(exe|msi)$/i.test(name)) return 'windows';
  return 'linux';
}

function platformDetails(platform: Platform) {
  if (platform === 'apple') return { label: 'macOS', icon: '/download-icons/apple-logo.png' };
  if (platform === 'windows') return { label: 'Windows', icon: '/download-icons/windows.png' };
  return { label: 'Linux', icon: '/download-icons/linux.png' };
}

function repositoryPath(repoUrl: string) {
  return repoUrl.match(/github\.com\/([^/]+\/[^/]+?)(?:\.git|\/|$)/i)?.[1] ?? '';
}

function latestDownloads(value: unknown): Download[] {
  if (!Array.isArray(value)) return [];

  const found = new Map<Platform, Download>();
  for (const release of value) {
    if (!release || typeof release !== 'object') continue;
    const assets = 'assets' in release && Array.isArray(release.assets) ? release.assets : [];

    for (const asset of assets) {
      if (!asset || typeof asset !== 'object') continue;
      const name = 'name' in asset && typeof asset.name === 'string' ? asset.name : '';
      const state = 'state' in asset && typeof asset.state === 'string' ? asset.state : '';
      const url = 'browser_download_url' in asset && typeof asset.browser_download_url === 'string'
        ? asset.browser_download_url
        : '';
      if (!installableAssetPattern.test(name) || state !== 'uploaded' || !/^https:\/\//i.test(url)) continue;

      const platform = classifyPlatform(name);
      if (!found.has(platform)) found.set(platform, { platform, ...platformDetails(platform), url });
    }
  }

  return platformOrder.flatMap((platform) => found.get(platform) ?? []);
}

function safeAbsoluteUrl(value: string, target: 'image' | 'link') {
  try {
    const url = new URL(value.startsWith('//') ? `https:${value}` : value);
    const allowed = target === 'image'
      ? ['http:', 'https:', 'data:']
      : ['http:', 'https:', 'mailto:', 'tel:'];
    return allowed.includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

function resolveReadmeUrl(value: string, project: Project, target: 'image' | 'link') {
  if (value.startsWith('#')) return target === 'link' ? value : '';
  if (/^[a-z][a-z\d+.-]*:|^\/\//i.test(value)) return safeAbsoluteUrl(value, target);
  if (value.startsWith('/')) return project.repoUrl ?? '';

  const base = target === 'image' ? project.rawBaseUrl : project.blobBaseUrl;
  if (!base) return project.repoUrl ?? '';

  try {
    return new URL(value.replace(/^\.\//, ''), base).href;
  } catch {
    return project.repoUrl ?? '';
  }
}

function renderReadme(markdown: string, project: Project) {
  const rendered = marked.parse(markdown, { gfm: true, breaks: false }) as string;
  const template = document.createElement('template');
  template.innerHTML = DOMPurify.sanitize(rendered, { USE_PROFILES: { html: true } });

  template.content.querySelectorAll('img').forEach((image) => {
    const source = image.getAttribute('src');
    if (source) image.setAttribute('src', resolveReadmeUrl(source, project, 'image'));
    image.loading = 'lazy';
    image.decoding = 'async';
    image.removeAttribute('width');
    image.removeAttribute('height');
  });

  template.content.querySelectorAll('a').forEach((anchor) => {
    const href = anchor.getAttribute('href');
    const resolved = href ? resolveReadmeUrl(href, project, 'link') : '';
    if (resolved) anchor.setAttribute('href', resolved);
    else anchor.removeAttribute('href');
    anchor.target = '_blank';
    anchor.rel = 'noreferrer';
  });

  return template.innerHTML;
}

export function ProjectSheet({
  project,
  trigger,
  onOpenChange,
}: {
  project: Project | null;
  trigger: HTMLElement | null;
  onOpenChange: (open: boolean) => void;
}): React.JSX.Element {
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [releaseState, setReleaseState] = useState<LoadState>('idle');
  const [readme, setReadme] = useState('');
  const [readmeState, setReadmeState] = useState<LoadState>('idle');
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const openingAnimation = useRef<ReturnType<typeof animate> | null>(null);
  const originTransform = useRef('translate3d(0, 1rem, 0) scale(0.98)');
  const closing = useRef(false);
  const drag = useRef<DragState | null>(null);

  useEffect(() => {
    let active = true;
    setDownloads([]);
    setReadme('');
    setReleaseState(project?.repoUrl ? 'loading' : 'idle');
    setReadmeState(project?.readmeUrl ? 'loading' : 'idle');

    if (!project || project.gameUrl) return () => { active = false; };

    const repoPath = project.repoUrl ? repositoryPath(project.repoUrl) : '';
    if (repoPath) {
      cachedRequest(releaseCache, repoPath, () => (
        fetch(`https://api.github.com/repos/${repoPath}/releases?per_page=8`)
          .then((response) => {
            if (!response.ok) throw new Error('Release request failed');
            return response.json();
          })
          .then(latestDownloads)
      ))
        .then((cachedDownloads) => {
          if (!active) return;
          setDownloads(cachedDownloads);
          setReleaseState('ready');
        })
        .catch(() => active && setReleaseState('error'));
    } else {
      setReleaseState('idle');
    }

    if (project.readmeUrl) {
      cachedRequest(readmeCache, project.readmeUrl, () => (
        fetch(project.readmeUrl!)
          .then((response) => {
            if (!response.ok) throw new Error('README request failed');
            return response.text();
          })
      ))
        .then((markdown) => {
          if (!active) return;
          setReadme(renderReadme(markdown, project));
          setReadmeState('ready');
        })
        .catch(() => active && setReadmeState('error'));
    }

    return () => { active = false; };
  }, [project]);

  useLayoutEffect(() => {
    const sheet = sheetRef.current;
    if (!project || !sheet) return;

    closing.current = false;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    originTransform.current = projectOriginTransform(sheet, trigger);
    sheet.style.transformOrigin = 'center';
    sheet.style.transform = reducedMotion ? 'none' : originTransform.current;
    sheet.style.opacity = reducedMotion ? '0' : '0.35';
    openingAnimation.current = animate(
      sheet,
      reducedMotion
        ? { opacity: 1 }
        : { transform: 'translate3d(0, 0, 0) scale(1)', opacity: 1 },
      reducedMotion
        ? { duration: 0.16, ease: 'easeOut' }
        : { type: 'spring', stiffness: 380, damping: 39, mass: 1 },
    );

    return () => openingAnimation.current?.stop?.();
  }, [project, trigger]);

  const closeSheet = async (velocity = 0) => {
    if (closing.current) return;
    closing.current = true;
    openingAnimation.current?.stop?.();

    const sheet = sheetRef.current;
    if (sheet) {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      await animate(
        sheet,
        reducedMotion
          ? { opacity: 0 }
          : { transform: originTransform.current, opacity: 0.2 },
        reducedMotion
          ? { duration: 0.12, ease: 'easeIn' }
          : { type: 'spring', stiffness: 380, damping: 39, mass: 1, velocity },
      );
    }

    onOpenChange(false);
    window.setTimeout(() => trigger?.focus(), 0);
  };

  const handleOpenChange = (open: boolean) => {
    if (open) onOpenChange(true);
    else void closeSheet();
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || closing.current) return;
    openingAnimation.current?.stop?.();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    drag.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      lastY: event.clientY,
      lastTime: event.timeStamp,
      velocity: 0,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;

    event.preventDefault();
    const elapsed = Math.max(1, event.timeStamp - current.lastTime);
    current.velocity = ((event.clientY - current.lastY) / elapsed) * 1000;
    current.lastY = event.clientY;
    current.lastTime = event.timeStamp;
    const distance = Math.max(0, event.clientY - current.startY);
    const sheet = sheetRef.current;
    if (!sheet) return;
    sheet.style.transform = `translate3d(0, ${distance}px, 0)`;
    sheet.style.opacity = String(Math.max(0.55, 1 - distance / window.innerHeight));
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;

    event.currentTarget.releasePointerCapture?.(event.pointerId);
    drag.current = null;
    const distance = Math.max(0, event.clientY - current.startY);
    if (distance >= closeDistance || current.velocity >= closeVelocity) {
      void closeSheet(Math.max(0, current.velocity));
      return;
    }

    const sheet = sheetRef.current;
    if (sheet) {
      openingAnimation.current = animate(
        sheet,
        { transform: 'translate3d(0, 0, 0) scale(1)', opacity: 1 },
        { type: 'spring', stiffness: 380, damping: 39, mass: 1 },
      );
    }
  };

  return (
    <Dialog open={project !== null} onOpenChange={handleOpenChange}>
      {project && (
        <DialogContent ref={sheetRef} className="project-sheet material">
          <div
            className="project-sheet-handle"
            aria-hidden="true"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
          />
          <div className="project-sheet-scroll">
            <DialogHeader className="project-sheet-header">
              <img className="project-sheet-icon" src={project.icon} alt="" />
              <div>
                <p className="project-sheet-category">{project.category}</p>
                <DialogTitle className="project-sheet-title">{project.name}</DialogTitle>
                <DialogDescription>{project.platforms.join(' · ')}</DialogDescription>
              </div>
            </DialogHeader>

            <section className="project-story" aria-label="Project story">
              <p>{project.summary}</p>
              <ul>{project.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
            </section>

            {project.gameUrl ? (
              <iframe
                className="project-game"
                src={project.gameUrl}
                title={`${project.name} game`}
                sandbox="allow-scripts allow-same-origin"
              />
            ) : (
              <>
                <section className="project-downloads" aria-labelledby="project-downloads-title">
                  <h3 id="project-downloads-title">Downloads</h3>
                  <div className="project-download-actions">
                    {downloads.map((download) => (
                      <a
                        key={download.platform}
                        className="project-download-link"
                        href={download.url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Download latest ${download.label} build`}
                      >
                        <img src={download.icon} alt="" />
                        {download.label}
                      </a>
                    ))}
                    {project.releaseUrl && (
                      <a href={project.releaseUrl} target="_blank" rel="noreferrer">
                        <ExternalLinkIcon aria-hidden="true" /> Release page
                      </a>
                    )}
                    {project.repoUrl && (
                      <a href={project.repoUrl} target="_blank" rel="noreferrer">
                        <ExternalLinkIcon aria-hidden="true" /> Repository
                      </a>
                    )}
                  </div>
                  <p className="project-remote-status" aria-live="polite">
                    {releaseState === 'loading' && 'Checking GitHub for current downloads…'}
                    {releaseState === 'error' && 'Could not load releases from GitHub. Use the release page instead.'}
                    {releaseState === 'ready' && downloads.length === 0 && 'No installable release assets found. Use the release page instead.'}
                  </p>
                </section>

                <section className="project-readme" aria-labelledby="project-readme-title">
                  <h3 id="project-readme-title">README</h3>
                  {readmeState === 'loading' && <p aria-live="polite">Loading README from GitHub…</p>}
                  {readmeState === 'error' && <p aria-live="polite">Could not load the README from GitHub right now.</p>}
                  {readmeState === 'ready' && (
                    <div className="readme-prose" dangerouslySetInnerHTML={{ __html: readme }} />
                  )}
                </section>
              </>
            )}
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
