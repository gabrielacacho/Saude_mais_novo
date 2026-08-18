import { getUsuarioPerfil, getRegiaoById } from '../mock-data.js';
import { getEventoById } from '../services/evento-api.js';

import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { iconCalendar } from '../utils/icons.js';

function renderMiniEvento(ev) {
  return `
    <a href="evento.html?id=${ev.id}" class="perfil-mini-card">
      <strong>${ev.titulo}</strong>
      <span>${iconCalendar()} ${ev.dataExibicao}</span>
      <span>${ev.categoria}</span>
    </a>
  `;
}

async function init() {
  const perfilAtual = sessionStorage.getItem('perfilMock') || 'comum';
  const usuario = getUsuarioPerfil(perfilAtual);

  if (!usuario) return;

  renderHeader(document.getElementById('header-root'), { showSearch: false, activePage: 'perfil' });
  renderFooter(document.getElementById('footer-root'));

  document.title = `${usuario.nome} — Hub Saúde`;
  
  const avatarEl = document.getElementById('perfil-avatar');
  if (avatarEl) avatarEl.textContent = usuario.avatarInicial || 'M';
  
  const tipoEl = document.getElementById('perfil-tipo');
  if (tipoEl) tipoEl.textContent = usuario.tipo || '';
  
  const nomeEl = document.getElementById('perfil-nome');
  if (nomeEl) nomeEl.textContent = usuario.nome || '';

  const dados = document.getElementById('perfil-dados-lista');
  const linhas = [
    ['E-mail', usuario.email],
    ['Telefone', usuario.telefone],
  ];

  if (usuario.cnpj) linhas.push(['CNPJ', usuario.cnpj]);

  if (usuario.regiaoPreferida) {
    linhas.push(['Região preferida', getRegiaoById(usuario.regiaoPreferida)?.nome || '']);
  }

  if (dados) {
    dados.innerHTML = linhas
      .map(([dt, dd]) => `<div><dt>${dt}</dt><dd>${dd}</dd></div>`)
      .join('');
  }

  const secaoInscricoes = document.getElementById('perfil-secao-inscricoes');
  const secaoGerenciados = document.getElementById('perfil-secao-gerenciados');
  const secaoAdmin = document.getElementById('perfil-secao-admin');
  const secaoAvaliador = document.getElementById('avaliador-instituicao');

  secaoInscricoes?.classList.add('is-hidden');
  secaoGerenciados?.classList.add('is-hidden');
  secaoAdmin?.classList.add('is-hidden');
  secaoAvaliador?.classList.add('is-hidden');

  if (perfilAtual === 'comum' && usuario.inscricoes?.length) {
    secaoInscricoes?.classList.remove('is-hidden');
    const el = document.getElementById('perfil-inscricoes');

    if (el) {
      const eventos = await Promise.all(
        usuario.inscricoes.map((id) => getEventoById(id))
      );
      el.innerHTML = eventos.filter(Boolean).map(renderMiniEvento).join('');
    }
  }

  if (perfilAtual === 'institucional' && usuario.eventosGerenciados?.length) {
    secaoGerenciados?.classList.remove('is-hidden');
    const el = document.getElementById('perfil-gerenciados');

    if (el) {
      const eventos = await Promise.all(
        usuario.eventosGerenciados.map((id) => getEventoById(id))
      );
      el.innerHTML = eventos.filter(Boolean).map(renderMiniEvento).join('');
    }
  }

  if (perfilAtual === 'administrador') {
    if (usuario.permissoes?.length) {
      secaoAdmin?.classList.remove('is-hidden');
      const ul = document.getElementById('perfil-permissoes');

      if (ul) {
        ul.innerHTML = usuario.permissoes
          .map((p) => `<li>${p.replace(/_/g, ' ')}</li>`)
          .join('');
      }
    }
    secaoAvaliador?.classList.remove('is-hidden');
  }
}

document.addEventListener('DOMContentLoaded', init);


// ==========================================================
// FILTROS COM MENSAGEM VAZIA E MODAL
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
  const modalFicha = document.getElementById('modal-ficha-instituicao');
  const fecharModalFicha = document.querySelector('.modal-ficha__fechar');
  const nomeInstituicao = document.getElementById('modal-nome-instituicao');

  // Função para aplicar filtro e controlar mensagem de tabela vazia
  function aplicarFiltroAvaliador(filtroTipo, botaoClicado) {
    const avaliador = document.getElementById('avaliador-instituicao');
    if (!avaliador) return;

    const tbody = avaliador.querySelector('#avaliador-instituicoes-lista');
    if (!tbody) return;

    const statusAlvo = filtroTipo === 'pendentes' ? 'pendente' : filtroTipo === 'ativas' ? 'ativa' : 'bloqueada';
    const linhas = tbody.querySelectorAll('tr[data-status]');
    const botoesFiltro = avaliador.querySelectorAll('.avaliador-filtro');

    let totalVisiveis = 0;

    linhas.forEach((linha) => {
      if (linha.dataset.status === statusAlvo) {
        linha.style.display = '';
        totalVisiveis++;
      } else {
        linha.style.display = 'none';
      }
    });

    // Atualiza botões
    botoesFiltro.forEach((b) => b.classList.remove('avaliador-filtro--ativo'));
    botaoClicado?.classList.add('avaliador-filtro--ativo');

    // Gerencia a mensagem vazia
    tbody.querySelector('.avaliador-mensagem-vazia')?.remove();

    if (totalVisiveis === 0) {
      const mensagens = {
        pendente: 'Nenhuma instituição pendente no momento.',
        ativa: 'Nenhuma instituição ativa no momento.',
        bloqueada: 'Nenhuma instituição bloqueada no momento.'
      };

      const trVazia = document.createElement('tr');
      trVazia.className = 'avaliador-mensagem-vazia';
      trVazia.innerHTML = `<td colspan="4" style="text-align: center; color: #64748b; padding: 1.5rem;">${mensagens[statusAlvo]}</td>`;
      tbody.appendChild(trVazia);
    }
  }

  // Escuta os cliques no documento
  document.addEventListener('click', (evento) => {
    
    // Clique nos botões de filtro
    const botaoFiltro = evento.target.closest('.avaliador-filtro');
    if (botaoFiltro) {
      const filtro = botaoFiltro.dataset.filtro;
      aplicarFiltroAvaliador(filtro, botaoFiltro);
    }

    // Clique no botão "Ver Ficha"
    const botaoVerFicha = evento.target.closest('.avaliador-ver-ficha');
    if (botaoVerFicha) {
      const linha = botaoVerFicha.closest('tr');
      if (linha && modalFicha && nomeInstituicao) {
        const nome = linha.querySelector('td')?.textContent.trim();
        if (nome) nomeInstituicao.textContent = nome;
        modalFicha.classList.remove('is-hidden');
      }
    }
  });

  // Fechar Modal
  fecharModalFicha?.addEventListener('click', () => modalFicha?.classList.add('is-hidden'));
  modalFicha?.addEventListener('click', (evento) => {
    if (evento.target === modalFicha) modalFicha.classList.add('is-hidden');
  });
});