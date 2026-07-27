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
    <header className="bg-white border-b border-slate-200 text-slate-800 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Logo & Brand Name */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 p-[2px] shadow-sm transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-blue-600 rounded-[10px] flex items-center justify-center overflow-hidden">
                <Car className="w-5 h-5 text-white stroke-[2.2]" />
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold tracking-tight text-blue-600 font-sans">
                HR LAVACAR
              </h1>
              <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                Estética Automotiva
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block truncate max-w-[200px] md:max-w-xs">
              {businessConfig?.nomeEmpresa || 'HR LAVACAR - Estética Automotiva'}
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenNewOS}
            id="btn-quick-new-os"
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4 text-white stroke-[2.5]" />
            <span>Nova OS</span>
          </button>

          <button
            onClick={onOpenNewClient}
            id="btn-quick-new-client"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl border border-slate-200 transition-all cursor-pointer whitespace-nowrap"
          >
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span>+ Cliente</span>
          </button>

          {/* Role Switcher & Security Status */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 gap-1">
            <button
              onClick={() => onRoleChange('ADMIN')}
              id="role-switch-admin"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeRole === 'ADMIN' || activeRole === 'admin' 
                  ? 'bg-white text-blue-600 border border-slate-200 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Acesso completo com gestão financeira"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden md:inline">Admin</span>
            </button>

            <button
              onClick={() => {
                onRoleChange('FUNCIONARIO');
                onLockPin(); // auto lock financial area when switching to employee
              }}
              id="role-switch-funcionario"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeRole === 'FUNCIONARIO' || activeRole === 'funcionario' 
                  ? 'bg-white text-emerald-600 border border-slate-200 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Acesso restrito operacional"
            >
              <Car className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">Funcionário</span>
            </button>
          </div>

          {/* PIN Lock Indicator for Admin */}
          {(activeRole === 'ADMIN' || activeRole === 'admin') && (
            <div className="relative">
              {pinUnlocked ? (
                <button
                  onClick={onLockPin}
                  id="btn-lock-pin"
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold rounded-xl transition-all"
                  title="Módulo financeiro liberado nesta sessão. Clique para bloquear."
                >
                  <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden xl:inline">PIN OK</span>
                </button>
              ) : (
                <button
                  onClick={handleUnlockPin}
                  id="btn-unlock-pin"
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 text-xs font-semibold rounded-xl transition-all"
                  title="Área financeira protegida. Clique para inserir PIN 6 dígitos."
                >
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden xl:inline">Inserir PIN</span>
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
