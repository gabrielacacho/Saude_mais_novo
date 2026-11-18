import { listarEventos, getEventosPorRegiao } from "../services/evento-api.js";
import { renderHeader } from "../components/header.js";
import { renderFooter } from "../components/footer.js";
import {
  bindLocalInputs,
  getLocal,
  onLocalChange,
  setLocal,
} from "../utils/sync-local.js";
import { iconPin, iconCalendar } from "../utils/icons.js";

const MESES = [
  "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
  "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO",
];
const DIAS_SEMANA = ["DOM.", "SEG.", "TER.", "QUA.", "QUI.", "SEX.", "SÁB."];

let mesAtual = new Date().getMonth();
let anoAtual = new Date().getFullYear();
let filtroEvento = { termo: "", categoria: "", data: "" };
let filtroLocalCategoria = "";

let mapaLeaflet = null;
let camadaMarcadores = null;

// Mapa de fallback caso a API mande só o número da categoria
const MAPA_CATEGORIAS = {
  1: "Mutirão",
  2: "Exames",
  3: "Palestra",
  4: "Atividade Física",
  5: "Consulta",
  6: "Outro",
};

// Mapeamento inteligente de bairros do Rio por Região para filtrar com precisão
const MAPA_REGIOES_BAIRROS = {
  "centro": ["centro", "apa", "lapa", "santa teresa", "catumbi", "rio comprido", "saude", "gamboa", "portuaria"],
  "zona sul": ["copacabana", "ipanema", "leblon", "botafogo", "flamengo", "urca", "laranjeiras", "cosme velho", "humaita", "sao conrado", "gavea", "leme", "jardin botanico"],
  "zona norte": ["tijuca", "maracana", "vila isabel", "meier", "cachambi", "del castilho", "madureira", "penha", "bonsucesso", "engenho novo", "grajau", "jacare", "rocha", "sao cristovao"],
  "zona oeste": ["barra da tijuca", "recreio", "jacarepagua", "taquara", "freguesia", "campo grande", "bangu", "realengo", "guaratiba"]
};

function obterPerfilAtual() {
  const auth = localStorage.getItem("usuarioLogado");
  return auth ? JSON.parse(auth).perfil : "comum";
}

function normalizar(texto) {
  return (texto || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function obterNomeCategoria(ev) {
  return ev.categoria_nome || MAPA_CATEGORIAS[ev.categoria] || ev.categoria || "Evento de Saúde";
}

function formatarDataExibicao(ev) {
  if (ev.dataExibicao) return ev.dataExibicao;
  if (ev.data_exibicao) return ev.data_exibicao;
  const raw = (ev.data_hora_evento || ev.data || "").split("T")[0];
  if (raw.includes("-")) {
    const [ano, mes, dia] = raw.split("-");
    return `${dia}/${mes}/${ano}`;
  }
  return "Data a definir";
}

function passaFiltroEvento(ev) {
  const categoriaAtiva = filtroEvento.categoria || filtroLocalCategoria;
  if (!categoriaAtiva || categoriaAtiva === "") return true;
  
  const catEv = normalizar(obterNomeCategoria(ev));
  const catFiltro = normalizar(categoriaAtiva);
  return catEv.includes(catFiltro) || catFiltro.includes(catEv);
}

// Filtro inteligente de localização baseado no texto digitado ou região selecionada
async function eventosFiltradosPorLocal(textoLocal = "") {
  const t = textoLocal.trim();
  const todos = await listarEventos();
  if (!t) return todos;

  const termoNorm = normalizar(t);

  // Verifica se o texto corresponde a uma das grandes regiões do Rio
  const bairrosRegiao = MAPA_REGIOES_BAIRROS[termoNorm];
  if (bairrosRegiao) {
    return todos.filter((e) => {
      const enderecoNorm = normalizar(e.endereco || e.localizacao || "");
      return bairrosRegiao.some((bairro) => enderecoNorm.includes(bairro));
    });
  }

  // Caso contrário, filtra pelo texto digitado (bairro, rua, etc.)
  return todos.filter((e) =>
    normalizar(e.endereco || e.localizacao || e.titulo || "").includes(termoNorm)
  );
}

function aplicarFiltrosEvento(lista) {
  let result = [...lista];
  const { termo, categoria, data } = filtroEvento;

  // 1. Termo de busca livre
  if (termo && termo.trim() !== "") {
    const t = normalizar(termo);
    result = result.filter(
      (e) =>
        normalizar(e.titulo).includes(t) ||
        normalizar(e.descricao).includes(t) ||
        normalizar(e.endereco || e.localizacao).includes(t)
    );
  }

  // 2. Categoria (unificada entre header e modal)
  const categoriaAtiva = categoria || filtroLocalCategoria;
  if (categoriaAtiva && categoriaAtiva !== "") {
    const catAlvo = normalizar(categoriaAtiva);
    result = result.filter((e) => {
      const catEv = normalizar(obterNomeCategoria(e));
      return catEv.includes(catAlvo) || catAlvo.includes(catEv);
    });
  }

  // 3. Data
  if (data && data !== "") {
    result = result.filter((e) => {
      const dataEv = (e.data_hora_evento || e.data || "").split("T")[0];
      return dataEv === data;
    });
  }

  return result;
}

function atualizarLabelMapa(texto) {
  const label = document.getElementById("mapa-local-label");
  if (label) {
    label.textContent = texto.trim().toUpperCase() || "DIGITE O LOCAL";
  }
}

// ==========================================
// MAPA REAL COM ZOOM CONTROLADO E PINS SEGUROS
// ==========================================
function inicializarMapaReal() {
  const mapContainer = document.getElementById("mapa-container");
  if (!mapContainer || typeof L === "undefined") return;

  mapaLeaflet = L.map("mapa-container").setView([-22.9519, -43.1658], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
  }).addTo(mapaLeaflet);

  camadaMarcadores = L.layerGroup().addTo(mapaLeaflet);
}

function atualizarMarcadoresNoMapa(eventos) {
  if (!camadaMarcadores) return;

  camadaMarcadores.clearLayers();
  const bounds = [];

  if (!eventos || eventos.length === 0) return;

  eventos.forEach((ev) => {
    if (ev.latitude !== null && ev.longitude !== null && !isNaN(ev.latitude) && !isNaN(ev.longitude)) {
      const lat = Number(ev.latitude);
      const lng = Number(ev.longitude);
      const categoriaNome = obterNomeCategoria(ev);
      const dataFormatada = formatarDataExibicao(ev);
      const localTexto = ev.endereco || ev.localizacao || "Local a confirmar";

      const popupHtml = `
        <div style="font-family: inherit; padding: 4px; min-width: 210px;">
          <span style="display: inline-block; background: #e0f2fe; color: #044272; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; margin-bottom: 6px;">
            ${categoriaNome}
          </span>
          <h4 style="margin: 0 0 6px 0; color: #1e293b; font-size: 0.95rem; font-weight: bold;">
            ${ev.titulo}
          </h4>
          <p style="margin: 0 0 4px 0; color: #475569; font-size: 0.85rem;">
            📅 ${dataFormatada}
          </p>
          <p style="margin: 0 0 10px 0; color: #475569; font-size: 0.85rem;">
            📍 ${localTexto}
          </p>
          <a href="evento.html?id=${ev.id}" style="display: block; background: #044272; color: #ffffff; padding: 6px 12px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; text-decoration: none; text-align: center;">
            Ver detalhes
          </a>
        </div>
      `;

      const marker = L.marker([lat, lng]).bindPopup(popupHtml);
      marker.addTo(camadaMarcadores);
      bounds.push([lat, lng]);
    }
  });

  if (bounds.length > 0 && mapaLeaflet) {
    if (bounds.length === 1) {
      mapaLeaflet.setView(bounds[0], 14);
    } else {
      mapaLeaflet.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  } else if (mapaLeaflet) {
    mapaLeaflet.setView([-22.9519, -43.1658], 12);
  }
}

// ==========================================
// CALENDÁRIO E LISTAGEM DE CARDS
// ==========================================
function htmlCalEvento(ev) {
  const categoriaTexto = obterNomeCategoria(ev);
  const categoriaClasse = normalizar(categoriaTexto).replace(/\s+/g, "-");

  return `
    <div class="cal-evento-mini-wrap">
      <button type="button" class="cal-evento-mini" aria-expanded="false">${ev.titulo}</button>
      <div class="hub-popover hub-popover--${categoriaClasse}">
        <p class="hub-popover__tipo">${iconCalendar()} Evento · ${categoriaTexto}</p>
        <p class="hub-popover__titulo">${ev.titulo}</p>
        <p class="hub-popover__meta">${formatarDataExibicao(ev)} · ${ev.endereco || ev.localizacao || ""}</p>
        <a href="evento.html?id=${ev.id}" class="hub-popover__link">Ver evento</a>
      </div>
    </div>
  `;
}

async function renderCalendario() {
  const grid = document.getElementById("calendario-grid");
  if (!grid) return;

  const mes = mesAtual;
  const ano = anoAtual;
  const eventos = await listarEventos();

  const primeiroDia = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const diasMesAnterior = new Date(ano, mes, 0).getDate();

  const eventosNoMes = eventos.filter((e) => {
    const dataEvento = e.data_hora_evento || e.data;
    if (!dataEvento) return false;
    const [data] = dataEvento.split("T");
    const [y, m] = data.split("-").map(Number);
    return y === ano && m === mes + 1 && passaFiltroEvento(e);
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
    const todosNoDia = eventosNoMes.filter((e) => {
      const dataEvento = e.data_hora_evento || e.data;
      return dataEvento && dataEvento.split("T")[0] === dataStr;
    });
    const selecionado = diaHoje !== null && dia === diaHoje;
    const eventosHtml = todosNoDia.slice(0, 2).map((ev) => htmlCalEvento(ev)).join("");

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
      const aberto = wrap.classList.contains("is-popover-open");
      btn.setAttribute("aria-expanded", aberto ? "true" : "false");
    });
  });
}

async function renderEventos() {
  const grid = document.getElementById("eventos-grid");
  const inputRegiao = document.getElementById("regiao-nome");
  if (!grid) return;

  const textoLocal = getLocal();
  if (inputRegiao && document.activeElement !== inputRegiao) {
    inputRegiao.value = textoLocal;
  }

  try {
    const listaLocal = await eventosFiltradosPorLocal(textoLocal);
    const eventos = aplicarFiltrosEvento(listaLocal);

    atualizarMarcadoresNoMapa(eventos);

    if (eventos.length === 0) {
      grid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: #64748b; padding: 2rem;">Nenhum evento encontrado para os filtros selecionados.</p>`;
      return;
    }

    grid.innerHTML = eventos
      .map(
        (ev) => `
      <a href="evento.html?id=${ev.id}" class="hub-event-card">
        <div class="hub-event-card__img-wrap">
          <img src="${ev.foto_capa}" alt="${ev.titulo}" class="hub-event-card__img" loading="lazy" />
        </div>
        <div class="hub-event-card__body">
          <h3 class="hub-event-card__title">${ev.titulo}</h3>
          <p class="hub-event-card__meta">${iconCalendar()} ${formatarDataExibicao(ev)}</p>
          <p class="hub-event-card__meta">${iconPin()} ${ev.endereco || ev.localizacao || ""}</p>
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
  const selectAno = document.getElementById("cal-ano");
  if (!selectMes || !selectAno) return;

  selectMes.innerHTML = MESES.map(
    (nome, i) => `<option value="${i}">${nome}</option>`
  ).join("");

  const anoInicial = new Date().getFullYear();
  const anos = [];
  for (let ano = anoInicial - 1; ano <= anoInicial + 5; ano++) {
    anos.push(ano);
  }

  selectAno.innerHTML = anos.map((ano) => `<option value="${ano}">${ano}</option>`).join("");
  selectMes.value = String(mesAtual);
  selectAno.value = String(anoAtual);

  selectMes.addEventListener("change", () => {
    mesAtual = Number(selectMes.value);
    renderCalendario();
  });

  selectAno.addEventListener("change", () => {
    anoAtual = Number(selectAno.value);
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
// RENDERIZAÇÃO DA BARRA DE BUSCA E FILTROS DO TOPO
// ==========================================
function renderizarBuscador() {
  const container = document.getElementById("container-busca");
  if (!container) return;

  const regiaoOptions = `<option value="">Todas as regiões</option><option value="Centro">Centro</option><option value="Zona Sul">Zona Sul</option><option value="Zona Norte">Zona Norte</option><option value="Zona Oeste">Zona Oeste</option>`;
  const categoriaOptions = `<option value="">Todas as ações</option><option value="Campanha">Campanha de Vacinação</option><option value="Mutirao">Mutirão de Saúde</option><option value="Feira">Feira de Saúde</option><option value="Palestra">Palestra / Roda de Conversa</option><option value="Oficina">Oficina Educativa</option><option value="Acao">Ação Comunitária</option><option value="Atividade">Atividade Física / Caminhada</option><option value="Grupo">Grupo de Apoio</option>`;

  const pinoSvg = iconPin();
  const calendarioSvg = iconCalendar();
  const filtroSvg = `<svg class="hub-icon" viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></svg>`;

  container.innerHTML = `
    <div class="hub-search-wrap">
      <div class="hub-search">
        <label class="hub-search-field hub-search-field--divider">
          <span class="sr-only">Buscar por local</span>
          ${pinoSvg}
          <input type="text" id="search-local" class="hub-search-input" placeholder="Ex: Tijuca, Copacabana..." autocomplete="off" value="${getLocal()}" />
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
}

// ==========================================
// CONEXÃO DOS FILTROS DO CABEÇALHO
// ==========================================
function conectarFiltrosCabecalho() {
  const inputLocal = document.getElementById("search-local");
  const inputEvento = document.getElementById("search-evento");
  const selectRegiao = document.getElementById("filtro-regiao-header");
  const selectCatLocal = document.getElementById("filtro-categoria-local");
  const selectCatEvento = document.getElementById("filtro-categoria-header");
  const inputData = document.getElementById("filtro-data-header");
  const selectRaio = document.getElementById("filtro-raio");

  const atualizarCategoriasSincronizadas = (valorNovo) => {
    if (selectCatLocal && selectCatLocal.value !== valorNovo) selectCatLocal.value = valorNovo;
    if (selectCatEvento && selectCatEvento.value !== valorNovo) selectCatEvento.value = valorNovo;
    filtroEvento.categoria = valorNovo;
    filtroLocalCategoria = valorNovo;
  };

  const dispararAtualizacao = async () => {
    filtroEvento = {
      termo: inputEvento?.value || "",
      categoria: filtroEvento.categoria || "",
      data: inputData?.value || "",
    };

    await Promise.all([renderCalendario(), renderEventos()]);
  };

  selectCatEvento?.addEventListener("change", async (e) => {
    atualizarCategoriasSincronizadas(e.target.value);
    await dispararAtualizacao();
  });

  selectCatLocal?.addEventListener("change", async (e) => {
    atualizarCategoriasSincronizadas(e.target.value);
    await dispararAtualizacao();
  });

  inputEvento?.addEventListener("input", dispararAtualizacao);
  inputData?.addEventListener("change", dispararAtualizacao);
  selectRaio?.addEventListener("change", dispararAtualizacao);

  selectRegiao?.addEventListener("change", async () => {
    const regiao = selectRegiao.value;
    if (inputLocal) inputLocal.value = regiao;
    setLocal(regiao, "header-select");
    await dispararAtualizacao();
  });

  inputLocal?.addEventListener("input", async () => {
    setLocal(inputLocal.value, "header-input");
    await dispararAtualizacao();
  });
}

// ==========================================
// INICIALIZAÇÃO ÚNICA DA PÁGINA
// ==========================================
async function init() {
  setLocal("", "init");

  renderHeader(document.getElementById("header-root"), {
    showSearch: true,
    activePage: "home",
  });
  renderFooter(document.getElementById("footer-root"));

  initPanelIcons();
  initSeletorCalendario();
  initCamposLocal();
  
  renderizarBuscador();
  inicializarMapaReal();
  conectarFiltrosCabecalho();

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

  await Promise.all([renderCalendario(), renderEventos()]);

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
  });

  window.addEventListener("filtro-local", async (e) => {
    filtroLocalCategoria = e.detail.categoria || "";
    await Promise.all([renderEventos(), renderCalendario()]);
  });

  const perfil = obterPerfilAtual();
  document.getElementById("admin-badge")?.classList.toggle("is-hidden", perfil !== "administrador");
  document.getElementById("institucional-badge")?.classList.toggle("is-hidden", perfil !== "institucional");
}

document.addEventListener("DOMContentLoaded", init);