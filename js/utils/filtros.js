import { CATEGORIAS } from '../mock-data.js';

export function htmlOpcoesCategoria(valorVazio = 'Todas') {
  const opts = CATEGORIAS.map((c) => `<option value="${c}">${c}</option>`).join('');
  return `<option value="">${valorVazio}</option>${opts}`;
}
