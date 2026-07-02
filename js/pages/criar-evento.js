// Aqui ta importa as dependências necessárias da nova pagina thais
import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';

function init() {
  renderHeader(document.getElementById('header-root'), { showSearch: false, activePage: 'perfil' });
  renderFooter(document.getElementById('footer-root'));

  console.log('Layouts globais (Header/Footer) injetados com sucesso!');
}

document.addEventListener('DOMContentLoaded', init);