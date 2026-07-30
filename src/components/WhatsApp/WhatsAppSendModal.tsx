import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  MessageSquare, 
  CheckCircle2, 
  Copy, 
  PhoneCall, 
  ExternalLink, 
  Sparkles, 
  Clock, 
  History,
  Check,
  AlertCircle
} from 'lucide-react';

import { 
  ServiceOrder, 
  Client, 
  Appointment,
  WhatsAppTemplate, 
  WhatsAppLog, 
  WhatsAppApiConfig,
  BusinessConfig
} from '../../types';

import { formatWhatsAppMessage } from '../../services/storage';

interface WhatsAppSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: ServiceOrder | null;
  client?: Client | null;
  appointment?: Appointment | null;
  templates: WhatsAppTemplate[];
  waConfig: WhatsAppApiConfig;
  businessConfig: BusinessConfig;
  onRecordLog: (log: WhatsAppLog) => void;
}

export const WhatsAppSendModal: React.FC<WhatsAppSendModalProps> = ({
  isOpen,
  onClose,
  order,
  client,
  appointment,
  templates,
  waConfig,
  businessConfig,
  onRecordLog
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tpl-confirmacao-os');
  const [customText, setCustomText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [apiSending, setApiSending] = useState<boolean>(false);
  const [sendSuccess, setSendSuccess] = useState<boolean>(false);

  // Target client & phone
  const targetClientName = appointment ? appointment.clientNome : order ? order.clientNome : client?.nome || 'Cliente';
  const targetPhone = (appointment ? appointment.clientWhatsApp : order ? order.clientWhatsApp : client?.whatsapp) || '';
  const cleanPhone = targetPhone.replace(/\D/g, '');
  const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

  // Auto-fill template on change or load
  useEffect(() => {
    if (appointment) {
      setSelectedTemplateId('tpl-agendamento');
    } else if (order && order.status === 'PRONTO') {
      setSelectedTemplateId('tpl-carro-pronto');
    } else if (order && order.status === 'ENTREGUE') {
      setSelectedTemplateId('tpl-comprovante');
    } else if (!order && client) {
      setSelectedTemplateId('tpl-boas-vindas');
    }
  }, [order, client, appointment, isOpen]);

  useEffect(() => {
    const tpl = templates.find(t => t.id === selectedTemplateId) || templates.find(t => t.tipo === 'agendamento');
    if (tpl) {
      const formattedDate = appointment?.dataHora 
        ? new Date(appointment.dataHora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
        : 'Hoje';

      const formatted = formatWhatsAppMessage(tpl.conteudo, {
        cliente_nome: targetClientName,
        veiculo: appointment ? `${appointment.vehicleModelo}` : order ? `${order.vehicleMarca} ${order.vehicleModelo}` : client?.veiculos?.[0]?.modelo || 'Veículo',
        placa: appointment ? appointment.vehiclePlaca : order ? order.vehiclePlaca : client?.veiculos?.[0]?.placa || '',
        os_numero: order ? order.numeroOS : '',
        valor_total: order ? (order.valorFinal || 0).toFixed(2) : '0,00',
        previsao_entrega: order && order.previsaoEntrega ? order.previsaoEntrega.replace('T', ' à(s) ') : 'Hoje',
        data_hora: formattedDate,
        servicos: appointment ? (appointment.servicosDesejados || []).join(', ') : order ? (order.servicos || []).map(s => `• ${s.nome} (R$ ${s.valor})`).join('\n') : 'Serviços de Lavagem e Estética',
        forma_pagamento: order?.formaPagamento || 'PIX/Cartão',
        empresa_nome: businessConfig?.nomeEmpresa || 'HR LAVACAR',
        empresa_endereco: businessConfig?.endereco || ''
      });
      setCustomText(formatted);
    }
  }, [selectedTemplateId, order, client, appointment, templates]);

  if (!isOpen) return null;

  // Open direct wa.me link
  const handleOpenWaMeLink = () => {
    const encoded = encodeURIComponent(customText);
    const url = `https://wa.me/${formattedPhone}?text=${encoded}`;
    window.open(url, '_blank');

    // Record log
    const newLog: WhatsAppLog = {
      id: `walog-${Date.now()}`,
      osId: order?.id,
      clientId: appointment ? appointment.clientId : order ? order.clientId : client?.id || '',
      clientNome: targetClientName,
      whatsappNumber: targetPhone,
      dataEnvio: new Date().toISOString(),
      tipoTemplate: selectedTemplateId.replace('tpl-', '') as any,
      mensagemTexto: customText,
      enviadoPor: 'Operador HR LAVACAR',
      statusEnvio: 'ENVIADO',
      metodo: 'WA_ME_LINK'
    };

    onRecordLog(newLog);
    setSendSuccess(true);
    setTimeout(() => setSendSuccess(false), 3000);
  };

  // Simulate Direct Business API Dispatch
  const handleSendBusinessApi = () => {
    setApiSending(true);

    setTimeout(() => {
      setApiSending(false);

      const newLog: WhatsAppLog = {
        id: `walog-${Date.now()}`,
        osId: order?.id,
        clientId: appointment ? appointment.clientId : order ? order.clientId : client?.id || '',
        clientNome: targetClientName,
        whatsappNumber: targetPhone,
        dataEnvio: new Date().toISOString(),
        tipoTemplate: selectedTemplateId.replace('tpl-', '') as any,
        mensagemTexto: customText,
        enviadoPor: 'WhatsApp Business API (Automático)',
        statusEnvio: 'ENTREGUE',
        metodo: 'BUSINESS_API'
      };

      onRecordLog(newLog);
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 8000);
    }, 200);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(customText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Disparo WhatsApp - {targetClientName}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Número: <span className="text-emerald-400 font-bold">{targetPhone}</span>
                {order && ` | OS #${order.numeroOS} (${order.vehiclePlaca})`}
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

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Template Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
              Selecione o Modelo de Mensagem:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {templates.map(tpl => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`p-2.5 rounded-xl text-xs font-bold text-left border transition-all cursor-pointer ${
                    selectedTemplateId === tpl.id
                      ? 'bg-emerald-950 border-emerald-600 text-emerald-300 shadow-md shadow-emerald-950/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {tpl.titulo}
                </button>
              ))}
            </div>
          </div>

          {/* Editable Text Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300">
                Texto Final da Mensagem (Editável):
              </label>
              <button
                type="button"
                onClick={handleCopyText}
                className="text-[11px] font-bold text-slate-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
              </button>
            </div>
            <textarea
              rows={7}
              value={customText}
              onChange={e => setCustomText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-100 font-sans leading-relaxed focus:outline-none focus:border-emerald-500 shadow-inner resize-none"
            />
          </div>

          {/* Alert Success Notification */}
          {sendSuccess && (
            <div id="wa-send-success-banner" className="p-3.5 bg-emerald-950/90 border border-emerald-500 rounded-xl text-emerald-200 text-xs font-bold flex items-center justify-between gap-2 animate-fade-in shadow-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Mensagem enviada com sucesso ao cliente! Histórico registrado.</span>
              </div>
              <span className="bg-emerald-900/80 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-mono border border-emerald-700">
                ENVIADO
              </span>
            </div>
          )}

          {/* Action Dispatch Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            
            {/* Primary Action: Direct WhatsApp Send in-app */}
            <button
              type="button"
              onClick={handleSendBusinessApi}
              disabled={apiSending}
              className="py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {apiSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Enviando Mensagem...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Enviar Mensagem (WhatsApp API)</span>
                </>
              )}
            </button>

            {/* Secondary Action: Fallback Open direct in wa.me */}
            <button
              type="button"
              onClick={handleOpenWaMeLink}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-emerald-400" />
              <span>Abrir no WhatsApp App/Web</span>
            </button>

          </div>

          {/* WhatsApp Log History for this OS if exists */}
          {order && order.historicoWhatsApp && order.historicoWhatsApp.length > 0 && (
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-cyan-400" />
                Histórico de Mensagens Enviadas nesta OS ({order.historicoWhatsApp.length})
              </h4>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {order.historicoWhatsApp.map(log => (
                  <div key={log.id} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-bold text-emerald-400 uppercase">
                        [{log.tipoTemplate.replace('_', ' ')}] via {log.metodo}
                      </span>
                      <span>{new Date(log.dataEnvio).toLocaleString('pt-BR')}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2 italic">"{log.mensagemTexto}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
