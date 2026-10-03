const API_URL = "http://127.0.0.1:8000/";

//listando
export async function listarEventos() {
  //teste
  console.log("Buscando:", new URL(API_URL, import.meta.url).href);

  const resposta = await fetch(API_URL+"eventos/");
  console.log(resposta)

  if (!resposta.ok) {
    throw new Error("Erro ao carregar os eventos");
  }
//convertendo o json em obj js e devolve os dados
  return await resposta.json();
}

//listar eventos por região

//função de buscar um unico id (consertada)
export async function getEventoById(id) {
  const eventos = await listarEventos();

  return eventos.find((e) => e.id === Number(id));
}

//função que vai retornar apenas eventos daquela região
export async function getEventosPorRegiao(regiaoNome) {
  const resposta = await fetch(
    API_URL + "eventos/regiao/" + encodeURIComponent(regiaoNome)
  );

  console.log(resposta);

  if (!resposta.ok) {
    throw new Error("Erro ao carregar os eventos por região");
  }

  return await resposta.json();
}

export async function getEventoPesquisaRegiao(regiao){
  const reposta = await fetch(API_URL+"eventos/regiao/"+regiaoId);

  console.log(reposta)

  if (!reposta.ok) {
    throw new Error("Erro ao carregar os eventos por região");
  }

  return await reposta.json();
}
