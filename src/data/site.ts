export const site = {
  name: 'Yoav Peretz',
  handle: '@masteryoav',
  description: 'Notes, build logs and shipped apps from Yoav Peretz: native macOS tools, cross-platform games and developer utilities.',
  email: 'realyoavperetz@gmail.com',
  avatar: 'https://github.com/masteryoav.png?size=240',
};

export const links = [
  { label: 'GitHub', href: 'https://github.com/masteryoav' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/yoav-peretz-320056376/' },
  { label: 'Email', href: `mailto:${site.email}` },
];

export const nav = [
  { label: 'Writing', href: '/posts' },
  { label: 'Projects', href: '/projects' },
  { label: 'About', href: '/about' },
];

export type Project = {
  id: string;
  name: string;
  category: string;
  platform: string;
  blurb: string;
  icon: string;
  accent: string;
  stack: string[];
  status?: string; // shown when the project isn't released yet
  repo?: string; // owner/name on GitHub
  gameUrl?: string;
};

// Newest activity first.
export const projects: Project[] = [
  {
    id: 'xbot',
    name: 'xBot',
    category: 'AI agents',
    platform: 'macOS',
    blurb: 'Your own AI coworkers on your own Mac: agents with their own computer, browser and files, running on a self-hosted OpenBot engine.',
    icon: '/project-icons/xbot.png',
    accent: '#9fe3ea',
    stack: ['Swift', 'SwiftUI', 'TypeScript', 'Docker', 'Postgres'],
    status: 'In development',
    repo: 'MasterYoav/xBot',
  },
  {
    id: 'seastar',
    name: 'SeaStar',
    category: 'Sea companion',
    platform: 'iPhone · Apple Watch',
    blurb: 'A free, native iPhone and Apple Watch companion for snorkelling, freediving and scuba, with offline logbooks and depth profiles.',
    icon: '/project-icons/seastar.png',
    accent: '#7fd6d0',
    stack: ['Swift', 'SwiftUI', 'Swift Charts', 'HealthKit'],
    status: 'In development',
    repo: 'MasterYoav/SEASTAR',
  },
  {
    id: 'claude-notch',
    name: 'Claude Notch',
    category: 'Developer utility',
    platform: 'macOS',
    blurb: 'Watch and steer Claude Code sessions from the notch: live status, approvals as buttons, context and cost at a glance.',
    icon: '/project-icons/claude-notch.png',
    accent: '#e8866a',
    stack: ['Swift', 'AppKit', 'Claude Code hooks'],
    repo: 'MasterYoav/claude-notch',
  },
  {
    id: 'skillfight',
    name: 'skillFight',
    category: 'AI tooling',
    platform: 'Terminal · Web',
    blurb: 'Points at your Claude skills, finds the ones fighting over the same requests, and stages the verdict as an ASCII arena.',
    icon: '/project-icons/skillfight.svg',
    accent: '#d66bf0',
    stack: ['TypeScript', 'React', 'Ink', 'Anthropic API'],
    repo: 'MasterYoav/skillFight',
  },
  {
    id: 'wolfence',
    name: 'Wolfence',
    category: 'Security',
    platform: 'CLI · macOS · Web',
    blurb: 'A security-first Git interface: wolf push scans outbound changes for secrets, vulnerabilities and risky config before they leave your machine.',
    icon: '/project-icons/wolfence.png',
    accent: '#8ea3c7',
    stack: ['Rust', 'Swift', 'Astro'],
    repo: 'MasterYoav/wolfence',
  },
  {
    id: 'icesniff',
    name: 'IceSniff',
    category: 'Packet analysis',
    platform: 'macOS · CLI · Web',
    blurb: 'A modern packet analysis stack: one Rust engine behind a native SwiftUI app, a terminal UI and a local web app.',
    icon: 'https://raw.githubusercontent.com/MasterYoav/IceSniff/main/docs/media/icon.png',
    accent: '#91e6ff',
    stack: ['Rust', 'Swift', 'SwiftUI', 'Supabase'],
    repo: 'MasterYoav/IceSniff',
  },
  {
    id: 'dragon',
    name: 'Dragon',
    category: 'Desktop utility',
    platform: 'macOS',
    blurb: 'A notch and menu bar utility for staging files and running fast actions without leaving your workspace.',
    icon: 'https://raw.githubusercontent.com/MasterYoav/Dragon/main/Dragon/Assets.xcassets/Dragon.appiconset/Dragon-macOS-Default-1024x1024@1x.png',
    accent: '#f2b05f',
    stack: ['Swift', 'SwiftUI', 'AppKit', 'ffmpeg'],
    repo: 'MasterYoav/Dragon',
  },
  {
    id: 'worklog',
    name: 'WorkLog Mobile',
    category: 'Team operations',
    platform: 'iOS · Android',
    blurb: 'A mobile work-tracking app for attendance, projects and employer–worker flows, with offline punches that sync later.',
    icon: 'https://raw.githubusercontent.com/MasterYoav/WorkLog/main/assets/images/icon.png',
    accent: '#79ef88',
    stack: ['TypeScript', 'React Native', 'Expo', 'Supabase'],
    repo: 'MasterYoav/WorkLog',
  },
  {
    id: 'hnefatafl',
    name: 'Hnefatafl',
    category: 'Strategy game',
    platform: 'Desktop · Android',
    blurb: 'A modern take on the old Viking chess, with native installers for every desktop OS and an Android build.',
    icon: 'https://raw.githubusercontent.com/MasterYoav/Hnefatafl/main/assets/icon-1024.png',
    accent: '#c7b8ff',
    stack: ['Kotlin', 'Compose Multiplatform', 'Gradle'],
    repo: 'MasterYoav/Hnefatafl',
  },
  {
    id: 'cluck-invaders',
    name: 'Cluck Invaders',
    category: 'Browser game',
    platform: 'Browser',
    blurb: 'A chicken-themed space shooter with homing missiles, spread weapons, boss waves and a fireblast special. Vanilla Canvas 2D.',
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🐔</text></svg>",
    accent: '#ffeb3b',
    stack: ['JavaScript', 'Canvas 2D'],
    gameUrl: '/cluck-invaders.html',
  },
];
