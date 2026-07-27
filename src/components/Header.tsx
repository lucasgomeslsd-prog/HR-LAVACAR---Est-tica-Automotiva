import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  PlusCircle, 
  UserCheck, 
  PhoneCall, 
  Car, 
  Sparkles,
  LogOut
} from 'lucide-react';
import { Role, BusinessConfig } from '../types';
import { Logo } from './Logo';

interface HeaderProps {
  currentRole?: Role;
  role?: Role;
  onRoleChange: (role: Role) => void;
  pinUnlocked: boolean;
  onLockPin: () => void;
  onRequestPinUnlock?: () => void;
  onOpenPinModal?: () => void;
  onOpenNewOS: () => void;
  onOpenNewClient: () => void;
  businessConfig?: BusinessConfig | null;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  role: propRole,
  onRoleChange,
  pinUnlocked,
  onLockPin,
  onRequestPinUnlock,
  onOpenPinModal,
  onOpenNewOS,
  onOpenNewClient,
  businessConfig
}) => {
  const activeRole = currentRole || propRole || 'admin';
  const handleUnlockPin = onRequestPinUnlock || onOpenPinModal || (() => {});

  return (
    <header className="bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 text-slate-100 sticky top-0 z-30 pt-[max(0.25rem,env(safe-area-inset-top))]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Logo & Brand Name */}
        <div className="flex items-center gap-2.5">
          <Logo size="md" showText={true} />
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenNewOS}
            id="btn-quick-new-os"
            className="flex items-center gap-1.5 px-3 py-2 sm:px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-900/40 active:scale-95 transition-all cursor-pointer whitespace-nowrap touch-manipulation"
          >
            <PlusCircle className="w-4 h-4 text-white stroke-[2.5]" />
            <span>Nova OS</span>
          </button>

          <button
            onClick={onOpenNewClient}
            id="btn-quick-new-client"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm rounded-xl border border-slate-700 transition-all cursor-pointer whitespace-nowrap"
          >
            <UserCheck className="w-4 h-4 text-blue-400" />
            <span>+ Cliente</span>
          </button>

          {/* Role Switcher & Security Status */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => onRoleChange('ADMIN')}
              id="role-switch-admin"
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeRole === 'ADMIN' || activeRole === 'admin' 
                  ? 'bg-blue-600 text-white font-bold shadow-xs' 
                  : 'text-slate-400 hover:text-slate-100'
              }`}
              title="Acesso completo com gestão financeira"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Admin</span>
            </button>

            <button
              onClick={() => {
                onRoleChange('FUNCIONARIO');
                onLockPin(); // auto lock financial area when switching to employee
              }}
              id="role-switch-funcionario"
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeRole === 'FUNCIONARIO' || activeRole === 'funcionario' 
                  ? 'bg-emerald-600 text-white font-bold shadow-xs' 
                  : 'text-slate-400 hover:text-slate-100'
              }`}
              title="Acesso restrito operacional"
            >
              <Car className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Operacional</span>
            </button>
          </div>

          {/* PIN Lock Indicator for Admin */}
          {(activeRole === 'ADMIN' || activeRole === 'admin') && (
            <div className="relative">
              {pinUnlocked ? (
                <button
                  onClick={onLockPin}
                  id="btn-lock-pin"
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 hover:bg-emerald-900 text-xs font-semibold rounded-xl transition-all"
                  title="Módulo financeiro liberado nesta sessão. Clique para bloquear."
                >
                  <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden xl:inline">PIN OK</span>
                </button>
              ) : (
                <button
                  onClick={handleUnlockPin}
                  id="btn-unlock-pin"
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-950/80 border border-amber-700/80 text-amber-300 hover:bg-amber-900 text-xs font-semibold rounded-xl transition-all"
                  title="Área financeira protegida. Clique para inserir PIN 6 dígitos."
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden xl:inline">PIN</span>
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
