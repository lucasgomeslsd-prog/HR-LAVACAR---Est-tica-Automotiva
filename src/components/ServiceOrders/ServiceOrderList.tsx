import React, { useState } from 'react';
import { 
  ClipboardList, 
  Search, 
  PlusCircle, 
  Filter, 
  Car, 
  User, 
  MessageSquare, 
  CheckSquare, 
  Printer, 
  Edit, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  DollarSign,
  Send
} from 'lucide-react';

import { ServiceOrder, OSStatus, PaymentStatus } from '../../types';

interface ServiceOrderListProps {
  orders: ServiceOrder[];
  onOpenNewOS: () => void;
  onEditOrder: (order: ServiceOrder) => void;
  onDeleteOrder: (orderId: string) => void;
  onOpenWhatsAppModal: (osId: string, clientId: string) => void;
  onOpenChecklist: (order: ServiceOrder) => void;
  onViewOSReceipt: (order: ServiceOrder) => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OSStatus) => void;
  onUpdatePaymentStatus: (orderId: string, newStatus: PaymentStatus) => void;
}

export const ServiceOrderList: React.FC<ServiceOrderListProps> = ({
  orders,
  onOpenNewOS,
  onEditOrder,
  onDeleteOrder,
  onOpenWhatsAppModal,
  onOpenChecklist,
  onViewOSReceipt,
  onUpdateOrderStatus,
  onUpdatePaymentStatus
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');

  const safeOrders = orders || [];

  const filteredOrders = safeOrders.filter(o => {
    const q = searchQuery.toLowerCase();
    const matchSearch = (
      (o.vehiclePlaca && o.vehiclePlaca.toLowerCase().includes(q)) ||
      (o.vehicleModelo && o.vehicleModelo.toLowerCase().includes(q)) ||
      (o.clientNome && o.clientNome.toLowerCase().includes(q)) ||
      (o.numeroOS && o.numeroOS.toLowerCase().includes(q)) ||
      (o.id && o.id.toLowerCase().includes(q))
    );
    const matchStatus = statusFilter === 'TODOS' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-blue-600" />
            Ordens de Serviço (OS)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {orders.length} Ordem(ns) de Serviço registradas no sistema
          </p>
        </div>

        <button
          onClick={onOpenNewOS}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" />
          <span>Nova Ordem de Serviço</span>
        </button>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por nº da OS, placa do veículo, modelo ou nome do cliente..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'TODOS', label: 'Todas' },
            { id: 'AGUARDANDO', label: '⏳ Aguardando' },
            { id: 'LAVAGEM', label: '🧼 Lavagem' },
            { id: 'POLIMENTO', label: '✨ Polimento' },
            { id: 'INSPECAO', label: '🔍 Inspeção' },
            { id: 'PRONTO', label: '✅ Pronto' },
            { id: 'ENTREGUE', label: '🚗 Entregue' }
          ].map(st => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === st.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* OS Cards Roster */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-xs">
          <ClipboardList className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-800">Nenhuma Ordem de Serviço encontrada</p>
          <p className="text-xs text-slate-500 mt-1">Ajuste os filtros de busca ou abra uma nova OS.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div 
              key={order.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all space-y-4"
            >
              {/* Row Top Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono font-bold text-blue-700">
                    #{order.numeroOS}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-mono text-xs font-bold text-blue-800 shadow-2xs">
                      {order.vehiclePlaca}
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {order.vehicleModelo}
                    </span>
                    <span className="text-xs text-slate-500">({order.vehicleCor})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status Dropdown */}
                  <select
                    value={order.status}
                    onChange={e => onUpdateOrderStatus(order.id, e.target.value as OSStatus)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-blue-700 focus:outline-none"
                  >
                    <option value="AGUARDANDO">⏳ Aguardando</option>
                    <option value="LAVAGEM">🧼 Em Lavagem</option>
                    <option value="POLIMENTO">✨ Em Polimento</option>
                    <option value="INSPECAO">🔍 Em Inspeção</option>
                    <option value="PRONTO">✅ Pronto p/ Retirada</option>
                    <option value="ENTREGUE">🚗 Entregue</option>
                    <option value="CANCELADA">❌ Cancelada</option>
                  </select>

                  {/* Payment Status Dropdown */}
                  <select
                    value={order.statusPagamento}
                    onChange={e => onUpdatePaymentStatus(order.id, e.target.value as PaymentStatus)}
                    className={`border rounded-lg px-2.5 py-1 text-xs font-bold focus:outline-none cursor-pointer ${
                      order.statusPagamento === 'PAGO'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : order.statusPagamento === 'PAGO_PARCIAL'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : order.statusPagamento === 'CORTESIA'
                        ? 'bg-purple-50 text-purple-800 border-purple-200'
                        : order.statusPagamento === 'TROCA_SERVICOS'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : order.statusPagamento === 'PAGAMENTO_A_PRAZO'
                        ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    <option value="PENDENTE">🔴 Pendente</option>
                    <option value="PAGO">🟢 Pago</option>
                    <option value="PAGAMENTO_A_PRAZO">📅 A Prazo</option>
                    <option value="TROCA_SERVICOS">🔄 Troca Serviços</option>
                    <option value="CORTESIA">🎁 Cortesia</option>
                    <option value="PAGO_PARCIAL">🟡 Parcial</option>
                    <option value="CANCELADO">❌ Cancelado</option>
                  </select>
                </div>
              </div>

              {/* Row Body Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Cliente & Contato:</span>
                  <p className="font-bold text-slate-800 mt-0.5">{order.clientNome}</p>
                  <p className="text-slate-500 font-mono">{order.clientWhatsApp}</p>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Serviços Contratados:</span>
                  <ul className="list-disc list-inside text-slate-700 mt-0.5 space-y-0.5">
                    {(order.servicos || []).map((s, idx) => (
                      <li key={idx} className="truncate">
                        {s.nome} - <strong className="text-blue-700 font-mono">R$ {s.valor}</strong>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between text-slate-500">
                    <span>Abertura:</span>
                    <span>{new Date(order.dataAbertura).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Forma Pgto:</span>
                    <span className="font-bold text-slate-700">{order.formaPagamento || 'PIX'}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Responsável:</span>
                    <span className="font-bold text-slate-800">{order.responsavelLavagem}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-emerald-700 pt-1 border-t border-slate-200">
                    <span>TOTAL OS:</span>
                    <span className="font-mono">R$ {order.valorFinal.toFixed(2)}</span>
                  </div>
                  {order.statusPagamento === 'PAGO_PARCIAL' && (
                    <div className="flex justify-between text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      <span>Recebido em Caixa:</span>
                      <span className="font-mono">R$ {(order.valorPago || 0).toFixed(2)}</span>
                    </div>
                  )}
                  {['PENDENTE', 'PAGAMENTO_A_PRAZO'].includes(order.statusPagamento) && (
                    <div className="flex justify-between text-[10px] font-medium text-slate-500 italic">
                      <span>Caixa:</span>
                      <span>R$ 0,00 (Não entra no Caixa)</span>
                    </div>
                  )}
                  {['TROCA_SERVICOS', 'CORTESIA', 'CANCELADO'].includes(order.statusPagamento) && (
                    <div className="flex justify-between text-[10px] font-medium text-purple-600 italic">
                      <span>Caixa:</span>
                      <span>R$ 0,00 ({order.statusPagamento})</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Row Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenWhatsAppModal(order.id, order.clientId)}
                    className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => onOpenChecklist(order)}
                    className={`px-3 py-1.5 border text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                      order.checklist
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>{order.checklist ? 'Checklist ✓' : 'Fazer Checklist'}</span>
                  </button>

                  <button
                    onClick={() => onViewOSReceipt(order)}
                    className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer hover:bg-blue-100"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Recibo / Imprimir</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditOrder(order)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Editar OS"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Tem certeza que deseja excluir a OS #${order.numeroOS}?`)) {
                        onDeleteOrder(order.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Excluir OS"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
