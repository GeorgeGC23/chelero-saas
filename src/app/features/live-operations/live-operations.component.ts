import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockOrdersService } from '../../core/services/mock/mock-orders.service';
import { OrderBadgeComponent } from '../../shared/components/badge/order-badge.component';
import { Order, OrderStatus, OrderItem } from '../../core/domain/models/order.model';

@Component({
  selector: 'app-live-operations',
  standalone: true,
  imports: [CommonModule, OrderBadgeComponent, FormsModule],
  template: `
    <!-- Estilo de impresión térmica -->
    <style>
      @media print {
        body * { visibility: hidden; }
        #printable-receipt, #printable-receipt * { visibility: visible; }
        #printable-receipt { position: absolute; left: 0; top: 0; width: 80mm; margin: 0 auto; }
      }
    </style>

    <div class="animate-in fade-in duration-200 print:hidden pb-24 md:pb-0">
      <div class="flex items-center justify-between mb-5">
        <div>
          <h1 class="text-lg font-bold tracking-tight text-white">Live Operations</h1>
          <p class="text-xs text-[#9CA3AF] mt-0.5 hidden sm:block">Control de pedidos y ventas en tiempo real</p>
        </div>
        <div class="md:hidden flex flex-col items-end">
          <span class="text-[10px] text-[#00D2B4] font-bold uppercase tracking-wider">Caja Hoy</span>
          <span class="font-mono text-sm font-bold text-white">S/ {{ ordersService.totalSalesToday().toFixed(2) }}</span>
        </div>
      </div>

      <!-- ESTADO VACÍO SI LA CAJA ESTÁ CERRADA -->
      @if (!ordersService.currentCashSession()) {
        <div class="mt-8 bg-[#161A1F] border border-yellow-500/30 rounded-2xl p-8 text-center max-w-lg mx-auto">
          <div class="w-12 h-12 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h3 class="text-white font-bold text-base">Módulo Live Ops Inactivo</h3>
          <p class="text-[13px] text-[#9CA3AF] mt-2 leading-relaxed">El turno de caja actual se encuentra cerrado. Para empezar a recibir nuevas ventas y ver los pedidos, debes realizar la <b>Apertura de Caja</b>.</p>
        </div>
      } @else {
        <!-- Grid de Órdenes usando filteredOrders() (con anuladas al final) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          @for (order of filteredOrders(); track order.id) {
            <div class="bg-[#161A1F] border rounded-xl p-3.5 flex flex-col justify-between transition-all duration-150"
                 [ngClass]="order.orderStatus === 'CANCELADO' ? 'border-red-500/20 opacity-60 bg-[#12151B]' : 'border-[#232933] hover:border-[#374151]'">

              <div class="space-y-3">
                <!-- Header Tarjeta -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="font-mono text-xs font-bold text-[#FF9F0A] tracking-wider" [ngClass]="{'line-through opacity-50': order.orderStatus === 'CANCELADO'}">{{ order.shortCode }}</span>
                    <span class="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider"
                          [ngClass]="order.channel === 'VENTA_TIENDA_MOSTRADOR' ? 'bg-[#00D2B4]/15 text-[#00D2B4]' : 'bg-blue-500/15 text-blue-400'">
                      {{ order.channel === 'VENTA_TIENDA_MOSTRADOR' ? 'Mostrador' : 'Delivery' }}
                    </span>
                  </div>
                  <app-order-badge [status]="order.orderStatus"></app-order-badge>
                </div>

                <!-- Datos de Cliente -->
                <div>
                  <h2 class="font-semibold text-[13px] md:text-sm text-white tracking-tight leading-tight">{{ order.client.fullName }}</h2>
                  @if (order.client.phoneNumber) {
                    <div class="flex items-center gap-1.5 mt-1 text-[#9CA3AF] text-xs font-mono">
                      <svg class="w-3 h-3 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      <span class="truncate">{{ order.client.phoneNumber }}</span>
                    </div>
                  }
                  @if (order.deliveryAddress) {
                    <div class="flex items-start gap-1.5 mt-1 text-xs text-[#9CA3AF]">
                      <svg class="w-3 h-3 text-[#FF9F0A] shrink-0 mt-[1px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <span class="truncate leading-tight">{{ order.deliveryAddress.address }}</span>
                    </div>
                  } @else {
                    <div class="flex items-center gap-1.5 mt-1 text-xs text-[#6B7280]">
                      <svg class="w-3 h-3 text-[#00D2B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                      <span class="truncate">Atención en mostrador</span>
                    </div>
                  }
                </div>

                <!-- Lista de Productos -->
                <div class="bg-[#111418] p-2.5 rounded-lg border border-[#232933]/60 space-y-1.5" [ngClass]="{'opacity-50': order.orderStatus === 'CANCELADO'}">
                  @for (item of getOrderItems(order); track item.productId) {
                    <div class="flex justify-between items-center text-xs">
                      <span class="text-[#D1D5DB] truncate pr-2"><strong class="text-white font-mono">{{ item.quantity }}x</strong> {{ item.productName }}</span>
                      <span class="font-mono text-white shrink-0 font-medium">S/ {{ item.subtotal.toFixed(2) }}</span>
                    </div>
                  }
                </div>
              </div>

              <!-- Footer: Total y Acciones -->
              <div class="mt-4 flex flex-col gap-3 border-t border-[#232933] pt-3">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="text-[9px] text-[#6B7280] font-bold uppercase tracking-wider block mb-0.5">Total</span>
                    <span class="font-mono font-bold text-base md:text-lg" [ngClass]="order.orderStatus === 'CANCELADO' ? 'text-[#6B7280] line-through' : 'text-white'">S/ {{ order.total.toFixed(2) }}</span>
                  </div>

                  @if (order.orderStatus !== 'ENTREGADO' && order.orderStatus !== 'CANCELADO') {
                    <button (click)="advanceStatus(order.id, order.orderStatus)" class="text-xs font-semibold bg-[#262D38] hover:bg-[#374151] text-white px-3 md:px-4 py-2 rounded-lg border border-[#374151] transition active:scale-95">Avanzar</button>
                  } @else if (order.orderStatus === 'ENTREGADO') {
                    <span class="text-xs text-[#34D399] font-bold flex items-center gap-1">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg> Completado
                    </span>
                  } @else {
                    <span class="text-xs text-red-400 font-bold flex items-center gap-1">✕ Anulado</span>
                  }
                </div>

                <div class="flex items-center justify-end gap-2 pt-2 border-t border-[#232933]/50">
                  <button (click)="viewDetails(order)" class="text-[#9CA3AF] hover:text-white transition flex items-center gap-1 px-3 py-1.5 bg-[#111418] rounded border border-[#232933] hover:border-[#374151] text-[10px] uppercase font-bold">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    Detalles
                  </button>

                  @if (order.orderStatus !== 'CANCELADO') {
                    <button (click)="openReceipt(order)" class="text-[#9CA3AF] hover:text-[#FF9F0A] transition flex items-center gap-1 px-3 py-1.5 bg-[#111418] rounded border border-[#232933] hover:border-[#FF9F0A]/50 text-[10px] uppercase font-bold">
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                      Imprimir
                    </button>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>

    <!-- MODAL DE DETALLES DEL PEDIDO -->
    @if (selectedOrderForDetails()) {
      <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
        <div class="bg-[#161A1F] border border-[#232933] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in duration-200">

          <div class="px-5 py-4 border-b border-[#232933] bg-[#111418] flex items-center justify-between">
            <h3 class="font-bold text-sm text-white">Detalles del Pedido</h3>
            <button (click)="closeDetails()" class="text-[#6B7280] hover:text-white transition bg-[#232933]/50 p-1.5 rounded-full">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div class="p-5 space-y-4 text-sm max-h-[70vh] overflow-y-auto">
            <div class="flex justify-between items-center">
              <span class="font-mono text-lg font-bold text-[#FF9F0A] tracking-wider">{{ selectedOrderForDetails()?.shortCode }}</span>
              <app-order-badge [status]="selectedOrderForDetails()!.orderStatus"></app-order-badge>
            </div>

            <div class="bg-[#111418] p-3 rounded-xl border border-[#232933]">
              <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-2">Cliente</h4>
              <p class="text-white font-semibold">{{ selectedOrderForDetails()?.client?.fullName }}</p>
              @if (selectedOrderForDetails()?.client?.phoneNumber) {
                <p class="text-[#9CA3AF] font-mono mt-1 text-xs">Tel: {{ selectedOrderForDetails()?.client?.phoneNumber }}</p>
              }
              @if (selectedOrderForDetails()?.deliveryAddress) {
                <p class="text-[#9CA3AF] mt-1 text-xs">Dir: {{ selectedOrderForDetails()?.deliveryAddress?.address }}</p>
              }
            </div>

            <div>
              <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-2">Productos</h4>
              <div class="bg-[#111418] p-3 rounded-xl border border-[#232933] space-y-2">
                @for (item of getOrderItems(selectedOrderForDetails()!); track item.productId) {
                  <div class="flex justify-between items-center text-xs border-b border-[#232933]/50 pb-2 last:border-0 last:pb-0">
                    <span class="text-[#D1D5DB]"><strong class="text-white font-mono">{{ item.quantity }}x</strong> {{ item.productName }}</span>
                    <span class="font-mono text-white">S/ {{ item.subtotal.toFixed(2) }}</span>
                  </div>
                }
              </div>
            </div>

            <div>
              <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-2">Desglose de Pago</h4>
              <div class="bg-[#111418] p-3 rounded-xl border border-[#232933] space-y-2 text-xs font-mono">
                <div class="flex justify-between text-[#9CA3AF]">
                  <span>Método:</span>
                  <span class="text-white font-semibold">{{ selectedOrderForDetails()?.payment?.method }}</span>
                </div>
                <div class="flex justify-between text-[#9CA3AF]">
                  <span>Subtotal:</span>
                  <span>S/ {{ selectedOrderForDetails()?.subtotal?.toFixed(2) }}</span>
                </div>
                @if (selectedOrderForDetails()?.deliveryFee && selectedOrderForDetails()!.deliveryFee > 0) {
                  <div class="flex justify-between text-[#9CA3AF]">
                    <span>Delivery:</span>
                    <span>S/ {{ selectedOrderForDetails()?.deliveryFee?.toFixed(2) }}</span>
                  </div>
                }
                <div class="flex justify-between text-white font-bold text-sm pt-2 border-t border-[#232933]">
                  <span>Total Cancelado:</span>
                  <span class="text-[#FF9F0A]">S/ {{ selectedOrderForDetails()?.total?.toFixed(2) }}</span>
                </div>
              </div>
            </div>

            @if (selectedOrderForDetails()?.notes && selectedOrderForDetails()?.orderStatus === 'CANCELADO') {
              <div class="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-xs text-red-400 font-mono">
                {{ selectedOrderForDetails()?.notes }}
              </div>
            }
          </div>

          <div class="p-4 border-t border-[#232933] bg-[#111418] flex gap-3">
            <button (click)="closeDetails()" class="flex-1 py-2.5 text-xs font-bold text-black bg-white hover:bg-gray-200 rounded-lg transition">Cerrar</button>

            @if (selectedOrderForDetails()?.orderStatus !== 'CANCELADO') {
              @if (canCancelOrder(selectedOrderForDetails()!)) {
                <button (click)="openCancelModal(selectedOrderForDetails()!)" class="flex-1 py-2.5 text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg transition">
                  Anular Venta
                </button>
              }
            }
          </div>

        </div>
      </div>
    }

    <!-- MODAL DE MOTIVO DE ANULACIÓN -->
    @if (isCancelModalOpen()) {
      <div class="fixed inset-0 bg-black/85 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
        <div class="bg-[#161A1F] border border-[#232933] rounded-2xl w-full max-w-sm shadow-2xl p-5 space-y-4">
          <h3 class="font-bold text-sm text-white">Motivo de Anulación</h3>
          <p class="text-xs text-[#9CA3AF]">Selecciona el motivo por el cual se anula la venta. El stock regresará automáticamente al almacén.</p>

          <select [(ngModel)]="cancellationReason" class="w-full bg-[#111418] border border-[#232933] rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500">
            <option value="Error en productos facturados">Error en productos facturados</option>
            <option value="Cliente canceló el pedido">Cliente canceló el pedido</option>
          </select>

          <div class="flex gap-2 pt-2">
            <button (click)="isCancelModalOpen.set(false)" class="flex-1 py-2 text-xs font-semibold text-white bg-[#232933] rounded-lg">Volver</button>
            <button (click)="confirmCancellation()" class="flex-1 py-2 text-xs font-bold text-black bg-red-500 hover:bg-red-400 rounded-lg">Confirmar</button>
          </div>
        </div>
      </div>
    }

    <!-- MODAL DE PREVIEW BOLETA / TICKET TÉRMICO -->
    @if (selectedOrderForReceipt()) {
      <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 print:bg-white print:p-0">
        <div id="printable-receipt" class="bg-white text-black w-full max-w-[320px] p-6 shadow-2xl font-mono text-[11px] rounded-lg print:rounded-none print:w-full print:max-w-none print:shadow-none print:p-2">

          <div class="text-center mb-4 border-b border-black pb-4 border-dashed">
            <h2 class="font-bold text-lg uppercase tracking-widest leading-none">CHELERO</h2>
            <p class="text-[10px] mt-1 text-gray-600">DGM Cloud · Licorería</p>
            <p class="text-[10px] text-gray-600">RUC: 20123456789</p>

            <h3 class="font-bold text-sm mt-3 pb-1 uppercase">Ticket de Venta</h3>
            <p class="text-[10px] font-bold">Ref: {{ selectedOrderForReceipt()?.shortCode }}</p>
            <p class="text-[10px]">{{ selectedOrderForReceipt()?.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
          </div>

          <div class="mb-4 space-y-1">
            <p><span class="font-bold">Cliente:</span> <span class="uppercase">{{ selectedOrderForReceipt()?.client?.fullName }}</span></p>
            @if(selectedOrderForReceipt()?.channel === 'DELIVERY_WHATSAPP') {
              <p><span class="font-bold">Tel:</span> {{ selectedOrderForReceipt()?.client?.phoneNumber }}</p>
              <p><span class="font-bold">Dir:</span> {{ selectedOrderForReceipt()?.deliveryAddress?.address }}</p>
            }
          </div>

          <div class="border-t border-b border-black py-2 mb-3 space-y-1 border-dashed">
            <div class="flex justify-between font-bold pb-1">
              <span>Cant / Prod</span>
              <span>Importe</span>
            </div>
            @for (item of getOrderItems(selectedOrderForReceipt()!); track item.productId) {
              <div class="flex justify-between items-start">
                <span class="pr-2">{{ item.quantity }}x <span class="uppercase">{{ item.productName }}</span></span>
                <span>{{ item.subtotal.toFixed(2) }}</span>
              </div>
            }
          </div>

          <div class="space-y-1 mb-4">
            <div class="flex justify-between">
              <span>Subtotal:</span>
              <span>S/ {{ selectedOrderForReceipt()?.subtotal?.toFixed(2) }}</span>
            </div>
            @if(selectedOrderForReceipt()?.deliveryFee && selectedOrderForReceipt()!.deliveryFee > 0) {
              <div class="flex justify-between">
                <span>Delivery:</span>
                <span>S/ {{ selectedOrderForReceipt()?.deliveryFee?.toFixed(2) }}</span>
              </div>
            }
            <div class="flex justify-between font-bold text-sm pt-1 mt-1 border-t border-black">
              <span>TOTAL:</span>
              <span>S/ {{ selectedOrderForReceipt()?.total?.toFixed(2) }}</span>
            </div>
          </div>

          <div class="print:hidden flex gap-2 border-t border-gray-300 pt-4 mt-2">
            <button (click)="closeReceipt()" class="flex-1 py-2.5 bg-gray-200 text-black font-bold text-xs rounded-lg">Cancelar</button>
            <button (click)="printRealReceipt()" class="flex-1 py-2.5 bg-[#FF9F0A] text-black font-bold text-xs rounded-lg">Imprimir</button>
          </div>

        </div>
      </div>
    }
  `
})
export class LiveOperationsComponent {
  ordersService = inject(MockOrdersService);

  selectedOrderForDetails = signal<Order | null>(null);
  selectedOrderForReceipt = signal<Order | null>(null);
  isCancelModalOpen = signal(false);
  cancellationReason = signal('Error en productos facturados');

  filteredOrders = computed(() => {
    const term = this.ordersService.globalSearchTerm().toLowerCase();
    const session = this.ordersService.currentCashSession();

    // Solo mostramos pedidos si la caja está abierta
    if (!session) return [];

    const sessionStart = new Date(session.openedAt);

    // Filtrar estrictamente las ventas hechas desde que se abrió este turno
    const activeSessionOrders = this.ordersService.orders().filter(o => new Date(o.createdAt) >= sessionStart);

    // Ordenamos para que las canceladas vayan al final
    const sorted = [...activeSessionOrders].sort((a, b) => {
      if (a.orderStatus === 'CANCELADO' && b.orderStatus !== 'CANCELADO') return 1;
      if (a.orderStatus !== 'CANCELADO' && b.orderStatus === 'CANCELADO') return -1;
      return 0;
    });

    if (!term) return sorted;
    return sorted.filter(o =>
      o.shortCode.toLowerCase().includes(term) ||
      o.client.fullName.toLowerCase().includes(term) ||
      (o.client.phoneNumber && o.client.phoneNumber.includes(term))
    );
  });

  // Función de asistencia para el tipado estricto en la plantilla
  getOrderItems(order: Order): OrderItem[] {
    return order.items;
  }

  advanceStatus(id: string, current: OrderStatus): void {
    const nextMap: Partial<Record<OrderStatus, OrderStatus>> = { NUEVO: 'EN_PREPARACION', EN_PREPARACION: 'EN_CAMINO', EN_CAMINO: 'ENTREGADO' };
    if (nextMap[current]) this.ordersService.updateStatus(id, nextMap[current] as OrderStatus);
  }

  canCancelOrder(order: Order): boolean {
    const isDelivery = order.channel.includes('DELIVERY');
    if (isDelivery && ['EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO'].includes(order.orderStatus)) {
      return false;
    }
    return true;
  }

  openCancelModal(order: Order): void {
    this.isCancelModalOpen.set(true);
  }

  confirmCancellation(): void {
    const order = this.selectedOrderForDetails();
    if (order) {
      this.ordersService.cancelOrder(order.id, this.cancellationReason());
      this.isCancelModalOpen.set(false);
      this.closeDetails();
    }
  }

  viewDetails(order: Order): void { this.selectedOrderForDetails.set(order); }
  closeDetails(): void { this.selectedOrderForDetails.set(null); }

  openReceipt(order: Order): void { this.selectedOrderForReceipt.set(order); }
  closeReceipt(): void { this.selectedOrderForReceipt.set(null); }

  printRealReceipt(): void { window.print(); }
}
