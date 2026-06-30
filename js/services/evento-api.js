const API_URL = "/Sa-de-/api/eventos.json";

export async function listarEventos() {
  console.log("Buscando:", new URL(API_URL, import.meta.url).href);

  const resposta = await fetch(API_URL);

  if (!resposta.ok) {
    throw new Error("Erro ao carregar os eventos");
  }

  return await resposta.json();
}