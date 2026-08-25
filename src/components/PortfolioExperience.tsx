import * as React from 'react';
import { useEffect, useState } from 'react';

import type { AppearancePreference, ResolvedTheme } from '@/lib/appearance';
import { readAppearancePreference, resolveTheme } from '@/lib/appearance';
import type { Project } from '@/lib/projects';

import { AppearanceControl } from './AppearanceControl';
import { ProjectCarousel } from './ProjectCarousel';
import { ProjectSheet } from './ProjectSheet';

const appearanceKey = 'portfolio-appearance';

export function PortfolioExperience({ projects }: { projects: Project[] }) {
  const [appearance, setAppearance] = useState<AppearancePreference>('system');
  const [appearanceReady, setAppearanceReady] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectTrigger, setProjectTrigger] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let storedValue: string | null = null;

    try {
      storedValue = localStorage.getItem(appearanceKey);
    } catch {
      // Storage can be unavailable in privacy-restricted contexts.
    }

    setAppearance(readAppearancePreference(storedValue));
    setAppearanceReady(true);
  }, []);

  useEffect(() => {
    if (!appearanceReady) return;

    const colourScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      const theme: ResolvedTheme = resolveTheme(appearance, colourScheme.matches);
      document.documentElement.dataset.theme = theme;
    };

    applyTheme();

    try {
      localStorage.setItem(appearanceKey, appearance);
    } catch {
      // The selected theme still applies for the current visit.
    }

    if (appearance !== 'system') return;

    colourScheme.addEventListener('change', applyTheme);
    return () => colourScheme.removeEventListener('change', applyTheme);
  }, [appearance, appearanceReady]);

  return (
    <div className="portfolio-experience">
      <header className="top-bar material" aria-label="Primary">
        <a className="brand-mark" href="#home" aria-label="Yoav Peretz, home">
          <img src="/profile.png" alt="Yoav Peretz" />
        </a>
        <nav className="top-nav" aria-label="Portfolio">
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="top-actions">
          <a href="https://github.com/masteryoav" target="_blank" rel="noreferrer" className="top-icon-link" aria-label="Open Yoav Peretz on GitHub" title="GitHub">
            <GitHubIcon />
          </a>
          <a href="https://www.linkedin.com/in/yoav-peretz-320056376/" target="_blank" rel="noreferrer" className="top-icon-link" aria-label="Open Yoav Peretz on LinkedIn" title="LinkedIn">
            <LinkedInIcon />
          </a>
          <AppearanceControl value={appearance} onChange={setAppearance} />
        </div>
      </header>

      <main>
        <section className="hero-section page-section" id="home">
          <div className="hero-copy-block">
            <p className="eyebrow">Independent software engineer</p>
            <h1>I build software that earns its place.</h1>
            <p className="hero-summary">
              Focused native apps, developer tools, and playful experiments—designed with care
              and shipped for real use.
            </p>
            <div className="hero-actions">
              <a className="primary-action" href="#work">Explore the work</a>
              <a className="secondary-action" href="mailto:realyoavperetz@gmail.com">Start a conversation</a>
            </div>
          </div>
          <p className="hero-proof" aria-label={`${projects.length} shipped projects`}>
            <strong>{projects.length}</strong>
            <span>shipped projects across desktop, mobile, web, and the command line.</span>
          </p>
        </section>

        <section className="work-section page-section" id="work" aria-labelledby="work-title">
          <div className="section-intro">
            <p className="eyebrow">Selected work</p>
            <h2 id="work-title">Useful products, shaped end to end.</h2>
          </div>
          <ProjectCarousel
            projects={projects}
            onSelect={(project, trigger) => {
              setProjectTrigger(trigger);
              setSelectedProject(project);
            }}
          />
        </section>

        <section className="about-section page-section" id="about" aria-labelledby="about-title">
          <div className="section-intro">
            <p className="eyebrow">About</p>
            <h2 id="about-title">Native feeling. Practical reach.</h2>
          </div>
          <div className="about-copy">
            <p>
              I turn small, stubborn problems into focused software—from packet analysis and
              menu bar utilities to mobile workflows and games.
            </p>
            <p>
              The stack changes with the product. The standard does not: clear interaction,
              thoughtful detail, and software people can actually use.
            </p>
          </div>
        </section>

        <section className="contact-section page-section" id="contact" aria-labelledby="contact-title">
          <p className="eyebrow">Contact</p>
          <h2 id="contact-title">Have something worth making?</h2>
          <a className="contact-email" href="mailto:realyoavperetz@gmail.com">
            realyoavperetz@gmail.com
          </a>
          <div className="social-links" aria-label="Social links">
            <a href="https://github.com/masteryoav" target="_blank" rel="noreferrer">GitHub</a>
            <a href="https://www.linkedin.com/in/yoav-peretz-320056376/" target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <span>Yoav Peretz</span>
        <span>Built for the web, grounded in native craft.</span>
      </footer>

      <ProjectSheet
        project={selectedProject}
        trigger={projectTrigger}
        onOpenChange={(open) => {
          if (!open) setSelectedProject(null);
        }}
      />
    </div>
  );
}

function GitHubIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.18-3.37-1.18-.46-1.15-1.11-1.45-1.11-1.45-.9-.62.07-.61.07-.61 1 .07 1.52 1 1.52 1 .89 1.5 2.33 1.07 2.9.82.09-.63.35-1.07.63-1.31-2.22-.25-4.56-1.1-4.56-4.92 0-1.09.4-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.26 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.28 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.83-2.34 4.66-4.57 4.91.36.31.68.91.68 1.84v2.73c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" /></svg>;
}

function LinkedInIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M20.45 2H3.55A1.55 1.55 0 0 0 2 3.55v16.9A1.55 1.55 0 0 0 3.55 22h16.9A1.55 1.55 0 0 0 22 20.45V3.55A1.55 1.55 0 0 0 20.45 2ZM8.1 18.9H5.1V9.25h3Zm-1.5-11A1.75 1.75 0 1 1 6.6 4.4a1.75 1.75 0 0 1 0 3.5Zm12.35 11h-3v-4.7c0-1.12 0-2.57-1.57-2.57s-1.81 1.22-1.81 2.49v4.78h-3V9.25h2.88v1.32h.04a3.16 3.16 0 0 1 2.85-1.57c3.04 0 3.6 2 3.6 4.6Z" /></svg>;
}
