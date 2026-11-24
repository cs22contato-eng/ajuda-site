import type { WhatsAppMessageKind } from '../types/helpCenter';

export const CS22_WHATSAPP_NUMBER = '5518991621455';
export const CS22_WHATSAPP_DISPLAY = '(18) 99162-1455';
export const CS22_WHATSAPP_BASE_URL = `https://wa.me/${CS22_WHATSAPP_NUMBER}`;

export interface WhatsAppContextParams {
  kind: WhatsAppMessageKind;
  videoTitle?: string;
  categoryName?: string;
  pageUrl?: string;
  searchQuery?: string;
  featureName?: string;
}

export function buildWhatsAppMessage(params: WhatsAppContextParams): string {
  const { kind, videoTitle, categoryName, pageUrl, searchQuery, featureName } = params;
  const lines: string[] = [];

  switch (kind) {
    case 'tutorial':
      lines.push(
        `Olá! Estou assistindo ao tutorial ${videoTitle ? `[${videoTitle}]` : 'na Central de Ajuda'} e tenho uma dúvida sobre o procedimento apresentado.`
      );
      break;
    case 'problem':
      lines.push(
        'Olá! Sou cliente da CS22 e estou enfrentando um problema no sistema. Gostaria de receber orientação.'
      );
      break;
    case 'not_found':
      lines.push(
        'Olá! Procurei na Central de Ajuda CS22, mas não encontrei um tutorial para minha dúvida. Poderiam me orientar?'
      );
      if (searchQuery?.trim()) {
        lines.push(`Termo pesquisado: ${searchQuery.trim()}`);
      }
      break;
    case 'feature':
      lines.push(
        featureName?.trim()
          ? `Olá! Gostaria de tirar uma dúvida sobre a funcionalidade ${featureName.trim()} do sistema.`
          : 'Olá! Gostaria de tirar uma dúvida sobre uma funcionalidade do sistema.'
      );
      break;
    case 'general':
    default:
      lines.push(
        'Olá! Estou acessando a Central de Ajuda CS22 e preciso de suporte com meu sistema.'
      );
      break;
  }

  if (videoTitle && kind !== 'tutorial') {
    lines.push(`Tutorial: ${videoTitle}`);
  }
  if (categoryName) {
    lines.push(`Categoria: ${categoryName}`);
  }
  if (pageUrl) {
    lines.push(`Página de origem: ${pageUrl}`);
  }

  return lines.join('\n');
}

export function buildWhatsAppLink(params: WhatsAppContextParams): string {
  const message = buildWhatsAppMessage(params);
  return `${CS22_WHATSAPP_BASE_URL}?text=${encodeURIComponent(message)}`;
}
