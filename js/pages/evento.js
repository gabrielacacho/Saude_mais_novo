import { getEventoById } from '../mock-data.js';
import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { iconCalendar, iconPin, iconUsers } from '../utils/icons.js';

function injectEventoIcons() {
  const cal = document.querySelector('.evento-meta-icon--cal');
  const pin = document.querySelector('.evento-meta-icon--pin');
  const users = document.querySelector('.evento-meta-icon--users');
  if (cal) cal.innerHTML = iconCalendar().replace('hub-icon', 'hub-icon hub-icon--lg');
  if (pin) pin.innerHTML = iconPin().replace('hub-icon', 'hub-icon hub-icon--lg');
  if (users) users.innerHTML = iconUsers().replace('hub-icon', 'hub-icon hub-icon--lg');
}

function getQueryId() {
  return new URLSearchParams(window.location.search).get('id');
}

function renderEvento(ev) {
  document.title = `${ev.titulo} — Hub Saúde`;

  const banner = document.getElementById('evento-banner');
  const tag = document.getElementById('evento-tag');
  const data = document.getElementById('evento-data');
  const local = document.getElementById('evento-local');
  const categoria = document.getElementById('evento-categoria');
  const capacidade = document.getElementById('evento-capacidade');
  const descricao = document.getElementById('evento-descricao');
  const tituloDesc = document.getElementById('evento-descricao-titulo');

  if (banner) {
    banner.src = ev.foto_capa;
    banner.alt = ev.titulo;
  }
  if (tag) tag.textContent = ev.titulo;
  if (data) data.textContent = ev.dataExibicao;
  if (local) local.textContent = ev.localizacao;
  if (categoria) categoria.textContent = ev.categoria;
  if (capacidade) capacidade.textContent = `${ev.numero_participantes} / ${ev.capacidade_maxima}`;
  if (descricao) descricao.textContent = ev.descricao;
  if (tituloDesc) tituloDesc.textContent = `💃 ${ev.titulo}: Energia, Saúde e Diversão!`;

  const btnInscrever = document.getElementById('btn-inscrever');
  const inscritoKey = `inscrito_${ev.id}`;
  const jaInscrito = sessionStorage.getItem(inscritoKey) === 'true';

  const atualizarBotao = (inscrito) => {
    if (!btnInscrever) return;
    if (inscrito) {
      btnInscrever.textContent = 'Inscrito ✅';
      btnInscrever.classList.add('hub-btn--inscrito');
    } else {
      btnInscrever.textContent = 'Inscrever-se';
      btnInscrever.classList.remove('hub-btn--inscrito');
    }
  };

  atualizarBotao(jaInscrito);

  btnInscrever?.addEventListener('click', () => {
    const agora = sessionStorage.getItem(inscritoKey) === 'true';
    sessionStorage.setItem(inscritoKey, (!agora).toString());
    atualizarBotao(!agora);
  });
}

function init() {
  renderHeader(document.getElementById('header-root'), { showSearch: true, activePage: 'evento' });
  renderFooter(document.getElementById('footer-root'));
  injectEventoIcons();

  const id = getQueryId() || 'evt-1';
  const ev = getEventoById(id);

  if (!ev) {
    document.getElementById('evento-conteudo')?.classList.add('is-hidden');
    document.getElementById('evento-erro')?.classList.remove('is-hidden');
    return;
  }

  renderEvento(ev);
}

document.addEventListener('DOMContentLoaded', init);
