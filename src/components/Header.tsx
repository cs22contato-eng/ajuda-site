import { Menu, Search, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { buildWhatsAppLink } from '../utils/whatsapp';
import { BrandMark } from './BrandMark';

interface HeaderProps {
  searchQuery: string;
  onSearchSubmit: (query: string) => void;
  onNavigate: (path: string, hash?: string) => void;
  currentPath: string;
}

export function Header({ searchQuery, onSearchSubmit, onNavigate, currentPath }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [draft, setDraft] = useState(searchQuery);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearchSubmit(draft);
    setMobileOpen(false);
  };

  const whatsappUrl = buildWhatsAppLink({
    kind: 'general',
    pageUrl: typeof window !== 'undefined' ? window.location.href : 'https://ajuda.cs22.com.br/',
  });

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 md:h-16 max-w-7xl items-center justify-between gap-4 lg:gap-8 px-4 sm:px-6">
        {/* Zone 1: Brand + Central de Ajuda */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/');
            setMobileOpen(false);
          }}
          className="flex items-center gap-3 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E86A14] rounded-md px-1 py-1"
          aria-label="Central de Ajuda CS22 - Página inicial"
        >
          <BrandMark variant="icon" className="h-8 w-8 rounded-lg shadow-sm" />
          <span className="font-display text-sm sm:text-base font-semibold tracking-tight text-[#111318]">
            Central de Ajuda <span className="text-[#E86A14]">CS22</span>
          </span>
        </a>

        {/* Zone 2: Navigation + Compact Search */}
        <div className="hidden md:flex items-center gap-6 flex-1 justify-center min-w-0">
          <nav className="flex items-center gap-5 text-sm font-medium text-[#4A505E]" aria-label="Navegação principal">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/');
              }}
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#111318] ${
                currentPath === '/' ? 'text-[#111318] font-semibold' : ''
              }`}
            >
              Início
            </a>
            <a
              href="/#categorias"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/', 'categorias');
              }}
              className="whitespace-nowrap shrink-0 transition-colors hover:text-[#111318]"
            >
              Categorias
            </a>
            <a
              href="/#trilhas"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/', 'trilhas');
              }}
              className="whitespace-nowrap shrink-0 transition-colors hover:text-[#111318]"
            >
              Trilhas
            </a>
            <a
              href="/#tutoriais"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/', 'tutoriais');
              }}
              className="whitespace-nowrap shrink-0 transition-colors hover:text-[#111318]"
            >
              Tutoriais
            </a>
          </nav>

          <form onSubmit={handleSubmit} className="relative hidden lg:block w-64 xl:w-72 shrink-0">
            <label htmlFor="header-search" className="sr-only">
              Pesquisar tutoriais
            </label>
            <input
              id="header-search"
              type="search"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Pesquisar funcionalidade..."
              className="w-full rounded-lg border border-slate-200 bg-slate-100/80 py-1.5 pl-9 pr-3 text-xs text-[#111318] placeholder:text-[#646B7A] focus:border-[#E86A14] focus:bg-white focus:outline-none transition-colors"
            />
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#646B7A]" aria-hidden="true" />
          </form>
        </div>

        {/* Zone 3: Primary WhatsApp Support CTA */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-[#E86A14] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#D95C0A] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E86A14] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Suporte WhatsApp
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex md:hidden items-center justify-center rounded-lg border border-slate-200 bg-slate-50 h-10 w-10 text-[#4A505E] hover:text-[#111318]"
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 px-4 py-4 space-y-4">
          <form onSubmit={handleSubmit} className="relative">
            <label htmlFor="mobile-header-search" className="sr-only">
              Pesquisar tutoriais
            </label>
            <input
              id="mobile-header-search"
              type="search"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Pesquisar dúvida ou funcionalidade..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-[#111318] placeholder:text-[#646B7A] focus:border-[#E86A14] focus:bg-white focus:outline-none"
            />
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#646B7A]" aria-hidden="true" />
          </form>

          <nav className="grid grid-cols-2 gap-2 text-sm font-medium" aria-label="Menu móvel">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/');
                setMobileOpen(false);
              }}
              className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-[#111318] hover:border-[#E86A14]/50"
            >
              Início
            </a>
            <a
              href="/#categorias"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/', 'categorias');
                setMobileOpen(false);
              }}
              className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-[#111318] hover:border-[#E86A14]/50"
            >
              Categorias
            </a>
            <a
              href="/#trilhas"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/', 'trilhas');
                setMobileOpen(false);
              }}
              className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-[#111318] hover:border-[#E86A14]/50"
            >
              Trilhas
            </a>
            <a
              href="/#tutoriais"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/', 'tutoriais');
                setMobileOpen(false);
              }}
              className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-[#111318] hover:border-[#E86A14]/50"
            >
              Tutoriais
            </a>
          </nav>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center rounded-lg bg-[#E86A14] px-4 py-3 text-sm font-semibold text-white hover:bg-[#D95C0A]"
          >
            Falar com o Suporte pelo WhatsApp
          </a>
        </div>
      )}
    </header>
  );
}
