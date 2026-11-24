import { ChevronRight } from 'lucide-react';
import type { Category } from '../types/helpCenter';
import { CategoryIcon } from './CategoryIcon';

interface CategoryGridProps {
  categories: Array<Category & { count: number }>;
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
}

export function CategoryGrid({
  categories,
  activeCategoryId,
  onSelectCategory,
}: CategoryGridProps) {
  return (
    <section id="categorias" className="mx-auto max-w-7xl px-4 sm:px-6 pt-14 pb-6 scroll-mt-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#111318]">
            Navegar por categorias
          </h2>
          <p className="mt-1.5 text-sm sm:text-base text-[#4A505E]">
            Escolha a área do sistema para encontrar os treinamentos correspondentes.
          </p>
        </div>

        {activeCategoryId !== 'all' && (
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className="self-start sm:self-auto rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-[#2A2F3A] hover:border-[#E86A14]/60 hover:text-[#111318] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Mostrar todas as categorias
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const isSelected = activeCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`ghost-glass-interactive group flex flex-col justify-between rounded-2xl p-5 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E86A14] ${
                isSelected ? 'border-[#E86A14] bg-[#E86A14]/[0.05]' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/90 bg-slate-50 text-[#E86A14] group-hover:border-[#E86A14]/45 transition-colors">
                    <CategoryIcon name={cat.iconName} className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-xs font-medium text-[#646B7A] tabular-nums">
                    {cat.count} {cat.count === 1 ? 'tutorial' : 'tutoriais'}
                  </span>
                </div>

                <h3 className="mt-4 font-display text-base font-semibold text-[#111318] group-hover:text-[#D95C0A] transition-colors">
                  {cat.name}
                </h3>

                <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-[#4A505E] line-clamp-2">
                  {cat.description}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[#2A2F3A] group-hover:text-[#111318]">
                <span>{cat.count > 0 ? 'Ver tutoriais' : 'Em breve'}</span>
                <ChevronRight className="h-3.5 w-3.5 text-[#E86A14] transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
