import { CheckCircle2, Circle, PlayCircle } from 'lucide-react';
import { useState } from 'react';
import type { LearningTrail, VideoTutorial } from '../types/helpCenter';

interface LearningTrailsSectionProps {
  trails: LearningTrail[];
  videos: VideoTutorial[];
  completedVideoIds: string[];
  onToggleCompleted: (videoId: string) => void;
  onOpenTutorial: (slug: string) => void;
}

export function LearningTrailsSection({
  trails,
  videos,
  completedVideoIds,
  onToggleCompleted,
  onOpenTutorial,
}: LearningTrailsSectionProps) {
  const videoMap = new Map(videos.map((v) => [v.id, v]));
  const [selectedTrailId, setSelectedTrailId] = useState<string>(trails[0]?.id || '');

  const activeTrail = trails.find((t) => t.id === selectedTrailId) || trails[0];
  if (!activeTrail) return null;

  const trailSteps = activeTrail.videoIds
    .map((id) => videoMap.get(id))
    .filter((v): v is VideoTutorial => Boolean(v));

  const completedInTrail = trailSteps.filter((v) => completedVideoIds.includes(v.id)).length;

  return (
    <section id="trilhas" className="mx-auto max-w-7xl px-4 sm:px-6 pt-14 pb-6 scroll-mt-20">
      <div className="mb-8">
        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#111318]">
          Aprenda passo a passo
        </h2>
        <p className="mt-1.5 text-sm sm:text-base text-[#4A505E]">
          Siga trilhas estruturadas com a sequência recomendada para dominar cada módulo do sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Trail Selector List */}
        <div className="lg:col-span-5 space-y-3">
          {trails.map((trail, index) => {
            const validSteps = trail.videoIds.filter((id) => videoMap.has(id));
            const isSelected = trail.id === activeTrail.id;
            const doneCount = validSteps.filter((id) => completedVideoIds.includes(id)).length;

            return (
              <button
                key={trail.id}
                type="button"
                onClick={() => setSelectedTrailId(trail.id)}
                className={`ghost-glass w-full rounded-2xl p-4 sm:p-5 text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E86A14] ${
                  isSelected
                    ? 'border-[#E86A14] bg-[#E86A14]/[0.06]'
                    : 'hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs font-semibold text-[#D95C0A] tabular-nums">
                    Trilha {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="font-mono text-xs text-[#646B7A] tabular-nums">
                    {validSteps.length} {validSteps.length === 1 ? 'etapa' : 'etapas'}
                    {doneCount > 0 ? ` · ${doneCount} concluídas` : ''}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-base font-semibold text-[#111318]">
                  {trail.name}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-[#4A505E] line-clamp-2">
                  {trail.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Selected Trail Steps */}
        <div className="lg:col-span-7 ghost-glass rounded-2xl p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-display text-xl font-bold text-[#111318]">{activeTrail.name}</h3>
              <p className="mt-1 text-sm text-[#4A505E]">{activeTrail.description}</p>
            </div>
            <div className="shrink-0 text-left sm:text-right font-mono text-xs text-[#4A505E] tabular-nums">
              {completedInTrail > 0 ? (
                <span>
                  {completedInTrail} de {trailSteps.length} concluídas
                </span>
              ) : (
                <span>{trailSteps.length} etapas na sequência</span>
              )}
            </div>
          </div>

          <ol className="mt-4 divide-y divide-slate-200/80">
            {trailSteps.map((step, idx) => {
              const isDone = completedVideoIds.includes(step.id);
              return (
                <li key={step.id} className="py-3.5 first:pt-1 last:pb-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => onToggleCompleted(step.id)}
                        aria-label={
                          isDone
                            ? `Desmarcar "${step.title}" como concluído`
                            : `Marcar "${step.title}" como concluído`
                        }
                        title={isDone ? 'Concluído (clique para desmarcar)' : 'Marcar como concluído'}
                        className="mt-0.5 shrink-0 text-[#646B7A] hover:text-[#E86A14] transition-colors cursor-pointer"
                      >
                        {isDone ? (
                          <CheckCircle2 className="h-5 w-5 text-[#E86A14]" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-xs text-[#646B7A] font-mono tabular-nums">
                          <span>Etapa {idx + 1}</span>
                          <span aria-hidden="true">·</span>
                          <span>{step.duration}</span>
                        </div>
                        <a
                          href={`/ajuda/${encodeURIComponent(step.slug)}`}
                          onClick={(e) => {
                            e.preventDefault();
                            onOpenTutorial(step.slug);
                          }}
                          className={`mt-0.5 block text-sm sm:text-base font-medium hover:text-[#D95C0A] transition-colors ${
                            isDone ? 'text-[#646B7A]' : 'text-[#111318]'
                          }`}
                        >
                          {step.title}
                        </a>
                      </div>
                    </div>

                    <a
                      href={`/ajuda/${encodeURIComponent(step.slug)}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onOpenTutorial(step.slug);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-[#111318] hover:border-[#E86A14]/60 hover:bg-[#E86A14]/5 transition-colors whitespace-nowrap shrink-0"
                    >
                      <PlayCircle className="h-4 w-4 text-[#E86A14]" aria-hidden="true" />
                      <span>Assistir</span>
                    </a>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
