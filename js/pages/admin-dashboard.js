import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';

async function init() {
  // pega quem ta logado no momento
  const perfilAtual = sessionStorage.getItem('perfilMock') || 'comum';

  // barreira de seguranca: se nao for admin, manda pra home e para o codigo
  if (perfilAtual !== 'administrador') {
    window.location.href = 'index.html';
    return;
  }

  const headerRoot = document.getElementById('header-root');
  const footerRoot = document.getElementById('footer-root');

  // renderiza o cabecalho sem barra de busca
  if (headerRoot) {
    renderHeader(headerRoot, { showSearch: false, activePage: 'admin' });
  }

  // renderiza o rodape
  if (footerRoot) {
    renderFooter(footerRoot);
  }

  // carrega os numeros do painel
  carregarDadosDashboard(perfilAtual);

  // se ele tiver na pagina de admin e trocar pro comum no menu, expulsa pra home
  window.addEventListener('perfil-alterado', (e) => {
    if (e.detail.perfil !== 'administrador') {
      window.location.href = 'index.html';
    }
  });
}

function carregarDadosDashboard(perfilChave) {
  // pega os dados reais ou joga o padrao
  const chave = perfilChave || sessionStorage.getItem('perfilMock') || 'administrador';
  
  // obs: garanta que a funcao getUsuarioPerfil ta sendo importada no topo do seu arquivo
  const usuario = typeof getUsuarioPerfil === 'function' ? getUsuarioPerfil(chave) : null;

  document.title = `Painel Administrativo — Saúde Aqui`;

  // arruma o nome de boas vindas
  const welcomeElement = document.getElementById('admin-welcome-nome');
  if (welcomeElement) {
    const nomeExibicao = usuario?.nome ? usuario.nome.toUpperCase() : 'ADMINISTRADOR';
    welcomeElement.textContent = `BEM VINDO, ${nomeExibicao}!`;
  }

  // joga os numeros hardcoded por enquanto (mock)
  const countPending = document.getElementById('count-pending');
  const countActive = document.getElementById('count-active');
  const countBlocked = document.getElementById('count-blocked');

  if (countPending) countPending.textContent = '100';
  if (countActive) countActive.textContent = '1.000.000';
  if (countBlocked) countBlocked.textContent = '0';
}

document.addEventListener('DOMContentLoaded', init);