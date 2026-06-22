import { getUsuarioPerfil, getEventoById, getRegiaoById } from '../mock-data.js';
import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { iconCalendar, iconPin } from '../utils/icons.js';

function renderMiniEvento(ev) {
  return `
    <a href="evento.html?id=${ev.id}" class="perfil-mini-card">
      <strong>${ev.titulo}</strong>
      <span>${iconCalendar()} ${ev.dataExibicao}</span>
      <span>${ev.categoria}</span>
    </a>
  `;
}

function init() {
  const chave = sessionStorage.getItem('perfilMock') || 'comum';
  const usuario = getUsuarioPerfil(chave);

  renderHeader(document.getElementById('header-root'), { showSearch: false, activePage: 'perfil' });
  renderFooter(document.getElementById('footer-root'));

  document.title = `${usuario.nome} — Hub Saúde`;
  document.getElementById('perfil-avatar').textContent = usuario.avatarInicial;
  document.getElementById('perfil-tipo').textContent = usuario.tipo;
  document.getElementById('perfil-nome').textContent = usuario.nome;
  document.getElementById('perfil-bio').textContent = usuario.bio;

  const dados = document.getElementById('perfil-dados-lista');
  const linhas = [
    ['E-mail', usuario.email],
    ['Telefone', usuario.telefone],
  ];
  if (usuario.cnpj) linhas.push(['CNPJ', usuario.cnpj]);
  if (usuario.regiaoPreferida) {
    linhas.push(['Região preferida', getRegiaoById(usuario.regiaoPreferida).nome]);
  }

  if (dados) {
    dados.innerHTML = linhas
      .map(([dt, dd]) => `<div><dt>${dt}</dt><dd>${dd}</dd></div>`)
      .join('');
  }

  if (usuario.inscricoes?.length) {
    document.getElementById('perfil-secao-inscricoes')?.classList.remove('is-hidden');
    const el = document.getElementById('perfil-inscricoes');
    if (el) {
      el.innerHTML = usuario.inscricoes
        .map((id) => getEventoById(id))
        .filter(Boolean)
        .map(renderMiniEvento)
        .join('');
    }
  }

  if (usuario.eventosGerenciados?.length) {
    document.getElementById('perfil-secao-gerenciados')?.classList.remove('is-hidden');
    const el = document.getElementById('perfil-gerenciados');
    if (el) {
      el.innerHTML = usuario.eventosGerenciados
        .map((id) => getEventoById(id))
        .filter(Boolean)
        .map(renderMiniEvento)
        .join('');
    }
  }

  if (usuario.permissoes?.length) {
    document.getElementById('perfil-secao-admin')?.classList.remove('is-hidden');
    const ul = document.getElementById('perfil-permissoes');
    if (ul) {
      ul.innerHTML = usuario.permissoes.map((p) => `<li>${p.replace(/_/g, ' ')}</li>`).join('');
    }
  }
}

document.addEventListener('DOMContentLoaded', init);
