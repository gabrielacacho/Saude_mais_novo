import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { validarLogin } from '../services/usuarios-api.js';
import { configurarOlhosSenha } from '../utils/olho-senha.js';

/* CRIPTOGRAFIA DESATIVADA TEMPORARIAMENTE (BACK-END RECEBENDO TEXTO PURO)
async function criptografarSenha(senha) {
  const encoder = new TextEncoder();
  const dados = encoder.encode(senha);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dados);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
*/

//visualizar senha
configurarOlhosSenha();

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
      // const senhaHash = await criptografarSenha(senha);
      // const respostaDados = await validarLogin(email, senhaHash);

      // Enviando senha normal para o back-end
      const respostaDados = await validarLogin(email, senha);

      const tipoBruto = (respostaDados.tipo || respostaDados.perfil || '').toLowerCase();
      let perfilNormalizado = 'comum';

      if (tipoBruto.includes('institucional')) {
        perfilNormalizado = 'institucional';
      } else if (tipoBruto.includes('administrador') || tipoBruto.includes('admin')) {
        perfilNormalizado = 'administrador';
      }

      const sessaoOficial = {
        ...respostaDados,
        email: email,
        perfil: perfilNormalizado
      };

      const acessoAdmin = new URLSearchParams(window.location.search)
        .get('perfil') === 'administrador';

      if (acessoAdmin && sessaoOficial.perfil !== 'administrador') {
        throw new Error('Esta conta não é de administrador.');
      }

      localStorage.setItem('usuarioLogado', JSON.stringify(sessaoOficial));
      window.location.href = 'perfil.html';

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