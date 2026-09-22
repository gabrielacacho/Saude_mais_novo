import { getUsuarioByPerfil } from "../services/usuarios-api.js";
import { listarRegioes } from "../services/regiao-api.js";
import { listarEventos } from "../services/apiService.js";
import { renderHeader } from "../components/header.js";
import { renderFooter } from "../components/footer.js";
import {
  bindLocalInputs,
  getLocal,
  onLocalChange,
  setLocal,
} from "../utils/sync-local.js";
import { iconPin, iconCalendar, iconBuilding } from "../utils/icons.js";

const MESES = [
  "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
  "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO",
];
const DIAS_SEMANA = ["DOM.", "SEG.", "TER.", "QUA.", "QUI.", "SEX.", "SÁB."];
const ANO_FIXO = 2026;

let mesAtual = 4;
let filtroEvento = { termo: "", categoria: "", data: "" };
let filtroLocalCategoria = "";

// ==========================================
// FUNÇÃO CENTRAL PARA LER A SESSÃO REAL
// ==========================================
function obterPerfilAtual() {
  const auth = localStorage.getItem("usuarioLogado");
  return auth ? JSON.parse(auth).perfil : "comum";
}

// Busca as inscrições em eventos do perfil do usuário atual
async function getInscricoes() {
  const perfil = obterPerfilAtual();
  const usuario = await getUsuarioByPerfil(perfil);
  return usuario?.inscricoes || [];
}

function resolveRegiaoId(texto, regioes) {
  const t = texto.trim().toLowerCase();
  if (!t) return "urca";
  const porId = regioes.find((r) => r.id === t.replace(/\s+/g, "-"));
  if (porId) return porId.id;
  const porNome = regioes.find((r) => r.nome.toLowerCase() === t);
  if (porNome) return porNome.id;
  const parcial = regioes.find(
    (r) => r.nome.toLowerCase().includes(t) || t.includes(r.nome.toLowerCase()),
  );
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

async function eventosFiltradosPorLocal(textoLocal = "") {
  const eventos = await listarEventos();
  const regioes = await listarRegioes();
  const t = textoLocal.trim().toLowerCase();

  if (!t) {
    return eventos.filter((e) => passaFiltroEvento(e.categoria));
  }

  const regiaoId = resolveRegiaoId(textoLocal, regioes);
  let lista = [];

  if (regiaoId) {
    lista = eventos.filter((e) => e.regiao === regiaoId);
  } else {
    lista = eventos.filter((e) => {
      const regiao = regioes.find((r) => r.id === e.regiao);
      const nomeRegiao = regiao ? regiao.nome.toLowerCase() : "";
      return (
        e.localizacao.toLowerCase().includes(t) ||
        nomeRegiao.includes(t)
      );
    });
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
  const label = document.getElementById("mapa-local-label");
  if (label) {
    label.textContent = texto.trim().toUpperCase() || "DIGITE O LOCAL";
  }
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
  const container = document.getElementById("mapa-pins");
  if (!container) return;
  container.innerHTML = "";
}

function htmlCalEvento(ev) {
  const categoriaClasse = ev.categoria ? ev.categoria.toLowerCase() : "padrao";
  const categoriaTexto = ev.categoria || "Evento";

  return `
    <div class="cal-evento-mini-wrap">
      <button type="button" class="cal-evento-mini" aria-expanded="false">${ev.titulo}</button>
      <div class="hub-popover hub-popover--${categoriaClasse}">
        <p class="hub-popover__tipo">${iconCalendar()} Evento · ${categoriaTexto}</p>
        <p class="hub-popover__titulo">${ev.titulo}</p>
        <p class="hub-popover__meta">${ev.dataExibicao || ""} · ${ev.localizacao || ""}</p>
        <a href="evento.html?id=${ev.id}" class="hub-popover__link">Ver evento</a>
      </div>
    </div>
  `;
}

async function renderCalendario() {
  const grid = document.getElementById("calendario-grid");
  if (!grid) return;

  const mes = mesAtual;
  const ano = ANO_FIXO;
  const eventos = await listarEventos();

  const primeiroDia = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const diasMesAnterior = new Date(ano, mes, 0).getDate();

  const eventosNoMes = eventos.filter((e) => {
    if (!e.data) return false;
    const [y, m] = e.data.split("-").map(Number);
    return y === ano && m === mes + 1 && passaFiltroEvento(e.categoria);
  });

  let html = DIAS_SEMANA.map((d) => `<div class="cal-header-dia">${d}</div>`).join("");

  for (let i = 0; i < primeiroDia; i++) {
    const dia = diasMesAnterior - primeiroDia + i + 1;
    html += `<div class="cal-dia cal-dia--muted"><span class="cal-numero">${dia}</span></div>`;
  }

  const hoje = new Date();
  const diaHoje = hoje.getFullYear() === ano && hoje.getMonth() === mes ? hoje.getDate() : null;

  for (let dia = 1; dia <= diasNoMes; dia++) {
    const dataStr = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    const todosNoDia = eventosNoMes.filter((e) => e.data === dataStr);
    const selecionado = diaHoje !== null && dia === diaHoje;

    let eventosHtml = "";
    try {
      eventosHtml = todosNoDia.slice(0, 2).map((ev) => htmlCalEvento(ev)).join("");
    } catch (err) {
      console.error("Erro ao renderizar evento do dia " + dia, err);
    }

    html += `
      <div class="cal-dia ${selecionado ? "cal-dia--selecionado" : ""}">
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
  grid.querySelectorAll(".cal-evento-mini-wrap").forEach((wrap) => {
    const btn = wrap.querySelector(".cal-evento-mini");
    if (!btn) return;

    btn.addEventListener("mouseenter", () => {
      wrap.classList.add("is-popover-open");
      btn.setAttribute("aria-expanded", "true");
    });

    wrap.addEventListener("mouseleave", () => {
      wrap.classList.remove("is-popover-open");
      btn.setAttribute("aria-expanded", "false");
    });

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      wrap.classList.toggle("is-popover-open");
      const mudouParaAberto = wrap.classList.contains("is-popover-open");
      btn.setAttribute("aria-expanded", mudouParaAberto ? "true" : "false");
    });
  });
}

async function renderEventos() {
  const grid = document.getElementById("eventos-grid");
  const inputRegiao = document.getElementById("regiao-nome");

  if (!inputRegiao || !grid) return;

  const textoLocal = getLocal();

  if (document.activeElement !== inputRegiao) {
    inputRegiao.value = textoLocal;
  }

  try {
    const lista = await eventosFiltradosPorLocal(textoLocal);
    const eventos = aplicarFiltrosEvento(lista);

    grid.innerHTML = eventos
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
      .join("");
  } catch (erro) {
    console.error("Erro ao carregar os eventos:", erro);
  }
}

function initSeletorCalendario() {
  const selectMes = document.getElementById("cal-mes");
  if (!selectMes) return;

  selectMes.innerHTML = MESES.map((nome, i) => `<option value="${i}">${nome}</option>`).join("");
  selectMes.value = String(mesAtual);

  selectMes.addEventListener("change", () => {
    mesAtual = Number(selectMes.value);
    renderCalendario();
  });
}

function initCamposLocal() {
  const mapaInput = document.getElementById("mapa-busca-local");
  const regiaoInput = document.getElementById("regiao-nome");

  bindLocalInputs([mapaInput, regiaoInput], "home");

  onLocalChange((texto) => {
    atualizarLabelMapa(texto);
    renderEventos();
    renderMapaPins();
    [mapaInput, regiaoInput].forEach((el) => {
      if (el && document.activeElement !== el) {
        el.dataset.syncing = "1";
        el.value = texto;
        delete el.dataset.syncing;
      }
    });
    const headerInput = document.getElementById("search-local");
    if (headerInput && document.activeElement !== headerInput) {
      headerInput.dataset.syncing = "1";
      headerInput.value = texto;
      delete headerInput.dataset.syncing;
    }
  });

  atualizarLabelMapa(getLocal());
}

function initPanelIcons() {
  const pinEl = document.querySelector(".hub-panel-header--input .hub-panel-header__icon");
  const calEl = document.querySelector(".hub-panel-header__icon--cal");
  if (pinEl) pinEl.innerHTML = iconPin().replace('class="hub-icon"', 'class="hub-icon hub-icon--lg"');
  if (calEl) calEl.innerHTML = iconCalendar().replace('class="hub-icon"', 'class="hub-icon hub-icon--lg"');
}

// ==========================================
// INICIALIZAÇÃO DA PÁGINA
// ==========================================
async function init() {
  setLocal("", "init");

  // Renderiza o cabeçalho (agora ele vai ler a sessão corretamente!)
  renderHeader(document.getElementById("header-root"), {
    showSearch: true,
    activePage: "home",
  });

  renderFooter(document.getElementById("footer-root"));

  initPanelIcons();
  initSeletorCalendario();
  initCamposLocal();
  renderMapaPins();

  await Promise.all([
    renderCalendario(),
    renderEventos(),
  ]);

  document.addEventListener("click", (e) => {
    if (e.target.closest(".cal-evento-mini-wrap")) return;
    document.querySelectorAll(".cal-evento-mini-wrap.is-popover-open").forEach((w) => {
      w.classList.remove("is-popover-open");
      w.querySelector(".cal-evento-mini")?.setAttribute("aria-expanded", "false");
    });
  });

  window.addEventListener("filtro-eventos", async (e) => {
    filtroEvento = e.detail;
    await Promise.all([renderEventos(), renderCalendario()]);
    renderMapaPins();
  });

  window.addEventListener("filtro-local", async (e) => {
    filtroLocalCategoria = e.detail.categoria || "";
    await Promise.all([renderEventos(), renderCalendario()]);
    renderMapaPins();
  });

  const adminBadge = document.getElementById("admin-badge");
  const updateAdmin = () => {
    const perfil = obterPerfilAtual();
    if (adminBadge) adminBadge.classList.toggle("is-hidden", perfil !== "administrador");
  };
  updateAdmin();

  const institucionalBadge = document.getElementById("institucional-badge");
  const updateInstitucional = () => {
    const perfil = obterPerfilAtual();
    if (institucionalBadge) {
      institucionalBadge.classList.toggle("is-hidden", perfil !== "institucional");
    }
  };
  updateInstitucional();
}

document.addEventListener("DOMContentLoaded", init);

document.addEventListener("DOMContentLoaded", () => {
  const mapContainer = document.getElementById("mapa-container");
  if (mapContainer) {
    const mapa = L.map("mapa-container").setView([-22.9519, -43.1658], 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap" }).addTo(mapa);
    L.marker([-22.9548, -43.1672]).addTo(mapa).bindPopup(`<b>Vem Zumbar 60+</b><br><small>Categoria: Campanha · Local: Pérola Negra (Urca)</small><br><a href="evento.html?id=evt-1">Ver detalhes</a>`);
    L.marker([-22.9328, -43.1952]).addTo(mapa).bindPopup(`<b>Palestra: Hipertensão e Você</b><br><small>Categoria: Palestra · Local: UBS Santa Teresa</small><br><a href="evento.html?id=evt-2">Ver detalhes</a>`);
    L.marker([-22.9754, -43.1918]).addTo(mapa).bindPopup(`<b>Dia D da Vacinação Influenza</b><br><small>Categoria: Vacinação · Local: Posto Saúde Copacabana</small><br><a href="evento.html?id=evt-3">Ver detalhes</a>`);
    L.marker([-22.9345, -43.2355]).addTo(mapa).bindPopup(`<b>Consulta Odontológica Gratuita</b><br><small>Categoria: Consulta · Local: Clínica da Família Tijuca</small><br><a href="evento.html?id=evt-4">Ver detalhes</a>`);
    L.marker([-22.9555, -43.1662]).addTo(mapa).bindPopup(`<b>Mutirão de Prevenção ao Câncer</b><br><small>Categoria: Mutirão · Local: Centro de Saúde Urca</small><br><a href="evento.html?id=evt-5">Ver detalhes</a>`);
    L.marker([-22.9558, -43.1648]).addTo(mapa).bindPopup(`<b>Exame de Glicemia e Pressão</b><br><small>Categoria: Exame · Local: UBS Praia Vermelha (Urca)</small><br><a href="evento.html?id=evt-6">Ver detalhes</a>`).openPopup();
  }
});

function renderizarBuscador() {
  const container = document.getElementById("container-busca");
  if (!container) return;

  const deveMostrarBusca = typeof showSearch !== "undefined" ? showSearch : true;
  const valorLocal = typeof getLocal === "function" ? getLocal() : "";
  
  const regiaoOptions = typeof opcoesRegiao !== "undefined" ? opcoesRegiao : `<option value="">Todas as regiões</option><option>Centro</option><option>Zona Sul</option><option>Zona Norte</option><option>Zona Oeste</option>`;
  const categoriaOptions = typeof opcoesCategoria !== "undefined" ? opcoesCategoria : `<option value="">Todas as ações</option><option>Campanha de Vacinação</option><option>Mutirão de Saúde</option><option>Feira de Saúde</option><option>Palestra / Roda de Conversa</option><option>Oficina Educativa</option><option>Ação Comunitária</option><option>Atividade Física / Caminhada</option><option>Grupo de Apoio</option>`;

  const pinoSvg = typeof iconPin === "function" ? iconPin() : `<svg class="hub-icon" viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>`;
  const calendarioSvg = typeof iconCalendar === "function" ? iconCalendar() : `<svg class="hub-icon" viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>`;
  const filtroSvg = typeof iconFilter === "function" ? iconFilter() : `<svg class="hub-icon" viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></svg>`;

  if (deveMostrarBusca) {
    container.innerHTML = `
        <div class="hub-search-wrap">
          <div class="hub-search">
            <label class="hub-search-field hub-search-field--divider">
              <span class="sr-only">Buscar por local</span>
              ${pinoSvg}
              <input type="text" id="search-local" class="hub-search-input" placeholder="Ex: Tijuca, Copacabana..." autocomplete="off" value="${valorLocal}" />
              <button type="button" class="hub-search-filtros-btn" id="btn-filtros-local" aria-expanded="false" aria-controls="painel-filtros-local" title="Filtros de local">${filtroSvg}</button>
            </label>
            <label class="hub-search-field">
              <span class="sr-only">Buscar por evento</span>
              ${calendarioSvg}
              <input type="text" id="search-evento" class="hub-search-input" placeholder="Ex: Mutirão, Palestra, Campanha..." autocomplete="off" />
              <button type="button" class="hub-search-filtros-btn" id="btn-filtros-evento" aria-expanded="false" aria-controls="painel-filtros-evento" title="Filtros de evento">${filtroSvg}</button>
            </label>
          </div>

          <div id="painel-filtros-local" class="hub-search-filtros is-hidden">
            <p class="hub-search-filtros__titulo">Filtros de local (opcional)</p>
            <div class="hub-search-filtros__grid">
              <div>
                <label class="hub-label" for="filtro-regiao-header">Região sugerida</label>
                <select id="filtro-regiao-header" class="hub-select hub-select--modal">${regiaoOptions}</select>
              </div>
              <div>
                <label class="hub-label" for="filtro-categoria-local">Tipo de ação</label>
                <select id="filtro-categoria-local" class="hub-select hub-select--modal">${categoriaOptions}</select>
              </div>
              <div>
                <label class="hub-label" for="filtro-raio">Distância (mock)</label>
                <select id="filtro-raio" class="hub-select hub-select--modal">
                  <option>Até 2 km (Bairro)</option>
                  <option>Até 5 km (Bairros vizinhos)</option>
                  <option>Até 15 km (Região)</option>
                  <option>Cidade toda</option>
                </select>
              </div>
            </div>
          </div>

          <div id="painel-filtros-evento" class="hub-search-filtros is-hidden">
            <p class="hub-search-filtros__titulo">Filtros de evento (opcional)</p>
            <div class="hub-search-filtros__grid">
              <div>
                <label class="hub-label" for="filtro-categoria-header">Tipo de ação</label>
                <select id="filtro-categoria-header" class="hub-select hub-select--modal">${categoriaOptions}</select>
              </div>
              <div>
                <label class="hub-label" for="filtro-data-header">Data</label>
                <input type="date" id="filtro-data-header" class="hub-input hub-select--modal" />
              </div>
            </div>
          </div>
        </div>
        `;
  } else {
    container.innerHTML = '<div class="hub-search-wrap"></div>';
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderizarBuscador();
  const btnFiltroLocal = document.getElementById("btn-filtros-local");
  const painelFiltroLocal = document.getElementById("painel-filtros-local");
  const btnFiltroEvento = document.getElementById("btn-filtros-evento");
  const painelFiltroEvento = document.getElementById("painel-filtros-evento");

  if (btnFiltroLocal && painelFiltroLocal) {
    btnFiltroLocal.addEventListener("click", () => {
      painelFiltroLocal.classList.toggle("is-hidden");
      if (painelFiltroEvento) painelFiltroEvento.classList.add("is-hidden");
    });
  }

  if (btnFiltroEvento && painelFiltroEvento) {
    btnFiltroEvento.addEventListener("click", () => {
      painelFiltroEvento.classList.toggle("is-hidden");
      if (painelFiltroLocal) painelFiltroLocal.classList.add("is-hidden");
    });
  }
});