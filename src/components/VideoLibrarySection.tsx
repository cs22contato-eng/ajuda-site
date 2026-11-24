import { AlertCircle, ArrowUpDown, ChevronDown, MessageCircle, RefreshCw, SearchX } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Category, SortOption, VideoTutorial } from '../types/helpCenter';
import { buildWhatsAppLink } from '../utils/whatsapp';
import { VideoCard } from './VideoCard';

interface VideoLibrarySectionProps {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  allVideos: VideoTutorial[];
  filteredVideos: VideoTutorial[];
  categories: Category[];
  searchQuery: string;
  activeCategoryId: string;
  sortBy: SortOption;
  onCategoryChange: (categoryId: string) => void;
  onSortChange: (sort: SortOption) => void;
  onClearFilters: () => void;
  onOpenTutorial: (slug: string) => void;
}

export function VideoLibrarySection({
  loading,
  error,
  onRetry,
  allVideos,
  filteredVideos,
  categories,
  searchQuery,
  activeCategoryId,
  sortBy,
  onCategoryChange,
  onSortChange,
  onClearFilters,
  onOpenTutorial,
}: VideoLibrarySectionProps) {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const isFiltering = Boolean(searchQuery.trim()) || activeCategoryId !== 'all';
  const [visibleLimit, setVisibleLimit] = useState<number>(12);

  useEffect(() => {
    setVisibleLimit(12);
  }, [searchQuery, activeCategoryId, sortBy]);

  const displayedVideos = isFiltering
    ? filteredVideos
    : filteredVideos.slice(0, visibleLimit);
  const remainingCount = Math.max(0, filteredVideos.length - displayedVideos.length);

  const starterVideos = allVideos.filter((v) => v.starter).slice(0, 4);
  const mostAccessedVideos = [...allVideos]
    .filter((v) => (v.views || 0) > 0)
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 4);

  const notFoundWhatsappUrl = buildWhatsAppLink({
    kind: 'not_found',
    searchQuery,
    categoryName:
      activeCategoryId !== 'all' ? categoryMap.get(activeCategoryId)?.name : undefined,
    pageUrl: typeof window !== 'undefined' ? window.location.href : 'https://ajuda.cs22.com.br/',
  });

  return (
    <div className="space-y-14 pt-10">
      {/* Comece por aqui & Mais acessados */}
      {!loading && !error && !isFiltering && (
        <>
          {starterVideos.length > 0 && (
            <section className="mx-auto max-w-7xl px-4 sm:px-6">
              <div className="mb-6">
                <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#111318]">
                  Comece por aqui
                </h2>
                <p className="mt-1.5 text-sm sm:text-base text-[#4A505E]">
                  Tutoriais introdutórios essenciais para iniciar sua operação na plataforma.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {starterVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    category={categoryMap.get(video.categoryId)}
                    onOpenTutorial={onOpenTutorial}
                  />
                ))}
              </div>
            </section>
          )}

          <section className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#111318]">
                  Mais acessados
                </h2>
                <p className="mt-1.5 text-sm sm:text-base text-[#4A505E]">
                  Tutoriais com maior número de acessos registrados pelos clientes nesta Central de Ajuda.
                </p>
              </div>
            </div>

            {mostAccessedVideos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {mostAccessedVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    category={categoryMap.get(video.categoryId)}
                    onOpenTutorial={onOpenTutorial}
                  />
                ))}
              </div>
            ) : (
              <div className="ghost-glass rounded-2xl p-6 text-sm text-[#4A505E]">
                Os tutoriais mais acessados aparecerão aqui automaticamente conforme os clientes assistirem aos treinamentos na plataforma.
              </div>
            )}
          </section>
        </>
      )}

      {/* Main Biblioteca de Tutoriais */}
      <section id="tutoriais" className="mx-auto max-w-7xl px-4 sm:px-6 scroll-mt-20">
        <div className="mb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#111318]">
              {isFiltering ? 'Resultados da biblioteca' : 'Biblioteca completa de tutoriais'}
            </h2>
            <p className="mt-1.5 text-sm text-[#4A505E]">
              <span className="font-mono font-semibold text-[#111318] tabular-nums">
                {filteredVideos.length}
              </span>{' '}
              {filteredVideos.length === 1 ? 'tutorial encontrado' : 'tutoriais encontrados'}
              {searchQuery.trim() ? ` para "${searchQuery.trim()}"` : ''}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="filter-category" className="text-xs font-medium text-[#646B7A]">
                Categoria
              </label>
              <select
                id="filter-category"
                value={activeCategoryId}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-[#111318] focus:border-[#E86A14] focus:outline-none"
              >
                <option value="all">Todas as categorias</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-3.5 w-3.5 text-[#E86A14]" aria-hidden="true" />
              <label htmlFor="sort-videos" className="sr-only">
                Ordenar tutoriais
              </label>
              <select
                id="sort-videos"
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-[#111318] focus:border-[#E86A14] focus:outline-none"
              >
                <option value="recent">Mais recentes</option>
                <option value="oldest">Mais antigos</option>
                <option value="duration_asc">Menor duração</option>
                <option value="duration_desc">Maior duração</option>
                <option value="title">Nome do tutorial (A–Z)</option>
                <option value="playlist">Ordem da playlist</option>
              </select>
            </div>

            {isFiltering && (
              <button
                type="button"
                onClick={onClearFilters}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-[#2A2F3A] hover:border-[#E86A14]/60 hover:text-[#111318] transition-colors cursor-pointer"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="ghost-glass overflow-hidden rounded-2xl animate-pulse">
                <div className="aspect-video w-full bg-slate-200/80" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-1/2 rounded bg-slate-200" />
                  <div className="h-5 w-4/5 rounded bg-slate-200" />
                  <div className="h-4 w-full rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="ghost-glass mx-auto max-w-xl rounded-2xl p-8 text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-[#E86A14]" aria-hidden="true" />
            <h3 className="mt-4 font-display text-lg font-semibold text-[#111318]">
              Erro ao carregar os tutoriais
            </h3>
            <p className="mt-2 text-sm text-[#4A505E]">{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#E86A14] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#D95C0A] transition-colors cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              <span>Tentar novamente</span>
            </button>
          </div>
        )}

        {/* Empty Search Result */}
        {!loading && !error && filteredVideos.length === 0 && (
          <div className="ghost-glass mx-auto max-w-xl rounded-2xl p-8 sm:p-10 text-center">
            <SearchX className="mx-auto h-11 w-11 text-[#E86A14]" aria-hidden="true" />
            <h3 className="mt-4 font-display text-xl font-bold text-[#111318]">
              Não encontrou o que procurava?
            </h3>
            <p className="mt-2 text-sm text-[#4A505E] leading-relaxed">
              Nossa equipe de atendimento pode orientar você diretamente pelo WhatsApp ou indicar o procedimento ideal para a sua dúvida.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={notFoundWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#E86A14] px-6 py-3 text-sm font-semibold text-white hover:bg-[#D95C0A] transition-colors"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                <span>FALAR COM O SUPORTE</span>
              </a>
              {isFiltering && (
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-[#2A2F3A] hover:text-[#111318] transition-colors cursor-pointer"
                >
                  Ver todos os tutoriais
                </button>
              )}
            </div>
          </div>
        )}

        {/* Videos Grid */}
        {!loading && !error && filteredVideos.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  category={categoryMap.get(video.categoryId)}
                  onOpenTutorial={onOpenTutorial}
                />
              ))}
            </div>

            {remainingCount > 0 && (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setVisibleLimit((prev) => prev + 12)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-[#111318] shadow-sm hover:border-[#E86A14] hover:text-[#D95C0A] transition-colors cursor-pointer"
                >
                  <ChevronDown className="h-4 w-4 text-[#E86A14]" aria-hidden="true" />
                  <span>Carregar mais tutoriais (restam {remainingCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisibleLimit(filteredVideos.length)}
                  className="inline-flex items-center justify-center rounded-xl border border-transparent px-4 py-3 text-xs sm:text-sm font-medium text-[#4A505E] hover:text-[#111318] transition-colors cursor-pointer"
                >
                  Ver todos os {filteredVideos.length}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
