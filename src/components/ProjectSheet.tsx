import * as React from 'react';
import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { DownloadIcon, ExternalLinkIcon } from 'lucide-react';
import { marked } from 'marked';

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

  useEffect(() => {
    let active = true;
    setDownloads([]);
    setReadme('');
    setReleaseState(project?.repoUrl ? 'loading' : 'idle');
    setReadmeState(project?.readmeUrl ? 'loading' : 'idle');

    if (!project || project.gameUrl) return () => { active = false; };

    const repoPath = project.repoUrl ? repositoryPath(project.repoUrl) : '';
    if (repoPath) {
      fetch(`https://api.github.com/repos/${repoPath}/releases?per_page=8`)
        .then((response) => {
          if (!response.ok) throw new Error('Release request failed');
          return response.json();
        })
        .then((releases) => {
          if (!active) return;
          setDownloads(latestDownloads(releases));
          setReleaseState('ready');
        })
        .catch(() => active && setReleaseState('error'));
    } else {
      setReleaseState('idle');
    }

    if (project.readmeUrl) {
      fetch(project.readmeUrl)
        .then((response) => {
          if (!response.ok) throw new Error('README request failed');
          return response.text();
        })
        .then((markdown) => {
          if (!active) return;
          setReadme(renderReadme(markdown, project));
          setReadmeState('ready');
        })
        .catch(() => active && setReadmeState('error'));
    }

    return () => { active = false; };
  }, [project]);

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) window.setTimeout(() => trigger?.focus(), 0);
  };

  return (
    <Dialog open={project !== null} onOpenChange={handleOpenChange}>
      {project && (
        <DialogContent className="project-sheet material">
          <div className="project-sheet-handle" aria-hidden="true" />
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
                        <DownloadIcon aria-hidden="true" /> Release page
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
