"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface GooeyNavItem {
  label: string;
  href: string;
}

export interface GooeyNavProps {
  items: GooeyNavItem[];
  animationTime?: number;
  particleCount?: number;
  particleDistances?: [number, number];
  particleR?: number;
  timeVariance?: number;
  colors?: number[];
  initialActiveIndex?: number;
  theme?: "light" | "dark";

  /**
   * Optional hook:
   * If provided, navigation is delegated to the parent (e.g. open a modal).
   */
  onSelect?: (index: number, item: GooeyNavItem) => void;
}

/**
 * Small deterministic PRNG (so we don't use Math.random in render scope)
 */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const GooeyNav: React.FC<GooeyNavProps> = ({
  items,
  animationTime = 600,
  particleCount = 15,
  particleDistances = [90, 10],
  particleR = 100,
  timeVariance = 300,
  colors = [1, 2, 3, 1, 2, 3, 1, 4],
  initialActiveIndex = 0,
  theme = "light",
  onSelect,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLUListElement>(null);
  const filterRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  const [activeIndex, setActiveIndex] = useState<number>(initialActiveIndex);

  // ✅ IMPORTANT: do NOT show "pressed" state until the user actually interacts
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  // Seed once (stable across renders) so lint/hydration stays calm.
  const rng = useRef<() => number>(() => 0.5);
  useEffect(() => {
    const seed = 123456 + items.length * 999 + initialActiveIndex * 17;
    rng.current = mulberry32(seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rand = () => rng.current();

  const noise = (n = 1) => n / 2 - rand() * n;

  const getXY = (
    distance: number,
    pointIndex: number,
    totalPoints: number,
  ): [number, number] => {
    const angle =
      ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
    return [distance * Math.cos(angle), distance * Math.sin(angle)];
  };

  const createParticle = (
    i: number,
    t: number,
    d: [number, number],
    r: number,
  ) => {
    const rotate = noise(r / 10);
    return {
      start: getXY(d[0], particleCount - i, particleCount),
      end: getXY(d[1] + noise(7), particleCount - i, particleCount),
      time: t,
      scale: 1 + noise(0.2),
      color: colors[Math.floor(rand() * colors.length)],
      rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10,
    };
  };

  const makeParticles = (element: HTMLElement) => {
    const d: [number, number] = particleDistances;
    const r = particleR;
    const bubbleTime = animationTime * 2 + timeVariance;
    element.style.setProperty("--time", `${bubbleTime}ms`);

    for (let i = 0; i < particleCount; i++) {
      const t = animationTime * 2 + noise(timeVariance * 2);
      const p = createParticle(i, t, d, r);

      element.classList.remove("active");

      setTimeout(() => {
        const particle = document.createElement("span");
        const point = document.createElement("span");

        particle.classList.add("particle");
        point.classList.add("point");

        particle.style.setProperty("--start-x", `${p.start[0]}px`);
        particle.style.setProperty("--start-y", `${p.start[1]}px`);
        particle.style.setProperty("--end-x", `${p.end[0]}px`);
        particle.style.setProperty("--end-y", `${p.end[1]}px`);
        particle.style.setProperty("--time", `${p.time}ms`);
        particle.style.setProperty("--scale", `${p.scale}`);
        particle.style.setProperty("--color", `var(--color-${p.color})`);
        particle.style.setProperty("--rotate", `${p.rotate}deg`);

        particle.appendChild(point);
        element.appendChild(particle);

        requestAnimationFrame(() => element.classList.add("active"));

        setTimeout(() => {
          try {
            element.removeChild(particle);
          } catch {}
        }, t);
      }, 30);
    }
  };

  const updateEffectPosition = (element: HTMLElement) => {
    if (!containerRef.current || !filterRef.current || !textRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const pos = element.getBoundingClientRect();

    const styles = {
      left: `${pos.x - containerRect.x}px`,
      top: `${pos.y - containerRect.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`,
    };

    Object.assign(filterRef.current.style, styles);
    Object.assign(textRef.current.style, styles);
    textRef.current.innerText = element.innerText;
  };

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    index: number,
  ) => {
    e.preventDefault();

    // ✅ first interaction enables the "pressed" effect from now on
    if (!hasInteracted) setHasInteracted(true);

    const aEl = e.currentTarget;
    const item = items[index];
    const href = item?.href;

    // ✅ Always update visuals after first interaction
    setActiveIndex(index);
    updateEffectPosition(aEl);

    filterRef.current?.querySelectorAll(".particle").forEach((p) => p.remove());
    if (filterRef.current) makeParticles(filterRef.current);

    if (textRef.current) {
      textRef.current.classList.remove("active");
      void textRef.current.offsetWidth;
      textRef.current.classList.add("active");
    }

    filterRef.current?.classList.add("active");
    textRef.current?.classList.add("active");

    // ✅ Delegate selection to parent (modal, etc.)
    if (onSelect && item) {
      onSelect(index, item);
      return;
    }

    // ✅ Default behavior: navigate / scroll
    if (!href) return;

    if (href.startsWith("#")) {
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", href);
      }
      return;
    }

    window.location.assign(href);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLAnchorElement>,
    index: number,
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      (e.currentTarget as HTMLAnchorElement).click();
    }
  };

  // ✅ Position overlay only AFTER user interacted
  useLayoutEffect(() => {
    if (!navRef.current || !containerRef.current) return;

    // 🚫 No pill on first paint until user interacts
    if (!hasInteracted) {
      filterRef.current?.classList.remove("active");
      textRef.current?.classList.remove("active");
      if (textRef.current) textRef.current.innerText = "";
      return;
    }

    const activeLi = navRef.current.querySelectorAll("li")[
      activeIndex
    ] as HTMLElement;

    if (activeLi) {
      updateEffectPosition(activeLi);
      filterRef.current?.classList.add("active");
      textRef.current?.classList.add("active");
    }

    const resizeObserver = new ResizeObserver(() => {
      const currentActiveLi = navRef.current?.querySelectorAll("li")[
        activeIndex
      ] as HTMLElement;
      if (currentActiveLi) updateEffectPosition(currentActiveLi);
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [activeIndex, theme, hasInteracted]);

  // Theme vars (changes the gooey colors cleanly)
  const themeVars = useMemo(() => {
    if (theme === "dark") {
      return {
        "--nav-text": "white",
        "--nav-text-shadow": "0 1px 1px rgba(0,0,0,0.35)",
        "--pill-bg": "white",
        "--pill-text": "black",
        "--color-1": "rgba(255,255,255,0.95)",
        "--color-2": "rgba(255,255,255,0.90)",
        "--color-3": "rgba(255,255,255,0.85)",
        "--color-4": "rgba(255,255,255,0.80)",
      } as React.CSSProperties;
    }

    return {
      "--nav-text": "black",
      "--nav-text-shadow": "0 1px 1px rgba(0,0,0,0.10)",
      "--pill-bg": "black",
      "--pill-text": "white",
      "--color-1": "rgba(0,0,0,0.90)",
      "--color-2": "rgba(0,0,0,0.85)",
      "--color-3": "rgba(0,0,0,0.80)",
      "--color-4": "rgba(0,0,0,0.75)",
    } as React.CSSProperties;
  }, [theme]);

  return (
    <>
      <style>
        {`
          :root {
            --linear-ease: linear(
              0, 0.068, 0.19 2.7%, 0.804 8.1%, 1.037, 1.199 13.2%, 1.245,
              1.27 15.8%, 1.274, 1.272 17.4%, 1.249 19.1%, 0.996 28%, 0.949,
              0.928 33.3%, 0.926, 0.933 36.8%, 1.001 45.6%, 1.013, 1.019 50.8%,
              1.018 54.4%, 1 63.1%, 0.995 68%, 1.001 85%, 1
            );
          }

          .effect {
            position: absolute;
            pointer-events: none;
            display: grid;
            place-items: center;
            z-index: 1;
          }

          .effect.text {
            color: var(--nav-text);
            transition: color 0.2s ease;
            font-weight: 600;
          }

          .effect.text.active {
            color: var(--pill-text);
          }

          .effect.filter {
            border-radius: 9999px;
            overflow: hidden;
            filter: blur(10px) contrast(25);
            mix-blend-mode: normal;
          }

          .effect.filter::before {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: 9999px;
            background: transparent;
          }

          .effect.filter::after {
            content: "";
            position: absolute;
            inset: 0;
            background: var(--pill-bg);
            transform: scale(0);
            opacity: 0;
            z-index: -1;
            border-radius: 9999px;
          }

          .effect.active::after {
            animation: pill 0.22s ease both;
          }

          @keyframes pill {
            to {
              transform: scale(1);
              opacity: 1;
            }
          }

          .particle,
          .point {
            display: block;
            opacity: 0;
            width: 18px;
            height: 18px;
            border-radius: 9999px;
            transform-origin: center;
          }

          .particle {
            --time: 5s;
            position: absolute;
            top: calc(50% - 9px);
            left: calc(50% - 9px);
            animation: particle calc(var(--time)) ease 1 -350ms;
          }

          .point {
            background: var(--color);
            opacity: 1;
            animation: point calc(var(--time)) ease 1 -350ms;
          }

          @keyframes particle {
            0% {
              transform: rotate(0deg) translate(var(--start-x), var(--start-y));
              opacity: 1;
              animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45);
            }
            70% {
              transform: rotate(calc(var(--rotate) * 0.5)) translate(calc(var(--end-x) * 1.2), calc(var(--end-y) * 1.2));
              opacity: 1;
              animation-timing-function: ease;
            }
            85% {
              transform: rotate(calc(var(--rotate) * 0.66)) translate(var(--end-x), var(--end-y));
              opacity: 1;
            }
            100% {
              transform: rotate(calc(var(--rotate) * 1.2)) translate(calc(var(--end-x) * 0.5), calc(var(--end-y) * 0.5));
              opacity: 1;
            }
          }

          @keyframes point {
            0% {
              transform: scale(0);
              opacity: 0;
              animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45);
            }
            25% {
              transform: scale(calc(var(--scale) * 0.25));
            }
            38% {
              opacity: 1;
            }
            65% {
              transform: scale(var(--scale));
              opacity: 1;
              animation-timing-function: ease;
            }
            85% {
              transform: scale(var(--scale));
              opacity: 1;
            }
            100% {
              transform: scale(0);
              opacity: 0;
            }
          }

          li.active {
            color: var(--pill-text);
            text-shadow: none;
          }

          /* IMPORTANT: remove any default active background frame */
          li::after {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: 9999px;
            background: transparent;
            opacity: 0;
            transform: scale(0);
            transition: all 0.2s ease;
            z-index: -1;
          }
        `}
      </style>

      <div className="relative" ref={containerRef} style={themeVars}>
        <nav
          className="flex relative"
          style={{ transform: "translate3d(0,0,0.01px)" }}
        >
          <ul
            ref={navRef}
            className="flex gap-8 list-none p-0 px-4 m-0 relative z-[3]"
            style={{
              color: "var(--nav-text)" as any,
              textShadow: "var(--nav-text-shadow)" as any,
            }}
          >
            {items.map((item, index) => (
              <li
                key={index}
                className={`rounded-full relative cursor-pointer transition-[color] duration-200 ease text-[var(--nav-text)] ${
                  hasInteracted && activeIndex === index ? "active" : ""
                }`}
              >
                <a
                  href={item.href}
                  onClick={(e) => handleClick(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="outline-none focus:outline-none focus-visible:outline-none py-[0.6em] px-[1em] inline-block select-none"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <span className="effect filter" ref={filterRef} />
        <span className="effect text" ref={textRef} />
      </div>
    </>
  );
};

export default GooeyNav;
