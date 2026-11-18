export function renderFooter(container) {
    if (!container) return;

    container.innerHTML = `
        <footer class="hub-footer">
            <div class="hub-container">
                
                <div class="hub-footer-grid" style="display: grid; grid-template-columns: 1.5fr 1fr 1fr 1.2fr; gap: 2rem; align-items: start;">
                    
                    <!-- Coluna 1: Logo e Descrição -->
                    <div class="hub-footer-col hub-footer-brand-col">
                        <div class="hub-footer-logo" style="margin-bottom: 1rem;">
                            <img src="./imagem/Logotipo_Saúde_Aqui-removebg.png" alt="Logo Saúde Aqui" style="max-width: 160px; height: auto;">
                        </div>
                        <p style="font-size: 0.9rem; color: #FFFFFF; line-height: 1.5;">
                            Projeto desenvolvido em parceria entre a UNIRIO, a Secretaria Municipal de Saúde do Rio de Janeiro e o PET-Saúde Digital, promovendo inovação e integração no âmbito da saúde pública.
                        </p>
                    </div>

                    <!-- Coluna 2: Informações -->
                    <div class="hub-footer-col">
                        <h3 class="hub-footer-title" style="font-size: 0.95rem; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 1rem; color: #29B5E8;">INFORMAÇÕES</h3>
                        <ul class="hub-footer-links" style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem;">
                            <li><a href="./sobre.html" style="color: #FFFFFF; text-decoration: none;">Sobre o Projeto</a></li>
                            <li><a href="./sobre.html#equipe" style="color: #FFFFFF; text-decoration: none;">Equipe</a></li>
                            <li><a href="./noticias.html" style="color: #FFFFFF; text-decoration: none;">Notícias</a></li>
                            <li><a href="#eventos-grid" style="color: #FFFFFF; text-decoration: none;">Ações e eventos</a></li>
                            <li><a href="mailto:prograd@unirio.br" style="color: #FFFFFF; text-decoration: none;">Suporte</a></li>
                        </ul>
                    </div>

                    <!-- Coluna 3: Contatos -->
                    <div class="hub-footer-col">
                        <h3 class="hub-footer-title" style="font-size: 0.95rem; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 1rem; color: #29B5E8;">CONTATOS</h3>
                        <div class="hub-footer-contact" style="display: flex; flex-direction: column; gap: 0.5rem; color: #FFFFFF; font-size: 0.9rem;">
                            <p style="margin: 0;">📞 (21) 3071-7013</p>
                            <p style="margin: 0;">📞 (21) 3071-7014</p>
                            <p style="margin: 0;">✉️ prograd@unirio.br</p>
                            <p style="margin: 0;">📍 Av. Pasteur, 296 - Urca, Rio de Janeiro/RJ</p>
                            <div class="hub-footer-socials" style="display: flex; gap: 0.75rem; margin-top: 0.5rem;">
                            </div>
                        </div>
                    </div>

                    <!-- Coluna 4: Parceria / Logotipos institucionais -->
                    <div class="hub-footer-col">
                        <h3 class="hub-footer-title" style="font-size: 0.95rem; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 1rem; color: #29B5E8;">PARCERIA</h3>
                        <div class="hub-footer-logos-grid" style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: center;">
                            <img src="./imagem/Logo-PrefeituraSUS.png" alt="Prefeitura do Rio e SUS" style="max-height: 45px; width: auto;">
                            <span style="font-size: 0.8rem; font-weight: bold; color: #FFFFFF;">UNIRIO</span>
                        </div>
                        <div style="margin-top: 1rem;">
                            <p style="font-size: 0.75rem; font-weight: bold; color: #FFFFFF; margin: 0;">PET-Saúde</p>
                            <p style="font-size: 0.65rem; color: #FFFFFF; margin: 0;">INFORMAÇÃO E SAÚDE DIGITAL</p>
                        </div>
                    </div>

                </div>

                <hr class="hub-footer-divider" style="border: none; border-top: 1px solid rgba(255,255,255,0.2); margin: 2rem 0 1.5rem 0;">

                <!-- Rodapé inferior -->
                <div class="hub-footer-bottom" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; font-size: 0.85rem; color: #FFFFFF;">
                    <p class="hub-footer-copy" style="margin: 0; color: #FFFFFF;">
                        © 2026 Projeto PET-Saúde Digital. Todos os direitos reservados.
                    </p>
                    <div class="hub-footer-legal" style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                        <a href="./termos.html" style="color: #FFFFFF; text-decoration: none;">Termos de Uso</a>
                        <a href="./privacidade.html" style="color: #FFFFFF; text-decoration: none;">Política de Privacidade</a>
                        <a href="./cookies.html" id="link-preferencias-cookies" style="color: #FFFFFF; text-decoration: none;">Preferências de cookies</a>
                    </div>
                </div>
                <div style="font-size: 0.75rem; color: #FFFFFF; opacity: 0.85; margin-top: 0.5rem;">
                    Imagens e marcas pertencem aos respectivos titulares e são exibidas no contexto institucional do projeto.
                </div>

            </div>
        </footer>
    `;

    renderCookieBanner();
}

function renderCookieBanner() {
    // Evita criar duplicado se a função rodar mais de uma vez
    if (document.getElementById('cookie-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.style.cssText = 'display: none; position: fixed; bottom: 0; left: 0; right: 0; background-color: #ffffff; border-top: 1px solid #e5e7eb; box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.12); padding: 1.25rem 1.5rem; z-index: 9999;';

    banner.innerHTML = `
        <div style="max-width: 1200px; margin: 0 auto; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1.25rem;">
            <div style="flex: 1; min-width: 280px; font-size: 0.9rem; color: #374151; line-height: 1.5;">
                Selecione <strong>"Aceitar"</strong> para concordar com o uso de cookies e tecnologias semelhantes pelo <strong>Saúde Aqui</strong> para melhorar sua experiência de navegação, segurança e desempenho. Selecione <a href="./cookies.html" style="color: #003B8E; text-decoration: underline; font-weight: 600;" Você pode ler mais em nossa 
                <a href="./privacidade.html" style="color: #003B8E; text-decoration: underline;">Política de Privacidade</a>.
            </div>

            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center;">
                <button type="button" id="btn-rejeitar-cookies" style="padding: 0.6rem 1.2rem; border-radius: 8px; border: 1px solid #d1d5db; background-color: #ffffff; color: #374151; font-weight: 600; font-size: 0.9rem; cursor: pointer;">
                    Rejeitar todos
                </button>
                <button type="button" id="btn-aceitar-cookies" style="padding: 0.6rem 1.4rem; border-radius: 8px; border: none; background-color: #003B8E; color: #ffffff; font-weight: 600; font-size: 0.9rem; cursor: pointer;">
                    Aceitar
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(banner);

    const btnAceitar = document.getElementById('btn-aceitar-cookies');
    const btnRejeitar = document.getElementById('btn-rejeitar-cookies');
    const linkPreferencias = document.getElementById('link-preferencias-cookies');

    // Exibe apenas se ainda não houver escolha salva no navegador
    const consentimento = localStorage.getItem('saudeAqui_cookieConsent');
    if (!consentimento) {
        banner.style.display = 'block';
    }

    btnAceitar?.addEventListener('click', () => {
        localStorage.setItem('saudeAqui_cookieConsent', JSON.stringify({
            status: 'accepted',
            essenciais: true,
            preferencias: true,
            data: new Date().toISOString()
        }));
        banner.style.display = 'none';
    });

    btnRejeitar?.addEventListener('click', () => {
        localStorage.setItem('saudeAqui_cookieConsent', JSON.stringify({
            status: 'rejected',
            essenciais: true,
            preferencias: false,
            data: new Date().toISOString()
        }));
        banner.style.display = 'none';
    });

// Ao clicar em "Preferências de cookies" no rodapé, apenas reabre o pop-up
    linkPreferencias?.addEventListener('click', (e) => {
        e.preventDefault();
        banner.style.display = 'block';
    });

}