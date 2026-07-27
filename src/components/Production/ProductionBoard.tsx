import React, { useState } from 'react';
import { 
  Kanban, 
  Clock, 
  Car, 
  CheckCircle2, 
  Send, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  MessageSquare,
  Search,
  Filter,
  User,
  CheckSquare
} from 'lucide-react';
import { ServiceOrder, OSStatus } from '../../types';

interface ProductionBoardProps {
  orders: ServiceOrder[];
  onUpdateOrderStatus: (orderId: string, newStatus: OSStatus) => void;
  onOpenWhatsAppModal: (osId: string, clientId: string) => void;
  onOpenChecklist: (order: ServiceOrder) => void;
  onViewOSReceipt: (order: ServiceOrder) => void;
}

export const ProductionBoard: React.FC<ProductionBoardProps> = ({
  orders,
  onUpdateOrderStatus,
  onOpenWhatsAppModal,
  onOpenChecklist,
  onViewOSReceipt
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const columns: { status: OSStatus; title: string; color: string; icon: any }[] = [
    { status: 'AGUARDANDO', title: '⏳ Aguardando', color: 'border-amber-200 bg-amber-50 text-amber-800', icon: Clock },
    { status: 'LAVAGEM', title: '🧼 Em Lavagem', color: 'border-blue-200 bg-blue-50 text-blue-800', icon: Car },
    { status: 'POLIMENTO', title: '✨ Polimento/Estética', color: 'border-purple-200 bg-purple-50 text-purple-800', icon: Sparkles },
    { status: 'INSPECAO', title: '🔍 Inspeção Final', color: 'border-indigo-200 bg-indigo-50 text-indigo-800', icon: CheckSquare },
    { status: 'PRONTO', title: '✅ Pronto p/ Retirada', color: 'border-emerald-200 bg-emerald-50 text-emerald-800', icon: CheckCircle2 },
    { status: 'ENTREGUE', title: '🚗 Entregue', color: 'border-slate-200 bg-slate-100 text-slate-600', icon: CheckCircle2 }
  ];

  const safeOrders = orders || [];

  const filteredOrders = safeOrders.filter(o => {
    const q = searchQuery.toLowerCase();
    return (
      (o.vehiclePlaca && o.vehiclePlaca.toLowerCase().includes(q)) ||
      (o.vehicleModelo && o.vehicleModelo.toLowerCase().includes(q)) ||
      (o.clientNome && o.clientNome.toLowerCase().includes(q)) ||
      (o.numeroOS && o.numeroOS.toLowerCase().includes(q)) ||
      (o.id && o.id.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Kanban className="w-6 h-6 text-blue-600" />
            Painel de Produção & Esteira
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Acompanhe a movimentação dos veículos no pátio, tempo de lavagem e envie avisos de "Carro Pronto" via WhatsApp.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por placa, modelo ou cliente..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600"
          />
        </div>
      </div>

      {/* Kanban Board Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {columns.map(col => {
          const colOrders = filteredOrders.filter(o => o.status === col.status);

          return (
            <div 
              key={col.status}
              className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col min-w-[260px] md:min-w-0 shadow-xs"
            >
              {/* Column Header */}
              <div className={`p-2.5 rounded-xl border ${col.color} flex items-center justify-between mb-3 shadow-2xs`}>
                <span className="text-xs font-bold truncate">{col.title}</span>
                <span className="w-5 h-5 rounded-full bg-white/80 text-[11px] font-mono font-bold flex items-center justify-center shrink-0 border border-slate-200 text-slate-700">
                  {colOrders.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-16rem)] pr-1">
                {colOrders.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs italic">
                    Nenhum veículo
                  </div>
                ) : (
                  colOrders.map(order => (
                    <div
                      key={order.id}
                      className="bg-slate-50/70 border border-slate-200 rounded-xl p-3 shadow-2xs hover:border-blue-300 transition-all space-y-2.5 group"
                    >
                      {/* Top Plate & Number */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {order.vehiclePlaca}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono font-semibold">
                          #{order.numeroOS}
                        </span>
                      </div>

                      {/* Vehicle Details */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {order.vehicleModelo}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate">
                          {order.clientNome}
                        </p>
                      </div>

                      {/* Services summary */}
                      <div className="text-[10px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200 line-clamp-2">
                        {(order.servicos || []).map(s => s.nome).join(', ')}
                      </div>

                      {/* Responsavel */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-blue-600" />
                          {order.responsavelLavagem || 'A definir'}
                        </span>
                        <span className="text-slate-800 font-bold">
                          R$ {order.valorFinal.toFixed(2)}
                        </span>
                      </div>

                      {/* Checklist status indicator */}
                      <div className="flex items-center justify-between gap-1 pt-1">
                        <button
                          onClick={() => onOpenChecklist(order)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 transition-colors ${
                            order.checklist 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                              : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
                          }`}
                        >
                          <CheckSquare className="w-3 h-3" />
                          <span>{order.checklist ? 'Checklist OK' : 'Fazer Checklist'}</span>
                        </button>

                        <button
                          onClick={() => onViewOSReceipt(order)}
                          className="text-[10px] font-bold text-blue-600 hover:underline"
                        >
                          Ver OS
                        </button>
                      </div>

                      {/* WhatsApp trigger special button for PRONTO */}
                      {col.status === 'PRONTO' && (
                        <button
                          onClick={() => onOpenWhatsAppModal(order.id, order.clientId)}
                          className="w-full py-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Avisar "Carro Pronto"</span>
                        </button>
                      )}

                      {/* Status advancement buttons */}
                      <div className="flex items-center justify-between gap-1 pt-2 border-t border-slate-200">
                        {col.status !== 'AGUARDANDO' && (
                          <button
                            onClick={() => {
                              const prevMap: Record<OSStatus, OSStatus> = {
                                'AGUARDANDO': 'AGUARDANDO',
                                'LAVAGEM': 'AGUARDANDO',
                                'POLIMENTO': 'LAVAGEM',
                                'INSPECAO': 'POLIMENTO',
                                'PRONTO': 'INSPECAO',
                                'ENTREGUE': 'PRONTO',
                                'CANCELADA': 'AGUARDANDO'
                              };
                              onUpdateOrderStatus(order.id, prevMap[order.status]);
                            }}
                            className="px-2 py-1 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded text-[10px] font-semibold flex items-center gap-0.5 cursor-pointer shadow-2xs"
                            title="Mover para etapa anterior"
                          >
                            <ArrowLeft className="w-3 h-3" />
                            <span>Voltar</span>
                          </button>
                        )}

                        {col.status !== 'ENTREGUE' && (
                          <button
                            onClick={() => {
                              const nextMap: Record<OSStatus, OSStatus> = {
                                'AGUARDANDO': 'LAVAGEM',
                                'LAVAGEM': 'POLIMENTO',
                                'POLIMENTO': 'INSPECAO',
                                'INSPECAO': 'PRONTO',
                                'PRONTO': 'ENTREGUE',
                                'ENTREGUE': 'ENTREGUE',
                                'CANCELADA': 'AGUARDANDO'
                              };
                              onUpdateOrderStatus(order.id, nextMap[order.status]);
                            }}
                            className="ml-auto px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-[10px] flex items-center gap-0.5 cursor-pointer shadow-2xs"
                            title="Avançar para próxima etapa"
                          >
                            <span>Avançar</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
