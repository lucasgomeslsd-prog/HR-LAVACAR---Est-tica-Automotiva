import React, { useState } from 'react';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Lock, 
  Unlock, 
  Plus, 
  Minus, 
  CreditCard, 
  Wallet, 
  QrCode,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

import { DailyCashRegister, CashTransaction, PaymentMethod } from '../../types';

interface CashRegisterProps {
  cashRegister: DailyCashRegister;
  onSaveCashRegister: (reg: DailyCashRegister) => void;
}

export const CashRegister: React.FC<CashRegisterProps> = ({
  cashRegister,
  onSaveCashRegister
}) => {
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [txTipo, setTxTipo] = useState<'ENTRADA' | 'SAIDA'>('ENTRADA');
  const [txCategoria, setTxCategoria] = useState<any>('SERVICO');
  const [txDescricao, setTxDescricao] = useState('');
  const [txValor, setTxValor] = useState(0);
  const [txForma, setTxForma] = useState<PaymentMethod>('PIX');

  // Close cash modal state
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [saldoInformado, setSaldoInformado] = useState(0);

  // Calculate cash register stats
  const movimentacoes = cashRegister?.movimentacoes || [];
  const totalEntradas = movimentacoes
    .filter(m => m.tipo === 'ENTRADA')
    .reduce((acc, curr) => acc + (curr.valor || 0), 0);

  const totalSaidas = movimentacoes
    .filter(m => m.tipo === 'SAIDA')
    .reduce((acc, curr) => acc + (curr.valor || 0), 0);

  const saldoAtualCalculado = (cashRegister?.saldoInicial || 0) + totalEntradas - totalSaidas;

  // Breakdown by payment method
  const totalPix = movimentacoes
    .filter(m => m.tipo === 'ENTRADA' && m.formaPagamento === 'PIX')
    .reduce((acc, curr) => acc + (curr.valor || 0), 0);

  const totalCartao = movimentacoes
    .filter(m => m.tipo === 'ENTRADA' && ['CARTAO_CREDITO', 'CARTAO_DEBITO'].includes(m.formaPagamento))
    .reduce((acc, curr) => acc + (curr.valor || 0), 0);

  const totalDinheiro = movimentacoes
    .filter(m => m.tipo === 'ENTRADA' && m.formaPagamento === 'DINHEIRO')
    .reduce((acc, curr) => acc + (curr.valor || 0), 0);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txDescricao.trim() || txValor <= 0) {
      alert('Descrição e valor válido são obrigatórios.');
      return;
    }

    const newTx: CashTransaction = {
      id: `mvt-${Date.now()}`,
      tipo: txTipo,
      categoria: txCategoria,
      descricao: txDescricao,
      valor: txValor,
      formaPagamento: txForma,
      dataHora: new Date().toISOString(),
      usuario: 'Caixa HR LAVACAR'
    };

    const updatedReg: DailyCashRegister = {
      ...cashRegister,
      movimentacoes: [newTx, ...cashRegister.movimentacoes]
    };

    onSaveCashRegister(updatedReg);
    setIsAddTxModalOpen(false);
    setTxDescricao('');
    setTxValor(0);
  };

  const handleCloseCash = (e: React.FormEvent) => {
    e.preventDefault();
    const dif = saldoInformado - saldoAtualCalculado;

    const updatedReg: DailyCashRegister = {
      ...cashRegister,
      status: 'FECHADO',
      saldoFinalCalculado: saldoAtualCalculado,
      saldoFinalInformado: saldoInformado,
      diferenca: dif,
      dataFechamento: new Date().toISOString(),
      usuarioFechamento: 'Gerente Admin'
    };

    onSaveCashRegister(updatedReg);
    setIsCloseModalOpen(false);
  };

  const handleReopenCash = () => {
    const updatedReg: DailyCashRegister = {
      ...cashRegister,
      status: 'ABERTO'
    };
    onSaveCashRegister(updatedReg);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-emerald-400" />
              Caixa do Dia
            </h2>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
              cashRegister.status === 'ABERTO'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/80'
                : 'bg-rose-950 text-rose-300 border border-rose-700/80'
            }`}>
              {cashRegister.status === 'ABERTO' ? '🟢 Caixa Aberto' : '🔴 Caixa Fechado'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Data: {cashRegister.data} | Abertura: R$ {cashRegister.saldoInicial.toFixed(2)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {cashRegister.status === 'ABERTO' ? (
            <>
              <button
                onClick={() => setIsAddTxModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Movimentação</span>
              </button>

              <button
                onClick={() => {
                  setSaldoInformado(saldoAtualCalculado);
                  setIsCloseModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-950 hover:bg-rose-900 border border-rose-700 text-rose-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Fechar Caixa</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleReopenCash}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              <Unlock className="w-4 h-4 text-emerald-400" />
              <span>Reabrir Caixa</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase">Saldo Inicial + Entradas</span>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
            R$ {(cashRegister.saldoInicial + totalEntradas).toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Entradas hoje: R$ {totalEntradas.toFixed(2)}</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase">Total Saídas / Sangria</span>
          <div className="text-2xl font-black text-rose-400 font-mono mt-1">
            R$ {totalSaidas.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Retiradas e despesas de caixa</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase">Saldo em Caixa Atual</span>
          <div className="text-2xl font-black text-cyan-400 font-mono mt-1">
            R$ {saldoAtualCalculado.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Disponível estimado</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase">Resumo por Pagamento</span>
          <div className="text-xs text-slate-300 font-mono mt-1 space-y-1">
            <div className="flex justify-between">
              <span>PIX:</span> <strong className="text-cyan-300">R$ {totalPix.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between">
              <span>Cartão:</span> <strong className="text-blue-300">R$ {totalCartao.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between">
              <span>Dinheiro:</span> <strong className="text-emerald-300">R$ {totalDinheiro.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions History Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
          Movimentações de Caixa do Dia ({movimentacoes.length})
        </h3>

        {movimentacoes.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            Nenhuma movimentação registrada hoje.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {movimentacoes.map(mvt => (
              <div key={mvt.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    mvt.tipo === 'ENTRADA' 
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80' 
                      : 'bg-rose-950 text-rose-400 border border-rose-800/80'
                  }`}>
                    {mvt.tipo === 'ENTRADA' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </div>

                  <div>
                    <p className="font-bold text-slate-200">{mvt.descricao}</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {new Date(mvt.dataHora).toLocaleTimeString('pt-BR')} | Categoria: {mvt.categoria} | Forma: {mvt.formaPagamento}
                    </p>
                  </div>
                </div>

                <div className={`font-mono font-bold text-sm ${
                  mvt.tipo === 'ENTRADA' ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {mvt.tipo === 'ENTRADA' ? '+' : '-'} R$ {mvt.valor.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {isAddTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6">
            <h3 className="text-base font-bold text-slate-100 mb-4">Lançar Movimentação de Caixa</h3>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTxTipo('ENTRADA')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      txTipo === 'ENTRADA'
                        ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    + ENTRADA
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxTipo('SAIDA')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      txTipo === 'SAIDA'
                        ? 'bg-rose-950 border-rose-600 text-rose-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    - SAÍDA / SANGRIA
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descrição *</label>
                <input
                  type="text"
                  required
                  value={txDescricao}
                  onChange={e => setTxDescricao(e.target.value)}
                  placeholder="Ex: Compra de café/pão, Sangria de segurança, Venda de cera"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Valor (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={txValor || ''}
                  onChange={e => setTxValor(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-emerald-400 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Forma de Pagamento</label>
                <select
                  value={txForma}
                  onChange={e => setTxForma(e.target.value as PaymentMethod)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                >
                  <option value="DINHEIRO">Dinheiro</option>
                  <option value="PIX">PIX</option>
                  <option value="CARTAO_DEBITO">Cartão de Débito</option>
                  <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTxModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl"
                >
                  Confirmar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Cash Modal */}
      {isCloseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-100">Fechamento e Reconciliação de Caixa</h3>
            <p className="text-xs text-slate-400">
              Saldo Calculado no Sistema: <strong className="text-cyan-400 font-mono">R$ {saldoAtualCalculado.toFixed(2)}</strong>
            </p>

            <form onSubmit={handleCloseCash} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Valor em Dinheiro Contado na Gaveta (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={saldoInformado}
                  onChange={e => setSaldoInformado(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-emerald-400 font-mono font-bold"
                />
              </div>

              {saldoInformado !== saldoAtualCalculado && (
                <div className="p-3 bg-amber-950/60 border border-amber-700 rounded-xl text-amber-300 text-xs font-semibold">
                  Diferença de Caixa: R$ {(saldoInformado - saldoAtualCalculado).toFixed(2)}
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCloseModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl"
                >
                  Confirmar Fechamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
