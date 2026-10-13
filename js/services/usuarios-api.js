const BASE_URL = "http://127.0.0.1:8000";

export async function cadastrarUsuario(formData) {
  const perfil = formData.get('tipoUsuario') || 'comum';

  const url = perfil === 'comum'
    ? `${BASE_URL}/usuarios/comum/criar_usuario/`
    : `${BASE_URL}/usuarios/institucional/criar_usuario/`;

  const dadosObjeto = {};

  formData.forEach((value, key) => {
    if (key !== 'tipoUsuario' && key !== 'confirmarSenha' && !key.startsWith('doc')) {
      dadosObjeto[key] = value;
    }
  });

  let payload = dadosObjeto;
  if (perfil === 'institucional') {
    payload = {
      email: dadosObjeto.emailResponsavel || dadosObjeto.email,
      nome: dadosObjeto.nomeFantasia || dadosObjeto.razaoSocial,
      cnpj: dadosObjeto.cnpj,
      vinculo_instituicao: dadosObjeto.atuacao || 'Não informado',
      razao_social: dadosObjeto.razaoSocial,
      nome_responsavel: dadosObjeto.nomeResponsavel,
      cargo_responsavel: dadosObjeto.cargoResponsavel,
      site: dadosObjeto.site || null,
      telefone: dadosObjeto.telefoneResponsavel || null,
      descricao: dadosObjeto.atuacao || null,
      endereco: dadosObjeto.endereco || null,
      senha: dadosObjeto.senha
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    let mensagem = "Erro ao cadastrar no servidor.";

    try {
      const textoErro = await response.text();
      console.log("RESPOSTA BRUTA DO PYTHON:", textoErro); // <--- ISSO VAI MOSTRAR O ERRO REAL NO CONSOLE DO NAVEGADOR
      
      const erro = JSON.parse(textoErro);

      if (Array.isArray(erro.detail)) {
        mensagem = erro.detail
          .map(e => `${e.loc.join('->')}: ${e.msg}`)
          .join(' | ');
      } else {
        mensagem = erro.detail || erro.mensagem || erro.message || mensagem;
      }
    } catch (e) {}

    throw new Error(mensagem);
  }

  return {
    sucesso: true,
    dados: await response.json()
  };
}