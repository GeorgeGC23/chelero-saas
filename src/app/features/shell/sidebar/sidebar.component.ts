import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockOrdersService } from '../../../core/services/mock/mock-orders.service';

type Tab = 'ops' | 'crm' | 'stock' | 'promos' | 'caja' | 'ventas' | 'dashboard';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="hidden md:flex w-[260px] lg:w-[280px] bg-[#111418] border-r border-[#232933] flex-col justify-between p-5 shrink-0 select-none z-20 h-full">
      <div class="space-y-7">
        <div class="flex items-center gap-3 px-1 py-1">
          <!-- NUEVO LOGO: UNA BOTELLA -->
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1C2129] to-[#12151B] border border-[#FF9F0A]/30 flex items-center justify-center text-[#FF9F0A] shadow-[0_0_15px_rgba(255,159,10,0.2)]">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 16v-4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v4" />
              <path d="M10 16h4v5a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-5z" />
              <path d="M12 10V3a1 1 0 0 1 1-1h0a1 1 0 0 1 1 1v7" />
              <path d="M10 18h4" />
            </svg>
          </div>
          <div>
            <span class="text-xl font-extrabold tracking-wider text-white">CHELER<span class="text-[#FF9F0A]">O</span></span>
            <span class="block text-[10px] text-[#6B7280] font-semibold tracking-widest uppercase">UNAS CHE?</span>
          </div>
        </div>

        <nav class="space-y-1.5">
          <button (click)="onTabChange('ops')" class="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold transition" [ngClass]="activeTab === 'ops' ? 'bg-[#FF9F0A]/10 text-[#FF9F0A] border border-[#FF9F0A]/25' : 'text-[#9CA3AF] hover:bg-[#161A1F] hover:text-white border border-transparent'">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <span>Live Operations</span>
          </button>

          <!-- BOTÓN DE HISTORIAL DE VENTAS -->
          <button (click)="onTabChange('ventas')" class="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition" [ngClass]="activeTab === 'ventas' ? 'bg-[#FF9F0A]/10 text-[#FF9F0A] border border-[#FF9F0A]/25' : 'text-[#9CA3AF] hover:bg-[#161A1F] hover:text-white border border-transparent'">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <span>Historial de Ventas</span>
          </button>

          <button (click)="onTabChange('crm')" class="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition" [ngClass]="activeTab === 'crm' ? 'bg-[#FF9F0A]/10 text-[#FF9F0A] border border-[#FF9F0A]/25' : 'text-[#9CA3AF] hover:bg-[#161A1F] hover:text-white border border-transparent'">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            <span>Clientes CRM</span>
          </button>

          <button (click)="onTabChange('stock')" class="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition" [ngClass]="activeTab === 'stock' ? 'bg-[#FF9F0A]/10 text-[#FF9F0A] border border-[#FF9F0A]/25' : 'text-[#9CA3AF] hover:bg-[#161A1F] hover:text-white border border-transparent'">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            <span>Inventario & Stock</span>
          </button>

          <button (click)="onTabChange('promos')" class="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition" [ngClass]="activeTab === 'promos' ? 'bg-[#FF9F0A]/10 text-[#FF9F0A] border border-[#FF9F0A]/25' : 'text-[#9CA3AF] hover:bg-[#161A1F] hover:text-white border border-transparent'">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
            <span>Promociones & Combos</span>
          </button>

          <button (click)="onTabChange('caja')" class="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition" [ngClass]="activeTab === 'caja' ? 'bg-[#FF9F0A]/10 text-[#FF9F0A] border border-[#FF9F0A]/25' : 'text-[#9CA3AF] hover:bg-[#161A1F] hover:text-white border border-transparent'">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            <span>Caja & Turnos</span>
          </button>

          <button (click)="onTabChange('dashboard')" class="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition" [ngClass]="activeTab === 'dashboard' ? 'bg-[#FF9F0A]/10 text-[#FF9F0A] border border-[#FF9F0A]/25' : 'text-[#9CA3AF] hover:bg-[#161A1F] hover:text-white border border-transparent'">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            <span>Dashboard</span>
          </button>
        </nav>
      </div>

      <!-- WIDGET -->
      <div class="bg-gradient-to-b from-[#1C2129] to-[#161A1F] p-4 rounded-2xl border border-[#00D2B4]/30 shadow-[0_0_25px_rgba(0,210,180,0.05)] mt-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[#00D2B4] text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#00D2B4] shadow-[0_0_6px_#00D2B4]"></span> Total del Día</span>
        </div>
        <p class="font-mono text-white text-2xl font-bold tracking-tight text-shadow-sm">S/ {{ ordersService.totalSalesToday().toFixed(2) }}</p>
        <div class="mt-3 pt-2.5 border-t border-[#232933] space-y-1 text-xs text-[#9CA3AF] font-medium">
          <div class="flex justify-between"><span>Efectivo:</span><span class="text-blue-400 font-bold">S/ {{ ordersService.totalCashSalesToday().toFixed(2) }}</span></div>
          <div class="flex justify-between"><span>Yape / Plin:</span><span class="text-purple-400 font-bold">S/ {{ ordersService.totalDigitalSalesToday().toFixed(2) }}</span></div>
        </div>
        <div class="mt-3 pt-2.5 border-t border-[#00D2B4]/20">
          <span class="text-[#9CA3AF] text-[9px] uppercase tracking-wider block mb-0.5">Ganancias del Mes</span>
          <span class="text-[#00D2B4] font-bold font-mono text-sm">S/ {{ ordersService.monthlySales().toFixed(2) }}</span>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  ordersService = inject(MockOrdersService);
  @Input() activeTab: Tab = 'ops';
  @Output() tabChange = new EventEmitter<Tab>();

  onTabChange(tab: Tab): void { this.tabChange.emit(tab); }
}
