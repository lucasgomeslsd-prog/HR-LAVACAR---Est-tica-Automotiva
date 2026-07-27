import { 
  Client, 
  ServiceItem, 
  ServiceOrder, 
  Appointment, 
  DailyCashRegister, 
  InventoryItem, 
  WhatsAppTemplate, 
  WhatsAppApiConfig, 
  BusinessConfig,
  WhatsAppLog,
  Role,
  CashTransaction
} from '../types';

import { 
  INITIAL_SERVICES, 
  INITIAL_CLIENTS, 
  INITIAL_SERVICE_ORDERS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_TEMPLATES, 
  INITIAL_WA_CONFIG, 
  INITIAL_BUSINESS_CONFIG, 
  INITIAL_INVENTORY, 
  INITIAL_CASH_REGISTER 
} from '../data/initialData';

const KEYS = {
  CLIENTS: 'hr_lavacar_clients_v2',
  SERVICES: 'hr_lavacar_services_v2',
  SERVICE_ORDERS: 'hr_lavacar_orders_v2',
  APPOINTMENTS: 'hr_lavacar_appointments_v2',
  TEMPLATES: 'hr_lavacar_templates_v2',
  WA_CONFIG: 'hr_lavacar_wa_config_v2',
  BUSINESS_CONFIG: 'hr_lavacar_business_config_v2',
  INVENTORY: 'hr_lavacar_inventory_v2',
  CASH_REGISTER: 'hr_lavacar_cash_register_v2',
  ACTIVE_ROLE: 'hr_lavacar_active_role_v2',
  PIN_UNLOCKED: 'hr_lavacar_pin_unlocked_session_v2'
};

export const StorageService = {
  // Clients
  getClients: (): Client[] => {
    const data = localStorage.getItem(KEYS.CLIENTS);
    return data ? JSON.parse(data) : INITIAL_CLIENTS;
  },
  saveClients: (clients: Client[]) => {
    localStorage.setItem(KEYS.CLIENTS, JSON.stringify(clients));
  },

  // Services
  getServices: (): ServiceItem[] => {
    const data = localStorage.getItem(KEYS.SERVICES);
    return data ? JSON.parse(data) : INITIAL_SERVICES;
  },
  saveServices: (services: ServiceItem[]) => {
    localStorage.setItem(KEYS.SERVICES, JSON.stringify(services));
  },

  // Service Orders
  getOrders: (): ServiceOrder[] => {
    const data = localStorage.getItem(KEYS.SERVICE_ORDERS);
    return data ? JSON.parse(data) : INITIAL_SERVICE_ORDERS;
  },
  saveOrders: (orders: ServiceOrder[]) => {
    localStorage.setItem(KEYS.SERVICE_ORDERS, JSON.stringify(orders));
  },

  // Appointments
  getAppointments: (): Appointment[] => {
    const data = localStorage.getItem(KEYS.APPOINTMENTS);
    return data ? JSON.parse(data) : INITIAL_APPOINTMENTS;
  },
  saveAppointments: (appointments: Appointment[]) => {
    localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(appointments));
  },

  // WhatsApp Templates
  getTemplates: (): WhatsAppTemplate[] => {
    const data = localStorage.getItem(KEYS.TEMPLATES);
    return data ? JSON.parse(data) : INITIAL_TEMPLATES;
  },
  saveTemplates: (templates: WhatsAppTemplate[]) => {
    localStorage.setItem(KEYS.TEMPLATES, JSON.stringify(templates));
  },

  // WhatsApp Config
  getWaConfig: (): WhatsAppApiConfig => {
    const data = localStorage.getItem(KEYS.WA_CONFIG);
    return data ? JSON.parse(data) : INITIAL_WA_CONFIG;
  },
  saveWaConfig: (config: WhatsAppApiConfig) => {
    localStorage.setItem(KEYS.WA_CONFIG, JSON.stringify(config));
  },

  // Business Config
  getBusinessConfig: (): BusinessConfig => {
    const data = localStorage.getItem(KEYS.BUSINESS_CONFIG);
    return data ? JSON.parse(data) : INITIAL_BUSINESS_CONFIG;
  },
  saveBusinessConfig: (config: BusinessConfig) => {
    localStorage.setItem(KEYS.BUSINESS_CONFIG, JSON.stringify(config));
  },

  // Inventory
  getInventory: (): InventoryItem[] => {
    const data = localStorage.getItem(KEYS.INVENTORY);
    return data ? JSON.parse(data) : INITIAL_INVENTORY;
  },
  saveInventory: (inventory: InventoryItem[]) => {
    localStorage.setItem(KEYS.INVENTORY, JSON.stringify(inventory));
  },

  // Cash Register
  getCashRegister: (): DailyCashRegister => {
    const data = localStorage.getItem(KEYS.CASH_REGISTER);
    return data ? JSON.parse(data) : INITIAL_CASH_REGISTER;
  },
  saveCashRegister: (cashRegister: DailyCashRegister) => {
    localStorage.setItem(KEYS.CASH_REGISTER, JSON.stringify(cashRegister));
  },

  // Role
  getActiveRole: (): Role => {
    const role = localStorage.getItem(KEYS.ACTIVE_ROLE) as Role;
    return role || 'admin';
  },
  saveActiveRole: (role: Role) => {
    localStorage.setItem(KEYS.ACTIVE_ROLE, role);
  },

  // PIN Session Unlock
  getPinUnlocked: (): boolean => {
    return localStorage.getItem(KEYS.PIN_UNLOCKED) === 'true';
  },
  setPinUnlocked: (unlocked: boolean) => {
    localStorage.setItem(KEYS.PIN_UNLOCKED, unlocked ? 'true' : 'false');
  },

  // Reset to initial
  resetAllData: () => {
    localStorage.clear();
  },

  // Export full JSON backup
  exportBackupJson: (): string => {
    const backupObj = {
      app: 'HR_LAVACAR',
      exportedAt: new Date().toISOString(),
      version: '2.0',
      data: StorageService.loadAllData()
    };
    return JSON.stringify(backupObj, null, 2);
  },

  // Import full JSON backup
  importBackupJson: (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      const data = parsed.data || parsed;

      if (data.clients) StorageService.saveClients(data.clients);
      if (data.services) StorageService.saveServices(data.services);
      if (data.orders) StorageService.saveOrders(data.orders);
      if (data.appointments) StorageService.saveAppointments(data.appointments);
      if (data.templates) StorageService.saveTemplates(data.templates);
      if (data.waConfig) StorageService.saveWaConfig(data.waConfig);
      if (data.businessConfig) StorageService.saveBusinessConfig(data.businessConfig);
      if (data.inventory) StorageService.saveInventory(data.inventory);
      if (data.cashRegister) StorageService.saveCashRegister(data.cashRegister);

      return true;
    } catch (err) {
      console.error('Error importing backup:', err);
      return false;
    }
  },

  // Helper to load all stored application states at once
  loadAllData: () => {
    return {
      clients: StorageService.getClients(),
      services: StorageService.getServices(),
      orders: StorageService.getOrders(),
      appointments: StorageService.getAppointments(),
      templates: StorageService.getTemplates(),
      waConfig: StorageService.getWaConfig(),
      businessConfig: StorageService.getBusinessConfig(),
      inventory: StorageService.getInventory(),
      cashRegister: StorageService.getCashRegister()
    };
  }
};

// Helper function to build WhatsApp text with placeholder substitution
export function formatWhatsAppMessage(
  templateContent: string,
  variables: {
    cliente_nome?: string;
    veiculo?: string;
    placa?: string;
    os_numero?: string;
    valor_total?: string;
    previsao_entrega?: string;
    servicos?: string;
    forma_pagamento?: string;
    empresa_nome?: string;
    empresa_endereco?: string;
  }
): string {
  let text = templateContent;
  const config = StorageService.getBusinessConfig();

  const map: Record<string, string> = {
    '{cliente_nome}': variables.cliente_nome || 'Cliente',
    '{veiculo}': variables.veiculo || 'Veículo',
    '{placa}': variables.placa || '',
    '{os_numero}': variables.os_numero || '',
    '{valor_total}': variables.valor_total || '0,00',
    '{previsao_entrega}': variables.previsao_entrega || 'Em breve',
    '{servicos}': variables.servicos || 'Serviços cadastrados',
    '{forma_pagamento}': variables.forma_pagamento || 'A combinar',
    '{empresa_nome}': config.nomeEmpresa,
    '{empresa_endereco}': config.endereco
  };

  Object.entries(map).forEach(([key, value]) => {
    text = text.replaceAll(key, value);
  });

  return text;
}
