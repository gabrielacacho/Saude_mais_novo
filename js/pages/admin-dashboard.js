import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';

async function init() {
  const headerRoot = document.getElementById('header-root');
  const footerRoot = document.getElementById('footer-root');

  // 1. Renderiza o Header (sem a barra de busca, indicando a página ativa 'admin')
  if (headerRoot) {
    renderHeader(headerRoot, { showSearch: false, activePage: 'admin' });
  }

  // 2. Renderiza o Footer
  if (footerRoot) {
    renderFooter(footerRoot);
  }

  // 3. Atualiza os dados da tela com base no perfil ativo
  carregarDadosDashboard();

  // 4. Escuta o evento do dropdown do Header (quando você clica no Avatar e troca de perfil)
  window.addEventListener('perfil-alterado', (e) => {
    carregarDadosDashboard(e.detail.perfil);
  });
}

function carregarDadosDashboard(perfilChave) {
  const chave = perfilChave || sessionStorage.getItem('perfilMock') || 'administrador';
  const usuario = getUsuarioPerfil(chave);

  document.title = `Painel Administrativo — Hub Saúde`;

  // Atualiza o nome de boas-vindas no painel
  const welcomeElement = document.getElementById('admin-welcome-nome');
  if (welcomeElement) {
    const nomeExibicao = usuario?.nome ? usuario.nome.toUpperCase() : 'FULANO DE TAL';
    welcomeElement.textContent = `BEM VINDO, ${nomeExibicao}!`;
  }

  // Define os valores das métricas (Você pode integrar com API/Mock aqui)
  document.getElementById('count-pending').textContent = '100';
  document.getElementById('count-active').textContent = '1.000.000';
  document.getElementById('count-blocked').textContent = '0';
}

document.addEventListener('DOMContentLoaded', init);