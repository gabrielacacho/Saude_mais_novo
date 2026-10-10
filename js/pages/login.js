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
        perfil: respostaDados.tipo?.toLowerCase() === 'usuario_administrador'
        ? 'administrador'
        : respostaDados.tipo?.toLowerCase() || 'comum'
      };

      //tentando reconhecer tipo de usuariao
      const acessoAdmin = new URLSearchParams(window.location.search)
        .get('perfil') === 'administrador';

      if (acessoAdmin && sessaoOficial.perfil !== 'administrador') {
        throw new Error('Esta conta não é de administrador.');
      }

      // Salva no localStorage que o Header e a Home estão esperando
      localStorage.setItem('usuarioLogado', JSON.stringify(sessaoOficial));
      window.location.href = acessoAdmin ? 'perfil.html' : 'index.html';

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