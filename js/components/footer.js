export function renderFooter(container) {
    container.innerHTML = `
        <footer class="hub-footer">
            <div class="hub-container">
                
                <!-- PARTE SUPERIOR: 3 COLUNAS -->
                <div class="hub-footer-grid">
                    
                    <!-- Coluna 1: INFORMAÇÕES -->
                    <div class="hub-footer-col">
                        <h3 class="hub-footer-title">INFORMAÇÕES</h3>
                        <ul class="hub-footer-links">
                            <li><a href="#">Sobre o Projeto</a></li>
                            <li><a href="#">Equipe</a></li>
                            <li><a href="#">Eventos</a></li>
                            <li><a href="#">Suporte</a></li>
                        </ul>
                    </div>

                    <!-- Coluna 2: CONTATOS -->
                    <div class="hub-footer-col">
                        <h3 class="hub-footer-title">CONTATOS</h3>
                        <div class="hub-footer-contact">
                            <p>(21) 3071-7013</p>
                            <p> (21) 3071-7014</p>
                            <p>✉️ prograd@unirio.br</p>
                            <p>📍 Av. Pasteur, 296 - Urca, Rio de Janeiro/RJ</p>
                            <div class="hub-footer-socials">
                                <span>Instagram</span>
                                <span>LinkedIn</span>
                                <span>Twitter</span>
                            </div>
                        </div>
                    </div>

                    <!-- Coluna 3: LOGO / PARCEIROS (Sua Imagem) -->
                    <div class="hub-footer-col hub-footer-logo-col">
                        <div class="hub-footer-logo">
                            <img src="./imagem/Logo-PrefeituraSUS.png" alt="Prefeitura do Rio - Saúde">
                        </div>
                    </div>

                </div>

                <!-- LINHA DIVISÓRIA -->
                <hr class="hub-footer-divider">

                <!-- PARTE INFERIOR: COPYRIGHT E TERMOS -->
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