import { getPostoById, getRegiaoById, EVENTOS } from '../mock-data.js';
import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { iconPin, iconCalendar, iconBuilding } from '../utils/icons.js';

function init() {
  renderHeader(document.getElementById('header-root'), { showSearch: true, activePage: 'posto' });
  renderFooter(document.getElementById('footer-root'));

  const id = new URLSearchParams(window.location.search).get('id');
  const posto = id ? getPostoById(id) : null;

  if (!posto) {
    document.getElementById('posto-conteudo')?.classList.add('is-hidden');
    document.getElementById('posto-erro')?.classList.remove('is-hidden');
    return;
  }

  document.title = `${posto.nome} — Hub Saúde`;
  const iconEl = document.querySelector('.posto-hero__icon');
  if (iconEl) {
    iconEl.innerHTML = iconBuilding().replace('class="hub-icon"', 'class="hub-icon hub-icon--xl"');
  }
  document.getElementById('posto-nome').textContent = posto.nome;
  document.getElementById('posto-endereco').textContent = posto.endereco;
  document.getElementById('posto-horario').textContent = posto.horario;
  document.getElementById('posto-descricao').textContent = posto.descricao;

  const servicos = document.getElementById('posto-servicos');
  if (servicos) {
    servicos.innerHTML = posto.servicos.map((s) => `<li>${s}</li>`).join('');
  }

  const eventos = EVENTOS.filter((e) => e.regiao === posto.regiao);
  const lista = document.getElementById('posto-eventos-lista');
  if (lista) {
    lista.innerHTML = eventos.length
      ? eventos
          .map(
            (ev) => `
        <a href="evento.html?id=${ev.id}" class="perfil-mini-card">
          <strong>${ev.titulo}</strong>
          <span>${iconCalendar()} ${ev.dataExibicao}</span>
          <span>${iconPin()} ${getRegiaoById(ev.regiao).nome}</span>
        </a>
      `
          )
          .join('')
      : '<p class="perfil-vazio">Nenhum evento nesta região no momento.</p>';
  }
}

document.addEventListener('DOMContentLoaded', init);
