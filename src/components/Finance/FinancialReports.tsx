import React, { useState } from 'react';
import { 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Award, 
  BarChart2, 
  Sparkles,
  Calendar
} from 'lucide-react';
import { ServiceOrder, BusinessConfig } from '../../types';

interface FinancialReportsProps {
  orders: ServiceOrder[];
  businessConfig: BusinessConfig;
}

export const FinancialReports: React.FC<FinancialReportsProps> = ({
  orders,
  businessConfig
}) => {
  const [commissionPercent, setCommissionPercent] = useState(
    businessConfig?.comissaoPadraoPercentual || 15
  );

  // Completed orders & Financial receipts
  const safeOrders = orders || [];
  
  // Received amounts (PAGO + PAGO_PARCIAL)
  const receivedOrders = safeOrders.filter(o => o.status !== 'CANCELADA' && (o.statusPagamento === 'PAGO' || o.statusPagamento === 'PAGO_PARCIAL'));

  const totalFaturamento = receivedOrders.reduce((acc, curr) => {
    if (curr.statusPagamento === 'PAGO') {
      return acc + (curr.valorPago !== undefined && curr.valorPago > 0 ? curr.valorPago : (curr.valorFinal || 0));
    }
    if (curr.statusPagamento === 'PAGO_PARCIAL') {
      return acc + (curr.valorPago || 0);
    }
    return acc;
  }, 0);

  // Group revenue by operator/washer
  const operatorStats: Record<string, { totalOs: number; totalFaturamento: number; comissao: number }> = {};

  receivedOrders.forEach(o => {
    const op = o.responsavelLavagem || 'Outro Operador';
    if (!operatorStats[op]) {
      operatorStats[op] = { totalOs: 0, totalFaturamento: 0, comissao: 0 };
    }
    const orderVal = o.statusPagamento === 'PAGO_PARCIAL' 
      ? (o.valorPago || 0) 
      : (o.valorPago !== undefined && o.valorPago > 0 ? o.valorPago : o.valorFinal);

    operatorStats[op].totalOs += 1;
    operatorStats[op].totalFaturamento += orderVal;
    operatorStats[op].comissao += orderVal * (commissionPercent / 100);
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <PieChart className="w-6 h-6 text-cyan-400" />
            DRE & Relatórios Financeiros
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Análise de receitas, comissões de lavadores e desempenho financeiro do HR LAVACAR
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
          <Award className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-300">Comissão de Lavadores:</span>
          <input
            type="number"
            value={commissionPercent}
            onChange={e => setCommissionPercent(Number(e.target.value))}
            className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-cyan-300 font-bold font-mono text-center"
          />
          <span className="text-xs text-slate-400">%</span>
        </div>
      </div>

      {/* Overview Metric Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase">Faturamento Bruto Liquidado</span>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
            R$ {totalFaturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{receivedOrders.length} OSs com recebimento</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase">Total Comissões Equipe ({commissionPercent}%)</span>
          <div className="text-2xl font-black text-cyan-400 font-mono mt-1">
            R$ {(totalFaturamento * (commissionPercent / 100)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Provisionado para lavadores e detalhadores</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase">Receita Bruta Retida Empresa</span>
          <div className="text-2xl font-black text-blue-400 font-mono mt-1">
            R$ {(totalFaturamento * (1 - commissionPercent / 100)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Após dedução de comissões operacionais</p>
        </div>
      </div>

      {/* Operator Commissions Breakdown Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          Relatório de Produtividade & Comissão por Lavador / Detalhador
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3">Profissional / Lavador</th>
                <th className="py-2.5 px-3 text-center">OSs Executadas</th>
                <th className="py-2.5 px-3 text-right">Faturamento Gerado</th>
                <th className="py-2.5 px-3 text-right">Comissão Devida ({commissionPercent}%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {Object.keys(operatorStats).length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-500">
                    Nenhum registro no período.
                  </td>
                </tr>
              ) : (
                Object.entries(operatorStats).map(([opName, stat]) => (
                  <tr key={opName} className="hover:bg-slate-950/40">
                    <td className="py-3 px-3 font-bold text-slate-200">{opName}</td>
                    <td className="py-3 px-3 text-center font-mono text-cyan-300 font-bold">{stat.totalOs}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-200">
                      R$ {stat.totalFaturamento.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                      R$ {stat.comissao.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
