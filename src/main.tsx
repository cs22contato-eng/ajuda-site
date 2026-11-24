import { Component, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { buildWhatsAppLink } from './utils/whatsapp';

interface ErrorBoundaryState {
  hasError: boolean;
}

class AppErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Handled gracefully by fallback UI
  }

  render() {
    if (this.state.hasError) {
      const supportUrl = buildWhatsAppLink({
        kind: 'general',
        pageUrl: typeof window !== 'undefined' ? window.location.href : 'https://ajuda.cs22.com.br/',
      });
      return (
        <div className="min-h-screen flex items-center justify-center bg-white px-4 text-center text-[#111318]">
          <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-4">
            <h1 className="text-xl font-bold">Central de Ajuda CS22</h1>
            <p className="text-sm text-[#4A505E]">
              Não foi possível exibir esta página no momento. Atualize a página ou fale com nosso suporte.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-xl bg-[#E86A14] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#D95C0A] cursor-pointer"
              >
                Recarregar página
              </button>
              <a
                href={supportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-[#111318]"
              >
                Suporte WhatsApp
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>
);
