# Adaptive Apple-Inspired Portfolio Redesign

## Purpose

Rebuild the personal portfolio as an adaptive product gallery that makes two actions effortless: explore shipped applications and download them. Contact remains always available as a clear secondary path.

The experience must adapt to the visitor's device and appearance preference without losing a single, recognisable identity. It is inspired by Apple interface principles—clarity, direct manipulation, material hierarchy, and restrained motion—rather than reproducing an Apple product page.

## Audience and success

- Recruiters and hiring managers should be able to grasp the developer's capability and reach a real project quickly.
- Developers and collaborators should be able to inspect work, source, and delivery quality.
- Primary conversion: an application download or project exploration.
- Secondary conversion: email, GitHub, or LinkedIn contact.

## Content model

The existing project entries remain the factual source of truth: IceSniff, Dragon, WorkLog Mobile, Hnefatafl, and Cluck Invaders. Their wording and on-page presentation will be rewritten from scratch.

Each project supplies:

- name, category, supported platforms, icon, and accent;
- a one-sentence product promise and concise capability bullets;
- repository and README source;
- optional local game URL;
- release metadata for resolving platform-specific download links.

README content remains a supporting detail inside the project sheet. It must not carry the primary product story.

## Page structure

1. **Floating top bar.** Name/monogram, Work/About/Contact anchors, and a three-state appearance control.
2. **Hero.** A new concise positioning statement, short proof-oriented copy, and direct actions for browsing work and making contact.
3. **Featured work.** A lead project treatment followed by the project carousel.
4. **Project detail sheet.** Product story, capabilities, platform-specific downloads, source link, and README detail.
5. **About.** A focused statement of craft, platforms, and technical range.
6. **Contact.** Email as the main action with GitHub and LinkedIn alongside it.

No invented statistics, testimonials, client logos, blog, or decorative feature grids are in scope.

## Project carousel

Use the Shadcn Carousel component, backed by Embla, as the shared project-browser primitive.

- A desktop viewport shows one prominent card plus a deliberate preview of the next card.
- Each card is a rounded product surface with app icon/art, category, name, platform signal, short promise, and direct download action.
- The first/featured item is visually larger, but all projects share the same interaction model.
- Desktop supports visible controls, mouse/trackpad scrolling, keyboard navigation, and click/tap selection.
- Touch devices use swipe navigation and retain adequate tap targets for card actions.
- Selecting a card opens its associated detail sheet. The detail view provides the full product story; carousel cards remain concise.

The carousel is not an auto-playing slideshow and must not steal page scroll or focus.

## Adaptive layout

### Desktop and large screens

- Spacious, editorial layout with a maximum reading width and generous vertical rhythm.
- Floating, translucent top bar overlays scrolling content.
- Project carousel has edge-peeking cards and explicit previous/next controls.
- Project details open as a centred material sheet with a dimmed backdrop.

### Phone and touch-first screens

- Top bar prioritises the appearance control and a compact navigation affordance.
- Carousel cards use full-width, thumb-friendly geometry and horizontal swipe.
- Project details open as a bottom sheet with a visible drag handle and an explicit close control.
- Sheets support a natural swipe-down dismissal without preventing normal content scrolling.

### Medium screens

- Use the desktop information architecture with the compact card width and sheet layout selected by available space, not device name.

## Appearance and materials

### Theme preference

The appearance control has **System**, **Light**, and **Dark** modes. System is the default. A chosen Light or Dark mode persists in local storage and takes precedence over `prefers-color-scheme`; System follows it again.

Light and dark are first-class palettes, not inverted versions of one another. Both must meet WCAG AA contrast for normal text and controls.

### Typography

- Use the platform system font stack, so Apple devices use SF Pro where installed and other platforms retain their native text character.
- Large display type receives tight tracking and short leading; body copy uses normal tracking and comfortable leading.
- Spacing, type, and touch targets use responsive units so text scaling does not fracture layout.

### Material hierarchy

- The background is quiet and subtly dimensional, never a full-page visual effect competing with content.
- Top chrome uses the lightest translucent material appropriate to the active theme.
- Project cards are denser, more solid material surfaces.
- Detail sheets use the heaviest material plus a dimming backdrop.
- Project accents appear in restrained local glows, icon stages, and focus states rather than tinting whole pages.

## Interaction and motion

- Press feedback begins on pointer down. Buttons and cards receive a small, immediate scale or material response.
- Use spring-driven motion for card expansion and interactive sheets. Default transitions are critically damped; only a gesture release may introduce slight momentum bounce.
- Card-to-detail transitions originate from the selected card and reverse on dismissal.
- The carousel uses the Shadcn/Embla interaction model; no custom gesture engine is needed.
- Motion uses transform and opacity only where possible.
- No cursor effects, autoplay, scroll hijacking, or perpetual decorative animation.

## Accessibility and resilience

- Honour `prefers-reduced-motion` with opacity-based transitions and no swipe/scroll-derived visual effects.
- Honour `prefers-reduced-transparency` with more opaque material surfaces and reduced blur.
- Honour `prefers-contrast: more` with solid backgrounds and explicit borders.
- All carousel controls, card actions, appearance controls, and sheet dismissal must be keyboard accessible and clearly labelled.
- Focus moves into an opened detail sheet and returns to the originating project card on close.
- Existing GitHub README sanitisation and release resolution remain. Network failures show concise, non-blocking fallback messages while keeping repository and release-page links usable.

## Implementation boundaries

- Add Shadcn and only the primitives that are actually used: Carousel first, with an appearance-menu primitive and a sheet/dialog primitive only if they reduce custom code.
- Preserve the existing Astro + React runtime and existing release/README integration. Do not introduce a CMS, backend, analytics, or image pipeline.
- Replace the existing one-off app shelf and oversized page script with small, focused React components around the carousel, appearance control, and project details. Keep project data in one source of truth.
- Remove unused starter or superseded components when their replacement is live.

## Verification

- Build succeeds with `npm run build`.
- Verify light, dark, and system appearance resolution and stored preference.
- Verify carousel buttons, keyboard navigation, card selection, and direct download links.
- Verify touch layout and sheet affordances at a narrow viewport.
- Verify project dialog/sheet focus handling and reduced-motion/reduced-transparency styles.
- Verify GitHub README rendering and graceful network-failure states.
