const BASE_URL = "http://127.0.0.1:8000";

// Listar todas as unidades de saúde da API
export async function listarUnidades() {
  const resposta = await fetch(`${BASE_URL}/unidades-saude/`);

  if (!resposta.ok) {
    throw new Error("Erro ao carregar as unidades de saúde do servidor.");
  }

  return await resposta.json();
}

// Buscar uma unidade específica por ID
export async function getUnidadeById(id) {
  const resposta = await fetch(`${BASE_URL}/unidades-saude/${id}`);

  if (!resposta.ok) {
    throw new Error("Unidade de saúde não encontrada.");
  }

  return await resposta.json();
}

// Criar nova unidade
export async function criarUnidade(dadosUnidade) {
  const resposta = await fetch(`${BASE_URL}/unidades-saude/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dadosUnidade)
  });

  if (!resposta.ok) {
    throw new Error("Não foi possível cadastrar a unidade.");
  }

  return await resposta.json();
}

// Remover unidade
export async function deletarUnidade(id) {
  const resposta = await fetch(`${BASE_URL}/unidades-saude/${id}`, {
    method: 'DELETE'
  });

  if (!resposta.ok) {
    throw new Error("Erro ao remover a unidade.");
  }

  return true;
}