const API_URL = "/Sa-de-/api/eventos.json";

//listando
export async function listarEventos() {
  //teste
  console.log("Buscando:", new URL(API_URL, import.meta.url).href);


  const resposta = await fetch(API_URL);

  if (!resposta.ok) {
    throw new Error("Erro ao carregar os eventos");
  }
//cconvertendo o json em obj js e devolve os dados
  return await resposta.json();
}

//função de buscar um unico id
export async function getEventoById(id) {
  const eventos = await listarEventos();

  return eventos.find((e) => e.id === id);
}

//função que vai retornar apenas eventos daquela região
export async function getEventosPorRegiao(regiaoId) {
  const eventos = await listarEventos();

  return eventos.filter((e) => e.regiao === regiaoId);
}