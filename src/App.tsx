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

  // Load Initial Data from StorageService on Mount
  useEffect(() => {
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
    setPreselectedClient(client);
    if (client.veiculos && client.veiculos.length > 0) {
      setPreselectedVehicle(client.veiculos[0]);
    }

    if (openWaAfter) {
      setSelectedWaClient(client);
      setSelectedWaOS(null);
      setIsWhatsAppSendModalOpen(true);
    }
  };

  const handleDeleteClient = (clientId: string) => {
    setClients(prev => (prev || []).filter(c => c.id !== clientId));
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
    setOrders(prev => (prev || []).filter(o => o.id !== orderId));
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OSStatus) => {
    const safeOrders = orders || [];
    const updated = safeOrders.map(o => {
      if (o.id === orderId) {
        const orderUpdated = { ...o, status: newStatus };
        
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
  };

  const handleUpdatePaymentStatus = (orderId: string, newStatus: PaymentStatus) => {
    setOrders(prev =>
      (prev || []).map(o => (o.id === orderId ? { ...o, statusPagamento: newStatus } : o))
    );
  };

  const handleSaveChecklist = (orderId: string, checklistData: any) => {
    setOrders(prev =>
      (prev || []).map(o => (o.id === orderId ? { ...o, checklist: checklistData } : o))
    );
  };

  const handleRecordWaLog = (log: WhatsAppLog) => {
    if (log.osId) {
      setOrders(prev =>
        (prev || []).map(o => {
          if (o.id === log.osId) {
            return {
              ...o,
              historicoWhatsApp: [log, ...(o.historicoWhatsApp || [])]
            };
          }
          return o;
        })
      );
    }
  };

  // Convert Appointment -> OS
  const handleConvertAppointmentToOS = (apt: Appointment) => {
    const safeClients = clients || [];
    const client = safeClients.find(c => c.id === apt.clientId);
    const vehicle = client?.veiculos?.find(v => v.placa === apt.vehiclePlaca);

    setEditingOS(null);
    setIsOSModalOpen(true);

    // Remove from appointments roster
    setAppointments(prev => (prev || []).filter(a => a.id !== apt.id));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-blue-600 selection:text-white flex flex-col">
      
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
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-4 pb-20 md:py-6 flex flex-col md:flex-row gap-6">
        
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
        <main className="flex-1 min-w-0 pb-12 md:pb-0">
          
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
              onSaveAppointment={apt => setAppointments(prev => [apt, ...prev])}
              onDeleteAppointment={aptId => setAppointments(prev => prev.filter(a => a.id !== aptId))}
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
              onSaveCashRegister={setCashRegister}
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
              onSaveInventory={setInventory}
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
              onSaveServices={setServices}
              onSaveTemplates={setTemplates}
              onSaveWaConfig={setWaConfig}
              onSaveBusinessConfig={setBusinessConfig}
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
        onOpenNewClient={() => {
          setIsOSModalOpen(false);
          setEditingClient(null);
          setIsClientModalOpen(true);
        }}
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
