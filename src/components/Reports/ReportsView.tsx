import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Sparkles, 
  Car, 
  Users, 
  CheckCircle2, 
  DollarSign, 
  Award,
  PieChart
} from 'lucide-react';
import { ServiceOrder } from '../../types';

interface ReportsViewProps {
  orders: ServiceOrder[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ orders }) => {
  const safeOrders = orders || [];
  const completedOrders = safeOrders.filter(o => o.status === 'ENTREGUE' || o.status === 'PRONTO');

  const totalReceita = completedOrders.reduce((acc, curr) => acc + (curr.valorFinal || 0), 0);
  const ticketMedio = completedOrders.length > 0 ? totalReceita / completedOrders.length : 0;

  // Most requested services
  const servicePopularity: Record<string, { count: number; receita: number }> = {};
  completedOrders.forEach(o => {
    (o.servicos || []).forEach(s => {
      if (!servicePopularity[s.nome]) {
        servicePopularity[s.nome] = { count: 0, receita: 0 };
      }
      servicePopularity[s.nome].count += 1;
      servicePopularity[s.nome].receita += (s.valor || 0);
    });
  });

  const sortedServices = Object.entries(servicePopularity).sort((a, b) => b[1].count - a[1].count);

  // Category distribution
  const categoryCounts: Record<string, number> = {};
  completedOrders.forEach(o => {
    const cat = (o.vehicleCategoria || 'Passeio').toUpperCase();
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
        <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-cyan-400" />
          Relatórios Gerenciais & Desempenho Operacional
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Estatísticas consolidadas de atendimentos, ticket médio e serviços mais rentáveis do HR LAVACAR
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase">Faturamento Consolidado</span>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
            R$ {totalReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Base: OSs concluídas e em entrega</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase">Ticket Médio por Veículo</span>
          <div className="text-2xl font-black text-cyan-400 font-mono mt-1">
            R$ {ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Média gasta por cliente em cada lavagem</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase">Atendimentos Concluídos</span>
          <div className="text-2xl font-black text-slate-100 font-mono mt-1">
            {completedOrders.length} veículos
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Volume do período atual</p>
        </div>
      </div>

      {/* Services Ranking & Vehicle Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Most Popular Services */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Serviços Mais Solicitados
          </h3>

          <div className="space-y-3">
            {sortedServices.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">Sem dados suficientes.</p>
            ) : (
              sortedServices.map(([sName, stat], idx) => (
                <div key={sName} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 font-bold font-mono text-xs flex items-center justify-center border border-cyan-800">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-200">{sName}</p>
                      <p className="text-[10px] text-slate-500">{stat.count} execuções</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    R$ {stat.receita.toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Vehicle Category Distribution */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Car className="w-5 h-5 text-cyan-400" />
            Distribuição por Categoria de Veículo
          </h3>

          <div className="space-y-3">
            {Object.entries(categoryCounts).length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">Sem dados suficientes.</p>
            ) : (
              Object.entries(categoryCounts).map(([cat, count]) => {
                const pct = Math.round((count / completedOrders.length) * 100);

                return (
                  <div key={cat} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-200">{cat}</span>
                      <span className="text-cyan-400 font-mono">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
