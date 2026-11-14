const API_URL = "http://127.0.0.1:8000/";

// Lista todos os eventos.
export async function listarEventos() {
  const resposta = await fetch(API_URL + "eventos/");

  if (!resposta.ok) {
    throw new Error("Erro ao carregar os eventos");
  }

  return await resposta.json();
}

// Busca um evento pelo ID.
export async function getEventoById(id) {
  const eventos = await listarEventos();
  return eventos.find((e) => e.id === Number(id));
}

// Lista eventos de uma região.
export async function getEventosPorRegiao(regiaoNome) {
  const resposta = await fetch(
    API_URL + "eventos/regiao/" + encodeURIComponent(regiaoNome)
  );

  if (!resposta.ok) {
    throw new Error("Erro ao carregar os eventos por região");
  }

  return await resposta.json();
}

export async function getEventoPesquisaRegiao(regiao) {
  const resposta = await fetch(
    API_URL + "eventos/regiao/" + encodeURIComponent(regiao)
  );

  if (!resposta.ok) {
    throw new Error("Erro ao carregar os eventos por região");
  }

  return await resposta.json();
}

// ==================================================
// COMENTÁRIOS E AVALIAÇÕES
// ==================================================

export async function listarComentarios(idEvento) {
  const resposta = await fetch(
    API_URL + "comentarios/evento/" + encodeURIComponent(idEvento)
  );

  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => ({}));
    throw new Error(
      erro.detail || "Não foi possível carregar as avaliações."
    );
  }

  const dados = await resposta.json();
  return dados.dados || dados;
}

export async function criarComentario(dados) {
  const resposta = await fetch(API_URL + "comentarios/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(dados)
  });

  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => ({}));
    throw new Error(
      erro.detail || "Não foi possível publicar sua avaliação."
    );
  }

  return await resposta.json();
}

export async function getUsuarioComumById(idUsuario) {
  const resposta = await fetch(
    API_URL + "usuarios/comum/" + encodeURIComponent(idUsuario)
  );

  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => ({}));
    throw new Error(
      erro.detail || "Não foi possível identificar seu usuário."
    );
  }

  return await resposta.json();
}