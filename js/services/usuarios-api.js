const API_URL = "/api/usuarios.json";

export async function listarUsuarios() {
  const response = await fetch(API_URL);
  return await response.json();
}

export async function getUsuarioByPerfil(perfil) {
  const usuarios = await listarUsuarios();
  return usuarios[perfil];
}