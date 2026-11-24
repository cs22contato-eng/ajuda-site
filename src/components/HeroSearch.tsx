import { Search, X } from 'lucide-react';
import { type FormEvent } from 'react';
import type { Category } from '../types/helpCenter';
import { CategoryIcon } from './CategoryIcon';

interface HeroSearchProps {
  query: string;
  onQueryChange: (q: string) => void;
  onSearchSubmit: (q: string) => void;
  popularCategories: Array<Category & { count: number }>;
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  totalVideos: number;
}

export function HeroSearch({
  query,
  onQueryChange,
  onSearchSubmit,
  popularCategories,
  activeCategoryId,
  onSelectCategory,
  totalVideos,
}: HeroSearchProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearchSubmit(query);
  };

  return (
    <section className="relative overflow-hidden border-b border-slate-200/80 pt-10 pb-14 md:pt-16 md:pb-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
        <p className="mb-3 text-xs sm:text-sm font-medium tracking-wide text-[#646B7A]">
          Central de Ajuda CS22 ·{' '}
          <span className="font-mono tabular-nums text-[#111318] font-semibold">{totalVideos}</span>{' '}
          tutoriais disponíveis
        </p>

        <h1 className="mx-auto max-w-3xl font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#111318] leading-[1.12]">
          Como podemos ajudar você?
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-[#4A505E] leading-relaxed">
          Encontre tutoriais, orientações e demonstrações para aproveitar melhor as soluções da CS22.
        </p>

        {/* Prominent Ghost Glass Search Bar */}
        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-8 max-w-3xl"
          role="search"
          aria-label="Pesquisar tutoriais na Central de Ajuda"
        >
          <div className="ghost-glass flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-2xl p-2 focus-within:border-[#E86A14]/70 transition-colors">
            <div className="relative flex flex-1 items-center">
              <Search
                className="pointer-events-none absolute left-3 sm:left-3.5 h-4 w-4 sm:h-5 sm:w-5 text-[#E86A14]"
                aria-hidden="true"
              />
              <label htmlFor="hero-search-input" className="sr-only">
                Digite sua dúvida ou pesquise uma funcionalidade
              </label>
              <input
                id="hero-search-input"
                type="text"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Digite sua dúvida ou pesquise uma funcionalidade..."
                className="w-full bg-transparent py-3 pl-9 sm:pl-11 pr-8 text-[13px] sm:text-base text-[#111318] placeholder:text-[#646B7A] focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    onQueryChange('');
                    onSearchSubmit('');
                  }}
                  aria-label="Limpar pesquisa"
                  className="absolute right-2 rounded-md p-1.5 text-[#646B7A] hover:text-[#111318]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E86A14] px-6 py-3 text-sm font-semibold text-white hover:bg-[#D95C0A] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E86A14]"
            >
              Pesquisar
            </button>
          </div>
        </form>

        {/* Popular Categories Strip */}
        <div className="mt-7 flex flex-col items-center gap-3">
          <span className="text-xs font-medium text-[#646B7A]">Categorias populares</span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {popularCategories.map((cat) => {
              const isSelected = activeCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat.id)}
                  className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isSelected
                      ? 'border-[#E86A14] bg-[#E86A14]/10 text-[#111318]'
                      : 'border-slate-200 bg-white/85 text-[#2A2F3A] hover:border-[#E86A14]/50 hover:text-[#111318]'
                  }`}
                >
                  <CategoryIcon name={cat.iconName} className="h-4 w-4 text-[#E86A14]" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
