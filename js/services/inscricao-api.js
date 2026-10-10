
const BASE_URL = 'http://127.0.0.1:8000';

export async function inscreverUsuario(idEvento, idUsuario) {
  const resposta = await fetch(`${BASE_URL}/inscricao/inscrever`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      evento: Number(idEvento),
      usuario: Number(idUsuario)
    })
  });

  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    let mensagem = 'Não foi possível realizar a inscrição.';

    if (Array.isArray(dados.detail)) {
      mensagem = dados.detail
        .map(erro => erro.msg)
        .join(' | ');
    } else if (typeof dados.detail === 'string') {
      mensagem = dados.detail;
    }

    throw new Error(mensagem);
  }

  return dados;
}