import React, { useState } from 'react';
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
  MessageSquare
} from 'lucide-react';

import { Appointment, Client, Vehicle, VehicleCategory } from '../../types';

interface AppointmentListProps {
  appointments: Appointment[];
  clients: Client[];
  onSaveAppointment: (apt: Appointment) => void;
  onDeleteAppointment: (aptId: string) => void;
  onConvertAppointmentToOS: (apt: Appointment) => void;
  onOpenWhatsAppModal: (osId?: string, clientId?: string) => void;
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

  const safeClients = clients || [];
  const safeAppointments = appointments || [];

  // New Appointment form state
  const [selectedClientId, setSelectedClientId] = useState(safeClients[0]?.id || '');
  const selectedClient = safeClients.find(c => c.id === selectedClientId);

  const [selectedVehicleId, setSelectedVehicleId] = useState(selectedClient?.veiculos?.[0]?.id || '');
  const selectedVehicle = selectedClient?.veiculos?.find(v => v.id === selectedVehicleId);

  const [dataHora, setDataHora] = useState('');
  const [servicosDesejados, setServicosDesejados] = useState('Lavagem Detalhada + Pretinho');
  const [observacoes, setObservacoes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClient || !selectedVehicle || !dataHora) {
      alert('Por favor preencha todos os campos obrigatórios.');
      return;
    }

    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      clientId: selectedClient.id,
      clientNome: selectedClient.nome,
      clientWhatsApp: selectedClient.whatsapp,
      vehiclePlaca: selectedVehicle.placa,
      vehicleModelo: selectedVehicle.modelo,
      vehicleCategoria: selectedVehicle.categoria,
      dataHora,
      servicosDesejados: [servicosDesejados],
      observacoes,
      status: 'CONFIRMADO'
    };

    onSaveAppointment(newApt);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-blue-600" />
            Agendamentos de Serviços
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Organize os horários e converta agendamentos diretamente em Ordens de Serviço (OS)
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Novo Agendamento</span>
        </button>
      </div>

      {/* Appointments List */}
      {safeAppointments.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-xs">
          <CalendarDays className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-800">Nenhum agendamento futuro</p>
          <p className="text-xs text-slate-500 mt-1">Cadastre agendamentos para manter a agenda do lava rápido organizada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safeAppointments.map(apt => (
            <div 
              key={apt.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(apt.dataHora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {apt.clientNome}
                  </h3>
                  <p className="text-xs font-mono font-bold text-blue-700">
                    {apt.vehiclePlaca} - {apt.vehicleModelo}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onDeleteAppointment(apt.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                <span className="font-bold text-slate-500">Serviços Solicitados:</span>
                <p>{(apt.servicosDesejados || []).join(', ')}</p>
                {apt.observacoes && (
                  <p className="text-[11px] text-slate-500 italic">Obs: {apt.observacoes}</p>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => onOpenWhatsAppModal(undefined, apt.clientId)}
                  className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Avisar WA</span>
                </button>

                <button
                  onClick={() => onConvertAppointmentToOS(apt)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                >
                  <span>Gerar OS</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* New Appointment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden p-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-600" />
                Novo Agendamento
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cliente *</label>
                <select
                  value={selectedClientId}
                  onChange={e => setSelectedClientId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                >
                  {safeClients.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Veículo *</label>
                <select
                  value={selectedVehicleId}
                  onChange={e => setSelectedVehicleId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none"
                >
                  {(selectedClient?.veiculos || []).map(v => (
                    <option key={v.id} value={v.id}>{v.placa} - {v.modelo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Data e Hora *</label>
                <input
                  type="datetime-local"
                  required
                  value={dataHora}
                  onChange={e => setDataHora(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Serviço Pretendido</label>
                <input
                  type="text"
                  value={servicosDesejados}
                  onChange={e => setServicosDesejados(e.target.value)}
                  placeholder="Ex: Lavagem Completa + Higienização"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-2xs"
                >
                  Salvar Agendamento
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
