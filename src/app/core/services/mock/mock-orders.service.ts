import { Injectable, signal, computed } from '@angular/core';
import { Order, OrderStatus } from '../../domain/models/order.model';

export interface CatalogProduct {
  id: string;
  name: string;
  category: string;
  packaging: string;
  price: number;
  stock: number;
}

export interface PromoComboItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface PromoCombo {
  id: string;
  name: string;
  description: string;
  items: PromoComboItem[];
  originalPrice: number;
  promoPrice: number;
  isActive: boolean;
}

export interface CashWithdrawal {
  amount: number;
  reason: string;
  time: string;
}

export interface CashRegisterSession {
  id: string;
  openedAt: string;
  closedAt?: string;
  initialAmount: number;
  expectedPhysicalCash?: number;
  withdrawals: CashWithdrawal[];
  totalWithdrawals: number;
  totalSales: number;
  totalCashSales: number;
  totalDigitalSales: number;
  netSalesCount: number;
  cancelledCount: number;
  status: 'ABIERTA' | 'CERRADA';
  earlyCloseReason?: string;
}

const DEFAULT_INVENTORY: CatalogProduct[] = [
  { id: 'p1', name: 'Pilsen Callao 620ml', category: 'Cerveza', packaging: 'Botella retornable', price: 9.50, stock: 48 },
  { id: 'p2', name: 'Cusqueña Dorada 620ml', category: 'Cerveza', packaging: 'Botella personal', price: 10.50, stock: 36 },
  { id: 'p3', name: 'Johnnie Walker Black 750ml', category: 'Whisky', packaging: 'Botella en caja', price: 115.00, stock: 12 },
  { id: 'p4', name: 'Ron Flor de Caña 7 Años', category: 'Ron', packaging: 'Botella 750ml', price: 65.00, stock: 18 },
  { id: 'p5', name: 'Bolsa Hielo Premium 3kg', category: 'Hielo / Mixer', packaging: 'Bolsa sellada', price: 6.00, stock: 25 },
  { id: 'p6', name: 'Coca Cola Sin Azúcar 1.5L', category: 'Hielo / Mixer', packaging: 'Botella descartable', price: 8.50, stock: 30 }
];

const DEFAULT_COMBOS: PromoCombo[] = [
  {
    id: 'combo-1',
    name: 'Combo Floricienta',
    description: '1x Ron Flor de Caña + 1x Coca Cola 1.5L + 1x Hielo 3kg',
    items: [
      { productId: 'p4', productName: 'Ron Flor de Caña 7 Años', quantity: 1, unitPrice: 65.00 },
      { productId: 'p6', productName: 'Coca Cola Sin Azúcar 1.5L', quantity: 1, unitPrice: 8.50 },
      { productId: 'p5', productName: 'Bolsa Hielo Premium 3kg', quantity: 1, unitPrice: 6.00 }
    ],
    originalPrice: 79.50,
    promoPrice: 74.00,
    isActive: true
  }
];

@Injectable({
  providedIn: 'root'
})
export class MockOrdersService {
  private readonly _orders = signal<Order[]>([]);
  private readonly _inventory = signal<CatalogProduct[]>([]);
  private readonly _combos = signal<PromoCombo[]>([]);
  private readonly _cashSessions = signal<CashRegisterSession[]>([]);

  globalSearchTerm = signal<string>('');

  readonly orders = this._orders.asReadonly();
  readonly inventory = this._inventory.asReadonly();
  readonly combos = this._combos.asReadonly();
  readonly cashSessions = this._cashSessions.asReadonly();

  constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage(): void {
    const savedOrders = localStorage.getItem('chelero_orders');
    const savedInventory = localStorage.getItem('chelero_inventory');
    const savedCombos = localStorage.getItem('chelero_combos');
    const savedSessions = localStorage.getItem('chelero_cash_sessions');

    if (savedOrders) this._orders.set(JSON.parse(savedOrders));
    if (savedInventory) this._inventory.set(JSON.parse(savedInventory));
    else this._inventory.set(DEFAULT_INVENTORY);

    if (savedCombos) this._combos.set(JSON.parse(savedCombos));
    else this._combos.set(DEFAULT_COMBOS);

    if (savedSessions) this._cashSessions.set(JSON.parse(savedSessions));
  }

  private saveState(): void {
    localStorage.setItem('chelero_orders', JSON.stringify(this._orders()));
    localStorage.setItem('chelero_inventory', JSON.stringify(this._inventory()));
    localStorage.setItem('chelero_combos', JSON.stringify(this._combos()));
  }

  private saveCashState(): void {
    localStorage.setItem('chelero_cash_sessions', JSON.stringify(this._cashSessions()));
  }

  readonly availableCategories = computed(() => {
    const set = new Set<string>();
    this._inventory().forEach(p => {
      if (p.category) set.add(p.category.trim());
    });
    return Array.from(set).sort();
  });

  // Métricas Generales del Día (Para Dashboard)
  readonly activeOrdersCount = computed(() => this._orders().filter(o => !['ENTREGADO', 'CANCELADO'].includes(o.orderStatus)).length);
  readonly totalSalesToday = computed(() => this._orders().filter(o => o.payment.status === 'PAGADO' && o.orderStatus !== 'CANCELADO').reduce((sum, o) => sum + o.total, 0));
  readonly totalCashSalesToday = computed(() => this._orders().filter(o => o.payment.status === 'PAGADO' && o.orderStatus !== 'CANCELADO' && o.payment.method === 'EFECTIVO').reduce((sum, o) => sum + o.total, 0));
  readonly totalDigitalSalesToday = computed(() => this._orders().filter(o => o.payment.status === 'PAGADO' && o.orderStatus !== 'CANCELADO' && ['YAPE', 'PLIN', 'TRANSFERENCIA'].includes(o.payment.method)).reduce((sum, o) => sum + o.total, 0));

  readonly monthlySales = computed(() => {
    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();
    return this._orders()
      .filter(o => {
        const d = new Date(o.createdAt);
        return o.payment.status === 'PAGADO' && o.orderStatus !== 'CANCELADO' && d.getMonth() === m && d.getFullYear() === y;
      })
      .reduce((sum, o) => sum + o.total, 0);
  });

  readonly completedSalesCount = computed(() => this._orders().filter(o => o.payment.status === 'PAGADO' && o.orderStatus !== 'CANCELADO').length);
  readonly cancelledSalesCount = computed(() => this._orders().filter(o => o.orderStatus === 'CANCELADO').length);

  // Sesiones de Caja
  readonly currentCashSession = computed(() => this._cashSessions().find(s => s.status === 'ABIERTA') || null);
  readonly lastClosedSession = computed(() => {
    const closed = this._cashSessions().filter(s => s.status === 'CERRADA');
    return closed.length > 0 ? closed[0] : null;
  });

  // Calculador Exclusivo del Turno Actual (Para el Modal de Caja y Live Ops)
  readonly sessionStats = computed(() => {
    const session = this.currentCashSession();
    if (!session) return { cash: 0, digital: 0, total: 0, count: 0, cancelled: 0 };
    const sessionStart = new Date(session.openedAt);

    let cash = 0; let digital = 0; let total = 0; let count = 0; let cancelled = 0;
    this._orders().forEach(o => {
      if (new Date(o.createdAt) >= sessionStart) {
        if (o.orderStatus === 'CANCELADO') cancelled++;
        else if (o.payment.status === 'PAGADO') {
          count++;
          total += o.total;
          if (o.payment.method === 'EFECTIVO') cash += o.total;
          else digital += o.total;
        }
      }
    });
    return { cash, digital, total, count, cancelled };
  });

  readonly crmClients = computed(() => {
    const map = new Map<string, any>();
    this._orders().forEach(o => {
      const key = o.client.phoneNumber || o.client.fullName;
      const isPaid = o.payment.status === 'PAGADO';
      const isCancelled = o.orderStatus === 'CANCELADO';

      if (!map.has(key)) {
        map.set(key, {
          fullName: o.client.fullName,
          phoneNumber: o.client.phoneNumber,
          address: o.deliveryAddress?.address,
          totalSpent: (isPaid && !isCancelled) ? o.total : 0,
          orderCount: !isCancelled ? 1 : 0,
          cancelledCount: isCancelled ? 1 : 0,
          lastPurchase: o.createdAt
        });
      } else {
        const c = map.get(key);
        if (isPaid && !isCancelled) c.totalSpent += o.total;
        if (!isCancelled) c.orderCount += 1;
        if (isCancelled) c.cancelledCount += 1;
        if (new Date(o.createdAt) > new Date(c.lastPurchase)) {
          c.lastPurchase = o.createdAt;
          if (o.deliveryAddress) c.address = o.deliveryAddress.address;
        }
      }
    });

    return Array.from(map.values()).map(c => {
      let tier = 'Nuevo';
      if (c.totalSpent > 300 || c.orderCount >= 5) tier = 'VIP';
      else if (c.orderCount > 1) tier = 'Frecuente';
      else if (c.orderCount === 0 && c.cancelledCount > 0) tier = 'Inactivo';
      return { ...c, tier };
    }).sort((a, b) => b.totalSpent - a.totalSpent);
  });

  readonly topSellingProducts = computed(() => {
    const productMap = new Map<string, { name: string; quantity: number; revenue: number; category: string }>();
    this._orders()
      .filter(o => o.orderStatus !== 'CANCELADO')
      .forEach(o => {
        o.items.forEach(item => {
          if (!productMap.has(item.productId)) {
            productMap.set(item.productId, { name: item.productName, quantity: item.quantity, revenue: item.subtotal, category: 'Bebida' });
          } else {
            const p = productMap.get(item.productId)!;
            p.quantity += item.quantity;
            p.revenue += item.subtotal;
          }
        });
      });
    return Array.from(productMap.values()).sort((a, b) => b.quantity - a.quantity);
  });

  readonly salesByChannel = computed(() => {
    let deliveryCount = 0; let deliveryRevenue = 0; let mostradorCount = 0; let mostradorRevenue = 0;
    this._orders()
      .filter(o => o.orderStatus !== 'CANCELADO')
      .forEach(o => {
        if (o.channel === 'DELIVERY_WHATSAPP' || o.channel === 'DELIVERY_TELEFONO') {
          deliveryCount++; deliveryRevenue += o.total;
        } else {
          mostradorCount++; mostradorRevenue += o.total;
        }
      });
    return { deliveryCount, deliveryRevenue, mostradorCount, mostradorRevenue };
  });

  updateStatus(orderId: string, nextStatus: OrderStatus): void {
    this._orders.update(orders => orders.map(order => order.id === orderId ? { ...order, orderStatus: nextStatus } : order));
    this.saveState();
  }

  createOrder(newOrder: Order): void {
    this._inventory.update(inv => {
      const updatedInv = [...inv];
      newOrder.items.forEach(orderItem => {
        const prodIndex = updatedInv.findIndex(p => p.id === orderItem.productId);
        if (prodIndex > -1) {
          updatedInv[prodIndex].stock = Math.max(0, updatedInv[prodIndex].stock - orderItem.quantity);
        } else {
          const combo = this._combos().find(c => c.id === orderItem.productId);
          if (combo) {
            combo.items.forEach(comboItem => {
              const compIndex = updatedInv.findIndex(p => p.id === comboItem.productId);
              if (compIndex > -1) {
                updatedInv[compIndex].stock = Math.max(0, updatedInv[compIndex].stock - (comboItem.quantity * orderItem.quantity));
              }
            });
          }
        }
      });
      return updatedInv;
    });
    this._orders.update(orders => [newOrder, ...orders]);
    this.saveState();
  }

  cancelOrder(orderId: string, reason: string): void {
    this._orders.update(orders => {
      const index = orders.findIndex(o => o.id === orderId);
      if (index > -1 && orders[index].orderStatus !== 'CANCELADO') {
        const orderToCancel = orders[index];
        this._inventory.update(inv => {
          const updatedInv = [...inv];
          orderToCancel.items.forEach(item => {
            const prodIndex = updatedInv.findIndex(p => p.id === item.productId);
            if (prodIndex > -1) updatedInv[prodIndex].stock += item.quantity;
          });
          return updatedInv;
        });
        orders[index] = { ...orderToCancel, orderStatus: 'CANCELADO', notes: `[ANULADO: ${reason}] ${orderToCancel.notes || ''}` };
      }
      return [...orders];
    });
    this.saveState();
  }

  addProduct(product: CatalogProduct): void {
    this._inventory.update(inv => [product, ...inv]);
    this.saveState();
  }

  updateProduct(product: CatalogProduct): void {
    this._inventory.update(inv => inv.map(p => p.id === product.id ? product : p));
    this.saveState();
  }

  addCombo(combo: PromoCombo): void {
    this._combos.update(c => [combo, ...c]);
    this.saveState();
  }

  updateCombo(combo: PromoCombo): void {
    this._combos.update(c => c.map(item => item.id === combo.id ? combo : item));
    this.saveState();
  }

  deleteCombo(comboId: string): void {
    this._combos.update(c => c.filter(item => item.id !== comboId));
    this.saveState();
  }

  // MÉTODOS DE CAJA Y TURNOS ACTUALIZADOS
  openCashRegister(initialAmount: number): void {
    const newSession: CashRegisterSession = {
      id: 'cash-' + Date.now(),
      openedAt: new Date().toISOString(),
      initialAmount,
      totalSales: 0,
      totalCashSales: 0,
      totalDigitalSales: 0,
      netSalesCount: 0,
      cancelledCount: 0,
      withdrawals: [],
      totalWithdrawals: 0,
      status: 'ABIERTA'
    };
    this._cashSessions.update(sessions => [newSession, ...sessions]);
    this.saveCashState();
  }

  withdrawCash(amount: number, reason: string): void {
    this._cashSessions.update(sessions => sessions.map(s => {
      if (s.status === 'ABIERTA') {
        const newWithdrawals = [...(s.withdrawals || []), { amount, reason, time: new Date().toISOString() }];
        const totalW = newWithdrawals.reduce((sum, w) => sum + w.amount, 0);
        return { ...s, withdrawals: newWithdrawals, totalWithdrawals: totalW };
      }
      return s;
    }));
    this.saveCashState();
  }

  closeCashRegister(reason?: string): void {
    const now = new Date();
    const stats = this.sessionStats();
    this._cashSessions.update(sessions => sessions.map(s => {
      if (s.status === 'ABIERTA') {
        return {
          ...s,
          closedAt: now.toISOString(),
          expectedPhysicalCash: s.initialAmount + stats.cash - (s.totalWithdrawals || 0),
          totalSales: stats.total,
          totalCashSales: stats.cash,
          totalDigitalSales: stats.digital,
          netSalesCount: stats.count,
          cancelledCount: stats.cancelled,
          status: 'CERRADA' as const,
          earlyCloseReason: reason
        };
      }
      return s;
    }));
    this.saveCashState();
  }

  // Agrega este método dentro de la clase MockOrdersService
  updateClientInfo(oldName: string, newName: string, phone: string, address: string): void {
    this._orders.update(orders => {
      return orders.map(o => {
        if (o.client.fullName === oldName) {
          return {
            ...o,
            client: { ...o.client, fullName: newName, phoneNumber: phone || undefined },
            deliveryAddress: address ? { address: address } : o.deliveryAddress
          };
        }
        return o;
      });
    });
    this.saveState();
  }
}
