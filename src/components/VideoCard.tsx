import { ArrowUpRight, Play } from 'lucide-react';
import { useState } from 'react';
import type { Category, VideoTutorial } from '../types/helpCenter';
import { formatPublishedDatePt, summarizeDescription } from '../utils/catalogLogic';

interface VideoCardProps {
  video: VideoTutorial;
  category?: Category;
  onOpenTutorial: (slug: string) => void;
  stepNumber?: number;
}

export function VideoCard({ video, category, onOpenTutorial, stepNumber }: VideoCardProps) {
  const [imgError, setImgError] = useState(false);
  const summary = summarizeDescription(video.description, 125);

  return (
    <a
      href={`/ajuda/${encodeURIComponent(video.slug)}`}
      onClick={(e) => {
        e.preventDefault();
        onOpenTutorial(video.slug);
      }}
      className="group ghost-glass-interactive flex flex-col overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E86A14]"
    >
      {/* Official Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
        {!imgError && video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-[#241207] p-4 text-center">
            <Play className="h-8 w-8 text-[#E86A14]" aria-hidden="true" />
            <span className="mt-2 line-clamp-2 text-xs font-medium text-slate-200">
              {video.title}
            </span>
          </div>
        )}

        {/* Scrim for contrast */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

        {/* Subtle Play Affordance on Hover */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-[#111318]/85 backdrop-blur-md text-[#F28529] shadow-lg">
            <Play className="h-5 w-5 fill-current translate-x-0.5" aria-hidden="true" />
          </span>
        </div>

        {/* Bottom-right duration timestamp */}
        {video.duration && (
          <span className="absolute bottom-2.5 right-2.5 rounded-md border border-white/20 bg-[#111318]/85 px-2 py-0.5 font-mono text-[11px] font-medium text-white tabular-nums backdrop-blur-md">
            {video.duration}
          </span>
        )}

        {typeof stepNumber === 'number' && (
          <span className="absolute top-2.5 left-2.5 rounded-md border border-[#E86A14]/50 bg-[#111318]/85 px-2 py-0.5 font-mono text-[11px] font-semibold text-[#F28529] tabular-nums backdrop-blur-md">
            Etapa {stepNumber}
          </span>
        )}
      </div>

      {/* Card Content — Zero-pill clean typographic metadata */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#646B7A]">
            <span className="font-semibold text-[#D95C0A]">
              {category?.name || 'Tutorial em vídeo'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              {formatPublishedDatePt(video.publishedAt)}
            </span>
            {video.views > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  {video.views} {video.views === 1 ? 'acesso' : 'acessos'}
                </span>
              </>
            )}
          </div>

          <h3 className="font-display text-base font-semibold leading-snug text-[#111318] group-hover:text-[#D95C0A] transition-colors line-clamp-2">
            {video.title}
          </h3>

          {summary && (
            <p className="text-sm leading-relaxed text-[#4A505E] line-clamp-2">
              {summary}
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-200/80 pt-3.5 text-xs font-medium text-[#2A2F3A] group-hover:text-[#111318] transition-colors">
          <span>Assistir tutorial</span>
          <ArrowUpRight className="h-4 w-4 text-[#E86A14] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
        </div>
      </div>
    </a>
  );
}
