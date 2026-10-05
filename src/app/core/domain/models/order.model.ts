export type OrderStatus =
  | 'NUEVO'
  | 'CONFIRMADO'
  | 'EN_PREPARACION'
  | 'LISTO_DESPACHO'
  | 'EN_CAMINO'
  | 'ENTREGADO'
  | 'CANCELADO'
  | 'INCIDENCIA';

// Canal de origen de la venta
export type SalesChannel = 'DELIVERY_WHATSAPP' | 'DELIVERY_TELEFONO' | 'VENTA_TIENDA_MOSTRADOR';

// Métodos de pago adaptados a licorerías en Perú
export type PaymentMethod = 'EFECTIVO' | 'YAPE' | 'PLIN' | 'TARJETA_POS' | 'TRANSFERENCIA';
export type PaymentStatus = 'PENDIENTE' | 'PAGADO' | 'REEMBOLSADO';

// Bancos de destino para acreditación de billeteras digitales o transferencias
export type BankDestination = 'BCP' | 'INTERBANK' | 'BBVA' | 'SCOTIABANK' | 'CAJA_EFECTIVO';

export interface PaymentDetails {
  method: PaymentMethod;
  status: PaymentStatus;
  destinationBank?: BankDestination; // Dónde cayó el Yape/Plin/Transferencia
  amountTendered?: number;          // Monto con el que paga el cliente (efectivo)
  changeGiven?: number;             // Vuelto exacto entregado al cliente
  operationNumber?: string;         // Número de operación de Yape/Plin o voucher POS
}

export interface ClientAddress {
  label?: string;
  address: string;
  reference?: string;
}

export interface Client {
  id: string;
  phoneNumber?: string;
  fullName: string;
  addresses?: ClientAddress[];
  tags?: string[];
}

export interface OrderItem {
  productId: string;
  productName: string;
  packaging: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  shortCode: string;
  channel: SalesChannel;            // Tienda o Delivery
  client: Client;
  deliveryAddress?: ClientAddress;   // Opcional para compras presenciales en mostrador
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  payment: PaymentDetails;
  orderStatus: OrderStatus;
  assignedRider?: string;           // Solo para delivery
  elapsedMinutes: number;
  notes?: string;
  createdAt: string;
  cancellationReason?: string;
}
