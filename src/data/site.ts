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
  repo?: string; // owner/name on GitHub
  gameUrl?: string;
};

export const projects: Project[] = [
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
