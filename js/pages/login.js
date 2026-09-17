import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';

//Inicializa page e configura o envio do formulário de login
function init() {
  renderHeader(document.getElementById('header-root'), { showSearch: false, activePage: 'login' });
  renderFooter(document.getElementById('footer-root'));

  document.getElementById('form-login')?.addEventListener('submit', (e) => {
    e.preventDefault();
    sessionStorage.setItem('perfilMock', 'comum');
    window.location.href = 'index.html';
  });
}

document.addEventListener('DOMContentLoaded', init);
