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
  // Define uma classe no body de acordo com o tipo de cadastro escolhido.
  // Isso permite que o CSS diferencie o tamanho do cadastro comum
  // do cadastro institucional.
  document.body.classList.toggle('cadastro-comum', tipoUsuario === 'comum');
  document.body.classList.toggle('cadastro-institucional', tipoUsuario === 'institucional');

  const container = document.getElementById('campos-dinamicos');
  if (!container) return;

  if (tipoUsuario === 'comum') {
    container.innerHTML = [
      campoHtml('Nome completo *', 'nome', 'text', 'Seu nome'),
      campoHtml('CPF *', 'cpf', 'text', '000.000.000-00'),
      campoHtml('Data de nascimento *', 'nascimento', 'date'),
      campoHtml('E-mail *', 'email', 'email', 'email@exemplo.com'),
      campoHtml('Telefone *', 'telefone', 'tel', '(00) 00000-0000'),
      campoHtml('Senha *', 'senha', 'password', 'Mínimo 6 caracteres'),
      campoHtml('Confirmar senha *', 'confirmarSenha', 'password', 'Repita a senha')
    ].join('');
  } else {
    container.innerHTML = [
      // INÍCIO DO GRID DUPLO (Lado a Lado)
      '<div class="cadastro-grid-duplo">',

        // COLUNA ESQUERDA: IDENTIFICAÇÃO
        '<div class="cadastro-coluna">',
          '<h3 class="hub-form-section-title">Identificação da Instituição</h3>',
          campoHtml('Razão social *', 'razaoSocial', 'text', 'Razão social da instituição'),
          campoHtml('Nome social / Nome fantasia *', 'nomeFantasia', 'text', 'Nome fantasia'),
          campoHtml('CNPJ *', 'cnpj', 'text', '00.000.000/0000-00'),
          campoHtml('Endereço *', 'endereco', 'text', 'Rua, número, bairro, cidade/UF'),
          campoHtml('Tipo de instituição *', 'tipoInstituicao', 'text', 'Ex: Empresa privada, ONG, Público'),
          campoHtml('Site / Rede social', 'site', 'url', 'https://www.exemplo.com.br'), // Opcional (sem *) e com type="url"
        '</div>',

        // COLUNA DIREITA: RESPONSÁVEL
        '<div class="cadastro-coluna">',
          '<h3 class="hub-form-section-title">Responsável pela Instituição</h3>',
          campoHtml('Nome do responsável *', 'nomeResponsavel', 'text', 'Nome completo'),
          campoHtml('Cargo / Função *', 'cargoResponsavel', 'text', 'Cargo na instituição'),
          campoHtml('E-mail do responsável *', 'emailResponsavel', 'email', 'email@instituicao.com'),
          campoHtml('Telefone *', 'telefoneResponsavel', 'tel', '(00) 00000-0000'),
        '</div>',

      '</div>', // FIM DO GRID DUPLO

      // SEÇÃO INFERIOR: ATUAÇÃO, DOCUMENTOS E SENHAS
      '<div class="cadastro-secao-inferior">',
        '<h3 class="hub-form-section-title">Atuação e Segurança</h3>',
        campoHtml('Atuação da instituição *', 'atuacao', 'text', 'Descreva brevemente as atividades'),
        campoHtml('Comprovante de CNPJ *', 'docCnpj', 'file', ''),
        campoHtml('Documento do responsável *', 'docResponsavel', 'file', ''),
        campoHtml('Comprovante de vínculo', 'docVinculo', 'file', ''),
        
        // BLOCO DE SENHAS LADO A LADO
        '<div class="cadastro-grid-senhas">',
          campoHtml('Senha de acesso *', 'senha', 'password', 'Mínimo 6 caracteres'),
          campoHtml('Confirmar senha *', 'confirmarSenha', 'password', 'Repita a senha'),
        '</div>',
      '</div>'
    ].join('');

    // Remove o atributo 'required' dos campos opcionais
    const siteInput = container.querySelector('[name="site"]');
    if (siteInput) siteInput.removeAttribute('required');

    const docVinculoInput = container.querySelector('[name="docVinculo"]');
    if (docVinculoInput) docVinculoInput.removeAttribute('required');
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

    const form = e.target;
    const senha = form.querySelector('[name="senha"]')?.value;
    const confirmarSenha = form.querySelector('[name="confirmarSenha"]')?.value;

    if (senha !== confirmarSenha) {
      alert('As senhas não coincidem. Por favor, verifique e tente novamente.');
      return;
    }

    sessionStorage.setItem('perfilMock', tipoUsuario === 'institucional' ? 'institucional' : 'comum');
    showStep(3);
  });

  document.getElementById('btn-ir-login')?.addEventListener('click', () => {
    window.location.href = 'login.html';
  });
}

document.addEventListener('DOMContentLoaded', init);