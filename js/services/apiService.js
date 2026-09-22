const API_URL = "http://127.0.0.1:8000";

// =====================================================
// EVENTOS
// =====================================================

// Listar todos os eventos
export async function listarEventos() {
  const resposta = await fetch(`${API_URL}/eventos/`);

  if (!resposta.ok) {
    throw new Error("Erro ao carregar os eventos.");
  }

  return await resposta.json();
}


// Buscar um evento pelo ID
export async function getEventoById(id) {
  const resposta = await fetch(`${API_URL}/eventos/${id}`);

  if (!resposta.ok) {
    throw new Error("Erro ao carregar o evento.");
  }

  return await resposta.json();
}


// Listar eventos por região
export async function getEventosPorRegiao(regiao) {
  const resposta = await fetch(`${API_URL}/eventos/regiao/${regiao}`);

  if (!resposta.ok) {
    throw new Error("Erro ao carregar os eventos por região.");
  }

  return await resposta.json();
}


// Criar evento
export async function criarEvento(dadosEvento) {
  const resposta = await fetch(`${API_URL}/eventos/criar_evento/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(dadosEvento)
  });

  if (!resposta.ok) {
    throw new Error("Erro ao criar o evento.");
  }

  return await resposta.json();
}


// Atualizar evento
export async function atualizarEvento(id, dadosEvento) {
  const resposta = await fetch(
    `${API_URL}/eventos/atualizar_evento/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dadosEvento)
    }
  );

  if (!resposta.ok) {
    throw new Error("Erro ao atualizar o evento.");
  }

  return await resposta.json();
}


// Remover evento
export async function removerEvento(id) {
  const resposta = await fetch(
    `${API_URL}/eventos/remover_evento/${id}`,
    {
      method: "DELETE"
    }
  );

  if (!resposta.ok) {
    throw new Error("Erro ao remover o evento.");
  }

  return await resposta.json();
}


// =====================================================
// USUÁRIOS COMUNS
// =====================================================

// Listar usuários comuns
export async function listarUsuarios() {
  const resposta = await fetch(`${API_URL}/usuarios/comum/`);

  if (!resposta.ok) {
    throw new Error("Erro ao carregar os usuários.");
  }

  return await resposta.json();
}


// Buscar usuário pelo ID
export async function getUsuarioById(id) {
  const resposta = await fetch(`${API_URL}/usuarios/comum/${id}`);

  if (!resposta.ok) {
    throw new Error("Erro ao carregar o usuário.");
  }

  return await resposta.json();
}


// Cadastrar usuário comum
export async function cadastrarUsuario(dadosUsuario) {
  const resposta = await fetch(
    `${API_URL}/usuarios/comum/criar_evento/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dadosUsuario)
    }
  );

  if (!resposta.ok) {
    let mensagem = "Não foi possível realizar o cadastro.";

    try {
      const erro = await resposta.json();

      mensagem =
        erro.mensagem ||
        erro.message ||
        mensagem;
    } catch {
      // Caso a API não retorne JSON
    }

    throw new Error(mensagem);
  }

  return await resposta.json();
}