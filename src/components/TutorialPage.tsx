import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  ListVideo,
  MessageCircle,
  Play,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Category, LearningTrail, VideoTutorial } from '../types/helpCenter';
import {
  extractChaptersFromDescription,
  formatPublishedDatePt,
  getAdjacentTutorials,
  getRelatedVideos,
} from '../utils/catalogLogic';
import { CS22_WHATSAPP_DISPLAY, buildWhatsAppLink } from '../utils/whatsapp';
import { VideoCard } from './VideoCard';

interface TutorialPageProps {
  slug: string;
  videos: VideoTutorial[];
  categories: Category[];
  trails: LearningTrail[];
  loading: boolean;
  completedVideoIds: string[];
  onToggleCompleted: (videoId: string) => void;
  onOpenTutorial: (slug: string) => void;
  onNavigateHome: (categoryId?: string) => void;
  onRecordView: (videoId: string) => void;
}

export function TutorialPage({
  slug,
  videos,
  categories,
  trails,
  loading,
  completedVideoIds,
  onToggleCompleted,
  onOpenTutorial,
  onNavigateHome,
  onRecordView,
}: TutorialPageProps) {
  const [startSeconds, setStartSeconds] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [posterError, setPosterError] = useState<boolean>(false);

  const video = videos.find((v) => v.slug === slug && v.status === 'published');
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const category = video ? categoryMap.get(video.categoryId) : undefined;

  useEffect(() => {
    setStartSeconds(0);
    setIsPlaying(false);
    setPosterError(false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
    if (video) {
      onRecordView(video.id);
    }
  }, [video?.id]);

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-6">
        <div className="h-6 w-48 rounded bg-slate-200 animate-pulse" />
        <div className="aspect-video w-full rounded-2xl bg-slate-100 animate-pulse" />
      </main>
    );
  }

  if (!video) {
    const unavailableWhatsapp = buildWhatsAppLink({
      kind: 'not_found',
      searchQuery: slug.replace(/-/g, ' '),
      pageUrl: typeof window !== 'undefined' ? window.location.href : 'https://ajuda.cs22.com.br/',
    });
    return (
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <div className="ghost-glass rounded-2xl p-8 sm:p-10 text-center">
          <AlertTriangle className="mx-auto h-11 w-11 text-[#E86A14]" aria-hidden="true" />
          <h1 className="mt-4 font-display text-2xl font-bold text-[#111318]">
            Tutorial indisponível ou não encontrado
          </h1>
          <p className="mt-2 text-sm text-[#4A505E] leading-relaxed">
            Este conteúdo pode ter sido atualizado, movido ou desativado pela equipe da CS22.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigateHome()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-[#111318] hover:border-[#E86A14]/60 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Voltar para a Central de Ajuda</span>
            </button>
            <a
              href={unavailableWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#E86A14] px-6 py-3 text-sm font-semibold text-white hover:bg-[#D95C0A]"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              <span>FALAR COM O SUPORTE</span>
            </a>
          </div>
        </div>
      </main>
    );
  }

  const chapters = extractChaptersFromDescription(video.description);
  const { prev, next, trail } = getAdjacentTutorials(video.id, videos, trails);
  const related = getRelatedVideos(video, videos, 3);
  const isCompleted = completedVideoIds.includes(video.id);

  const pageUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : `https://ajuda.cs22.com.br/ajuda/${video.slug}`;

  const tutorialSupportUrl = buildWhatsAppLink({
    kind: 'tutorial',
    videoTitle: video.title,
    categoryName: category?.name,
    pageUrl,
  });

  const problemSupportUrl = buildWhatsAppLink({
    kind: 'problem',
    videoTitle: video.title,
    categoryName: category?.name,
    pageUrl,
  });

  const featureSupportUrl = buildWhatsAppLink({
    kind: 'feature',
    featureName: video.title.replace(/\|\s*Meu ERP Web/gi, '').trim(),
    categoryName: category?.name,
    pageUrl,
  });

  const embedSrc = `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1${
    startSeconds > 0 ? `&start=${startSeconds}` : ''
  }`;
  const posterSrc = posterError
    ? video.thumbnail
    : `https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`;

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 pt-8 pb-20">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Caminho do tutorial" className="mb-6 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#646B7A]">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onNavigateHome();
          }}
          className="hover:text-[#111318] transition-colors"
        >
          Início
        </a>
        <span aria-hidden="true">/</span>
        {category && (
          <>
            <button
              type="button"
              onClick={() => onNavigateHome(category.id)}
              className="font-medium text-[#D95C0A] hover:underline cursor-pointer"
            >
              {category.name}
            </button>
            <span aria-hidden="true">/</span>
          </>
        )}
        <span className="text-[#4A505E] truncate max-w-[260px] sm:max-w-md">{video.title}</span>
      </nav>

      {/* Tutorial Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-sm text-[#646B7A]">
            <span className="font-semibold text-[#D95C0A]">
              {category?.name || 'Tutorial CS22'}
            </span>
            {video.playlist && (
              <>
                <span aria-hidden="true">·</span>
                <span>{video.playlist}</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{video.duration}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              Publicado em {formatPublishedDatePt(video.publishedAt)}
            </span>
            {video.views > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  {video.views} {video.views === 1 ? 'acesso na plataforma' : 'acessos na plataforma'}
                </span>
              </>
            )}
          </div>

          <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-[#111318] leading-tight">
            {video.title}
          </h1>
        </div>

        <button
          type="button"
          onClick={() => onToggleCompleted(video.id)}
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            isCompleted
              ? 'border-[#E86A14] bg-[#E86A14]/10 text-[#111318]'
              : 'border-slate-200 bg-white text-[#2A2F3A] hover:border-[#E86A14]/60 hover:text-[#111318]'
          }`}
        >
          {isCompleted ? (
            <CheckCircle2 className="h-4 w-4 text-[#E86A14]" aria-hidden="true" />
          ) : (
            <Circle className="h-4 w-4" aria-hidden="true" />
          )}
          <span>{isCompleted ? 'Tutorial concluído' : 'Marcar como concluído'}</span>
        </button>
      </div>

      {/* Custom CS22 Ghost Glass 16:9 Player Frame (dark cinema bezel) */}
      <div className="mx-auto max-w-4xl">
        <div className="ghost-glass-player rounded-2xl sm:rounded-3xl p-2 sm:p-3">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl sm:rounded-2xl bg-black">
            {isPlaying ? (
              <iframe
                key={`${video.id}-${startSeconds}`}
                src={embedSrc}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="h-full w-full border-0"
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsPlaying(true)}
                aria-label={`Reproduzir tutorial ${video.title}`}
                className="group relative block h-full w-full cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E86A14]"
              >
                <img
                  src={posterSrc}
                  alt={video.title}
                  referrerPolicy="no-referrer"
                  onError={() => {
                    if (!posterError) setPosterError(true);
                  }}
                  className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/25" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
                  <span className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border border-[#E86A14]/75 bg-[#111318]/85 text-[#F28529] shadow-[0_12px_36px_rgba(232,106,20,0.4)] backdrop-blur-md transition-transform duration-200 group-hover:scale-110 group-hover:bg-[#E86A14] group-hover:text-white">
                    <Play className="h-7 w-7 sm:h-8 sm:w-8 fill-current translate-x-0.5" aria-hidden="true" />
                  </span>
                  <span className="rounded-xl border border-white/20 bg-[#111318]/80 px-4 py-1.5 text-xs sm:text-sm font-semibold text-white backdrop-blur-md">
                    Assistir tutorial
                  </span>
                </div>
                {video.duration && (
                  <span className="absolute bottom-3 right-3 rounded-md border border-white/20 bg-[#111318]/85 px-2.5 py-1 font-mono text-xs font-medium text-white tabular-nums backdrop-blur-md">
                    {video.duration}
                  </span>
                )}
              </button>
            )}
          </div>
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 px-2 pb-1 text-xs text-[#9CA3AF]">
            <span>Ambiente de treinamento oficial CS22</span>
            <span className="font-mono tabular-nums text-[#E5E7EB]">{video.duration}</span>
          </div>
        </div>
      </div>

      {/* Prev / Next Tutorial Navigation */}
      {(prev || next) && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            {prev && (
              <a
                href={`/ajuda/${encodeURIComponent(prev.slug)}`}
                onClick={(e) => {
                  e.preventDefault();
                  onOpenTutorial(prev.slug);
                }}
                className="ghost-glass-interactive flex items-center gap-3 rounded-2xl p-4"
              >
                <ArrowLeft className="h-5 w-5 shrink-0 text-[#E86A14]" aria-hidden="true" />
                <div className="min-w-0">
                  <span className="block text-[11px] font-medium text-[#646B7A]">
                    Tutorial anterior{trail ? ` · ${trail.name}` : ''}
                  </span>
                  <span className="mt-0.5 block truncate text-sm font-semibold text-[#111318]">
                    {prev.title}
                  </span>
                </div>
              </a>
            )}
          </div>
          <div>
            {next && (
              <a
                href={`/ajuda/${encodeURIComponent(next.slug)}`}
                onClick={(e) => {
                  e.preventDefault();
                  onOpenTutorial(next.slug);
                }}
                className="ghost-glass-interactive flex items-center justify-between gap-3 rounded-2xl p-4 text-right"
              >
                <div className="min-w-0 flex-1">
                  <span className="block text-[11px] font-medium text-[#646B7A]">
                    Próximo tutorial{trail ? ` · ${trail.name}` : ''}
                  </span>
                  <span className="mt-0.5 block truncate text-sm font-semibold text-[#111318]">
                    {next.title}
                  </span>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-[#E86A14]" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Details & Support Columns */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          {/* Chapters */}
          {chapters.length > 0 && (
            <section className="ghost-glass rounded-2xl p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <ListVideo className="h-4 w-4 text-[#E86A14]" aria-hidden="true" />
                <h2 className="font-display text-base font-semibold text-[#111318]">
                  Capítulos deste tutorial
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {chapters.map((ch) => (
                  <button
                    key={`${ch.time}-${ch.label}`}
                    type="button"
                    onClick={() => {
                      setStartSeconds(ch.seconds);
                      setIsPlaying(true);
                    }}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-left text-xs sm:text-sm hover:border-[#E86A14]/60 hover:bg-[#E86A14]/5 transition-colors cursor-pointer"
                  >
                    <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-[#D95C0A] tabular-nums shrink-0">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      {ch.time}
                    </span>
                    <span className="text-[#111318] truncate">{ch.label}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Description */}
          <section className="ghost-glass rounded-2xl p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold text-[#111318] mb-3">
              Sobre este procedimento
            </h2>
            <div className="whitespace-pre-line text-sm sm:text-base leading-relaxed text-[#353B47]">
              {video.description || 'Assista ao vídeo demonstrativo completo acima.'}
            </div>

            {video.supplementaryNotes && (
              <div className="mt-5 border-t border-slate-200 pt-5">
                <h3 className="font-display text-sm font-semibold text-[#D95C0A] mb-2">
                  Orientações complementares CS22
                </h3>
                <p className="whitespace-pre-line text-sm leading-relaxed text-[#353B47]">
                  {video.supplementaryNotes}
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Contextual WhatsApp Support Card */}
        <aside className="lg:col-span-4 ghost-glass rounded-2xl p-5 sm:p-6 space-y-4">
          <div>
            <h2 className="font-display text-lg font-bold text-[#111318]">
              Ficou com alguma dúvida?
            </h2>
            <p className="mt-1.5 text-sm text-[#4A505E] leading-relaxed">
              Fale diretamente com a equipe CS22 pelo WhatsApp <span className="font-mono font-medium text-[#111318] tabular-nums">{CS22_WHATSAPP_DISPLAY}</span>. O contexto deste tutorial é enviado automaticamente.
            </p>
          </div>

          <div className="space-y-2.5">
            <a
              href={tutorialSupportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E86A14] px-4 py-3 text-sm font-semibold text-white hover:bg-[#D95C0A] transition-colors"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              <span>Dúvida sobre este tutorial</span>
            </a>

            <a
              href={featureSupportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-medium text-[#111318] hover:border-[#E86A14]/60 transition-colors"
            >
              <span>Dúvida sobre a funcionalidade</span>
            </a>

            <a
              href={problemSupportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-medium text-[#111318] hover:border-[#E86A14]/60 transition-colors"
            >
              <span>Relatar problema no sistema</span>
            </a>
          </div>
        </aside>
      </div>

      {/* Continue aprendendo */}
      {related.length > 0 && (
        <section className="mt-14 border-t border-slate-200 pt-10">
          <div className="mb-6">
            <h2 className="font-display text-2xl font-bold tracking-tight text-[#111318]">
              Continue aprendendo
            </h2>
            <p className="mt-1 text-sm text-[#4A505E]">
              Outros tutoriais relacionados para aprofundar o uso desta área do sistema.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((rel) => (
              <VideoCard
                key={rel.id}
                video={rel}
                category={categoryMap.get(rel.categoryId)}
                onOpenTutorial={onOpenTutorial}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
