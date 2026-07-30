import React from 'react';
import { 
  DollarSign, 
  Car, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  PlusCircle, 
  UserPlus, 
  MessageSquare, 
  Send, 
  Sparkles,
  TrendingUp,
  ArrowRight,
  Lock,
  ShieldAlert
} from 'lucide-react';
import { ServiceOrder, Client, Role, InventoryItem } from '../types';

interface DashboardProps {
  orders?: ServiceOrder[];
  clients?: Client[];
  inventory?: InventoryItem[];
  role?: Role;
  pinUnlocked?: boolean;
  onRequestPinUnlock?: () => void;
  onNavigateTab?: (tab: any) => void;
  onNavigate?: (tab: any) => void;
  onOpenNewOS?: () => void;
  onOpenNewClient?: () => void;
  onOpenWhatsAppModal?: (osId?: string, clientId?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  orders = [],
  clients = [],
  inventory = [],
  role = 'ADMIN',
  pinUnlocked = true,
  onRequestPinUnlock,
  onNavigateTab,
  onNavigate,
  onOpenNewOS = () => {},
  onOpenNewClient = () => {},
  onOpenWhatsAppModal = (_osId?: string, _clientId?: string) => {}
}) => {
  const navigate = onNavigateTab || onNavigate || (() => {});
  const isEmployee = (role as string)?.toUpperCase() === 'FUNCIONARIO';

  // Calculate metrics
  const safeOrders = orders || [];
  const safeInventory = inventory || [];

  const isToday = (dateStr?: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    const now = new Date();
    return d.getDate() === now.getDate() &&
           d.getMonth() === now.getMonth() &&
           d.getFullYear() === now.getFullYear();
  };

  const todayOrders = safeOrders.filter(o => isToday(o.dataAbertura));

  // Financial Breakdown (Novo padrão do Caixa)
  // Recebido: PAGO (valorFinal/valorPago), PAGO_PARCIAL (valorPago)
  const totalRecebido = safeOrders.reduce((acc, o) => {
    if (o.status === 'CANCELADA') return acc;
    if (o.statusPagamento === 'PAGO') {
      return acc + (o.valorPago !== undefined && o.valorPago > 0 ? o.valorPago : (o.valorFinal || 0));
    }
    if (o.statusPagamento === 'PAGO_PARCIAL') {
      return acc + (o.valorPago || 0);
    }
    return acc;
  }, 0);

  // A Receber: PENDENTE (valorFinal), PAGAMENTO_A_PRAZO (valorFinal), PAGO_PARCIAL (valorFinal - valorPago)
  const totalAReceber = safeOrders.reduce((acc, o) => {
    if (o.status === 'CANCELADA') return acc;
    if (o.statusPagamento === 'PENDENTE' || o.statusPagamento === 'PAGAMENTO_A_PRAZO') {
      return acc + (o.valorFinal || 0);
    }
    if (o.statusPagamento === 'PAGO_PARCIAL') {
      return acc + Math.max(0, (o.valorFinal || 0) - (o.valorPago || 0));
    }
    return acc;
  }, 0);

  // Troca em Serviços: TROCA_SERVICOS (valorFinal)
  const totalTrocaServicos = safeOrders.reduce((acc, o) => {
    if (o.status === 'CANCELADA') return acc;
    if (o.statusPagamento === 'TROCA_SERVICOS') {
      return acc + (o.valorFinal || 0);
    }
    return acc;
  }, 0);

  // Cortesias: CORTESIA (valorFinal)
  const totalCortesias = safeOrders.reduce((acc, o) => {
    if (o.status === 'CANCELADA') return acc;
    if (o.statusPagamento === 'CORTESIA') {
      return acc + (o.valorFinal || 0);
    }
    return acc;
  }, 0);

  // Cancelados: CANCELADO / OS Status CANCELADA
  const totalCancelados = safeOrders.reduce((acc, o) => {
    if (o.status === 'CANCELADA' || o.statusPagamento === 'CANCELADO') {
      return acc + (o.valorFinal || 0);
    }
    return acc;
  }, 0);

  const inProduction = safeOrders.filter(o => ['LAVAGEM', 'POLIMENTO', 'INSPECAO', 'AGUARDANDO'].includes(o.status));
  const readyForPickup = safeOrders.filter(o => o.status === 'PRONTO');
  const deliveredToday = safeOrders.filter(o => o.status === 'ENTREGUE' && isToday(o.dataAbertura));

  const lowStockItems = safeInventory.filter(i => i.quantidade <= (i.quantidadeMinima ?? i.minimo ?? 0));

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Bento Grid Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-800/80">
              HR LAVACAR ● Painel de Controle
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Gestão & Operações
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Acompanhe a esteira de serviços em tempo real, fluxo de caixa e disparos via WhatsApp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenNewOS}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-900/40 active:scale-95 transition-all cursor-pointer touch-manipulation"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>Abrir Nova OS</span>
          </button>

          <button
            onClick={() => navigate('producao')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm rounded-xl border border-slate-700 transition-all cursor-pointer touch-manipulation"
          >
            <Car className="w-4 h-4 text-cyan-400" />
            <span>Ver Esteira Vivo</span>
          </button>
        </div>
      </div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
        
        {/* Bento Card 1: Production Panel (Spans 8 cols) */}
        <div className="md:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Car className="w-4 h-4 text-cyan-400" />
              Painel de Produção
            </span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-md border border-emerald-800/80">
              ● {inProduction.length} Veículos em Andamento
            </span>
          </div>

          {inProduction.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm font-medium">
              Nenhum veículo na esteira no momento.
            </div>
          ) : (
            <div className="space-y-3">
              {inProduction.slice(0, 4).map(os => (
                <div key={os.id} className="grid grid-cols-1 sm:grid-cols-12 items-center gap-3 p-3 border border-slate-800 rounded-xl hover:border-slate-700 transition-all bg-slate-950/60">
                  <div className="sm:col-span-5">
                    <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                      <span>OS #{os.id.slice(-4)}</span>
                      <span className="font-mono text-xs px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-cyan-300 font-bold">
                        {os.vehiclePlaca}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 truncate mt-0.5">
                      {os.vehicleModelo} ({os.vehicleCor}) • {os.clientNome}
                    </div>
                  </div>

                  <div className="sm:col-span-4 flex items-center">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                      os.status === 'LAVAGEM' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                      os.status === 'POLIMENTO' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      os.status === 'AGUARDANDO' ? 'bg-slate-800 text-slate-300 border border-slate-700' :
                      'bg-purple-950 text-purple-300 border border-purple-800'
                    }`}>
                      {os.status === 'LAVAGEM' ? 'Lavagem Técnica' :
                       os.status === 'POLIMENTO' ? 'Polimento Comercial' :
                       os.status === 'AGUARDANDO' ? 'Aguardando' : 'Inspeção Detalhada'}
                    </span>
                  </div>

                  <div className="sm:col-span-3 flex justify-end">
                    <button
                      onClick={() => onOpenWhatsAppModal(os.id, os.clientId)}
                      className="bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md w-full sm:w-auto touch-manipulation"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">
              Exibindo principais ordens operacionais
            </span>
            <button
              onClick={() => navigate('producao')}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              Ver Esteira Completa <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bento Card 2: Quick Communication (Spans 4 cols) */}
        <div className="md:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                Comunicação Rápida
              </span>
            </div>

            <div className="space-y-3">
              {readyForPickup.slice(0, 2).map(os => (
                <div key={os.id} className="p-3 bg-slate-950/80 border-l-4 border-emerald-500 rounded-r-xl border-t border-b border-r border-slate-800 space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-200">
                    <span>Para: {os.clientNome}</span>
                    <span className="font-mono text-emerald-300 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                      {os.vehiclePlaca}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    "Seu veículo <strong className="text-slate-200">{os.vehicleModelo}</strong> está pronto para retirada! Segue resumo da OS #{os.id.slice(-4)}."
                  </p>
                  <button
                    onClick={() => onOpenWhatsAppModal(os.id, os.clientId)}
                    className="w-full mt-1 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md touch-manipulation"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Avisar Veículo Pronto</span>
                  </button>
                </div>
              ))}

              {readyForPickup.length === 0 && (
                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-center text-xs text-slate-500">
                  Nenhum aviso pendente de "Veículo Pronto" no momento.
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => onOpenWhatsAppModal()}
            className="w-full mt-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-blue-900/40 touch-manipulation"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Nova Mensagem WhatsApp</span>
          </button>
        </div>

        {/* Bento Card 3: Financial Card (High Contrast Dark Slate Card) (Spans 4 cols) */}
        <div className="md:col-span-4 bg-slate-900 border border-slate-800 text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-3 text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">
                Resumo Financeiro do Dia
              </span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>

            {isEmployee ? (
              <div className="py-4 text-center">
                <ShieldAlert className="w-7 h-7 text-slate-500 mx-auto mb-1" />
                <p className="text-xs font-bold text-slate-300">Acesso Restrito</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Disponível para Administrador</p>
              </div>
            ) : !pinUnlocked ? (
              <div className="py-3 text-center">
                <Lock className="w-7 h-7 text-amber-400 mx-auto mb-1" />
                <p className="text-xs font-bold text-slate-200">Resumo Protegido por PIN</p>
                <button
                  type="button"
                  onClick={() => onRequestPinUnlock?.()}
                  className="mt-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-lg transition-all cursor-pointer shadow-md"
                >
                  Inserir PIN
                </button>
              </div>
            ) : (
              <div className="mt-2 space-y-3">
                <div>
                  <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider block">
                    Recebido (Caixa Real)
                  </span>
                  <div className="text-3xl font-black text-white font-mono mt-0.5">
                    R$ {totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Somente valores com recebimento financeiro (Pago / Parcial)
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[11px]">A Receber (Prazo/Pendente):</span>
                    <span className="font-bold text-amber-400 font-mono">
                      R$ {totalAReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[11px]">Troca em Serviços:</span>
                    <span className="font-bold text-blue-400 font-mono">
                      R$ {totalTrocaServicos.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[11px]">Cortesias:</span>
                    <span className="font-bold text-purple-400 font-mono">
                      R$ {totalCortesias.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[11px]">Cancelados:</span>
                    <span className="font-bold text-rose-400 font-mono">
                      R$ {totalCancelados.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Fluxo de Caixa Diário</span>
            <button
              onClick={() => navigate('caixa')}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              Abrir Caixa <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bento Card 4: Upcoming Appointments (Spans 4 cols) */}
        <div className="md:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Agendamentos do Dia
              </span>
              <button
                onClick={() => navigate('agendamentos')}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                Ver Todos
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <strong className="text-slate-100">14:00</strong> — Porsche Cayenne
                  <div className="text-[11px] text-slate-400">Vitrificação de Pintura 3M</div>
                </div>
                <span className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 font-bold rounded text-[10px]">Confirmado</span>
              </div>

              <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <strong className="text-slate-100">15:30</strong> — BMW X5
                  <div className="text-[11px] text-slate-400">Higienização Interna + Couro</div>
                </div>
                <span className="px-2 py-0.5 bg-blue-950 text-blue-300 border border-blue-800 font-bold rounded text-[10px]">Na Fila</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Card 5: Inventory Alerts & Meta (Spans 4 cols) */}
        <div className="md:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Alertas de Estoque
              </span>
              <button
                onClick={() => navigate('estoque')}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                Gerenciar
              </button>
            </div>

            <div className="space-y-2">
              {lowStockItems.length === 0 ? (
                <div className="text-xs text-slate-500 py-2">
                  Estoque de insumos em nível adequado.
                </div>
              ) : (
                lowStockItems.slice(0, 3).map(item => (
                  <div key={item.id} className="flex items-center justify-between py-1.5 border-b border-slate-800/80 text-xs">
                    <span className="text-slate-300 font-medium">{item.nome}</span>
                    <span className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 font-bold rounded-md text-[11px]">
                      {item.quantidade} {item.unidade} (Mín: {item.quantidadeMinima})
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Meta Diária de Produção</span>
            <span className="text-xs font-extrabold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              72% atingido
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
