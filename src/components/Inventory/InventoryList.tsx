import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Minus, 
  AlertTriangle, 
  Search, 
  Trash2, 
  Edit, 
  CheckCircle2,
  X
} from 'lucide-react';
import { InventoryItem } from '../../types';

interface InventoryListProps {
  inventory: InventoryItem[];
  onSaveInventory: (items: InventoryItem[]) => void;
}

export const InventoryList: React.FC<InventoryListProps> = ({
  inventory,
  onSaveInventory
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New item form
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState<any>('shampoo');
  const [quantidade, setQuantidade] = useState(1);
  const [unidadeMedida, setUnidadeMedida] = useState<any>('unidade');
  const [quantidadeMinima, setQuantidadeMinima] = useState(2);
  const [precoCusto, setPrecoCusto] = useState(25);

  const safeInventory = inventory || [];

  const filteredItems = safeInventory.filter(item => {
    const q = searchQuery.toLowerCase();
    return (item.nome && item.nome.toLowerCase().includes(q)) || (item.categoria && item.categoria.toLowerCase().includes(q));
  });

  const handleUpdateQuantity = (id: string, delta: number) => {
    const updated = safeInventory.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantidade + delta);
        return {
          ...item,
          quantidade: newQty,
          ultimaAtualizacao: new Date().toISOString().split('T')[0]
        };
      }
      return item;
    });
    onSaveInventory(updated);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este item do estoque?')) {
      onSaveInventory(safeInventory.filter(i => i.id !== id));
    }
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      nome: nome.trim(),
      categoria,
      quantidade,
      unidadeMedida,
      quantidadeMinima,
      precoCusto,
      ultimaAtualizacao: new Date().toISOString().split('T')[0]
    };

    onSaveInventory([...inventory, newItem]);
    setIsModalOpen(false);
    setNome('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <Package className="w-6 h-6 text-cyan-400" />
            Controle de Estoque & Insumos
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Controle de produtos de lavagem, ceras, panos e produtos para estética automotiva
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-cyan-500/20 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Cadastrar Produto</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Buscar produto por nome ou categoria..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Roster Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="py-3 px-3">Produto / Insumo</th>
              <th className="py-3 px-3">Categoria</th>
              <th className="py-3 px-3 text-center">Qtde Atual</th>
              <th className="py-3 px-3 text-center">Qtde Mínima</th>
              <th className="py-3 px-3 text-right">Preço de Custo</th>
              <th className="py-3 px-3 text-center">Ações Rápidas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredItems.map(item => {
              const isLowStock = item.quantidade <= item.quantidadeMinima;

              return (
                <tr key={item.id} className="hover:bg-slate-950/40">
                  <td className="py-3 px-3 font-bold text-slate-100">
                    <div className="flex items-center gap-2">
                      <span>{item.nome}</span>
                      {isLowStock && (
                        <span className="px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 rounded text-[10px] font-bold flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="w-3 h-3" />
                          Estoque Baixo
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-3 text-slate-400 uppercase">{item.categoria}</td>

                  <td className="py-3 px-3 text-center font-mono font-bold text-sm">
                    <span className={isLowStock ? 'text-rose-400' : 'text-emerald-400'}>
                      {item.quantidade} {item.unidadeMedida}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-center font-mono text-slate-400">
                    {item.quantidadeMinima} {item.unidadeMedida}
                  </td>

                  <td className="py-3 px-3 text-right font-mono text-slate-200">
                    R$ {item.precoCusto.toFixed(2)}
                  </td>

                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, -1)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-400 transition-colors cursor-pointer"
                        title="Reduzir 1 unidade"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-colors cursor-pointer"
                        title="Adicionar 1 unidade"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors cursor-pointer ml-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* New Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-100">Cadastrar Novo Insumo</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nome do Produto *</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Ex: Pretinho Vonixx Shiny 500ml"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Categoria</label>
                  <select
                    value={categoria}
                    onChange={e => setCategoria(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value="shampoo">Shampoo</option>
                    <option value="cera">Cera</option>
                    <option value="microfibra">Microfibra</option>
                    <option value="pretinho">Pretinho</option>
                    <option value="vitrificador">Vitrificador</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Unidade</label>
                  <select
                    value={unidadeMedida}
                    onChange={e => setUnidadeMedida(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value="unidade">Unidade</option>
                    <option value="litro">Litro</option>
                    <option value="galao">Galão</option>
                    <option value="kg">Kg</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Qtde Inicial</label>
                  <input
                    type="number"
                    min="0"
                    value={quantidade}
                    onChange={e => setQuantidade(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Qtde Mínima</label>
                  <input
                    type="number"
                    min="1"
                    value={quantidadeMinima}
                    onChange={e => setQuantidadeMinima(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={precoCusto}
                    onChange={e => setPrecoCusto(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl"
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
