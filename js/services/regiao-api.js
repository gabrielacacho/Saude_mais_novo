const API_URL = "/api/regiao.json";

export async function listarRegioes() {
  const resposta = await fetch(API_URL);

  if (!resposta.ok) {
    throw new Error("Erro ao carregar as regiões.");
  }

  return await resposta.json();
}
//Retorna uma região pelo id
export async function getRegiaoById(id) {
  const regioes = await listarRegioes();
  return regioes.find((r) => r.id === id) || regioes[0];
}