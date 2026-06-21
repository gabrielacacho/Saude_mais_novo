import {
  EVENTOS,
  REGIOES,
  USUARIOS,
  PINS_MAPA,
  getEventosPorRegiao,
  getRegiaoById,
  getEventoById,
  getPostoById,
} from '../mock-data.js';
import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { bindLocalInputs, getLocal, onLocalChange, setLocal } from '../utils/sync-local.js';
import { iconPin, iconCalendar, iconBuilding } from '../utils/icons.js';

const MESES = [
  'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
  'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO',
];
const DIAS_SEMANA = ['DOM.', 'SEG.', 'TER.', 'QUA.', 'QUI.', 'SEX.', 'SÁB.'];
const ANO_FIXO = 2026;

let mesAtual = 4;
let filtroEvento = { termo: '', categoria: '', data: '' };
let filtroLocalCategoria = '';

function getInscricoes() {
  const perfil = sessionStorage.getItem('perfilMock') || 'comum';
  return USUARIOS[perfil]?.inscricoes || [];
}

function resolveRegiaoId(texto) {
  const t = texto.trim().toLowerCase();
  if (!t) return 'urca';
  const porId = REGIOES.find((r) => r.id === t.replace(/\s+/g, '-'));
  if (porId) return porId.id;
  const porNome = REGIOES.find((r) => r.nome.toLowerCase() === t);
  if (porNome) return porNome.id;
  const parcial = REGIOES.find((r) => r.nome.toLowerCase().includes(t) || t.includes(r.nome.toLowerCase()));
  return parcial?.id || null;
}

function passaFiltroEvento(categoriaItem) {
  if (!filtroEvento.categoria) return true;
  return categoriaItem === filtroEvento.categoria;
}

function passaFiltroLocalPosto(servicos) {
  if (!filtroLocalCategoria) return true;
  return servicos.some((s) => s === filtroLocalCategoria);
}

function eventosFiltradosPorLocal(textoLocal) {
  const regiaoId = resolveRegiaoId(textoLocal);
  let lista;
  if (regiaoId) {
    lista = getEventosPorRegiao(regiaoId);
    if (!lista.length) lista = [...EVENTOS];
  } else {
    const t = textoLocal.trim().toLowerCase();
    lista = !t
      ? [...EVENTOS]
      : EVENTOS.filter(
          (e) =>
            e.localizacao.toLowerCase().includes(t) ||
            getRegiaoById(e.regiao).nome.toLowerCase().includes(t)
        );
  }
  return lista.filter((e) => passaFiltroEvento(e.categoria));
}

function aplicarFiltrosEvento(lista) {
  let result = [...lista];
  const { termo, categoria, data } = filtroEvento;
  if (termo) {
    const t = termo.toLowerCase();
    result = result.filter((e) => e.titulo.toLowerCase().includes(t));
  }
  if (categoria) {
    result = result.filter((e) => e.categoria === categoria);
  }
  if (data) {
    result = result.filter((e) => e.data === data);
  }
  return result;
}

function atualizarLabelMapa(texto) {
  const label = document.getElementById('mapa-local-label');
  if (label) {
    label.textContent = texto.trim().toUpperCase() || 'DIGITE O LOCAL';
  }
}

function htmlPopoverEvento(ev) {
  return `
    <div class="hub-popover hub-popover--${ev.categoria.toLowerCase()}">
      <p class="hub-popover__tipo">${iconCalendar()} Evento · ${ev.categoria}</p>
      <p class="hub-popover__titulo">${ev.titulo}</p>
      <p class="hub-popover__meta">${ev.dataExibicao} · ${ev.localizacao}</p>
      <a href="evento.html?id=${ev.id}" class="hub-popover__link">Ver evento</a>
    </div>
  `;
}

function htmlPopoverPosto(posto) {
  return `
    <div class="hub-popover hub-popover--posto">
      <p class="hub-popover__tipo">${iconBuilding()} Posto de saúde</p>
      <p class="hub-popover__titulo">${posto.nome}</p>
      <p class="hub-popover__meta">${posto.endereco}</p>
      <a href="posto.html?id=${posto.id}" class="hub-popover__link">Ver posto</a>
    </div>
  `;
}

function renderMapaPins() {
  const container = document.getElementById('mapa-pins');
  if (!container) return;

  container.innerHTML = PINS_MAPA.map((pin) => {
    if (pin.tipo === 'posto') {
      const posto = getPostoById(pin.refId);
      if (!posto) return '';
      if (!passaFiltroLocalPosto(posto.servicos)) {
        return '';
      }
      return `
        <div class="pin-mapa pin-mapa--posto pin-mapa--pos-${pin.pos}">
          <span class="pin-mapa__icon">${iconBuilding()}</span>
          ${htmlPopoverPosto(posto)}
        </div>
      `;
    }
    const ev = getEventoById(pin.refId);
    if (!ev || !passaFiltroEvento(ev.categoria)) return '';
    if (filtroLocalCategoria && ev.categoria !== filtroLocalCategoria) return '';
    return `
      <div class="pin-mapa pin-mapa--evento pin-mapa--pos-${pin.pos}">
        <span class="pin-mapa__icon">${iconCalendar()}</span>
        ${htmlPopoverEvento(ev)}
      </div>
    `;
  }).join('');
}

function htmlCalEvento(ev) {
  return `
    <div class="cal-evento-mini-wrap">
      <button type="button" class="cal-evento-mini" aria-expanded="false">${ev.titulo}</button>
      ${htmlPopoverEvento(ev)}
    </div>
  `;
}

function renderCalendario() {
  const grid = document.getElementById('calendario-grid');
  if (!grid) return;

  const mes = mesAtual;
  const ano = ANO_FIXO;

  const primeiroDia = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const diasMesAnterior = new Date(ano, mes, 0).getDate();

  const eventosNoMes = EVENTOS.filter((e) => {
    const [y, m] = e.data.split('-').map(Number);
    return y === ano && m === mes + 1 && passaFiltroEvento(e.categoria);
  });

  let html = DIAS_SEMANA.map((d) => `<div class="cal-header-dia">${d}</div>`).join('');

  for (let i = 0; i < primeiroDia; i++) {
    const dia = diasMesAnterior - primeiroDia + i + 1;
    html += `<div class="cal-dia cal-dia--muted"><span class="cal-numero">${dia}</span></div>`;
  }

  const hoje = new Date();
  const diaHoje = hoje.getFullYear() === ano && hoje.getMonth() === mes ? hoje.getDate() : null;

  for (let dia = 1; dia <= diasNoMes; dia++) {
    const dataStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    const todosNoDia = eventosNoMes.filter((e) => e.data === dataStr);
    const selecionado = diaHoje !== null && dia === diaHoje;

    const eventosHtml = todosNoDia
      .slice(0, 2)
      .map((ev) => htmlCalEvento(ev))
      .join('');

    html += `
      <div class="cal-dia ${selecionado ? 'cal-dia--selecionado' : ''}">
        <span class="cal-numero">${dia}</span>
        <div class="cal-dia__eventos">${eventosHtml}</div>
      </div>
    `;
  }

  const totalCelulas = primeiroDia + diasNoMes;
  const restante = totalCelulas % 7 === 0 ? 0 : 7 - (totalCelulas % 7);
  for (let i = 1; i <= restante; i++) {
    html += `<div class="cal-dia cal-dia--muted"><span class="cal-numero">${i}</span></div>`;
  }

  grid.innerHTML = html;
  bindCalendarioPopovers(grid);
}

function bindCalendarioPopovers(grid) {
  grid.querySelectorAll('.cal-evento-mini-wrap').forEach((wrap) => {
    const btn = wrap.querySelector('.cal-evento-mini');
    btn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const aberto = wrap.classList.contains('is-popover-open');
      grid.querySelectorAll('.cal-evento-mini-wrap').forEach((w) => {
        w.classList.remove('is-popover-open');
        w.querySelector('.cal-evento-mini')?.setAttribute('aria-expanded', 'false');
      });
      if (!aberto) {
        wrap.classList.add('is-popover-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

function renderEventos() {
  const grid = document.getElementById('eventos-grid');
  const inputRegiao = document.getElementById('regiao-nome');
  if (!inputRegiao || !grid) return;

  const textoLocal = getLocal();
  if (document.activeElement !== inputRegiao) {
    inputRegiao.value = textoLocal;
  }

  let lista = eventosFiltradosPorLocal(textoLocal);
  lista = aplicarFiltrosEvento(lista);
  if (!lista.length) lista = aplicarFiltrosEvento(EVENTOS.slice(0, 6));

  grid.innerHTML = lista
    .map(
      (ev) => `
    <a href="evento.html?id=${ev.id}" class="hub-event-card">
      <div class="hub-event-card__img-wrap">
        <img src="${ev.foto_capa}" alt="${ev.titulo}" class="hub-event-card__img" loading="lazy" />
      </div>
      <div class="hub-event-card__body">
        <h3 class="hub-event-card__title">${ev.titulo}</h3>
        <p class="hub-event-card__meta">${iconCalendar()} ${ev.dataExibicao}</p>
        <p class="hub-event-card__meta">${iconPin()} ${ev.localizacao}</p>
      </div>
    </a>
  `
    )
    .join('');
}

function initSeletorCalendario() {
  const selectMes = document.getElementById('cal-mes');
  if (!selectMes) return;

  selectMes.innerHTML = MESES.map((nome, i) => `<option value="${i}">${nome}</option>`).join('');
  selectMes.value = String(mesAtual);

  selectMes.addEventListener('change', () => {
    mesAtual = Number(selectMes.value);
    renderCalendario();
  });
}

function initCamposLocal() {
  const mapaInput = document.getElementById('mapa-busca-local');
  const regiaoInput = document.getElementById('regiao-nome');

  bindLocalInputs([mapaInput, regiaoInput], 'home');

  onLocalChange((texto) => {
    atualizarLabelMapa(texto);
    renderEventos();
    renderMapaPins();
    [mapaInput, regiaoInput].forEach((el) => {
      if (el && document.activeElement !== el) {
        el.dataset.syncing = '1';
        el.value = texto;
        delete el.dataset.syncing;
      }
    });
    const headerInput = document.getElementById('search-local');
    if (headerInput && document.activeElement !== headerInput) {
      headerInput.dataset.syncing = '1';
      headerInput.value = texto;
      delete headerInput.dataset.syncing;
    }
  });

  atualizarLabelMapa(getLocal());
}

function initPanelIcons() {
  const pinEl = document.querySelector('.hub-panel-header--input .hub-panel-header__icon');
  const calEl = document.querySelector('.hub-panel-header__icon--cal');
  if (pinEl) {
    pinEl.innerHTML = iconPin().replace('class="hub-icon"', 'class="hub-icon hub-icon--lg"');
  }
  if (calEl) {
    calEl.innerHTML = iconCalendar().replace('class="hub-icon"', 'class="hub-icon hub-icon--lg"');
  }
}

function init() {
  setLocal('Urca', 'init');

  renderHeader(document.getElementById('header-root'), { showSearch: true, activePage: 'home' });

  renderFooter(document.getElementById('footer-root'));
  
  initPanelIcons();
  initSeletorCalendario();
  initCamposLocal();
  renderMapaPins();
  renderCalendario();
  renderEventos();

  document.addEventListener('click', () => {
    document.querySelectorAll('.cal-evento-mini-wrap.is-popover-open').forEach((w) => {
      w.classList.remove('is-popover-open');
      w.querySelector('.cal-evento-mini')?.setAttribute('aria-expanded', 'false');
    });
  });

  window.addEventListener('perfil-alterado', () => {
    renderCalendario();
  });

  window.addEventListener('filtro-eventos', (e) => {
    filtroEvento = e.detail;
    renderEventos();
    renderCalendario();
    renderMapaPins();
  });

  window.addEventListener('filtro-local', (e) => {
    filtroLocalCategoria = e.detail.categoria || '';
    renderEventos();
    renderMapaPins();
    renderCalendario();
  });

  const adminBadge = document.getElementById('admin-badge');
  const updateAdmin = () => {
    const perfil = sessionStorage.getItem('perfilMock') || 'comum';
    if (adminBadge) {
      adminBadge.classList.toggle('is-hidden', perfil !== 'administrador');
    }
  };
  updateAdmin();
  window.addEventListener('perfil-alterado', updateAdmin);
}

document.addEventListener('DOMContentLoaded', init);

// Aguarda o DOM carregar completamente antes de chamar o mapa
document.addEventListener('DOMContentLoaded', () => {
    
    // Verifica se a div do mapa existe na página para não dar erro
    const mapContainer = document.getElementById('mapa-container');
    
    if (mapContainer) {
        // Inicializa o mapa com as coordenadas da Urca, RJ (-22.9519, -43.1658) e zoom 14
        const mapa = L.map('mapa-container').setView([-22.9519, -43.1658], 14);

        // Adiciona a camada visual do OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(mapa);

        // Adiciona um pino marcando o local com um popup bonitinho
        L.marker([-22.9519, -43.1658]).addTo(mapa)
            .bindPopup('<b>Urca</b><br>Eventos e Saúde.')
            .openPopup();
    }
});