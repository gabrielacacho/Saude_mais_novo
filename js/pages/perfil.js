//import { getUsuarioPerfil, getEventoById, getRegiaoById } from '../mock-data.js';
import { getUsuarioPerfil, getRegiaoById } from '../mock-data.js';
import { getEventoById } from '../services/evento-api.js';//Assim migramos só os eventos

import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { iconCalendar, iconPin } from '../utils/icons.js';

function renderMiniEvento(ev) {
  return `
    <a href="evento.html?id=${ev.id}" class="perfil-mini-card">
      <strong>${ev.titulo}</strong>
      <span>${iconCalendar()} ${ev.dataExibicao}</span>
      <span>${ev.categoria}</span>
    </a>
  `;
}

//function init() {
async function init() {
  const chave = sessionStorage.getItem('perfilMock') || 'comum';
  const usuario = getUsuarioPerfil(chave);

  renderHeader(document.getElementById('header-root'), { showSearch: false, activePage: 'perfil' });
  renderFooter(document.getElementById('footer-root'));

  document.title = `${usuario.nome} — Hub Saúde`;
  document.getElementById('perfil-avatar').textContent = usuario.avatarInicial;
  document.getElementById('perfil-tipo').textContent = usuario.tipo;
  document.getElementById('perfil-nome').textContent = usuario.nome;
  //comentei a bio aqui ( e no perfil.html) já que não temos certeza se vamos usar 
  //document.getElementById('perfil-bio').textContent = usuario.bio;

  const dados = document.getElementById('perfil-dados-lista');
  const linhas = [
    ['E-mail', usuario.email],
    ['Telefone', usuario.telefone],
  ];

  if (usuario.cnpj) linhas.push(['CNPJ', usuario.cnpj]);

  if (usuario.regiaoPreferida) {
    linhas.push(['Região preferida', getRegiaoById(usuario.regiaoPreferida).nome]);
  }

  if (dados) {
    dados.innerHTML = linhas
      .map(([dt, dd]) => `<div><dt>${dt}</dt><dd>${dd}</dd></div>`)
      .join('');
  }

  // pega o perfil que ta salvo agora no mock
  const perfilAtual = sessionStorage.getItem('perfilMock') || 'comum';

  // so mostra as inscricoes se for usuario comum e tiver alguma coisa salva
  if (perfilAtual === 'comum' && usuario.inscricoes?.length) {

    document.getElementById('perfil-secao-inscricoes')?.classList.remove('is-hidden');

    const el = document.getElementById('perfil-inscricoes');

    if (el) {
      // busca os eventos pelo id e espera tudo carregar
      const eventos = await Promise.all(
        usuario.inscricoes.map((id) => getEventoById(id))
      );

      // joga na tela
      el.innerHTML = eventos
        .filter(Boolean)
        .map(renderMiniEvento)
        .join('');
    }

  } else {

    // esconde a div senao vai aparecer pro institucional e bugar a tela
    document.getElementById('perfil-secao-inscricoes')?.classList.add('is-hidden');
  }


  if (usuario.eventosGerenciados?.length) {

    document.getElementById('perfil-secao-gerenciados')?.classList.remove('is-hidden');

    const el = document.getElementById('perfil-gerenciados');

    if (el) {

      /*  el.innerHTML = usuario.eventosGerenciados
          .map((id) => getEventoById(id))
          .filter(Boolean)
          .map(renderMiniEvento)
          .join('');*/

      const eventos = await Promise.all(
        usuario.eventosGerenciados.map((id) => getEventoById(id))
      );

      el.innerHTML = eventos
        .filter(Boolean)
        .map(renderMiniEvento)
        .join('');
    }
  }


  if (usuario.permissoes?.length) {

    document.getElementById('perfil-secao-admin')?.classList.remove('is-hidden');

    const ul = document.getElementById('perfil-permissoes');

    if (ul) {
      ul.innerHTML = usuario.permissoes
        .map((p) => `<li>${p.replace(/_/g, ' ')}</li>`)
        .join('');
    }

    // Mostra o avaliador de instituições somente para o administrador
    document
      .getElementById('avaliador-instituicao')
      ?.classList.remove('is-hidden');
  }
}


/*OTÃO INSTITUCIONAL SOME NOS OUTROS PERFIS
if (chave === 'institucional') {
  const container = document.getElementById('area-institucional-acoes');

  if (container) {
    container.innerHTML = `
      <div style="margin-top: 20px;">
        <a href="criar-evento.html" class="hub-btn hub-btn--primary">
          Indexar documentação
        </a>
      </div>
    `;
  }
}
*/

document.addEventListener('DOMContentLoaded', init);


// =========================================
// MODAL - FICHA DA INSTITUIÇÃO
// =========================================

document.addEventListener('DOMContentLoaded', () => {

  const modalFicha = document.getElementById('modal-ficha-instituicao');
  const fecharModalFicha = document.querySelector('.modal-ficha__fechar');
  const nomeInstituicao = document.getElementById('modal-nome-instituicao');

  const botoesVerFicha = document.querySelectorAll('.avaliador-ver-ficha');


  botoesVerFicha.forEach((botao) => {

    botao.addEventListener('click', () => {

      // Pega a linha da instituição clicada
      const linha = botao.closest('tr');

      if (!linha || !modalFicha || !nomeInstituicao) {
        return;
      }

      // Pega o nome da primeira coluna
      const nome = linha.querySelector('td')?.textContent.trim();

      // Coloca o nome no título do modal
      if (nome) {
        nomeInstituicao.textContent = nome;
      }

      // Abre o modal
      modalFicha.classList.remove('is-hidden');
    });

  });


  // Fechar pelo X
  fecharModalFicha?.addEventListener('click', () => {
    modalFicha?.classList.add('is-hidden');
  });


  // Fechar clicando no fundo escuro
  modalFicha?.addEventListener('click', (evento) => {

    if (evento.target === modalFicha) {
      modalFicha.classList.add('is-hidden');
    }

  });

});