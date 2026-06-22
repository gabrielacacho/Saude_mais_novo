/** Dados fictícios — sem integração com backend */

export const CATEGORIAS = [
  'Palestra',
  'Vacinação',
  'Consulta',
  'Campanha',
  'Mutirão',
  'Exame',
];

export const REGIOES = [
  { id: 'urca', nome: 'Urca' },
  { id: 'santa-teresa', nome: 'Santa Teresa' },
  { id: 'copacabana', nome: 'Copacabana' },
  { id: 'tijuca', nome: 'Tijuca' },
];

export const USUARIOS = {
  comum: {
    id: 'u1',
    nome: 'Maria Silva',
    tipo: 'Comum',
    avatarInicial: 'M',
    email: 'maria.silva@email.com',
    telefone: '(21) 98765-4321',
    bio: 'Participante ativa de campanhas de saúde e bem-estar na comunidade.',
    inscricoes: ['evt-1', 'evt-2'],
    regiaoPreferida: 'urca',
  },
  institucional: {
    id: 'u2',
    nome: 'UBS Centro',
    tipo: 'Institucional',
    avatarInicial: 'U',
    email: 'contato@ubscentro.saude.gov.br',
    telefone: '(21) 3456-7890',
    bio: 'Unidade Básica de Saúde responsável por eventos e mutirões na região central.',
    inscricoes: ['evt-3'],
    eventosGerenciados: ['evt-3', 'evt-2'],
    cnpj: '12.345.678/0001-90',
  },
  administrador: {
    id: 'u3',
    nome: 'Admin Sistema',
    tipo: 'Administrador',
    avatarInicial: 'A',
    email: 'admin@hubsaude.gov.br',
    telefone: '(21) 3000-0000',
    bio: 'Gestão da plataforma, moderação de eventos e relatórios da rede municipal.',
    inscricoes: [],
    permissoes: ['moderar_eventos', 'gerenciar_usuarios', 'exportar_relatorios'],
  },
};

export const EVENTOS = [
  {
    id: 'evt-1',
    titulo: 'Vem Zumbar 60+',
    descricao:
      'Quem disse que o ritmo tem idade? Está chegando o Vem Zumbar 60+, um evento pensado exclusivamente para quem quer celebrar a vida com movimento, música e muita alegria! A Zumba Gold é uma modalidade adaptada, focada no equilíbrio, na coordenação motora e, claro, no prazer de dançar. É a oportunidade perfeita para exercitar o corpo de forma leve, ao som de ritmos latinos e internacionais, em um ambiente totalmente festivo e seguro.',
    categoria: 'Campanha',
    data: '2026-05-18',
    dataExibicao: '18/05/2026',
    localizacao: 'Pérola Negra',
    regiao: 'urca',
    publico_alvo: '60+',
    numero_participantes: 10,
    capacidade_maxima: 15,
    foto_capa:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
  },
  {
    id: 'evt-2',
    titulo: 'Palestra: Hipertensão e Você',
    descricao:
      'Encontro educativo com cardiologista da rede municipal. Orientações sobre alimentação, medicação e hábitos saudáveis para idosos e familiares.',
    categoria: 'Palestra',
    data: '2026-05-03',
    dataExibicao: '03/05/2026',
    localizacao: 'UBS Santa Teresa',
    regiao: 'santa-teresa',
    publico_alvo: 'Adultos e idosos',
    numero_participantes: 42,
    capacidade_maxima: 50,
    foto_capa:
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
  },
  {
    id: 'evt-3',
    titulo: 'Dia D da Vacinação Influenza',
    descricao:
      'Mutirão de vacinação contra gripe. Traga documento com foto e cartão de vacinas. Prioridade para grupos de risco.',
    categoria: 'Vacinação',
    data: '2026-05-10',
    dataExibicao: '10/05/2026',
    localizacao: 'Posto Saúde Copacabana',
    regiao: 'copacabana',
    publico_alvo: 'Toda população',
    numero_participantes: 120,
    capacidade_maxima: 200,
    foto_capa:
      'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&q=80',
  },
  {
    id: 'evt-4',
    titulo: 'Consulta Odontológica Gratuita',
    descricao:
      'Atendimento odontológico preventivo e orientação de higiene bucal. Agendamento por ordem de chegada até esgotar vagas.',
    categoria: 'Consulta',
    data: '2026-05-22',
    dataExibicao: '22/05/2026',
    localizacao: 'Clínica da Família Tijuca',
    regiao: 'tijuca',
    publico_alvo: 'Crianças e adultos',
    numero_participantes: 8,
    capacidade_maxima: 20,
    foto_capa:
      'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80',
  },
  {
    id: 'evt-5',
    titulo: 'Mutirão de Prevenção ao Câncer',
    descricao:
      'Rastreamento orientado e encaminhamentos. Equipe multiprofissional presente para esclarecimentos e cadastro no programa municipal.',
    categoria: 'Mutirão',
    data: '2026-05-17',
    dataExibicao: '17/05/2026',
    localizacao: 'Centro de Saúde Urca',
    regiao: 'urca',
    publico_alvo: '40+',
    numero_participantes: 35,
    capacidade_maxima: 60,
    foto_capa:
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80',
  },
  {
    id: 'evt-6',
    titulo: 'Exame de Glicemia e Pressão',
    descricao:
      'Triagem rápida com enfermagem. Resultados na hora com orientação nutricional básica para valores alterados.',
    categoria: 'Exame',
    data: '2026-05-25',
    dataExibicao: '25/05/2026',
    localizacao: 'UBS Praia Vermelha',
    regiao: 'urca',
    publico_alvo: 'Adultos',
    numero_participantes: 18,
    capacidade_maxima: 30,
    foto_capa:
      'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&q=80',
  },
];

export const POSTOS_SAUDE = [
  {
    id: 'p1',
    nome: 'UBS Santa Teresa',
    lat: -22.915,
    lng: -43.185,
    regiao: 'santa-teresa',
    endereco: 'R. Alm. Alexandrino, 500 — Santa Teresa',
    horario: 'Seg a Sex, 8h às 17h',
    descricao: 'Atendimento clínico, vacinação e orientação em saúde para a comunidade de Santa Teresa.',
    servicos: ['Consultas', 'Vacinação', 'Palestras'],
  },
  {
    id: 'p2',
    nome: 'Posto Copacabana',
    lat: -22.971,
    lng: -43.182,
    regiao: 'copacabana',
    endereco: 'Av. Nossa Sra. de Copacabana, 1200',
    horario: 'Seg a Sáb, 7h às 19h',
    descricao: 'Posto de referência para campanhas de imunização e triagem rápida.',
    servicos: ['Vacinação', 'Exames', 'Mutirões'],
  },
  {
    id: 'p3',
    nome: 'Centro de Saúde Urca',
    lat: -22.949,
    lng: -43.163,
    regiao: 'urca',
    endereco: 'R. Monsenhor Pena, 45 — Urca',
    horario: 'Seg a Sex, 8h às 18h',
    descricao: 'Centro com foco em prevenção, campanhas para 60+ e atividades comunitárias.',
    servicos: ['Campanhas', 'Consultas', 'Exames'],
  },
];

/** Pins do mapa mock — posição via classe CSS (sem inline) */
export const PINS_MAPA = [
  { tipo: 'posto', refId: 'p1', pos: 1 },
  { tipo: 'posto', refId: 'p3', pos: 2 },
  { tipo: 'evento', refId: 'evt-1', pos: 3 },
  { tipo: 'evento', refId: 'evt-2', pos: 4 },
];

export function getEventoById(id) {
  return EVENTOS.find((e) => e.id === id);
}

export function getEventosPorRegiao(regiaoId) {
  return EVENTOS.filter((e) => e.regiao === regiaoId);
}

export function getRegiaoById(id) {
  return REGIOES.find((r) => r.id === id) || REGIOES[0];
}

export function getPostoById(id) {
  return POSTOS_SAUDE.find((p) => p.id === id);
}

export function getUsuarioPerfil(chave) {
  return USUARIOS[chave] || USUARIOS.comum;
}
