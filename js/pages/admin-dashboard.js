import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { listarUnidades } from '../services/unidades-api.js';

let todasAsUnidades = [];
let statusFiltroAtual = 'todas'; // 'todas', 'pendente', 'ativo', 'bloqueado'

document.addEventListener('DOMContentLoaded', async () => {
  const headerRoot = document.getElementById('header-root');
  const footerRoot = document.getElementById('footer-root');

  if (headerRoot) renderHeader(headerRoot, { showSearch: false, activePage: 'admin' });
  if (footerRoot) renderFooter(footerRoot);

  const welcome = document.getElementById('admin-welcome-nome');
  if (welcome) welcome.textContent = "BEM-VINDO, ADMINISTRADOR!";

  // Inicializa os filtros na tela e carrega os dados
  configurarFiltrosUI();
  await carregarDadosDashboardComLoading();
});

// Controla o estado de Loading, Erro e Sucesso
async function carregarDadosDashboardComLoading() {
  const containerTabela = document.getElementById('tabela-unidades-corpo') || document.getElementById('unidades-grid');
  
  if (containerTabela) {
    containerTabela.innerHTML = `<p class="hub-loading-msg">A carregar instituições...</p>`;
  }

  try {
    // Busca dados reais da API
    todasAsUnidades = await listarUnidades();
    
    // Normaliza os status caso venham diferentes da API (ex: garantindo propriedade status)
    todasAsUnidades = todasAsUnidades.map(u => ({
      ...u,
      status: u.status ? u.status.toLowerCase() : 'ativo' // Assume ativo por padrão se não vier definido
    }));

    atualizarContadoresCards();
    renderizarListaFiltrada();

  } catch (erro) {
    console.warn("Erro ao carregar da API, usando fallback de teste:", erro);
    
    // Estado de Erro / Fallback seguro para testes visuais
    todasAsUnidades = [
      { id: '1', nome: 'UBS Central (Exemplo)', endereco: 'Rua Principal, 100', status: 'ativo' },
      { id: '2', nome: 'Clínica Saúde & Vida', endereco: 'Av. Brasil, 500', status: 'pendente' },
      { id: '3', nome: 'Posto Avançado Norte', endereco: 'Rua das Flores, 12', status: 'bloqueado' }
    ];

    atualizarContadoresCards();
    renderizarListaFiltrada();
  }
}

// Atualiza a contagem dinâmica nos 3 cards principais
function atualizarContadoresCards() {
  const countPending = document.getElementById('count-pending');
  const countActive = document.getElementById('count-active');
  const countBlocked = document.getElementById('count-blocked');

  const qtdPendentes = todasAsUnidades.filter(u => u.status === 'pendente').length;
  const qtdAtivas = todasAsUnidades.filter(u => u.status === 'ativo').length;
  const qtdBloqueadas = todasAsUnidades.filter(u => u.status === 'bloqueado').length;

  if (countPending) countPending.textContent = qtdPendentes;
  if (countActive) countActive.textContent = qtdAtivas;
  if (countBlocked) countBlocked.textContent = qtdBloqueadas;
}

// Renderiza a lista respeitando o filtro ativo e o estado vazio
function renderizarListaFiltrada() {
  const containerTabela = document.getElementById('tabela-unidades-corpo') || document.getElementById('unidades-grid');
  if (!containerTabela) return;

  const unidadesFiltradas = todasAsUnidades.filter(u => {
    if (statusFiltroAtual === 'todas') return true;
    return u.status === statusFiltroAtual;
  });

  // Estado Vazio
  if (unidadesFiltradas.length === 0) {
    containerTabela.innerHTML = `<p class="hub-empty-msg">Nenhuma instituição encontrada para este filtro.</p>`;
    return;
  }

  containerTabela.innerHTML = unidadesFiltradas.map(unidade => `
    <div class="hub-admin-card-item" data-id="${unidade.id}">
      <div class="hub-admin-info">
        <h4>${unidade.nome}</h4>
        <p>${unidade.endereco}</p>
      </div>
      <div class="hub-admin-actions">
        <span class="hub-badge hub-badge--${unidade.status}">${unidade.status.toUpperCase()}</span>
      </div>
    </div>
  `).join('');
}

// Configura os cliques nos cards/filtros
function configurarFiltrosUI() {
  const cardPending = document.querySelector('.admin-card:has(#count-pending)') || document.getElementById('card-pending');
  const cardActive = document.querySelector('.admin-card:has(#count-active)') || document.getElementById('card-active');
  const cardBlocked = document.querySelector('.admin-card:has(#count-blocked)') || document.getElementById('card-blocked');

  // Torna os cards clicáveis para filtrar a listagem abaixo
  if (cardPending) {
    cardPending.style.cursor = 'pointer';
    cardPending.addEventListener('click', () => { statusFiltroAtual = 'pendente'; renderizarListaFiltrada(); });
  }
  if (cardActive) {
    cardActive.style.cursor = 'pointer';
    cardActive.addEventListener('click', () => { statusFiltroAtual = 'ativo'; renderizarListaFiltrada(); });
  }
  if (cardBlocked) {
    cardBlocked.style.cursor = 'pointer';
    cardBlocked.addEventListener('click', () => { statusFiltroAtual = 'bloqueado'; renderizarListaFiltrada(); });
  }
}