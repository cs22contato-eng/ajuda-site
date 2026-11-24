import test from 'node:test';
import assert from 'node:assert/strict';
import type { Category, LearningTrail, VideoTutorial } from '../types/helpCenter';
import {
  deduplicateVideos,
  extractChaptersFromDescription,
  extractYouTubeVideoId,
  filterAndSortVideos,
  getAdjacentTutorials,
  parseDurationSeconds,
  parsePublishedTimestamp,
  slugify,
} from './catalogLogic';

const CATEGORIES: Category[] = [
  { id: 'primeiros-passos', slug: 'primeiros-passos', name: 'Primeiros passos', description: '', iconName: 'Compass', order: 1 },
  { id: 'vendas', slug: 'vendas', name: 'Vendas e faturamento', description: '', iconName: 'Receipt', order: 2 },
];

const SAMPLE_VIDEOS: VideoTutorial[] = [
  {
    id: 'wvhDRo6biO8',
    slug: 'primeiros-passos-no-sistema',
    originalUrl: 'https://www.youtube.com/watch?v=wvhDRo6biO8',
    title: 'Primeiros passos no sistema | Meu ERP Web',
    description: 'Neste vídeo:\n0:02 O painel inicial\n0:13 Configurações da empresa',
    thumbnail: 'https://i.ytimg.com/vi/wvhDRo6biO8/hqdefault.jpg',
    duration: '1:08',
    publishedAt: '2026-09-26',
    categoryId: 'primeiros-passos',
    keywords: ['painel', 'inicio', 'configuracao'],
    playlist: 'Primeiros passos',
    playlistPosition: 1,
    status: 'published',
    featured: true,
    starter: true,
    views: 0,
  },
  {
    id: 'a4aVFZbvudI',
    slug: 'nf-e-emitir-ajustar-impostos-e-importar',
    originalUrl: 'https://www.youtube.com/watch?v=a4aVFZbvudI',
    title: 'NF-e: emitir, ajustar impostos e importar | Meu ERP Web',
    description: 'Tutorial completo de emissão fiscal.',
    thumbnail: 'https://i.ytimg.com/vi/a4aVFZbvudI/hqdefault.jpg',
    duration: '7:16',
    publishedAt: '2026-10-15',
    categoryId: 'vendas',
    keywords: ['nfe', 'impostos', 'nota fiscal'],
    playlist: 'Fiscal',
    playlistPosition: 1,
    status: 'published',
    featured: true,
    starter: false,
    views: 0,
  },
  {
    id: 'inactive123',
    slug: 'video-desativado',
    originalUrl: 'https://www.youtube.com/watch?v=inactive123',
    title: 'Conteúdo desativado',
    description: 'Oculto',
    thumbnail: 'https://i.ytimg.com/vi/inactive123/hqdefault.jpg',
    duration: '2:00',
    publishedAt: '2026-11-01',
    categoryId: 'vendas',
    keywords: [],
    playlist: '',
    playlistPosition: 1,
    status: 'inactive',
    featured: false,
    starter: false,
    views: 0,
  },
];

test('slugify strips accents and Meu ERP Web suffix cleanly', () => {
  assert.equal(
    slugify('NF-e: emitir, ajustar impostos e importar | Meu ERP Web'),
    'nf-e-emitir-ajustar-impostos-e-importar'
  );
});

test('parses durations and Portuguese or ISO dates accurately', () => {
  assert.equal(parseDurationSeconds('7:16'), 436);
  assert.equal(parseDurationSeconds('1:02:05'), 3725);
  assert.ok(parsePublishedTimestamp('2026-10-15') > parsePublishedTimestamp('26 de set. de 2026'));
});

test('extracts timestamp chapters from description', () => {
  const chapters = extractChaptersFromDescription(SAMPLE_VIDEOS[0].description);
  assert.equal(chapters.length, 2);
  assert.equal(chapters[0].time, '0:02');
  assert.equal(chapters[1].seconds, 13);
});

test('filterAndSortVideos searches without accents, hides inactive, and sorts', () => {
  const res = filterAndSortVideos(SAMPLE_VIDEOS, CATEGORIES, {
    query: 'emissao',
    sort: 'recent',
  });
  assert.equal(res.length, 1);
  assert.equal(res[0].id, 'a4aVFZbvudI');

  const allPublished = filterAndSortVideos(SAMPLE_VIDEOS, CATEGORIES, { sort: 'duration_desc' });
  assert.equal(allPublished.length, 2);
  assert.equal(allPublished[0].id, 'a4aVFZbvudI');
});

test('getAdjacentTutorials respects learning trail order', () => {
  const trails: LearningTrail[] = [
    {
      id: 't1',
      slug: 't1',
      name: 'Trilha Inicial',
      description: '',
      videoIds: ['wvhDRo6biO8', 'a4aVFZbvudI'],
      order: 1,
    },
  ];
  const nav = getAdjacentTutorials('wvhDRo6biO8', SAMPLE_VIDEOS, trails);
  assert.equal(nav.prev, null);
  assert.equal(nav.next?.id, 'a4aVFZbvudI');
});

test('extractYouTubeVideoId and deduplicateVideos handle standard URLs and duplicates', () => {
  assert.equal(extractYouTubeVideoId('https://www.youtube.com/watch?v=0PzS8ZfcwHU'), '0PzS8ZfcwHU');
  assert.equal(extractYouTubeVideoId('https://youtu.be/wvhDRo6biO8?t=10'), 'wvhDRo6biO8');
  assert.equal(extractYouTubeVideoId('invalid'), null);
  assert.equal(deduplicateVideos([SAMPLE_VIDEOS[0], SAMPLE_VIDEOS[0], SAMPLE_VIDEOS[1]]).length, 2);
});
