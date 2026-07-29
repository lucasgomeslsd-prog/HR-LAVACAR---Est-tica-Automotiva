import React, { useState, useEffect } from 'react';

// Domain Types
import { 
  UserRole, 
  TabType, 
  ServiceOrder, 
  Client, 
  Vehicle, 
  Appointment, 
  DailyCashRegister, 
  CashTransaction,
  InventoryItem, 
  ServiceItem, 
  WhatsAppTemplate, 
  WhatsAppApiConfig, 
  BusinessConfig,
  OSStatus,
  PaymentStatus,
  WhatsAppLog
} from './types';

// Storage Service
import { StorageService } from './services/storage';
import { FirestoreSync } from './services/firestoreSync';

// Header & Navigation
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { PinModal } from './components/PinModal';

// Tabs Views
import { Dashboard } from './components/Dashboard';
import { ClientList } from './components/Clients/ClientList';
import { ClientModal } from './components/Clients/ClientModal';
import { ServiceOrderList } from './components/ServiceOrders/ServiceOrderList';
import { ServiceOrderModal } from './components/ServiceOrders/ServiceOrderModal';
import { ServiceOrderReceipt } from './components/ServiceOrders/ServiceOrderReceipt';
import { ProductionBoard } from './components/Production/ProductionBoard';
import { ChecklistModal } from './components/Checklist/ChecklistModal';
import { AppointmentList } from './components/Appointments/AppointmentList';
import { CashRegister } from './components/Finance/CashRegister';
import { FinancialReports } from './components/Finance/FinancialReports';
import { InventoryList } from './components/Inventory/InventoryList';
import { ReportsView } from './components/Reports/ReportsView';
import { SettingsView } from './components/Settings/SettingsView';
import { WhatsAppSendModal } from './components/WhatsApp/WhatsAppSendModal';

export function App() {
  // App Role & Security PIN State
  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN');
  const [pinUnlocked, setPinUnlocked] = useState<boolean>(true); // Admin starts unlocked in session
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [pendingTab, setPendingTab] = useState<TabType | null>(null);

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Core Data States
  const [orders, setOrders] = useState<ServiceOrder[]>(() => StorageService.getOrders() || []);
  const [clients, setClients] = useState<Client[]>(() => StorageService.getClients() || []);
  const [appointments, setAppointments] = useState<Appointment[]>(() => StorageService.getAppointments() || []);
  const [cashRegister, setCashRegister] = useState<DailyCashRegister>(() => StorageService.getCashRegister());
  const [inventory, setInventory] = useState<InventoryItem[]>(() => StorageService.getInventory() || []);
  const [services, setServices] = useState<ServiceItem[]>(() => StorageService.getServices() || []);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>(() => StorageService.getTemplates() || []);
  const [waConfig, setWaConfig] = useState<WhatsAppApiConfig>(() => StorageService.getWaConfig());
  const [businessConfig, setBusinessConfig] = useState<BusinessConfig>(() => StorageService.getBusinessConfig());

  // Modals & Active Selections
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [isOSModalOpen, setIsOSModalOpen] = useState(false);
  const [editingOS, setEditingOS] = useState<ServiceOrder | null>(null);
  const [preselectedClient, setPreselectedClient] = useState<Client | null>(null);
  const [preselectedVehicle, setPreselectedVehicle] = useState<Vehicle | null>(null);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedReceiptOS, setSelectedReceiptOS] = useState<ServiceOrder | null>(null);

  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [selectedChecklistOS, setSelectedChecklistOS] = useState<ServiceOrder | null>(null);

  const [isWhatsAppSendModalOpen, setIsWhatsAppSendModalOpen] = useState(false);
  const [selectedWaOS, setSelectedWaOS] = useState<ServiceOrder | null>(null);
  const [selectedWaClient, setSelectedWaClient] = useState<Client | null>(null);

  // Load Initial Data and start Firestore Real-Time Cloud Sync on Mount
  useEffect(() => {
    // 1. Initial local load
    const data = StorageService.loadAllData();
    setOrders(data.orders);
    setClients(data.clients);
    setAppointments(data.appointments);
    setCashRegister(data.cashRegister);
    setInventory(data.inventory);
    setServices(data.services);
    setTemplates(data.templates);
    setWaConfig(data.waConfig);
    setBusinessConfig(data.businessConfig);

    // 2. Initialize Firestore real-time listener across all shared links
    FirestoreSync.init({
      onClientsUpdate: (cloudClients) => {
        setClients(cloudClients);
        StorageService.saveClients(cloudClients);
      },
      onOrdersUpdate: (cloudOrders) => {
        setOrders(cloudOrders);
        StorageService.saveOrders(cloudOrders);
      },
      onAppointmentsUpdate: (cloudApts) => {
        setAppointments(cloudApts);
        StorageService.saveAppointments(cloudApts);
      },
      onServicesUpdate: (cloudServices) => {
        if (cloudServices.length > 0) {
          setServices(cloudServices);
          StorageService.saveServices(cloudServices);
        }
      },
      onInventoryUpdate: (cloudInventory) => {
        setInventory(cloudInventory);
        StorageService.saveInventory(cloudInventory);
      },
      onTemplatesUpdate: (cloudTemplates) => {
        if (cloudTemplates.length > 0) {
          setTemplates(cloudTemplates);
          StorageService.saveTemplates(cloudTemplates);
        }
      },
      onWaConfigUpdate: (cloudWa) => {
        setWaConfig(cloudWa);
        StorageService.saveWaConfig(cloudWa);
      },
      onBusinessConfigUpdate: (cloudBusiness) => {
        setBusinessConfig(cloudBusiness);
        StorageService.saveBusinessConfig(cloudBusiness);
      },
      onCashRegisterUpdate: (cloudCash) => {
        setCashRegister(cloudCash);
        StorageService.saveCashRegister(cloudCash);
      }
    });
  }, []);

  // Sync state changes back to StorageService
  useEffect(() => {
    StorageService.saveOrders(orders);
  }, [orders]);

  useEffect(() => {
    StorageService.saveClients(clients);
  }, [clients]);

  useEffect(() => {
    StorageService.saveAppointments(appointments);
  }, [appointments]);

  useEffect(() => {
    if (cashRegister) StorageService.saveCashRegister(cashRegister);
  }, [cashRegister]);

  useEffect(() => {
    StorageService.saveInventory(inventory);
  }, [inventory]);

  useEffect(() => {
    if (services.length > 0) StorageService.saveServices(services);
  }, [services]);

  useEffect(() => {
    if (templates.length > 0) StorageService.saveTemplates(templates);
  }, [templates]);

  useEffect(() => {
    if (waConfig) StorageService.saveWaConfig(waConfig);
  }, [waConfig]);

  useEffect(() => {
    if (businessConfig) StorageService.saveBusinessConfig(businessConfig);
  }, [businessConfig]);

  // Tab Navigation with PIN Protection Check
  const handleTabChange = (tab: TabType) => {
    const isProtected = ['caixa', 'financeiro', 'estoque', 'relatorios', 'configuracoes'].includes(tab);

    if (currentRole === 'EMPLOYEE' && isProtected) {
      alert('Área restrita somente para Administradores.');
      return;
    }

    if (currentRole === 'ADMIN' && isProtected && !pinUnlocked) {
      setPendingTab(tab);
      setIsPinModalOpen(true);
      return;
    }

    setActiveTab(tab);
  };

  const handleVerifyPin = (pinInput: string): boolean => {
    const correctPin = businessConfig?.pinSeguranca || (businessConfig as any)?.pinFinanceiro || '123456';
    if (pinInput === correctPin) {
      setPinUnlocked(true);
      StorageService.setPinUnlocked(true);
      setIsPinModalOpen(false);
      if (pendingTab) {
        setActiveTab(pendingTab);
        setPendingTab(null);
      }
      return true;
    }
    return false;
  };

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'EMPLOYEE') {
      // Fallback to employee allowed tab
      if (['caixa', 'financeiro', 'estoque', 'relatorios', 'configuracoes'].includes(activeTab)) {
        setActiveTab('producao');
      }
    }
  };

  // --- Handlers for Clients ---
  const handleSaveClient = (client: Client, openWaAfter: boolean) => {
    let updated: Client[];
    const exists = clients.some(c => c.id === client.id);

    if (exists) {
      updated = clients.map(c => (c.id === client.id ? client : c));
    } else {
      updated = [client, ...clients];
    }

    setClients(updated);
    FirestoreSync.saveClient(client);

    if (openWaAfter) {
      setSelectedWaClient(client);
      setSelectedWaOS(null);
      setIsWhatsAppSendModalOpen(true);
    }
  };

  const handleDeleteClient = (clientId: string) => {
    setClients(prev => (prev || []).filter(c => c.id !== clientId));
    FirestoreSync.deleteClient(clientId);
  };

  // --- Central Auto-Sync Helper for Cash Register ---
  const syncCashRegisterForOS = (order: ServiceOrder, isDelete: boolean = false) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setCashRegister(prevCash => {
      const activeCash: DailyCashRegister = prevCash || {
        id: `cash-${todayStr.replace(/-/g, '')}`,
        data: todayStr,
        status: 'ABERTO',
        saldoInicial: 0,
        dataAbertura: new Date().toISOString(),
        usuarioAbertura: 'Caixa Automático HR LAVACAR',
        movimentacoes: []
      };

      let movimentacoes = [...(activeCash.movimentacoes || [])];

      if (isDelete || order.status === 'CANCELADA') {
        movimentacoes = movimentacoes.filter(m => m.osId !== order.id && m.id !== `mvt-os-${order.id}`);
      } else {
        const isPaid = order.statusPagamento === 'PAGO' || order.statusPagamento === 'PAGO_PARCIAL';
        const isCompleted = order.status === 'PRONTO' || order.status === 'ENTREGUE';

        if (isPaid || isCompleted || (order.valorFinal > 0 && order.status !== 'AGUARDANDO')) {
          const existingIndex = movimentacoes.findIndex(m => m.osId === order.id || m.id === `mvt-os-${order.id}`);

          const txData: CashTransaction = {
            id: `mvt-os-${order.id}`,
            osId: order.id,
            tipo: 'ENTRADA',
            categoria: 'SERVICO',
            descricao: `OS #${order.numeroOS} - ${order.clientNome} (${order.vehiclePlaca || 'S/ Placa'})`,
            valor: Math.max(0, order.valorFinal || 0),
            formaPagamento: order.formaPagamento || 'PIX',
            dataHora: existingIndex >= 0 ? movimentacoes[existingIndex].dataHora : new Date().toISOString(),
            usuario: order.responsavelLavagem || 'Sistema OS'
          };

          if (existingIndex >= 0) {
            movimentacoes[existingIndex] = txData;
          } else {
            movimentacoes.unshift(txData);
          }
        } else {
          movimentacoes = movimentacoes.filter(m => m.osId !== order.id && m.id !== `mvt-os-${order.id}`);
        }
      }

      const updatedCash: DailyCashRegister = {
        ...activeCash,
        data: todayStr,
        movimentacoes
      };

      StorageService.saveCashRegister(updatedCash);
      FirestoreSync.saveCashRegister(updatedCash);

      return updatedCash;
    });
  };

  // --- Handlers for Service Orders (OS) ---
  const handleSaveOS = (order: ServiceOrder, openChecklistAfter: boolean) => {
    let updated: ServiceOrder[];
    const safeOrders = orders || [];
    const exists = safeOrders.some(o => o.id === order.id);

    if (exists) {
      updated = safeOrders.map(o => (o.id === order.id ? order : o));
    } else {
      updated = [order, ...safeOrders];
    }

    setOrders(updated);
    FirestoreSync.saveOrder(order);

    // Auto-synchronize with Cash Register
    syncCashRegisterForOS(order, false);

    if (openChecklistAfter) {
      setSelectedChecklistOS(order);
      setIsChecklistModalOpen(true);
    } else {
      // Offer WhatsApp dispatch for new OS
      setSelectedWaOS(order);
      setSelectedWaClient(null);
      setIsWhatsAppSendModalOpen(true);
    }
  };

  const handleDeleteOS = (orderId: string) => {
    const targetOrder = (orders || []).find(o => o.id === orderId);
    setOrders(prev => (prev || []).filter(o => o.id !== orderId));
    FirestoreSync.deleteOrder(orderId);

    if (targetOrder) {
      syncCashRegisterForOS(targetOrder, true);
    }
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OSStatus) => {
    const safeOrders = orders || [];
    let updatedTarget: ServiceOrder | null = null;
    const updated = safeOrders.map(o => {
      if (o.id === orderId) {
        const orderUpdated = { ...o, status: newStatus };
        updatedTarget = orderUpdated;
        
        // Auto trigger WhatsApp "Car Ready" modal if status changed to PRONTO
        if (newStatus === 'PRONTO' && o.status !== 'PRONTO') {
          setTimeout(() => {
            setSelectedWaOS(orderUpdated);
            setSelectedWaClient(null);
            setIsWhatsAppSendModalOpen(true);
          }, 300);
        }

        return orderUpdated;
      }
      return o;
    });

    setOrders(updated);
    if (updatedTarget) {
      FirestoreSync.saveOrder(updatedTarget);
      syncCashRegisterForOS(updatedTarget, false);
    }
  };

  const handleUpdatePaymentStatus = (orderId: string, newStatus: PaymentStatus) => {
    let updatedTarget: ServiceOrder | null = null;
    setOrders(prev =>
      (prev || []).map(o => {
        if (o.id === orderId) {
          const u = { ...o, statusPagamento: newStatus };
          updatedTarget = u;
          return u;
        }
        return o;
      })
    );
    if (updatedTarget) {
      FirestoreSync.saveOrder(updatedTarget);
      syncCashRegisterForOS(updatedTarget, false);
    }
  };

  const handleSaveChecklist = (orderId: string, checklistData: any) => {
    let updatedTarget: ServiceOrder | null = null;
    setOrders(prev =>
      (prev || []).map(o => {
        if (o.id === orderId) {
          const u = { ...o, checklist: checklistData };
          updatedTarget = u;
          return u;
        }
        return o;
      })
    );
    if (updatedTarget) {
      FirestoreSync.saveOrder(updatedTarget);
    }
  };

  const handleRecordWaLog = (log: WhatsAppLog) => {
    if (log.osId) {
      let updatedTarget: ServiceOrder | null = null;
      setOrders(prev =>
        (prev || []).map(o => {
          if (o.id === log.osId) {
            const u = {
              ...o,
              historicoWhatsApp: [log, ...(o.historicoWhatsApp || [])]
            };
            updatedTarget = u;
            return u;
          }
          return o;
        })
      );
      if (updatedTarget) {
        FirestoreSync.saveOrder(updatedTarget);
      }
    }
  };

  // Convert Appointment -> OS
  const handleConvertAppointmentToOS = (apt: Appointment) => {
    const safeClients = clients || [];
    const client = safeClients.find(c => c.id === apt.clientId);
    const vehicle = client?.veiculos?.find(v => v.placa === apt.vehiclePlaca) || client?.veiculos?.[0];

    setEditingOS(null);
    setPreselectedClient(client || null);
    setPreselectedVehicle(vehicle || null);
    setIsOSModalOpen(true);

    // Update status to CONVERTIDO_EM_OS
    const updatedApt: Appointment = {
      ...apt,
      status: 'CONVERTIDO_EM_OS'
    };
    setAppointments(prev => (prev || []).map(a => a.id === apt.id ? updatedApt : a));
    FirestoreSync.saveAppointment(updatedApt);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white flex flex-col">
      
      {/* Top Application Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        pinUnlocked={pinUnlocked}
        onLockPin={() => setPinUnlocked(false)}
        onOpenPinModal={() => setIsPinModalOpen(true)}
        onOpenNewOS={() => {
          setEditingOS(null);
          setIsOSModalOpen(true);
        }}
        onOpenNewClient={() => {
          setEditingClient(null);
          setIsClientModalOpen(true);
        }}
        businessConfig={businessConfig}
      />

      {/* Main Container Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 pt-3 pb-28 md:py-6 flex flex-col md:flex-row gap-4 sm:gap-6">
        
        {/* Responsive Side Menu */}
        <Navigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          currentRole={currentRole}
          pinUnlocked={pinUnlocked}
          onRequestPinUnlock={() => setIsPinModalOpen(true)}
          counts={{
            prontosCount: (orders || []).filter(o => o.status === 'PRONTO').length,
            emProducaoCount: (orders || []).filter(o => ['LAVAGEM', 'POLIMENTO', 'INSPECAO'].includes(o.status)).length,
            agendamentosHoje: (appointments || []).length,
            estoqueBaixo: (inventory || []).filter(i => i.quantidade <= (i.minimo ?? i.quantidadeMinima ?? 0)).length,
          }}
        />

        {/* Dynamic Workspace Tab Render */}
        <main className="flex-1 min-w-0 pb-16 md:pb-0">
          
          {/* Dashboard View */}
          {activeTab === 'dashboard' && (
            <Dashboard
              orders={orders}
              clients={clients}
              inventory={inventory}
              role={currentRole as any}
              pinUnlocked={pinUnlocked}
              onRequestPinUnlock={() => setIsPinModalOpen(true)}
              onNavigate={handleTabChange}
              onNavigateTab={handleTabChange}
              onOpenNewOS={() => {
                setEditingOS(null);
                setIsOSModalOpen(true);
              }}
              onOpenNewClient={() => {
                setEditingClient(null);
                setIsClientModalOpen(true);
              }}
              onOpenWhatsAppModal={(osId, clientId) => {
                const targetOS = orders.find(o => o.id === osId) || null;
                const targetClient = clients.find(c => c.id === clientId) || null;
                setSelectedWaOS(targetOS);
                setSelectedWaClient(targetClient);
                setIsWhatsAppSendModalOpen(true);
              }}
            />
          )}

          {/* Clients View */}
          {activeTab === 'clientes' && (
            <ClientList
              clients={clients}
              orders={orders}
              onOpenNewClient={() => {
                setEditingClient(null);
                setIsClientModalOpen(true);
              }}
              onEditClient={client => {
                setEditingClient(client);
                setIsClientModalOpen(true);
              }}
              onDeleteClient={handleDeleteClient}
              onOpenWhatsAppModal={(osId, clientId) => {
                if (clientId) {
                  const client = clients.find(c => c.id === clientId);
                  setSelectedWaClient(client || null);
                  setSelectedWaOS(null);
                } else if (osId) {
                  const os = orders.find(o => o.id === osId);
                  setSelectedWaOS(os || null);
                  setSelectedWaClient(null);
                }
                setIsWhatsAppSendModalOpen(true);
              }}
              onOpenNewOSForVehicle={(client, vehicle) => {
                setEditingOS(null);
                setPreselectedClient(client);
                setPreselectedVehicle(vehicle);
                setIsOSModalOpen(true);
              }}
            />
          )}

          {/* Service Orders (OS) View */}
          {activeTab === 'os' && (
            <ServiceOrderList
              orders={orders}
              onOpenNewOS={() => {
                setEditingOS(null);
                setIsOSModalOpen(true);
              }}
              onEditOrder={order => {
                setEditingOS(order);
                setIsOSModalOpen(true);
              }}
              onDeleteOrder={handleDeleteOS}
              onOpenWhatsAppModal={(osId) => {
                const targetOS = orders.find(o => o.id === osId) || null;
                setSelectedWaOS(targetOS);
                setSelectedWaClient(null);
                setIsWhatsAppSendModalOpen(true);
              }}
              onOpenChecklist={order => {
                setSelectedChecklistOS(order);
                setIsChecklistModalOpen(true);
              }}
              onViewOSReceipt={order => {
                setSelectedReceiptOS(order);
                setIsReceiptModalOpen(true);
              }}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onUpdatePaymentStatus={handleUpdatePaymentStatus}
            />
          )}

          {/* Production Esteira View */}
          {activeTab === 'producao' && (
            <ProductionBoard
              orders={orders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onOpenChecklist={order => {
                setSelectedChecklistOS(order);
                setIsChecklistModalOpen(true);
              }}
              onOpenWhatsApp={order => {
                setSelectedWaOS(order);
                setSelectedWaClient(null);
                setIsWhatsAppSendModalOpen(true);
              }}
            />
          )}

          {/* Appointments View */}
          {activeTab === 'agendamentos' && (
            <AppointmentList
              appointments={appointments}
              clients={clients}
              onSaveAppointment={apt => {
                setAppointments(prev => [apt, ...prev]);
                FirestoreSync.saveAppointment(apt);
              }}
              onDeleteAppointment={aptId => {
                setAppointments(prev => prev.filter(a => a.id !== aptId));
                FirestoreSync.deleteAppointment(aptId);
              }}
              onConvertAppointmentToOS={handleConvertAppointmentToOS}
              onOpenWhatsAppModal={(osId, clientId) => {
                const targetClient = clients.find(c => c.id === clientId) || null;
                setSelectedWaClient(targetClient);
                setSelectedWaOS(null);
                setIsWhatsAppSendModalOpen(true);
              }}
            />
          )}

          {/* Cash Register View (Admin + PIN) */}
          {activeTab === 'caixa' && cashRegister && (
            <CashRegister
              cashRegister={cashRegister}
              onSaveCashRegister={newCash => {
                setCashRegister(newCash);
                StorageService.saveCashRegister(newCash);
                FirestoreSync.saveCashRegister(newCash);
              }}
            />
          )}

          {/* Financial DRE View (Admin + PIN) */}
          {activeTab === 'financeiro' && businessConfig && (
            <FinancialReports
              orders={orders}
              businessConfig={businessConfig}
            />
          )}

          {/* Inventory View (Admin + PIN) */}
          {activeTab === 'estoque' && (
            <InventoryList
              inventory={inventory}
              onSaveInventory={newInv => {
                setInventory(newInv);
                FirestoreSync.saveInventory(newInv);
              }}
            />
          )}

          {/* Reports View (Admin + PIN) */}
          {activeTab === 'relatorios' && (
            <ReportsView orders={orders} />
          )}

          {/* Settings View (Admin + PIN) */}
          {activeTab === 'configuracoes' && waConfig && businessConfig && (
            <SettingsView
              services={services}
              templates={templates}
              waConfig={waConfig}
              businessConfig={businessConfig}
              onSaveServices={newSrvs => {
                setServices(newSrvs);
                FirestoreSync.saveServices(newSrvs);
              }}
              onSaveTemplates={newTpls => {
                setTemplates(newTpls);
                FirestoreSync.saveTemplates(newTpls);
              }}
              onSaveWaConfig={newWa => {
                setWaConfig(newWa);
                FirestoreSync.saveWaConfig(newWa);
              }}
              onSaveBusinessConfig={newBiz => {
                setBusinessConfig(newBiz);
                FirestoreSync.saveBusinessConfig(newBiz);
              }}
            />
          )}

        </main>
      </div>

      {/* Global Modals Container */}

      {/* Security PIN Modal */}
      <PinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onVerifyPin={handleVerifyPin}
      />

      {/* Client Modal */}
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSave={handleSaveClient}
        editingClient={editingClient}
      />

      {/* Service Order (OS) Creation & Edit Modal */}
      <ServiceOrderModal
        isOpen={isOSModalOpen}
        onClose={() => {
          setIsOSModalOpen(false);
          setPreselectedClient(null);
          setPreselectedVehicle(null);
        }}
        onSave={handleSaveOS}
        clients={clients}
        servicesCatalog={services}
        editingOrder={editingOS}
        preselectedClient={preselectedClient}
        preselectedVehicle={preselectedVehicle}
      />

      {/* Service Order Printable Receipt Modal */}
      {selectedReceiptOS && businessConfig && (
        <ServiceOrderReceipt
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          order={selectedReceiptOS}
          businessConfig={businessConfig}
          onSendWhatsApp={() => {
            setIsReceiptModalOpen(false);
            setSelectedWaOS(selectedReceiptOS);
            setSelectedWaClient(null);
            setIsWhatsAppSendModalOpen(true);
          }}
        />
      )}

      {/* Vehicle Inspection Checklist Modal */}
      {selectedChecklistOS && (
        <ChecklistModal
          isOpen={isChecklistModalOpen}
          onClose={() => setIsChecklistModalOpen(false)}
          order={selectedChecklistOS}
          onSave={handleSaveChecklist}
          onSaveChecklist={handleSaveChecklist}
        />
      )}

      {/* WhatsApp Dispatches & Templates Modal */}
      {businessConfig && waConfig && (
        <WhatsAppSendModal
          isOpen={isWhatsAppSendModalOpen}
          onClose={() => setIsWhatsAppSendModalOpen(false)}
          order={selectedWaOS}
          client={selectedWaClient}
          templates={templates}
          waConfig={waConfig}
          businessConfig={businessConfig}
          onRecordLog={handleRecordWaLog}
        />
      )}

    </div>
  );
}

export default App;
