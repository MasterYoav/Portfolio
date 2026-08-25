import * as React from 'react';
import { useEffect, useState } from 'react';

import type { AppearancePreference, ResolvedTheme } from '@/lib/appearance';
import { readAppearancePreference, resolveTheme } from '@/lib/appearance';
import type { Project } from '@/lib/projects';

import { AppearanceControl } from './AppearanceControl';
import { ProjectCarousel } from './ProjectCarousel';

const appearanceKey = 'portfolio-appearance';

export function PortfolioExperience({ projects }: { projects: Project[] }) {
  const [appearance, setAppearance] = useState<AppearancePreference>('system');
  const [appearanceReady, setAppearanceReady] = useState(false);

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
          YP
        </a>
        <nav className="top-nav" aria-label="Portfolio">
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
        <AppearanceControl value={appearance} onChange={setAppearance} />
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
          <ProjectCarousel projects={projects} onSelect={() => undefined} />
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
    </div>
  );
}
