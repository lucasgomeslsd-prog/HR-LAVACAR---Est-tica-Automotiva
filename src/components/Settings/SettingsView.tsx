import React, { useState } from 'react';
import { 
  Settings, 
  Sparkles, 
  MessageSquare, 
  Building2, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Save, 
  Check, 
  Lock,
  PhoneCall,
  QrCode,
  Database,
  Download,
  Upload,
  GitBranch,
  FileCode,
  AlertTriangle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

import { 
  ServiceItem, 
  WhatsAppTemplate, 
  WhatsAppApiConfig, 
  BusinessConfig,
  VehicleCategory
} from '../../types';
import { StorageService } from '../../services/storage';

interface SettingsViewProps {
  services: ServiceItem[];
  templates: WhatsAppTemplate[];
  waConfig: WhatsAppApiConfig;
  businessConfig: BusinessConfig;
  onSaveServices: (services: ServiceItem[]) => void;
  onSaveTemplates: (templates: WhatsAppTemplate[]) => void;
  onSaveWaConfig: (config: WhatsAppApiConfig) => void;
  onSaveBusinessConfig: (config: BusinessConfig) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  services,
  templates,
  waConfig,
  businessConfig,
  onSaveServices,
  onSaveTemplates,
  onSaveWaConfig,
  onSaveBusinessConfig
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'servicos' | 'whatsapp' | 'empresa' | 'seguranca' | 'banco_dados'>('servicos');

  // Local state for editable items
  const [localServices, setLocalServices] = useState<ServiceItem[]>(services || []);
  const [localTemplates, setLocalTemplates] = useState<WhatsAppTemplate[]>(templates || []);
  const [localWaConfig, setLocalWaConfig] = useState<WhatsAppApiConfig>(waConfig || {
    ativo: false,
    provider: 'EVOLUTION_API',
    baseUrl: '',
    instanceName: '',
    apiKey: '',
    templateNotificacaoEntrada: true,
    templateNotificacaoPronto: true,
    templateNotificacaoLembrete: true
  });
  const [localBusiness, setLocalBusiness] = useState<BusinessConfig>({
    nomeEmpresa: businessConfig?.nomeEmpresa || 'HR LAVACAR - Estética Automotiva',
    cnpj: businessConfig?.cnpj || '00.000.000/0001-00',
    telefone: businessConfig?.telefone || '(41) 99999-8888',
    endereco: businessConfig?.endereco || 'Rua Principal, 1000 - Centro',
    chavePix: businessConfig?.chavePix || '',
    pinSeguranca: businessConfig?.pinSeguranca || (businessConfig as any)?.pinFinanceiro || '123456',
    comissaoPadraoPercentual: businessConfig?.comissaoPadraoPercentual || 15,
    mensagemPersonalizadaCabecalho: businessConfig?.mensagemPersonalizadaCabecalho || 'HR LAVACAR - Qualidade e Brilho Impecável'
  });
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [templateError, setTemplateError] = useState<string | null>(null);

  // Backup & Import feedback state
  const [dbStatusMsg, setDbStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [gitRepoUrl, setGitRepoUrl] = useState('https://github.com/hrlavacar/estetica-automotiva-db');

  // New Service form
  const [newSrvNome, setNewSrvNome] = useState('');
  const [newSrvDesc, setNewSrvDesc] = useState('');
  const [newSrvHatch, setNewSrvHatch] = useState(50);
  const [newSrvSedan, setNewSrvSedan] = useState(60);
  const [newSrvSuv, setNewSrvSuv] = useState(75);

  const handleSaveAll = () => {
    // Validate WhatsApp templates
    const emptyTpl = localTemplates.find(t => !t.conteudo || !t.conteudo.trim());
    if (emptyTpl) {
      setTemplateError('O modelo de mensagem do WhatsApp não pode ficar vazio. Preencha todos os campos antes de salvar.');
      setActiveSubTab('whatsapp');
      setSaveSuccess(false);
      return;
    }

    setTemplateError(null);
    onSaveServices(localServices);
    onSaveTemplates(localTemplates);
    onSaveWaConfig(localWaConfig);
    onSaveBusinessConfig(localBusiness);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSrvNome.trim()) return;

    const newSrv: ServiceItem = {
      id: `srv-${Date.now()}`,
      nome: newSrvNome.trim(),
      descricao: newSrvDesc.trim(),
      categoria: 'lavagem',
      duracaoMinutos: 60,
      precos: {
        hatch: newSrvHatch,
        sedan: newSrvSedan,
        suv: newSrvSuv,
        moto: Math.round(newSrvHatch * 0.7),
        utilitario: Math.round(newSrvSuv * 1.2)
      }
    };

    setLocalServices(prev => [...prev, newSrv]);
    setNewSrvNome('');
    setNewSrvDesc('');
  };

  const handleDeleteService = (id: string) => {
    setLocalServices(prev => prev.filter(s => s.id !== id));
  };

  const handleUpdatePrice = (srvId: string, cat: VehicleCategory, price: number) => {
    setLocalServices(prev =>
      prev.map(s => {
        if (s.id === srvId) {
          return {
            ...s,
            precos: {
              ...s.precos,
              [cat]: price
            }
          };
        }
        return s;
      })
    );
  };

  const handleUpdateTemplateText = (tplId: string, newText: string) => {
    setLocalTemplates(prev =>
      prev.map(t => (t.id === tplId ? { ...t, conteudo: newText } : t))
    );
  };

  const handleExportBackup = () => {
    const jsonStr = StorageService.exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hr_lavacar_banco_dados_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDbStatusMsg({ type: 'success', text: 'Backup completo do banco de dados baixado com sucesso!' });
    setTimeout(() => setDbStatusMsg(null), 4000);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = StorageService.importBackupJson(content);
      if (success) {
        setDbStatusMsg({ type: 'success', text: 'Banco de dados restaurado com sucesso! Recarregando aplicação...' });
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setDbStatusMsg({ type: 'error', text: 'Falha ao importar arquivo JSON. Verifique se a estrutura está correta.' });
      }
    };
    reader.readAsText(file);
  };

  const handleClearDatabase = () => {
    if (confirm('Atenção: Tem certeza de que deseja apagar todos os dados do banco local? Esta ação limpa clientes, OSs e histórico armazenados.')) {
      StorageService.resetAllData();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <Settings className="w-6 h-6 text-cyan-400" />
            Configurações do Sistema & WhatsApp
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gerencie o catálogo de preços por categoria de veículo, modelos de WhatsApp e PIN de segurança
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
        >
          {saveSuccess ? <Check className="w-4 h-4 text-slate-950" /> : <Save className="w-4 h-4" />}
          <span>{saveSuccess ? 'Configurações Salvas!' : 'Salvar Alterações'}</span>
        </button>
      </div>

      {/* Subtabs Menu */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1">
        {[
          { id: 'servicos', label: 'Catálogo de Serviços & Tabela de Preços', icon: Sparkles },
          { id: 'whatsapp', label: 'Modelos de Mensagem WhatsApp', icon: MessageSquare },
          { id: 'empresa', label: 'Dados da Empresa & PIX', icon: Building2 },
          { id: 'seguranca', label: 'PIN de Segurança 6 Dígitos', icon: ShieldCheck },
          { id: 'banco_dados', label: 'Banco de Dados & GitHub', icon: Database }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-cyan-300 border-t border-x border-slate-800 text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Icon className="w-4 h-4 text-cyan-400" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Subtab 1: Services Catalog */}
      {activeSubTab === 'servicos' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
            <h3 className="text-base font-bold text-slate-100">Matriz de Preços por Categoria de Veículo (R$)</h3>
            <p className="text-xs text-slate-400">
              Ajuste os valores cobrados conforme o tamanho do veículo (Hatch, Sedan, SUV/Picape, Moto, Utilitário)
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3">Serviço</th>
                    <th className="py-2.5 px-2 text-center">Hatch (Pequeno)</th>
                    <th className="py-2.5 px-2 text-center">Sedan (Médio)</th>
                    <th className="py-2.5 px-2 text-center">SUV (Grande)</th>
                    <th className="py-2.5 px-2 text-center">Moto</th>
                    <th className="py-2.5 px-2 text-center">Utilitário</th>
                    <th className="py-2.5 px-2 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {localServices.map(srv => (
                    <tr key={srv.id} className="hover:bg-slate-950/40">
                      <td className="py-3 px-3 font-bold text-slate-200 max-w-xs">
                        {srv.nome}
                      </td>

                      {(['hatch', 'sedan', 'suv', 'moto', 'utilitario'] as VehicleCategory[]).map(cat => (
                        <td key={cat} className="py-3 px-2 text-center">
                          <input
                            type="number"
                            value={srv.precos[cat] || 0}
                            onChange={e => handleUpdatePrice(srv.id, cat, Number(e.target.value))}
                            className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-cyan-300 font-mono font-bold text-center focus:outline-none focus:border-cyan-500"
                          />
                        </td>
                      ))}

                      <td className="py-3 px-2 text-center">
                        <button
                          onClick={() => handleDeleteService(srv.id)}
                          className="p-1 rounded text-rose-400 hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add New Service Form */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-cyan-400" />
              Cadastrar Novo Serviço no Catálogo
            </h3>

            <form onSubmit={handleAddService} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">Nome do Serviço *</label>
                <input
                  type="text"
                  required
                  value={newSrvNome}
                  onChange={e => setNewSrvNome(e.target.value)}
                  placeholder="Ex: Espelhamento de Pintura"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Preço Hatch (R$)</label>
                <input
                  type="number"
                  value={newSrvHatch}
                  onChange={e => setNewSrvHatch(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono font-bold text-cyan-300"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Preço SUV (R$)</label>
                <input
                  type="number"
                  value={newSrvSuv}
                  onChange={e => setNewSrvSuv(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono font-bold text-cyan-300"
                />
              </div>

              <div className="sm:col-span-4 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold rounded-xl cursor-pointer"
                >
                  Adicionar ao Catálogo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subtab 2: WhatsApp Templates Customizer */}
      {activeSubTab === 'whatsapp' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              Personalizador de Modelos de Mensagem WhatsApp
            </h3>
            <p className="text-xs text-slate-400">
              Utilize tags dinâmicas como <code className="text-cyan-300 font-mono">{'{cliente_nome}'}</code>, <code className="text-cyan-300 font-mono">{'{veiculo}'}</code>, <code className="text-cyan-300 font-mono">{'{placa}'}</code>, <code className="text-cyan-300 font-mono">{'{os_numero}'}</code>, <code className="text-cyan-300 font-mono">{'{valor_total}'}</code> e <code className="text-cyan-300 font-mono">{'{previsao_entrega}'}</code>.
            </p>

            {/* Validation Error Banner */}
            {templateError && (
              <div id="template-validation-error" className="p-3 bg-rose-950/90 border border-rose-700 rounded-xl text-rose-200 text-xs font-bold flex items-center gap-2 animate-fade-in">
                <span>⚠️ {templateError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {localTemplates.map(tpl => {
                const isEmpty = !tpl.conteudo || !tpl.conteudo.trim();

                return (
                  <div 
                    key={tpl.id} 
                    className={`p-4 bg-slate-950 border rounded-xl space-y-2 transition-all ${
                      isEmpty ? 'border-rose-600/80 bg-rose-950/20' : 'border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400">{tpl.titulo}</span>
                      {isEmpty && (
                        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wide">
                          Campo Obrigatório
                        </span>
                      )}
                    </div>

                    <textarea
                      rows={6}
                      value={tpl.conteudo}
                      onChange={e => {
                        handleUpdateTemplateText(tpl.id, e.target.value);
                        if (e.target.value.trim() && templateError) {
                          setTemplateError(null);
                        }
                      }}
                      placeholder="Escreva a mensagem aqui..."
                      className={`w-full bg-slate-900 border rounded-xl p-3 text-xs text-slate-100 font-sans focus:outline-none transition-colors ${
                        isEmpty 
                          ? 'border-rose-500/80 focus:border-rose-400' 
                          : 'border-slate-700 focus:border-emerald-500'
                      }`}
                    />

                    {isEmpty && (
                      <p className="text-[11px] font-semibold text-rose-400 mt-1">
                        ⚠️ O modelo de mensagem não pode ficar vazio (erro de validação).
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Subtab 3: Business Info */}
      {activeSubTab === 'empresa' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4 text-xs">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-cyan-400" />
            Dados Cadastrais do HR LAVACAR
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nome Fantasia da Empresa</label>
              <input
                type="text"
                value={localBusiness.nomeEmpresa}
                onChange={e => setLocalBusiness({ ...localBusiness, nomeEmpresa: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">CNPJ</label>
              <input
                type="text"
                value={localBusiness.cnpj}
                onChange={e => setLocalBusiness({ ...localBusiness, cnpj: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Telefone WhatsApp Suporte</label>
              <input
                type="text"
                value={localBusiness.telefone}
                onChange={e => setLocalBusiness({ ...localBusiness, telefone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Chave PIX para Recibos</label>
              <input
                type="text"
                value={localBusiness.chavePix}
                onChange={e => setLocalBusiness({ ...localBusiness, chavePix: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-cyan-300 font-mono font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Endereço Completo</label>
              <input
                type="text"
                value={localBusiness.endereco}
                onChange={e => setLocalBusiness({ ...localBusiness, endereco: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>
          </div>
        </div>
      )}

      {/* Subtab 4: Security PIN */}
      {activeSubTab === 'seguranca' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4 max-w-md text-xs">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-400" />
            Alterar PIN de Segurança do Administrador
          </h3>
          <p className="text-slate-400">
            Este PIN de 6 dígitos protege as telas de Caixa, Financeiro, Estoque e Relatórios contra acesso de funcionários.
          </p>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">PIN Atual (6 dígitos)</label>
            <input
              type="text"
              maxLength={6}
              value={localBusiness.pinSeguranca}
              onChange={e => setLocalBusiness({ ...localBusiness, pinSeguranca: e.target.value.replace(/\D/g, '') })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-base text-cyan-400 font-mono font-bold text-center tracking-widest"
            />
          </div>
        </div>
      )}

      {/* Subtab 5: Banco de Dados & GitHub */}
      {activeSubTab === 'banco_dados' && (
        <div className="space-y-6 text-xs">
          
          {/* Feedback Status Message */}
          {dbStatusMsg && (
            <div className={`p-4 rounded-xl border flex items-center gap-3 animate-fade-in ${
              dbStatusMsg.type === 'success' 
                ? 'bg-emerald-950/80 border-emerald-700 text-emerald-200' 
                : 'bg-rose-950/80 border-rose-700 text-rose-200'
            }`}>
              {dbStatusMsg.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <span className="font-bold">{dbStatusMsg.text}</span>
            </div>
          )}

          {/* Backup & Restore Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Export JSON Backup */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
                <Download className="w-5 h-5 text-cyan-400" />
                <span>Exportar Backup do Banco (JSON)</span>
              </div>
              <p className="text-slate-400">
                Baixe uma cópia de segurança completa com todos os Clientes, Ordens de Serviço, Estoque e Configurações salvas no sistema.
              </p>
              <button
                type="button"
                onClick={handleExportBackup}
                className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/30 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Backup Completo (.JSON)</span>
              </button>
            </div>

            {/* Import JSON Backup */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
                <Upload className="w-5 h-5 text-emerald-400" />
                <span>Restaurar / Importar Backup (JSON)</span>
              </div>
              <p className="text-slate-400">
                Selecione um arquivo de backup <code className="text-emerald-300 font-mono">.json</code> baixado anteriormente para restaurar a base de dados completa.
              </p>
              <label className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-700/60 font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all">
                <Upload className="w-4 h-4" />
                <span>Selecionar Arquivo Backup (.JSON)</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>

          </div>

          {/* GitHub Integration Info Panel */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
              <GitBranch className="w-5 h-5 text-purple-400" />
              <span>Sincronização & Repositório GitHub</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              O sistema <strong>HR LAVACAR</strong> executa localmente no seu navegador e pode ser hospedado e sincronizado diretamente em qualquer repositório no <strong>GitHub</strong>.
            </p>

            <div className="space-y-2">
              <label className="block text-slate-300 font-semibold">URL do Repositório GitHub do Projeto</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={gitRepoUrl}
                  onChange={e => setGitRepoUrl(e.target.value)}
                  placeholder="https://github.com/usuario/repositorio"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-200 font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(gitRepoUrl);
                    setDbStatusMsg({ type: 'success', text: 'Link do GitHub copiado para a área de transferência!' });
                    setTimeout(() => setDbStatusMsg(null), 3000);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 cursor-pointer"
                >
                  Copiar Link
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="font-bold text-slate-200 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                <span>Instruções para salvar dados no GitHub:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-1">
                <li>Exporte o backup em formato JSON no botão acima.</li>
                <li>Adicione o arquivo <code className="text-cyan-300 font-mono">banco_dados.json</code> no diretório <code className="text-cyan-300 font-mono">/src/data/</code> do repositório no GitHub.</li>
                <li>Faça commit e push para atualizar o repositório principal no GitHub.</li>
              </ol>
            </div>
          </div>

          {/* Danger Zone: Clear DB */}
          <div className="bg-slate-900/90 border border-rose-900/50 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <span>Zona de Perigo: Limpar Banco de Dados</span>
            </div>
            <p className="text-slate-400">
              Esta ação apagará todo o histórico local armazenado no seu navegador. Certifique-se de ter um backup antes de prosseguir.
            </p>
            <button
              type="button"
              onClick={handleClearDatabase}
              className="py-2.5 px-4 bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-800 font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-all"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Limpar Todos os Dados Locais</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
