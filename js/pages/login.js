import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { validarLogin } from '../services/usuarios-api.js';

function init() {
  renderHeader(document.getElementById('header-root'), { showSearch: false, activePage: 'login' });
  renderFooter(document.getElementById('footer-root'));

  const formLogin = document.getElementById('form-login');
  
  formLogin?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const btnSubmit = formLogin.querySelector('button[type="submit"]');

    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.textContent = 'Entrando...';
    }

    try {
      // Chama a API real do Python através do serviço
      const respostaDados = await validarLogin(email, senha);

      // Cria a sessão oficial utilizando o tipo que veio do banco
      const sessaoOficial = {
        id: respostaDados.id || 1,
        email: email,
        nome: respostaDados.nome || 'Usuário',
        perfil: respostaDados.tipo || 'comum'
      };

      // Salva no localStorage que o Header e a Home estão esperando
      localStorage.setItem('usuarioLogado', JSON.stringify(sessaoOficial));
      window.location.href = 'index.html';

    } catch (erro) {
      console.error('Erro ao realizar login:', erro);
      alert(erro.message || 'Ocorreu um erro ao conectar com o servidor.');
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Entrar';
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', init);