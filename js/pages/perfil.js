import { getUsuarioPerfil, getRegiaoById } from '../mock-data.js';
import { getEventoById } from '../services/evento-api.js'; // migrando só os eventos

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

  renderHeader(document.getElementById('header-root'), { showSearch: false, activePage: 'perfil' });
  renderFooter(document.getElementById('footer-root'));

  document.title = `${usuario.nome} — Saúde Aqui`;
  document.getElementById('perfil-avatar').textContent = usuario.avatarInicial;
  document.getElementById('perfil-tipo').textContent = usuario.tipo;
  document.getElementById('perfil-nome').textContent = usuario.nome;

  // preenche os dados basicos
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

  // mapeia todas as secoes pra controlar a exibicao
  const secaoInscricoes = document.getElementById('perfil-secao-inscricoes');
  const secaoGerenciados = document.getElementById('perfil-secao-gerenciados');
  const secaoAdmin = document.getElementById('perfil-secao-admin');
  const secaoAvaliador = document.getElementById('avaliador-instituicao'); // o dash novo

  // trava de seguranca: esconde tudo antes de decidir o que mostrar
  if (secaoInscricoes) secaoInscricoes.classList.add('is-hidden');
  if (secaoGerenciados) secaoGerenciados.classList.add('is-hidden');
  if (secaoAdmin) secaoAdmin.classList.add('is-hidden');
  if (secaoAvaliador) secaoAvaliador.classList.add('is-hidden');

  // carrega tela de usuario comum
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

  // carrega tela institucional
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

  // carrega tela do admin (painel de permissoes + dashboard avaliador)
  if (perfilAtual === 'administrador') {
    // painel antigo de permissoes
    if (usuario.permissoes?.length) {
      secaoAdmin?.classList.remove('is-hidden');
      const ul = document.getElementById('perfil-permissoes');
      if (ul) {
        ul.innerHTML = usuario.permissoes.map((p) => `<li>${p.replace(/_/g, ' ')}</li>`).join('');
      }
    }
    
    // painel novo de avaliacao 
    if (secaoAvaliador) {
      secaoAvaliador.classList.remove('is-hidden');
    }
  }
}

document.addEventListener('DOMContentLoaded', init);


// =========================================
// modal - ficha da instituicao
// =========================================
const modalFicha = document.getElementById('modal-ficha-instituicao');
const fecharModalFicha = document.querySelector('.modal-ficha__fechar');
const nomeInstituicao = document.getElementById('modal-nome-instituicao');

const botoesVerFicha = document.querySelectorAll('.avaliador-ver-ficha');

botoesVerFicha.forEach((botao) => {
  botao.addEventListener('click', () => {
    // pega a linha da instituicao clicada
    const linha = botao.closest('tr');

    // pega o nome da primeira coluna
    const nome = linha.querySelector('td').textContent.trim();

    // coloca o nome no titulo do modal
    nomeInstituicao.textContent = nome;

    // abre o modal
    modalFicha.style.display = 'flex';
  });
});

// fechar pelo x
fecharModalFicha?.addEventListener('click', () => {
  modalFicha.style.display = 'none';
});

// fechar clicando no fundo escuro
modalFicha?.addEventListener('click', (evento) => {
  if (evento.target === modalFicha) {
    modalFicha.style.display = 'none';
  }
});