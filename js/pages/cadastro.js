import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { cadastrarUsuario } from '../services/usuarios-api.js';

let tipoUsuario = null;

//CONTROLE DAS ETAPAS
function showStep(step) {
  document
    .getElementById('step-tipo')
    ?.classList.toggle('is-hidden', step !== 1);

  document
    .getElementById('step-form')
    ?.classList.toggle('is-hidden', step !== 2);

  document
    .getElementById('step-sucesso')
    ?.classList.toggle('is-hidden', step !== 3);
}



   //GERADOR DE CAMPOS HTML
function campoHtml(
  label,
  name,
  type,
  placeholder = '',
  extra = ''
) {
  return `
    <div>
      <label for="${name}" class="hub-label">
        ${label}
      </label>

      <input
        id="${name}"
        name="${name}"
        type="${type}"
        class="hub-input"
        placeholder="${placeholder}"
        ${extra}
      />

      <small
        class="campo-erro"
        id="erro-${name}"
      ></small>
    </div>
  `;
}


   //MÁSCARAS DE ENTRADA
function mascararCPF(valor) {
  return valor
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .substring(0, 14);
}


function mascararCNPJ(valor) {
  return valor
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .substring(0, 18);
}


function mascararTelefone(valor) {
  const numeros = valor.replace(/\D/g, '');

  if (numeros.length <= 10) {
    return numeros
      .replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
      .substring(0, 14);
  }

  return numeros
    .replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
    .substring(0, 15);
}



   //MONTAGEM DINÂMICA DO FORMULÁRIO
function renderCampos() {
  document.body.classList.toggle(
    'cadastro-comum',
    tipoUsuario === 'comum'
  );

  document.body.classList.toggle(
    'cadastro-institucional',
    tipoUsuario === 'institucional'
  );

  const container = document.getElementById('campos-dinamicos');
  if (!container) return;



     //USUÁRIO COMUM
  if (tipoUsuario === 'comum') {
    container.innerHTML = [

      campoHtml(
        'Nome completo *',
        'nome',
        'text',
        'Seu nome completo'
      ),

      campoHtml(
        'CPF *',
        'cpf',
        'text',
        '000.000.000-00',
        'maxlength="14"'
      ),

      campoHtml(
        'Data de nascimento *',
        'nascimento',
        'date'
      ),

      campoHtml(
        'E-mail *',
        'email',
        'email',
        'seu@email.com'
      ),

      campoHtml(
        'Telefone *',
        'telefone',
        'tel',
        '(00) 00000-0000',
        'maxlength="15"'
      ),

      campoHtml(
        'Senha *',
        'senha',
        'password',
        'Mínimo 6 caracteres',
        'minlength="6"'
      ),

      campoHtml(
        'Confirmar senha *',
        'confirmarSenha',
        'password',
        'Digite a senha novamente',
        'minlength="6"'
      )

    ].join('');

  }

     //USUÁRIO INSTITUCIONAl
  else {

    container.innerHTML = [

      `
        <div class="cadastro-grid-duplo">

          <div class="cadastro-coluna">

            <h3 class="hub-form-section-title">
              Identificação da Instituição
            </h3>

            ${campoHtml(
              'Razão social *',
              'razaoSocial',
              'text',
              'Razão social da instituição'
            )}

            ${campoHtml(
              'Nome social / Nome fantasia *',
              'nomeFantasia',
              'text',
              'Nome fantasia'
            )}

            ${campoHtml(
              'CNPJ *',
              'cnpj',
              'text',
              '00.000.000/0000-00',
              'maxlength="18"'
            )}

            ${campoHtml(
              'Endereço *',
              'endereco',
              'text',
              'Rua, número, bairro, cidade/UF'
            )}

            <div>
              <label
                for="tipoInstituicao"
                class="hub-label"
              >
                Tipo de instituição *
              </label>

              <select
                id="tipoInstituicao"
                name="tipoInstituicao"
                class="hub-input"
                required
              >
                <option value="">Selecione</option>
                <option value="ubs">UBS</option>
                <option value="clinica">Clínica</option>
                <option value="hospital">Hospital</option>
                <option value="ong">ONG</option>
                <option value="outro">Outro</option>
              </select>

              <small
                class="campo-erro"
                id="erro-tipoInstituicao"
              ></small>
            </div>

            ${campoHtml(
              'Site / Rede social',
              'site',
              'url',
              'https://www.exemplo.com.br'
            )}

          </div>


          <div class="cadastro-coluna">

            <h3 class="hub-form-section-title">
              Responsável pela Instituição
            </h3>

            ${campoHtml(
              'Nome do responsável *',
              'nomeResponsavel',
              'text',
              'Nome completo'
            )}

            ${campoHtml(
              'Cargo / Função *',
              'cargoResponsavel',
              'text',
              'Cargo na instituição'
            )}

            ${campoHtml(
              'E-mail do responsável *',
              'emailResponsavel',
              'email',
              'email@instituicao.com'
            )}

            ${campoHtml(
              'Telefone *',
              'telefoneResponsavel',
              'tel',
              '(00) 00000-0000',
              'maxlength="15"'
            )}

          </div>

        </div>
      `,


      `
        <div class="cadastro-secao-inferior">

          <h3 class="hub-form-section-title">
            Atuação e Segurança
          </h3>

          ${campoHtml(
            'Atuação da instituição *',
            'atuacao',
            'text',
            'Descreva brevemente as atividades'
          )}

          ${campoHtml(
            'Comprovante de CNPJ *',
            'docCnpj',
            'file',
            '',
            'accept=".pdf,.jpg,.jpeg,.png"'
          )}

          ${campoHtml(
            'Documento do responsável *',
            'docResponsavel',
            'file',
            '',
            'accept=".pdf,.jpg,.jpeg,.png"'
          )}

          ${campoHtml(
            'Comprovante de vínculo',
            'docVinculo',
            'file',
            '',
            'accept=".pdf,.jpg,.jpeg,.png"'
          )}


          <div class="cadastro-grid-senhas">

            ${campoHtml(
              'Senha de acesso *',
              'senha',
              'password',
              'Mínimo 6 caracteres',
              'minlength="6"'
            )}

            ${campoHtml(
              'Confirmar senha *',
              'confirmarSenha',
              'password',
              'Repita a senha',
              'minlength="6"'
            )}

          </div>

        </div>
      `

    ].join('');
  }


  const label = document.getElementById(
    'tipo-selecionado-label'
  );

  if (label) {
    label.textContent =
      tipoUsuario === 'comum'
        ? 'Usuário Comum'
        : 'Usuário Institucional';
  }

  initEventosDinamicos();
}


   //EVENTOS DINÂMICOS
function initEventosDinamicos() {

  const inputCpf = document.getElementById('cpf');

  if (inputCpf) {
    inputCpf.addEventListener('input', (e) => {
      e.target.value = mascararCPF(e.target.value);
    });
  }


  const inputCnpj = document.getElementById('cnpj');

  if (inputCnpj) {
    inputCnpj.addEventListener('input', (e) => {
      e.target.value = mascararCNPJ(e.target.value);
    });
  }


  const inputsTelefone = [
    document.getElementById('telefone'),
    document.getElementById('telefoneResponsavel')
  ];

  inputsTelefone.forEach((input) => {

    if (input) {
      input.addEventListener('input', (e) => {
        e.target.value = mascararTelefone(
          e.target.value
        );
      });
    }

  });
}



   //FUNÇÕES AUXILIARES DE VALIDAÇÃO
function limparNumeros(valor) {
  return (valor || '').replace(/\D/g, '');
}


   //VALIDAÇÃO DE NOME
function validarNome(nome) {

  const valor = (nome || '').trim();

  if (!valor) {
    return 'Informe seu nome completo.';
  }

  if (/\d/.test(valor)) {
    return 'O nome não pode conter números.';
  }

  const partes = valor.split(/\s+/);

  if (partes.length < 2) {
    return 'Digite seu nome completo.';
  }

  return '';
}



   //VALIDAÇÃO DE CPF
function validarCPF(cpf) {

  cpf = limparNumeros(cpf);

  if (cpf.length !== 11) {
    return 'CPF deve conter 11 dígitos.';
  }

  if (/^(\d)\1+$/.test(cpf)) {
    return 'CPF inválido.';
  }


  let soma = 0;

  for (let i = 0; i < 9; i++) {
    soma += Number(cpf[i]) * (10 - i);
  }

  let resto = (soma * 10) % 11;

  if (resto === 10) {
    resto = 0;
  }

  if (resto !== Number(cpf[9])) {
    return 'CPF inválido.';
  }


  soma = 0;

  for (let i = 0; i < 10; i++) {
    soma += Number(cpf[i]) * (11 - i);
  }

  resto = (soma * 10) % 11;

  if (resto === 10) {
    resto = 0;
  }

  if (resto !== Number(cpf[10])) {
    return 'CPF inválido.';
  }

  return '';
}



   //VALIDAÇÃO DE CNPJ
function validarCNPJ(cnpj) {

  cnpj = limparNumeros(cnpj);
  if (cnpj.length !== 14) {
    return 'CNPJ deve conter 14 dígitos.';
  }
  if (/^(\d)\1+$/.test(cnpj)) {
    return 'CNPJ inválido.';
  }


  let tamanho = 12;
  let numeros = cnpj.substring(0, tamanho);
  let digitos = cnpj.substring(tamanho);

  let soma = 0;
  let pos = tamanho - 7;


  for (let i = 0; i < tamanho; i++) {
    soma += Number(numeros[i]) * pos--;
    if (pos < 2) {
      pos = 9;
    }
  }


  let resultado =
    soma % 11 < 2
      ? 0
      : 11 - (soma % 11);


  if (resultado !== Number(digitos[0])) {
    return 'CNPJ inválido.';
  }


  tamanho = 13;
  numeros = cnpj.substring(0, tamanho);

  soma = 0;
  pos = tamanho - 7;


  for (let i = 0; i < tamanho; i++) {

    soma += Number(numeros[i]) * pos--;

    if (pos < 2) {
      pos = 9;
    }
  }


  resultado =
    soma % 11 < 2
      ? 0
      : 11 - (soma % 11);


  if (resultado !== Number(digitos[1])) {
    return 'CNPJ inválido.';
  }
  return '';
}



   //VALIDAÇÃO DE E-MAIL
function validarEmail(email) {

  const valor = (email || '').trim();

  const regex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!regex.test(valor)) {
    return 'Digite um e-mail válido.';
  }

  return '';
}

   //VALIDAÇÃO DE TELEFONE
function validarTelefone(telefone) {

  const numero = limparNumeros(telefone);

  if (
    numero.length !== 10 &&
    numero.length !== 11
  ) {
    return 'Digite um telefone válido.';
  }

  return '';
}

   //VALIDAÇÃO DA SENHA
function validarSenha(senha) {
  if (!senha || senha.length < 6) {
    return 'A senha deve ter no mínimo 6 caracteres.';
  }

  return '';
}


   //VALIDAÇÃO DA DATA DE NASCIMENTO
function validarDataNascimento(data) {

  if (!data) {
    return 'Informe sua data de nascimento.';
  }

  const nascimento =
    new Date(`${data}T00:00:00`);

  const hoje = new Date();

  if (nascimento > hoje) {
    return 'A data de nascimento não pode ser futura.';
  }

  return '';
}

   //MENSAGENS DE ERRO
function mostrarErro(campo, mensagem) {
  const erro =
    document.getElementById(`erro-${campo}`);

  const input =
    document.getElementById(campo);

  if (erro) {
    erro.textContent = mensagem;
  }

  if (input) {
    input.classList.add(
      'hub-input--error'
    );
  }
}


function limparErros() {
  document
    .querySelectorAll('.campo-erro')
    .forEach((elemento) => {
      elemento.textContent = '';
    });

  document
    .querySelectorAll('.hub-input')
    .forEach((input) => {
      input.classList.remove(
        'hub-input--error'
      );
    });
}


   //VALIDAÇÃO DO FORMULÁRIO (não preciso deixar assincrona)
function validarFormulario() {

  limparErros();

  let valido = true;

//COMUM
  if (tipoUsuario === 'comum') {

    const nome =
      document.getElementById('nome')?.value;

    const cpf =
      document.getElementById('cpf')?.value;

    const nascimento =
      document.getElementById('nascimento')?.value;

    const email =
      document.getElementById('email')?.value;

    const telefone =
      document.getElementById('telefone')?.value;


    const erroNome =
      validarNome(nome);

    if (erroNome) {
      mostrarErro('nome', erroNome);
      valido = false;
    }


    const erroCpf =
      validarCPF(cpf);

    if (erroCpf) {
      mostrarErro('cpf', erroCpf);
      valido = false;
    }


    const erroNascimento =
      validarDataNascimento(nascimento);

    if (erroNascimento) {
      mostrarErro(
        'nascimento',
        erroNascimento
      );

      valido = false;
    }


    const erroEmail =
      validarEmail(email);

    if (erroEmail) {
      mostrarErro('email', erroEmail);
      valido = false;
    }


    const erroTelefone =
      validarTelefone(telefone);

    if (erroTelefone) {
      mostrarErro(
        'telefone',
        erroTelefone
      );

      valido = false;
    }

  }



     //INSTITUCIONAL
  else {

    const razaoSocial =
      document.getElementById(
        'razaoSocial'
      )?.value;

    const nomeFantasia =
      document.getElementById(
        'nomeFantasia'
      )?.value;

    const cnpj =
      document.getElementById(
        'cnpj'
      )?.value;

    const endereco =
      document.getElementById(
        'endereco'
      )?.value;

    const tipoInstituicao =
      document.getElementById(
        'tipoInstituicao'
      )?.value;

    const nomeResponsavel =
      document.getElementById(
        'nomeResponsavel'
      )?.value;

    const cargoResponsavel =
      document.getElementById(
        'cargoResponsavel'
      )?.value;

    const emailResponsavel =
      document.getElementById(
        'emailResponsavel'
      )?.value;

    const telefoneResponsavel =
      document.getElementById(
        'telefoneResponsavel'
      )?.value;

    const atuacao =
      document.getElementById(
        'atuacao'
      )?.value;


    if (!razaoSocial?.trim()) {
      mostrarErro(
        'razaoSocial',
        'Informe a razão social.'
      );

      valido = false;
    }


    if (!nomeFantasia?.trim()) {
      mostrarErro(
        'nomeFantasia',
        'Informe o nome social ou nome fantasia.'
      );

      valido = false;
    }


    const erroCnpj =
      validarCNPJ(cnpj);

    if (erroCnpj) {
      mostrarErro(
        'cnpj',
        erroCnpj
      );

      valido = false;
    }


    if (!endereco?.trim()) {
      mostrarErro(
        'endereco',
        'Informe o endereço.'
      );

      valido = false;
    }


    if (!tipoInstituicao) {
      mostrarErro(
        'tipoInstituicao',
        'Selecione o tipo de instituição.'
      );

      valido = false;
    }


    const erroNomeResponsavel =
      validarNome(nomeResponsavel);

    if (erroNomeResponsavel) {
      mostrarErro(
        'nomeResponsavel',
        erroNomeResponsavel
      );

      valido = false;
    }


    if (!cargoResponsavel?.trim()) {
      mostrarErro(
        'cargoResponsavel',
        'Informe o cargo ou função.'
      );

      valido = false;
    }


    const erroEmail =
      validarEmail(emailResponsavel);

    if (erroEmail) {
      mostrarErro(
        'emailResponsavel',
        erroEmail
      );

      valido = false;
    }


    const erroTelefone =
      validarTelefone(telefoneResponsavel);

    if (erroTelefone) {
      mostrarErro(
        'telefoneResponsavel',
        erroTelefone
      );

      valido = false;
    }


    if (!atuacao?.trim()) {
      mostrarErro(
        'atuacao',
        'Informe a atuação da instituição.'
      );

      valido = false;
    }


    const docCnpj =
      document.getElementById(
        'docCnpj'
      )?.files[0];

    const docResponsavel =
      document.getElementById(
        'docResponsavel'
      )?.files[0];


    if (!docCnpj) {
      mostrarErro(
        'docCnpj',
        'Envie o comprovante de CNPJ.'
      );

      valido = false;
    }


    if (!docResponsavel) {
      mostrarErro(
        'docResponsavel',
        'Envie o documento do responsável.'
      );

      valido = false;
    }

  }


     //SENHA COMUM E INSTITUCIONAL
  const senha =
    document.getElementById(
      'senha'
    )?.value;

  const confirmarSenha =
    document.getElementById(
      'confirmarSenha'
    )?.value;


  const erroSenha =
    validarSenha(senha);

  if (erroSenha) {

    mostrarErro(
      'senha',
      erroSenha
    );

    valido = false;
  }


  if (senha !== confirmarSenha) {

    mostrarErro(
      'confirmarSenha',
      'As senhas não coincidem.'
    );

    valido = false;
  }


  return valido;
}



   //INICIALIZAÇÃO
function init() {
  renderHeader(
    document.getElementById('header-root'),
    {
      showSearch: false,
      activePage: 'cadastro'
    }
  );

  renderFooter(
    document.getElementById('footer-root')
  );


  showStep(1);



     //SELEÇÃO DO TIPO
  document
    .querySelectorAll('[data-tipo]')
    .forEach((btn) => {

      btn.addEventListener('click', () => {

        tipoUsuario =
          btn.getAttribute('data-tipo');
        document
          .querySelectorAll('[data-tipo]')
          .forEach((b) => {
            b.classList.remove(
              'is-selected'
            );
          });


        btn.classList.add(
          'is-selected'
        );
      });

    });



     //CONTINUAR
  document
    .getElementById(
      'btn-continuar-tipo'
    )
    ?.addEventListener(
      'click',
      () => {
        if (!tipoUsuario) {
          alert(
            'Selecione o tipo de usuário para continuar.'
          );
          return;
        }
        renderCampos();
        showStep(2);
      }
    );


 
     //VOLTAR
  document
    .getElementById('btn-voltar')
    ?.addEventListener(
      'click',
      () => {

        showStep(1);

        document.body.classList.remove(
          'cadastro-comum',
          'cadastro-institucional'
        );
      }
    );



     //ENVIO DO CADASTRO
  document
    .getElementById('form-cadastro')
    ?.addEventListener(
      'submit',
      async (e) => {

        e.preventDefault();


           //VALIDAÇÃO SÍNCRONA
        if (!validarFormulario()) {
          return;
        }


           // ENVIO ASSÍNCRONO PARA API
        const form =
          e.currentTarget;

        const submitBtn =
          form.querySelector(
            'button[type="submit"]'
          );


        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent =
            'Enviando...';
        }

        try {
          const formData =
            new FormData(form);
            
          formData.append(
            'tipoUsuario',
            tipoUsuario
          );



//await aquiiiiiii
          const resposta =
            await cadastrarUsuario(formData);
          if (resposta?.sucesso) {
            sessionStorage.setItem(
              'perfilMock',
              tipoUsuario === 'institucional'
                ? 'institucional'
                : 'comum'
            );
            showStep(3);

          } else {
            alert(
              resposta?.mensagem ||
              'Não foi possível realizar o cadastro.'
            );
          }
        } catch (erro) {
          console.error(
            'Erro no cadastro:',
            erro
          );
          alert(
            erro.message ||
            'Ocorreu um erro ao realizar o cadastro.'
          );


        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent =
              'Finalizar';
          }
        }
      }
    );



     //IR PARA LOGIN
  document
    .getElementById('btn-ir-login')
    ?.addEventListener(
      'click',
      () => {
        window.location.href =
          'login.html';
      }
    );
}


  // INICIAR PÁGINA
document.addEventListener(
  'DOMContentLoaded',
  init
);