import type { VideoTutorial } from '../types/helpCenter';
import { buildWhatsAppLink } from '../utils/whatsapp';

interface FloatingWhatsAppProps {
  currentVideo?: VideoTutorial | null;
  currentCategoryName?: string;
}

function WhatsAppIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M16.004 3.2c-7.07 0-12.8 5.73-12.8 12.8 0 2.256.59 4.46 1.71 6.404L3.1 28.8l6.564-1.722a12.748 12.748 0 0 0 6.34 1.682h.005c7.068 0 12.796-5.73 12.796-12.8 0-3.418-1.33-6.632-3.748-9.048A12.72 12.72 0 0 0 16.004 3.2Zm7.456 18.18c-.314.884-1.825 1.69-2.536 1.796-.646.096-1.462.137-2.36-.149-.544-.173-1.242-.403-2.138-.79-3.763-1.624-6.22-5.41-6.408-5.66-.187-.251-1.53-2.036-1.53-3.884 0-1.848.967-2.756 1.31-3.131.344-.376.75-.47 1-.47.25 0 .5.002.719.013.23.011.539-.087.844.645.313.751 1.063 2.599 1.157 2.787.093.188.156.407.031.657-.125.25-.188.407-.375.626-.187.219-.394.489-.562.657-.188.187-.384.391-.165.767.219.376.973 1.605 2.088 2.599 1.434 1.278 2.643 1.674 3.018 1.862.375.188.594.156.813-.094.219-.25.938-1.095 1.188-1.471.25-.376.5-.313.844-.188.344.126 2.188 1.032 2.563 1.22.375.188.625.282.719.438.094.157.094.908-.22 1.792Z" />
    </svg>
  );
}

export function FloatingWhatsApp({
  currentVideo,
  currentCategoryName,
}: FloatingWhatsAppProps) {
  const pageUrl =
    typeof window !== 'undefined' ? window.location.href : 'https://ajuda.cs22.com.br/';

  const href = buildWhatsAppLink(
    currentVideo
      ? {
          kind: 'tutorial',
          videoTitle: currentVideo.title,
          categoryName: currentCategoryName,
          pageUrl,
        }
      : {
          kind: 'general',
          pageUrl,
        }
  );

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-30 group flex items-center gap-2">
      <span
        aria-hidden="true"
        className="pointer-events-none hidden sm:inline-block translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 rounded-xl border border-slate-200 bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#111318] backdrop-blur-md shadow-md transition-all duration-200 whitespace-nowrap"
      >
        Falar com o suporte
      </span>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title="Falar com o suporte CS22 pelo WhatsApp"
        aria-label="Precisa de ajuda? Falar com o suporte CS22 pelo WhatsApp"
        className="cs-whatsapp-pulse inline-flex h-[52px] w-[52px] items-center justify-center rounded-2xl border border-[#E86A14]/55 bg-white/95 text-[#16A34A] backdrop-blur-xl transition-all duration-200 hover:border-[#E86A14] hover:bg-[#E86A14] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E86A14]"
      >
        <WhatsAppIcon className="h-6 w-6" />
      </a>
    </div>
  );
}
