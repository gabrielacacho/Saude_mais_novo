import { getEventoById } from '../services/evento-api.js';
import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { iconCalendar, iconPin, iconUsers } from '../utils/icons.js';
import { inscreverUsuario } from '../services/inscricao-api.js';

// Ícones da página
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

// Exibe os dados do evento
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
  const btnInscrever = document.getElementById('btn-inscrever');

  if (banner) {
    banner.src = ev.foto_capa;
    banner.alt = ev.titulo;
  }

  if (tag) tag.textContent = ev.categoria || 'Evento';
  if (tituloDesc) tituloDesc.textContent = ev.titulo;
  if (descricao) descricao.textContent = ev.descricao;

  if (dataInicio) {
    dataInicio.textContent = ev.dataExibicao
      ? `${ev.dataExibicao} às 09:00`
      : 'A definir';
  }

  if (dataFim) {
    dataFim.textContent = ev.dataExibicao
      ? `${ev.dataExibicao} às 12:00`
      : 'A definir';
  }

  if (local) {
    local.textContent = ev.localizacao || 'Local a definir';

    const buscaMapa = encodeURIComponent(
      `${ev.localizacao || ''}, Rio de Janeiro`
    );

    local.setAttribute(
      'href',
      `https://maps.google.com/?q=${buscaMapa}`
    );
  }

  if (unidade) {
    unidade.textContent = ev.unidade || 'UBS / Clínica da Família local';
  }

  if (instituicao) {
    instituicao.textContent =
      ev.instituicao || 'Secretaria Municipal de Saúde';
  }

  // Estado da inscrição: chave separada para cada evento
  const inscritoKey = `inscrito_evento_${ev.id}`;
  const jaInscrito =
    localStorage.getItem(inscritoKey) === 'true' ||
    ev.usuario_ja_inscrito === true;

  // Quantidade de participantes e capacidade
  const inscritosAtuais = Number(
    ev.numero_participantes ?? ev.inscritos_count ?? 0
  );

  const max = Number(
    ev.capacidade_maxima ?? ev.vagas_maximas ?? 30
  );

  const lotado = inscritosAtuais >= max;

  if (capacidade) {
    capacidade.textContent = `${inscritosAtuais} / ${max}`;
  }

  if (barraFill) {
    const porcentagem = max > 0
      ? Math.min((inscritosAtuais / max) * 100, 100)
      : 0;

    barraFill.style.width = `${porcentagem}%`;
    barraFill.style.backgroundColor =
      porcentagem >= 100 ? '#E63946' : '';
  }

  // Atualiza o botão
  function atualizarBotao(inscrito) {
    if (!btnInscrever) return;

    btnInscrever.classList.remove('hub-btn--inscrito');
    btnInscrever.style.opacity = '1';
    btnInscrever.style.pointerEvents = 'auto';
    btnInscrever.disabled = false;

    if (inscrito) {
      btnInscrever.textContent = 'Inscrito ✓';
      btnInscrever.classList.add('hub-btn--inscrito');
      btnInscrever.disabled = true;
      btnInscrever.style.pointerEvents = 'none';
    } else if (lotado) {
      btnInscrever.textContent = 'Vagas Esgotadas';
      btnInscrever.disabled = true;
      btnInscrever.style.opacity = '0.5';
      btnInscrever.style.pointerEvents = 'none';
    } else {
      btnInscrever.textContent = 'Garantir Minha Vaga';
    }
  }

  atualizarBotao(jaInscrito);

  // Evita acumular eventos de clique ao renderizar novamente
  if (btnInscrever) {
    const novoBtn = btnInscrever.cloneNode(true);
    btnInscrever.parentNode.replaceChild(novoBtn, btnInscrever);

    // Se já está inscrito ou não há vagas, não permite clicar
    if (jaInscrito || lotado) {
      atualizarBotao(jaInscrito);
      return;
    }

    novoBtn.addEventListener('click', async () => {
      const usuarioJSON = localStorage.getItem('usuarioLogado');

      if (!usuarioJSON) {
        alert('Entre na sua conta para se inscrever no evento.');
        window.location.href = 'login.html';
        return;
      }

      let usuario;

      try {
        usuario = JSON.parse(usuarioJSON);
      } catch (erro) {
        alert('Sua sessão está inválida. Entre novamente.');
        return;
      }

      if (!usuario.id) {
        alert(
          'Não foi possível identificar seu usuário. Entre novamente na sua conta.'
        );
        return;
      }

      novoBtn.disabled = true;
      novoBtn.textContent = 'Processando...';

      try {
        // Usa o serviço que já se comunicou com o backend
        await inscreverUsuario(ev.id, usuario.id);

        // Guarda o estado para este evento
        localStorage.setItem(inscritoKey, 'true');

        novoBtn.textContent = 'Inscrito ✓';
        novoBtn.classList.add('hub-btn--inscrito');

        alert('Inscrição realizada com sucesso!');
      } catch (error) {
        console.error('Erro ao realizar inscrição:', error);

        alert(
          error.message || 'Não foi possível realizar a inscrição.'
        );

        novoBtn.textContent = 'Garantir Minha Vaga';
        novoBtn.disabled = false;
      }
    });
  }
}

// SISTEMA DE AVALIAÇÕES
let avaliacoes = [
  {
    id: 1,
    nome: 'Maria Silva',
    iniciais: 'M',
    nota: 5,
    texto: 'Evento maravilhoso! Os professores são super atenciosos com os idosos.',
    data: '2026-04-10T14:30:00'
  },
  {
    id: 2,
    nome: 'João Pedro',
    iniciais: 'J',
    nota: 4,
    texto: 'Muito bom, mas achei o espaço um pouco apertado para a quantidade de pessoas.',
    data: '2026-04-12T09:15:00'
  },
  {
    id: 3,
    nome: 'Ana Costa',
    iniciais: 'A',
    nota: 5,
    texto: 'Minha mãe adorou. Com certeza voltaremos na próxima edição!',
    data: '2026-04-15T16:45:00'
  }
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
    container.innerHTML =
      '<p style="color: #6b7280; text-align: center; padding: 2rem 0;">Nenhuma avaliação ainda. Seja o primeiro!</p>';
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

  renderizarComentarios(
    avaliacoes.sort((a, b) => new Date(b.data) - new Date(a.data))
  );

  if (filtroSelect) {
    filtroSelect.addEventListener('change', (e) => {
      let filtrados = [...avaliacoes];

      if (e.target.value === 'maior-nota') {
        filtrados.sort((a, b) => b.nota - a.nota);
      } else if (e.target.value === 'menor-nota') {
        filtrados.sort((a, b) => a.nota - b.nota);
      } else {
        filtrados.sort(
          (a, b) => new Date(b.data) - new Date(a.data)
        );
      }

      renderizarComentarios(filtrados);
    });
  }

  if (btnComentar) {
    const novoBtn = btnComentar.cloneNode(true);
    btnComentar.parentNode.replaceChild(novoBtn, btnComentar);

    novoBtn.addEventListener('click', () => {
      const textarea = document.getElementById('comentario-texto');
      const texto = textarea?.value || '';
      const notaSelecionada = document.querySelector(
        'input[name="rating"]:checked'
      );

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
        nota: parseInt(notaSelecionada.value, 10),
        texto: texto,
        data: new Date().toISOString()
      };

      avaliacoes.unshift(novaAvaliacao);
      textarea.value = '';
      notaSelecionada.checked = false;

      if (filtroSelect) filtroSelect.value = 'recentes';

      renderizarComentarios(avaliacoes);
    });
  }
}

async function init() {
  const conteudo = document.getElementById('evento-conteudo');

  if (conteudo) {
    conteudo.style.opacity = '0';
    conteudo.style.pointerEvents = 'none';
  }

  renderHeader(
    document.getElementById('header-root'),
    { showSearch: true, activePage: 'evento' }
  );

  renderFooter(document.getElementById('footer-root'));
  injectEventoIcons();

  const id = getQueryId() || 'evt-1';

  try {
    const ev = await getEventoById(id);

    if (!ev) {
      if (conteudo) conteudo.classList.add('is-hidden');
      document.getElementById('evento-erro')?.classList.remove('is-hidden');
      return;
    }

    renderEvento(ev);
    configurarSistemaAvaliacao();

    if (conteudo) {
      conteudo.style.transition = 'opacity 0.3s ease-in';
      conteudo.style.opacity = '1';
      conteudo.style.pointerEvents = 'auto';
    }
  } catch (error) {
    console.error('Erro ao carregar evento:', error);

    if (conteudo) conteudo.classList.add('is-hidden');
    document.getElementById('evento-erro')?.classList.remove('is-hidden');
  }
}

document.addEventListener('DOMContentLoaded', init);