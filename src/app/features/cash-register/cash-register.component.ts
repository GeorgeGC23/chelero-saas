import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockOrdersService, CashRegisterSession } from '../../core/services/mock/mock-orders.service';

@Component({
  selector: 'app-cash-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-in fade-in duration-200 pb-24 md:pb-0 space-y-6">

      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-lg font-bold tracking-tight text-white">Control de Caja & Turnos</h1>
          <p class="text-xs text-[#9CA3AF] mt-0.5">Apertura, retiros, cierre operativo y separación de fondos</p>
        </div>

        @if (!ordersService.currentCashSession()) {
          <button (click)="openRegisterModal()" class="bg-[#00D2B4] hover:bg-[#05b89f] text-[#0A0C0E] text-xs font-bold px-4 py-2.5 rounded-lg transition shadow-[0_0_15px_rgba(0,210,180,0.2)] active:scale-95">
            Abrir Caja / Turno
          </button>
        } @else {
          <div class="flex gap-2">
            <button (click)="withdrawModalOpen.set(true)" class="bg-[#232933] hover:bg-[#374151] text-white border border-[#374151] text-xs font-bold px-4 py-2.5 rounded-lg transition active:scale-95">
              Retirar Efectivo
            </button>
            <button (click)="requestCloseRegister()" class="bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-xs font-bold px-4 py-2.5 rounded-lg transition active:scale-95">
              Cerrar Turno
            </button>
          </div>
        }
      </div>

      <!-- ALERTA DE VENTAS PENDIENTES -->
      @if (pendingOrdersAlert()) {
        <div class="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 text-sm animate-in fade-in slide-in-from-top-4">
          <div class="text-red-400 shrink-0 mt-0.5">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <div>
            <h4 class="font-bold text-red-400">No se puede cerrar la caja</h4>
            <p class="text-red-400/80 mt-1">Aún existen <span class="font-bold text-white">{{ pendingOrdersCount() }} pedido(s)</span> en proceso (Nuevos, En Preparación o En Camino). Debes avanzar todos los pedidos a "Completado" o anularlos para poder efectuar el cierre del turno.</p>
          </div>
          <button (click)="pendingOrdersAlert.set(false)" class="text-red-400 hover:text-white ml-auto">✕</button>
        </div>
      }

      <!-- ESTADO ACTUAL DE CAJA -->
      @let session = ordersService.currentCashSession();
      @let stats = ordersService.sessionStats();
      @if (!session) {
        <div class="bg-[#161A1F] border border-yellow-500/30 rounded-2xl p-8 text-center space-y-3">
          <div class="w-12 h-12 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center mx-auto">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h3 class="text-white font-bold text-base">La caja se encuentra cerrada</h3>
          <p class="text-xs text-[#9CA3AF] max-w-sm mx-auto">Debes realizar la apertura de caja para registrar operaciones en Live Ops.</p>
          <button (click)="openRegisterModal()" class="bg-[#00D2B4] text-black font-bold text-xs px-6 py-2.5 rounded-lg transition">Iniciar Apertura</button>
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-[#161A1F] border border-[#232933] rounded-xl p-4">
            <span class="text-[#9CA3AF] text-[11px] font-bold uppercase tracking-wider block mb-1">Monto Inicial (Base)</span>
            <span class="font-mono text-xl font-bold text-white">S/ {{ session.initialAmount.toFixed(2) }}</span>
            <p class="text-[10px] text-[#6B7280] mt-1 font-mono">Apertura: {{ session.openedAt | date:'HH:mm' }}</p>
          </div>

          <div class="bg-[#161A1F] border border-blue-500/20 rounded-xl p-4 relative">
            <span class="text-blue-400 text-[11px] font-bold uppercase tracking-wider block mb-1">Ventas Efectivo</span>
            <span class="font-mono text-xl font-bold text-blue-400">S/ {{ stats.cash.toFixed(2) }}</span>
            @if (session.totalWithdrawals > 0) {
              <p class="text-[10px] text-red-400 font-bold mt-1 tracking-tight">Retiros: -S/ {{ session.totalWithdrawals.toFixed(2) }}</p>
            } @else {
              <p class="text-[10px] text-blue-400/70 mt-1">Cobros manuales del turno</p>
            }
          </div>

          <div class="bg-[#161A1F] border border-purple-500/20 rounded-xl p-4">
            <span class="text-purple-400 text-[11px] font-bold uppercase tracking-wider block mb-1">Ventas Digitales</span>
            <span class="font-mono text-xl font-bold text-purple-400">S/ {{ stats.digital.toFixed(2) }}</span>
            <p class="text-[10px] text-purple-400/70 mt-1">Yape / Plin del turno</p>
          </div>

          <div class="bg-[#161A1F] border border-[#00D2B4]/30 rounded-xl p-4 shadow-[0_0_15px_rgba(0,210,180,0.05)]">
            <span class="text-[#00D2B4] text-[11px] font-bold uppercase tracking-wider block mb-1">Físico Neto en Caja</span>
            <span class="font-mono text-xl font-bold text-[#00D2B4]">S/ {{ (session.initialAmount + stats.cash - (session.totalWithdrawals || 0)).toFixed(2) }}</span>
            <p class="text-[10px] text-[#00D2B4]/70 mt-1">Base + Ventas - Retiros</p>
          </div>
        </div>
      }

      <!-- HISTORIAL DE CIERRES -->
      <div class="bg-[#161A1F] border border-[#232933] rounded-xl overflow-hidden p-4 md:p-5 space-y-4">
        <h2 class="text-sm font-bold text-white uppercase tracking-wider">Historial de Cierres de Caja</h2>

        @if (ordersService.cashSessions().length === 0) {
          <div class="py-8 text-center text-[#6B7280] text-xs">No hay registros históricos de caja.</div>
        }

        <!-- VISTA MÓVIL: Tarjetas compactas interactivas -->
        <div class="grid grid-cols-1 gap-2.5 md:hidden">
          @for (item of ordersService.cashSessions(); track item.id) {
            <div (click)="viewSessionDetail(item)" class="bg-[#111418] border border-[#232933] active:border-[#FF9F0A]/50 rounded-xl p-3.5 flex items-center justify-between transition cursor-pointer">
              <div class="space-y-1 min-w-0 pr-2">
                <div class="flex items-center gap-2">
                  <span class="font-mono text-xs font-bold text-white">{{ item.id.toUpperCase() }}</span>
                  <span class="text-[9px] px-2 py-0.5 rounded font-bold uppercase border" [ngClass]="item.status === 'ABIERTA' ? 'bg-[#00D2B4]/10 text-[#00D2B4] border-[#00D2B4]/30' : 'bg-[#232933] text-[#9CA3AF] border-[#374151]'">{{ item.status }}</span>
                </div>
                <p class="text-[10px] text-[#9CA3AF] font-mono">{{ item.openedAt | date:'dd/MM/yyyy HH:mm' }}</p>
              </div>
              <div class="text-right shrink-0 space-y-0.5">
                <span class="font-mono text-sm font-bold text-[#00D2B4] block">S/ {{ (item.status === 'ABIERTA' ? ordersService.sessionStats().total : item.totalSales).toFixed(2) }}</span>
                <span class="text-[10px] text-[#6B7280] block font-mono">Recaudación</span>
              </div>
            </div>
          }
        </div>

        <!-- VISTA ESCRITORIO: Tabla detallada -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[600px]">
            <thead>
            <tr class="bg-[#111418] border-b border-[#232933] text-[11px] uppercase tracking-wider text-[#9CA3AF]">
              <th class="px-4 py-3 font-semibold">ID / Fecha</th>
              <th class="px-4 py-3 font-semibold">Horario</th>
              <th class="px-4 py-3 font-semibold text-right">Efectivo Sobrante</th>
              <th class="px-4 py-3 font-semibold text-right">Recaudación Turno</th>
              <th class="px-4 py-3 font-semibold text-center">Estado</th>
              <th class="px-4 py-3 font-semibold text-center">Acción</th>
            </tr>
            </thead>
            <tbody class="divide-y divide-[#232933] text-sm">
              @for (item of ordersService.cashSessions(); track item.id) {
                <tr class="hover:bg-[#1C2129] transition cursor-pointer" (click)="viewSessionDetail(item)">
                  <td class="px-4 py-3 font-mono text-xs text-white">{{ item.id.toUpperCase() }} <span class="block text-[10px] text-[#9CA3AF]">{{ item.openedAt | date:'dd/MM/yyyy' }}</span></td>
                  <td class="px-4 py-3 text-xs text-[#D1D5DB] font-mono">{{ item.openedAt | date:'HH:mm' }} ➔ {{ item.closedAt ? (item.closedAt | date:'HH:mm') : 'En curso' }}</td>
                  <td class="px-4 py-3 text-right font-mono font-bold text-blue-400">S/ {{ (item.status === 'ABIERTA' ? (ordersService.sessionStats().cash + item.initialAmount - (item.totalWithdrawals || 0)) : item.expectedPhysicalCash)?.toFixed(2) }}</td>
                  <td class="px-4 py-3 text-right font-mono font-bold text-[#00D2B4]">S/ {{ (item.status === 'ABIERTA' ? ordersService.sessionStats().total : item.totalSales).toFixed(2) }}</td>
                  <td class="px-4 py-3 text-center"><span class="text-[10px] px-2 py-0.5 rounded font-bold uppercase border" [ngClass]="item.status === 'ABIERTA' ? 'bg-[#00D2B4]/10 text-[#00D2B4] border-[#00D2B4]/30' : 'bg-[#232933] text-[#9CA3AF] border-[#374151]'">{{ item.status }}</span></td>
                  <td class="px-4 py-3 text-center"><button (click)="$event.stopPropagation(); viewSessionDetail(item)" class="text-xs bg-[#111418] border border-[#232933] hover:border-[#FF9F0A] px-3 py-1.5 rounded text-white font-bold transition">Detalles</button></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODALES DE CAJA -->
      @if (openModal()) {
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-[#161A1F] border border-[#232933] rounded-2xl w-full max-w-sm shadow-2xl p-5 space-y-4 text-xs">
            <h3 class="font-bold text-sm text-white">Apertura de Caja</h3>
            <p class="text-[#9CA3AF]">Se ha precargado el monto físico restante del último cierre. Valídalo e inicia el turno.</p>
            <div class="space-y-1">
              <label class="font-bold text-[#00D2B4] uppercase block">Monto Base Inicial (S/)</label>
              <input type="number" [(ngModel)]="initialBaseAmount" class="w-full bg-[#111418] border border-[#232933] rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-[#00D2B4]" />
            </div>
            <div class="flex gap-2 pt-2">
              <button (click)="openModal.set(false)" class="flex-1 py-2 font-semibold text-white bg-[#232933] rounded-lg">Cancelar</button>
              <button (click)="confirmOpenRegister()" class="flex-1 py-2 font-bold text-black bg-[#00D2B4] hover:bg-[#05b89f] rounded-lg">Abrir Turno</button>
            </div>
          </div>
        </div>
      }

      @if (withdrawModalOpen()) {
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-[#161A1F] border border-[#232933] rounded-2xl w-full max-w-sm shadow-2xl p-5 space-y-4 text-xs">
            <h3 class="font-bold text-sm text-white">Retiro de Efectivo</h3>
            <p class="text-[#9CA3AF]">Retira dinero físico de la caja. Este monto se descontará del físico esperado.</p>
            <div class="space-y-3">
              <div>
                <label class="font-bold text-white uppercase block mb-1">Monto a Retirar (S/)</label>
                <input type="number" [(ngModel)]="withdrawAmount" class="w-full bg-[#111418] border border-[#232933] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#FF9F0A]" />
              </div>
              <div>
                <label class="font-bold text-white uppercase block mb-1">Razón del retiro</label>
                <select [(ngModel)]="withdrawReason" class="w-full bg-[#111418] border border-[#232933] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FF9F0A]">
                  <option value="Retiro de ganancias">Retiro de ganancias</option>
                  <option value="Pago a proveedor local">Pago a proveedor local</option>
                  <option value="Sencillo / Cambio interno">Sencillo / Cambio interno</option>
                  <option value="Otro motivo">Otro motivo</option>
                </select>
              </div>
            </div>
            <div class="flex gap-2 pt-2">
              <button (click)="withdrawModalOpen.set(false)" class="flex-1 py-2 font-semibold text-white bg-[#232933] rounded-lg">Cancelar</button>
              <button (click)="confirmWithdraw()" [disabled]="withdrawAmount <= 0" class="flex-1 py-2 font-bold text-black bg-[#FF9F0A] hover:bg-[#FFB340] disabled:opacity-40 rounded-lg">Registrar Retiro</button>
            </div>
          </div>
        </div>
      }

      @if (closeModalOpen()) {
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-[#161A1F] border border-[#232933] rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4 text-xs">
            <h3 class="font-bold text-sm text-white">Cierre Operativo de Turno</h3>
            @if (isEarlyClose()) {
              <div class="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-xl text-yellow-400 space-y-1">
                <p class="font-bold">⚠️ Cierre anticipado detectado</p>
                <p class="text-[11px]">Estás cerrando antes de las 9:00 PM. Indique el motivo:</p>
              </div>
              <select [(ngModel)]="earlyReason" class="w-full bg-[#111418] border border-[#232933] rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-yellow-500">
                <option value="Feriado o día festivo">Feriado o día festivo</option>
                <option value="Baja afluencia de público">Baja afluencia de público</option>
                <option value="Emergencia operativa / mantenimiento">Emergencia operativa / mantenimiento</option>
                <option value="Stock agotado anticipadamente">Stock agotado anticipadamente</option>
              </select>
            }
            <div class="bg-[#111418] p-3 rounded-xl border border-[#232933] font-mono space-y-2">
              <div class="flex justify-between text-[#9CA3AF]"><span>Monto Inicial Fijo:</span><span class="text-white">S/ {{ ordersService.currentCashSession()?.initialAmount?.toFixed(2) }}</span></div>
              <div class="flex justify-between text-[#9CA3AF]"><span>Ingresos Efectivo:</span><span class="text-white">+ S/ {{ ordersService.sessionStats().cash.toFixed(2) }}</span></div>
              <div class="flex justify-between text-red-400/80"><span>Retiros Realizados:</span><span>- S/ {{ (ordersService.currentCashSession()?.totalWithdrawals || 0).toFixed(2) }}</span></div>
              <div class="flex justify-between text-[#00D2B4] border-t border-[#232933] pt-2 text-sm font-bold">
                <span>Efectivo Final a Entregar:</span>
                <span>S/ {{ ((ordersService.currentCashSession()?.initialAmount || 0) + ordersService.sessionStats().cash - (ordersService.currentCashSession()?.totalWithdrawals || 0)).toFixed(2) }}</span>
              </div>
            </div>
            <div class="flex gap-2 pt-2">
              <button (click)="closeModalOpen.set(false)" class="flex-1 py-2.5 font-semibold text-white bg-[#232933] rounded-lg">Cancelar</button>
              <button (click)="confirmCloseRegister()" class="flex-1 py-2.5 font-bold text-black bg-red-500 hover:bg-red-400 rounded-lg">Confirmar Cierre</button>
            </div>
          </div>
        </div>
      }

      @if (selectedHistorySession()) {
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-[#161A1F] border border-[#232933] rounded-2xl w-full max-w-sm shadow-2xl p-5 space-y-4 text-xs">
            <div class="flex justify-between items-center border-b border-[#232933] pb-3">
              <h3 class="font-bold text-sm text-white">Detalle de Turno</h3>
              <button (click)="selectedHistorySession.set(null)" class="text-gray-400 hover:text-white">✕</button>
            </div>
            <div class="space-y-2 font-mono">
              <div class="flex justify-between text-[#9CA3AF]"><span>Apertura:</span><span class="text-white">{{ selectedHistorySession()?.openedAt | date:'dd/MM/yyyy HH:mm' }}</span></div>
              <div class="flex justify-between text-[#9CA3AF]"><span>Cierre:</span><span class="text-white">{{ selectedHistorySession()?.closedAt ? (selectedHistorySession()?.closedAt | date:'HH:mm') : 'N/A' }}</span></div>
              <div class="flex justify-between text-[#9CA3AF] mt-2"><span>Monto Inicial:</span><span class="text-white">S/ {{ selectedHistorySession()?.initialAmount?.toFixed(2) }}</span></div>
              <div class="flex justify-between text-[#9CA3AF]"><span>Ventas Efectivo:</span><span class="text-blue-400">S/ {{ selectedHistorySession()?.totalCashSales?.toFixed(2) }}</span></div>
              <div class="flex justify-between text-[#9CA3AF]"><span>Total Retiros:</span><span class="text-red-400">- S/ {{ (selectedHistorySession()?.totalWithdrawals || 0).toFixed(2) }}</span></div>
              <div class="flex justify-between text-[#9CA3AF] border-t border-[#232933] pt-1 mt-1"><span>Físico Final:</span><span class="text-[#00D2B4] font-bold">S/ {{ selectedHistorySession()?.expectedPhysicalCash?.toFixed(2) }}</span></div>
              @if (selectedHistorySession()?.earlyCloseReason) { <div class="pt-2 border-t border-[#232933] text-yellow-400 mt-2"><span class="block font-sans font-bold">Razón de cierre anticipado:</span><span class="font-sans italic">{{ selectedHistorySession()?.earlyCloseReason }}</span></div> }
            </div>
            <button (click)="selectedHistorySession.set(null)" class="w-full py-2 bg-[#232933] hover:bg-[#374151] transition text-white font-bold rounded-lg mt-2">Cerrar</button>
          </div>
        </div>
      }
    </div>
  `
})
export class CashRegisterComponent {
  ordersService = inject(MockOrdersService);

  openModal = signal(false);
  withdrawModalOpen = signal(false);
  closeModalOpen = signal(false);

  pendingOrdersAlert = signal(false);
  pendingOrdersCount = signal(0);

  initialBaseAmount = 100.00;
  withdrawAmount = 0;
  withdrawReason = 'Retiro de ganancias';
  earlyReason = 'Baja afluencia de público';

  selectedHistorySession = signal<CashRegisterSession | null>(null);

  isEarlyClose(): boolean { return new Date().getHours() < 21; }

  openRegisterModal(): void {
    const lastSession = this.ordersService.lastClosedSession();
    this.initialBaseAmount = lastSession && lastSession.expectedPhysicalCash ? lastSession.expectedPhysicalCash : 100.00;
    this.openModal.set(true);
  }

  confirmOpenRegister(): void {
    this.ordersService.openCashRegister(this.initialBaseAmount);
    this.openModal.set(false);
  }

  confirmWithdraw(): void {
    this.ordersService.withdrawCash(this.withdrawAmount, this.withdrawReason);
    this.withdrawAmount = 0;
    this.withdrawModalOpen.set(false);
  }

  requestCloseRegister(): void {
    const session = this.ordersService.currentCashSession();
    if (!session) return;

    const sessionStart = new Date(session.openedAt);
    const activeSessionOrders = this.ordersService.orders().filter(o => new Date(o.createdAt) >= sessionStart);
    const pendingOrders = activeSessionOrders.filter(o => o.orderStatus !== 'ENTREGADO' && o.orderStatus !== 'CANCELADO');

    if (pendingOrders.length > 0) {
      this.pendingOrdersCount.set(pendingOrders.length);
      this.pendingOrdersAlert.set(true);
      setTimeout(() => {
        this.pendingOrdersAlert.set(false);
      }, 6000);
      return;
    }

    this.pendingOrdersAlert.set(false);
    this.closeModalOpen.set(true);
  }

  confirmCloseRegister(): void {
    this.ordersService.closeCashRegister(this.isEarlyClose() ? this.earlyReason : undefined);
    this.closeModalOpen.set(false);
  }

  viewSessionDetail(session: CashRegisterSession): void { this.selectedHistorySession.set(session); }
}
