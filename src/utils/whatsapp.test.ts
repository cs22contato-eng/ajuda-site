import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CS22_WHATSAPP_BASE_URL,
  buildWhatsAppLink,
  buildWhatsAppMessage,
} from './whatsapp';

test('builds general WhatsApp message with official CS22 number', () => {
  const link = buildWhatsAppLink({
    kind: 'general',
    pageUrl: 'https://ajuda.cs22.com.br/',
  });
  assert.ok(link.startsWith(`${CS22_WHATSAPP_BASE_URL}?text=`));
  const decoded = decodeURIComponent(link.split('?text=')[1]);
  assert.match(decoded, /Central de Ajuda CS22/);
  assert.match(decoded, /https:\/\/ajuda\.cs22\.com\.br\//);
});

test('builds tutorial-specific WhatsApp message with title, category, and url', () => {
  const msg = buildWhatsAppMessage({
    kind: 'tutorial',
    videoTitle: 'NF-e: emitir, ajustar impostos e importar | Meu ERP Web',
    categoryName: 'Vendas e faturamento',
    pageUrl: 'https://ajuda.cs22.com.br/ajuda/nf-e-emitir',
  });
  assert.match(msg, /\[NF-e: emitir, ajustar impostos e importar \| Meu ERP Web\]/);
  assert.match(msg, /Categoria: Vendas e faturamento/);
  assert.match(msg, /Página de origem: https:\/\/ajuda\.cs22\.com\.br\/ajuda\/nf-e-emitir/);
});

test('builds not_found message including search query', () => {
  const msg = buildWhatsAppMessage({
    kind: 'not_found',
    searchQuery: 'SPED Fiscal',
    pageUrl: 'https://ajuda.cs22.com.br/',
  });
  assert.match(msg, /não encontrei um tutorial/i);
  assert.match(msg, /Termo pesquisado: SPED Fiscal/);
});
