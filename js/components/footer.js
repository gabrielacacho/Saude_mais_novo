export function renderFooter(container) {
    container.innerHTML = `
        <footer class="hub-footer">
            <div class="hub-container">
                
                <div class="hub-footer-grid">
                    
                    <div class="hub-footer-col">
                        <h3 class="hub-footer-title">INFORMAÇÕES</h3>
                        <ul class="hub-footer-links">
                            <li><a href="./sobre.html">Sobre o Projeto</a></li>
                            <li><a href="./sobre.html#equipe">Equipe</a></li>
                            <li><a href="#eventos-grid">Eventos</a></li>
                            <li><a href="mailto:prograd@unirio.br">Suporte</a></li>
                        </ul>
                    </div>

                    <div class="hub-footer-col">
                        <h3 class="hub-footer-title">CONTATOS</h3>
                        <div class="hub-footer-contact">
                            <p>(21) 3071-7013</p>
                            <p>(21) 3071-7014</p>
                            <p>✉️ prograd@unirio.br</p>
                            <p>📍 Av. Pasteur, 296 - Urca, Rio de Janeiro/RJ</p>
                            <div class="hub-footer-socials">
                            </div>
                        </div>
                    </div>

                    <div class="hub-footer-col hub-footer-logo-col" style="display: flex; flex-direction: column; gap: 2rem; align-items: flex-end;">
                        <div class="hub-footer-logo">
                            <img src="./imagem/Logo-PrefeituraSUS.png" alt="Prefeitura do Rio - Saúde">
                        </div>
                        
                        <div class="hub-footer-logo" style="margin-top: 1.5rem;">
                            <!-- Mude o nome do arquivo abaixo para o nome real da foto que você salvou -->
                            <img src="./imagem/Logotipo_Saúde_Aqui-removebg.png" alt="Logo Saúde Aqui" style="max-width: 150px; height: auto;">
                        </div>
                    </div>
    
                    </div>

                </div>

                <hr class="hub-footer-divider">

                <div class="hub-footer-bottom">
                    <p class="hub-footer-copy">
                        © 2026 Projeto PET-Saúde Digital. Todos os direitos reservados.
                    </p>
                    <div class="hub-footer-legal">
                        <a href="#">Termos de Uso</a>
                        <span>|</span>
                        <a href="#">Política de Privacidade</a>
                    </div>
                </div>

            </div>
        </footer>
    `;
}