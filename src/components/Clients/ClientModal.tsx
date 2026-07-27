import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Car, User, Phone, Mail, FileText, Check } from 'lucide-react';
import { Client, Vehicle, VehicleCategory } from '../../types';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Client, sendWelcomeWhatsApp: boolean) => void;
  editingClient?: Client | null;
}

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingClient
}) => {
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [sendWelcome, setSendWelcome] = useState(true);
  const [veiculos, setVeiculos] = useState<Vehicle[]>([]);

  useEffect(() => {
    if (isOpen) {
      setNome(editingClient?.nome || '');
      setWhatsapp(editingClient?.whatsapp || '');
      setEmail(editingClient?.email || '');
      setCpfCnpj(editingClient?.cpfCnpj || '');
      setObservacoes(editingClient?.observacoes || '');
      setSendWelcome(!editingClient);
      setVeiculos(
        editingClient?.veiculos && editingClient.veiculos.length > 0
          ? editingClient.veiculos
          : [
              {
                id: `vei-${Date.now()}`,
                placa: '',
                modelo: '',
                marca: '',
                cor: '',
                categoria: 'sedan',
                ano: ''
              }
            ]
      );
    }
  }, [isOpen, editingClient]);

  if (!isOpen) return null;

  const handleAddVehicle = () => {
    setVeiculos(prev => [
      ...prev,
      {
        id: `vei-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        placa: '',
        modelo: '',
        marca: '',
        cor: '',
        categoria: 'sedan',
        ano: ''
      }
    ]);
  };

  const handleRemoveVehicle = (id: string) => {
    if (veiculos.length <= 1) {
      alert('O cliente deve ter pelo menos 1 veículo cadastrado.');
      return;
    }
    setVeiculos(prev => prev.filter(v => v.id !== id));
  };

  const handleVehicleChange = (id: string, field: keyof Vehicle, value: any) => {
    setVeiculos(prev =>
      prev.map(v => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !whatsapp.trim()) {
      alert('Nome e WhatsApp são obrigatórios.');
      return;
    }

    // Validate vehicles
    for (const v of veiculos) {
      if (!v.placa.trim() || !v.modelo.trim()) {
        alert('Por favor preencha a placa e modelo de todos os veículos.');
        return;
      }
    }

    // Clean phone number format
    const cleanedWa = whatsapp.replace(/\D/g, '');
    const finalWa = cleanedWa.startsWith('55') ? cleanedWa : `55${cleanedWa}`;

    const newClient: Client = {
      id: editingClient?.id || `cli-${Date.now()}`,
      nome: nome.trim(),
      whatsapp: finalWa,
      email: email.trim(),
      cpfCnpj: cpfCnpj.trim(),
      dataCadastro: editingClient?.dataCadastro || new Date().toISOString().split('T')[0],
      observacoes: observacoes.trim(),
      veiculos: veiculos.map(v => ({
        ...v,
        placa: v.placa.toUpperCase().trim()
      }))
    };

    onSave(newClient, sendWelcome);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-700/60 flex items-center justify-center text-cyan-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {editingClient ? 'Editar Cliente & Veículos' : 'Novo Cadastro de Cliente'}
              </h3>
              <p className="text-xs text-slate-400">
                Cadastre o cliente e vincule seus veículos para ordens de serviço
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Client Personal Info */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4" /> Dados Pessoais do Cliente
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Ex: Carlos Eduardo Silva"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  WhatsApp (com DDD) *
                </label>
                <input
                  type="text"
                  required
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  placeholder="Ex: 11987654321"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="cliente@email.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  CPF / CNPJ
                </label>
                <input
                  type="text"
                  value={cpfCnpj}
                  onChange={e => setCpfCnpj(e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Linked Vehicles Section */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Car className="w-4 h-4" /> Veículos Vinculados ({veiculos.length})
              </h4>
              <button
                type="button"
                onClick={handleAddVehicle}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-800/60 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Outro Veículo
              </button>
            </div>

            {veiculos.map((v, index) => (
              <div key={v.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl relative space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">
                    Veículo #{index + 1}
                  </span>
                  {veiculos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveVehicle(v.id)}
                      className="text-rose-400 hover:text-rose-300 p-1 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Placa *
                    </label>
                    <input
                      type="text"
                      required
                      value={v.placa}
                      onChange={e => handleVehicleChange(v.id, 'placa', e.target.value)}
                      placeholder="ABC1D23"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-cyan-300 font-mono font-bold uppercase placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Modelo / Versão *
                    </label>
                    <input
                      type="text"
                      required
                      value={v.modelo}
                      onChange={e => handleVehicleChange(v.id, 'modelo', e.target.value)}
                      placeholder="Civic 2.0"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Marca / Fabricante
                    </label>
                    <input
                      type="text"
                      value={v.marca}
                      onChange={e => handleVehicleChange(v.id, 'marca', e.target.value)}
                      placeholder="Honda"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Cor
                    </label>
                    <input
                      type="text"
                      value={v.cor}
                      onChange={e => handleVehicleChange(v.id, 'cor', e.target.value)}
                      placeholder="Preto Pérola"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Categoria (Tamanho)
                    </label>
                    <select
                      value={v.categoria}
                      onChange={e => handleVehicleChange(v.id, 'categoria', e.target.value as VehicleCategory)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="hatch">Hatch (Pequeno)</option>
                      <option value="sedan">Sedan (Médio)</option>
                      <option value="suv">SUV / Picape (Grande)</option>
                      <option value="moto">Motocicleta</option>
                      <option value="utilitario">Utilitário / Van</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Ano
                    </label>
                    <input
                      type="text"
                      value={v.ano || ''}
                      onChange={e => handleVehicleChange(v.id, 'ano', e.target.value)}
                      placeholder="2023"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Observações Internas do Cliente
            </label>
            <textarea
              rows={2}
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              placeholder="Preferências do cliente, cuidados especiais..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          {/* Welcome WhatsApp checkbox */}
          {!editingClient && (
            <div className="bg-emerald-950/40 border border-emerald-800/50 p-3.5 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="chk-welcome-wa"
                  checked={sendWelcome}
                  onChange={e => setSendWelcome(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-700 cursor-pointer"
                />
                <label htmlFor="chk-welcome-wa" className="text-xs font-bold text-emerald-200 cursor-pointer">
                  Enviar Mensagem WhatsApp de Boas-Vindas em 1 clique
                </label>
              </div>
              <span className="text-[10px] text-emerald-400/80 bg-emerald-900/60 px-2 py-0.5 rounded font-mono">
                WhatsApp API
              </span>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
            >
              {editingClient ? 'Salvar Alterações' : 'Cadastrar Cliente'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
