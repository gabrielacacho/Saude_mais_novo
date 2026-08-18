import { getUsuarioPerfil, getRegiaoById } from '../mock-data.js';
import { getEventoById } from '../services/evento-api.js';

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

async function init() {
  const perfilAtual = sessionStorage.getItem('perfilMock') || 'comum';
  const usuario = getUsuarioPerfil(perfilAtual);

  if (!usuario) return;

  renderHeader(document.getElementById('header-root'), { showSearch: false, activePage: 'perfil' });
  renderFooter(document.getElementById('footer-root'));

  document.title = `${usuario.nome} — Saúde Aqui`;
  
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

  if (secaoInscricoes) secaoInscricoes.classList.add('is-hidden');
  if (secaoGerenciados) secaoGerenciados.classList.add('is-hidden');
  if (secaoAdmin) secaoAdmin.classList.add('is-hidden');
  if (secaoAvaliador) secaoAvaliador.classList.add('is-hidden');

  if (perfilAtual === 'comum' && usuario.inscricoes?.length) {
    secaoInscricoes?.classList.remove('is-hidden');
    const el = document.getElementById('perfil-inscricoes');

    if (el) {
      const eventos = await Promise.all(
        usuario.inscricoes.map((id) => getEventoById(id))
      );
      el.innerHTML = eventos
        .filter(Boolean)
        .map(renderMiniEvento)
        .join('');
    }
  }

  if (perfilAtual === 'institucional' && usuario.eventosGerenciados?.length) {
    secaoGerenciados?.classList.remove('is-hidden');
    const el = document.getElementById('perfil-gerenciados');

    if (el) {
      const eventos = await Promise.all(
        usuario.eventosGerenciados.map((id) => getEventoById(id))
      );
      el.innerHTML = eventos
        .filter(Boolean)
        .map(renderMiniEvento)
        .join('');
    }
  }

  if (perfilAtual === 'administrador' && usuario.permissoes?.length) {
    secaoAdmin?.classList.remove('is-hidden');
    const ul = document.getElementById('perfil-permissoes');

    if (ul) {
      ul.innerHTML = usuario.permissoes
        .map((p) => `<li>${p.replace(/_/g, ' ')}</li>`)
        .join('');
    }

    secaoAvaliador?.classList.remove('is-hidden');
  }
}

  document.addEventListener('DOMContentLoaded', init);


// ==========================================================
// DASHBOARD DO ADMINISTRADOR
// Filtros: Pendentes, Ativas e Bloqueadas
// ==========================================================

// ==========================================================
// DASHBOARD DO ADMINISTRADOR
// Filtros: Pendentes, Ativas e Bloqueadas
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {

  // Encontra o dashboard do administrador
  const avaliador = document.getElementById('avaliador-instituicao');

  if (!avaliador) return;

  // Pega os três botões de filtro
  const botoesFiltro = avaliador.querySelectorAll('.avaliador-filtro');

  // Pega as linhas reais da tabela
  const linhas = avaliador.querySelectorAll(
    '#avaliador-instituicoes-lista tr[data-status]'
  );

  // Mostra o status escolhido
  function aplicarFiltro(status, botaoSelecionado) {

    linhas.forEach((linha) => {

      // Mostra a linha se o status for igual ao filtro
      if (linha.dataset.status === status) {
        linha.style.display = '';
      } else {
        linha.style.display = 'none';
      }

    });

    // Remove o destaque dos botões
    botoesFiltro.forEach((botao) => {
      botao.classList.remove('avaliador-filtro--ativo');
    });

    // Destaca o botão escolhido
    botaoSelecionado?.classList.add('avaliador-filtro--ativo');

    // Verifica se existem instituições nesse status
    const existeInstituicao = Array.from(linhas).some(
      (linha) => linha.dataset.status === status
    );

    mostrarMensagemVazia(status, !existeInstituicao);
  }


  // Mostra mensagem quando não houver instituições
  function mostrarMensagemVazia(status, vazio) {

    const tbody = document.getElementById(
      'avaliador-instituicoes-lista'
    );

    if (!tbody) return;

    // Remove mensagem anterior
    tbody.querySelector('.avaliador-mensagem-vazia')?.remove();

    if (!vazio) return;

    let mensagem = '';

    if (status === 'ativa') {
      mensagem = 'Nenhuma instituição ativa no momento.';
    }

    if (status === 'bloqueada') {
      mensagem = 'Nenhuma instituição bloqueada no momento.';
    }

    // Cria a mensagem apenas para categorias vazias
    if (mensagem) {
      const linhaMensagem = document.createElement('tr');

      linhaMensagem.className = 'avaliador-mensagem-vazia';

      linhaMensagem.innerHTML = `
        <td colspan="4">
          ${mensagem}
        </td>
      `;

      tbody.appendChild(linhaMensagem);
    }
  }


  // Configura os cliques dos filtros
  botoesFiltro.forEach((botao) => {

    botao.addEventListener('click', () => {

      const filtro = botao.dataset.filtro;

      // Converte o nome do botão para o status usado nas linhas
      const status = filtro === 'pendentes'
        ? 'pendente'
        : filtro === 'ativas'
          ? 'ativa'
          : 'bloqueada';

      aplicarFiltro(status, botao);
    });

  });


  // Começa mostrando os pendentes
  const botaoPendentes = avaliador.querySelector(
    '[data-filtro="pendentes"]'
  );

  if (botaoPendentes) {
    aplicarFiltro('pendente', botaoPendentes);
  }

});


// ==========================================================
// MODAL "VER FICHA"
// Código que você já tinha
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
  const modalFicha = document.getElementById('modal-ficha-instituicao');
  const fecharModalFicha = document.querySelector('.modal-ficha__fechar');
  const nomeInstituicao = document.getElementById('modal-nome-instituicao');

  const botoesVerFicha = document.querySelectorAll('.avaliador-ver-ficha');

  botoesVerFicha.forEach((botao) => {
    botao.addEventListener('click', () => {
      const linha = botao.closest('tr');

      if (!linha || !modalFicha || !nomeInstituicao) {
        return;
      }

      const nome = linha.querySelector('td')?.textContent.trim();

      if (nome) {
        nomeInstituicao.textContent = nome;
      }

      modalFicha.style.display = 'flex';
    });
  });

  fecharModalFicha?.addEventListener('click', () => {
    if (modalFicha) modalFicha.style.display = 'none';
  });

  modalFicha?.addEventListener('click', (evento) => {
    if (evento.target === modalFicha) {
      modalFicha.style.display = 'none';
    }
  });
});