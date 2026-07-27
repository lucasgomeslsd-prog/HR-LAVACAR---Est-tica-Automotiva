import React, { useState } from 'react';
import { 
  X, 
  CheckSquare, 
  Car, 
  AlertCircle, 
  Camera, 
  Trash2, 
  Plus, 
  Fuel, 
  FileCheck2, 
  Sparkles,
  Info
} from 'lucide-react';
import { Checklist, ChecklistDamagePoint, ServiceOrder } from '../../types';

interface ChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (checklist: Checklist) => void;
  onSaveChecklist?: (checklist: Checklist) => void;
  order: ServiceOrder;
}

export const ChecklistModal: React.FC<ChecklistModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onSaveChecklist,
  order
}) => {
  const existingChecklist = order?.checklist;

  const [activePart, setActivePart] = useState<'frente' | 'traseira' | 'lateral_esquerda' | 'lateral_direita' | 'teto' | 'interior'>('frente');
  
  const [nivelCombustivel, setNivelCombustivel] = useState<number>(50);
  const [nivelSujeira, setNivelSujeira] = useState<'leve' | 'media' | 'pesada' | 'extrema'>('media');
  const [odometroKm, setOdometroKm] = useState<number>(0);

  const [temTriangulo, setTemTriangulo] = useState<boolean>(true);
  const [temMacaco, setTemMacaco] = useState<boolean>(true);
  const [temChaveRoda, setTemChaveRoda] = useState<boolean>(true);
  const [temTapetes, setTemTapetes] = useState<boolean>(true);
  const [temSomMultimidia, setTemSomMultimidia] = useState<boolean>(true);
  const [pertencesPessoais, setPertencesPessoais] = useState<string>('');

  const [damagePoints, setDamagePoints] = useState<ChecklistDamagePoint[]>([]);
  const [fotosEntrada, setFotosEntrada] = useState<string[]>([]);
  const [fotosSaida, setFotosSaida] = useState<string[]>([]);
  const [observacoesEntrada, setObservacoesEntrada] = useState<string>('');
  const [observacoesSaida, setObservacoesSaida] = useState<string>('');

  React.useEffect(() => {
    if (isOpen) {
      const existingChecklist = order?.checklist;
      setNivelCombustivel(existingChecklist?.nivelCombustivel ?? 50);
      setNivelSujeira(existingChecklist?.nivelSujeira || 'media');
      setOdometroKm(existingChecklist?.odometroKm || 0);
      setTemTriangulo(existingChecklist?.temTriangulo ?? true);
      setTemMacaco(existingChecklist?.temMacaco ?? true);
      setTemChaveRoda(existingChecklist?.temChaveRoda ?? true);
      setTemTapetes(existingChecklist?.temTapetes ?? true);
      setTemSomMultimidia(existingChecklist?.temSomMultimidia ?? true);
      setPertencesPessoais(existingChecklist?.pertencesPessoais || '');
      setDamagePoints(existingChecklist?.damagePoints || []);
      setFotosEntrada(existingChecklist?.fotosEntrada || []);
      setFotosSaida(existingChecklist?.fotosSaida || []);
      setObservacoesEntrada(existingChecklist?.observacoesEntrada || '');
      setObservacoesSaida(existingChecklist?.observacoesSaida || '');
    }
  }, [isOpen, order]);

  if (!isOpen) return null;

  // Diagram click handler to place a marker
  const handleDiagramClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const desc = prompt(`Adicionar avaria na parte (${activePart.toUpperCase()}): Ex: Arranhão profundo, Pneu murcho, Dente`);
    if (desc) {
      const newPoint: ChecklistDamagePoint = {
        id: `dmg-${Date.now()}`,
        x,
        y,
        part: activePart,
        type: 'arranhao',
        descricao: desc
      };
      setDamagePoints(prev => [...prev, newPoint]);
    }
  };

  const handleRemovePoint = (id: string) => {
    setDamagePoints(prev => prev.filter(p => p.id !== id));
  };

  // Photo upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, isSaida: boolean = false) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          const url = uploadEvent.target.result as string;
          if (isSaida) {
            setFotosSaida(prev => [...prev, url]);
          } else {
            setFotosEntrada(prev => [...prev, url]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const checklist: Checklist = {
      id: existingChecklist?.id || `chk-${Date.now()}`,
      osId: order.id,
      dataEntrada: existingChecklist?.dataEntrada || new Date().toISOString(),
      dataSaida: order.status === 'PRONTO' || order.status === 'ENTREGUE' ? new Date().toISOString() : undefined,
      nivelCombustivel,
      nivelSujeira,
      odometroKm,
      temTriangulo,
      temMacaco,
      temChaveRoda,
      temTapetes,
      temSomMultimidia,
      pertencesPessoais,
      damagePoints,
      fotosEntrada,
      fotosSaida,
      observacoesEntrada,
      observacoesSaida
    };

    const saveFn = onSave || onSaveChecklist;
    if (saveFn) saveFn(checklist);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-700/60 flex items-center justify-center text-cyan-400">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Checklist de Inspeção - OS #{order.numeroOS}
              </h3>
              <p className="text-xs text-slate-400">
                Veículo: <strong className="text-cyan-300 font-mono">{order.vehiclePlaca}</strong> ({order.vehicleModelo}) - Cliente: {order.clientNome}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Section 1: Visual Car Diagram Inspection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Car className="w-4 h-4" /> Mapeamento Visual de Avarias & Detalhes (Clique na imagem para marcar)
              </h4>
              <span className="text-[11px] text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                Avarias marcadas: <strong className="text-cyan-300">{damagePoints.length}</strong>
              </span>
            </div>

            {/* View Selector Tabs */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
              {[
                { id: 'frente', label: 'Dianteira' },
                { id: 'traseira', label: 'Traseira' },
                { id: 'lateral_esquerda', label: 'Lat. Esquerda' },
                { id: 'lateral_direita', label: 'Lat. Direita' },
                { id: 'teto', label: 'Teto / Capô' },
                { id: 'interior', label: 'Interior / Painel' }
              ].map(part => (
                <button
                  key={part.id}
                  type="button"
                  onClick={() => setActivePart(part.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activePart === part.id
                      ? 'bg-cyan-600 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {part.label}
                </button>
              ))}
            </div>

            {/* Interactive Vehicle Diagram Area */}
            <div className="relative bg-slate-950 border border-slate-800 rounded-xl h-56 sm:h-64 flex items-center justify-center overflow-hidden cursor-crosshair group">
              
              {/* Vehicle SVG Silhouette Diagram */}
              <div 
                onClick={handleDiagramClick}
                className="w-full h-full flex flex-col items-center justify-center relative p-4 select-none"
              >
                {/* Visual placeholder diagram matching active view */}
                <div className="relative w-full max-w-md h-40 border-2 border-dashed border-cyan-800/40 rounded-2xl flex flex-col items-center justify-center bg-slate-900/60 group-hover:border-cyan-500/60 transition-colors">
                  <Car className="w-20 h-20 text-slate-700 stroke-[1.2] group-hover:text-cyan-600/60 transition-colors" />
                  <span className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                    Vista: {activePart.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-cyan-400/80 mt-0.5">
                    + Clique aqui para adicionar ponto de avaria
                  </span>
                </div>

                {/* Render markers on active part */}
                {(damagePoints || [])
                  .filter(p => p.part === activePart)
                  .map(p => (
                    <div
                      key={p.id}
                      style={{ left: `${p.x}%`, top: `${p.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group/marker"
                    >
                      <div className="w-6 h-6 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white shadow-lg animate-pulse cursor-pointer">
                        !
                      </div>
                      <div className="hidden group-hover/marker:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-40 bg-slate-950 text-white text-[11px] p-2 rounded-lg border border-slate-700 shadow-xl z-30">
                        {p.descricao}
                      </div>
                    </div>
                  ))}
              </div>

            </div>

            {/* List of Marked Damages */}
            {damagePoints.length > 0 && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase">
                  Lista de Avarias Registradas:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {damagePoints.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-2 bg-slate-900 rounded-lg text-xs">
                      <div>
                        <span className="font-bold text-cyan-400 uppercase mr-1">[{p.part}]:</span>
                        <span className="text-slate-200">{p.descricao}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePoint(p.id)}
                        className="text-rose-400 hover:text-rose-300 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Section 2: Items & State Toggles */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <CheckSquare className="w-4 h-4" /> Verificação de Pertences & Níveis
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <Fuel className="w-3.5 h-3.5 text-amber-400" /> Nível de Combustível ({nivelCombustivel}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="25"
                  value={nivelCombustivel}
                  onChange={e => setNivelCombustivel(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>Reserva</span>
                  <span>1/4</span>
                  <span>1/2</span>
                  <span>3/4</span>
                  <span>Cheio</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nível de Sujeira
                </label>
                <select
                  value={nivelSujeira}
                  onChange={e => setNivelSujeira(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="leve">Leve (Poeira normal)</option>
                  <option value="media">Média (Barro moderado)</option>
                  <option value="pesada">Pesada (Barro intenso/Óleo)</option>
                  <option value="extrema">Extrema (Incrustações / Interiores críticos)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Odômetro (KM Atual)
                </label>
                <input
                  type="number"
                  value={odometroKm || ''}
                  onChange={e => setOdometroKm(Number(e.target.value))}
                  placeholder="Ex: 45200"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Checkbox Toggles for Accessories */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {[
                { id: 'triangulo', label: 'Triângulo', state: temTriangulo, setState: setTemTriangulo },
                { id: 'macaco', label: 'Macaco', state: temMacaco, setState: setTemMacaco },
                { id: 'chaveRoda', label: 'Chave de Roda', state: temChaveRoda, setState: setTemChaveRoda },
                { id: 'tapetes', label: 'Jogo de Tapetes', state: temTapetes, setState: setTemTapetes },
                { id: 'multimidia', label: 'Som / Multimídia', state: temSomMultimidia, setState: setTemSomMultimidia }
              ].map(item => (
                <label key={item.id} className="flex items-center gap-2 p-2.5 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.state}
                    onChange={e => item.setState(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700 focus:ring-cyan-500"
                  />
                  <span className="text-xs font-semibold text-slate-300">{item.label}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Pertences Pessoais Deixados no Veículo
              </label>
              <input
                type="text"
                value={pertencesPessoais}
                onChange={e => setPertencesPessoais(e.target.value)}
                placeholder="Ex: Óculos de sol no porta-luvas, moeda no console, guarda-chuva no porta-malas"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Section 3: Inspection Photos (Entrada & Saída) */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Camera className="w-4 h-4" /> Fotos do Veículo (Sem necessidade de assinatura)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Entrada Photos */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Fotos de Entrada ({fotosEntrada.length})</span>
                  <label className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer">
                    <Camera className="w-3.5 h-3.5" />
                    <span>+ Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={e => handlePhotoUpload(e, false)}
                      className="hidden"
                    />
                  </label>
                </div>

                {fotosEntrada.length === 0 ? (
                  <p className="text-[11px] text-slate-500 text-center py-4">Nenhuma foto de entrada anexada</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {fotosEntrada.map((img, idx) => (
                      <div key={idx} className="relative group/img h-20 bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
                        <img src={img} alt="Foto Entrada" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFotosEntrada(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-md opacity-0 group-hover/img:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Saída Photos */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Fotos de Saída / Carro Pronto ({fotosSaida.length})</span>
                  <label className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer">
                    <Camera className="w-3.5 h-3.5" />
                    <span>+ Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={e => handlePhotoUpload(e, true)}
                      className="hidden"
                    />
                  </label>
                </div>

                {fotosSaida.length === 0 ? (
                  <p className="text-[11px] text-slate-500 text-center py-4">Nenhuma foto de saída anexada</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {fotosSaida.map((img, idx) => (
                      <div key={idx} className="relative group/img h-20 bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
                        <img src={img} alt="Foto Saída" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFotosSaida(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-md opacity-0 group-hover/img:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Info className="w-4 h-4 text-cyan-400" />
              <span>Sem necessidade de assinatura digital conforme fluxo ágil HR LAVACAR.</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
              >
                Salvar Checklist
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
