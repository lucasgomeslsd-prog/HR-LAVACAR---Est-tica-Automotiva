import React from 'react';
import { 
  LayoutDashboard, 
  Kanban, 
  ClipboardList, 
  Users, 
  CalendarDays, 
  DollarSign, 
  PieChart, 
  Package, 
  BarChart3, 
  Settings,
  Lock,
  MessageSquareCode,
  CheckSquare
} from 'lucide-react';
import { Role } from '../types';

export type TabType = 
  | 'dashboard'
  | 'producao'
  | 'os'
  | 'clientes'
  | 'agendamentos'
  | 'caixa'
  | 'financeiro'
  | 'estoque'
  | 'relatorios'
  | 'configuracoes';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  role?: Role;
  currentRole?: Role;
  pinUnlocked: boolean;
  onRequestPinUnlock?: () => void;
  onOpenPinModal?: () => void;
  counts?: {
    prontosCount?: number;
    emProducaoCount?: number;
    agendamentosHoje?: number;
    estoqueBaixo?: number;
  };
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  role: propRole,
  currentRole,
  pinUnlocked,
  onRequestPinUnlock,
  onOpenPinModal,
  counts
}) => {
  const activeRole = currentRole || propRole || 'admin';
  const handleUnlockPin = onRequestPinUnlock || onOpenPinModal || (() => {});
  
  const safeCounts = {
    prontosCount: counts?.prontosCount ?? 0,
    emProducaoCount: counts?.emProducaoCount ?? 0,
    agendamentosHoje: counts?.agendamentosHoje ?? 0,
    estoqueBaixo: counts?.estoqueBaixo ?? 0,
  };

  const handleTabClick = (tab: TabType, isAdminOnly: boolean = false) => {
    if ((activeRole === 'funcionario' || activeRole === 'FUNCIONARIO') && isAdminOnly) {
      alert('Esta seção é exclusiva do perfil Administrador.');
      return;
    }

    const isPinProtected = ['caixa', 'financeiro', 'relatorios'].includes(tab);
    if ((activeRole === 'admin' || activeRole === 'ADMIN') && isPinProtected && !pinUnlocked) {
      handleUnlockPin();
      return;
    }

    onTabChange(tab);
  };

  const navItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Dashboard',
      icon: LayoutDashboard,
      adminOnly: false,
      badge: null
    },
    {
      id: 'producao' as TabType,
      label: 'Painel de Produção',
      icon: Kanban,
      adminOnly: false,
      badge: safeCounts.emProducaoCount > 0 ? (
        <span className="ml-auto bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md text-[10px] font-bold">
          {safeCounts.emProducaoCount}
        </span>
      ) : null
    },
    {
      id: 'os' as TabType,
      label: 'Ordens de Serviço',
      icon: ClipboardList,
      adminOnly: false,
      badge: safeCounts.prontosCount > 0 ? (
        <span className="ml-auto bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md text-[10px] font-bold animate-pulse">
          {safeCounts.prontosCount} pronto
        </span>
      ) : null
    },
    {
      id: 'clientes' as TabType,
      label: 'Clientes & Veículos',
      icon: Users,
      adminOnly: false,
      badge: null
    },
    {
      id: 'agendamentos' as TabType,
      label: 'Agendamentos',
      icon: CalendarDays,
      adminOnly: false,
      badge: safeCounts.agendamentosHoje > 0 ? (
        <span className="ml-auto bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md text-[10px] font-bold">
          {safeCounts.agendamentosHoje}
        </span>
      ) : null
    },
    // Admin Only Sections
    {
      id: 'caixa' as TabType,
      label: 'Caixa do Dia',
      icon: DollarSign,
      adminOnly: true,
      pinProtected: true,
      badge: null
    },
    {
      id: 'financeiro' as TabType,
      label: 'Financeiro',
      icon: PieChart,
      adminOnly: true,
      pinProtected: true,
      badge: null
    },
    {
      id: 'estoque' as TabType,
      label: 'Estoque & Insumos',
      icon: Package,
      adminOnly: true,
      pinProtected: false,
      badge: safeCounts.estoqueBaixo > 0 ? (
        <span className="ml-auto bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md text-[10px] font-bold">
          {safeCounts.estoqueBaixo} alerta
        </span>
      ) : null
    },
    {
      id: 'relatorios' as TabType,
      label: 'Relatórios & DRE',
      icon: BarChart3,
      adminOnly: true,
      pinProtected: true,
      badge: null
    },
    {
      id: 'configuracoes' as TabType,
      label: 'Configurações',
      icon: Settings,
      adminOnly: true,
      pinProtected: false,
      badge: null
    }
  ];

  // Selected items for mobile bottom bar
  const mobileNavItems = [
    { id: 'dashboard' as TabType, label: 'Início', icon: LayoutDashboard },
    { id: 'producao' as TabType, label: 'Produção', icon: Kanban, count: safeCounts.emProducaoCount },
    { id: 'os' as TabType, label: 'OSs', icon: ClipboardList, count: safeCounts.prontosCount },
    { id: 'clientes' as TabType, label: 'Clientes', icon: Users },
    { id: 'agendamentos' as TabType, label: 'Agenda', icon: CalendarDays, count: safeCounts.agendamentosHoje },
    { id: 'caixa' as TabType, label: 'Caixa', icon: DollarSign, adminOnly: true, pinProtected: true },
    { id: 'configuracoes' as TabType, label: 'Ajustes', icon: Settings, adminOnly: true }
  ];

  return (
    <>
      {/* Desktop Sidebar Navigation */}
      <nav className="hidden md:block bg-slate-900/90 border border-slate-800 rounded-2xl w-60 shrink-0 p-3 shadow-lg sticky top-20 z-20 max-h-[calc(100vh-6rem)] overflow-y-auto backdrop-blur-md">
        <div className="flex flex-col gap-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isLockedForStaff = (activeRole === 'funcionario' || activeRole === 'FUNCIONARIO') && item.adminOnly;
            const isPinLockedForAdmin = (activeRole === 'admin' || activeRole === 'ADMIN') && item.pinProtected && !pinUnlocked;

            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id, item.adminOnly)}
                id={`nav-tab-${item.id}`}
                disabled={isLockedForStaff}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer text-left w-full ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/40'
                    : isLockedForStaff
                    ? 'text-slate-600 opacity-40 cursor-not-allowed'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>

                {/* Pin indicator */}
                {item.pinProtected && (activeRole === 'admin' || activeRole === 'ADMIN') && isPinLockedForAdmin && (
                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-auto" />
                )}

                {item.badge}
              </button>
            );
          })}
        </div>
      </nav>

      {/* iOS Style Mobile Bottom Dock Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 shadow-2xl px-1 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-1 px-1 max-w-xl mx-auto touch-pan-x">
          {mobileNavItems
            .filter(item => !((activeRole === 'funcionario' || activeRole === 'FUNCIONARIO') && item.adminOnly))
            .map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isPinLockedForAdmin = (activeRole === 'admin' || activeRole === 'ADMIN') && item.pinProtected && !pinUnlocked;

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id, item.adminOnly)}
                  id={`mobile-nav-tab-${item.id}`}
                  className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all shrink-0 relative min-w-[50px] cursor-pointer touch-manipulation ${
                    isActive
                      ? 'text-cyan-400 font-bold scale-105'
                      : 'text-slate-400 active:text-slate-200'
                  }`}
                >
                  {/* Active Indicator Top Glow Bar */}
                  {isActive && (
                    <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-1 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                  )}

                  <div className="relative p-0.5">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400 stroke-[2.3]' : 'text-slate-400'}`} />
                    {item.count && item.count > 0 ? (
                      <span className="absolute -top-1 -right-2 bg-blue-600 text-white text-[9px] font-extrabold px-1.5 rounded-full min-w-[16px] h-[16px] flex items-center justify-center border border-slate-950 shadow-xs">
                        {item.count}
                      </span>
                    ) : null}
                    {item.pinProtected && (activeRole === 'admin' || activeRole === 'ADMIN') && isPinLockedForAdmin && (
                      <Lock className="w-2.5 h-2.5 text-amber-400 absolute -top-0.5 -right-1" />
                    )}
                  </div>
                  <span className={`text-[10px] tracking-tight mt-0.5 truncate max-w-[56px] ${isActive ? 'text-cyan-300 font-bold' : 'text-slate-400'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
        </div>
      </nav>
    </>
  );
};
