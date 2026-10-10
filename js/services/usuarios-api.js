const BASE_URL = "http://127.0.0.1:8000";

export async function cadastrarUsuario(formData) {
  const perfil = formData.get('tipoUsuario') || 'comum';

  const dadosObjeto = {};

  formData.forEach((value, key) => {
    if (key !== 'tipoUsuario' && key !== 'confirmarSenha') {
      dadosObjeto[key] = value;
    }
  });

  const url = perfil === 'comum'
    ? `${BASE_URL}/usuarios/comum/criar_usuario/`
    : `${BASE_URL}/usuarios/institucional/criar_usuario/`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dadosObjeto)
  });

  if (!response.ok) {
    let mensagem = "Erro ao cadastrar no servidor.";

    try {
      const erro = await response.json();

      if (Array.isArray(erro.detail)) {
        mensagem = erro.detail
          .map(e => `${e.loc.join('->')}: ${e.msg}`)
          .join(' | ');
      } else {
        mensagem = erro.detail || erro.mensagem || erro.message || mensagem;
      }
    } catch (e) {}

    throw new Error(mensagem);
  }

  return {
    sucesso: true,
    dados: await response.json()
  };
}

export async function validarLogin(email, senha) {
  const response = await fetch(`${BASE_URL}/usuarios/validar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, senha })
  });

  let dados = {};

  try {
    dados = await response.json();
  } catch (erro) {
    dados = {};
  }

  if (!response.ok) {
    throw new Error(
      dados.detail || dados.mensagem || 'E-mail ou senha incorretos.'
    );
  }

  // Retorna os dados diretamente para o login.js.
  // Aceita tanto respostas com "dados" quanto respostas na raiz.
  return dados.dados || dados;
}
