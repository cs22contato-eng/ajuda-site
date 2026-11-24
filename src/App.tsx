import { useCallback, useEffect, useMemo, useState } from 'react';
import { CategoryGrid } from './components/CategoryGrid';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { HeroSearch } from './components/HeroSearch';
import { LearningTrailsSection } from './components/LearningTrailsSection';
import { TutorialPage } from './components/TutorialPage';
import { VideoLibrarySection } from './components/VideoLibrarySection';
import type { CatalogData, SortOption } from './types/helpCenter';
import { filterAndSortVideos, summarizeDescription } from './utils/catalogLogic';

const COMPLETED_STORAGE_KEY = 'cs22_completed_tutorials_v1';

function readCompletedIds(): string[] {
  try {
    const raw = window.localStorage.getItem(COMPLETED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [pathname, setPathname] = useState<string>(() =>
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );
  const [catalog, setCatalog] = useState<CatalogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [completedVideoIds, setCompletedVideoIds] = useState<string[]>(() =>
    typeof window !== 'undefined' ? readCompletedIds() : []
  );

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/catalog');
      if (!res.ok) {
        throw new Error('Não foi possível carregar os tutoriais no momento.');
      }
      const data = (await res.json()) as CatalogData;
      setCatalog(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro inesperado ao carregar a biblioteca de tutoriais.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  useEffect(() => {
    const onPopState = () => {
      setPathname(window.location.pathname);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((targetPath: string, hash?: string) => {
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', hash ? `${targetPath}#${hash}` : targetPath);
      setPathname(targetPath);
    } else if (hash) {
      window.history.replaceState({}, '', `${targetPath}#${hash}`);
    }

    if (hash) {
      window.setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleOpenTutorial = useCallback(
    (slug: string) => {
      navigate(`/ajuda/${encodeURIComponent(slug)}`);
    },
    [navigate]
  );

  const handleSearchSubmit = useCallback(
    (q: string) => {
      setSearchQuery(q);
      if (pathname !== '/') {
        navigate('/', 'tutoriais');
      } else {
        window.setTimeout(() => {
          document.getElementById('tutoriais')?.scrollIntoView({ behavior: 'smooth' });
        }, 40);
      }
    },
    [navigate, pathname]
  );

  const handleSelectCategory = useCallback(
    (categoryId: string) => {
      setActiveCategoryId((prev) => (prev === categoryId && categoryId !== 'all' ? 'all' : categoryId));
      if (pathname !== '/') {
        navigate('/', 'tutoriais');
      } else {
        window.setTimeout(() => {
          document.getElementById('tutoriais')?.scrollIntoView({ behavior: 'smooth' });
        }, 40);
      }
    },
    [navigate, pathname]
  );

  const handleToggleCompleted = useCallback((videoId: string) => {
    setCompletedVideoIds((prev) => {
      const next = prev.includes(videoId)
        ? prev.filter((id) => id !== videoId)
        : [...prev, videoId];
      try {
        window.localStorage.setItem(COMPLETED_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage quota errors
      }
      return next;
    });
  }, []);

  const handleRecordView = useCallback((videoId: string) => {
    fetch(`/api/videos/${encodeURIComponent(videoId)}/view`, { method: 'POST' })
      .then((r) => (r.ok ? r.json() : null))
      .then((res: { id: string; views: number } | null) => {
        if (!res) return;
        setCatalog((prev) =>
          prev
            ? {
                ...prev,
                videos: prev.videos.map((v) =>
                  v.id === res.id ? { ...v, views: res.views } : v
                ),
              }
            : prev
        );
      })
      .catch(() => {});
  }, []);

  const categoriesWithCounts = useMemo(() => {
    const cats = catalog?.categories || [];
    const vids = catalog?.videos || [];
    return cats.map((cat) => ({
      ...cat,
      count: vids.filter((v) => v.categoryId === cat.id && v.status === 'published').length,
    }));
  }, [catalog]);

  const popularCategories = useMemo(() => {
    return [...categoriesWithCounts]
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [categoriesWithCounts]);

  const filteredVideos = useMemo(() => {
    if (!catalog) return [];
    return filterAndSortVideos(catalog.videos, catalog.categories, {
      query: searchQuery,
      categoryId: activeCategoryId,
      sort: sortBy,
    });
  }, [catalog, searchQuery, activeCategoryId, sortBy]);

  const tutorialMatch = pathname.match(/^\/ajuda\/([^/]+)\/?$/);
  const currentTutorialSlug = tutorialMatch ? decodeURIComponent(tutorialMatch[1]) : null;

  const currentVideo = useMemo(() => {
    if (!currentTutorialSlug || !catalog) return null;
    return catalog.videos.find((v) => v.slug === currentTutorialSlug) || null;
  }, [currentTutorialSlug, catalog]);

  const currentVideoCategory = useMemo(() => {
    if (!currentVideo || !catalog) return undefined;
    return catalog.categories.find((c) => c.id === currentVideo.categoryId)?.name;
  }, [currentVideo, catalog]);

  // Keep client-side <title> and meta description synced on route changes
  useEffect(() => {
    if (currentVideo) {
      document.title = `${currentVideo.title} | Central de Ajuda CS22`;
      const desc = document.querySelector('meta[name="description"]');
      if (desc) {
        desc.setAttribute(
          'content',
          summarizeDescription(currentVideo.description, 155) ||
            'Tutorial oficial da Central de Ajuda CS22.'
        );
      }
      return;
    }
    document.title = 'Central de Ajuda CS22 | Tutoriais e Treinamentos';
  }, [currentVideo]);

  return (
    <div className="min-h-screen flex flex-col bg-white cs-ambient-bg text-[#111318]">
      <Header
        searchQuery={searchQuery}
        onSearchSubmit={handleSearchSubmit}
        onNavigate={navigate}
        currentPath={pathname}
      />

      <div className="flex-1">
        {currentTutorialSlug ? (
          <TutorialPage
            slug={currentTutorialSlug}
            videos={catalog?.videos || []}
            categories={catalog?.categories || []}
            trails={catalog?.trails || []}
            loading={loading}
            completedVideoIds={completedVideoIds}
            onToggleCompleted={handleToggleCompleted}
            onOpenTutorial={handleOpenTutorial}
            onNavigateHome={(catId) => {
              if (catId) {
                setActiveCategoryId(catId);
                navigate('/', 'tutoriais');
              } else {
                navigate('/');
              }
            }}
            onRecordView={handleRecordView}
          />
        ) : (
          <main>
            <HeroSearch
              query={searchQuery}
              onQueryChange={setSearchQuery}
              onSearchSubmit={handleSearchSubmit}
              popularCategories={popularCategories}
              activeCategoryId={activeCategoryId}
              onSelectCategory={handleSelectCategory}
              totalVideos={catalog?.videos.length || 0}
            />

            <CategoryGrid
              categories={categoriesWithCounts}
              activeCategoryId={activeCategoryId}
              onSelectCategory={handleSelectCategory}
            />

            <VideoLibrarySection
              loading={loading}
              error={error}
              onRetry={loadCatalog}
              allVideos={catalog?.videos || []}
              filteredVideos={filteredVideos}
              categories={catalog?.categories || []}
              searchQuery={searchQuery}
              activeCategoryId={activeCategoryId}
              sortBy={sortBy}
              onCategoryChange={setActiveCategoryId}
              onSortChange={setSortBy}
              onClearFilters={() => {
                setSearchQuery('');
                setActiveCategoryId('all');
              }}
              onOpenTutorial={handleOpenTutorial}
            />

            {!loading && !error && catalog && (
              <LearningTrailsSection
                trails={catalog.trails}
                videos={catalog.videos}
                completedVideoIds={completedVideoIds}
                onToggleCompleted={handleToggleCompleted}
                onOpenTutorial={handleOpenTutorial}
              />
            )}
          </main>
        )}
      </div>

      <Footer onNavigate={navigate} />

      <FloatingWhatsApp
        currentVideo={currentVideo}
        currentCategoryName={currentVideoCategory}
      />
    </div>
  );
}
