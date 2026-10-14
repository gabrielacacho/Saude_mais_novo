import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { iconCalendar } from '../utils/icons.js';
import { getEventoById } from '../services/evento-api.js';

const BASE_URL = "http://127.0.0.1:8000";

function renderMiniEvento(ev) {
  return `
    <a href="evento.html?id=${ev.id}" class="perfil-mini-card">
      <strong>${ev.titulo}</strong>
      <span>${iconCalendar()} ${ev.dataExibicao}</span>
    </a>
  `;
}

async function init() {
  const authStorage = localStorage.getItem('usuarioLogado');

  if (!authStorage) {
    window.location.href = 'login.html';
    return;
  }

  let usuario = JSON.parse(authStorage);
  let perfilAtual = (usuario.perfil || usuario.tipo || 'comum').toLowerCase();

  // Normaliza o tipo de perfil
  if (perfilAtual.includes('institucional')) perfilAtual = 'institucional';
  else if (perfilAtual.includes('administrador') || perfilAtual.includes('admin')) perfilAtual = 'administrador';
  else perfilAtual = 'comum';

  // BUSCA OS DADOS REAIS NA API PELO E-MAIL LOGADO PARA EVITAR O BUG DO ID 1
  if (usuario.email) {
    try {
      let endpointListagem = `${BASE_URL}/usuarios/comum/`;
      if (perfilAtual === 'institucional') {
        endpointListagem = `${BASE_URL}/usuarios/institucional/`;
      } else if (perfilAtual === 'administrador') {
        endpointListagem = `${BASE_URL}/usuarios/administrador/`;
      }

      const res = await fetch(endpointListagem);
      if (res.ok) {
        const listaUsuarios = await res.json();
        // Encontra o usuário na lista que corresponde exatamente ao e-mail logado
        const usuarioReal = listaUsuarios.find(u => u.email === usuario.email);
        
        if (usuarioReal) {
          usuario = { ...usuario, ...usuarioReal, perfil: perfilAtual };
          localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
        }
      }
    } catch (err) {
      console.warn("Não foi possível buscar a lista completa, usando dados em cache.", err);
    }
  }

  renderHeader(document.getElementById('header-root'), { showSearch: false, activePage: 'perfil' });
  renderFooter(document.getElementById('footer-root'));

  // Define o nome de exibição correto priorizando os dados reais
  const nomeExibicao = usuario.nome_responsavel || usuario.nome || usuario.razao_social || 'Usuário Hub Saúde';
  document.title = `${nomeExibicao} — Hub Saúde`;
  
  const avatarEl = document.getElementById('perfil-avatar');
  if (avatarEl) avatarEl.textContent = nomeExibicao.charAt(0).toUpperCase();
  
  const tipoEl = document.getElementById('perfil-tipo');
  if (tipoEl) {
    const rotulosTipo = {
      comum: 'Usuário Comum',
      institucional: 'Usuário Institucional',
      administrador: 'Administrador'
    };
    tipoEl.textContent = rotulosTipo[perfilAtual] || perfilAtual.toUpperCase();
  }
  
  const nomeEl = document.getElementById('perfil-nome');
  if (nomeEl) nomeEl.textContent = nomeExibicao;

  // Montagem dinâmica das linhas baseada nos dados reais resgatados
  const dadosContainer = document.getElementById('perfil-dados-lista');
  let linhas = [];

  if (perfilAtual === 'institucional') {
    linhas = [
      ['E-mail', usuario.email],
      ['Razão Social', usuario.razao_social],
      ['Nome Fantasia / Instituição', usuario.nome],
      ['CNPJ', usuario.cnpj],
      ['Responsável', usuario.nome_responsavel],
      ['Cargo do Responsável', usuario.cargo_responsavel],
      ['Telefone', usuario.telefone || usuario.telefoneResponsavel],
      ['Endereço', usuario.endereco],
      ['Site', usuario.site],
      ['Atuação / Descrição', usuario.descricao || usuario.vinculo_instituicao],
      ['Status', usuario.status || 'Pendente']
    ];
  } else if (perfilAtual === 'administrador') {
    linhas = [
      ['E-mail', usuario.email],
      ['Nível de Acesso', 'Administrador Master'],
      ['Permissões', 'Gerenciamento global e moderação de instituições']
    ];
  } else {
    linhas = [
      ['E-mail', usuario.email],
      ['Telefone', usuario.telefone || 'Não informado'],
      ['Região Preferida', usuario.regiaoPreferida || 'Não informada']
    ];
  }

  if (dadosContainer) {
    dadosContainer.innerHTML = linhas
      .filter(([_, valor]) => valor !== null && valor !== undefined && valor !== '' && valor !== 'Não informado')
      .map(([dt, dd]) => `<div><dt>${dt}</dt><dd>${dd}</dd></div>`)
      .join('');
  }

// Controle de visibilidade das seções específicas
  const secaoInscricoes = document.getElementById('perfil-secao-inscricoes');
  const secaoGerenciados = document.getElementById('perfil-secao-gerenciados');
  const secaoAdmin = document.getElementById('perfil-secao-admin');
  const secaoAvaliador = document.getElementById('avaliador-instituicao');

  secaoInscricoes?.classList.add('is-hidden');
  secaoGerenciados?.classList.add('is-hidden');
  secaoAdmin?.classList.add('is-hidden');
  secaoAvaliador?.classList.add('is-hidden');

if (perfilAtual === 'comum') {
    secaoInscricoes?.classList.remove('is-hidden');
    const el = document.getElementById('perfil-inscricoes');
    if (el) {
      try {
        // Utiliza o endpoint correto fornecido pela API para listar inscrições do usuário
        const resInscricoes = await fetch(`${BASE_URL}/inscricao/${usuario.id}/`);
        if (resInscricoes.ok) {
          const listaInscricoes = await resInscricoes.json();
          
          if (listaInscricoes && listaInscricoes.length > 0) {
            // Cada item retornado pode trazer o evento associado (ou o ID do evento)
            // Vamos buscar os detalhes de cada evento inscrito para preencher o mini-card
            const eventosPromises = listaInscricoes.map(async (insc) => {
              const eventoId = insc.evento_id || insc.evento || insc.id_evento;
              if (eventoId) {
                return await getEventoById(eventoId);
              }
              return null;
            });

            const eventos = await Promise.all(eventosPromises);
            const eventosValidos = eventos.filter(Boolean);

            if (eventosValidos.length > 0) {
              el.innerHTML = eventosValidos.map(renderMiniEvento).join('');
            } else {
              el.innerHTML = '<p class="perfil-vazio">Você ainda não se inscreveu em nenhum evento.</p>';
            }
          } else {
            el.innerHTML = '<p class="perfil-vazio">Você ainda não se inscreveu em nenhum evento.</p>';
          }
        } else {
          el.innerHTML = '<p class="perfil-vazio">Você ainda não se inscreveu em nenhum evento.</p>';
        }
      } catch (err) {
        console.error("Erro ao carregar inscrições:", err);
        el.innerHTML = '<p class="perfil-vazio">Não foi possível carregar as inscrições.</p>';
      }
    }
  }

  // No bloco onde o perfil institucional é tratado em init() ou na função que carrega os gerenciados:
  if (perfilAtual === 'institucional') {
    secaoGerenciados?.classList.remove('is-hidden');
    const containerGerenciados = document.getElementById('perfil-gerenciados');
    
    if (containerGerenciados) {
      try {
        // Busca todos os eventos cadastrados na API
        const respostaEventos = await fetch(`${BASE_URL}/eventos/`);
        if (respostaEventos.ok) {
          const todosEventos = await respostaEventos.json();
          
          // Pega o ID do usuário institucional logado
          const authStorage = localStorage.getItem('usuarioLogado');
          let usuarioId = null;
          if (authStorage) {
            const usuario = JSON.parse(authStorage);
            usuarioId = usuario.id || usuario.id_usuario;
          }

          // Filtra apenas os eventos criados por esta instituição 
          // (Verifique se a propriedade na API se chama criador_institucional, criado_por_id ou similar)
          const meusEventos = todosEventos.filter(ev => 
            ev.criador_institucional === Number(usuarioId) || ev.criado_por_id === Number(usuarioId)
          );

          if (meusEventos.length > 0) {
            containerGerenciados.innerHTML = meusEventos.map(ev => {
              return `
                <div class="perfil-card-gerenciado" style="display: flex; align-items: center; justify-content: space-between; background: #fff; padding: 1rem; margin-bottom: 1rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <div>
                    <h4 style="margin: 0 0 0.25rem 0; color: #1e293b;">${ev.titulo}</h4>
                    <span style="font-size: 0.85rem; color: #64748b;">Início: ${ev.data_hora_evento || ev.dataInicio || 'Data não informada'}</span>
                  </div>
                  <div style="display: flex; gap: 0.5rem;">
                    <a href="evento.html?id=${ev.id}" class="hub-btn hub-btn--secondary" style="padding: 0.4rem 0.8rem; font-size: 0.85rem; text-decoration: none;">Ver</a>
                    <button type="button" class="hub-btn btn-excluir-evento" data-id="${ev.id}" style="padding: 0.4rem 0.8rem; font-size: 0.85rem; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">Excluir</button>
                  </div>
                </div>
              `;
            }).join('');

            // Adiciona o evento de clique para excluir o evento usando a API DELETE /eventos/remover_evento/{id}
            containerGerenciados.querySelectorAll('.btn-excluir-evento').forEach(btn => {
              btn.addEventListener('click', async (e) => {
                const eventoId = e.target.dataset.id;
                if (confirm('Tem certeza que deseja remover este evento?')) {
                  try {
                    const resDel = await fetch(`${BASE_URL}/eventos/remover_evento/${eventoId}`, {
                      method: 'DELETE'
                    });
                    if (resDel.ok) {
                      alert('Evento removido com sucesso!');
                      window.location.reload();
                    } else {
                      alert('Erro ao remover o evento.');
                    }
                  } catch (err) {
                    console.error("Erro ao excluir:", err);
                    alert('Erro de conexão ao excluir o evento.');
                  }
                }
              });
            });

          } else {
            containerGerenciados.innerHTML = '<p class="perfil-vazio">Você ainda não criou nenhum evento. Clique abaixo em "Criar Evento" para publicar o primeiro!</p>';
          }
        }
      } catch (err) {
        console.error("Erro ao carregar eventos gerenciados:", err);
        containerGerenciados.innerHTML = '<p class="perfil-vazio">Erro ao carregar seus eventos.</p>';
      }
    }
  }

  if (perfilAtual === 'administrador') {
    secaoAdmin?.classList.remove('is-hidden');
    secaoAvaliador?.classList.remove('is-hidden');
    await carregarInstituicoesAvaliador();
  }
}

document.addEventListener('DOMContentLoaded', init);

// Filtros e Modais do Administrador
document.addEventListener('DOMContentLoaded', () => {
  const modalFicha = document.getElementById('modal-ficha-instituicao');
  const fecharModalFicha = document.querySelector('.modal-ficha__fechar');
  const nomeInstituicao = document.getElementById('modal-nome-instituicao');

  function aplicarFiltroAvaliador(filtroTipo, botaoClicado) {
    const avaliador = document.getElementById('avaliador-instituicao');
    if (!avaliador) return;

    const tbody = avaliador.querySelector('#avaliador-instituicoes-lista');
    if (!tbody) return;

    const statusAlvo = filtroTipo === 'pendentes' ? 'pendente' : filtroTipo === 'ativas' ? 'ativa' : 'bloqueada';
    const linhas = tbody.querySelectorAll('tr[data-status]');
    const botoesFiltro = avaliador.querySelectorAll('.avaliador-filtro');

    let totalVisiveis = 0;

    linhas.forEach((linha) => {
      if (linha.dataset.status === statusAlvo) {
        linha.style.display = '';
        totalVisiveis++;
      } else {
        linha.style.display = 'none';
      }
    });

    botoesFiltro.forEach((b) => b.classList.remove('avaliador-filtro--ativo'));
    botaoClicado?.classList.add('avaliador-filtro--ativo');

    tbody.querySelector('.avaliador-mensagem-vazia')?.remove();

    if (totalVisiveis === 0) {
      const mensagens = {
        pendente: 'Nenhuma instituição pendente no momento.',
        ativa: 'Nenhuma instituição ativa no momento.',
        bloqueada: 'Nenhuma instituição bloqueada no momento.'
      };

      const trVazia = document.createElement('tr');
      trVazia.className = 'avaliador-mensagem-vazia';
      trVazia.innerHTML = `<td colspan="4" style="text-align: center; color: #64748b; padding: 1.5rem;">${mensagens[statusAlvo]}</td>`;
      tbody.appendChild(trVazia);
    }
  }

  document.addEventListener('click', async (evento) => {
    const botaoFiltro = evento.target.closest('.avaliador-filtro');
    if (botaoFiltro) {
      aplicarFiltroAvaliadorLocal(botaoFiltro.dataset.filtro, botaoFiltro);
    }

    const botaoVerFicha = evento.target.closest('.avaliador-ver-ficha');
    if (botaoVerFicha) {
      const linha = botaoVerFicha.closest('tr');
      const instituicaoId = linha?.dataset.id;
      
      if (instituicaoId && modalFicha) {
        try {
          // Busca os dados detalhados da instituição na API
          const res = await fetch(`${BASE_URL}/usuarios/institucional/${instituicaoId}`);
          if (res.ok) {
            const inst = await res.json();

            // Preenche os campos do modal com os dados reais
            document.getElementById('ficha-razao-social').textContent = inst.razao_social || '-';
            document.getElementById('ficha-nome-social').textContent = inst.nome || '-';
            document.getElementById('ficha-cnpj').textContent = inst.cnpj || '-';
            document.getElementById('ficha-endereco').textContent = inst.endereco || '-';
            document.getElementById('ficha-tipo').textContent = inst.tipo_instituicao || inst.vinculo_instituicao || '-';
            document.getElementById('ficha-site').textContent = inst.site || '-';

            document.getElementById('ficha-resp-nome').textContent = inst.nome_responsavel || '-';
            document.getElementById('ficha-resp-cargo').textContent = inst.cargo_responsavel || '-';
            document.getElementById('ficha-resp-email').textContent = inst.email || '-';
            document.getElementById('ficha-resp-telefone').textContent = inst.telefone || inst.telefoneResponsavel || '-';

            document.getElementById('ficha-descricao').textContent = inst.descricao || '-';

            // Guarda o ID atual no modal para uso nos botões de aprovar/negar
            modalFicha.dataset.instituicaoId = instituicaoId;

            if (nomeInstituicao) {
              nomeInstituicao.textContent = inst.nome || inst.razao_social || 'Ficha da Instituição';
            }

            modalFicha.classList.remove('is-hidden');
          }
        } catch (err) {
          console.error("Erro ao carregar detalhes da instituição:", err);
        }
      }
    }
  });

  fecharModalFicha?.addEventListener('click', () => modalFicha?.classList.add('is-hidden'));
  modalFicha?.addEventListener('click', (evento) => {
    if (evento.target === modalFicha) modalFicha.classList.add('is-hidden');
  });
});

async function carregarInstituicoesAvaliador() {
  const tbody = document.getElementById('avaliador-instituicoes-lista');
  if (!tbody) return;

  try {
    const res = await fetch(`${BASE_URL}/usuarios/institucional/`);
    if (res.ok) {
      const instituicoes = await res.json();
      
      if (instituicoes && instituicoes.length > 0) {
        tbody.innerHTML = instituicoes.map(inst => {
          const statusInst = (inst.status || 'pendente').toLowerCase();
          const dataReq = inst.data_criacao || inst.data || 'Recente';
          const nomeSocial = inst.nome || inst.razao_social || 'Instituição';
          const cnpjInst = inst.cnpj || 'Não informado';

          return `
            <tr data-status="${statusInst}" data-id="${inst.id}">
              <td>${nomeSocial}</td>
              <td>${cnpjInst}</td>
              <td>${dataReq}</td>
              <td><button type="button" class="avaliador-ver-ficha" data-id="${inst.id}">Ver ficha</button></td>
            </tr>
          `;
        }).join('');

        // Aplica o filtro padrão para mostrar apenas as "pendentes" inicialmente
        const botaoPendente = document.querySelector('.avaliador-filtro[data-filtro="pendentes"]');
        if (botaoPendente) {
          aplicarFiltroAvaliadorLocal('pendentes', botaoPendente);
        }
      } else {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #64748b; padding: 1.5rem;">Nenhuma instituição cadastrada.</td></tr>';
      }
    }
  } catch (err) {
    console.error("Erro ao carregar instituições no painel de admin:", err);
  }
}

// Função auxiliar de filtro local para o avaliador
function aplicarFiltroAvaliadorLocal(filtroTipo, botaoClicado) {
  const avaliador = document.getElementById('avaliador-instituicao');
  if (!avaliador) return;
  const tbody = avaliador.querySelector('#avaliador-instituicoes-lista');
  if (!tbody) return;

  const statusAlvo = filtroTipo === 'pendentes' ? 'pendente' : filtroTipo === 'ativas' ? 'ativa' : 'bloqueada';
  const linhas = tbody.querySelectorAll('tr[data-status]');
  const botoesFiltro = avaliador.querySelectorAll('.avaliador-filtro');
  let totalVisiveis = 0;

  linhas.forEach((linha) => {
    if (linha.dataset.status === statusAlvo) {
      linha.style.display = '';
      totalVisiveis++;
    } else {
      linha.style.display = 'none';
    }
  });

  botoesFiltro.forEach((b) => b.classList.remove('avaliador-filtro--ativo'));
  botaoClicado?.classList.add('avaliador-filtro--ativo');
}

// Ação de Aprovar Instituição
  const btnAprovar = document.querySelector('.ficha-btn--aprovar');
  btnAprovar?.addEventListener('click', async () => {
    const checkboxConfirmar = document.getElementById('confirmar-avaliacao');
    if (!checkboxConfirmar?.checked) {
      alert('Você precisa marcar a caixa de confirmação antes de aprovar.');
      return;
    }

    const instituicaoId = modalFicha?.dataset.instituicaoId;
    if (!instituicaoId) return;

    try {
      const res = await fetch(`${BASE_URL}/usuarios/institucional/${instituicaoId}/status?status=ativa`, {
        method: 'PATCH' // ou PUT, dependendo de como a rota de status foi estruturada no backend
      });

      if (res.ok || res.status === 200) {
        alert('Instituição aprovada com sucesso!');
        modalFicha.classList.add('is-hidden');
        window.location.reload(); // Recarrega para atualizar a tabela
      } else {
        alert('Erro ao aprovar a instituição.');
      }
    } catch (err) {
      console.error("Erro na requisição de aprovação:", err);
      alert('Erro de conexão ao tentar aprovar.');
    }
  });

  // Ação de Negar / Indeferir Instituição
  const btnNegar = document.querySelector('.ficha-btn--negar');
  btnNegar?.addEventListener('click', async () => {
    const motivo = document.getElementById('motivo-indeferimento')?.value;
    if (!motivo || motivo.trim() === '') {
      alert('Por favor, informe o motivo do indeferimento.');
      return;
    }

    const instituicaoId = modalFicha?.dataset.instituicaoId;
    if (!instituicaoId) return;

    try {
      const res = await fetch(`${BASE_URL}/usuarios/institucional/${instituicaoId}/status?status=bloqueada`, {
        method: 'PATCH'
      });

      if (res.ok || res.status === 200) {
        alert('Instituição negada/bloqueada com sucesso.');
        modalFicha.classList.add('is-hidden');
        window.location.reload(); // Recarrega para atualizar a tabela
      } else {
        alert('Erro ao negar a instituição.');
      }
    } catch (err) {
      console.error("Erro na requisição de negação:", err);
      alert('Erro de conexão ao tentar negar.');
    }
  });