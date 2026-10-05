import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockOrdersService, CatalogProduct, PromoCombo } from './core/services/mock/mock-orders.service';
import { AuthService } from './core/services/mock/auth.service';
import { Order, PaymentMethod, BankDestination, SalesChannel, OrderItem } from './core/domain/models/order.model';

import { SidebarComponent } from './features/shell/sidebar/sidebar.component';
import { TopbarComponent } from './features/shell/topbar/topbar.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { InventoryComponent } from './features/inventory/inventory.component';
import { LiveOperationsComponent } from './features/live-operations/live-operations.component';
import { CrmClientsComponent } from './features/crm-clients/crm-clients.component';
import { PromosComponent } from './features/promos/promos.component';
import { CashRegisterComponent } from './features/cash-register/cash-register.component';
import { SalesHistoryComponent } from './features/sales-history/sales-history.component';
import { LoginComponent } from './features/auth/login.component';

type Tab = 'ops' | 'crm' | 'stock' | 'promos' | 'caja' | 'ventas' | 'dashboard';
type CatalogSubTab = 'products' | 'combos';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent,
    TopbarComponent,
    DashboardComponent,
    InventoryComponent,
    LiveOperationsComponent,
    CrmClientsComponent,
    PromosComponent,
    CashRegisterComponent,
    SalesHistoryComponent,
    LoginComponent
  ],
  template: `
    <!-- PANTALLA DE LOGIN SI NO ESTÁ AUTENTICADO -->
    @if (!authService.isAuthenticated()) {
      <app-login></app-login>
    } @else {
      <div class="flex h-screen w-screen bg-[#0A0C0E] text-[#F3F4F6] overflow-hidden antialiased">

        <app-sidebar [activeTab]="activeTab()" (tabChange)="changeTab($event)"></app-sidebar>

        <main class="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">

          <app-topbar [activeTab]="activeTab()" (openModal)="openModal($event)" (openCajaMobile)="changeTab('caja')"></app-topbar>

          <section class="flex-1 p-4 md:p-6 overflow-y-auto bg-[#0A0C0E] pb-28 md:pb-6 print:p-0">
            @if (activeTab() === 'ops') { <app-live-operations></app-live-operations> }
            @if (activeTab() === 'ventas') { <app-sales-history></app-sales-history> }
            @if (activeTab() === 'stock') { <app-inventory></app-inventory> }
            @if (activeTab() === 'promos') { <app-promos></app-promos> }
            @if (activeTab() === 'caja') { <app-cash-register></app-cash-register> }
            @if (activeTab() === 'dashboard') { <app-dashboard></app-dashboard> }
            @if (activeTab() === 'crm') { <app-crm-clients></app-crm-clients> }
          </section>

          <!-- BOTTOM NAV BAR MÓVIL (6 pestañas distribuidas armónicamente) -->
          <nav class="md:hidden fixed bottom-0 left-0 w-full bg-[#111418]/95 backdrop-blur-md border-t border-[#232933] z-30 h-16 pb-safe print:hidden">
            <div class="grid grid-cols-7 h-full items-center w-full px-1">

              <!-- Bloque Izquierda (3 pestañas) -->
              <div class="grid grid-cols-3 h-full col-span-3 items-center">
                <button (click)="changeTab('ops')" class="flex flex-col items-center justify-center w-full h-full transition" [ngClass]="activeTab() === 'ops' ? 'text-[#FF9F0A]' : 'text-[#6B7280]'">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  <span class="text-[8px] mt-1 font-bold">Ops</span>
                </button>
                <button (click)="changeTab('ventas')" class="flex flex-col items-center justify-center w-full h-full transition" [ngClass]="activeTab() === 'ventas' ? 'text-[#FF9F0A]' : 'text-[#6B7280]'">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <span class="text-[8px] mt-1 font-medium">Ventas</span>
                </button>
                <button (click)="changeTab('stock')" class="flex flex-col items-center justify-center w-full h-full transition" [ngClass]="activeTab() === 'stock' ? 'text-[#FF9F0A]' : 'text-[#6B7280]'">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                  <span class="text-[8px] mt-1 font-medium">Stock</span>
                </button>
              </div>

              <!-- Botones Centrales Flotantes para Vender -->
              <div class="relative w-full h-full flex justify-center col-span-1">
                <div class="absolute -top-5 flex items-center gap-1 bg-[#161A1F] p-1 rounded-full border border-[#232933] shadow-[0_10px_25px_rgba(0,0,0,0.6)]">
                  <button (click)="openModal('VENTA_TIENDA_MOSTRADOR')" class="w-8 h-8 rounded-full bg-[#00D2B4] text-[#0A0C0E] flex items-center justify-center shadow-[0_0_10px_rgba(0,210,180,0.3)] active:scale-90 transition"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg></button>
                  <button (click)="openModal('DELIVERY_WHATSAPP')" class="w-8 h-8 rounded-full bg-[#FF9F0A] text-black flex items-center justify-center shadow-[0_0_10px_rgba(255,159,10,0.3)] active:scale-90 transition"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg></button>
                </div>
              </div>

              <!-- Bloque Derecha (3 pestañas: Promos, CRM, Panel) -->
              <div class="grid grid-cols-3 h-full col-span-3 items-center">
                <button (click)="changeTab('promos')" class="flex flex-col items-center justify-center w-full h-full transition" [ngClass]="activeTab() === 'promos' ? 'text-[#FF9F0A]' : 'text-[#6B7280]'">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                  <span class="text-[8px] mt-1 font-medium">Promos</span>
                </button>
                <button (click)="changeTab('crm')" class="flex flex-col items-center justify-center w-full h-full transition" [ngClass]="activeTab() === 'crm' ? 'text-[#FF9F0A]' : 'text-[#6B7280]'">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  <span class="text-[8px] mt-1 font-medium">CRM</span>
                </button>
                <button (click)="changeTab('dashboard')" class="flex flex-col items-center justify-center w-full h-full transition" [ngClass]="activeTab() === 'dashboard' ? 'text-[#FF9F0A]' : 'text-[#6B7280]'">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  <span class="text-[8px] mt-1 font-medium">Panel</span>
                </button>
              </div>

            </div>
          </nav>
        </main>

        <!-- MODAL DE REGISTRO DE VENTA -->
        @if (isModalOpen()) {
          <div class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-end md:items-center justify-center md:p-4 print:hidden">
            <div class="bg-[#161A1F] md:border border-[#232933] md:rounded-2xl w-full max-w-5xl h-[94vh] md:h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom md:fade-in duration-200 relative">
              <div class="px-5 md:px-6 py-4 border-b border-[#232933] bg-[#111418] flex items-center justify-between shrink-0" [ngClass]="{'hidden md:flex': mobileCheckoutOpen()}">
                <div class="flex items-center gap-3">
                  <span class="px-2.5 py-1 rounded-md text-[10px] md:text-xs font-bold" [ngClass]="modalChannel() === 'VENTA_TIENDA_MOSTRADOR' ? 'bg-[#00D2B4]/20 text-[#00D2B4]' : 'bg-[#FF9F0A]/20 text-[#FF9F0A]'">{{ modalChannel() === 'VENTA_TIENDA_MOSTRADOR' ? 'MOSTRADOR' : 'DELIVERY' }}</span>
                  <h3 class="font-bold text-sm text-white">Registro de Venta</h3>
                </div>
                <button (click)="closeModal()" class="text-[#6B7280] hover:text-white transition bg-[#232933]/50 p-1.5 rounded-full"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>

              <div class="flex-1 flex flex-col md:flex-row min-h-0 md:divide-x divide-[#232933] relative">
                <div class="w-full md:w-7/12 flex flex-col p-4 md:p-5 overflow-y-auto bg-[#0A0C0E]/50 pb-28 md:pb-5" [ngClass]="mobileCheckoutOpen() ? 'hidden md:flex' : 'flex'">

                  <div class="flex bg-[#111418] p-1 rounded-xl border border-[#232933] mb-4 shrink-0">
                    <button (click)="catalogSubTab.set('products')" class="flex-1 py-2 text-xs font-bold rounded-lg transition" [ngClass]="catalogSubTab() === 'products' ? 'bg-[#FF9F0A] text-black shadow' : 'text-[#9CA3AF] hover:text-white'">
                      Productos Generales
                    </button>
                    <button (click)="catalogSubTab.set('combos')" class="flex-1 py-2 text-xs font-bold rounded-lg transition" [ngClass]="catalogSubTab() === 'combos' ? 'bg-[#FF9F0A] text-black shadow' : 'text-[#9CA3AF] hover:text-white'">
                      Promociones & Combos
                    </button>
                  </div>

                  @if (catalogSubTab() === 'products') {
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      @for (prod of ordersService.inventory(); track prod.id) {
                        <div class="bg-[#181C22] border rounded-xl p-3 flex flex-col justify-between transition" [ngClass]="prod.stock === 0 ? 'border-red-500/30 opacity-70' : 'border-[#232933] hover:border-[#374151]'">
                          <div class="flex gap-3">
                            <div class="min-w-0 flex-1">
                              <span class="text-[10px] text-[#9CA3AF] uppercase block">{{ prod.category }}</span>
                              <h4 class="text-xs font-bold text-white leading-tight truncate mt-0.5">{{ prod.name }}</h4>
                              <span class="font-mono text-xs font-bold text-[#FF9F0A] mt-1 block">S/ {{ prod.price.toFixed(2) }}</span>
                            </div>
                          </div>
                          <div class="mt-2.5 pt-2 border-t border-[#232933] flex items-center justify-between">
                            <span class="text-[10px] font-bold tracking-wider" [ngClass]="prod.stock > 0 ? (prod.stock < 15 ? 'text-yellow-500' : 'text-[#00D2B4]') : 'text-red-500'">{{ prod.stock > 0 ? 'STOCK: ' + prod.stock : 'AGOTADO' }}</span>
                            <div class="flex items-center gap-1.5">
                              @if (getItemQuantity(prod.id) > 0) { <button (click)="decrementProduct(prod)" class="w-7 h-7 md:w-6 md:h-6 rounded bg-[#232933] hover:bg-[#374151] text-white font-bold text-xs active:scale-90 transition">-</button> }
                              <button (click)="incrementProduct(prod)" [disabled]="prod.stock === 0 || getItemQuantity(prod.id) >= prod.stock" class="w-7 h-7 md:w-6 md:h-6 rounded flex items-center justify-center font-bold text-xs transition disabled:opacity-30 active:scale-90" [ngClass]="prod.stock > 0 ? 'bg-[#FF9F0A] text-black hover:bg-[#FFB340]' : 'bg-[#232933] text-white'">+</button>
                            </div>
                          </div>
                        </div>
                      }
                    </div>
                  }

                  @if (catalogSubTab() === 'combos') {
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      @if (ordersService.combos().length === 0) {
                        <div class="col-span-full py-8 text-center text-[#6B7280] text-xs">No hay combos registrados.</div>
                      }
                      @for (combo of ordersService.combos(); track combo.id) {
                        <div class="bg-[#181C22] border border-[#232933] hover:border-[#FF9F0A]/40 rounded-xl p-3 flex flex-col justify-between transition">
                          <div>
                            <span class="text-[9px] bg-[#FF9F0A]/15 text-[#FF9F0A] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Combo</span>
                            <h4 class="text-xs font-bold text-white leading-tight truncate mt-1">{{ combo.name }}</h4>
                            <p class="text-[10px] text-[#9CA3AF] truncate mt-0.5">{{ combo.description }}</p>
                            <span class="font-mono text-xs font-bold text-[#00D2B4] mt-2 block">S/ {{ combo.promoPrice.toFixed(2) }} <span class="text-[10px] text-[#6B7280] line-through font-normal">S/ {{ combo.originalPrice.toFixed(2) }}</span></span>
                          </div>
                          <div class="mt-3 pt-2 border-t border-[#232933] flex items-center justify-between">
                            <span class="text-[10px] text-[#9CA3AF]">Pack especial</span>
                            <button (click)="addComboToCart(combo)" class="px-3 py-1.5 rounded bg-[#FF9F0A] hover:bg-[#FFB340] text-black font-bold text-xs transition active:scale-95">Agregar Combo</button>
                          </div>
                        </div>
                      }
                    </div>
                  }

                </div>

                @if (!mobileCheckoutOpen()) {
                  <div class="md:hidden absolute bottom-0 left-0 w-full bg-[#111418] border-t border-[#232933] p-4 flex items-center justify-between shadow-[0_-10px_20px_rgba(0,0,0,0.5)] z-20">
                    <div>
                      <span class="text-[10px] text-[#9CA3AF] uppercase block font-semibold mb-0.5">Total Carrito</span>
                      <div class="flex items-baseline gap-2"><span class="text-xl font-bold text-white font-mono">S/ {{ calculatedTotal().toFixed(2) }}</span><span class="text-xs font-bold" [ngClass]="modalChannel() === 'VENTA_TIENDA_MOSTRADOR' ? 'text-[#00D2B4]' : 'text-[#FF9F0A]'">{{ cartItems().length }} ítem(s)</span></div>
                    </div>
                    <button (click)="mobileCheckoutOpen.set(true)" [disabled]="cartItems().length === 0" class="font-bold text-xs px-6 py-3.5 rounded-xl transition disabled:opacity-40 text-black shadow-md active:scale-95" [ngClass]="modalChannel() === 'VENTA_TIENDA_MOSTRADOR' ? 'bg-[#00D2B4]' : 'bg-[#FF9F0A]'">Continuar ➔</button>
                  </div>
                }

                <!-- SECCIÓN DE CHECKOUT CON AUTOCOMPLETADO DE CRM -->
                <div class="w-full md:w-5/12 flex-col justify-between bg-[#111418] shrink-0 md:shrink overflow-y-visible md:overflow-y-auto absolute md:relative inset-0 z-30 md:z-auto h-full md:h-auto" [ngClass]="mobileCheckoutOpen() ? 'flex animate-in slide-in-from-right-8 duration-200' : 'hidden md:flex'">
                  <div class="md:hidden px-4 py-3.5 border-b border-[#232933] bg-[#161A1F] flex items-center justify-between sticky top-0 z-10">
                    <button (click)="mobileCheckoutOpen.set(false)" class="text-[#9CA3AF] flex items-center gap-1.5 hover:text-white transition py-1"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg><span class="font-semibold text-xs">Catálogo</span></button>
                    <span class="font-bold text-sm text-white pr-4">Resumen de Venta</span>
                  </div>

                  <div class="p-4 md:p-5 space-y-4 text-xs flex-1">

                    <!-- AUTOCOMPLETADO REACTIVO DE CLIENTES -->
                    <div class="space-y-2 relative">
                      <span class="font-bold text-white uppercase tracking-wider block">Cliente</span>
                      <input type="text"
                             [(ngModel)]="newClientName"
                             (ngModelChange)="onClientSearchChange($event)"
                             placeholder="Buscar o crear cliente"
                             class="w-full bg-[#161A1F] border border-[#232933] rounded-lg px-3 py-3 md:py-2 text-white focus:outline-none focus:border-[#FF9F0A]"
                             (focus)="showCrmSuggestions.set(true)"
                             (blur)="hideSuggestions()" />

                      @if (showCrmSuggestions() && crmSuggestions().length > 0) {
                        <div class="absolute top-[100%] left-0 w-full mt-1 bg-[#161A1F] border border-[#FF9F0A]/30 rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-50 max-h-48 overflow-y-auto">
                          @for (client of crmSuggestions(); track client.fullName) {
                            <div (mousedown)="selectCrmClient(client); $event.preventDefault();" class="p-2.5 hover:bg-[#232933] cursor-pointer flex justify-between items-center transition border-b border-[#232933]/50 last:border-0">
                              <div>
                                <p class="font-bold text-white">{{ client.fullName }}</p>
                                <p class="text-[10px] text-[#9CA3AF] font-mono">{{ client.phoneNumber || 'Sin número' }}</p>
                              </div>
                              <span class="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase" [ngClass]="client.tier === 'VIP' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-400'">{{ client.tier }}</span>
                            </div>
                          }
                        </div>
                      }
                    </div>

                    @if (modalChannel() === 'DELIVERY_WHATSAPP') {
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-2">
                        <div><span class="font-bold text-white uppercase tracking-wider block mb-1">Teléfono</span><input type="text" [(ngModel)]="newClientPhone" placeholder="999888777" class="w-full bg-[#161A1F] border border-[#232933] rounded-lg px-3 py-3 md:py-2 text-white font-mono focus:outline-none focus:border-[#FF9F0A]" /></div>
                        <div><span class="font-bold text-white uppercase tracking-wider block mb-1">Dirección</span><input type="text" [(ngModel)]="newDeliveryAddress" placeholder="Av. Principal 123" class="w-full bg-[#161A1F] border border-[#232933] rounded-lg px-3 py-3 md:py-2 text-white focus:outline-none focus:border-[#FF9F0A]" /></div>
                      </div>
                    }

                    <div class="space-y-2">
                      <span class="font-bold text-white uppercase tracking-wider block">Carrito ({{ cartItems().length }})</span>
                      <div class="bg-[#161A1F] border border-[#232933] rounded-xl p-2.5 max-h-40 md:max-h-36 overflow-y-auto space-y-1.5">
                        @if (cartItems().length === 0) { <p class="text-[#6B7280] text-center py-4">Selecciona productos o combos.</p> }
                        @else {
                          @for (item of cartItems(); track item.productId) {
                            <div class="flex items-center justify-between py-1.5 md:py-1 border-b border-[#232933]/50 last:border-none">
                              <span class="text-[#D1D5DB] truncate pr-2"><strong class="text-white font-mono">{{ item.quantity }}x</strong> {{ item.productName }}</span>
                              <div class="flex items-center gap-2 shrink-0">
                                <span class="font-mono text-white font-bold">S/ {{ item.subtotal.toFixed(2) }}</span>
                                <button (click)="removeCartItem(item.productId)" class="text-red-400 font-bold hover:text-red-300">✕</button>
                              </div>
                            </div>
                          }
                        }
                      </div>
                    </div>

                    <div class="space-y-2 pt-1">
                      <span class="font-bold text-white uppercase tracking-wider block">Liquidación</span>
                      <select [(ngModel)]="selectedPaymentMethod" class="w-full bg-[#161A1F] border border-[#232933] rounded-lg px-3 py-3 md:py-2 text-white focus:outline-none focus:border-[#FF9F0A] mb-2"><option value="EFECTIVO">Efectivo</option><option value="YAPE">Yape</option><option value="PLIN">Plin</option></select>
                      @if (selectedPaymentMethod === 'EFECTIVO') {
                        <div class="flex items-center gap-2"><span class="text-[#9CA3AF] w-16">Efectivo:</span><input type="number" [(ngModel)]="amountTendered" class="w-full bg-[#161A1F] border border-[#232933] rounded-lg px-3 py-3 md:py-2 text-white font-mono text-sm focus:outline-none focus:border-[#FF9F0A]" /></div>
                      }
                    </div>

                    <div class="bg-[#161A1F] border border-[#232933] p-4 md:p-3 rounded-xl space-y-1 font-mono text-sm md:text-xs">
                      <div class="flex justify-between text-[#9CA3AF]"><span>Subtotal:</span><span>S/ {{ cartSubtotal().toFixed(2) }}</span></div>
                      @if (modalChannel() === 'DELIVERY_WHATSAPP') { <div class="flex justify-between text-[#9CA3AF]"><span>Costo Delivery:</span><span>S/ 5.00</span></div> }
                      <div class="flex justify-between text-white font-bold text-base md:text-sm pt-2 border-t border-[#232933] mt-2"><span>Total:</span><span class="text-[#FF9F0A]">S/ {{ calculatedTotal().toFixed(2) }}</span></div>
                      @if (selectedPaymentMethod === 'EFECTIVO' && amountTendered >= calculatedTotal() && calculatedTotal() > 0) { <div class="flex justify-between text-[#00D2B4] font-bold pt-1 text-base md:text-sm"><span>Vuelto:</span><span>S/ {{ changeToGive().toFixed(2) }}</span></div> }
                    </div>
                  </div>

                  <div class="p-4 md:p-5 border-t border-[#232933] flex gap-3 pb-6 md:pb-5 bg-[#111418] sticky bottom-0 z-10">
                    <button (click)="closeModal()" class="flex-1 px-4 py-3.5 md:py-2.5 text-xs font-semibold text-white bg-[#232933] hover:bg-[#374151] rounded-xl md:rounded-lg transition">Cancelar</button>
                    <button (click)="saveOrder()" [disabled]="cartItems().length === 0" class="flex-1 font-bold text-xs px-4 py-3.5 md:py-2.5 rounded-xl md:rounded-lg transition disabled:opacity-40 text-black active:scale-95" [ngClass]="modalChannel() === 'VENTA_TIENDA_MOSTRADOR' ? 'bg-[#00D2B4] hover:bg-[#05b89f]' : 'bg-[#FF9F0A] hover:bg-[#FFB340]'">Procesar Venta</button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        }
      </div>
    }
  `
})
export class App {
  ordersService = inject(MockOrdersService);
  authService = inject(AuthService);

  activeTab = signal<Tab>('ops');
  catalogSubTab = signal<CatalogSubTab>('products');

  isModalOpen = signal(false);
  mobileCheckoutOpen = signal(false);
  modalChannel = signal<SalesChannel>('VENTA_TIENDA_MOSTRADOR');

  newClientName = 'Cliente Mostrador';
  newClientPhone = '';
  newDeliveryAddress = '';

  clientSearchTerm = signal('');
  showCrmSuggestions = signal(false);

  crmSuggestions = computed(() => {
    const term = this.clientSearchTerm().toLowerCase();
    if (term.length < 2 || term === 'cliente mostrador') return [];
    return this.ordersService.crmClients().filter(c => c.fullName.toLowerCase().includes(term));
  });

  cartItems = signal<OrderItem[]>([]);
  selectedPaymentMethod: PaymentMethod = 'EFECTIVO';
  selectedBank: BankDestination = 'BCP';
  amountTendered = 50;

  cartSubtotal = computed(() => this.cartItems().reduce((acc, item) => acc + item.subtotal, 0));
  calculatedTotal = computed(() => this.cartSubtotal() + (this.modalChannel() === 'DELIVERY_WHATSAPP' ? 5.0 : 0));
  changeToGive = computed(() => Math.max(0, (this.amountTendered || 0) - this.calculatedTotal()));

  changeTab(tab: Tab): void {
    this.activeTab.set(tab);
    this.ordersService.globalSearchTerm.set('');
  }

  openModal(channel: SalesChannel): void {
    if (!this.ordersService.currentCashSession()) {
      alert("⚠️ Caja cerrada. Debes abrir la caja antes de registrar nuevas ventas.");
      return;
    }
    this.modalChannel.set(channel);
    this.catalogSubTab.set('products');
    this.newClientName = channel === 'VENTA_TIENDA_MOSTRADOR' ? 'Cliente Mostrador' : '';
    this.clientSearchTerm.set(this.newClientName);
    this.newClientPhone = '';
    this.newDeliveryAddress = '';
    this.cartItems.set([]);
    this.amountTendered = 50;
    this.isModalOpen.set(true);
    this.mobileCheckoutOpen.set(false);
  }

  closeModal(): void { this.isModalOpen.set(false); }

  onClientSearchChange(value: string): void {
    this.clientSearchTerm.set(value);
    this.showCrmSuggestions.set(true);
  }

  hideSuggestions(): void { setTimeout(() => this.showCrmSuggestions.set(false), 200); }

  selectCrmClient(client: any): void {
    this.newClientName = client.fullName;
    this.clientSearchTerm.set(client.fullName);
    if (client.phoneNumber) this.newClientPhone = client.phoneNumber;
    if (client.address) this.newDeliveryAddress = client.address;
    this.showCrmSuggestions.set(false);
  }

  getItemQuantity(productId: string): number {
    return this.cartItems().find(i => i.productId === productId)?.quantity || 0;
  }

  incrementProduct(prod: CatalogProduct): void {
    const current = [...this.cartItems()];
    const index = current.findIndex(i => i.productId === prod.id);

    if (index > -1) {
      current[index] = { ...current[index], quantity: current[index].quantity + 1, subtotal: (current[index].quantity + 1) * current[index].unitPrice };
    } else {
      current.push({ productId: prod.id, productName: prod.name, packaging: prod.packaging, quantity: 1, unitPrice: prod.price, subtotal: prod.price });
    }
    this.cartItems.set(current);
  }

  decrementProduct(prod: CatalogProduct): void {
    const current = [...this.cartItems()];
    const index = current.findIndex(i => i.productId === prod.id);
    if (index > -1) {
      if (current[index].quantity > 1) {
        current[index] = { ...current[index], quantity: current[index].quantity - 1, subtotal: (current[index].quantity - 1) * current[index].unitPrice };
      } else {
        current.splice(index, 1);
      }
      this.cartItems.set(current);
    }
  }

  addComboToCart(combo: PromoCombo): void {
    const current = [...this.cartItems()];
    const index = current.findIndex(i => i.productId === combo.id);

    if (index > -1) {
      current[index] = { ...current[index], quantity: current[index].quantity + 1, subtotal: (current[index].quantity + 1) * current[index].unitPrice };
    } else {
      current.push({
        productId: combo.id,
        productName: `⭐ ${combo.name}`,
        packaging: 'Combo Promocional',
        quantity: 1,
        unitPrice: combo.promoPrice,
        subtotal: combo.promoPrice
      });
    }
    this.cartItems.set(current);
  }

  removeCartItem(productId: string): void {
    this.cartItems.update(items => items.filter(i => i.productId !== productId));
  }

  saveOrder(): void {
    if (this.cartItems().length === 0) return;

    const isDelivery = this.modalChannel() === 'DELIVERY_WHATSAPP';
    const currentSession = this.ordersService.currentCashSession();
    const sessionIdToSave = currentSession ? currentSession.id : 'SIN-TURNO';

    const newOrder: any = {
      id: 'ord-' + Date.now(),
      shortCode: (isDelivery ? '#ORD-' : '#TIENDA-') + Math.floor(1000 + Math.random() * 9000),
      sessionId: sessionIdToSave,
      channel: this.modalChannel(),
      client: { id: 'cli-' + Date.now(), fullName: this.newClientName || 'Cliente Mostrador', phoneNumber: isDelivery && this.newClientPhone ? this.newClientPhone : undefined },
      deliveryAddress: isDelivery ? { address: this.newDeliveryAddress || 'Dirección sin especificar' } : undefined,
      items: [...this.cartItems()],
      subtotal: this.cartSubtotal(),
      deliveryFee: isDelivery ? 5.0 : 0,
      discount: 0,
      total: this.calculatedTotal(),
      payment: {
        method: this.selectedPaymentMethod,
        status: 'PAGADO',
        amountTendered: this.selectedPaymentMethod === 'EFECTIVO' ? this.amountTendered : undefined,
        changeGiven: this.selectedPaymentMethod === 'EFECTIVO' ? this.changeToGive() : undefined,
      },
      orderStatus: isDelivery ? 'NUEVO' : 'ENTREGADO',
      elapsedMinutes: 0,
      createdAt: new Date().toISOString()
    };

    this.ordersService.createOrder(newOrder);
    this.closeModal();
  }
}
