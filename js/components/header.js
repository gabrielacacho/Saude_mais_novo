/** Cabeçalho global compartilhado */

import { REGIOES } from '../mock-data.js';
import { bindLocalInputs, getLocal, onLocalChange, refreshLocalInputs } from '../utils/sync-local.js';
import { htmlOpcoesCategoria } from '../utils/filtros.js';
import { iconPin, iconCalendar, iconFilter, iconMenu } from '../utils/icons.js';

const opcoesRegiao = REGIOES.map((r) => `<option value="${r.nome}">${r.nome}</option>`).join('');
const opcoesCategoria = htmlOpcoesCategoria();

export function renderHeader(container, options = {}) {
  const { showSearch = true, activePage = 'home' } = options;

  container.innerHTML = `
    <header class="hub-site-header">
      <div class="hub-container hub-header-inner">
        <div class="hub-brand-left">
            <img src="./imagem/logo-prefeitura.png"
                alt="Prefeitura do Rio"
                class="logo-prefeitura">
        </div>

        <div class="hub-brand-center">
            <div class="logo-saude-texto">Saúde<span>+</span></div>
        </div>

        ${
          showSearch
            ? `
        <div class="hub-search-wrap">
          <div class="hub-search">
            <label class="hub-search-field hub-search-field--divider">
              <span class="sr-only">Local</span>
              ${iconPin()}
              <input type="text" id="search-local" class="hub-search-input" placeholder="Digite o local" autocomplete="off" value="${getLocal()}" />
              <button type="button" class="hub-search-filtros-btn" id="btn-filtros-local" aria-expanded="false" title="Filtros opcionais">${iconFilter()}</button>
            </label>
            <label class="hub-search-field">
              <span class="sr-only">Evento</span>
              ${iconCalendar()}
              <input type="text" id="search-evento" class="hub-search-input" placeholder="Digite o Evento" autocomplete="off" />
              <button type="button" class="hub-search-filtros-btn" id="btn-filtros-evento" aria-expanded="false" title="Filtros opcionais">${iconFilter()}</button>
            </label>
          </div>
          <div id="painel-filtros-local" class="hub-search-filtros is-hidden">
            <p class="hub-search-filtros__titulo">Filtros de local (opcional)</p>
            <div class="hub-search-filtros__grid">
              <div>
                <label class="hub-label" for="filtro-regiao-header">Região sugerida</label>
                <select id="filtro-regiao-header" class="hub-select hub-select--modal">${opcoesRegiao}</select>
              </div>
              <div>
                <label class="hub-label" for="filtro-categoria-local">Categoria</label>
                <select id="filtro-categoria-local" class="hub-select hub-select--modal">${opcoesCategoria}</select>
              </div>
              <div>
                <label class="hub-label" for="filtro-raio">Raio (mock)</label>
                <select id="filtro-raio" class="hub-select hub-select--modal">
                  <option>5 km</option>
                  <option>10 km</option>
                  <option>20 km</option>
                </select>
              </div>
            </div>
          </div>
          <div id="painel-filtros-evento" class="hub-search-filtros is-hidden">
            <p class="hub-search-filtros__titulo">Filtros de evento (opcional)</p>
            <div class="hub-search-filtros__grid">
              <div>
                <label class="hub-label" for="filtro-categoria-header">Categoria</label>
                <select id="filtro-categoria-header" class="hub-select hub-select--modal">${opcoesCategoria}</select>
              </div>
              <div>
                <label class="hub-label" for="filtro-data-header">Data</label>
                <input type="date" id="filtro-data-header" class="hub-input hub-select--modal" />
              </div>
            </div>
          </div>
        </div>
        `
            : '<div class="hub-search-wrap"></div>'
        }

        <div class="hub-profile-pill">
          <button type="button" id="btn-menu" class="hub-icon-btn" aria-label="Menu">${iconMenu()}</button>
          <a href="perfil.html" id="btn-perfil" class="hub-avatar" title="Meu perfil">
            <span id="avatar-inicial">M</span>
          </a>
        </div>
      </div>

      <div id="menu-dropdown" class="hub-dropdown is-hidden">
        <p class="hub-dropdown-label">Alternar perfil (mock)</p>
        <button type="button" data-perfil="comum" class="hub-dropdown-item">Usuário Comum</button>
        <button type="button" data-perfil="institucional" class="hub-dropdown-item">Institucional</button>
        <button type="button" data-perfil="administrador" class="hub-dropdown-item">Administrador</button>
        <hr />
        <a href="perfil.html" class="hub-dropdown-item">Meu perfil</a>
        <a href="login.html" class="hub-dropdown-item">Entrar</a>
        <a href="cadastro.html" class="hub-dropdown-item">Cadastrar</a>
        ${activePage !== 'home' ? '<a href="index.html" class="hub-dropdown-item">Início</a>' : ''}
      </div>
    </header>
  `;

  bindHeaderEvents(container, showSearch);
}

function bindHeaderEvents(container, showSearch) {
  const menu = container.querySelector('#menu-dropdown');

  const toggleMenu = () => menu?.classList.toggle('is-hidden');

  container.querySelector('#btn-menu')?.addEventListener('click', toggleMenu);

  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      menu?.classList.add('is-hidden');
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
      menu?.classList.add('is-hidden');
      window.dispatchEvent(new CustomEvent('perfil-alterado', { detail: { perfil } }));
    });
  });

  const perfilSalvo = sessionStorage.getItem('perfilMock') || 'comum';
  const iniciais = { comum: 'M', institucional: 'U', administrador: 'A' };
  const avatar = container.querySelector('#avatar-inicial');
  if (avatar) avatar.textContent = iniciais[perfilSalvo] || 'M';
}
