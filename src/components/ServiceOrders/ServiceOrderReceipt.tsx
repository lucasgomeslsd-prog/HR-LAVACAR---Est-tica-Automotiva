import React from 'react';
import { 
  X, 
  Printer, 
  Send, 
  CheckCircle2, 
  Car, 
  User, 
  QrCode, 
  Sparkles,
  FileText
} from 'lucide-react';
import { ServiceOrder, BusinessConfig } from '../../types';

interface ServiceOrderReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  order: ServiceOrder;
  businessConfig: BusinessConfig;
  onSendWhatsApp: () => void;
}

export const ServiceOrderReceipt: React.FC<ServiceOrderReceiptProps> = ({
  isOpen,
  onClose,
  order,
  businessConfig,
  onSendWhatsApp
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Printable Area */}
        <div className="p-6 bg-slate-950 text-slate-100 print:bg-white print:text-black print:p-0">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 print:border-black">
            <div>
              <h2 className="text-xl font-black text-white tracking-wider print:text-black">
                HR LAVACAR
              </h2>
              <p className="text-xs text-slate-400 print:text-slate-600 font-semibold">
                Estética Automotiva & Lava Rápido
              </p>
              <p className="text-[10px] text-slate-500 print:text-slate-600 mt-1">
                CNPJ: {businessConfig?.cnpj || ''} | {businessConfig?.telefone || ''}
              </p>
              <p className="text-[10px] text-slate-500 print:text-slate-600">
                {businessConfig?.endereco || ''}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono font-bold text-cyan-400 print:text-black bg-cyan-950/80 print:bg-slate-100 px-3 py-1 rounded-lg border border-cyan-800 print:border-black">
                {order.numeroOS}
              </span>
              <p className="text-[10px] text-slate-400 print:text-slate-600 mt-1">
                Data: {new Date(order.dataAbertura).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          {/* Client & Vehicle Card */}
          <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-800/80 print:border-black text-xs">
            <div>
              <p className="text-[10px] font-bold text-cyan-400 print:text-slate-600 uppercase">
                Cliente:
              </p>
              <p className="font-bold text-slate-100 print:text-black">{order.clientNome}</p>
              <p className="text-slate-400 print:text-slate-600">{order.clientWhatsApp}</p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-cyan-400 print:text-slate-600 uppercase">
                Veículo:
              </p>
              <p className="font-bold text-cyan-300 print:text-black font-mono">
                {order.vehiclePlaca} - {order.vehicleModelo}
              </p>
              <p className="text-slate-400 print:text-slate-600">
                {order.vehicleMarca} ({order.vehicleCor}) - {order.vehicleCategoria.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-4 space-y-2">
            <p className="text-xs font-bold text-slate-300 print:text-black uppercase tracking-wider">
              Serviços Executados:
            </p>

            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 print:border-black text-slate-400 print:text-slate-700">
                  <th className="py-2">Descrição</th>
                  <th className="py-2 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 print:divide-slate-300">
                {(order?.servicos || []).map((srv, idx) => (
                  <tr key={idx}>
                    <td className="py-2 text-slate-200 print:text-black font-medium">{srv.nome}</td>
                    <td className="py-2 text-right font-mono font-bold text-slate-100 print:text-black">
                      R$ {srv.valor.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Values Totals */}
          <div className="p-4 bg-slate-900 print:bg-slate-100 rounded-xl border border-slate-800 print:border-black space-y-1 text-xs">
            <div className="flex justify-between text-slate-400 print:text-slate-700">
              <span>Subtotal:</span>
              <span className="font-mono">R$ {order.valorTotal.toFixed(2)}</span>
            </div>
            {order.desconto > 0 && (
              <div className="flex justify-between text-rose-400 print:text-slate-700">
                <span>Desconto:</span>
                <span className="font-mono">- R$ {order.desconto.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-emerald-400 print:text-black pt-2 border-t border-slate-800 print:border-black">
              <span>VALOR TOTAL:</span>
              <span className="font-mono">R$ {order.valorFinal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 print:text-slate-700 pt-1">
              <span>Pagamento:</span>
              <span className="font-bold text-slate-200 print:text-black uppercase">
                {order.statusPagamento === 'PAGO' 
                  ? `PAGO (${order.formaPagamento || 'PIX'})` 
                  : 'PENDENTE'}
              </span>
            </div>
          </div>

          {/* PIX Key Box */}
          <div className="mt-4 p-3 bg-cyan-950/40 print:bg-white border border-cyan-800/40 print:border-black rounded-xl flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-cyan-300 print:text-black flex items-center gap-1">
                <QrCode className="w-4 h-4 text-cyan-400 print:text-black" /> Chave PIX da Empresa:
              </p>
              <p className="font-mono text-slate-200 print:text-black mt-0.5">{businessConfig.chavePix}</p>
            </div>
            <span className="text-[10px] text-slate-400 print:text-slate-600 font-bold uppercase">
              HR LAVACAR
            </span>
          </div>

          <div className="mt-6 text-center text-[10px] text-slate-500 print:text-slate-600 italic">
            "Agradecemos a preferência! HR LAVACAR - Qualidade e Brilho Impecável."
          </div>

        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 print:hidden sticky bottom-0 z-20 shadow-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Fechar
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onSendWhatsApp}
              className="px-4 py-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar no WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Salvar PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
