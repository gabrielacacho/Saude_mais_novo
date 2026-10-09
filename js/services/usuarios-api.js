const BASE_URL = "http://127.0.0.1:8000";

export async function cadastrarUsuario(formData) {
  const perfil = formData.get('tipoUsuario') || 'comum';
  
  // Transforma o FormData em um Objeto JavaScript padrão (JSON)
  const dadosObjeto = {};
  formData.forEach((value, key) => {
    // Ignora campos de controle internos que o backend não conhece
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
      'Content-Type': 'application/json' // Avisa o FastAPI que estamos mandando um JSON
    },
    body: JSON.stringify(dadosObjeto) // Envia como string JSON
  });
  
  if (!response.ok) {
    let mensagem = "Erro ao cadastrar no servidor.";
    try { 
      const erro = await response.json(); 
      if (Array.isArray(erro.detail)) {
        mensagem = erro.detail.map(e => `${e.loc.join('->')}: ${e.msg}`).join(' | ');
      } else {
        mensagem = erro.detail || erro.mensagem || erro.message || mensagem;
      }
    } catch(e) {}
    throw new Error(mensagem);
  }
  
  return { sucesso: true, dados: await response.json() };
}

export async function validarLogin(email, senha) {
  const resposta = await fetch(`${BASE_URL}/usuarios/validar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, senha })
  });

  if (!resposta.ok) {
    let mensagem = "E-mail ou senha incorretos.";
    try {
      const erro = await resposta.json();
      mensagem = erro.detail || erro.mensagem || mensagem;
    } catch(e) {}
    throw new Error(mensagem);
  }

  return await resposta.json();
}