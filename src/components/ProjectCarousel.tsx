import * as React from 'react';
import { DownloadIcon, ExternalLinkIcon, PlayIcon } from 'lucide-react';
import type { CSSProperties } from 'react';

import type { Project } from '../lib/projects';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './ui/carousel';

export function ProjectCarousel({
  projects,
  onSelect,
}: {
  projects: Project[];
  onSelect: (project: Project, trigger: HTMLButtonElement) => void;
}): React.JSX.Element {
  return (
    <Carousel opts={{ align: 'start' }} className="project-carousel" aria-label="Projects">
      <CarouselContent>
        {projects.map((project, index) => {
          const actionUrl = project.gameUrl ?? project.releaseUrl ?? project.repoUrl;
          const actionLabel = project.gameUrl
            ? `Play ${project.name}`
            : project.releaseUrl
              ? `Download ${project.name}`
              : `View ${project.name} source`;

          return (
            <CarouselItem key={project.id} className="project-carousel-item">
              <article
                className="project-card"
                style={{ '--project-accent': project.accent } as CSSProperties}
              >
                <button
                  type="button"
                  className="project-card-main"
                  aria-label={`Open ${project.name}`}
                  onClick={(event) => onSelect(project, event.currentTarget)}
                >
                  <span className="project-card-art" aria-hidden="true">
                    <img
                      src={project.icon}
                      alt=""
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                  </span>
                  <span className="project-card-copy">
                    <span className="project-card-category">{project.category}</span>
                    <strong>{project.name}</strong>
                    <span className="project-card-platforms">{project.platforms.join(' · ')}</span>
                    <span className="project-card-summary">{project.summary}</span>
                  </span>
                  <span className="project-card-open" aria-hidden="true">
                    View project <ExternalLinkIcon />
                  </span>
                </button>

                {actionUrl && (
                  <a
                    className="project-card-action"
                    href={actionUrl}
                    aria-label={actionLabel}
                    target={actionUrl.startsWith('http') ? '_blank' : undefined}
                    rel={actionUrl.startsWith('http') ? 'noreferrer' : undefined}
                  >
                    {project.gameUrl ? (
                      <PlayIcon aria-hidden="true" />
                    ) : project.releaseUrl ? (
                      <DownloadIcon aria-hidden="true" />
                    ) : (
                      <ExternalLinkIcon aria-hidden="true" />
                    )}
                    <span>{actionLabel}</span>
                  </a>
                )}
              </article>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious
        className="project-carousel-control project-carousel-previous"
        aria-label="Previous project"
      />
      <CarouselNext
        className="project-carousel-control project-carousel-next"
        aria-label="Next project"
      />
    </Carousel>
  );
}
