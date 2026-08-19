import { getEventoById } from '../services/evento-api.js';
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
  document.title = `${ev.titulo} — Saúde Aqui`;

  const banner = document.getElementById('evento-banner');
  const tag = document.getElementById('evento-tag');
  const dataInicio = document.getElementById('evento-data-inicio');
  const dataFim = document.getElementById('evento-data-fim');
  const local = document.getElementById('evento-local');
  const unidade = document.getElementById('evento-unidade');
  const instituicao = document.getElementById('evento-instituicao');
  const capacidade = document.getElementById('evento-capacidade');
  const barraFill = document.getElementById('barra-fill');
  const descricao = document.getElementById('evento-descricao');
  const tituloDesc = document.getElementById('evento-descricao-titulo');

  if (banner) {
    banner.src = ev.foto_capa;
    banner.alt = ev.titulo;
  }
  if (tag) tag.textContent = ev.categoria || 'Evento';
  if (tituloDesc) tituloDesc.textContent = ev.titulo;
  if (descricao) descricao.textContent = ev.descricao;

  if (dataInicio) dataInicio.textContent = ev.dataExibicao ? `${ev.dataExibicao} às 09:00` : 'A definir';
  if (dataFim) dataFim.textContent = ev.dataExibicao ? `${ev.dataExibicao} às 12:00` : 'A definir';
  
  if (local) {
    // Atualiza o nome do local
    local.textContent = ev.localizacao;
    // Força a atualização do link do mapa (agora sem falhas)
    const buscaMapa = encodeURIComponent(`${ev.localizacao}, Rio de Janeiro`);
    local.setAttribute('href', `https://maps.google.com/?q=${buscaMapa}`);
  }

  if (unidade) unidade.textContent = ev.unidade || 'UBS / Clínica da Família local';
  if (instituicao) instituicao.textContent = ev.instituicao || 'Secretaria Municipal de Saúde';

  if (capacidade) {
    const inscritos = ev.numero_participantes || 0;
    const max = ev.capacidade_maxima || 15;
    
    capacidade.textContent = `${inscritos} / ${max}`;
    
    if (barraFill) {
      const porcentagem = Math.min((inscritos / max) * 100, 100);
      barraFill.style.width = `${porcentagem}%`;
      if (porcentagem >= 100) {
        barraFill.style.backgroundColor = '#E63946';
      }
    }
  }

  const btnInscrever = document.getElementById('btn-inscrever');
  const inscritoKey = `inscrito_${ev.id}`;
  const jaInscrito = sessionStorage.getItem(inscritoKey) === 'true';

  const atualizarBotao = (inscrito) => {
    if (!btnInscrever) return;
    const lotado = (ev.numero_participantes >= ev.capacidade_maxima);

    if (inscrito) {
      btnInscrever.textContent = 'Inscrito ✅';
      btnInscrever.classList.add('hub-btn--inscrito');
      btnInscrever.disabled = false;
    } else if (lotado) {
      btnInscrever.textContent = 'Vagas Esgotadas';
      btnInscrever.classList.remove('hub-btn--inscrito');
      btnInscrever.style.opacity = '0.5';
      btnInscrever.style.pointerEvents = 'none';
    } else {
      btnInscrever.textContent = 'Garantir Minha Vaga';
      btnInscrever.classList.remove('hub-btn--inscrito');
      btnInscrever.style.opacity = '1';
      btnInscrever.style.pointerEvents = 'auto';
    }
  };

  atualizarBotao(jaInscrito);

  btnInscrever?.addEventListener('click', () => {
    const agora = sessionStorage.getItem(inscritoKey) === 'true';
    sessionStorage.setItem(inscritoKey, (!agora).toString());
    atualizarBotao(!agora);
  });
}

// ==========================================
// SISTEMA DE AVALIAÇÕES 
// ==========================================
let avaliacoes = [
  { id: 1, nome: 'Maria Silva', iniciais: 'M', nota: 5, texto: 'Evento maravilhoso! Os professores são super atenciosos com os idosos.', data: '2026-04-10T14:30:00' },
  { id: 2, nome: 'João Pedro', iniciais: 'J', nota: 4, texto: 'Muito bom, mas achei o espaço um pouco apertado para a quantidade de pessoas.', data: '2026-04-12T09:15:00' },
  { id: 3, nome: 'Ana Costa', iniciais: 'A', nota: 5, texto: 'Minha mãe adorou. Com certeza voltaremos na próxima edição!', data: '2026-04-15T16:45:00' }
];

function renderizarEstrelas(nota) {
  let estrelasHtml = '';
  for (let i = 1; i <= 5; i++) {
    estrelasHtml += `<span class="estrela ${i <= nota ? 'cheia' : ''}">★</span>`;
  }
  return estrelasHtml;
}

function formatarData(dataString) {
  const data = new Date(dataString);
  return data.toLocaleDateString('pt-BR');
}

function renderizarComentarios(lista) {
  const container = document.getElementById('lista-comentarios');
  if (!container) return;

  if (lista.length === 0) {
    container.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 2rem 0;">Nenhuma avaliação ainda. Seja o primeiro!</p>';
    return;
  }

  container.innerHTML = lista.map(av => `
    <div class="comentario-item">
      <div class="comentario-item__header">
        <div class="comentario-item__usuario">
          <div class="comentario-avatar">${av.iniciais}</div>
          <div class="comentario-nome-data">
            <span class="comentario-nome">${av.nome}</span>
            <span class="comentario-data">${formatarData(av.data)}</span>
          </div>
        </div>
        <div class="comentario-nota">${renderizarEstrelas(av.nota)}</div>
      </div>
      <p class="comentario-texto">${av.texto}</p>
    </div>
  `).join('');
}

function configurarSistemaAvaliacao() {
  const btnComentar = document.getElementById('btn-comentar');
  const filtroSelect = document.getElementById('filtro-avaliacoes');

  renderizarComentarios(avaliacoes.sort((a, b) => new Date(b.data) - new Date(a.data)));

  if (filtroSelect) {
    filtroSelect.addEventListener('change', (e) => {
      let filtrados = [...avaliacoes];
      if (e.target.value === 'maior-nota') {
        filtrados.sort((a, b) => b.nota - a.nota); 
      } else if (e.target.value === 'menor-nota') {
        filtrados.sort((a, b) => a.nota - b.nota); 
      } else {
        filtrados.sort((a, b) => new Date(b.data) - new Date(a.data)); 
      }
      renderizarComentarios(filtrados);
    });
  }

  if (btnComentar) {
    const novoBtn = btnComentar.cloneNode(true);
    btnComentar.parentNode.replaceChild(novoBtn, btnComentar);

    novoBtn.addEventListener('click', () => {
      const textarea = document.getElementById('comentario-texto');
      const texto = textarea.value;
      const notaSelecionada = document.querySelector('input[name="rating"]:checked');

      if (!notaSelecionada) {
        alert('Por favor, selecione uma nota nas estrelas antes de avaliar.');
        return;
      }
      if (!texto.trim()) {
        alert('Por favor, escreva um comentário.');
        return;
      }

      const novaAvaliacao = {
        id: Date.now(),
        nome: 'Você (Usuário Logado)',
        iniciais: 'V',
        nota: parseInt(notaSelecionada.value),
        texto: texto,
        data: new Date().toISOString()
      };

      avaliacoes.unshift(novaAvaliacao);
      textarea.value = '';
      notaSelecionada.checked = false;
      
      if(filtroSelect) filtroSelect.value = 'recentes';
      renderizarComentarios(avaliacoes);
    });
  }
}

async function init() {
  const conteudo = document.getElementById('evento-conteudo');
  
  // 1. Esconde a página IMEDIATAMENTE para não piscar o evento errado
  if (conteudo) {
    conteudo.style.opacity = '0';
    conteudo.style.pointerEvents = 'none'; // Evita clicar em links antigos antes de carregar
  }

  renderHeader(document.getElementById('header-root'), { showSearch: true, activePage: 'evento' });
  renderFooter(document.getElementById('footer-root'));
  injectEventoIcons();

  const id = getQueryId() || 'evt-1';
  const ev = await getEventoById(id);

  if (!ev) {
    if (conteudo) conteudo.classList.add('is-hidden');
    document.getElementById('evento-erro')?.classList.remove('is-hidden');
    return;
  }

  // 2. Preenche os dados corretos invisivelmente
  renderEvento(ev);
  configurarSistemaAvaliacao();

  // 3. Revela a página já arrumada e com o mapa certinho
  if (conteudo) {
    conteudo.style.transition = 'opacity 0.3s ease-in';
    conteudo.style.opacity = '1';
    conteudo.style.pointerEvents = 'auto'; // Libera o clique nos links novamente
  }
}

document.addEventListener('DOMContentLoaded', init);