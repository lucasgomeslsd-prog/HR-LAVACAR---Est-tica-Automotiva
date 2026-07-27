export type Role = 'admin' | 'funcionario';
export type UserRole = 'ADMIN' | 'EMPLOYEE';

export type TabType = 
  | 'dashboard' 
  | 'clientes' 
  | 'os' 
  | 'producao' 
  | 'agendamentos' 
  | 'caixa' 
  | 'financeiro' 
  | 'estoque' 
  | 'relatorios' 
  | 'configuracoes';

export type VehicleCategory = 'hatch' | 'sedan' | 'suv' | 'moto' | 'utilitario';

export interface Vehicle {
  id: string;
  placa: string;
  modelo: string;
  marca: string;
  cor: string;
  categoria: VehicleCategory;
  ano?: string;
  observacoes?: string;
}

export interface Client {
  id: string;
  nome: string;
  whatsapp: string;
  email?: string;
  cpfCnpj?: string;
  dataCadastro: string;
  observacoes?: string;
  veiculos: Vehicle[];
}

export interface ServiceItem {
  id: string;
  nome: string;
  descricao: string;
  precos: {
    hatch: number;
    sedan: number;
    suv: number;
    moto: number;
    utilitario: number;
  };
  duracaoMinutos: number;
  categoria: 'lavagem' | 'estetica' | 'higienizacao' | 'protecao' | 'outros';
}

export type OSStatus = 
  | 'AGUARDANDO' 
  | 'LAVAGEM' 
  | 'POLIMENTO' 
  | 'INSPECAO' 
  | 'PRONTO' 
  | 'ENTREGUE' 
  | 'CANCELADA';

export type PaymentStatus = 'PENDENTE' | 'PAGO_PARCIAL' | 'PAGO';
export type PaymentMethod = 'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'DINHEIRO';

export interface ChecklistDamagePoint {
  id: string;
  x: number; // percentage on diagram
  y: number;
  part: 'frente' | 'traseira' | 'lateral_esquerda' | 'lateral_direita' | 'teto' | 'interior';
  type: 'arranhao' | 'amassado' | 'trincado' | 'sujeira' | 'mancha';
  descricao: string;
}

export interface Checklist {
  id: string;
  osId: string;
  dataEntrada: string;
  dataSaida?: string;
  nivelCombustivel: number; // 0 - 100
  nivelSujeira: 'leve' | 'media' | 'pesada' | 'extrema';
  odometroKm?: number;
  
  // Inspection switches
  temTriangulo: boolean;
  temMacaco: boolean;
  temChaveRoda: boolean;
  temTapetes: boolean;
  temSomMultimidia: boolean;
  pertencesPessoais: string;
  
  damagePoints: ChecklistDamagePoint[];
  fotosEntrada: string[]; // Base64 or Object URLs
  fotosSaida: string[];
  observacoesEntrada: string;
  observacoesSaida: string;
}

export interface WhatsAppLog {
  id: string;
  osId?: string;
  clientId: string;
  clientNome: string;
  whatsappNumber: string;
  dataEnvio: string;
  tipoTemplate: 'boas_vindas' | 'confirmacao_os' | 'orcamento' | 'carro_pronto' | 'comprovante' | 'personalizado';
  mensagemTexto: string;
  enviadoPor: string; // User/Staff name
  statusEnvio: 'ENVIADO' | 'ENTREGUE' | 'LIDO' | 'ERRO';
  metodo: 'WA_ME_LINK' | 'BUSINESS_API';
}

export interface ServiceOrder {
  id: string;
  numeroOS: string;
  clientId: string;
  clientNome: string;
  clientWhatsApp: string;
  vehiclePlaca: string;
  vehicleModelo: string;
  vehicleMarca: string;
  vehicleCor: string;
  vehicleCategoria: VehicleCategory;
  
  servicos: {
    serviceId: string;
    nome: string;
    valor: number;
  }[];
  
  valorTotal: number;
  desconto: number;
  valorFinal: number;
  
  status: OSStatus;
  statusPagamento: PaymentStatus;
  formaPagamento?: PaymentMethod;
  
  dataAbertura: string;
  previsaoEntrega: string;
  dataConclusao?: string;
  
  responsavelLavagem: string;
  observacoes: string;
  
  checklist?: Checklist;
  historicoWhatsApp: WhatsAppLog[];
}

export interface Appointment {
  id: string;
  clientId: string;
  clientNome: string;
  clientWhatsApp: string;
  vehiclePlaca: string;
  vehicleModelo: string;
  vehicleCategoria: VehicleCategory;
  dataHora: string;
  servicosDesejados: string[];
  observacoes?: string;
  status: 'AGENDADO' | 'CONFIRMADO' | 'CONVERTIDO_EM_OS' | 'CANCELADO';
}

export interface CashTransaction {
  id: string;
  tipo: 'ENTRADA' | 'SAIDA';
  categoria: 'SERVICO' | 'PRODUTO' | 'SANGRIA' | 'SUPRIMENTO' | 'DESPESA' | 'COMISSAO' | 'OUTROS';
  descricao: string;
  valor: number;
  formaPagamento: PaymentMethod;
  dataHora: string;
  osId?: string;
  usuario: string;
}

export interface DailyCashRegister {
  id: string;
  data: string;
  status: 'ABERTO' | 'FECHADO';
  saldoInicial: number;
  saldoFinalCalculado?: number;
  saldoFinalInformado?: number;
  diferenca?: number;
  dataAbertura: string;
  dataFechamento?: string;
  usuarioAbertura: string;
  usuarioFechamento?: string;
  movimentacoes: CashTransaction[];
}

export interface InventoryItem {
  id: string;
  nome: string;
  categoria: 'shampoo' | 'cera' | 'microfibra' | 'pretinho' | 'vitrificador' | 'equipamento' | 'outros';
  quantidade: number;
  unidadeMedida: 'ml' | 'litro' | 'unidade' | 'kg' | 'galao';
  quantidadeMinima: number;
  precoCusto: number;
  fornecedor?: string;
  ultimaAtualizacao: string;
}

export interface WhatsAppTemplate {
  id: string;
  tipo: 'boas_vindas' | 'confirmacao_os' | 'orcamento' | 'carro_pronto' | 'comprovante';
  titulo: string;
  conteudo: string;
}

export interface WhatsAppApiConfig {
  phoneNumberId: string;
  accessToken: string;
  businessAccountId: string;
  webhookUrl: string;
  modoEnvioPadrao: 'WA_ME_LINK' | 'BUSINESS_API';
  statusConexao: 'CONECTADO' | 'DESCONECTADO' | 'SIMULADOR_ATIVO';
}

export interface BusinessConfig {
  nomeEmpresa: string;
  cnpj: string;
  telefone: string;
  endereco: string;
  chavePix: string;
  pinSeguranca: string; // 6 digits PIN for Financial area
  comissaoPadraoPercentual: number;
  mensagemPersonalizadaCabecalho: string;
}
