import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';

let tipoUsuario = null;

function showStep(step) {
  document.getElementById('step-tipo')?.classList.toggle('is-hidden', step !== 1);
  document.getElementById('step-form')?.classList.toggle('is-hidden', step !== 2);
  document.getElementById('step-sucesso')?.classList.toggle('is-hidden', step !== 3);
}

function campoHtml(label, name, type, placeholder = '') {
  return `
    <div>
      <label class="hub-label">${label}</label>
      <input required name="${name}" type="${type}" class="hub-input" placeholder="${placeholder}" />
    </div>
  `;
}

function renderCampos() {
  const container = document.getElementById('campos-dinamicos');
  if (!container) return;

  if (tipoUsuario === 'comum') {
    container.innerHTML = [
      campoHtml('Nome completo', 'nome', 'text', 'Seu nome'),
      campoHtml('CPF', 'cpf', 'text', '000.000.000-00'),
      campoHtml('Data de nascimento', 'nascimento', 'date'),
      campoHtml('E-mail', 'email', 'email', 'email@exemplo.com'),
      campoHtml('Senha', 'senha', 'password', 'Mínimo 6 caracteres'),
    ].join('');
  } else {
    container.innerHTML = [
      campoHtml('Razão social / Nome da instituição', 'instituicao', 'text', 'UBS ou entidade'),
      campoHtml('CNPJ', 'cnpj', 'text', '00.000.000/0000-00'),
      campoHtml('Responsável', 'responsavel', 'text', 'Nome do responsável'),
      campoHtml('E-mail institucional', 'email', 'email', 'contato@ubs.gov.br'),
      campoHtml('Senha', 'senha', 'password', 'Mínimo 6 caracteres'),
    ].join('');
  }

  const label = document.getElementById('tipo-selecionado-label');
  if (label) {
    label.textContent = tipoUsuario === 'comum' ? 'Usuário Comum' : 'Usuário Institucional';
  }
}

function init() {
  renderHeader(document.getElementById('header-root'), { showSearch: false, activePage: 'cadastro' });
  renderFooter(document.getElementById('footer-root'));
  
  showStep(1);

  document.querySelectorAll('[data-tipo]').forEach((btn) => {
    btn.addEventListener('click', () => {
      tipoUsuario = btn.getAttribute('data-tipo');
      document.querySelectorAll('[data-tipo]').forEach((b) => {
        b.classList.remove('is-selected');
      });
      btn.classList.add('is-selected');
    });
  });

  document.getElementById('btn-continuar-tipo')?.addEventListener('click', () => {
    if (!tipoUsuario) {
      alert('Selecione o tipo de usuário para continuar.');
      return;
    }
    renderCampos();
    showStep(2);
  });

  document.getElementById('btn-voltar')?.addEventListener('click', () => showStep(1));

  document.getElementById('form-cadastro')?.addEventListener('submit', (e) => {
    e.preventDefault();
    sessionStorage.setItem('perfilMock', tipoUsuario === 'institucional' ? 'institucional' : 'comum');
    showStep(3);
  });

  document.getElementById('btn-ir-login')?.addEventListener('click', () => {
    window.location.href = 'login.html';
  });
}

document.addEventListener('DOMContentLoaded', init);
