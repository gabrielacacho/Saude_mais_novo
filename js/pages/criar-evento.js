// Aqui estão importadas as dependências necessárias da nova página, thais
import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';

function init() {
  // Injeta os layouts globais (Header/Footer) garantindo a identidade visual
  renderHeader(document.getElementById('header-root'), { showSearch: false, activePage: 'perfil' });
  renderFooter(document.getElementById('footer-root'));

  console.log('Layouts globais (Header/Footer) injetados com sucesso!');

  // --- DAQUI PARA BAIXO ENTRA A NOSSA LÓGICA DO FORMULÁRIO ---
  const form = document.querySelector('.hub-form');

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault(); // Impede a página de recarregar

      // 1. CAPTURA DOS DADOS DO FORMULÁRIO
      const nome = document.getElementById('evt-nome').value.trim();
      const descricao = document.getElementById('evt-descricao').value.trim();
      const local = document.getElementById('evt-local').value.trim();
      const publico = document.getElementById('evt-publico').value.trim();
      const vagas = document.getElementById('evt-vagas').value;
      const dataInicio = document.getElementById('evt-data-inicio').value;
      const dataFim = document.getElementById('evt-data-fim').value;

      // Captura a categoria selecionada nos botões de rádio
      const categoriaSelecionada = document.querySelector('input[name="evt-categoria"]:checked');
      const categoria = categoriaSelecionada ? categoriaSelecionada.value : '';

      // 2. VALIDAÇÕES DE CAMPOS OBRIGATÓRIOS
      if (!nome || !descricao || !local || !dataInicio || !dataFim || !vagas) {
        alert('Por favor, preencha todos os campos obrigatórios do formulário.');
        return;
      }

      // 3. VALIDAÇÃO DE REGRA DE NEGÓCIO (Datas)
      const dataInicioObj = new Date(dataInicio);
      const dataFimObj = new Date(dataFim);

      if (dataFimObj <= dataInicioObj) {
        alert('Erro na validação: A data de término não pode ser menor ou igual à data de início do evento.');
        return;
      }

      // 4. ESTRUTURAÇÃO DO OBJETO PARA A API REAL
      const novoEvento = {
        titulo: nome,
        descricao: descricao,
        categoria: categoria,
        dataInicio: dataInicio,
        dataFim: dataFim,
        localizacao: local,
        publicoAlvo: publico || 'Geral',
        vagasMaximas: parseInt(vagas, 10),
        status: 'EM_ANALISE',
        dataCriacao: new Date().toISOString()
      };

      // Exibe no console para conferência do grupo e futura integração
      console.log('Objeto estruturado pronto para envio à API:', novoEvento);
      
      alert('Evento submetido com sucesso! Ele foi enviado para a fila de avaliação.');
      
      // Retorna o usuário ao perfil de forma nativa
      window.location.href = 'perfil.html';
    });
  }
}

document.addEventListener('DOMContentLoaded', init);