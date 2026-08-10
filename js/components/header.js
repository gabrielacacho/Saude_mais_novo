import { REGIOES } from '../mock-data.js';
import { bindLocalInputs, getLocal, onLocalChange, refreshLocalInputs } from '../utils/sync-local.js';
import { htmlOpcoesCategoria } from '../utils/filtros.js';
import { iconPin, iconCalendar, iconFilter } from '../utils/icons.js'; // Removido o iconMenu

const opcoesRegiao = REGIOES.map((r) => `<option value="${r.nome}">${r.nome}</option>`).join('');
const opcoesCategoria = htmlOpcoesCategoria();

export function renderHeader(container, options = {}) {
  const { showSearch = true, activePage = 'home' } = options;

  container.innerHTML = `
    <header class="hub-site-header">
      <!-- BARRA PRINCIPAL AZUL ESCURA -->
      <div class="hub-container hub-header-inner">
        <div class="hub-brand-left">
            <img src="./imagem/Logo-PrefeituraSUS.png"
                alt="Prefeitura do Rio"
                class="logo-prefeitura">
        </div>

        <div class="hub-brand-center">
            <div class="logo-saude-texto"><a href="./index.html">Saúde<span>Aqui</span></a></div>
        </div>

        <div class="hub-profile-pill">
          <!-- O avatar agora funciona como botão para abrir o menu de perfis -->
          <button type="button" id="btn-perfil" class="hub-avatar" aria-label="Menu de Perfil" aria-expanded="false" title="Meu perfil">
            <span id="avatar-inicial">M</span>
          </button>
        </div>
      </div>

      <!-- NOVO MENU AZUL CLARO (ACESSIBILIDADE) -->
      <nav class="hub-nav-secundaria" aria-label="Navegação Principal">
        <div class="hub-container nav-links">
          ${activePage !== 'home' ? '<a href="index.html" class="nav-item">Início</a>' : ''}
          <a href="sobre.html" class="nav-item">Sobre Nós</a>
          <a href="perfil.html" class="nav-item">Meu perfil</a>
          <a href="login.html" class="nav-item">Entrar</a>
          <a href="cadastro.html" class="nav-item">Cadastrar</a>
        </div>
      </nav>

      <!-- DROPDOWN DE MOCK DE PERFIL (Abre ao clicar no Avatar) -->
      <div id="perfil-dropdown" class="hub-dropdown is-hidden">
        <p class="hub-dropdown-label">Alternar perfil (mock)</p>
        <button type="button" data-perfil="comum" class="hub-dropdown-item">Usuário Comum</button>
        <button type="button" data-perfil="institucional" class="hub-dropdown-item">Institucional</button>
        <button type="button" data-perfil="administrador" class="hub-dropdown-item">Administrador</button>
      </div>
    </header>
  `;

  bindHeaderEvents(container, showSearch);
}

function bindHeaderEvents(container, showSearch) {
  // Lógica para abrir o menu de perfis no avatar
  const menuPerfil = container.querySelector('#perfil-dropdown');
  const btnPerfil = container.querySelector('#btn-perfil');

  const toggleMenu = (e) => {
    e.stopPropagation();
    menuPerfil?.classList.toggle('is-hidden');
    const isExpanded = !menuPerfil?.classList.contains('is-hidden');
    btnPerfil?.setAttribute('aria-expanded', isExpanded);
  };

  btnPerfil?.addEventListener('click', toggleMenu);

  // Fecha o menu ao clicar fora
  document.addEventListener('click', (e) => {
    if (!container.querySelector('.hub-profile-pill')?.contains(e.target) && !menuPerfil?.contains(e.target)) {
      menuPerfil?.classList.add('is-hidden');
      btnPerfil?.setAttribute('aria-expanded', 'false');
    }
  });

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

  container.querySelectorAll('[data-perfil]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const perfil = btn.getAttribute('data-perfil');
      const iniciais = { comum: 'M', institucional: 'U', administrador: 'A' };
      const avatar = container.querySelector('#avatar-inicial');
      if (avatar) avatar.textContent = iniciais[perfil] || 'M';
      sessionStorage.setItem('perfilMock', perfil);
      menuPerfil?.classList.add('is-hidden');
      window.dispatchEvent(new CustomEvent('perfil-alterado', { detail: { perfil } }));
    });
  });

  const perfilSalvo = sessionStorage.getItem('perfilMock') || 'comum';
  const iniciais = { comum: 'M', institucional: 'U', administrador: 'A' };
  const avatar = container.querySelector('#avatar-inicial');
  if (avatar) avatar.textContent = iniciais[perfilSalvo] || 'M';
}