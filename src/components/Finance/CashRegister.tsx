import React, { useState } from 'react';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Lock, 
  Unlock, 
  Plus, 
  CreditCard, 
  Wallet, 
  QrCode,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Edit,
  Trash2,
  X,
  History,
  Play,
  Eye,
  Calendar,
  Sparkles
} from 'lucide-react';

import { DailyCashRegister, CashTransaction, PaymentMethod } from '../../types';
import { StorageService } from '../../services/storage';

interface CashRegisterProps {
  cashRegister: DailyCashRegister;
  onSaveCashRegister: (reg: DailyCashRegister, closedRecord?: DailyCashRegister) => void;
}

export const CashRegister: React.FC<CashRegisterProps> = ({
  cashRegister,
  onSaveCashRegister
}) => {
  // Navigation tabs: 'caixa_atual' | 'historico'
  const [activeTab, setActiveTab] = useState<'caixa_atual' | 'historico'>('caixa_atual');

  // Transaction modals
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<CashTransaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<CashTransaction | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [txTipo, setTxTipo] = useState<'ENTRADA' | 'SAIDA'>('ENTRADA');
  const [txCategoria, setTxCategoria] = useState<any>('SERVICO');
  const [txDescricao, setTxDescricao] = useState('');
  const [txValor, setTxValor] = useState(0);
  const [txForma, setTxForma] = useState<PaymentMethod>('PIX');

  // Close cash modal state
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [saldoInformado, setSaldoInformado] = useState(0);
  const [autoStartNextPeriod, setAutoStartNextPeriod] = useState(true);

  // New period modal state
  const [isNewPeriodModalOpen, setIsNewPeriodModalOpen] = useState(false);
  const [newPeriodInitialSaldo, setNewPeriodInitialSaldo] = useState(0);

  // History detail modal state
  const [selectedHistoryRegister, setSelectedHistoryRegister] = useState<DailyCashRegister | null>(null);

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

  const totalDinheiroEntrada = movimentacoes
    .filter(m => m.tipo === 'ENTRADA' && m.formaPagamento === 'DINHEIRO')
    .reduce((acc, curr) => acc + (curr.valor || 0), 0);

  const totalDinheiroSaida = movimentacoes
    .filter(m => m.tipo === 'SAIDA' && m.formaPagamento === 'DINHEIRO')
    .reduce((acc, curr) => acc + (curr.valor || 0), 0);

  // Cash expected in physical drawer
  const saldoDinheiroEsperado = (cashRegister?.saldoInicial || 0) + totalDinheiroEntrada - totalDinheiroSaida;

  const handleOpenAddModal = () => {
    setEditingTx(null);
    setFormError(null);
    setTxTipo('ENTRADA');
    setTxCategoria('SERVICO');
    setTxDescricao('');
    setTxValor(0);
    setTxForma('PIX');
    setIsAddTxModalOpen(true);
  };

  const handleOpenEditModal = (tx: CashTransaction) => {
    setEditingTx(tx);
    setFormError(null);
    setTxTipo(tx.tipo);
    setTxCategoria(tx.categoria || 'SERVICO');
    setTxDescricao(tx.descricao || '');
    setTxValor(tx.valor || 0);
    setTxForma(tx.formaPagamento || 'PIX');
    setIsAddTxModalOpen(true);
  };

  const handleDeleteTransaction = (tx: CashTransaction) => {
    setDeletingTx(tx);
  };

  const confirmDeleteTransaction = () => {
    if (!deletingTx) return;
    const updatedReg: DailyCashRegister = {
      ...cashRegister,
      movimentacoes: (cashRegister.movimentacoes || []).filter(m => m.id !== deletingTx.id)
    };
    onSaveCashRegister(updatedReg);
    setDeletingTx(null);
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!txDescricao.trim()) {
      setFormError('Por favor preencha a descrição da movimentação.');
      return;
    }

    if (txValor <= 0) {
      setFormError('Por favor informe um valor maior que zero.');
      return;
    }

    let updatedMovimentacoes = [...(cashRegister.movimentacoes || [])];

    if (editingTx) {
      updatedMovimentacoes = updatedMovimentacoes.map(m => {
        if (m.id === editingTx.id) {
          return {
            ...m,
            tipo: txTipo,
            categoria: txCategoria,
            descricao: txDescricao,
            valor: txValor,
            formaPagamento: txForma
          };
        }
        return m;
      });
    } else {
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
      updatedMovimentacoes.unshift(newTx);
    }

    const updatedReg: DailyCashRegister = {
      ...cashRegister,
      movimentacoes: updatedMovimentacoes
    };

    onSaveCashRegister(updatedReg);
    setIsAddTxModalOpen(false);
    setEditingTx(null);
    setTxDescricao('');
    setTxValor(0);
    setFormError(null);
  };

  // Close Cash Handler - Recalculates balances & archives history
  const handleCloseCash = (e: React.FormEvent) => {
    e.preventDefault();
    const dif = saldoInformado - saldoDinheiroEsperado;

    const closedRegister: DailyCashRegister = {
      ...cashRegister,
      status: 'FECHADO',
      saldoFinalCalculado: saldoAtualCalculado,
      saldoFinalInformado: saldoInformado,
      diferenca: dif,
      dataFechamento: new Date().toISOString(),
      usuarioFechamento: 'Gerente Admin'
    };

    if (autoStartNextPeriod) {
      const todayStr = new Date().toISOString().split('T')[0];
      const nextPeriodRegister: DailyCashRegister = {
        id: `cash-${Date.now()}`,
        data: todayStr,
        status: 'ABERTO',
        saldoInicial: Math.max(0, saldoInformado),
        dataAbertura: new Date().toISOString(),
        usuarioAbertura: 'Caixa Automático HR LAVACAR',
        movimentacoes: []
      };

      onSaveCashRegister(nextPeriodRegister, closedRegister);
    } else {
      onSaveCashRegister(closedRegister, closedRegister);
    }

    setIsCloseModalOpen(false);
  };

  // Open New Period Handler
  const handleStartNewPeriod = (e: React.FormEvent) => {
    e.preventDefault();
    const todayStr = new Date().toISOString().split('T')[0];
    const newPeriodRegister: DailyCashRegister = {
      id: `cash-${Date.now()}`,
      data: todayStr,
      status: 'ABERTO',
      saldoInicial: Math.max(0, newPeriodInitialSaldo),
      dataAbertura: new Date().toISOString(),
      usuarioAbertura: 'Gerente Admin',
      movimentacoes: []
    };

    onSaveCashRegister(newPeriodRegister);
    setIsNewPeriodModalOpen(false);
  };

  const handleReopenCash = () => {
    const updatedReg: DailyCashRegister = {
      ...cashRegister,
      status: 'ABERTO'
    };
    onSaveCashRegister(updatedReg);
  };

  const cashHistoryList = StorageService.getCashHistory();

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('caixa_atual')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'caixa_atual'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/40'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Caixa Atual / Período Ativo</span>
        </button>

        <button
          onClick={() => setActiveTab('historico')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'historico'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/40'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Histórico de Fechamentos</span>
          {cashHistoryList.length > 0 && (
            <span className="px-2 py-0.5 bg-slate-950 text-emerald-400 border border-emerald-800/80 rounded-full text-[10px]">
              {cashHistoryList.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'caixa_atual' ? (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl">
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
                Data: {cashRegister.data} | Abertura: <strong className="text-slate-200 font-mono">R$ {cashRegister.saldoInicial.toFixed(2)}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {cashRegister.status === 'ABERTO' ? (
                <>
                  <button
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer touch-manipulation active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nova Movimentação</span>
                  </button>

                  <button
                    onClick={() => {
                      setSaldoInformado(saldoDinheiroEsperado > 0 ? saldoDinheiroEsperado : saldoAtualCalculado);
                      setIsCloseModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-950 hover:bg-rose-900 border border-rose-700 text-rose-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Fechar Caixa Diário</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setNewPeriodInitialSaldo(cashRegister.saldoFinalInformado || cashRegister.saldoFinalCalculado || 0);
                      setIsNewPeriodModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-950/50 cursor-pointer touch-manipulation active:scale-95 animate-pulse"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Iniciar Novo Período de Operação</span>
                  </button>

                  <button
                    onClick={handleReopenCash}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    <Unlock className="w-4 h-4 text-emerald-400" />
                    <span>Reabrir Este Caixa</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Banner if Cash is Closed */}
          {cashRegister.status === 'FECHADO' && (
            <div className="p-4 bg-amber-950/40 border border-amber-800/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-200">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                <p className="text-xs">
                  O caixa deste período já foi encerrado. Você pode visualizar o extrato abaixo ou iniciar um novo período operacional.
                </p>
              </div>
              <button
                onClick={() => {
                  setNewPeriodInitialSaldo(cashRegister.saldoFinalInformado || cashRegister.saldoFinalCalculado || 0);
                  setIsNewPeriodModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl whitespace-nowrap cursor-pointer shrink-0"
              >
                Abrir Novo Caixa
              </button>
            </div>
          )}

          {/* KPI Cards Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">Saldo Atual Calculado</span>
                <Wallet className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black font-mono text-emerald-400">
                R$ {saldoAtualCalculado.toFixed(2)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Abertura (R$ {cashRegister.saldoInicial.toFixed(2)}) + Entradas - Saídas
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold text-emerald-400">Total de Entradas</span>
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black font-mono text-slate-100">
                + R$ {totalEntradas.toFixed(2)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {movimentacoes.filter(m => m.tipo === 'ENTRADA').length} lançamentos
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold text-rose-400">Total de Saídas</span>
                <ArrowDownRight className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-2xl font-black font-mono text-rose-400">
                - R$ {totalSaidas.toFixed(2)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {movimentacoes.filter(m => m.tipo === 'SAIDA').length} sangrias/despesas
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">Esperado em Dinheiro</span>
                <DollarSign className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-black font-mono text-amber-400">
                R$ {saldoDinheiroEsperado.toFixed(2)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Gaveta Física estimada
              </p>
            </div>
          </div>

          {/* Payment Method Distribution */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-900/70 border border-slate-800/80 p-3.5 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-950/80 border border-emerald-800 rounded-lg text-emerald-400">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400">Total PIX</p>
                  <p className="text-sm font-bold font-mono text-slate-100">R$ {totalPix.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800/80 p-3.5 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-cyan-950/80 border border-cyan-800 rounded-lg text-cyan-400">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400">Total Cartões</p>
                  <p className="text-sm font-bold font-mono text-slate-100">R$ {totalCartao.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800/80 p-3.5 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-950/80 border border-amber-800 rounded-lg text-amber-400">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400">Entradas em Dinheiro</p>
                  <p className="text-sm font-bold font-mono text-slate-100">R$ {totalDinheiroEntrada.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Extrato de Movimentações do Período</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {movimentacoes.length} lançamento(s)
              </span>
            </div>

            {movimentacoes.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                Nenhuma movimentação registrada neste caixa até o momento.
              </div>
            ) : (
              <div className="space-y-2.5">
                {movimentacoes.map(mvt => (
                  <div 
                    key={mvt.id}
                    className="flex items-center justify-between p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl border ${
                        mvt.tipo === 'ENTRADA' 
                          ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400' 
                          : 'bg-rose-950/60 border-rose-800/60 text-rose-400'
                      }`}>
                        {mvt.tipo === 'ENTRADA' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-200">{mvt.descricao}</p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>{mvt.formaPagamento}</span>
                          <span>•</span>
                          <span>{new Date(mvt.dataHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {mvt.usuario && (
                            <>
                              <span>•</span>
                              <span className="text-slate-500">{mvt.usuario}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`font-mono font-bold text-sm ${
                        mvt.tipo === 'ENTRADA' ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {mvt.tipo === 'ENTRADA' ? '+' : '-'} R$ {mvt.valor.toFixed(2)}
                      </div>

                      {cashRegister.status === 'ABERTO' && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(mvt)}
                            className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Editar Valor / Movimentação"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(mvt)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Cancelar / Excluir Movimentação"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* History View */
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-400" />
                <span>Histórico de Caixas Fechados</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Registros históricos das sessões de caixa anteriores
              </p>
            </div>
          </div>

          {cashHistoryList.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <History className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-slate-400 text-xs font-semibold">Nenhum fechamento de caixa registrado no histórico ainda.</p>
              <p className="text-slate-500 text-[11px]">Assim que realizar o fechamento do caixa diário, o relatório e extrato do período ficarão arquivados aqui.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cashHistoryList.map(item => {
                const totalIn = (item.movimentacoes || []).filter(m => m.tipo === 'ENTRADA').reduce((a, b) => a + (b.valor || 0), 0);
                const totalOut = (item.movimentacoes || []).filter(m => m.tipo === 'SAIDA').reduce((a, b) => a + (b.valor || 0), 0);

                return (
                  <div key={item.id} className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-slate-100">
                          Data do Caixa: {item.data}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-900 text-slate-400 border border-slate-700/60 rounded text-[10px] font-mono">
                          {item.id}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">
                          Fechado em: {item.dataFechamento ? new Date(item.dataFechamento).toLocaleDateString() + ' ' + new Date(item.dataFechamento).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Simulada'}
                        </span>
                        <button
                          onClick={() => setSelectedHistoryRegister(item)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Extrato Completo</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 text-[10px] block">Abertura</span>
                        <span className="font-mono font-bold text-slate-200">R$ {item.saldoInicial.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Entradas</span>
                        <span className="font-mono font-bold text-emerald-400">+ R$ {totalIn.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Saídas</span>
                        <span className="font-mono font-bold text-rose-400">- R$ {totalOut.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Saldo Fechamento</span>
                        <span className="font-mono font-bold text-cyan-400">R$ {(item.saldoFinalInformado || item.saldoFinalCalculado || 0).toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Diferença Gaveta</span>
                        <span className={`font-mono font-bold ${(item.diferenca || 0) === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          R$ {(item.diferenca || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Transaction Modal */}
      {isAddTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100">
                {editingTx ? 'Editar Movimentação de Caixa' : 'Lançar Movimentação de Caixa'}
              </h3>
              <button 
                onClick={() => setIsAddTxModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTxTipo('ENTRADA')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
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
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
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
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
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
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Forma de Pagamento</label>
                <select
                  value={txForma}
                  onChange={e => setTxForma(e.target.value as PaymentMethod)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="DINHEIRO">Dinheiro</option>
                  <option value="PIX">PIX</option>
                  <option value="CARTAO_DEBITO">Cartão de Débito</option>
                  <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                  <option value="TRANSFERENCIA_BANCARIA">Transferência Bancária</option>
                  <option value="PAGAMENTO_A_PRAZO">Pagamento a Prazo</option>
                  <option value="TROCA_SERVICOS">Troca em Serviços</option>
                  <option value="CORTESIA">Cortesia</option>
                </select>
              </div>

              {formError && (
                <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-rose-300 text-xs font-semibold">
                  {formError}
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTxModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                >
                  {editingTx ? 'Salvar Alterações' : 'Confirmar Lançamento'}
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
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Lock className="w-5 h-5 text-rose-400" />
                <span>Fechamento Diário do Caixa</span>
              </h3>
              <button 
                onClick={() => setIsCloseModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Recalculated Balances Card */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Saldo de Abertura:</span>
                <span className="font-mono text-slate-200 font-bold">R$ {cashRegister.saldoInicial.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>(+) Entradas no Período:</span>
                <span className="font-mono font-bold">+ R$ {totalEntradas.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-rose-400">
                <span>(-) Saídas / Sangrias:</span>
                <span className="font-mono font-bold">- R$ {totalSaidas.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-slate-100">
                <span>Saldo Calculado Total:</span>
                <span className="font-mono text-cyan-400">R$ {saldoAtualCalculado.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-amber-300 text-[11px]">
                <span>Esperado em Dinheiro na Gaveta:</span>
                <span className="font-mono font-bold">R$ {saldoDinheiroEsperado.toFixed(2)}</span>
              </div>
            </div>

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
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              {saldoInformado !== saldoDinheiroEsperado && (
                <div className="p-3 bg-amber-950/60 border border-amber-700 rounded-xl text-amber-300 text-xs font-semibold">
                  Diferença de Caixa: R$ {(saldoInformado - saldoDinheiroEsperado).toFixed(2)}
                </div>
              )}

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-3">
                <input
                  type="checkbox"
                  id="autoStartNext"
                  checked={autoStartNextPeriod}
                  onChange={e => setAutoStartNextPeriod(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900 cursor-pointer"
                />
                <label htmlFor="autoStartNext" className="text-xs text-slate-200 cursor-pointer select-none">
                  <strong className="text-emerald-400 block">Iniciar próximo período automaticamente</strong>
                  Prepara o caixa seguinte com o saldo final deste fechamento
                </label>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCloseModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl cursor-pointer shadow-lg shadow-rose-950/50"
                >
                  Confirmar Fechamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Start New Period Modal */}
      {isNewPeriodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span>Abrir Novo Período de Caixa</span>
              </h3>
              <button 
                onClick={() => setIsNewPeriodModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              O saldo inicial foi preenchido com o valor de fechamento do último período. Você pode ajustar este valor caso necessário.
            </p>

            <form onSubmit={handleStartNewPeriod} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Saldo Inicial do Período (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newPeriodInitialSaldo}
                  onChange={e => setNewPeriodInitialSaldo(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewPeriodModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl cursor-pointer shadow-lg shadow-emerald-950/50"
                >
                  Confirmar e Abrir Novo Caixa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 bg-rose-950 border border-rose-800 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Excluir Movimentação</h3>
                <p className="text-xs text-slate-400">Esta ação irá remover o lançamento do caixa.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <p className="text-xs font-bold text-slate-200">{deletingTx.descricao}</p>
              <p className="text-xs font-mono font-bold text-emerald-400">
                {deletingTx.tipo === 'ENTRADA' ? '+' : '-'} R$ {deletingTx.valor.toFixed(2)} ({deletingTx.formaPagamento})
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTx(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteTransaction}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl cursor-pointer shadow-lg shadow-rose-950/50"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Historical Register Details Modal */}
      {selectedHistoryRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <History className="w-5 h-5 text-emerald-400" />
                  <span>Extrato do Caixa: {selectedHistoryRegister.data}</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  ID: {selectedHistoryRegister.id}
                </p>
              </div>
              <button 
                onClick={() => setSelectedHistoryRegister(null)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Saldo de Abertura</span>
                <span className="font-mono font-bold text-slate-200">R$ {selectedHistoryRegister.saldoInicial.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Saldo Fechamento</span>
                <span className="font-mono font-bold text-cyan-400">R$ {(selectedHistoryRegister.saldoFinalInformado || selectedHistoryRegister.saldoFinalCalculado || 0).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Diferença</span>
                <span className="font-mono font-bold text-amber-400">R$ {(selectedHistoryRegister.diferenca || 0).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Total de Lançamentos</span>
                <span className="font-mono font-bold text-emerald-400">{(selectedHistoryRegister.movimentacoes || []).length}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300">Movimentações Deste Caixa:</h4>
              {(selectedHistoryRegister.movimentacoes || []).length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">Sem lançamentos arquivados.</div>
              ) : (
                (selectedHistoryRegister.movimentacoes || []).map(mvt => (
                  <div key={mvt.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-200">{mvt.descricao}</p>
                      <p className="text-[10px] text-slate-400">{mvt.formaPagamento} • {new Date(mvt.dataHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <span className={`font-mono font-bold ${mvt.tipo === 'ENTRADA' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {mvt.tipo === 'ENTRADA' ? '+' : '-'} R$ {mvt.valor.toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedHistoryRegister(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
