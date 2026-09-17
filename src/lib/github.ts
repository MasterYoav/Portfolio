import { marked } from 'marked';

const headers: Record<string, string> = import.meta.env.GITHUB_TOKEN
  ? { Authorization: `Bearer ${import.meta.env.GITHUB_TOKEN}` }
  : {};

export type Download = { os: 'macOS' | 'Windows' | 'Linux' | 'Android'; url: string; name: string };
export type Release = { tag: string; date: string; url: string; downloads: Download[] };

const osFor = (file: string): Download['os'] | null => {
  const ext = file.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'dmg' || ext === 'pkg') return 'macOS';
  if (ext === 'exe' || ext === 'msi') return 'Windows';
  if (['deb', 'appimage', 'rpm'].includes(ext)) return 'Linux';
  if (ext === 'apk') return 'Android';
  return null;
};

/** Latest release with one installer per OS. Build-time only; null when offline or none exist. */
export async function latestRelease(repo: string): Promise<Release | null> {
  try {
    const api = `https://api.github.com/repos/${repo}/releases?per_page=5`;
    let res = await fetch(api, { headers });
    if (res.status === 401) res = await fetch(api); // stale token: public repos don't need one
    if (!res.ok) { console.warn('[github] releases', repo, res.status); return null; }
    for (const r of await res.json()) {
      const seen = new Set<string>();
      const downloads: Download[] = [];
      for (const a of r.assets ?? []) {
        const os = osFor(a.name);
        if (!os || seen.has(os) || a.state !== 'uploaded') continue;
        seen.add(os);
        downloads.push({ os, url: a.browser_download_url, name: a.name });
      }
      const order = ['macOS', 'Windows', 'Linux', 'Android'];
      downloads.sort((a, b) => order.indexOf(a.os) - order.indexOf(b.os));
      if (downloads.length) return { tag: r.tag_name, date: r.published_at, url: r.html_url, downloads };
    }
  } catch (e) { console.warn('[github] releases', repo, e); }
  return null;
}

/** README rendered to HTML with repo-relative links and images resolved. */
export async function readmeHtml(repo: string): Promise<string | null> {
  const raw = `https://raw.githubusercontent.com/${repo}/HEAD/`;
  const blob = `https://github.com/${repo}/blob/HEAD/`;
  try {
    const res = await fetch(`${raw}README.md`);
    if (!res.ok) return null;
    // ponytail: no sanitizer, the READMEs come from the author's own repos at build time. Add DOMPurify+jsdom if third-party repos appear.
    let html = await marked.parse(await res.text(), { gfm: true });
    const resolve = (base: string) => (_: string, attr: string, url: string) =>
      /^(https?:|mailto:|#|data:|\/\/)/i.test(url) || url.startsWith('/')
        ? `${attr}="${url.startsWith('/') && !url.startsWith('//') ? `https://github.com/${repo}` : url}"`
        : `${attr}="${base}${url.replace(/^\.\//, '')}"`;
    html = html
      .replace(/(src)="([^"]+)"/g, resolve(raw))
      .replace(/(href)="([^"]+)"/g, resolve(blob))
      .replace(/<a /g, '<a target="_blank" rel="noreferrer" ')
      .replace(/<img /g, '<img loading="lazy" decoding="async" ')
      // Group paragraphs made only of shield badges into one inline row.
      .replace(/<p>((?:\s*(?:<a [^>]*>)?<img [^>]*(?:shields\.io|badge)[^>]*>(?:<\/a>)?\s*)+)<\/p>/g, '<p class="badges">$1</p>');
    return html;
  } catch {
    return null;
  }
}
