export async function criptografarSenha(senha) {
  // Converte a senha para bytes
  const encoder = new TextEncoder();
  const dados = encoder.encode(senha);

  // Gera o hash SHA-256 de forma nativa no navegador
  const hashBuffer = await crypto.subtle.digest('SHA-256', dados);

  // Converte o buffer resultante em uma string hexadecimal
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}