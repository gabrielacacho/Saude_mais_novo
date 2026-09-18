import { REGIOES } from '../mock-data.js';
import { bindLocalInputs, getLocal, onLocalChange, refreshLocalInputs } from '../utils/sync-local.js';
import { htmlOpcoesCategoria } from '../utils/filtros.js';
import { iconPin, iconCalendar, iconFilter, iconBell } from '../utils/icons.js'; 

const opcoesRegiao = REGIOES.map((r) => `<option value="${r.nome}">${r.nome}</option>`).join('');
const opcoesCategoria = htmlOpcoesCategoria();

export function renderHeader(container, options = {}) {
  const { showSearch = true, activePage = 'home' } = options;

  container.innerHTML = `
    <header class="hub-site-header">
      <!-- barra principal azul escura -->
      <div class="hub-container hub-header-inner">
        <div class="hub-brand-left">
            <img src="./imagem/Logo-PrefeituraSUS.png" alt="Prefeitura do Rio" class="logo-prefeitura">
        </div>

        <div class="hub-brand-center">
            <div class="logo-saude-texto">
                <a href="./index.html" style="display: flex; align-items: center;">
                    Saúde<span>Aqui</span>
                    <img src="./imagem/pin_transparente.png" alt="Pin Saúde Aqui" class="pin-titulo">
                </a>
            </div>
        </div>
        
        <div class="notificacoes-wrapper is-hidden" id="nav-notificacoes-wrapper">
          <button type="button" id="btn-notificacoes" class="notificacoes-btn" aria-label="Notificações" aria-expanded="false">
            ${iconBell()}
            <span id="notificacoes-contador" class="notificacoes-contador">3</span>
          </button>

          <div id="notificacoes-painel" class="notificacoes-painel is-hidden">
            <div class="notificacoes-cabecalho">
              <h3>Notificações</h3>
              <button type="button" id="btn-marcar-lidas" class="notificacoes-marcar">Marcar como lidas</button>
            </div>

            <div id="lista-notificacoes" class="notificacoes-lista">
              <button type="button" class="notificacao-item notificacao-item--nova">
                <span class="notificacao-ponto"></span>
                <span class="notificacao-conteudo">
                  <strong>Lembrete de Evento.</strong>
                  <span>Amanhã você tem "Vem Zumbar 60+".</span>
                  <small>Há 10 minutos</small>
                </span>
              </button>
              <button type="button" class="notificacao-item notificacao-item--nova">
                <span class="notificacao-ponto"></span>
                <span class="notificacao-conteudo">
                  <strong>Bem-vindo(a) ao Saúde Aqui!</strong>
                  <span>Seu perfil foi criado com sucesso.</span>
                  <small>Hoje</small>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- barra azul clara mais fininha -->
      <nav class="hub-nav-secundaria" aria-label="Navegação Principal">
        <div class="hub-container nav-links">
          ${activePage !== 'home' ? '<a href="index.html" class="nav-item">Início</a>' : ''}
          <a href="sobre.html" class="nav-item">Sobre Nós</a>
          
          <!-- BOTÕES DINÂMICOS (Controlados pelo JS) -->
          <a href="como-cadastrar.html" id="nav-btn-cadastrar-evento" class="nav-item is-hidden" style="color: var(--cor-destaque, #003B8E); font-weight: 800;">
            Como cadastrar evento
          </a>
          
          <a href="perfil.html" id="nav-btn-meu-perfil" class="nav-item is-hidden">Meu Perfil</a>
          <button type="button" id="nav-btn-sair" class="nav-item is-hidden" style="border: none; background: transparent; cursor: pointer; color: #D32F2F;">Sair</button>
          
          <a href="login.html" id="nav-btn-entrar" class="nav-item">Entrar</a>

        </div>
      </nav>
    </header>
  `;

  bindHeaderEvents(container, showSearch);
}

function bindHeaderEvents(container, showSearch) {
  // ==========================================
  // CONTROLE DE AUTENTICAÇÃO REAL (SESSÃO)
  // ==========================================
  const btnEntrar = container.querySelector('#nav-btn-entrar');
  const btnCadastrar = container.querySelector('#nav-btn-cadastrar');
  const btnMeuPerfil = container.querySelector('#nav-btn-meu-perfil');
  const btnSair = container.querySelector('#nav-btn-sair');
  const btnCadastrarEvento = container.querySelector('#nav-btn-cadastrar-evento');
  const notificacoesWrapper = container.querySelector('#nav-notificacoes-wrapper');

  const atualizarMenuAuth = () => {
    // Busca os dados do usuário no banco local
    const usuarioJSON = localStorage.getItem('usuarioLogado');
    
    if (usuarioJSON) {
      // USUÁRIO ESTÁ LOGADO
      const usuario = JSON.parse(usuarioJSON);
      
      btnEntrar?.classList.add('is-hidden');
      btnCadastrar?.classList.add('is-hidden');
      btnMeuPerfil?.classList.remove('is-hidden');
      btnSair?.classList.remove('is-hidden');
      notificacoesWrapper?.classList.remove('is-hidden');

      // Checa se é Institucional para liberar o cadastro de eventos
      if (usuario.perfil === 'institucional') {
        btnCadastrarEvento?.classList.remove('is-hidden');
      } else {
        btnCadastrarEvento?.classList.add('is-hidden');
      }
    } else {
      // USUÁRIO NÃO ESTÁ LOGADO
      btnEntrar?.classList.remove('is-hidden');
      btnCadastrar?.classList.remove('is-hidden');
      btnMeuPerfil?.classList.add('is-hidden');
      btnSair?.classList.add('is-hidden');
      btnCadastrarEvento?.classList.add('is-hidden');
      notificacoesWrapper?.classList.add('is-hidden');
    }
  };

  // Executa assim que a barra carrega
  atualizarMenuAuth();

  // Função do botão de Sair (Logout)
  btnSair?.addEventListener('click', () => {
    localStorage.removeItem('usuarioLogado'); // Apaga a sessão
    window.location.href = 'index.html'; // Chuta para a home deslogada
  });

  // ==========================================
  // NOTIFICAÇÕES E FILTROS (MANTIDOS)
  // ==========================================
  const btnNotificacoes = container.querySelector('#btn-notificacoes');
  const painelNotificacoes = container.querySelector('#notificacoes-painel');

  btnNotificacoes?.addEventListener('click', (e) => {
    e.stopPropagation();
    const estaAberto = !painelNotificacoes.classList.contains('is-hidden');
    painelNotificacoes.classList.toggle('is-hidden');
    btnNotificacoes.setAttribute('aria-expanded', String(!estaAberto));
  });

  painelNotificacoes?.addEventListener('click', (e) => e.stopPropagation());

  document.addEventListener('click', (e) => {
    if (!container.querySelector('.notificacoes-wrapper')?.contains(e.target)) {
      painelNotificacoes?.classList.add('is-hidden');
      btnNotificacoes?.setAttribute('aria-expanded', 'false');
    }
  });

  if (showSearch) {
    const inputLocal = container.querySelector('#search-local');
    bindLocalInputs([inputLocal], 'header');

    onLocalChange(() => refreshLocalInputs([inputLocal]));

    const painelLocal = container.querySelector('#painel-filtros-local');
    const painelEvento = container.querySelector('#painel-filtros-evento');
    const btnFiltrosLocal = container.querySelector('#btn-filtros-local');
    const btnFiltrosEvento = container.querySelector('#btn-filtros-evento');

    const togglePainel = (painel, btn, outro) => {
      const abrir = painel?.classList.contains('is-hidden');
      painelLocal?.classList.add('is-hidden');
      painelEvento?.classList.add('is-hidden');
      btnFiltrosLocal?.setAttribute('aria-expanded', 'false');
      btnFiltrosEvento?.setAttribute('aria-expanded', 'false');
      if (abrir) {
        painel?.classList.remove('is-hidden');
        btn?.setAttribute('aria-expanded', 'true');
        outro?.classList.add('is-hidden');
      }
    };

    btnFiltrosLocal?.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePainel(painelLocal, btnFiltrosLocal, painelEvento);
    });
    btnFiltrosEvento?.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePainel(painelEvento, btnFiltrosEvento, painelLocal);
    });

    document.addEventListener('click', (e) => {
      if (!container.querySelector('.hub-search-wrap')?.contains(e.target)) {
        painelLocal?.classList.add('is-hidden');
        painelEvento?.classList.add('is-hidden');
        btnFiltrosLocal?.setAttribute('aria-expanded', 'false');
        btnFiltrosEvento?.setAttribute('aria-expanded', 'false');
      }
    });

    container.querySelector('#filtro-regiao-header')?.addEventListener('change', (e) => {
      if (e.target.value) {
        inputLocal.value = e.target.value;
        inputLocal.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    const inputEvento = container.querySelector('#search-evento');
    const filtroCatEvento = container.querySelector('#filtro-categoria-header');
    const filtroCatLocal = container.querySelector('#filtro-categoria-local');
    const filtroData = container.querySelector('#filtro-data-header');

    const aplicarFiltroEventos = () => {
      window.dispatchEvent(
        new CustomEvent('filtro-eventos', {
          detail: {
            termo: inputEvento?.value?.trim() || '',
            categoria: filtroCatEvento?.value || '',
            data: filtroData?.value || '',
          },
        })
      );
    };

    const aplicarFiltroLocal = () => {
      window.dispatchEvent(
        new CustomEvent('filtro-local', {
          detail: { categoria: filtroCatLocal?.value || '' },
        })
      );
    };

    inputEvento?.addEventListener('input', aplicarFiltroEventos);
    filtroCatEvento?.addEventListener('change', aplicarFiltroEventos);
    filtroData?.addEventListener('change', aplicarFiltroEventos);
    filtroCatLocal?.addEventListener('change', aplicarFiltroLocal);
  }
}