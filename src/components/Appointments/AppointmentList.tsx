import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, 
  Plus, 
  Car, 
  User, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  X, 
  Trash2,
  Calendar,
  MessageSquare,
  Edit
} from 'lucide-react';

import { Appointment, Client, Vehicle, VehicleCategory } from '../../types';

interface AppointmentListProps {
  appointments: Appointment[];
  clients: Client[];
  onSaveAppointment: (apt: Appointment) => void;
  onDeleteAppointment: (aptId: string) => void;
  onConvertAppointmentToOS: (apt: Appointment) => void;
  onOpenWhatsAppModal: (osId?: string, clientId?: string, appointment?: Appointment) => void;
}

export const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  clients,
  onSaveAppointment,
  onDeleteAppointment,
  onConvertAppointmentToOS,
  onOpenWhatsAppModal
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const safeClients = clients || [];
  const safeAppointments = appointments || [];

  // Form state
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [dataHora, setDataHora] = useState('');
  const [servicosDesejados, setServicosDesejados] = useState('Lavagem Detalhada + Pretinho');
  const [observacoes, setObservacoes] = useState('');
  const [status, setStatus] = useState<'AGENDADO' | 'CONFIRMADO' | 'CANCELADO'>('CONFIRMADO');
  const [sendWaNotification, setSendWaNotification] = useState(true);

  // Helper to format date for datetime-local input
  const getDefaultDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(0);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Open modal for NEW appointment
  const handleOpenNewModal = () => {
    setEditingAppointment(null);
    const firstClient = safeClients[0];
    setSelectedClientId(firstClient?.id || '');
    setSelectedVehicleId(firstClient?.veiculos?.[0]?.id || '');
    setDataHora(getDefaultDateTime());
    setServicosDesejados('Lavagem Detalhada + Pretinho');
    setObservacoes('');
    setStatus('CONFIRMADO');
    setSendWaNotification(true);
    setIsModalOpen(true);
  };

  // Open modal for EDITING appointment
  const handleOpenEditModal = (apt: Appointment) => {
    setEditingAppointment(apt);
    setSelectedClientId(apt.clientId);
    const client = safeClients.find(c => c.id === apt.clientId);
    const vehicle = client?.veiculos?.find(v => v.placa === apt.vehiclePlaca) || client?.veiculos?.[0];
    setSelectedVehicleId(vehicle?.id || '');
    setDataHora(apt.dataHora ? apt.dataHora.slice(0, 16) : getDefaultDateTime());
    setServicosDesejados((apt.servicosDesejados || []).join(', ') || 'Lavagem Detalhada');
    setObservacoes(apt.observacoes || '');
    setStatus(apt.status === 'CANCELADO' ? 'CANCELADO' : apt.status === 'AGENDADO' ? 'AGENDADO' : 'CONFIRMADO');
    setSendWaNotification(false);
    setIsModalOpen(true);
  };

  // Auto update selected vehicle when selected client changes
  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = safeClients.find(c => c.id === clientId);
    if (client && client.veiculos && client.veiculos.length > 0) {
      setSelectedVehicleId(client.veiculos[0].id);
    } else {
      setSelectedVehicleId('');
    }
  };

  const selectedClient = safeClients.find(c => c.id === selectedClientId);
  const selectedVehicle = selectedClient?.veiculos?.find(v => v.id === selectedVehicleId) || selectedClient?.veiculos?.[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClient) {
      alert('Por favor selecione um cliente válido.');
      return;
    }

    if (!dataHora) {
      alert('Por favor selecione a data e horário.');
      return;
    }

    const vehiclePlaca = selectedVehicle?.placa || editingAppointment?.vehiclePlaca || 'SEM-PLACA';
    const vehicleModelo = selectedVehicle?.modelo || editingAppointment?.vehicleModelo || 'Veículo Padrão';
    const vehicleCategoria = selectedVehicle?.categoria || editingAppointment?.vehicleCategoria || 'sedan';

    const aptToSave: Appointment = {
      id: editingAppointment?.id || `apt-${Date.now()}`,
      clientId: selectedClient.id,
      clientNome: selectedClient.nome,
      clientWhatsApp: selectedClient.whatsapp,
      vehiclePlaca,
      vehicleModelo,
      vehicleCategoria,
      dataHora,
      servicosDesejados: servicosDesejados ? servicosDesejados.split(',').map(s => s.trim()).filter(Boolean) : ['Lavagem'],
      observacoes,
      status
    };

    onSaveAppointment(aptToSave);
    setIsModalOpen(false);

    if (sendWaNotification) {
      onOpenWhatsAppModal(undefined, aptToSave.clientId, aptToSave);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-cyan-400" />
            Agendamentos de Serviços
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Organize os horários e converta agendamentos diretamente em Ordens de Serviço (OS)
          </p>
        </div>

        <button
          onClick={handleOpenNewModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-xl shadow-md active:scale-95 transition-all cursor-pointer self-start sm:self-auto touch-manipulation"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Novo Agendamento</span>
        </button>
      </div>

      {/* Appointments List */}
      {safeAppointments.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 shadow-sm">
          <CalendarDays className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-200">Nenhum agendamento futuro</p>
          <p className="text-xs text-slate-500 mt-1">Cadastre agendamentos para manter a agenda do lava rápido organizada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safeAppointments.map(apt => (
            <div 
              key={apt.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(apt.dataHora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      apt.status === 'CONFIRMADO' 
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : apt.status === 'CONVERTIDO_EM_OS'
                        ? 'bg-blue-950 text-blue-300 border-blue-800'
                        : apt.status === 'CANCELADO'
                        ? 'bg-rose-950 text-rose-300 border-rose-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}>
                      {apt.status === 'CONVERTIDO_EM_OS' ? 'CONVERTIDO OS' : apt.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-100 mt-1">
                    {apt.clientNome}
                  </h3>
                  <p className="text-xs font-mono font-bold text-cyan-300">
                    {apt.vehiclePlaca} - {apt.vehicleModelo}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(apt)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Editar Agendamento"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteAppointment(apt.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Excluir Agendamento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                <span className="font-bold text-slate-400">Serviços Solicitados:</span>
                <p className="text-slate-200">{(apt.servicosDesejados || []).join(', ')}</p>
                {apt.observacoes && (
                  <p className="text-[11px] text-slate-400 italic">Obs: {apt.observacoes}</p>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => onOpenWhatsAppModal(undefined, apt.clientId, apt)}
                  className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-xs active:scale-95"
                  title="Enviar mensagem de agendamento no WhatsApp"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Avisar WA</span>
                </button>

                {apt.status !== 'CONVERTIDO_EM_OS' && (
                  <button
                    onClick={() => onConvertAppointmentToOS(apt)}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
                  >
                    <span>Gerar OS</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Appointment Modal (New & Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-cyan-400" />
                {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cliente *</label>
                <select
                  value={selectedClientId}
                  onChange={e => handleClientChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  {safeClients.length === 0 ? (
                    <option value="">Nenhum cliente cadastrado</option>
                  ) : (
                    safeClients.map(c => (
                      <option key={c.id} value={c.id}>{c.nome} ({c.whatsapp})</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Veículo *</label>
                <select
                  value={selectedVehicleId}
                  onChange={e => setSelectedVehicleId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold focus:outline-none focus:border-cyan-500"
                >
                  {(selectedClient?.veiculos || []).length === 0 ? (
                    <option value="">Nenhum veículo cadastrado para este cliente</option>
                  ) : (
                    (selectedClient?.veiculos || []).map(v => (
                      <option key={v.id} value={v.id}>{v.placa} - {v.modelo} ({v.categoria.toUpperCase()})</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Data e Hora do Agendamento *</label>
                <input
                  type="datetime-local"
                  required
                  value={dataHora}
                  onChange={e => setDataHora(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Serviço Pretendido</label>
                <input
                  type="text"
                  value={servicosDesejados}
                  onChange={e => setServicosDesejados(e.target.value)}
                  placeholder="Ex: Lavagem Detalhada, Polimento, Higienização"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="AGENDADO">AGENDADO</option>
                  <option value="CONFIRMADO">CONFIRMADO</option>
                  <option value="CANCELADO">CANCELADO</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Observações Internas</label>
                <textarea
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  rows={2}
                  placeholder="Ex: Cliente virá às 14h, pediu cuidado especial no estofado"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-950 border border-emerald-900/60 rounded-xl">
                <input
                  type="checkbox"
                  id="sendWaNotification"
                  checked={sendWaNotification}
                  onChange={e => setSendWaNotification(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="sendWaNotification" className="text-xs font-bold text-emerald-400 cursor-pointer flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Enviar mensagem de confirmação no WhatsApp ao salvar</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  {editingAppointment ? 'Salvar Alterações' : 'Criar Agendamento'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
