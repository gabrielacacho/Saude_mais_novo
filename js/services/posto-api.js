const API_URL = "/api/postos.json";

export async function listarPostos() {
  const resposta = await fetch(API_URL);

  if (!resposta.ok) {
    throw new Error("Erro ao carregar os postos.");
  }

  return await resposta.json();
}

export async function getPostoById(id) {
  const postos = await listarPostos();
  return postos.find((posto) => posto.id === id);
}