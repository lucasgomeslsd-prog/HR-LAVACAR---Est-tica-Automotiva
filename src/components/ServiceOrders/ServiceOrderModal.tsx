import React, { useState, useEffect } from 'react';
import { 
  X, 
  ClipboardList, 
  User, 
  Car, 
  Plus, 
  Trash2, 
  DollarSign, 
  Calendar, 
  Check, 
  Clock, 
  MessageSquare,
  Sparkles
} from 'lucide-react';

import { 
  ServiceOrder, 
  Client, 
  Vehicle, 
  ServiceItem, 
  OSStatus, 
  PaymentStatus, 
  PaymentMethod, 
  VehicleCategory 
} from '../../types';

interface ServiceOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: ServiceOrder, openChecklistAfter: boolean) => void;
  clients: Client[];
  servicesCatalog: ServiceItem[];
  editingOrder?: ServiceOrder | null;
  preselectedClient?: Client | null;
  preselectedVehicle?: Vehicle | null;
  onOpenNewClient?: () => void;
}

export const ServiceOrderModal: React.FC<ServiceOrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  clients,
  servicesCatalog,
  editingOrder,
  preselectedClient,
  preselectedVehicle,
  onOpenNewClient
}) => {
  const safeClients = clients || [];
  const safeServicesCatalog = servicesCatalog || [];

  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');

  // Selected Services in OS
  const [selectedServices, setSelectedServices] = useState<
    { serviceId: string; nome: string; valor: number }[]
  >([]);

  const [desconto, setDesconto] = useState<number>(0);
  const [responsavelLavagem, setResponsavelLavagem] = useState<string>('Mateus Lavador');
  const [observacoes, setObservacoes] = useState<string>('');
  const [status, setStatus] = useState<OSStatus>('AGUARDANDO');
  const [statusPagamento, setStatusPagamento] = useState<PaymentStatus>('PENDENTE');
  const [formaPagamento, setFormaPagamento] = useState<PaymentMethod | undefined>('PIX');
  const [previsaoEntrega, setPrevisaoEntrega] = useState<string>('');
  const [openChecklist, setOpenChecklist] = useState<boolean>(true);

  // Sync state whenever modal opens or relevant props change
  useEffect(() => {
    if (!isOpen) return;

    let targetClient: Client | undefined;
    if (editingOrder) {
      targetClient = safeClients.find(c => c.id === editingOrder.clientId);
    } else if (preselectedClient) {
      targetClient = safeClients.find(c => c.id === preselectedClient.id) || preselectedClient;
    } else {
      targetClient = safeClients[0];
    }

    const clientId = targetClient?.id || '';
    setSelectedClientId(clientId);

    let targetVehicle: Vehicle | undefined;
    if (editingOrder) {
      targetVehicle = targetClient?.veiculos?.find(v => v.placa === editingOrder.vehiclePlaca) || targetClient?.veiculos?.[0];
    } else if (preselectedVehicle) {
      targetVehicle = targetClient?.veiculos?.find(v => v.id === preselectedVehicle.id || v.placa === preselectedVehicle.placa) || preselectedVehicle;
    } else {
      targetVehicle = targetClient?.veiculos?.[0];
    }

    setSelectedVehicleId(targetVehicle?.id || '');

    setSelectedServices(editingOrder?.servicos ? [...editingOrder.servicos] : []);
    setDesconto(editingOrder?.desconto || 0);
    setResponsavelLavagem(editingOrder?.responsavelLavagem || 'Mateus Lavador');
    setObservacoes(editingOrder?.observacoes || '');
    setStatus(editingOrder?.status || 'AGUARDANDO');
    setStatusPagamento(editingOrder?.statusPagamento || 'PENDENTE');
    setFormaPagamento(editingOrder?.formaPagamento || 'PIX');

    const now = new Date();
    now.setHours(now.getHours() + 3);
    const defaultPrevisao = now.toISOString().slice(0, 16);
    setPrevisaoEntrega(editingOrder?.previsaoEntrega ? editingOrder.previsaoEntrega.slice(0, 16) : defaultPrevisao);
    setOpenChecklist(!editingOrder);
  }, [isOpen, editingOrder, preselectedClient, preselectedVehicle, clients]);

  const selectedClient = safeClients.find(c => c.id === selectedClientId) || preselectedClient || safeClients[0];
  const selectedVehicle = selectedClient?.veiculos?.find(v => v.id === selectedVehicleId) || selectedClient?.veiculos?.[0];

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = safeClients.find(c => c.id === clientId);
    if (client && client.veiculos && client.veiculos.length > 0) {
      setSelectedVehicleId(client.veiculos[0].id);
    } else {
      setSelectedVehicleId('');
    }
  };

  if (!isOpen) return null;

  // Add service to list with auto-calculated category price
  const handleAddService = (srv: ServiceItem) => {
    const category = selectedVehicle?.categoria || 'sedan';
    const price = srv.precos[category] || srv.precos.sedan;

    setSelectedServices(prev => [
      ...prev,
      {
        serviceId: srv.id,
        nome: srv.nome,
        valor: price
      }
    ]);
  };

  const handleRemoveService = (index: number) => {
    setSelectedServices(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleServicePriceChange = (index: number, newPrice: number) => {
    setSelectedServices(prev =>
      prev.map((s, idx) => (idx === index ? { ...s, valor: newPrice } : s))
    );
  };

  const valorTotal = selectedServices.reduce((acc, curr) => acc + curr.valor, 0);
  const valorFinal = Math.max(0, valorTotal - desconto);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClient || !selectedVehicle) {
      alert('Por favor selecione o cliente e o veículo.');
      return;
    }

    const orderNumber = editingOrder?.numeroOS || `OS-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: ServiceOrder = {
      id: editingOrder?.id || `os-${Date.now()}`,
      numeroOS: orderNumber,
      clientId: selectedClient.id,
      clientNome: selectedClient.nome,
      clientWhatsApp: selectedClient.whatsapp,
      vehiclePlaca: selectedVehicle.placa,
      vehicleModelo: selectedVehicle.modelo,
      vehicleMarca: selectedVehicle.marca,
      vehicleCor: selectedVehicle.cor,
      vehicleCategoria: selectedVehicle.categoria,
      servicos: selectedServices,
      valorTotal,
      desconto,
      valorFinal,
      status,
      statusPagamento,
      formaPagamento: statusPagamento === 'PENDENTE' ? undefined : formaPagamento,
      dataAbertura: editingOrder?.dataAbertura || new Date().toISOString(),
      previsaoEntrega,
      responsavelLavagem,
      observacoes,
      checklist: editingOrder?.checklist,
      historicoWhatsApp: editingOrder?.historicoWhatsApp || []
    };

    onSave(newOrder, openChecklist);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-700/60 flex items-center justify-center text-cyan-400">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {editingOrder ? `Editar OS #${editingOrder.numeroOS}` : 'Nova Ordem de Serviço (OS)'}
              </h3>
              <p className="text-xs text-slate-400">
                Abertura de serviço, seleção de itens e direcionamento para esteira
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Client & Vehicle Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Cliente *
                </label>
                {onOpenNewClient && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenNewClient();
                    }}
                    className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Novo Cliente</span>
                  </button>
                )}
              </div>

              {safeClients.length === 0 ? (
                <div className="p-3 bg-amber-950/60 border border-amber-800/80 rounded-xl space-y-2">
                  <p className="text-xs text-amber-200 font-medium">
                    Nenhum cliente cadastrado no momento.
                  </p>
                  {onOpenNewClient && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenNewClient();
                      }}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-extrabold text-xs rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Cadastrar Cliente Agora</span>
                    </button>
                  )}
                </div>
              ) : (
                <select
                  value={selectedClientId}
                  onChange={e => handleClientChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-semibold"
                >
                  {safeClients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nome} ({c.whatsapp})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Veículo do Cliente *
              </label>
              {!(selectedClient?.veiculos && selectedClient.veiculos.length > 0) ? (
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400">
                  Nenhum veículo vinculado
                </div>
              ) : (
                <select
                  value={selectedVehicleId}
                  onChange={e => setSelectedVehicleId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-bold focus:outline-none focus:border-cyan-500"
                >
                  {(selectedClient?.veiculos || []).map(v => (
                    <option key={v.id} value={v.id}>
                      {v.placa} - {v.modelo} ({v.categoria.toUpperCase()})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Catalog Services Selection */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Catálogo de Serviços (Clique para Adicionar)
            </h4>

            <div className="flex flex-wrap gap-2">
              {servicesCatalog.map(srv => {
                const category = selectedVehicle?.categoria || 'sedan';
                const price = srv.precos[category] || srv.precos.sedan;

                return (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => handleAddService(srv)}
                    className="px-3 py-1.5 bg-slate-950 hover:bg-cyan-950/80 border border-slate-800 hover:border-cyan-700/60 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{srv.nome}</span>
                    <span className="font-mono text-cyan-300 font-bold ml-1">R$ {price}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Services Table */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Serviços Selecionados na OS ({selectedServices.length}):
            </label>

            {selectedServices.length === 0 ? (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center text-slate-500 text-xs">
                Nenhum serviço adicionado ainda. Clique no catálogo acima.
              </div>
            ) : (
              <div className="space-y-2">
                {selectedServices.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <span className="text-xs font-bold text-slate-100">{item.nome}</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 px-2 py-1 rounded-lg">
                        <span className="text-xs text-slate-400 font-mono">R$</span>
                        <input
                          type="number"
                          value={item.valor}
                          onChange={e => handleServicePriceChange(idx, Number(e.target.value))}
                          className="w-20 bg-transparent text-xs text-cyan-300 font-mono font-bold focus:outline-none text-right"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveService(idx)}
                        className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing & Discounts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Subtotal</label>
              <div className="text-lg font-black text-slate-300 font-mono">
                R$ {valorTotal.toFixed(2)}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Desconto (R$)</label>
              <input
                type="number"
                min="0"
                value={desconto}
                onChange={e => setDesconto(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-sm text-cyan-300 font-mono font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Valor Final</label>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                R$ {valorFinal.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Execution Details & Delivery */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Lavador / Detalhador Responsável
              </label>
              <input
                type="text"
                value={responsavelLavagem}
                onChange={e => setResponsavelLavagem(e.target.value)}
                placeholder="Ex: Mateus Lavador"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Previsão de Entrega (Data & Hora)
              </label>
              <input
                type="datetime-local"
                value={previsaoEntrega}
                onChange={e => setPrevisaoEntrega(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Payment & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Status na Esteira
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as OSStatus)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold focus:outline-none focus:border-cyan-500"
              >
                <option value="AGUARDANDO">⏳ Aguardando Início</option>
                <option value="LAVAGEM">🧼 Em Lavagem</option>
                <option value="POLIMENTO">✨ Em Polimento</option>
                <option value="INSPECAO">🔍 Em Inspeção</option>
                <option value="PRONTO">✅ Pronto para Retirada</option>
                <option value="ENTREGUE">🚗 Entregue</option>
                <option value="CANCELADA">❌ Cancelada</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Status do Pagamento
              </label>
              <select
                value={statusPagamento}
                onChange={e => setStatusPagamento(e.target.value as PaymentStatus)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold focus:outline-none focus:border-cyan-500"
              >
                <option value="PENDENTE">🔴 Pendente</option>
                <option value="PAGO">🟢 Pago Integralmente</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Forma de Pagamento
              </label>
              <select
                value={formaPagamento}
                onChange={e => setFormaPagamento(e.target.value as PaymentMethod)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="PIX">PIX</option>
                <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                <option value="CARTAO_DEBITO">Cartão de Débito</option>
                <option value="DINHEIRO">Dinheiro</option>
              </select>
            </div>
          </div>

          {/* Open checklist checkbox option */}
          {!editingOrder && (
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center gap-2">
              <input
                type="checkbox"
                id="chk-auto-open"
                checked={openChecklist}
                onChange={e => setOpenChecklist(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 bg-slate-900 border-slate-700 cursor-pointer"
              />
              <label htmlFor="chk-auto-open" className="text-xs font-bold text-slate-200 cursor-pointer">
                Abrir tela de Checklist de Entrada do veículo imediatamente após salvar
              </label>
            </div>
          )}

          {/* Actions */}
          <div className="sticky bottom-0 bg-slate-900 border-t border-slate-800 pt-4 pb-5 -mx-6 -mb-6 px-6 rounded-b-2xl flex items-center justify-end gap-3 z-20 shadow-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
            >
              {editingOrder ? 'Salvar Alterações' : 'Criar Ordem de Serviço'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
