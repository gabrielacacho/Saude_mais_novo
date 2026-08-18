//import { getEventoById } from '../mock-data.js';
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
  document.title = `${ev.titulo} — Hub Saúde`;

  const banner = document.getElementById('evento-banner');
  const tag = document.getElementById('evento-tag');
  const data = document.getElementById('evento-data');
  const local = document.getElementById('evento-local');
  const categoria = document.getElementById('evento-categoria');
  const capacidade = document.getElementById('evento-capacidade');
  const descricao = document.getElementById('evento-descricao');
  const tituloDesc = document.getElementById('evento-descricao-titulo');
  const status = document.getElementById('evento-status');

  if (banner) {
    banner.src = ev.foto_capa;
    banner.alt = ev.titulo;
  }
  if (tag) tag.textContent = ev.titulo;
  if (data) data.textContent = ev.dataExibicao;
  if (local) local.textContent = ev.localizacao;
  if (categoria) categoria.textContent = ev.categoria;
  if (status) status.textContent = ev.status;
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

/*comentarios*/
function renderComentarios(eventoId) {

  const lista = document.getElementById('lista-comentarios');

  if (!lista) return;

  const comentarios = JSON.parse(
    localStorage.getItem(`comentarios_${eventoId}`) || '[]'
  );

  lista.innerHTML = '';

  comentarios.forEach(c => {

    lista.innerHTML += `
      <div class="evento-comentario">
        <div class="evento-comentario__usuario">${c.usuario}</div>
        <div class="evento-comentario__data">${c.data}</div>
        <p>${c.texto}</p>
      </div>
    `;

  });

}

function configurarComentarios(eventoId){

  const botao = document.getElementById('btn-comentar');
  const textarea = document.getElementById('comentario-texto');

  if(!botao || !textarea) return;

  renderComentarios(eventoId);

  botao.addEventListener('click',()=>{

    const texto = textarea.value.trim();

    if(!texto) return;

    const comentarios = JSON.parse(
      localStorage.getItem(`comentarios_${eventoId}`) || '[]'
    );

    comentarios.push({
      usuario:'Usuário',
      texto,
      data:new Date().toLocaleString('pt-BR')
    });

    localStorage.setItem(
      `comentarios_${eventoId}`,
      JSON.stringify(comentarios)
    );

    textarea.value='';

    renderComentarios(eventoId);

  });

}

//function init() 
async function init() {
  renderHeader(document.getElementById('header-root'), { showSearch: true, activePage: 'evento' });
  renderFooter(document.getElementById('footer-root'));
  injectEventoIcons();

  const id = getQueryId() || 'evt-1';
  //const ev = getEventoById(id);
  const ev = await getEventoById(id);

  if (!ev) {
    document.getElementById('evento-conteudo')?.classList.add('is-hidden');
    document.getElementById('evento-erro')?.classList.remove('is-hidden');
    return;
  }

  renderEvento(ev);
  /*comentario*/
  configurarComentarios(ev.id);
  
  configurarSistemaAvaliacao();
}

document.addEventListener('DOMContentLoaded', init);

// 1. Lista de comentários falsos para a página iniciar preenchida
let avaliacoes = [
  { id: 1, nome: 'Maria Silva', iniciais: 'M', nota: 5, texto: 'Evento maravilhoso! Os professores são super atenciosos com os idosos.', data: '2026-04-10T14:30:00' },
  { id: 2, nome: 'João Pedro', iniciais: 'J', nota: 4, texto: 'Muito bom, mas achei o espaço um pouco apertado para a quantidade de pessoas.', data: '2026-04-12T09:15:00' },
  { id: 3, nome: 'Ana Costa', iniciais: 'A', nota: 5, texto: 'Minha mãe adorou. Com certeza voltaremos na próxima edição!', data: '2026-04-15T16:45:00' }
];

// 2. Função que desenha as estrelas de acordo com a nota
function renderizarEstrelas(nota) {
  let estrelasHtml = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= nota) {
      estrelasHtml += `<span class="estrela cheia">★</span>`;
    } else {
      estrelasHtml += `<span class="estrela">★</span>`;
    }
  }
  return estrelasHtml;
}

// 3. Função para formatar a data (ex: 10/04/2026)
function formatarData(dataString) {
  const data = new Date(dataString);
  return data.toLocaleDateString('pt-BR');
}

// 4. Função que pega a lista e "pinta" os comentários na tela
function renderizarComentarios(lista) {
  const container = document.getElementById('lista-comentarios');
  if (!container) return;

  if (lista.length === 0) {
    container.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 2rem 0;">Nenhuma avaliação ainda. Seja o primeiro!</p>';
    return;
  }

  // Transforma cada item da lista em um card de comentário HTML
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
        <div class="comentario-nota">
          ${renderizarEstrelas(av.nota)}
        </div>
      </div>
      <p class="comentario-texto">${av.texto}</p>
    </div>
  `).join('');
}

// 5. Função principal que liga as ações na tela
function configurarSistemaAvaliacao() {
  const btnComentar = document.getElementById('btn-comentar');
  const filtroSelect = document.getElementById('filtro-avaliacoes');

  // Desenha os comentários logo que a página abre (do mais recente pro mais antigo)
  renderizarComentarios(avaliacoes.sort((a, b) => new Date(b.data) - new Date(a.data)));

  // Faz o filtro funcionar
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

  // Faz o botão de publicar funcionar
  if (btnComentar) {
    btnComentar.addEventListener('click', () => {
      const texto = document.getElementById('comentario-texto').value;
      const notaSelecionada = document.querySelector('input[name="rating"]:checked');

      // Trava de segurança: impede de enviar vazio
      if (!notaSelecionada) {
        alert('Por favor, selecione uma nota nas estrelas antes de avaliar.');
        return;
      }
      if (!texto.trim()) {
        alert('Por favor, escreva um comentário.');
        return;
      }

      // Cria a avaliação nova
      const novaAvaliacao = {
        id: Date.now(),
        nome: 'Você (Usuário Logado)',
        iniciais: 'V',
        nota: parseInt(notaSelecionada.value),
        texto: texto,
        data: new Date().toISOString()
      };

      // Coloca no topo da lista
      avaliacoes.unshift(novaAvaliacao);
      
      // Limpa os campos depois que enviou
      document.getElementById('comentario-texto').value = '';
      notaSelecionada.checked = false;
      
      // Reseta o filtro e atualiza a tela
      filtroSelect.value = 'recentes';
      renderizarComentarios(avaliacoes);
    });
  }
}

