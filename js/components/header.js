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
        
        <!-- =====================================================
        SINO DE NOTIFICAÇÕES
        Fica no lado direito da logo, na barra azul escura.
        ===================================================== -->
    <div class="notificacoes-wrapper">

      <button
        type="button"
        id="btn-notificacoes"
        class="notificacoes-btn"
        aria-label="Notificações"
        aria-expanded="false"
      >
        ${iconBell()}

        <!-- Número de notificações não lidas -->
        <span
          id="notificacoes-contador"
          class="notificacoes-contador"
        >
          3
        </span>
      </button>

      <!-- Painel que aparece ao clicar no sino -->
      <div
        id="notificacoes-painel"
        class="notificacoes-painel is-hidden"
      >

        <div class="notificacoes-cabecalho">
          <h3>Notificações</h3>

          <button
            type="button"
            id="btn-marcar-lidas"
            class="notificacoes-marcar"
          >
            Marcar como lidas
          </button>
        </div>

        <div
          id="lista-notificacoes"
          class="notificacoes-lista"
        >

          <button
            type="button"
            class="notificacao-item notificacao-item--nova"
          >
            <span class="notificacao-ponto"></span>

            <span class="notificacao-conteudo">
              <strong>Lembrete de Evento!!!</strong>
              <span>Amanhã você tem "Vêm Zumbar 60+".</span>
              <small>Há 10 minutos</small>
            </span>
          </button>

          <button
            type="button"
            class="notificacao-item notificacao-item--nova"
          >
            <span class="notificacao-ponto"></span>

            <span class="notificacao-conteudo">
              <strong>Talvez esse evento te enteresse...</strong>
              <span>Palestra: Hipertensão e Você.</span>
              <small>Há 1 hora</small>
            </span>
          </button>

          <button
            type="button"
            class="notificacao-item notificacao-item--nova"
          >
            <span class="notificacao-ponto"></span>

            <span class="notificacao-conteudo">
              <strong>Bem-vindo ao Hub Saúde</strong>
              <span>Seu perfil foi criado com sucesso.</span>
              <small>Hoje</small>
            </span>
          </button>

        </div>
      </div>

    </div>



        <!-- tiramos o avatar daqui -->
      </div>

      <!-- barra azul clara mais fininha -->
      <nav class="hub-nav-secundaria" aria-label="Navegação Principal">
        <div class="hub-container nav-links">
          ${activePage !== 'home' ? '<a href="index.html" class="nav-item">Início</a>' : ''}
          <a href="sobre.html" class="nav-item">Sobre Nós</a>
          
          <!-- wrapper do meu perfil pra ancorar o menu -->
          <div class="nav-dropdown-wrapper">
            <button type="button" id="btn-meu-perfil" class="nav-item nav-dropdown-btn" aria-expanded="false">
              Meu perfil <span class="setinha">▼</span>
            </button>
            
            <!-- menu que abre quando clica em meu perfil -->
            <div id="perfil-dropdown" class="hub-dropdown is-hidden">
              <p class="hub-dropdown-label">Alternar perfil (mock)</p>
              <button type="button" data-perfil="comum" class="hub-dropdown-item">Usuário Comum</button>
              <button type="button" data-perfil="institucional" class="hub-dropdown-item">Institucional</button>
              <button type="button" data-perfil="administrador" class="hub-dropdown-item">Administrador</button>
            </div>
          </div>

          <a href="login.html" class="nav-item">Entrar</a>
          <a href="cadastro.html" class="nav-item">Cadastrar</a>
        </div>
      </nav>
    </header>
  `;

  bindHeaderEvents(container, showSearch);
}

function bindHeaderEvents(container, showSearch) {
    // =====================================================
  // NOTIFICAÇÕES
  // =====================================================

  const btnNotificacoes = container.querySelector('#btn-notificacoes');
  const painelNotificacoes = container.querySelector('#notificacoes-painel');

  btnNotificacoes?.addEventListener('click', (e) => {
    e.stopPropagation();

    const estaAberto = !painelNotificacoes.classList.contains('is-hidden');

    painelNotificacoes.classList.toggle('is-hidden');

    btnNotificacoes.setAttribute(
      'aria-expanded',
      String(!estaAberto)
    );
  });

  // Não fecha quando clicar dentro do painel
  painelNotificacoes?.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Fecha quando clicar fora
  document.addEventListener('click', (e) => {
    if (!container.querySelector('.notificacoes-wrapper')?.contains(e.target)) {
      painelNotificacoes?.classList.add('is-hidden');
      btnNotificacoes?.setAttribute('aria-expanded', 'false');
    }
  });
  //fim da notificação


  // abre e fecha o menu do meu perfil
  const menuPerfil = container.querySelector('#perfil-dropdown');
  const btnMeuPerfil = container.querySelector('#btn-meu-perfil');

  const toggleMenu = (e) => {
    e.stopPropagation();
    menuPerfil?.classList.toggle('is-hidden');
    const taAberto = !menuPerfil?.classList.contains('is-hidden');
    btnMeuPerfil?.setAttribute('aria-expanded', taAberto);
  };

  btnMeuPerfil?.addEventListener('click', toggleMenu);

  // esconde o menu se clicar fora dele
  document.addEventListener('click', (e) => {
    if (!container.querySelector('.nav-dropdown-wrapper')?.contains(e.target)) {
      menuPerfil?.classList.add('is-hidden');
      btnMeuPerfil?.setAttribute('aria-expanded', 'false');
    }
  });

  // tudo dos filtros continua igual
  if (showSearch) {
    const inputLocal = container.querySelector('#search-local');
    bindLocalInputs([inputLocal], 'header');

    onLocalChange(() => {
      refreshLocalInputs([inputLocal]);
    });

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
      const select = e.target;
      if (select.value) {
        inputLocal.value = select.value;
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

  // logica de mudar o mock e mandar pra pagina
  container.querySelectorAll('[data-perfil]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const perfil = btn.getAttribute('data-perfil');
      
      // salva no mock e fecha
      sessionStorage.setItem('perfilMock', perfil);
      menuPerfil?.classList.add('is-hidden');
      window.dispatchEvent(new CustomEvent('perfil-alterado', { detail: { perfil } }));
      
      // manda direto pro perfil
      window.location.href = 'perfil.html';
    });
  });
}