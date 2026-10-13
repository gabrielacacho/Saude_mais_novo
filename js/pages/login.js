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

      // Normaliza o tipo de usuário que veio da API para o padrão do frontend ('comum', 'institucional', 'administrador')
      const tipoBruto = (respostaDados.tipo || respostaDados.perfil || '').toLowerCase();
      let perfilNormalizado = 'comum';

      if (tipoBruto.includes('institucional')) {
        perfilNormalizado = 'institucional';
      } else if (tipoBruto.includes('administrador') || tipoBruto.includes('admin')) {
        perfilNormalizado = 'administrador';
      }

      // Cria a sessão oficial guardando tudo e padronizando o perfil
      const sessaoOficial = {
        ...respostaDados,
        email: email,
        perfil: perfilNormalizado
      };

      // Tentando reconhecer tipo de usuário administrador via URL se necessário
      const acessoAdmin = new URLSearchParams(window.location.search)
        .get('perfil') === 'administrador';

      if (acessoAdmin && sessaoOficial.perfil !== 'administrador') {
        throw new Error('Esta conta não é de administrador.');
      }

      // Salva no localStorage o objeto completo com os dados de sessão
      localStorage.setItem('usuarioLogado', JSON.stringify(sessaoOficial));
      window.location.href = 'perfil.html'; // Vai direto para o perfil para ver os dados renderizados!

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