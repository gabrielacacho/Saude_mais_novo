# CONTRATO_API.md - Saúde Aqui

> Documento produzido exclusivamente por análise do repositório Frontend.
> Nenhum backend Python/FastAPI está presente neste repositório. Os métodos e URLs abaixo foram
> inferidos das chamadas existentes no JavaScript. Por isso, rotas referenciadas não têm aqui uma
> garantia de funcionamento do servidor.

## 1. Visão geral da API

O projeto é uma aplicação web estática com navegação entre páginas HTML e integração por `fetch` para
uma API em `http://127.0.0.1:8000`. Há também dados locais em `api/*.json` e dados fictícios em
`js/mock-data.js`.

Domínios observados:

- usuários comuns e institucionais;
- autenticação e recuperação de senha;
- eventos;
- inscrições em eventos;
- comentários e avaliações;
- instituições e unidades de saúde;
- regiões;
- notificações;
- fotos/anexos;
- dashboard administrativo.

Não foi identificado um projeto backend dentro deste repositório. Não é possível confirmar schemas,
middlewares, autenticação por token/cookie, regras de persistência ou respostas reais do servidor.

## 2. Padrões e convenções

### Convenções atuais

- URLs da API usam normalmente `http://127.0.0.1:8000`.
- Algumas respostas são envolvidas em `{ "dados": ... }` e outras são arrays/objetos diretos.
- A sessão é armazenada em `localStorage` na chave `usuarioLogado`.
- Senhas de cadastro e login são transformadas no navegador com SHA-256 antes do envio.
- Datas são enviadas pelo `<input datetime-local>` sem conversão explícita para ISO 8601.
- Identificadores são recebidos às vezes como número e às vezes como texto.
- Nomes misturam português e inglês e também snake_case/camelCase.
- Erros são esperados em `detail`, `mensagem`, `message` ou respostas de texto.

### Padronização proposta - não implementada

- Base URL configurável por variável de ambiente.
- Nomeação JSON em `camelCase`, mantendo a API antiga no levantamento.
- Datas e horas como string ISO 8601, por exemplo `2026-05-18T14:00:00-03:00`.
- Identificadores como `integer` para entidades persistidas, salvo decisão conjunta para UUID.
- Distinguir os conceitos `location`/`address` e `latitude`/`longitude`.
- Resposta única de sucesso:

```json
{
  "dados": {},
  "meta": {
    "pagina": 1,
    "tamanho": 20,
    "total": 100
  }
}
```

- Erro único:

```json
{
  "codigo": "VALIDATION_ERROR",
  "mensagem": "Descrição legível",
  "detalhes": [
    {
      "campo": "email",
      "mensagem": "E-mail inválido"
    }
  ]
}
```

- Paginação proposta em `?pagina=1&tamanho=20`.
- Códigos sugeridos: `200`, `201`, `204`, `400`, `401`, `403`, `404`, `409`, `422`, `500`.
- Não enviar hashes de senha de forma ambígua; definir autenticação segura e armazenar hashes no
  backend. O SHA-256 enviado pelo Frontend é, neste levantamento, um formato de implementação atual,
  não uma recomendação de contrato seguro.

## 3. Inventário das telas

| Tela | Arquivo | Finalidade | Estado geral |
|---|---|---|---|
| Página inicial | `index.html` / `js/pages/home.js` | Mapa, calendário, busca e cards de eventos | Parcialmente integrado |
| Login | `login.html` / `js/pages/login.js` | Autenticar usuário | Integrado no Frontend; backend não disponível no repositório |
| Cadastro | `cadastro.html` / `js/pages/cadastro.js` | Cadastro comum ou institucional | Integrado no Frontend; parcialmente confirmado |
| Como cadastrar evento | `como-cadastrar.html` / `js/pages/sobre.js` | Guia institucional | Estático, sem chamada de API |
| Detalhes do evento | `evento.html` / `js/pages/evento.js` | Exibir evento, inscrição e avaliações | Parcialmente integrado |
| Criar evento | `criar-evento.html` / `js/pages/criar-evento.js` | Publicar evento e foto opcional | Integração direta por `fetch`; validação parcial |
| Posto de saúde | `posto.html` / `js/pages/posto.js` | Exibir unidade e eventos da região | Pendente: módulo `services/posto-api.js` não existe |
| Perfil | `perfil.html` / `js/pages/perfil.js` | Dados da conta, inscrições, eventos gerenciados e administração | Parcialmente integrado |
| Dashboard administrativo | `admin-dashboard.html` / `js/pages/admin-dashboard.js` | Contar e filtrar instituições | Integrado ao serviço de unidades; fallback local |
| Solicitar redefinição | `redefinir-senha.html` / `js/pages/redefinir-senha.js` | Solicitar e-mail de recuperação | O script não contém chamada HTTP |
| Nova senha | `nova-senha.html` / `js/pages/nova-senha.js` | Receber token e definir nova senha | Existe integração conflitante com duas URLs |
| Sobre o projeto | `sobre.html` / `js/pages/sobre.js` | Apresentação e equipe | Estático |

Foram identificadas 12 telas HTML.

## 4. Inventário e levantamento de campos

Esta seção usa os nomes encontrados no código. A coluna **padronização** indica apenas uma
proposta.

### 4.1 Página inicial

| Informação / nome no código | Tela | Tipo | Obrigatório | Direção | Validação / situação |
|---|---|---|---|---|---|
| `mapa-busca-local` / `mapa-busca-local` | Início | string | Não | ambos | Valor sincronizado em memória; estado inicial `Urca` |
| `search-local` | Cabeçalho/Início | string | Não | ambos | Busca textual/local, sincronização por `sync-local.js` |
| `search-evento` | Cabeçalho/Início | string | Não | enviado ao filtro local | Busca por título no Frontend |
| `cal-mes` | Início | integer | Não | recebido/seleção | Valores de 0 a 11 |
| `cal-ano` | Início | integer | Não | recebido/seleção | Ano atual menos 1 até mais 5 |
| `regiao-nome` | Início | string | Não | ambos | Texto da região; estado inicial `Urca` |
| `filtro-regiao-header` | Cabeçalho/Início | string | Não | enviado ao filtro local | Opções estáticas de região |
| `filtro-categoria-local` | Filtros locais | string | Não | enviado ao filtro local | Categorias estáticas |
| `filtro-raio` | Filtros locais | string | Não | não enviado | Mock visual; PENDENTE DE DEFINIÇÃO |
| `filtro-categoria-header` | Filtros de evento | string | Não | enviado ao filtro local | Categorias estáticas |
| `filtro-data-header` | Filtros de evento | date | Não | enviado ao filtro local | Comparado com `e.data` |
| `id` do evento | Card/calendário/mapa | integer/string | Sim para detalhe | recebido/enviado na URL | Convenção efetiva inconsistente |
| `titulo` | Cards/calendário | string | Recebido | recebido | Exibido; não há validação no Frontend |
| `descricao` | Cards detalhes | string | Recebido | recebido | Exibido na página de evento |
| `categoria` | Cards/filtros | integer ou string | Recebido | recebido/enviado em filtro | Hoje aceita número, string ou objeto em trechos |
| `categoria_nome` | Dados estáticos | string | Não | recebido | Campo estático do JSON |
| `foto_capa` | Card/mapa/evento | string URL | Não | recebido | Pode ser vazia |
| `dataExibicao` | Cards/calendário | string data | Recebido | recebido | Formato `dd/mm/aaaa` no mock |
| `data_hora_evento` | Calendário | datetime ISO 8601 | Recebido | recebido | Usado para ano, mês e dia |
| `data_hora_fim` | Detalhe | datetime | Não | recebido | Exibido como fim |
| `localizacao` | Card/mapa | string | Não | recebido | Endereço/local textual |
| `endereco` | Dados de evento | string | Não | recebido | Alias potencial de `localizacao` |
| `regiao` | Filtro e posto | string | Não | recebido/enviado | Pode ser nome ou ID de região |
| `numero_participantes` / `inscricoes_atuais` | Cards/detalhe | integer | Não | recebido | Número atual de inscritos |
| `inscritos_count` / `usuario_ja_inscrito` | Detalhe | integer/boolean | Não | recebido | Fallback opcional |
| `capacidade_maxima` / `vagas_maximas` | Detalhe | integer | Recebido | recebido | Default visual `30` |
| `publico_alvo` | Dados do evento | string | Não | recebido | Exibido em alguns dados |
| `unidade_associada` / `unidade_referencia` | Detalhe | integer/string | Não | recebido | Alias sem contrato único |
| `criador_institucional` / `criado_por_id` | Gerenciamento | integer | Recebido para filtro | recebido | Usado para filtrar eventos gerenciados |
| `latitude` / `longitude` | Mapa estático | number | Não | não conectado à API | PENDENTE DE DEFINIÇÃO; hoje os pins são fixos no código |

### 4.2 Login

| Nome no código | Tipo | Obrigatório | Direção | Validação/situação |
|---|---|---|---|---|
| `email` | string | Sim | enviado/recebido | HTML `type=email`, obrigatório |
| `senha` | string | Sim | enviado | Mínimo 6; transformada por SHA-256 |
| `lembrar` / checkbox sem `name` | boolean | Não | nenhum | Nenhuma integração; não envia |
| `tipo` / `perfil` | string | Recebido | recebido | Normalizado para `comum`, `institucional`, `administrador` |
| `perfil=administrador` | query de URL | Não | enviado | Acesso administrativo exigido no Frontend |
| `usuarioLogado` | objeto localStorage | Ambos | local | Guarda resposta completa, e-mail e perfil normalizado |

### 4.3 Cadastro comum

| Nome no código | Tipo | Obrigatório | Direção | Validação/situação |
|---|---|---|---|---|
| `tipoUsuario` | string | Sim | enviado | `comum` ou `institucional` |
| `nome` | string | Sim | enviado | Nome com pelo menos duas partes e sem números |
| `cpf` | string | Sim | enviado | Exatamente 11 dígitos, máscara visual e dígitos verificadores |
| `data_nascimento` | date | Sim | enviado | Não pode ser futura |
| `email` | string | Sim | enviado | Formato válido por expressão regular |
| `telefone` | string | Sim | enviado | Máscara visual; 10 ou 11 dígitos |
| `regiao_preferida` | string | Não | enviado | Capturado no `FormData`, backend pode não possuir o campo |
| `senha` | string/hex | Sim | enviado | Mínimo 6, SHA-256 no navegador |
| `confirmarSenha` | string/hex | Sim | enviado | Deve coincidir; excluído do payload por `usuarios-api.js` |

### 4.4 Cadastro institucional

| Nome no código | Tipo | Obrigatório | Direção | Validação/situação |
|---|---|---|---|---|
| `razaoSocial` | string | Sim | enviado como `razao_social` | Não vazio |
| `nomeFantasia` | string | Sim | enviado como `nome` | Não vazio |
| `cnpj` | string | Sim | enviado | 14 dígitos e dígitos verificadores |
| `endereco` | string | Sim | enviado | Não vazio |
| `tipoInstituicao` | enum string | Sim | capturado | `ubs`, `clinica`, `hospital`, `ong`, `outro`; não é incluído no payload institucional atual |
| `site` | URL/string | Não | enviado | Sem validação além do tipo HTML `url` |
| `nomeResponsavel` | string | Sim | enviado como `nome_responsavel` | Nome completo |
| `cargoResponsavel` | string | Sim | enviado como `cargo_responsavel` | Não vazio |
| `emailResponsavel` | string | Sim | enviado como `email` | E-mail válido |
| `telefoneResponsavel` | string | Sim | enviado como `telefone` | 10 ou 11 dígitos |
| `atuacao` | string | Sim | enviado como `vinculo_instituicao` e `descricao` | Não vazio |
| `docCnpj` | arquivo | Sim | não enviado | Capturado apenas na validação; serviço não faz upload |
| `docResponsavel` | arquivo | Sim | não enviado | Capturado apenas na validação; serviço não faz upload |
| `docVinculo` | arquivo | Não | não enviado | Excluído pelo serviço atual |
| `senha` | string/hex | Sim | enviado | Mínimo 6 |
| `confirmarSenha` | string/hex | Sim | enviado | Deve coincidir; excluído do payload |
| `status` | enum string | Recebido | recebido | Sugestão atual: `pendente`, `ativa`, `bloqueada` |

### 4.5 Criar evento

| Nome no código | Tipo | Obrigatório | Direção | Validação/situação |
|---|---|---|---|---|
| `evt-nome` / `titulo` | string | Sim | enviado | Não vazio |
| `evt-descricao` / `descricao` | string | Sim | enviado | Não vazia |
| `evt-categoria` / `categoria` | enum/radio → integer | Sim | enviado | Valores 1 a 6 pelo mapa atual |
| `evt-data-inicio` / `data_hora_evento` | datetime-local | Sim | enviado | Término posterior ao início |
| `evt-data-fim` / `data_hora_fim` | datetime-local | Sim | enviado | Término posterior ao início |
| `evt-local` / `localizacao` | string | Sim | enviado | Não vazio |
| `evt-publico` / `publico_alvo` | string | Não no HTML | enviado | Default visual `Geral` |
| `evt-vagas` / `capacidade_maxima` | integer | Sim | enviado | HTML `min=1`, convertido por `parseInt` |
| `evt-anexo` / `arquivo` | arquivo(s), FormData | Não | enviado após criar | Apenas o primeiro arquivo é enviado |
| `foto_de_evento` | string/boolean | Não | enviado | Sempre texto `"true"` no multipart |
| `unidade_referencia` | string | Automático | enviado | Nome da instituição logada ou texto padrão |
| `criador_institucional` | integer | Automático | enviado | ID da sessão ou fallback `1` |
| `foto_evento` | integer | Automático | enviado | Sempre `1` |

### 4.6 Detalhes do evento

| Nome no código | Tipo | Obrigatório | Direção | Validação/situação |
|---|---|---|---|---|
| `id` | integer/string | Sim | recebido/URL | Padrão visual `1` se ausente |
| `foto_capa` | URL/string | Não | recebido | Renderizado no banner |
| `titulo` | string | Não | recebido | Título da página |
| `categoria` | integer/string | Não | recebido | Categoria ou texto |
| `descricao` | string | Não | recebido | Renderizado em `<p>` |
| `dataExibicao` | string | Não | recebido | O Frontend sobrescreve horários para 09:00 e 12:00 |
| `data_hora_evento` / `data_hora_fim` | datetime | Não | recebido | Não são usados diretamente na página |
| `localizacao` | string | Não | recebido | Texto e link Google Maps |
| `unidade` / `unidade_referencia` | string | Não | recebido | Default UBS/Clínica local |
| `instituicao` | string | Não | recebido | Default Secretaria Municipal de Saúde |
| `numero_participantes` / `inscritos_count` | integer | Não | recebido | Default `0` |
| `capacidade_maxima` / `vagas_maximas` | integer | Não | recebido | Default `30` |
| `usuario_ja_inscrito` | boolean | Não | recebido | Combinado com chave no `localStorage` |
| `usuario` | integer | Sim na inscrição | enviado | ID do usuário logado |
| `evento` | integer | Sim na inscrição | enviado | ID numérico do evento |
| `rating` | integer 1-5 | Sim na avaliação | enviado | Radio obrigatório no JavaScript |
| `comentario-texto` / `conteudo` | string | Sim na avaliação | enviado | Não vazio |
| `titulo` da avaliação | string | Implícito | enviado | Sempre `"Avaliação"` |
| `usuario` da avaliação | integer | Sim | enviado | ID do usuário |
| `evento` da avaliação | integer | Sim | enviado | ID do evento |
| `nota` | integer | Sim | enviado | Convertido de texto por `parseInt` |
| `nome_usuario` / `nome` | string | Recebido | recebido | Padrão `Usuário` |
| `data_hora_feito` / `data` | datetime/string | Recebido | recebido | Usado para ordenar e formatar |
| `texto` / `conteudo` | string | Recebido | recebido | Corpo do comentário |
| `filtro-avaliacoes` | enum string | Não | filtro local | `recentes`, `maior-nota`, `menor-nota` |

### 4.7 Posto de saúde

| Nome no código | Tipo | Obrigatório | Direção | Situação |
|---|---|---|---|---|
| `id` da URL | integer/string | Sim | enviado | Sem módulo de serviço implementado |
| `nome` | string | Recebido | recebido | Exibido no cabeçalho |
| `endereco` | string | Recebido | recebido | Exibido |
| `horario` | string | Recebido | recebido | Exibido |
| `descricao` | string | Recebido | recebido | Exibido |
| `servicos` | array<string> | Recebido | recebido | Renderizado como lista |
| `regiao` | string | Recebido | recebido | Usado para buscar eventos da região |
| `lat` / `lng` | number | Recebido no JSON | recebido | Não usados pelo `posto.js` atual |

### 4.8 Perfil

| Nome no código | Tipo | Obrigatório | Direção | Situação |
|---|---|---|---|---|
| `perfil` | enum string | Sim após login | recebido/local | `comum`, `institucional`, `administrador` |
| `email` | string | Recebido | recebido | Exibido |
| `telefone` / `telefoneResponsavel` | string | Não | recebido/enviado localmente | Editável apenas no `localStorage` |
| `regiaoPreferida` | string | Não | recebido/local | Exibida para usuário comum |
| `nome` / `nome_responsavel` / `razao_social` | string | Recebido | recebido | Prioridade dinâmica no nome |
| `cnpj` | string | Recebido | recebido | Exibido para instituições |
| `cargo_responsavel` | string | Recebido | recebido | Exibido |
| `endereco` | string | Recebido | recebido | Exibido |
| `site` | URL/string | Recebido | recebido | Exibido |
| `descricao` / `vinculo_instituicao` | string | Recebido | recebido | Exibido |
| `status` | enum string | Recebido | recebido | Default `Pendente` |
| `inscricoes` | array de IDs | Recebido | recebido | Consulta API de inscrições |
| `eventosGerenciados` | array de IDs | Recebido | recebido | Filtragem local alternativa não usada |
| `permissoes` | array<string> | Recebido | recebido | Exibido em perfil mock/recebido |
| `pesquisa-instituicao` | string | Não | filtro local | Atualmente não tem listener no código |
| `filtros` pendentes/ativas/bloqueadas | enum string | Não | filtro local | Implementação parcial |
| `confirmar-avaliacao` | boolean | Sim para aprovar | enviado via checkbox | Não enviado ao backend, apenas validação local |
| `motivo-indeferimento` | string | Sim para negar | não enviado | Capturado, mas não incluído na chamada PATCH |
| `input-foto-perfil` | arquivo imagem | Não | localStorage | Máximo 1 MB; JPG/PNG/WEBP |
| `editar-email` | string | Não | não enviado | Desabilitado |
| `editar-senha` | string | Não | não enviado | Desabilitado |

### 4.9 Dashboard administrativo

| Nome no código | Tipo | Obrigatório | Direção | Situação |
|---|---|---|---|---|
| `count-pending` | integer | Recebido calculado | recebido | Contagem de `pendente` |
| `count-active` | integer | Recebido calculado | recebido | Contagem de `ativo` |
| `count-blocked` | integer | Recebido calculado | recebido | Contagem de `bloqueado` |
| `id` da unidade | integer/string | Recebido | recebido | Renderizado |
| `nome` da unidade | string | Recebido | recebido | Renderizado |
| `endereco` da unidade | string | Recebido | recebido | Renderizado |
| `status` da unidade | enum string | Recebido | recebido | Normalizado em minúsculas |

### 4.10 Recuperação de senha

| Nome no código | Tipo | Obrigatório | Direção | Situação |
|---|---|---|---|---|
| `email` | string | Sim | enviado | HTML obrigatório |
| `token` | string | Sim | recebido/query | PENDENTE DE CONTRATO |
| `nova_senha` | string | Sim | enviado | Mínimo 6 |
| `confirmaSenha` | string | Sim | enviado localmente | Não deve ser enviado |

### 4.11 Cabeçalho e dados estáticos

| Nome no código | Tipo | Obrigatório | Direção | Situação |
|---|---|---|---|---|
| `notificacoes` | array | Recebido | recebido | Chamadas de serviço existem, mas o cabeçalho não as executa |
| `email` de notificação | string | Sim para consulta | enviado como query | Query `email=` |
| `id` da notificação | integer/string | Sim | URL | Endpoint de marcar como lida |
| `lida` | boolean | Recebido | recebido | PENDENTE DE NOME REAL |
| CATEGORIAS estáticas | array<string> | Não | local | Palestra, Vacinação, Consulta, Campanha, Mutirão, Exame |
| REGIÕES estáticas | array<{id,nome}> | Não | local | Urca, Santa Teresa, Copacabana, Tijuca |

Total observado no levantamento: **82 campos nominais ou ocorrências distintas**. Elementos visualmente
informativos sem origem determinada, como textos institucionais da tela Sobre, não são campos da API
e não foram contabilizados.

## 5. Dicionário resumido

| Campo atual | Tipo efetivo | Proposta | Observações |
|---|---|---|---|
| `id`, `id_usuario`, `usuario_id`, `usuario` | integer/string | `id` integer | Unificar |
| `nome`, `nome_responsavel`, `nomeFantasia` | string | `name`/`responsibleName` em camelCase | Separar entidade e responsável |
| `email`, `emailResponsavel` | string | `email` | Instituição também usa e-mail do responsável |
| `senha`, `nova_senha`, `novaSenha` | string | `password`/`newPassword` | Nunca trafegar confirmação |
| `cnpj`, `cpf` | string | `cnpj`, `cpf` | Preservar zeros iniciais |
| `data_nascimento` | date | `birthDate` | ISO 8601 `YYYY-MM-DD` |
| `data_hora_evento`, `data_hora_fim` | datetime | `startAt`, `endAt` | ISO 8601 |
| `dataExibicao`, `data` | string/date | `date` | Remover alias de apresentação |
| `categoria`, `categoria_nome` | integer/string | `categoryId`, `categoryName` | Preferir objeto ou ID definido |
| `foto_capa`, `foto_evento` | URL/integer | `coverPhotoId` ou `coverPhotoUrl` | Definir sem ambiguidade |
| `localizacao`, `endereco` | string | `address` | Separar endereço textual de coordenadas |
| `unidade_associada`, `unidade_referencia`, `unidade` | integer/string | `referenceUnitId` | O Frontend recebe tipos misturados |
| `criador_institucional`, `criado_por_id` | integer | `creatorInstitutionId` | Unificar |
| `capacidade_maxima`, `vagas_maximas` | integer | `maximumCapacity` | Unificar |
| `numero_participantes`, `inscricoes_atuais`, `inscritos_count` | integer | `participantCount` | Unificar |
| `nota`, `rating` | integer | `rating` | Faixa 1-5 a definir por contrato |
| `conteudo`, `texto` | string | `content` | Unificar |
| `status` | string | `status` | Definir enum em minúsculas |
| `lat`, `lng`, `latitude`, `longitude` | number | `latitude`, `longitude` | Coordenadas WGS84 |

## 6. Endpoints referenciados no Frontend

### Situação dos endpoints

Os nomes abaixo são chamados pelo Frontend. `Referenciado` significa que existe uma chamada no código;
não significa que o backend está implementado ou compatível.

### 6.1 Eventos

#### GET `/eventos/`
- Finalidade: listar eventos.
- Acesso: presumidamente público.
- Parâmetros: nenhum.
- Resposta esperada: array de eventos.
- Resposta real possível: PENDENTE DE CONFIRMAÇÃO.
- Integração: utilizada na home, calendário e perfil institucional.
- Status: referenciado/parcialmente integrado.

Exemplo baseado em campos observados:

```json
[
  {
    "id": "evt-1",
    "titulo": "Vem Zumbar 60+",
    "descricao": "Ação comunitária de atividade física",
    "categoria": 1,
    "data_hora_evento": "2026-05-18T14:00:00Z",
    "data_hora_fim": "2026-05-18T16:00:00Z",
    "localizacao": "Pérola Negra",
    "publico_alvo": "60+",
    "capacidade_maxima": 15,
    "numero_participantes": 10,
    "foto_capa": "https://example.invalid/capa.jpg"
  }
]
```

Erros esperados pelo Frontend: texto genérico ou `!response.ok`; não há formato garantido.

#### GET `/eventos/regiao/{regiao}`
- Finalidade: listar eventos por texto de região.
- Parâmetro de rota: `regiao`, string codificada.
- Quem pode acessar: presumidamente público.
- Status: referenciado.

Exemplo:

```text
GET /eventos/regiao/Urca
```

#### POST `/eventos/criar_evento/`
- Finalidade: criar evento.
- Acesso: usuário institucional, conforme regra pretendida.
- Corpo real observado:

```json
{
  "titulo": "Mutirão de Saúde",
  "descricao": "Exames e orientações",
  "categoria": 1,
  "data_hora_evento": "2026-05-18T14:00",
  "data_hora_fim": "2026-05-18T16:00",
  "localizacao": "UBS Centro",
  "unidade_referencia": "UBS Centro",
  "publico_alvo": "Geral",
  "capacidade_maxima": 150,
  "criador_institucional": 12,
  "foto_evento": 1
}
```

- Obrigatórios no Frontend: título, descrição, categoria, início, fim, localização e vagas.
- Validações: término posterior ao início; vagas convertidas para inteiro; categoria por mapa.
- Status: implementado no Frontend, backend não confirmado.
- Resposta esperada: objeto com `id` ou `id_evento`.

#### DELETE `/eventos/remover_evento/{id}`
- Finalidade: remover evento gerenciado.
- Parâmetro: `id`.
- Quem pode acessar: instituição criadora ou administrador, PENDENTE.
- Sucesso: `resposta.ok`.
- Erros: PENDENTE DE DEFINIÇÃO.
- Status: referenciado/parcial.

### 6.2 Inscrições

#### POST `/inscricao/inscrever`
- Corpo:

```json
{
  "evento": 1,
  "usuario": 12
}
```

- Resposta esperada: objeto não especificado.
- Erros: `detail` como string ou array de objetos com `msg`.
- Validações do Frontend: IDs numéricos; usuário logado; evento não loteado.
- Status: integrado no Frontend; backend não confirmado.

#### GET `/inscricao/{usuarioId}/`
- Finalidade: listar inscrições do usuário comum.
- Parâmetro: `usuarioId`.
- Resposta aceita: array com `evento_id`, `evento`, `id_evento` ou PENDENTE.
- Status: integrado com normalização parcial.

### 6.3 Comentários e avaliações

#### GET `/comentarios/evento/{idEvento}`
- Resposta aceita: array direto ou `{ "dados": [...] }`.
- Resposta de item esperada:

```json
{
  "nome_usuario": "Maria",
  "nota": 5,
  "conteudo": "Ótima ação.",
  "data_hora_feito": "2026-05-18T18:30:00Z"
}
```

- Status: integrado no Frontend.

#### POST `/comentarios/`

```json
{
  "usuario": 12,
  "evento": 1,
  "nota": 5,
  "titulo": "Avaliação",
  "conteudo": "Conteúdo da avaliação"
}
```

- Obrigatórios no Frontend: usuário, evento, nota 1-5 e texto.
- Erros: `detail` ou mensagem padrão.

### 6.4 Usuários e autenticação

#### POST `/usuarios/comum/criar_usuario/`
Corpo enviado pelo `FormData` após remover confirmação e documentos:

```json
{
  "nome": "Maria da Silva",
  "cpf": "12345678901",
  "data_nascimento": "1990-01-01",
  "email": "maria@example.com",
  "telefone": "21999999999",
  "regiao_preferida": "Urca",
  "senha": "hash_sha256_pendente"
}
```

Campos opcionais: `regiao_preferida`.
Status: Frontend integrado; backend não disponível.

#### POST `/usuarios/institucional/criar_usuario/`

```json
{
  "email": "contato@instituicao.com",
  "nome": "Nome Fantasia",
  "cnpj": "12345678000190",
  "vinculo_instituicao": "UBS",
  "razao_social": "Razão Social",
  "nome_responsavel": "Responsável",
  "cargo_responsavel": "Coordenador",
  "site": "https://example.com",
  "telefone": "21999999999",
  "descricao": "Atuação da instituição",
  "endereco": "Rua Exemplo, 10",
  "senha": "hash_sha256_pendente"
}
```

- `tipoInstituicao` é validado no Frontend, mas não é enviado pelo payload atual.
- Documentos não são enviados por este endpoint.
- Status: integração parcial.

#### POST `/usuarios/validar`

```json
{
  "email": "maria@example.com",
  "senha": "hash_sha256"
}
```

- Resposta aceita direta ou `{ "dados": objeto }`.
- Normalização em `tipo/perfil`.
- Erros esperados: `detail`, `mensagem` ou mensagem padrão.

#### GET `/usuarios/comum/`
- Lista usuários comuns usada para resolver o usuário real pelo e-mail.
- Status: referenciado/parcial.

#### GET `/usuarios/institucional/`
- Lista instituições.
- Usada no perfil administrativo.
- Resposta aceita array direto.
- Campos usados: `id`, `nome`, `razao_social`, `cnpj`, `data_criacao`/`data`, `status`.

#### GET `/usuarios/administrador/`
- Lista usuários administradores no perfil.
- Status: referenciado, não confirmado.

#### GET `/usuarios/institucional/{id}`
- Detalhe da instituição usado na ficha administrativa.
- Resposta esperada com `razao_social`, `nome`, `cnpj`, `endereco`, `tipo_instituicao`,
  `vinculo_instituicao`, `site`, `nome_responsavel`, `cargo_responsavel`, `email`, `telefone`,
  `descricao`.

#### PATCH `/usuarios/institucional/{id}/status?status={status}`
- Corpo: nenhum.
- `status=ativa` aprova.
- `status=bloqueada` nega/bloqueia.
- Não envia `motivo-indeferimento` nem confirmação.
- Status: chamado pelo Frontend; método e URL não confirmados como backend real.

#### POST `/usuarios/esqueci-senha`

```json
{
  "email": "maria@example.com"
}
```

- Implementado no serviço `usuarios-api.js`, mas não chamado pela página
  `redefinir-senha.html`.
- Status: integração parcial/funcionalidade desconectada.

#### POST `/usuarios/redefinir-senha`

```json
{
  "token": "PENDENTE DE DEFINIÇÃO",
  "nova_senha": "nova senha"
}
```

- Definido no serviço, mas não usado pelo script da tela.

### 6.5 Unidades de saúde

#### GET `/unidades-saude/`
- Finalidade: listar unidades.
- Acesso: PENDENTE.
- Resposta usada: array com `id`, `nome`, `endereco`, `status`.

#### GET `/unidades-saude/{id}`
- Finalidade: buscar unidade.

#### POST `/unidades-saude/`
- Finalidade: criar unidade.
- Corpo: PENDENTE DE DEFINIÇÃO.
- Status: serviço implementado no Frontend, sem uso conhecido em tela.

#### DELETE `/unidades-saude/{id}`
- Finalidade: remover unidade.
- Status: serviço implementado no Frontend, sem uso conhecido em tela.

### 6.6 Fotografia

#### POST `/fotografias/atualizar_fotografia/{eventoId}`
- Multipart form:
  - `arquivo`: primeiro arquivo selecionado;
  - `foto_de_evento`: `"true"`.
- Status: chamada opcional após criação; não é possível confirmar que o upload ocorre com sucesso.
- Respostas e limites: PENDENTE DE DEFINIÇÃO.

### 6.7 Notificações

#### GET `/notificacoes/?email={email}`
- Query: `email`.
- Resposta: PENDENTE DE DEFINIÇÃO.
- Status: serviço existente; cabeçalho não chama o serviço.

#### PATCH `/notificacoes/{id}/lida`
- Finalidade: marcar uma notificação como lida.
- Corpo: nenhum.
- Status: serviço existente, não conectado.

#### PATCH `/notificacoes/lidas?email={email}`
- Finalidade: marcar todas como lidas.
- Status: serviço existente, não conectado.

### 6.8 Região estática

#### GET `/api/regiao.json`
- Finalidade: listar regiões.
- Resposta real observada:

```json
[
  { "id": "urca", "nome": "Urca" },
  { "id": "santa-teresa", "nome": "Santa Teresa" }
]
```

- Status: implementado como arquivo estático, não como endpoint dinâmico.

### 6.9 Rotas quebradas ou incompletas

#### Módulo inexistente `../services/posto-api.js`
- Tela: posto de saúde.
- Importação em `js/pages/posto.js`.
- Arquivo não existe no repositório.
- `api/postos.json` existe, mas não há serviço que o leia.
- Consequência: a tela não pode carregar o posto sob o ambiente atual.
- Endpoint necessário: PENDENTE DE DEFINIÇÃO.

#### `/auth/redefinir-senha`
- Chamado diretamente por `js/pages/nova-senha.js`.
- Tem contrato diferente de `/usuarios/redefinir-senha`, usado em `usuarios-api.js`.
- O código envia `{ token, nova_senha }`, mas rejeita antes quando `token` não está presente.
- O texto do código diz que ausência de token é inválida, mas a URL esperada pela página não é tratada
  corretamente.
- Status: conflito de endpoint e fluxo incompleto.

## 7. Endpoints planejados das próximas fases

Todos os itens desta seção são planejados ou parcialmente representados na interface. Nenhum é
considerado implementado sem confirmação adicional.

| Funcionalidade | Método/URL sugeridos | Situação atual | Pendências |
|---|---|---|---|
| Criar evento com localização geográfica | PENDENTE | Interface não envia latitude/longitude | Definir campos, fonte do mapa e índice geográfico |
| Consultar eventos no mapa | PENDENTE | Pins fixos no HTML, sem dados da API | Definir formato da resposta e filtros |
| Filtro por localização | PENDENTE | Campo local sincronizado e filtro textual; raio é mock | Definir raio, unidade, busca por endereço/coordenadas |
| Filtro por tipo | PENDENTE | Categorias estáticas e filtros locais | Formalizar IDs/códigos de categoria |
| Upload de fotos | PENDENTE | Upload de anexos existe parcialmente ao criar evento | Definir tipos, limites, armazenamento e múltiplos arquivos |
| Consultar fotos | PENDENTE | Apenas URL `foto_capa` no evento | Definir endpoint, metadados e retorno |
| Atualizar foto do perfil | PENDENTE | Apenas `localStorage`, máximo 1 MB | Definir upload/autorização/armazenamento |
| Aprovação de instituição | `PATCH /usuarios/institucional/{id}/status?status=ativa` referenciado | Funciona apenas se backend aceitar | Definir método, motivo, auditoria e confirmação |
| Reprovação/indeferimento | PENDENTE | Motivo existe na tela, mas não é enviado | Definir endpoint/campos |
| Bloqueio de instituição | `PATCH /usuarios/institucional/{id}/status?status=bloqueada` referenciado | Funciona apenas se backend aceitar | Definir método, motivo e desbloqueio |
| Desbloqueio de instituição | PENDENTE | Não existe ação | Definir endpoint e permissões |
| Solicitação de recuperação | `/usuarios/esqueci-senha` referenciado | Serviço existe, página não chama | Confirmar URL e resposta |
| Redefinição de senha | `/usuarios/redefinir-senha` e `/auth/redefinir-senha` conflitantes | Token não flui corretamente | Definir uma única URL, expiracão e formato do token |
| Cancelamento de inscrição | PENDENTE | Não há botão ou endpoint | Definir método e regras |
| Edição de perfil no servidor | PENDENTE | Telefone/foto são locais | Definir payload e endpoint |
| Upload de documentos institucionais | PENDENTE | Campos existem e são validados | Definir endpoint multipart e tipos máximos |
| Aprovar instituição com confirmação | PENDENTE | Checkbox local | Confirmar se o backend recebe confirmação |

## 8. Exemplos consolidados

### Login

```http
POST /usuarios/validar
Content-Type: application/json

{
  "email": "maria@example.com",
  "senha": "hash_sha256"
}
```

```json
{
  "dados": {
    "id": 12,
    "nome": "Maria da Silva",
    "email": "maria@example.com",
    "tipo": "comum"
  }
}
```

### Criar evento

```http
POST /eventos/criar_evento/
Content-Type: application/json

{
  "titulo": "Vacinação Contra Gripe",
  "descricao": "Aplicação gratuita de vacina",
  "categoria": 4,
  "data_hora_evento": "2026-05-18T14:00:00",
  "data_hora_fim": "2026-05-18T16:00:00",
  "localizacao": "UBS Centro",
  "unidade_referencia": "UBS Centro",
  "publico_alvo": "Toda população",
  "capacidade_maxima": 200,
  "criador_institucional": 12,
  "foto_evento": 1
}
```

### Avaliar evento

```http
POST /comentarios/
Content-Type: application/json

{
  "usuario": 12,
  "evento": 1,
  "nota": 5,
  "titulo": "Avaliação",
  "conteudo": "Evento muito organizado."
}
```

## 9. Padronização de erros proposta

O Frontend atualmente apresenta respostas de texto genéricas, `detail`, `mensagem`, `message`,
array de erros Pydantic ou erro de texto puro. O contrato futuro deve evitar esse comportamento misto.

### Possíveis códigos

- `400 Bad Request`: corpo JSON inválido.
- `401 Unauthorized`: sessão/token inválido ou ausente.
- `403 Forbidden`: perfil sem acesso.
- `404 Not Found`: entidade não encontrada.
- `409 Conflict`: e-mail, CNPJ ou inscrição duplicados.
- `422 Unprocessable Entity`: validação de campos.
- `500 Internal Server Error`: falha não tratada.

Formato sugerido:

```json
{
  "codigo": "VALIDATION_ERROR",
  "mensagem": "Um ou mais campos são inválidos.",
  "detalhes": [
    {
      "campo": "email",
      "mensagem": "Informe um e-mail válido."
    }
  ]
}
```

## 10. Paginação proposta

Nenhuma tela implementa atualmente uma resposta paginada. Para listas futuras:

```text
GET /eventos/?pagina=1&tamanho=20
GET /usuarios/institucional/?pagina=1&tamanho=20&status=pendente
GET /comentarios/evento/1?pagina=1&tamanho=20
```

Resposta sugerida:

```json
{
  "dados": [],
  "meta": {
    "pagina": 1,
    "tamanho": 20,
    "total": 0,
    "totalPaginas": 0
  }
}
```

## 11. Matriz de integração Frontend x Backend

| Tela/funcionalidade | Frontend | Comunicação identificada | Situação |
|---|---|---|---|
| Home - eventos | Implementado | `GET /eventos/` | Parcial: backend não confirmado |
| Home - eventos por região | Implementado | `GET /eventos/regiao/{regiao}` | Parcial |
| Mapa - Leaflet | Implementado com dados fixos | Nenhuma | Estático |
| Calendário | Implementado | `GET /eventos/` | Parcial |
| Busca/filtros | Implementado localmente | Nenhum endpoint de busca | Simulação local |
| Login | Implementado | `POST /usuarios/validar` | Parcial |
| Cadastro comum | Implementado | `POST /usuarios/comum/criar_usuario/` | Parcial |
| Cadastro institucional | Implementado | `POST /usuarios/institucional/criar_usuario/` | Parcial; documentos não enviados |
| Detalhes do evento | Implementado | `GET /eventos/` | Parcial |
| Inscrição | Implementado | `POST /inscricao/inscrever` | Parcial |
| Avaliações | Implementado | GET/POST comentários | Parcial |
| Criar evento | Implementado | POST evento + POST foto opcional | Parcial |
| Gerenciar eventos | Implementado | GET eventos + DELETE evento | Parcial |
| Posto de saúde | Tenta integração | Importação inexistente + endpoint estático não conectado | Quebrado |
| Perfil comum | Implementado | GET usuários + GET inscrições | Parcial |
| Perfil institucional | Implementado | GET usuários/eventos | Parcial |
| Perfil administrador | Implementado | GET instituições | Parcial |
| Ficha institucional | Implementado | GET detalhe + PATCH status | Parcial |
| Foto do perfil | Implementado localmente | `localStorage` | Sem backend |
| Telefone do perfil | Implementado localmente | `localStorage` | Sem backend |
| E-mail/senha do perfil | Desabilitados | Nenhuma chamada | Futuro |
| Dashboard de unidades | Implementado | `/unidades-saude/` | Parcial; fallback fictício |
| Aprovar instituição | Implementado parcialmente | PATCH status | Sem motivo/ação completa |
| Negar instituição | Implementado parcialmente | PATCH status bloqueada | Motivo não enviado |
| Solicitar recuperação | Serviço pronto | `/usuarios/esqueci-senha` | Página não conectada |
| Redefinir senha | Implementado parcialmente | `/usuarios/redefinir-senha` ou `/auth/redefinir-senha` | Conflito |
| Notificações | Serviço pronto | 3 endpoints de notificações | Cabeçalho não integrado |
| Sobre/Como cadastrar | Estático | Nenhuma | Não aplicável |

## 12. Incompatibilidades identificadas

### Campos do Frontend ausentes ou não confirmados no backend

- `tipoInstituicao`;
- `docCnpj`, `docResponsavel`, `docVinculo`;
- `regiao_preferida`;
- `foto_evento`;
- `foto_capa`;
- `latitude`/`longitude`;
- `confirmar-avaliacao`;
- `motivo-indeferimento`;
- `foto` do perfil;
- `telefone` atualizado no perfil no backend.

### Campos do backend não utilizados pelo Frontend

- Os arquivos JSON possuem várias informações não usadas pelo código atual, como:
  `data_hora_criacao`, `data_hora_cancelamento`, `data_hora_ultima_atualizacao`,
  `comentarios`, `pagina_evento`, `endereco`, `inscricoes_atuais`, `status`,
  `criador_institucional` e `unidade_associada` em alguns contextos.
- Os JSON de postos possuem `lat`/`lng`, mas não há integração funcional.

### Diferenças de nomenclatura

- `data_hora_evento` vs `dataExibicao` vs `data`;
- `data_hora_fim` vs `dataFim`;
- `localizacao` vs `endereco`;
- `capacidade_maxima` vs `vagas_maximas`;
- `numero_participantes` vs `inscricoes_atuais` vs `inscritos_count`;
- `criador_institucional` vs `criado_por_id`;
- `unidade_associada` vs `unidade_referencia` vs `unidade`;
- `tipo`/`perfil`;
- `nomeUsuario` vs `nome_usuario`;
- `nova_senha` vs `novaSenha`;
- `lat`/`lng` vs `latitude`/`longitude`.

### Incompatibilidades de tipos

- `id` e IDs de eventos aparecem como número ou string.
- `categoria` aparece como número inteiro, nome textual ou objeto em campos diferentes.
- Datas aparecem como ISO 8601, `YYYY-MM-DD`, `dd/mm/aaaa` e sem hora.
- Status usa `pendente`, `ativa`, `bloqueada`, `ativo`, `bloqueado`, com singulars divergentes.
- Coordenadas existem em dados estáticos, mas não há contrato no Frontend.
- O retorno de comentários pode ser array direto ou objeto com `dados`.
- O retorno de login pode ser objeto direto ou objeto com `dados`.

### Chamadas sem correspondência adequada

- `redefinir-senha.html` não chama o serviço de recuperação.
- `js/pages/nova-senha.js` usa `/auth/redefinir-senha`, enquanto o serviço usa
  `/usuarios/redefinir-senha`.
- `js/pages/posto.js` importa `services/posto-api.js`, que não existe.
- Tela de perfil mostra "Recarregar" e usa serviços que podem retornar campos ou modelos diferentes.
- Cabeçalho possui serviços de notificações, mas não os executa.
- Lista de filtros de instituição no perfil não atualiza nenhum endpoint no backend.
- Botão de desbloqueio não existe.

### Dados simulados ou estáticos

- `js/mock-data.js`;
- `api/eventos.json`;
- `api/usuarios.json`;
- `api/postos.json`;
- `api/regiao.json`;
- pins Leaflet fixos em `home.js`;
- raio de busca com texto "(mock)";
- categorias em `mock-data.js`;
- regiões em `mock-data.js`;
- fallback de três instituições no dashboard;
- foto, telefone e inscrição no `localStorage`;
- avaliações fixas da página HTML não correspondem ao sistema dinâmico (nota geral 4.5/12 avaliações).

## 13. Endpoints existentes ou necessários: resumo quantitativo

### Contagem desta análise

- **Telas identificadas:** 12.
- **Campos nominais distintos/ocorrências documentadas:** 82.
- **Chamadas HTTP únicas referenciadas no Frontend:** 27.
- **Recurso estático adicional:** 1 (`/api/regiao.json`).
- **Endpoints planejados ou criados como pendências:** pelo menos 13 funcionalidades exigem contrato novo
  ou decisão, conforme seção 7.

As 27 chamadas foram contabilizadas como chamadas referenciadas, não como rotas validadas em backend:

1. `GET /eventos/`
2. `GET /eventos/regiao/{regiao}`
3. `POST /eventos/criar_evento/`
4. `DELETE /eventos/remover_evento/{id}`
5. `POST /fotografias/atualizar_fotografia/{eventoId}`
6. `GET /comentarios/evento/{idEvento}`
7. `POST /comentarios/`
8. `POST /inscricao/inscrever`
9. `GET /inscricao/{usuarioId}/`
10. `POST /usuarios/comum/criar_usuario/`
11. `POST /usuarios/institucional/criar_usuario/`
12. `POST /usuarios/validar`
13. `POST /usuarios/esqueci-senha`
14. `POST /usuarios/redefinir-senha`
15. `GET /usuarios/comum/`
16. `GET /usuarios/institucional/`
17. `GET /usuarios/institucional/{id}`
18. `GET /usuarios/administrador/`
19. `PATCH /usuarios/institucional/{id}/status`
20. `GET /unidades-saude/`
21. `GET /unidades-saude/{id}`
22. `POST /unidades-saude/`
23. `DELETE /unidades-saude/{id}`
24. `GET /notificacoes/`
25. `PATCH /notificacoes/{id}/lida`
26. `PATCH /notificacoes/lidas`
27. `POST /auth/redefinir-senha`

## 14. Pontos que precisam de decisão conjunta

1. Confirmar a existência e a implementação real de todas as 27 chamadas HTTP.
2. Definir a URL canônica de redefinição de senha.
3. Definir o formato seguro de senha e autenticação em sessão/token.
4. Definir e padronizar a resposta de login (`dados` ou objeto direto).
5. Escolher um único tipo de `id` para usuário, evento e instituição.
6. Definir o catálogo de categorias de evento e seus IDs.
7. Definir a entidade de unidade de saúde e a relação com evento/instituição.
8. Definir se `unidade_referencia` é ID ou nome.
9. Definir se `localizacao` é endereço, região ou ambos.
10. Definir latitude/longitude para eventos e filtros de proximidade.
11. Definir limites, formatos e armazenamento de fotos e documentos.
12. Definir fluxo completo de aprovação, reprovação, bloqueio e desbloqueio.
13. Definir o que deve ocorrer com o motivo da indeferência.
14. Confirmar se status plural/singular será padronizado em `pendente`, `ativo`, `bloqueado`.
15. Definir resposta de inscrições e cancelamento.
16. Definir resposta e formato das notificações.
17. Definir rota de posto ou uso exclusivo dos dados estáticos.
18. Definir endpoints de edição de perfil.
19. Definir regras de avaliação duplicada e atualização da nota do evento.
20. Definir timezone oficial para datas e horários.
21. Confirmar validade de CAPTCHA, confirmação por e-mail e regras de senha no backend.
22. Definir base URL e ambientes de desenvolvimento, homologação e produção.
23. Definir autenticação/authorization em todas as operações sensíveis.
24. Decidir se arquivos institucionais serão obrigatórios em todos os cadastros.

## 15. Revisão final

Checklist concluído nesta análise:

- [x] Todas as 12 telas HTML foram inventariadas.
- [x] Scripts associados foram seguidos por referências de módulos.
- [x] Todos os formulários HTML e campos gerados por JavaScript foram levantados.
- [x] Chamadas `fetch` do Frontend foram localizadas.
- [x] Dados estáticos e mocks foram separados das integrações.
- [x] Endpoints existentes/referenciados e pendências foram separados.
- [x] Divergências de nomes e formatos foram registradas.
- [x] Funcionalidades futuras não foram apresentadas como implementadas.
- [x] Não foram encontrados arquivos backend nesta raiz.
