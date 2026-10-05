import { Component, inject, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockOrdersService } from '../../../core/services/mock/mock-orders.service';
import { AuthService } from '../../../core/services/mock/auth.service';
import { SalesChannel } from '../../../core/domain/models/order.model';

type Tab = 'ops' | 'crm' | 'stock' | 'promos' | 'caja' | 'ventas' | 'dashboard';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="h-16 border-b border-[#232933] bg-[#111418] px-4 md:px-6 flex items-center justify-between shrink-0 z-10 print:hidden relative">
      <div class="flex items-center gap-3 w-full md:w-auto">
        <!-- LOGO BOTELLA EN MÓVIL -->
        <div class="md:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-[#1C2129] border border-[#FF9F0A]/30 text-[#FF9F0A] shrink-0">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 16v-4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v4" />
            <path d="M10 16h4v5a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-5z" />
            <path d="M12 10V3a1 1 0 0 1 1-1h0a1 1 0 0 1 1 1v7" />
            <path d="M10 18h4" />
          </svg>
        </div>

        <!-- BUSCADOR GLOBAL REACTIVO -->
        <div class="relative flex items-center flex-1 md:flex-none">
          <svg class="w-4 h-4 absolute left-3 text-[#6B7280] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            [ngModel]="ordersService.globalSearchTerm()"
            (ngModelChange)="ordersService.globalSearchTerm.set($event)"
            [placeholder]="getSearchPlaceholder()"
            class="w-full md:w-80 lg:w-96 bg-[#161A1F] border border-[#232933] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#FF9F0A] transition"
          />
        </div>
      </div>

      <!-- ZONA DERECHA: BOTONES DE ACCIÓN / MENÚ DESPLEGABLE DE USUARIO -->
      <div class="flex items-center gap-2 md:gap-3 shrink-0">

        <!-- Botones de Acción Rápida (Escritorio) -->
        <div class="hidden md:flex items-center gap-2 mr-2">
          <button (click)="openSaleModal('VENTA_TIENDA_MOSTRADOR')" class="flex items-center gap-2 bg-[#00D2B4] hover:bg-[#05b89f] text-[#0A0C0E] font-bold text-xs px-3.5 py-2 rounded-lg transition shadow-[0_0_15px_rgba(0,210,180,0.3)] active:scale-95">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            <span>Mostrador</span>
          </button>
          <button (click)="openSaleModal('DELIVERY_WHATSAPP')" class="flex items-center gap-2 bg-[#FF9F0A] hover:bg-[#FFB340] text-black font-bold text-xs px-3.5 py-2 rounded-lg transition shadow-[0_0_18px_rgba(255,159,10,0.25)] active:scale-95">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
            <span>Delivery</span>
          </button>
        </div>

        <!-- PERFIL Y MENÚ DESPLEGABLE (Esquina Superior Derecha) -->
        <div class="relative">
          <button (click)="toggleDropdown()" class="flex items-center gap-2 bg-[#161A1F] hover:bg-[#1C2129] border border-[#232933] px-2.5 py-1.5 rounded-xl transition text-left">
            <div class="w-7 h-7 rounded-lg bg-[#FF9F0A]/15 text-[#FF9F0A] font-bold text-xs flex items-center justify-center font-mono">
              {{ getUserInitials() }}
            </div>
            <div class="hidden sm:block text-xs">
              <span class="text-white font-bold block truncate max-w-[100px]">{{ authService.currentUser()?.name }}</span>
              <span class="text-[9px] text-[#FF9F0A] font-bold uppercase tracking-wider">{{ authService.currentUser()?.role }}</span>
            </div>
            <svg class="w-3.5 h-3.5 text-[#9CA3AF] transition-transform" [ngClass]="{'rotate-180': dropdownOpen()}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>

          <!-- MENÚ DESPLEGABLE FLOTANTE -->
          @if (dropdownOpen()) {
            <div class="absolute right-0 top-[calc(100%+8px)] w-52 bg-[#161A1F] border border-[#232933] rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">

              <div class="px-3 py-2 border-b border-[#232933] sm:hidden">
                <p class="text-white font-bold text-xs truncate">{{ authService.currentUser()?.name }}</p>
                <p class="text-[9px] text-[#FF9F0A] font-bold uppercase">{{ authService.currentUser()?.role }}</p>
              </div>

              <!-- Opción Caja (Especial para móviles en la misma esquina) -->
              <button (click)="openCajaTab(); dropdownOpen.set(false)" class="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#00D2B4] hover:bg-[#232933]/50 rounded-xl transition font-medium">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                <span>Control de Caja & Turno</span>
              </button>

              <div class="h-px bg-[#232933] my-1"></div>

              <!-- Botón Cerrar Sesión / Bloquear -->
              <button (click)="logout(); dropdownOpen.set(false)" class="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-xl transition font-medium">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                <span>Cerrar Sesión (Bloquear)</span>
              </button>

            </div>
          }
        </div>

      </div>
    </header>
  `
})
export class TopbarComponent {
  ordersService = inject(MockOrdersService);
  authService = inject(AuthService);

  @Input() activeTab: Tab = 'ops';
  @Output() openModal = new EventEmitter<SalesChannel>();
  @Output() openCajaMobile = new EventEmitter<void>();

  dropdownOpen = signal(false);

  toggleDropdown(): void {
    this.dropdownOpen.update(v => !v);
  }

  getUserInitials(): string {
    const name = this.authService.currentUser()?.name || 'US';
    return name.substring(0, 2).toUpperCase();
  }

  getSearchPlaceholder(): string {
    const tabs: Record<string, string> = {
      'ops': 'Buscar pedido, cliente o #ORD...',
      'ventas': 'Buscar por Cód, Cliente o ID Turno...',
      'crm': 'Buscar cliente por nombre o teléfono...',
      'stock': 'Buscar producto o categoría...',
      'promos': 'Buscar combo o promoción...',
      'caja': 'Buscar sesión de caja o ID...'
    };
    return tabs[this.activeTab] || 'Buscar...';
  }

  openSaleModal(channel: SalesChannel): void {
    this.openModal.emit(channel);
  }

  openCajaTab(): void {
    this.openCajaMobile.emit();
  }

  logout(): void {
    this.authService.logout();
  }
}
