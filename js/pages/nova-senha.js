import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { iconPin, iconCalendar, iconBuilding } from "../utils/icons.js";
import { configurarOlhosSenha } from '../utils/olho-senha.js';

const BASE_URL = "http://127.0.0.1:8000";

function init() {
  // Ativa o comportamento do olhinho de senha nos campos
  configurarOlhosSenha();

  // Renderiza o cabeçalho e rodapé nas divs do HTML
  const headerRoot = document.getElementById('header-root');
  const footerRoot = document.getElementById('footer-root');

  if (headerRoot) {
    renderHeader(headerRoot, { showSearch: false, activePage: 'login' });
  }
  if (footerRoot) {
    renderFooter(footerRoot);
  }

  // Pega o token seguro que veio na URL (ex: nova-senha.html?token=ABC123XYZ)
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  if (token) {
    alert('Token de segurança inválido ou expirado.');
    window.location.href = 'login.html';
    return;
  }

  const form = document.getElementById('form-nova-senha');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const inputNova = document.getElementById('nova-senha');
    const inputConfirma = document.getElementById('confirma-senha');

    const novaSenha = inputNova ? inputNova.value.trim() : '';
    const confirmaSenha = inputConfirma ? inputConfirma.value.trim() : '';

    if (novaSenha.length < 6) {
      alert('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (novaSenha !== confirmaSenha) {
      alert('As senhas não coincidem. Verifique e tente novamente.');
      return;
    }

    const btnSubmit = form.querySelector('button[type="submit"]');
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.textContent = 'Atualizando senha...';
    }

    try {
      // Envia o token e a nova senha para o back-end em Python (FastAPI)
      const resposta = await fetch(`${BASE_URL}/auth/redefinir-senha`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: token,
          nova_senha: novaSenha
        })
      });

      if (resposta.ok) {
        alert('Senha redefinida com sucesso! Faça login com sua nova senha.');
        window.location.href = 'login.html';
      } else {
        const erroDados = await resposta.json().catch(() => ({}));
        alert(erroDados.detail || 'Não foi possível redefinir a senha. O link pode ter expirado.');
        
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.textContent = 'Atualizar senha';
        }
      }

    } catch (erro) {
      console.error('Erro de conexão:', erro);
      alert('Erro de conexão ao tentar atualizar a senha com o servidor.');

      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Atualizar senha';
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', init);