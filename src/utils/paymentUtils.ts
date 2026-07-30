import { PaymentStatus, PaymentMethod, ServiceOrder } from '../types';

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDENTE: 'Pendente',
  PAGO: 'Pago',
  PAGAMENTO_A_PRAZO: 'Pagamento a Prazo',
  TROCA_SERVICOS: 'Troca em Serviços',
  CORTESIA: 'Cortesia',
  CANCELADO: 'Cancelado',
  PAGO_PARCIAL: 'Parcialmente Pago'
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  DINHEIRO: 'Dinheiro',
  PIX: 'PIX',
  CARTAO_DEBITO: 'Cartão de Débito',
  CARTAO_CREDITO: 'Cartão de Crédito',
  TRANSFERENCIA_BANCARIA: 'Transferência Bancária',
  PAGAMENTO_A_PRAZO: 'Pagamento a Prazo',
  TROCA_SERVICOS: 'Troca em Serviços',
  CORTESIA: 'Cortesia'
};

/**
 * Calculates the exact financial amount received into cash register for a service order.
 * According to specification:
 * - PAGO: receives full amount (or order.valorPago if custom)
 * - PAGO_PARCIAL: receives only the amount paid (order.valorPago)
 * - PENDENTE, PAGAMENTO_A_PRAZO, TROCA_SERVICOS, CORTESIA, CANCELADO: 0 (No cash entry)
 */
export function getReceivedAmountForOrder(order: ServiceOrder): number {
  if (!order || order.status === 'CANCELADA') return 0;

  switch (order.statusPagamento) {
    case 'PAGO':
      return order.valorPago !== undefined && order.valorPago > 0 
        ? order.valorPago 
        : (order.valorFinal || 0);
    case 'PAGO_PARCIAL':
      return order.valorPago || 0;
    case 'PENDENTE':
    case 'PAGAMENTO_A_PRAZO':
    case 'TROCA_SERVICOS':
    case 'CORTESIA':
    case 'CANCELADO':
    default:
      return 0;
  }
}

/**
 * Calculates the amount pending to be received.
 * - PENDENTE, PAGAMENTO_A_PRAZO: full valorFinal
 * - PAGO_PARCIAL: valorFinal - valorPago
 * - Others: 0
 */
export function getPendingAmountForOrder(order: ServiceOrder): number {
  if (!order || order.status === 'CANCELADA') return 0;

  switch (order.statusPagamento) {
    case 'PENDENTE':
    case 'PAGAMENTO_A_PRAZO':
      return order.valorFinal || 0;
    case 'PAGO_PARCIAL':
      return Math.max(0, (order.valorFinal || 0) - (order.valorPago || 0));
    case 'PAGO':
    case 'TROCA_SERVICOS':
    case 'CORTESIA':
    case 'CANCELADO':
    default:
      return 0;
  }
}
