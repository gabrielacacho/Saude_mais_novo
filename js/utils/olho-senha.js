//to fazendo outro arquivo pra não ter raiva
//configura o comportamento global de mostrar/esconder senha usando a sua imagem do Icons8.
 
export function configurarOlhosSenha() {
  document.addEventListener('click', (evento) => {
    const botao = evento.target.closest('[data-toggle-password]');
    if (!botao) return;

    const idInput = botao.getAttribute('data-toggle-password');
    const input = document.getElementById(idInput);
    if (!input) return;

    const mostrar = input.type === 'password';
    input.type = mostrar ? 'text' : 'password';

    const iconeUrl = "https://img.icons8.com/?size=100&id=gVADjB59brID&format=png&color=000000";

    botao.innerHTML = `<img src="${iconeUrl}" alt="Ícone de olho" style="width: 20px; height: 20px; object-fit: contain; opacity: ${mostrar ? '1' : '0.6'};" />`;
    
    botao.setAttribute('aria-label', mostrar ? 'Ocultar senha' : 'Mostrar senha');
    botao.setAttribute('aria-pressed', String(mostrar));
  });
}