import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db, initAnonymousAuth } from '../lib/firebase';
import { 
  Client, 
  ServiceOrder, 
  Appointment, 
  ServiceItem, 
  InventoryItem, 
  WhatsAppTemplate, 
  WhatsAppApiConfig, 
  BusinessConfig, 
  DailyCashRegister 
} from '../types';

// Helper to sanitize data for Firestore (stripping any undefined fields)
function sanitizeForFirestore<T>(data: T): T {
  if (data === undefined || data === null) return data;
  return JSON.parse(JSON.stringify(data));
}

export const FirestoreSync = {
  // Initialize connection & Listeners
  init: async (listeners: {
    onClientsUpdate?: (clients: Client[]) => void;
    onOrdersUpdate?: (orders: ServiceOrder[]) => void;
    onAppointmentsUpdate?: (appointments: Appointment[]) => void;
    onServicesUpdate?: (services: ServiceItem[]) => void;
    onInventoryUpdate?: (inventory: InventoryItem[]) => void;
    onTemplatesUpdate?: (templates: WhatsAppTemplate[]) => void;
    onWaConfigUpdate?: (waConfig: WhatsAppApiConfig) => void;
    onBusinessConfigUpdate?: (businessConfig: BusinessConfig) => void;
    onCashRegisterUpdate?: (cashRegister: DailyCashRegister) => void;
  }) => {
    await initAnonymousAuth();

    // 1. Listen to Clients
    const unsubClients = onSnapshot(collection(db, 'clients'), (snapshot) => {
      const items: Client[] = snapshot.docs.map(doc => doc.data() as Client);
      if (listeners.onClientsUpdate) {
        listeners.onClientsUpdate(items);
      }
    }, (err) => console.error('Firestore clients error:', err));

    // 2. Listen to Service Orders
    const unsubOrders = onSnapshot(collection(db, 'serviceOrders'), (snapshot) => {
      const items: ServiceOrder[] = snapshot.docs.map(doc => doc.data() as ServiceOrder);
      // Sort orders by numeric ID or creation date descending
      items.sort((a, b) => new Date(b.dataAbertura || 0).getTime() - new Date(a.dataAbertura || 0).getTime());
      if (listeners.onOrdersUpdate) {
        listeners.onOrdersUpdate(items);
      }
    }, (err) => console.error('Firestore orders error:', err));

    // 3. Listen to Appointments
    const unsubAppointments = onSnapshot(collection(db, 'appointments'), (snapshot) => {
      const items: Appointment[] = snapshot.docs.map(doc => doc.data() as Appointment);
      if (listeners.onAppointmentsUpdate) {
        listeners.onAppointmentsUpdate(items);
      }
    }, (err) => console.error('Firestore appointments error:', err));

    // 4. Listen to Services
    const unsubServices = onSnapshot(collection(db, 'services'), (snapshot) => {
      const items: ServiceItem[] = snapshot.docs.map(doc => doc.data() as ServiceItem);
      if (items.length > 0 && listeners.onServicesUpdate) {
        listeners.onServicesUpdate(items);
      }
    }, (err) => console.error('Firestore services error:', err));

    // 5. Listen to Inventory
    const unsubInventory = onSnapshot(collection(db, 'inventory'), (snapshot) => {
      const items: InventoryItem[] = snapshot.docs.map(doc => doc.data() as InventoryItem);
      if (listeners.onInventoryUpdate) {
        listeners.onInventoryUpdate(items);
      }
    }, (err) => console.error('Firestore inventory error:', err));

    // 6. Listen to Templates
    const unsubTemplates = onSnapshot(collection(db, 'templates'), (snapshot) => {
      const items: WhatsAppTemplate[] = snapshot.docs.map(doc => doc.data() as WhatsAppTemplate);
      if (items.length > 0 && listeners.onTemplatesUpdate) {
        listeners.onTemplatesUpdate(items);
      }
    }, (err) => console.error('Firestore templates error:', err));

    // 7. Listen to Settings docs
    const unsubWaConfig = onSnapshot(doc(db, 'settings', 'waConfig'), (docSnap) => {
      if (docSnap.exists() && listeners.onWaConfigUpdate) {
        listeners.onWaConfigUpdate(docSnap.data() as WhatsAppApiConfig);
      }
    }, (err) => console.error('Firestore waConfig error:', err));

    const unsubBusinessConfig = onSnapshot(doc(db, 'settings', 'businessConfig'), (docSnap) => {
      if (docSnap.exists() && listeners.onBusinessConfigUpdate) {
        listeners.onBusinessConfigUpdate(docSnap.data() as BusinessConfig);
      }
    }, (err) => console.error('Firestore businessConfig error:', err));

    const unsubCashRegister = onSnapshot(doc(db, 'settings', 'cashRegister'), (docSnap) => {
      if (docSnap.exists() && listeners.onCashRegisterUpdate) {
        listeners.onCashRegisterUpdate(docSnap.data() as DailyCashRegister);
      }
    }, (err) => console.error('Firestore cashRegister error:', err));

    return () => {
      unsubClients();
      unsubOrders();
      unsubAppointments();
      unsubServices();
      unsubInventory();
      unsubTemplates();
      unsubWaConfig();
      unsubBusinessConfig();
      unsubCashRegister();
    };
  },

  // Direct sync write methods
  saveClient: async (client: Client) => {
    try {
      await setDoc(doc(db, 'clients', client.id), sanitizeForFirestore(client));
    } catch (err) {
      console.error('Firestore saveClient error:', err);
    }
  },

  deleteClient: async (clientId: string) => {
    try {
      await deleteDoc(doc(db, 'clients', clientId));
    } catch (err) {
      console.error('Firestore deleteClient error:', err);
    }
  },

  saveOrder: async (order: ServiceOrder) => {
    try {
      await setDoc(doc(db, 'serviceOrders', order.id), sanitizeForFirestore(order));
    } catch (err) {
      console.error('Firestore saveOrder error:', err);
    }
  },

  deleteOrder: async (orderId: string) => {
    try {
      await deleteDoc(doc(db, 'serviceOrders', orderId));
    } catch (err) {
      console.error('Firestore deleteOrder error:', err);
    }
  },

  saveAppointment: async (appointment: Appointment) => {
    try {
      await setDoc(doc(db, 'appointments', appointment.id), sanitizeForFirestore(appointment));
    } catch (err) {
      console.error('Firestore saveAppointment error:', err);
    }
  },

  deleteAppointment: async (appointmentId: string) => {
    try {
      await deleteDoc(doc(db, 'appointments', appointmentId));
    } catch (err) {
      console.error('Firestore deleteAppointment error:', err);
    }
  },

  saveServices: async (services: ServiceItem[]) => {
    try {
      const batch = writeBatch(db);
      services.forEach(srv => {
        batch.set(doc(db, 'services', srv.id), sanitizeForFirestore(srv));
      });
      await batch.commit();
    } catch (err) {
      console.error('Firestore saveServices error:', err);
    }
  },

  saveInventory: async (inventory: InventoryItem[]) => {
    try {
      const batch = writeBatch(db);
      inventory.forEach(inv => {
        batch.set(doc(db, 'inventory', inv.id), sanitizeForFirestore(inv));
      });
      await batch.commit();
    } catch (err) {
      console.error('Firestore saveInventory error:', err);
    }
  },

  deleteInventoryItem: async (itemId: string) => {
    try {
      await deleteDoc(doc(db, 'inventory', itemId));
    } catch (err) {
      console.error('Firestore deleteInventoryItem error:', err);
    }
  },

  saveTemplates: async (templates: WhatsAppTemplate[]) => {
    try {
      const batch = writeBatch(db);
      templates.forEach(tpl => {
        batch.set(doc(db, 'templates', tpl.id), sanitizeForFirestore(tpl));
      });
      await batch.commit();
    } catch (err) {
      console.error('Firestore saveTemplates error:', err);
    }
  },

  saveWaConfig: async (config: WhatsAppApiConfig) => {
    try {
      await setDoc(doc(db, 'settings', 'waConfig'), sanitizeForFirestore(config));
    } catch (err) {
      console.error('Firestore saveWaConfig error:', err);
    }
  },

  saveBusinessConfig: async (config: BusinessConfig) => {
    try {
      await setDoc(doc(db, 'settings', 'businessConfig'), sanitizeForFirestore(config));
    } catch (err) {
      console.error('Firestore saveBusinessConfig error:', err);
    }
  },

  saveCashRegister: async (cashRegister: DailyCashRegister) => {
    try {
      await setDoc(doc(db, 'settings', 'cashRegister'), sanitizeForFirestore(cashRegister));
    } catch (err) {
      console.error('Firestore saveCashRegister error:', err);
    }
  }
};
