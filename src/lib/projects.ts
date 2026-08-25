export type Project = {
  id: string;
  name: string;
  category: string;
  platforms: string[];
  summary: string;
  highlights: string[];
  icon: string;
  accent: string;
  repoUrl?: string;
  readmeUrl?: string;
  rawBaseUrl?: string;
  blobBaseUrl?: string;
  releaseUrl?: string;
  gameUrl?: string;
};

export const projects: Project[] = [
  {
    id: 'icesniff',
    name: 'IceSniff',
    category: 'Packet analysis',
    platforms: ['macOS', 'CLI', 'Web'],
    summary: 'Inspect packets across native desktop, terminal, and web surfaces.',
    highlights: ['Native macOS capture workflow', 'Browser and CLI companions'],
    icon: 'https://raw.githubusercontent.com/MasterYoav/IceSniff/main/docs/media/icon.png',
    accent: '#91e6ff',
    repoUrl: 'https://github.com/MasterYoav/IceSniff',
    releaseUrl: 'https://github.com/MasterYoav/IceSniff/releases/latest',
    readmeUrl: 'https://raw.githubusercontent.com/MasterYoav/IceSniff/main/README.md',
    rawBaseUrl: 'https://raw.githubusercontent.com/MasterYoav/IceSniff/main/',
    blobBaseUrl: 'https://github.com/MasterYoav/IceSniff/blob/main/',
  },
  {
    id: 'dragon',
    name: 'Dragon',
    category: 'Desktop utility',
    platforms: ['macOS'],
    summary: 'Stage files from the notch and trigger fast actions from the menu bar.',
    highlights: ['Notch-based file staging', 'Quick menu bar actions'],
    icon: 'https://raw.githubusercontent.com/MasterYoav/Dragon/main/Dragon/Assets.xcassets/Dragon.appiconset/Dragon-macOS-Default-1024x1024@1x.png',
    accent: '#f2b05f',
    repoUrl: 'https://github.com/MasterYoav/Dragon',
    releaseUrl: 'https://github.com/MasterYoav/Dragon/releases/latest',
    readmeUrl: 'https://raw.githubusercontent.com/MasterYoav/Dragon/main/README.md',
    rawBaseUrl: 'https://raw.githubusercontent.com/MasterYoav/Dragon/main/',
    blobBaseUrl: 'https://github.com/MasterYoav/Dragon/blob/main/',
  },
  {
    id: 'worklog',
    name: 'WorkLog Mobile',
    category: 'Team operations',
    platforms: ['iOS', 'Android'],
    summary: 'Keep teams aligned on time, projects, and employer-worker workflows.',
    highlights: ['Attendance and project tracking', 'Employer-worker coordination'],
    icon: 'https://raw.githubusercontent.com/MasterYoav/WorkLog/main/assets/images/icon.png',
    accent: '#79ef88',
    repoUrl: 'https://github.com/MasterYoav/WorkLog',
    releaseUrl: 'https://github.com/MasterYoav/WorkLog/archive/refs/heads/main.zip',
    readmeUrl: 'https://raw.githubusercontent.com/MasterYoav/WorkLog/main/README.md',
    rawBaseUrl: 'https://raw.githubusercontent.com/MasterYoav/WorkLog/main/',
    blobBaseUrl: 'https://github.com/MasterYoav/WorkLog/blob/main/',
  },
  {
    id: 'hnefatafl',
    name: 'Hnefatafl',
    category: 'Strategy game',
    platforms: ['Desktop', 'Android'],
    summary: 'Command a modern Norse strategy game across desktop and Android.',
    highlights: ['Native installers', 'Compose desktop build'],
    icon: 'https://raw.githubusercontent.com/MasterYoav/Hnefatafl/main/assets/icon-1024.png',
    accent: '#c7b8ff',
    repoUrl: 'https://github.com/MasterYoav/Hnefatafl',
    releaseUrl: 'https://github.com/MasterYoav/Hnefatafl/releases/latest',
    readmeUrl: 'https://raw.githubusercontent.com/MasterYoav/Hnefatafl/main/README.md',
    rawBaseUrl: 'https://raw.githubusercontent.com/MasterYoav/Hnefatafl/main/',
    blobBaseUrl: 'https://github.com/MasterYoav/Hnefatafl/blob/main/',
  },
  {
    id: 'cluck-invaders',
    name: 'Cluck Invaders',
    category: 'Browser game',
    platforms: ['Browser'],
    summary: 'Pilot a playful Canvas shooter packed with homing missiles and boss waves.',
    highlights: ['Homing and spread weapons', 'Boss waves and fireblast special'],
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🐔</text></svg>",
    accent: '#ffeb3b',
    gameUrl: '/cluck-invaders.html',
  },
];
