import { CS22_WHATSAPP_DISPLAY, buildWhatsAppLink } from '../utils/whatsapp';
import { BrandMark } from './BrandMark';

interface FooterProps {
  onNavigate: (path: string, hash?: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const whatsappUrl = buildWhatsAppLink({
    kind: 'general',
    pageUrl: typeof window !== 'undefined' ? window.location.href : 'https://ajuda.cs22.com.br/',
  });

  return (
    <footer className="mt-20 border-t border-slate-200 bg-[#F8F9FB] pb-20 sm:pb-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-12 pb-6 lg:pt-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Brand Column */}
          <div className="md:col-span-7 space-y-4">
            <div className="inline-flex items-center rounded-xl bg-[#0B0D12] px-3.5 py-2 shadow-sm">
              <BrandMark variant="wordmark" className="h-9 w-auto" />
            </div>
            <div>
              <p className="font-display text-base font-semibold text-[#111318]">
                Central de Ajuda CS22
              </p>
              <p className="mt-1 text-sm text-[#4A505E]">Tecnologia que move negócios.</p>
            </div>
            <p className="text-xs text-[#646B7A]">
              Canal oficial de atendimento via WhatsApp:{' '}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono font-medium text-[#D95C0A] hover:underline tabular-nums"
              >
                {CS22_WHATSAPP_DISPLAY}
              </a>
            </p>
          </div>

          {/* Navigation Column */}
          <div className="md:col-span-5 md:justify-self-end space-y-3">
            <h3 className="font-display text-sm font-semibold text-[#111318]">Navegação</h3>
            <ul className="space-y-2 text-sm text-[#4A505E]">
              <li>
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/');
                  }}
                  className="hover:text-[#111318] transition-colors"
                >
                  Página inicial
                </a>
              </li>
              <li>
                <a
                  href="/#tutoriais"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/', 'tutoriais');
                  }}
                  className="hover:text-[#111318] transition-colors"
                >
                  Tutoriais
                </a>
              </li>
              <li>
                <a
                  href="/#categorias"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/', 'categorias');
                  }}
                  className="hover:text-[#111318] transition-colors"
                >
                  Categorias
                </a>
              </li>
              <li>
                <a
                  href="/#trilhas"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/', 'trilhas');
                  }}
                  className="hover:text-[#111318] transition-colors"
                >
                  Aprenda passo a passo
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-slate-200 pt-6 text-xs text-[#646B7A]">
          <p>CS22 — Central de Ajuda e Treinamentos. Todos os direitos reservados.</p>
          <p>Tecnologia que move negócios.</p>
        </div>
      </div>
    </footer>
  );
}
