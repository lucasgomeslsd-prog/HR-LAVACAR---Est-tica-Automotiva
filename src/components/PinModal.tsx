import React, { useState, useEffect } from 'react';
import { Lock, Delete, X, AlertCircle, ShieldCheck } from 'lucide-react';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  correctPin?: string;
  onVerifyPin?: (pin: string) => boolean;
}

export const PinModal: React.FC<PinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  correctPin = '123456',
  onVerifyPin
}) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(null);
      setIsShaking(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, pin]);

  if (!isOpen) return null;

  const handleKeyPress = (digit: string) => {
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(null);

      if (nextPin.length === 6) {
        verifyPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError(null);
  };

  const verifyPin = (inputPin: string) => {
    let isValid = false;
    if (onVerifyPin) {
      isValid = onVerifyPin(inputPin);
    } else {
      isValid = inputPin === correctPin;
    }

    if (isValid) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setIsShaking(true);
      setError('PIN incorreto. O código padrão é 123456.');
      setTimeout(() => {
        setIsShaking(false);
        setPin('');
      }, 600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div 
        className={`w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden p-6 text-center text-slate-800 transform transition-all ${
          isShaking ? 'animate-bounce' : ''
        }`}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-2">
            <Lock className="w-6 h-6 text-blue-600" />
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-800 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-lg font-bold text-slate-900">Área Financeira Protegida</h3>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          Digite seu PIN de 6 dígitos para acessar o Caixa, Financeiro e Relatórios.
        </p>

        {/* 6 Dots Indicator */}
        <div className="flex justify-center items-center gap-3 mb-6">
          {[0, 1, 2, 3, 4, 5].map(idx => {
            const filled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border transition-all duration-200 ${
                  filled
                    ? 'bg-blue-600 border-blue-500 shadow-xs scale-110'
                    : 'bg-slate-100 border-slate-200'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <div className="flex items-center justify-center gap-2 text-rose-600 text-xs font-semibold mb-4 bg-rose-50 border border-rose-200 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-blue-600 active:text-white text-slate-800 font-bold text-lg border border-slate-200 transition-all cursor-pointer shadow-2xs"
            >
              {num}
            </button>
          ))}
          <div className="col-span-1" />
          <button
            onClick={() => handleKeyPress('0')}
            className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-blue-600 active:text-white text-slate-800 font-bold text-lg border border-slate-200 transition-all cursor-pointer shadow-2xs"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="h-12 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold flex items-center justify-center border border-slate-200 transition-all cursor-pointer shadow-2xs"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200 flex items-center justify-between">
          <span>PIN Padrão: <strong className="text-blue-600">123456</strong></span>
          <span className="text-slate-500">Segurança HR LAVACAR</span>
        </div>
      </div>
    </div>
  );
};
