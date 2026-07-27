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
  const paidTodayOrders = todayOrders.filter(o => o.statusPagamento === 'PAGO');
  const revenueToday = paidTodayOrders.reduce((acc, curr) => acc + (curr.valorFinal || 0), 0);
  const pendingTodayOrders = todayOrders.filter(o => o.statusPagamento === 'PENDENTE');
  const pendingTodayAmount = pendingTodayOrders.reduce((acc, curr) => acc + (curr.valorFinal || 0), 0);

  const inProduction = safeOrders.filter(o => ['LAVAGEM', 'POLIMENTO', 'INSPECAO', 'AGUARDANDO'].includes(o.status));
  const readyForPickup = safeOrders.filter(o => o.status === 'PRONTO');
  const deliveredToday = safeOrders.filter(o => o.status === 'ENTREGUE' && isToday(o.dataAbertura));

  const lowStockItems = safeInventory.filter(i => i.quantidade <= (i.quantidadeMinima ?? i.minimo ?? 0));

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Bento Grid Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              HR LAVACAR ● Painel de Controle
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Gestão & Operações
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Acompanhe a esteira de serviços em tempo real, fluxo de caixa e disparos via WhatsApp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenNewOS}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>Abrir Nova OS</span>
          </button>

          <button
            onClick={() => navigate('producao')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl border border-slate-200 transition-all cursor-pointer"
          >
            <Car className="w-4 h-4 text-blue-600" />
            <span>Ver Esteira Vivo</span>
          </button>
        </div>
      </div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Bento Card 1: Production Panel (Spans 8 cols) */}
        <div className="md:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Car className="w-4 h-4 text-blue-600" />
              Painel de Produção
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              ● {inProduction.length} Veículos em Andamento
            </span>
          </div>

          {inProduction.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm font-medium">
              Nenhum veículo na esteira no momento.
            </div>
          ) : (
            <div className="space-y-3">
              {inProduction.slice(0, 4).map(os => (
                <div key={os.id} className="grid grid-cols-1 sm:grid-cols-12 items-center gap-3 p-3 border border-slate-200 rounded-xl hover:border-blue-300 transition-all bg-slate-50/50">
                  <div className="sm:col-span-5">
                    <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <span>OS #{os.id.slice(-4)}</span>
                      <span className="font-mono text-xs px-2 py-0.5 bg-white border border-slate-200 rounded text-blue-700">
                        {os.vehiclePlaca}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">
                      {os.vehicleModelo} ({os.vehicleCor}) • {os.clientNome}
                    </div>
                  </div>

                  <div className="sm:col-span-4 flex items-center">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                      os.status === 'LAVAGEM' ? 'bg-blue-100 text-blue-800' :
                      os.status === 'POLIMENTO' ? 'bg-amber-100 text-amber-800' :
                      os.status === 'AGUARDANDO' ? 'bg-slate-200 text-slate-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {os.status === 'LAVAGEM' ? 'Lavagem Técnica' :
                       os.status === 'POLIMENTO' ? 'Polimento Comercial' :
                       os.status === 'AGUARDANDO' ? 'Aguardando' : 'Inspeção Detalhada'}
                    </span>
                  </div>

                  <div className="sm:col-span-3 flex justify-end">
                    <button
                      onClick={() => onOpenWhatsAppModal(os.id, os.clientId)}
                      className="bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs w-full sm:w-auto"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Exibindo principais ordens operacionais
            </span>
            <button
              onClick={() => navigate('producao')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Ver Esteira Completa <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bento Card 2: Quick Communication (Spans 4 cols) */}
        <div className="md:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                Comunicação Rápida
              </span>
            </div>

            <div className="space-y-3">
              {readyForPickup.slice(0, 2).map(os => (
                <div key={os.id} className="p-3 bg-slate-50 border-l-4 border-emerald-500 rounded-r-xl border-t border-b border-r border-slate-200 space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                    <span>Para: {os.clientNome}</span>
                    <span className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      {os.vehiclePlaca}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    "Seu veículo <strong>{os.vehicleModelo}</strong> está pronto para retirada! Segue resumo da OS #{os.id.slice(-4)}."
                  </p>
                  <button
                    onClick={() => onOpenWhatsAppModal(os.id, os.clientId)}
                    className="w-full mt-1 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs"
                  >
                    <Send className="w-3 h-3" />
                    <span>Avisar Veículo Pronto</span>
                  </button>
                </div>
              ))}

              {readyForPickup.length === 0 && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                  Nenhum aviso pendente de "Veículo Pronto" no momento.
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => onOpenWhatsAppModal()}
            className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
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
                  <div className="text-3xl font-black text-white font-mono">
                    R$ {revenueToday.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                    Total recebido hoje ({paidTodayOrders.length} OSs pagas)
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-medium">A Receber (Pendente)</span>
                    <span className="font-bold text-amber-400 font-mono">
                      R$ {pendingTodayAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-medium">OSs de Hoje</span>
                    <span className="font-bold text-slate-200 font-mono">{todayOrders.length} ordens</span>
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
        <div className="md:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Agendamentos do Dia
              </span>
              <button
                onClick={() => navigate('agendamentos')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                Ver Todos
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <strong className="text-slate-900">14:00</strong> — Porsche Cayenne
                  <div className="text-[11px] text-slate-500">Vitrificação de Pintura 3M</div>
                </div>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded text-[10px]">Confirmado</span>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <strong className="text-slate-900">15:30</strong> — BMW X5
                  <div className="text-[11px] text-slate-500">Higienização Interna + Couro</div>
                </div>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded text-[10px]">Na Fila</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Card 5: Inventory Alerts & Meta (Spans 4 cols) */}
        <div className="md:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Alertas de Estoque
              </span>
              <button
                onClick={() => navigate('estoque')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800"
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
                  <div key={item.id} className="flex items-center justify-between py-1.5 border-b border-slate-100 text-xs">
                    <span className="text-slate-700 font-medium">{item.nome}</span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded-md text-[11px]">
                      {item.quantidade} {item.unidade} (Mín: {item.quantidadeMinima})
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Meta Diária de Produção</span>
            <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              72% atingido
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
