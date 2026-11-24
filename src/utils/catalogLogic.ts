import type {
  Category,
  LearningTrail,
  SortOption,
  VideoTutorial,
} from '../types/helpCenter';

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\|\s*Meu ERP Web/gi, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function parseDurationSeconds(duration: string): number {
  const parts = duration
    .trim()
    .split(':')
    .map((p) => Number.parseInt(p, 10))
    .filter((n) => !Number.isNaN(n));
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

const PT_MONTHS: Record<string, number> = {
  jan: 0,
  fev: 1,
  mar: 2,
  abr: 3,
  mai: 4,
  jun: 5,
  jul: 6,
  ago: 7,
  set: 8,
  out: 9,
  nov: 10,
  dez: 11,
};

export function parsePublishedTimestamp(dateStr: string): number {
  if (!dateStr) return 0;
  const iso = Date.parse(dateStr);
  if (!Number.isNaN(iso)) return iso;

  // Portuguese format like "26 de set. de 2026"
  const m = dateStr
    .toLowerCase()
    .match(/(\d{1,2})\s+de\s+([a-z]{3})\.?\s+de\s+(\d{4})/);
  if (m) {
    const day = Number.parseInt(m[1], 10);
    const month = PT_MONTHS[m[2]] ?? 0;
    const year = Number.parseInt(m[3], 10);
    return Date.UTC(year, month, day);
  }
  return 0;
}

export function formatPublishedDatePt(dateStr: string): string {
  const ts = parsePublishedTimestamp(dateStr);
  if (!ts) return dateStr || 'Data não informada';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(ts));
}

export interface VideoChapter {
  time: string;
  seconds: number;
  label: string;
}

export function extractChaptersFromDescription(description: string): VideoChapter[] {
  if (!description) return [];
  const chapters: VideoChapter[] = [];
  const lines = description.split(/\r?\n/);
  for (const line of lines) {
    const match = line.trim().match(/^(\d{1,2}:\d{2}(?::\d{2})?)\s+(.+)$/);
    if (match) {
      chapters.push({
        time: match[1],
        seconds: parseDurationSeconds(match[1]),
        label: match[2].trim(),
      });
    }
  }
  return chapters;
}

export function summarizeDescription(description: string, maxLen = 140): string {
  if (!description) return '';
  const cleaned = description
    .split(/\r?\n/)
    .filter((l) => !/^(cap[ií]tulos:|neste v[ií]deo:|\d{1,2}:\d{2}\s+)/i.test(l.trim()))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  const base = cleaned || description.replace(/\s+/g, ' ').trim();
  if (base.length <= maxLen) return base;
  return `${base.slice(0, maxLen).trimEnd()}…`;
}

export function normalizeSearchText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function filterAndSortVideos(
  videos: VideoTutorial[],
  categories: Category[],
  options: {
    query?: string;
    categoryId?: string;
    sort?: SortOption;
    includeInactive?: boolean;
  }
): VideoTutorial[] {
  const { query = '', categoryId = 'all', sort = 'recent', includeInactive = false } = options;
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const normalizedQuery = normalizeSearchText(query);
  const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);

  const filtered = videos.filter((video) => {
    if (!includeInactive && video.status !== 'published') return false;
    if (categoryId && categoryId !== 'all' && video.categoryId !== categoryId) return false;
    if (queryTokens.length === 0) return true;

    const categoryName = categoryMap.get(video.categoryId)?.name ?? '';
    const searchable = normalizeSearchText(
      [
        video.title,
        video.description,
        categoryName,
        video.playlist,
        ...(video.keywords || []),
      ].join(' ')
    );

    return queryTokens.every((token) => searchable.includes(token));
  });

  const sorted = [...filtered];
  switch (sort) {
    case 'oldest':
      sorted.sort(
        (a, b) => parsePublishedTimestamp(a.publishedAt) - parsePublishedTimestamp(b.publishedAt)
      );
      break;
    case 'duration_asc':
      sorted.sort(
        (a, b) => parseDurationSeconds(a.duration) - parseDurationSeconds(b.duration)
      );
      break;
    case 'duration_desc':
      sorted.sort(
        (a, b) => parseDurationSeconds(b.duration) - parseDurationSeconds(a.duration)
      );
      break;
    case 'title':
      sorted.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
      break;
    case 'playlist':
      sorted.sort((a, b) => {
        if (a.playlist && b.playlist && a.playlist === b.playlist) {
          return a.playlistPosition - b.playlistPosition;
        }
        if (a.playlist && !b.playlist) return -1;
        if (!a.playlist && b.playlist) return 1;
        return parsePublishedTimestamp(b.publishedAt) - parsePublishedTimestamp(a.publishedAt);
      });
      break;
    case 'recent':
    default:
      sorted.sort((a, b) => {
        const diff = parsePublishedTimestamp(b.publishedAt) - parsePublishedTimestamp(a.publishedAt);
        if (diff !== 0) return diff;
        return a.playlistPosition - b.playlistPosition;
      });
      break;
  }

  return sorted;
}

export function getRelatedVideos(
  current: VideoTutorial,
  allVideos: VideoTutorial[],
  limit = 4
): VideoTutorial[] {
  const published = allVideos.filter(
    (v) => v.status === 'published' && v.id !== current.id
  );
  const currentKeywords = new Set((current.keywords || []).map(normalizeSearchText));

  const scored = published.map((candidate) => {
    let score = 0;
    if (candidate.categoryId === current.categoryId) score += 10;
    if (current.playlist && candidate.playlist === current.playlist) score += 8;
    for (const kw of candidate.keywords || []) {
      if (currentKeywords.has(normalizeSearchText(kw))) score += 3;
    }
    return { candidate, score };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (
      parsePublishedTimestamp(b.candidate.publishedAt) -
      parsePublishedTimestamp(a.candidate.publishedAt)
    );
  });

  return scored.slice(0, limit).map((s) => s.candidate);
}

export function getAdjacentTutorials(
  currentId: string,
  videos: VideoTutorial[],
  trails: LearningTrail[]
): {
  prev: VideoTutorial | null;
  next: VideoTutorial | null;
  trail: LearningTrail | null;
} {
  const publishedMap = new Map(
    videos.filter((v) => v.status === 'published').map((v) => [v.id, v])
  );

  // Check if current video belongs to a Learning Trail first
  for (const trail of trails) {
    const validIds = trail.videoIds.filter((id) => publishedMap.has(id));
    const idx = validIds.indexOf(currentId);
    if (idx !== -1) {
      return {
        prev: idx > 0 ? publishedMap.get(validIds[idx - 1]) || null : null,
        next: idx < validIds.length - 1 ? publishedMap.get(validIds[idx + 1]) || null : null,
        trail,
      };
    }
  }

  // Fallback to category/playlist sequence
  const current = publishedMap.get(currentId);
  if (!current) return { prev: null, next: null, trail: null };

  const siblings = filterAndSortVideos(videos, [], {
    categoryId: current.categoryId,
    sort: 'playlist',
  });
  const idx = siblings.findIndex((v) => v.id === currentId);
  return {
    prev: idx > 0 ? siblings[idx - 1] : null,
    next: idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null,
    trail: null,
  };
}

export function extractYouTubeVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    if (url.hostname.includes('youtu.be')) {
      const id = url.pathname.replace('/', '').slice(0, 11);
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }
    const v = url.searchParams.get('v');
    if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
    const embedMatch = url.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) return embedMatch[1];
    const shortsMatch = url.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shortsMatch) return shortsMatch[1];
  } catch {
    return null;
  }
  return null;
}

export function deduplicateVideos(videos: VideoTutorial[]): VideoTutorial[] {
  const seen = new Set<string>();
  const unique: VideoTutorial[] = [];
  for (const v of videos) {
    if (!v.id || seen.has(v.id)) continue;
    seen.add(v.id);
    unique.push(v);
  }
  return unique;
}
