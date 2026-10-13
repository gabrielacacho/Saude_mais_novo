import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { iconCalendar } from '../utils/icons.js';
import { getEventoById } from '../services/evento-api.js';

const BASE_URL = "http://127.0.0.1:8000";

function renderMiniEvento(ev) {
  return `
    <a href="evento.html?id=${ev.id}" class="perfil-mini-card">
      <strong>${ev.titulo}</strong>
      <span>${iconCalendar()} ${ev.dataExibicao}</span>
      <span>${ev.categoria}</span>
    </a>
  `;
}

async function init() {
  const authStorage = localStorage.getItem('usuarioLogado');

  if (!authStorage) {
    window.location.href = 'login.html';
    return;
  }

  let usuario = JSON.parse(authStorage);
  let perfilAtual = (usuario.perfil || usuario.tipo || 'comum').toLowerCase();

  // Normaliza o tipo de perfil
  if (perfilAtual.includes('institucional')) perfilAtual = 'institucional';
  else if (perfilAtual.includes('administrador') || perfilAtual.includes('admin')) perfilAtual = 'administrador';
  else perfilAtual = 'comum';

  // BUSCA OS DADOS REAIS NA API PELO E-MAIL LOGADO PARA EVITAR O BUG DO ID 1
  if (usuario.email) {
    try {
      let endpointListagem = `${BASE_URL}/usuarios/comum/`;
      if (perfilAtual === 'institucional') {
        endpointListagem = `${BASE_URL}/usuarios/institucional/`;
      } else if (perfilAtual === 'administrador') {
        endpointListagem = `${BASE_URL}/usuarios/administrador/`;
      }

      const res = await fetch(endpointListagem);
      if (res.ok) {
        const listaUsuarios = await res.json();
        // Encontra o usuário na lista que corresponde exatamente ao e-mail logado
        const usuarioReal = listaUsuarios.find(u => u.email === usuario.email);
        
        if (usuarioReal) {
          usuario = { ...usuario, ...usuarioReal, perfil: perfilAtual };
          localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
        }
      }
    } catch (err) {
      console.warn("Não foi possível buscar a lista completa, usando dados em cache.", err);
    }
  }

  renderHeader(document.getElementById('header-root'), { showSearch: false, activePage: 'perfil' });
  renderFooter(document.getElementById('footer-root'));

  // Define o nome de exibição correto priorizando os dados reais
  const nomeExibicao = usuario.nome_responsavel || usuario.nome || usuario.razao_social || 'Usuário Hub Saúde';
  document.title = `${nomeExibicao} — Hub Saúde`;
  
  const avatarEl = document.getElementById('perfil-avatar');
  if (avatarEl) avatarEl.textContent = nomeExibicao.charAt(0).toUpperCase();
  
  const tipoEl = document.getElementById('perfil-tipo');
  if (tipoEl) {
    const rotulosTipo = {
      comum: 'Usuário Comum',
      institucional: 'Usuário Institucional',
      administrador: 'Administrador'
    };
    tipoEl.textContent = rotulosTipo[perfilAtual] || perfilAtual.toUpperCase();
  }
  
  const nomeEl = document.getElementById('perfil-nome');
  if (nomeEl) nomeEl.textContent = nomeExibicao;

  // Montagem dinâmica das linhas baseada nos dados reais resgatados
  const dadosContainer = document.getElementById('perfil-dados-lista');
  let linhas = [];

  if (perfilAtual === 'institucional') {
    linhas = [
      ['E-mail', usuario.email],
      ['Razão Social', usuario.razao_social],
      ['Nome Fantasia / Instituição', usuario.nome],
      ['CNPJ', usuario.cnpj],
      ['Responsável', usuario.nome_responsavel],
      ['Cargo do Responsável', usuario.cargo_responsavel],
      ['Telefone', usuario.telefone || usuario.telefoneResponsavel],
      ['Endereço', usuario.endereco],
      ['Site', usuario.site],
      ['Atuação / Descrição', usuario.descricao || usuario.vinculo_instituicao],
      ['Status', usuario.status || 'Pendente']
    ];
  } else if (perfilAtual === 'administrador') {
    linhas = [
      ['E-mail', usuario.email],
      ['Nível de Acesso', 'Administrador Master'],
      ['Permissões', 'Gerenciamento global e moderação de instituições']
    ];
  } else {
    linhas = [
      ['E-mail', usuario.email],
      ['Telefone', usuario.telefone || 'Não informado'],
      ['Região Preferida', usuario.regiaoPreferida || 'Não informada']
    ];
  }

  if (dadosContainer) {
    dadosContainer.innerHTML = linhas
      .filter(([_, valor]) => valor !== null && valor !== undefined && valor !== '' && valor !== 'Não informado')
      .map(([dt, dd]) => `<div><dt>${dt}</dt><dd>${dd}</dd></div>`)
      .join('');
  }

  // Controle de visibilidade das seções específicas
  const secaoInscricoes = document.getElementById('perfil-secao-inscricoes');
  const secaoGerenciados = document.getElementById('perfil-secao-gerenciados');
  const secaoAdmin = document.getElementById('perfil-secao-admin');
  const secaoAvaliador = document.getElementById('avaliador-instituicao');

  secaoInscricoes?.classList.add('is-hidden');
  secaoGerenciados?.classList.add('is-hidden');
  secaoAdmin?.classList.add('is-hidden');
  secaoAvaliador?.classList.add('is-hidden');

  if (perfilAtual === 'comum' && usuario.inscricoes?.length) {
    secaoInscricoes?.classList.remove('is-hidden');
    const el = document.getElementById('perfil-inscricoes');
    if (el) {
      const eventos = await Promise.all(usuario.inscricoes.map((id) => getEventoById(id)));
      el.innerHTML = eventos.filter(Boolean).map(renderMiniEvento).join('');
    }
  }

  if (perfilAtual === 'institucional' && usuario.eventosGerenciados?.length) {
    secaoGerenciados?.classList.remove('is-hidden');
    const el = document.getElementById('perfil-gerenciados');
    if (el) {
      const eventos = await Promise.all(usuario.eventosGerenciados.map((id) => getEventoById(id)));
      el.innerHTML = eventos.filter(Boolean).map(renderMiniEvento).join('');
    }
  }

  if (perfilAtual === 'administrador') {
    secaoAdmin?.classList.remove('is-hidden');
    secaoAvaliador?.classList.remove('is-hidden');
  }
}

document.addEventListener('DOMContentLoaded', init);

// Filtros e Modais do Administrador
document.addEventListener('DOMContentLoaded', () => {
  const modalFicha = document.getElementById('modal-ficha-instituicao');
  const fecharModalFicha = document.querySelector('.modal-ficha__fechar');
  const nomeInstituicao = document.getElementById('modal-nome-instituicao');

  function aplicarFiltroAvaliador(filtroTipo, botaoClicado) {
    const avaliador = document.getElementById('avaliador-instituicao');
    if (!avaliador) return;

    const tbody = avaliador.querySelector('#avaliador-instituicoes-lista');
    if (!tbody) return;

    const statusAlvo = filtroTipo === 'pendentes' ? 'pendente' : filtroTipo === 'ativas' ? 'ativa' : 'bloqueada';
    const linhas = tbody.querySelectorAll('tr[data-status]');
    const botoesFiltro = avaliador.querySelectorAll('.avaliador-filtro');

    let totalVisiveis = 0;

    linhas.forEach((linha) => {
      if (linha.dataset.status === statusAlvo) {
        linha.style.display = '';
        totalVisiveis++;
      } else {
        linha.style.display = 'none';
      }
    });

    botoesFiltro.forEach((b) => b.classList.remove('avaliador-filtro--ativo'));
    botaoClicado?.classList.add('avaliador-filtro--ativo');

    tbody.querySelector('.avaliador-mensagem-vazia')?.remove();

    if (totalVisiveis === 0) {
      const mensagens = {
        pendente: 'Nenhuma instituição pendente no momento.',
        ativa: 'Nenhuma instituição ativa no momento.',
        bloqueada: 'Nenhuma instituição bloqueada no momento.'
      };

      const trVazia = document.createElement('tr');
      trVazia.className = 'avaliador-mensagem-vazia';
      trVazia.innerHTML = `<td colspan="4" style="text-align: center; color: #64748b; padding: 1.5rem;">${mensagens[statusAlvo]}</td>`;
      tbody.appendChild(trVazia);
    }
  }

  document.addEventListener('click', (evento) => {
    const botaoFiltro = evento.target.closest('.avaliador-filtro');
    if (botaoFiltro) {
      aplicarFiltroAvaliador(botaoFiltro.dataset.filtro, botaoFiltro);
    }

    const botaoVerFicha = evento.target.closest('.avaliador-ver-ficha');
    if (botaoVerFicha) {
      const linha = botaoVerFicha.closest('tr');
      if (linha && modalFicha && nomeInstituicao) {
        const nome = linha.querySelector('td')?.textContent.trim();
        if (nome) nomeInstituicao.textContent = nome;
        modalFicha.classList.remove('is-hidden');
      }
    }
  });

  fecharModalFicha?.addEventListener('click', () => modalFicha?.classList.add('is-hidden'));
  modalFicha?.addEventListener('click', (evento) => {
    if (evento.target === modalFicha) modalFicha.classList.add('is-hidden');
  });
});