import { 
  Client, 
  ServiceItem, 
  ServiceOrder, 
  Appointment, 
  DailyCashRegister, 
  InventoryItem, 
  WhatsAppTemplate, 
  WhatsAppApiConfig, 
  BusinessConfig 
} from '../types';

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'srv-1',
    nome: 'Lavagem Simples + Pretinho',
    descricao: 'Lavagem da lataria com shampoo neutro, aspiração interna rápida e aplicação de pretinho nos pneus.',
    categoria: 'lavagem',
    duracaoMinutos: 45,
    precos: { hatch: 50, sedan: 60, suv: 75, moto: 35, utilitario: 90 }
  },
  {
    id: 'srv-2',
    nome: 'Lavagem Detalhada Técnico-Estética',
    descricao: 'Limpeza profunda de caixa de roda, motor, pincelamento de emblemas, cera de carnaúba e condicionamento de plásticos.',
    categoria: 'lavagem',
    duracaoMinutos: 90,
    precos: { hatch: 110, sedan: 130, suv: 160, moto: 80, utilitario: 190 }
  },
  {
    id: 'srv-3',
    nome: 'Higienização Interna Completa + Ozonização',
    descricao: 'Extratora em bancos de tecido/couro, teto, cinto de segurança, eliminação de fungos e odores por ozônio.',
    categoria: 'higienizacao',
    duracaoMinutos: 180,
    precos: { hatch: 250, sedan: 280, suv: 340, moto: 0, utilitario: 390 }
  },
  {
    id: 'srv-4',
    nome: 'Polimento Comercial Monopasso',
    descricao: 'Remoção de micro riscos, intensificação de brilho e proteção selante sintético.',
    categoria: 'estetica',
    duracaoMinutos: 240,
    precos: { hatch: 380, sedan: 440, suv: 520, moto: 220, utilitario: 600 }
  },
  {
    id: 'srv-5',
    nome: 'Vitrificação de Pintura Ceramic Coating 9H',
    descricao: 'Proteção de pintura de alta durabilidade (até 3 anos), super hidrofobia e brilho espelhado.',
    categoria: 'protecao',
    duracaoMinutos: 360,
    precos: { hatch: 850, sedan: 980, suv: 1200, moto: 550, utilitario: 1400 }
  },
  {
    id: 'srv-6',
    nome: 'Limpeza e Hidratação de Couro',
    descricao: 'Remoção de sujeira encrostada e aplicação de hidratante fosco com proteção UV.',
    categoria: 'estetica',
    duracaoMinutos: 60,
    precos: { hatch: 120, sedan: 140, suv: 170, moto: 0, utilitario: 190 }
  },
  {
    id: 'srv-7',
    nome: 'Cristalização de Parabrisa & Vidros',
    descricao: 'Repelência de água da chuva para máxima visibilidade e segurança.',
    categoria: 'protecao',
    duracaoMinutos: 40,
    precos: { hatch: 70, sedan: 80, suv: 95, moto: 0, utilitario: 110 }
  }
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-1',
    nome: 'Marcos Oliveira',
    whatsapp: '5541998887766',
    email: 'marcos.oliveira@email.com',
    cpfCnpj: '123.456.789-00',
    dataCadastro: '2026-07-20',
    observacoes: 'Cliente VIP, prefere atendimento pela manhã.',
    veiculos: [
      {
        id: 'vei-1',
        placa: 'ABC1D23',
        modelo: 'Civic 2.0 LX',
        marca: 'Honda',
        cor: 'Preto Pérola',
        categoria: 'sedan',
        ano: '2022'
      }
    ]
  },
  {
    id: 'cli-2',
    nome: 'Juliana Costa',
    whatsapp: '5541987654321',
    email: 'juliana.costa@email.com',
    cpfCnpj: '987.654.321-11',
    dataCadastro: '2026-07-22',
    observacoes: 'Cuidado extra com bancos de couro.',
    veiculos: [
      {
        id: 'vei-2',
        placa: 'JKL5M67',
        modelo: 'Compass Limited',
        marca: 'Jeep',
        cor: 'Branco Polar',
        categoria: 'suv',
        ano: '2023'
      }
    ]
  },
  {
    id: 'cli-3',
    nome: 'Roberto Santos',
    whatsapp: '5541991234567',
    email: 'roberto.santos@email.com',
    cpfCnpj: '456.789.123-22',
    dataCadastro: '2026-07-25',
    observacoes: 'Deseja higienização completa.',
    veiculos: [
      {
        id: 'vei-3',
        placa: 'XYZ9A87',
        modelo: 'Golf TSI',
        marca: 'Volkswagen',
        cor: 'Cinza Platinum',
        categoria: 'hatch',
        ano: '2021'
      }
    ]
  }
];

export const INITIAL_SERVICE_ORDERS: ServiceOrder[] = [
  {
    id: 'os-1001',
    numeroOS: 'OS-1001',
    clientId: 'cli-1',
    clientNome: 'Marcos Oliveira',
    clientWhatsApp: '5541998887766',
    vehiclePlaca: 'ABC1D23',
    vehicleModelo: 'Civic 2.0 LX',
    vehicleMarca: 'Honda',
    vehicleCor: 'Preto Pérola',
    vehicleCategoria: 'sedan',
    servicos: [
      { serviceId: 'srv-1', nome: 'Lavagem Simples + Pretinho', valor: 60 }
    ],
    valorTotal: 60,
    desconto: 0,
    valorFinal: 60,
    status: 'AGUARDANDO',
    statusPagamento: 'PENDENTE',
    dataAbertura: new Date().toISOString(),
    previsaoEntrega: new Date(Date.now() + 3600000 * 2).toISOString(),
    responsavelLavagem: 'Carlos Silva',
    observacoes: 'Aguardando liberação de box',
    historicoWhatsApp: []
  },
  {
    id: 'os-1002',
    numeroOS: 'OS-1002',
    clientId: 'cli-2',
    clientNome: 'Juliana Costa',
    clientWhatsApp: '5541987654321',
    vehiclePlaca: 'JKL5M67',
    vehicleModelo: 'Compass Limited',
    vehicleMarca: 'Jeep',
    vehicleCor: 'Branco Polar',
    vehicleCategoria: 'suv',
    servicos: [
      { serviceId: 'srv-2', nome: 'Lavagem Detalhada Técnico-Estética', valor: 160 }
    ],
    valorTotal: 160,
    desconto: 10,
    valorFinal: 150,
    status: 'LAVAGEM',
    statusPagamento: 'PAGO',
    formaPagamento: 'PIX',
    dataAbertura: new Date().toISOString(),
    previsaoEntrega: new Date(Date.now() + 3600000 * 3).toISOString(),
    responsavelLavagem: 'Lucas Souza',
    observacoes: 'Lavagem detalhada em andamento',
    historicoWhatsApp: []
  },
  {
    id: 'os-1003',
    numeroOS: 'OS-1003',
    clientId: 'cli-3',
    clientNome: 'Roberto Santos',
    clientWhatsApp: '5541991234567',
    vehiclePlaca: 'XYZ9A87',
    vehicleModelo: 'Golf TSI',
    vehicleMarca: 'Volkswagen',
    vehicleCor: 'Cinza Platinum',
    vehicleCategoria: 'hatch',
    servicos: [
      { serviceId: 'srv-4', nome: 'Polimento Comercial Monopasso', valor: 380 }
    ],
    valorTotal: 380,
    desconto: 0,
    valorFinal: 380,
    status: 'POLIMENTO',
    statusPagamento: 'PAGO',
    formaPagamento: 'CARTAO_CREDITO',
    dataAbertura: new Date().toISOString(),
    previsaoEntrega: new Date(Date.now() + 3600000 * 4).toISOString(),
    responsavelLavagem: 'André Lima',
    observacoes: 'Polimento de pintura em andamento',
    historicoWhatsApp: []
  },
  {
    id: 'os-1004',
    numeroOS: 'OS-1004',
    clientId: 'cli-1',
    clientNome: 'Marcos Oliveira',
    clientWhatsApp: '5541998887766',
    vehiclePlaca: 'ABC1D23',
    vehicleModelo: 'Civic 2.0 LX',
    vehicleMarca: 'Honda',
    vehicleCor: 'Preto Pérola',
    vehicleCategoria: 'sedan',
    servicos: [
      { serviceId: 'srv-6', nome: 'Limpeza e Hidratação de Couro', valor: 140 }
    ],
    valorTotal: 140,
    desconto: 0,
    valorFinal: 140,
    status: 'PRONTO',
    statusPagamento: 'PAGO',
    formaPagamento: 'PIX',
    dataAbertura: new Date().toISOString(),
    previsaoEntrega: new Date().toISOString(),
    responsavelLavagem: 'Carlos Silva',
    observacoes: 'Veículo pronto para retirada',
    historicoWhatsApp: []
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [];

export const INITIAL_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'tpl-boas-vindas',
    tipo: 'boas_vindas',
    titulo: 'Mensagem de Boas-Vindas',
    conteudo: 'Olá {cliente_nome}! Seja muito bem-vindo(a) ao *HR LAVACAR* 🚗✨\nSeu cadastro foi realizado com sucesso em nosso sistema.\nQuando precisar cuidar do seu veículo {veiculo}, basta agendar conosco por aqui ou trazer direto!'
  },
  {
    id: 'tpl-confirmacao-os',
    tipo: 'confirmacao_os',
    titulo: 'Confirmação de OS',
    conteudo: 'Olá {cliente_nome}! 👋\nSua Ordem de Serviço *{os_numero}* foi aberta no *HR LAVACAR*.\n\n🚗 *Veículo:* {veiculo} ({placa})\n🛠️ *Serviços:* {servicos}\n💰 *Valor Final:* R$ {valor_total}\n⏰ *Previsão de Entrega:* {previsao_entrega}\n\nQualquer dúvida estamos à disposição!'
  },
  {
    id: 'tpl-orcamento',
    tipo: 'orcamento',
    titulo: 'Envio de Orçamento',
    conteudo: 'Olá {cliente_nome}! 📋\nSegue o orçamento detalhado para o seu veículo {veiculo} ({placa}) no *HR LAVACAR*:\n\n*Serviços Recomendados:*\n{servicos}\n\n*Total:* R$ {valor_total}\nPodemos iniciar o serviço?'
  },
  {
    id: 'tpl-carro-pronto',
    tipo: 'carro_pronto',
    titulo: 'Aviso: Carro Pronto! 🚗✨',
    conteudo: '🎉 *BOAS NOTÍCIAS!* {cliente_nome}, o seu veículo *{veiculo} ({placa})* já está *PRONTO* para retirada no *HR LAVACAR*!\n\n✨ Ficou como novo! Venha conferir.\n📍 Nosso endereço: {empresa_endereco}\nEsperamos por você!'
  },
  {
    id: 'tpl-comprovante',
    tipo: 'comprovante',
    titulo: 'Comprovante / Recibo',
    conteudo: 'Comprovante de Serviço - *HR LAVACAR* 🧾\n\n*OS:* {os_numero}\n*Cliente:* {cliente_nome}\n*Veículo:* {veiculo} ({placa})\n*Valor Pago:* R$ {valor_total}\n*Status:* Pago ({forma_pagamento})\n\nAgradecemos a preferência! Volte sempre. 🚗💨'
  }
];

export const INITIAL_WA_CONFIG: WhatsAppApiConfig = {
  phoneNumberId: '',
  accessToken: '',
  businessAccountId: '',
  webhookUrl: '',
  modoEnvioPadrao: 'WA_ME_LINK',
  statusConexao: 'DESCONECTADO'
};

export const INITIAL_BUSINESS_CONFIG: BusinessConfig = {
  nomeEmpresa: 'HR LAVACAR - Estética Automotiva',
  cnpj: '00.000.000/0001-00',
  telefone: '(41) 99999-8888',
  endereco: 'Rua Principal, 1000 - Centro',
  chavePix: '',
  pinSeguranca: '123456',
  comissaoPadraoPercentual: 15,
  mensagemPersonalizadaCabecalho: 'HR LAVACAR - Qualidade e Brilho Impecável'
};

export const INITIAL_INVENTORY: InventoryItem[] = [];

export const INITIAL_CASH_REGISTER: DailyCashRegister = {
  id: `cash-${new Date().toISOString().split('T')[0].replace(/-/g, '')}`,
  data: new Date().toISOString().split('T')[0],
  status: 'ABERTO',
  saldoInicial: 0,
  dataAbertura: new Date().toISOString(),
  usuarioAbertura: 'Caixa HR LAVACAR',
  movimentacoes: []
};
