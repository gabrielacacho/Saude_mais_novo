/* const API_URL = "/api/usuarios.json";

export async function listarUsuarios() {
  const response = await fetch(API_URL);
  return await response.json();
}

export async function getUsuarioByPerfil(perfil) {
  const usuarios = await listarUsuarios();
  return usuarios[perfil];
}


   //CADASTRAR USUÁRIO
export async function cadastrarUsuario(formData) {

  const response = await fetch(API_URL, {
    method: 'POST',
    body: formData
  });


     //TRATAMENTO DE ERRO DA API
  if (!response.ok) {

    let mensagem =
      'Não foi possível realizar o cadastro.';

    try {

      const erro = await response.json();

      mensagem =
        erro.mensagem ||
        erro.message ||
        mensagem;

    } catch {
      // Caso a API não retorne JSON
    }

    throw new Error(mensagem);
  }

  return await response.json();
} */