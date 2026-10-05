import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockOrdersService } from '../../core/services/mock/mock-orders.service';
import { OrderBadgeComponent } from '../../shared/components/badge/order-badge.component';
import { OrderItem } from '../../core/domain/models/order.model';

@Component({
  selector: 'app-sales-history',
  standalone: true,
  imports: [CommonModule, FormsModule, OrderBadgeComponent],
  template: `
    <div class="animate-in fade-in duration-200 pb-24 md:pb-0 space-y-5">

      <!-- HEADER -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-lg font-bold tracking-tight text-white">Historial de Ventas</h1>
          <p class="text-xs text-[#9CA3AF] mt-0.5">Auditoría global de comprobantes y flujos históricos</p>
        </div>
      </div>

      <!-- BARRA DE FILTROS -->
      <div class="bg-[#111418] border border-[#232933] rounded-xl p-4 flex flex-col md:flex-row gap-4 items-end">
        <div class="w-full md:w-auto">
          <label class="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider block mb-1.5">Turno / Caja</label>
          <select [(ngModel)]="filterSession" class="w-full bg-[#161A1F] border border-[#232933] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF9F0A]">
            <option value="ALL">Todas las cajas</option>
            @for (session of uniqueSessions(); track session) {
              <option [value]="session">{{ session }}</option>
            }
          </select>
        </div>
        <div class="w-full md:w-auto">
          <label class="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider block mb-1.5">Estado</label>
          <select [(ngModel)]="filterStatus" class="w-full bg-[#161A1F] border border-[#232933] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF9F0A]">
            <option value="ALL">Todos</option>
            <option value="PAGADO_COMPLETO">Exitosos (Pagados/Entregados)</option>
            <option value="CANCELADO">Anulados</option>
          </select>
        </div>
      </div>

      <!-- MÉTRICAS DINÁMICAS -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-[#161A1F] border border-[#232933] rounded-xl p-4">
          <span class="text-[#9CA3AF] text-[11px] font-bold uppercase tracking-wider block mb-1">Recaudación Filtrada</span>
          <span class="font-mono text-xl font-bold text-[#00D2B4]">S/ {{ metrics().totalRevenue.toFixed(2) }}</span>
        </div>
        <div class="bg-[#161A1F] border border-[#232933] rounded-xl p-4">
          <span class="text-[#9CA3AF] text-[11px] font-bold uppercase tracking-wider block mb-1">Tickets Emitidos</span>
          <span class="font-mono text-xl font-bold text-white">{{ metrics().ticketCount }}</span>
        </div>
        <div class="bg-[#161A1F] border border-[#232933] rounded-xl p-4">
          <span class="text-[#9CA3AF] text-[11px] font-bold uppercase tracking-wider block mb-1">Ticket Promedio</span>
          <span class="font-mono text-xl font-bold text-[#FF9F0A]">S/ {{ metrics().avgTicket.toFixed(2) }}</span>
        </div>
      </div>

      <!-- LISTADO DE VENTAS ADAPTATIVO (Tarjetas en móvil / Tabla en PC) -->
      <div class="space-y-3">
        @if (filteredSales().length === 0) {
          <div class="bg-[#161A1F] border border-[#232933] rounded-xl p-8 text-center text-[#6B7280] text-xs">
            No se encontraron ventas con los filtros actuales.
          </div>
        }

        <!-- VISTA MÓVIL: Tarjetas compactas interactivas -->
        <div class="grid grid-cols-1 gap-2.5 md:hidden">
          @for (order of filteredSales(); track order.id) {
            <div (click)="viewDetails(order)" class="bg-[#161A1F] border border-[#232933] active:border-[#FF9F0A]/50 rounded-xl p-3.5 flex items-center justify-between transition cursor-pointer" [ngClass]="{'opacity-60': order.orderStatus === 'CANCELADO'}">
              <div class="space-y-1 min-w-0 pr-2">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-mono text-xs font-bold text-[#FF9F0A]">{{ order.shortCode }}</span>
                  <span class="bg-[#262D38] border border-[#374151] px-1.5 py-0.2 rounded text-[9px] font-mono text-[#D1D5DB]">{{ getSessionId(order) }}</span>
                </div>
                <h4 class="text-xs font-bold text-white truncate">{{ order.client.fullName }}</h4>
                <p class="text-[10px] text-[#9CA3AF] font-mono">{{ order.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
              </div>
              <div class="text-right shrink-0 space-y-1">
                <span class="font-mono text-sm font-bold text-white block">S/ {{ order.total.toFixed(2) }}</span>
                <app-order-badge [status]="order.orderStatus"></app-order-badge>
              </div>
            </div>
          }
        </div>

        <!-- VISTA ESCRITORIO: Tabla clásica detallada -->
        <div class="hidden md:block bg-[#161A1F] border border-[#232933] rounded-xl overflow-hidden shadow-sm">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[800px]">
              <thead>
              <tr class="bg-[#111418] border-b border-[#232933] text-[10px] uppercase tracking-wider text-[#9CA3AF]">
                <th class="px-4 py-3 font-semibold">Cód / Fecha</th>
                <th class="px-4 py-3 font-semibold">Cliente</th>
                <th class="px-4 py-3 font-semibold">Caja (ID Turno)</th>
                <th class="px-4 py-3 font-semibold text-right">Total</th>
                <th class="px-4 py-3 font-semibold text-center">Estado</th>
                <th class="px-4 py-3 font-semibold text-center">Acción</th>
              </tr>
              </thead>
              <tbody class="divide-y divide-[#232933] text-sm">
                @for (order of filteredSales(); track order.id) {
                  <tr class="hover:bg-[#1C2129] transition cursor-pointer" (click)="viewDetails(order)" [ngClass]="{'opacity-50': order.orderStatus === 'CANCELADO'}">
                    <td class="px-4 py-3">
                      <span class="font-mono text-[#FF9F0A] font-bold block text-xs">{{ order.shortCode }}</span>
                      <span class="text-[10px] text-[#9CA3AF] font-mono">{{ order.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
                    </td>
                    <td class="px-4 py-3">
                      <span class="text-white text-xs font-semibold block">{{ order.client.fullName }}</span>
                      <span class="text-[10px] text-[#6B7280]">{{ order.channel === 'VENTA_TIENDA_MOSTRADOR' ? 'Mostrador' : 'Delivery' }}</span>
                    </td>
                    <td class="px-4 py-3">
                      <span class="bg-[#262D38] border border-[#374151] px-2 py-0.5 rounded text-[10px] font-mono text-[#D1D5DB]">
                        {{ getSessionId(order) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right font-mono font-bold text-sm text-white">
                      S/ {{ order.total.toFixed(2) }}
                    </td>
                    <td class="px-4 py-3 text-center">
                      <app-order-badge [status]="order.orderStatus"></app-order-badge>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <button (click)="$event.stopPropagation(); viewDetails(order);" class="text-xs bg-[#111418] border border-[#232933] hover:border-[#FF9F0A] px-3 py-1.5 rounded text-white font-bold transition">
                        Ver
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- MODAL DETALLE LECTURA -->
      @if (selectedOrder()) {
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-[#161A1F] border border-[#232933] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in duration-200">
            <div class="px-5 py-4 border-b border-[#232933] bg-[#111418] flex items-center justify-between">
              <h3 class="font-bold text-sm text-white">Comprobante Histórico</h3>
              <button (click)="selectedOrder.set(null)" class="text-[#6B7280] hover:text-white transition"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>

            <div class="p-5 space-y-4 text-sm max-h-[70vh] overflow-y-auto">
              <div class="flex justify-between items-center">
                <span class="font-mono text-lg font-bold text-[#FF9F0A]">{{ selectedOrder()?.shortCode }}</span>
                <span class="text-xs text-[#9CA3AF]">{{ selectedOrder()?.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
              <div class="bg-[#111418] p-3 rounded-xl border border-[#232933] text-xs">
                <p><span class="text-[#9CA3AF] font-bold">Cliente:</span> {{ selectedOrder()?.client?.fullName }}</p>
                <p><span class="text-[#9CA3AF] font-bold">Turno:</span> <span class="font-mono">{{ getSessionId(selectedOrder()) }}</span></p>
                <p><span class="text-[#9CA3AF] font-bold">Pago:</span> {{ selectedOrder()?.payment?.method }}</p>
              </div>
              <div>
                <h4 class="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider mb-2">Artículos</h4>
                <div class="bg-[#111418] p-3 rounded-xl border border-[#232933] space-y-2">
                  @for (item of getOrderItems(selectedOrder()); track item.productId) {
                    <div class="flex justify-between items-center text-xs">
                      <span class="text-[#D1D5DB]"><strong class="text-white font-mono">{{ item.quantity }}x</strong> {{ item.productName }}</span>
                      <span class="font-mono text-white">S/ {{ item.subtotal.toFixed(2) }}</span>
                    </div>
                  }
                </div>
              </div>
              <div class="flex justify-between text-white font-bold text-sm pt-2">
                <span>TOTAL DEL TICKET:</span>
                <span class="text-[#00D2B4]">S/ {{ selectedOrder()?.total?.toFixed(2) }}</span>
              </div>
            </div>
            <div class="p-4 border-t border-[#232933] bg-[#111418]">
              <button (click)="selectedOrder.set(null)" class="w-full py-2.5 text-xs font-bold text-black bg-white hover:bg-gray-200 rounded-lg transition">Cerrar Detalle</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class SalesHistoryComponent {
  ordersService = inject(MockOrdersService);

  filterSession = signal<string>('ALL');
  filterStatus = signal<string>('ALL');
  selectedOrder = signal<any>(null);

  getSessionId(order: any): string {
    if (!order || !order.sessionId) return 'SIN-TURNO';
    return order.sessionId;
  }

  getOrderItems(order: any): OrderItem[] {
    if (!order || !order.items) return [];
    return order.items as OrderItem[];
  }

  uniqueSessions = computed(() => {
    const sessions = new Set<string>();
    this.ordersService.orders().forEach((o: any) => {
      if (o.sessionId) sessions.add(o.sessionId);
    });
    return Array.from(sessions).sort().reverse();
  });

  filteredSales = computed(() => {
    const term = this.ordersService.globalSearchTerm().toLowerCase();
    let result = this.ordersService.orders();

    if (this.filterSession() !== 'ALL') {
      result = result.filter((o: any) => o.sessionId === this.filterSession());
    }

    if (this.filterStatus() === 'PAGADO_COMPLETO') {
      result = result.filter(o => o.orderStatus !== 'CANCELADO');
    } else if (this.filterStatus() === 'CANCELADO') {
      result = result.filter(o => o.orderStatus === 'CANCELADO');
    }

    if (term) {
      result = result.filter(o =>
        o.shortCode.toLowerCase().includes(term) ||
        o.client.fullName.toLowerCase().includes(term) ||
        ((o as any).sessionId && (o as any).sessionId.toLowerCase().includes(term))
      );
    }

    return result;
  });

  metrics = computed(() => {
    const sales = this.filteredSales();
    let totalRevenue = 0;
    let ticketCount = 0;

    sales.forEach(o => {
      if (o.orderStatus !== 'CANCELADO') {
        totalRevenue += o.total;
        ticketCount++;
      }
    });

    const avgTicket = ticketCount > 0 ? totalRevenue / ticketCount : 0;

    return { totalRevenue, ticketCount, avgTicket };
  });

  viewDetails(order: any): void {
    this.selectedOrder.set(order);
  }
}
