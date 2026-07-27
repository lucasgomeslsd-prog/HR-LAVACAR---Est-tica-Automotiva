import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Car, 
  MessageSquare, 
  Edit, 
  Trash2, 
  PlusCircle, 
  Phone, 
  ChevronRight,
  Send
} from 'lucide-react';
import { Client, Vehicle, ServiceOrder } from '../../types';

interface ClientListProps {
  clients: Client[];
  orders?: ServiceOrder[];
  onOpenNewClient: () => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
  onOpenNewOSForVehicle?: (client: Client, vehicle: Vehicle) => void;
  onOpenWhatsAppModal?: (osId?: string, clientId?: string) => void;
}

export const ClientList: React.FC<ClientListProps> = ({
  clients = [],
  orders = [],
  onOpenNewClient,
  onEditClient,
  onDeleteClient,
  onOpenWhatsAppModal = (_osId?: string, _clientId?: string) => {},
  onOpenNewOSForVehicle = (_client?: Client, _vehicle?: Vehicle) => {}
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const safeClients = clients || [];
  const safeOrders = orders || [];

  const filteredClients = safeClients.filter(c => {
    const query = searchQuery.toLowerCase();
    const matchName = c.nome ? c.nome.toLowerCase().includes(query) : false;
    const matchWa = c.whatsapp ? c.whatsapp.includes(query) : false;
    const matchPlate = (c.veiculos || []).some(v => 
      (v.placa && v.placa.toLowerCase().includes(query)) || 
      (v.modelo && v.modelo.toLowerCase().includes(query))
    );
    return matchName || matchWa || matchPlate;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Gestão de Clientes & Veículos
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {safeClients.length} cliente(s) e {safeClients.reduce((acc, c) => acc + (c.veiculos ? c.veiculos.length : 0), 0)} veículo(s) cadastrados
          </p>
        </div>

        <button
          onClick={onOpenNewClient}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4 stroke-[2.5]" />
          <span>Novo Cliente</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Buscar por nome, WhatsApp, modelo do carro ou placa..."
          className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-2xs"
        />
      </div>

      {/* Roster Grid */}
      {filteredClients.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-xs">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-800">Nenhum cliente encontrado</p>
          <p className="text-xs text-slate-500 mt-1">Tente ajustar sua busca ou cadastre um novo cliente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredClients.map(client => {
            const clientOrders = safeOrders.filter(o => o.clientId === client.id);

            return (
              <div 
                key={client.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                {/* Top Info */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {client.nome}
                    </h3>
                    <p className="text-xs text-blue-700 font-mono font-semibold flex items-center gap-1 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-blue-600" /> {client.whatsapp}
                    </p>
                    {client.cpfCnpj && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        CPF/CNPJ: {client.cpfCnpj}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {/* 1-Click WhatsApp Welcome */}
                    <button
                      onClick={() => onOpenWhatsAppModal(undefined, client.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                      title="Enviar Mensagem de Boas-Vindas no WhatsApp"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">WA</span>
                    </button>

                    <button
                      onClick={() => onEditClient(client)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Editar Cliente"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Tem certeza que deseja excluir o cliente ${client.nome}?`)) {
                          onDeleteClient(client.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Excluir Cliente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Linked Vehicles list */}
                <div className="space-y-2 pt-3 border-t border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Car className="w-3.5 h-3.5 text-blue-600" />
                    Veículos ({client.veiculos.length})
                  </span>

                  <div className="grid grid-cols-1 gap-2">
                    {client.veiculos.map(veh => (
                      <div 
                        key={veh.id}
                        className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs font-mono font-bold text-blue-700">
                            {veh.placa}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-800">
                              {veh.modelo} <span className="text-[11px] font-normal text-slate-500">({veh.cor})</span>
                            </p>
                            <p className="text-[10px] text-slate-400 uppercase">
                              Categoria: {veh.categoria}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => onOpenNewOSForVehicle(client, veh)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                          title="Abrir Nova Ordem de Serviço para este veículo"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Criar OS</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer History Stats */}
                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-200">
                  <span>Cadastrado em: {client.dataCadastro}</span>
                  <span className="text-slate-700 font-semibold">{clientOrders.length} OS realizadas</span>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
