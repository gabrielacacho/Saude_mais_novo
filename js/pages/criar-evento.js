import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';

const BASE_URL = "http://127.0.0.1:8000";

function init() {
  renderHeader(document.getElementById('header-root'), { showSearch: false, activePage: 'perfil' });
  renderFooter(document.getElementById('footer-root'));

  console.log('Layouts globais (Header/Footer) injetados com sucesso!');

  const form = document.querySelector('.hub-form');

  if (form) {
    form.addEventListener('submit', async function (event) {
      event.preventDefault();

      // 1. CAPTURA DE TODOS OS CAMPOS DO FORMULÁRIO HTML
      const nome = document.getElementById('evt-nome').value.trim();
      const descricao = document.getElementById('evt-descricao').value.trim();
      const local = document.getElementById('evt-local').value.trim();
      const publico = document.getElementById('evt-publico').value.trim();
      const vagas = document.getElementById('evt-vagas').value;
      const dataInicio = document.getElementById('evt-data-inicio').value;
      const dataFim = document.getElementById('evt-data-fim').value;
      const inputFile = document.getElementById('evt-anexo');

      // 2. CAPTURA DA CATEGORIA E MAPEAMENTO PARA INTEIRO (Conforme exigido pelo FastAPI)
      const categoriaSelecionada = document.querySelector('input[name="evt-categoria"]:checked');
      const categoriaTexto = categoriaSelecionada ? categoriaSelecionada.value : 'Outro';
      
      // Mapeamento de string para ID numérico de categoria (ajuste caso os IDs na sua API sejam diferentes)
      const mapaCategorias = {
        'Mutirão': 1,
        'Exames': 2,
        'Palestra': 3,
        'Vacinação': 4,
        'Consulta': 5,
        'Outro': 6
      };
      const categoriaId = mapaCategorias[categoriaTexto] || 1;

      // 3. VALIDAÇÕES DE CAMPOS OBRIGATÓRIOS
      if (!nome || !descricao || !local || !dataInicio || !dataFim || !vagas) {
        alert('Por favor, preencha todos os campos obrigatórios do formulário.');
        return;
      }

      const dataInicioObj = new Date(dataInicio);
      const dataFimObj = new Date(dataFim);

      if (dataFimObj <= dataInicioObj) {
        alert('Erro na validação: A data de término não pode ser menor ou igual à data de início do evento.');
        return;
      }

      // Recupera os dados da instituição logada no localStorage para pegar o nome
      const authStorage = localStorage.getItem('usuarioLogado');
      let instituicaoId = null;
      let nomeInstituicaoLogada = "Secretaria / Instituição Local";
      
      if (authStorage) {
        try {
          const usuario = JSON.parse(authStorage);
          instituicaoId = usuario.id || usuario.id_usuario;
          nomeInstituicaoLogada = usuario.nome || usuario.razao_social || nomeInstituicaoLogada;
        } catch (e) {
          console.warn("Não foi possível ler os dados do usuário logado.");
        }
      }

      // ESTRUTURAÇÃO DO OBJETO PARA A API
      const novoEvento = {
        titulo: nome,
        descricao: descricao,
        categoria: categoriaId,
        data_hora_evento: dataInicio,
        data_hora_fim: dataFim,
        localizacao: local,                  // Endereço preenchido no formulário
        unidade_referencia: nomeInstituicaoLogada, // Usa o nome da instituição logada automaticamente
        publico_alvo: publico || 'Geral',
        capacidade_maxima: parseInt(vagas, 10),
        criador_institucional: instituicaoId ? Number(instituicaoId) : 1,
        foto_evento: 1
      };

      console.log('Enviando objeto completo para a API:', novoEvento);

      try {
        const resposta = await fetch(`${BASE_URL}/eventos/criar_evento/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(novoEvento)
        });

        if (resposta.ok) {
          const resultado = await resposta.json();
          alert('Evento publicado com sucesso!');
          
          const eventoCriadoId = resultado.id || resultado.id_evento;

          // Se houver arquivo de imagem anexado, faz o envio opcional logo em seguida
          if (inputFile && inputFile.files[0] && eventoCriadoId) {
            try {
              const formDataFoto = new FormData();
              formDataFoto.append('arquivo', inputFile.files[0]);
              formDataFoto.append('foto_de_evento', 'true');

              await fetch(`${BASE_URL}/fotografias/atualizar_fotografia/${eventoCriadoId}`, {
                method: 'POST',
                body: formDataFoto
              });
            } catch (errFoto) {
              console.warn("Falha ao enviar a foto anexa:", errFoto);
            }
          }

          // Redireciona para a página do evento recém-criado
          if (eventoCriadoId) {
            window.location.href = `evento.html?id=${eventoCriadoId}`;
          } else {
            window.location.href = 'perfil.html';
          }
        } else {
          const erroTexto = await resposta.text();
          console.error("Erro retornado pela API:", erroTexto);
          alert('Erro ao criar o evento. Verifique os dados e tente novamente.');
        }
      } catch (erro) {
        console.error("Erro de conexão:", erro);
        alert('Erro de conexão ao tentar enviar o evento para o servidor.');
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', init);