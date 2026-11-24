export type VideoStatus = 'published' | 'inactive';

export interface VideoTutorial {
  id: string; // YouTube Video ID (e.g., 'wvhDRo6biO8')
  slug: string; // URL-friendly slug (e.g., 'primeiros-passos-no-sistema')
  originalUrl: string; // https://www.youtube.com/watch?v=...
  title: string; // Preserved original YouTube title
  description: string; // Preserved original YouTube description
  supplementaryNotes?: string; // Optional extra CS22 guidance
  thumbnail: string; // Official YouTube thumbnail URL
  duration: string; // e.g., '4:43'
  publishedAt: string; // ISO or original date string
  categoryId: string;
  keywords: string[];
  playlist: string;
  playlistPosition: number;
  status: VideoStatus;
  featured: boolean;
  starter: boolean; // Shown in "Comece por aqui"
  views: number; // Real platform-tracked views
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  iconName: string;
  order: number;
}

export interface LearningTrail {
  id: string;
  slug: string;
  name: string;
  description: string;
  videoIds: string[]; // Ordered real video IDs
  order: number;
}

export interface CatalogData {
  categories: Category[];
  videos: VideoTutorial[];
  trails: LearningTrail[];
  youtubeIntegration: {
    channelUrl: string;
    channelId: string;
    rssEndpoint: string;
    apiConfigured: boolean;
    note: string;
  };
}

export type SortOption = 'recent' | 'oldest' | 'duration_asc' | 'duration_desc' | 'title' | 'playlist';

export type WhatsAppMessageKind =
  | 'general'
  | 'tutorial'
  | 'problem'
  | 'not_found'
  | 'feature';
