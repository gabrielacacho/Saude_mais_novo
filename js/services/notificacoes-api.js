const BASE_URL = "http://127.0.0.1:8000";

// Busca as notificações do usuário.
export async function buscarNotificacoes(email) {
const url = `${BASE_URL}/notificacoes/?email=${encodeURIComponent(email)}`;

const resposta = await fetch(url);

if (!resposta.ok) {
throw new Error("Não foi possível carregar as notificações.");
}

return await resposta.json();
}

// Marca uma notificação específica como lida.
export async function marcarNotificacaoComoLida(id) {
const resposta = await fetch(`${BASE_URL}/notificacoes/${id}/lida`, {
method: "PATCH"
});

if (!resposta.ok) {
throw new Error("Não foi possível marcar a notificação como lida.");
}

return await resposta.json();
}

// Marca todas as notificações do usuário como lidas.
export async function marcarTodasComoLidas(email) {
const url = `${BASE_URL}/notificacoes/lidas?email=${encodeURIComponent(email)}`;

const resposta = await fetch(url, {
method: "PATCH"
});

if (!resposta.ok) {
throw new Error("Não foi possível marcar as notificações como lidas.");
}

return await resposta.json();
}
