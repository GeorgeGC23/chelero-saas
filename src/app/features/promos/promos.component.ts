import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockOrdersService, PromoCombo, PromoComboItem } from '../../core/services/mock/mock-orders.service';

@Component({
  selector: 'app-promos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-in fade-in duration-200 pb-24 md:pb-0">
      <!-- HEADER -->
      <div class="flex items-center justify-between mb-5">
        <div>
          <h1 class="text-lg font-bold tracking-tight text-white">Promociones & Combos</h1>
          <p class="text-xs text-[#9CA3AF] mt-0.5">Arma paquetes especiales (ej. Combo Floricienta) con descuento</p>
        </div>
        <button (click)="openComboModal()" class="bg-[#FF9F0A] hover:bg-[#FFB340] text-black text-xs font-bold px-4 py-2.5 rounded-lg transition shadow-[0_0_15px_rgba(255,159,10,0.2)] active:scale-95 flex items-center gap-1.5 shrink-0">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
          <span class="hidden sm:inline">Nuevo Combo</span>
        </button>
      </div>

      <!-- GRID DE COMBOS ACTIVOS -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @if (ordersService.combos().length === 0) {
          <div class="col-span-full py-12 text-center text-[#6B7280] text-xs bg-[#161A1F] border border-[#232933] rounded-xl">
            No hay combos promocionales creados todavía. ¡Crea el primero!
          </div>
        }
        @for (combo of ordersService.combos(); track combo.id) {
          <div class="bg-[#161A1F] border border-[#232933] hover:border-[#FF9F0A]/40 rounded-xl p-4 flex flex-col justify-between transition-all shadow-sm">

            <div>
              <div class="flex justify-between items-start mb-2">
                <span class="text-[10px] bg-[#FF9F0A]/15 text-[#FF9F0A] border border-[#FF9F0A]/30 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Combo Activo</span>
                <button (click)="openComboModal(combo)" class="text-[#9CA3AF] hover:text-white text-xs font-bold uppercase bg-[#111418] border border-[#232933] px-2.5 py-1 rounded transition">Editar</button>
              </div>

              <h3 class="font-bold text-white text-base tracking-tight mb-1">{{ combo.name }}</h3>
              <p class="text-xs text-[#9CA3AF] mb-3 leading-relaxed">{{ combo.description }}</p>

              <!-- Ítems del combo -->
              <div class="bg-[#111418] p-2.5 rounded-lg border border-[#232933]/60 space-y-1.5 mb-4">
                @for (item of combo.items; track item.productId) {
                  <div class="flex justify-between items-center text-xs">
                    <span class="text-[#D1D5DB]"><strong class="text-white font-mono">{{ item.quantity }}x</strong> {{ item.productName }}</span>
                    <span class="font-mono text-[#9CA3AF]">S/ {{ (item.unitPrice * item.quantity).toFixed(2) }}</span>
                  </div>
                }
              </div>
            </div>

            <div class="pt-3 border-t border-[#232933] flex items-center justify-between">
              <div>
                <span class="text-[9px] text-[#6B7280] uppercase tracking-wider block">Precio Regular</span>
                <span class="font-mono text-xs text-[#9CA3AF] line-through">S/ {{ combo.originalPrice.toFixed(2) }}</span>
              </div>
              <div class="text-right">
                <span class="text-[9px] text-[#00D2B4] font-bold uppercase tracking-wider block">Precio Oferta</span>
                <span class="font-mono text-lg font-bold text-white">S/ {{ combo.promoPrice.toFixed(2) }}</span>
              </div>
            </div>

          </div>
        }
      </div>

      <!-- MODAL CREAR / EDITAR COMBO -->
      @if (isModalOpen()) {
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-[#161A1F] border border-[#232933] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in duration-200">
            <div class="px-5 py-4 border-b border-[#232933] bg-[#111418] flex items-center justify-between">
              <h3 class="font-bold text-sm text-white">{{ editingCombo() ? 'Editar Combo Promocional' : 'Armar Nuevo Combo' }}</h3>
              <button (click)="closeModal()" class="text-[#6B7280] hover:text-white transition bg-[#232933]/50 p-1.5 rounded-full"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>

            <div class="p-5 space-y-4 text-xs max-h-[70vh] overflow-y-auto">

              <div class="space-y-1.5">
                <label class="font-bold text-white uppercase tracking-wider block">Nombre del Combo (Ej. Combo Floricienta)</label>
                <input type="text" [(ngModel)]="comboName" placeholder="Ej. Combo Floricienta" class="w-full bg-[#111418] border border-[#232933] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FF9F0A]" />
              </div>

              <div class="space-y-1.5">
                <label class="font-bold text-white uppercase tracking-wider block">Descripción corta</label>
                <input type="text" [(ngModel)]="comboDescription" placeholder="Ej. 1x Ron Flor de Caña + Gaseosa + Hielo" class="w-full bg-[#111418] border border-[#232933] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FF9F0A]" />
              </div>

              <!-- Selector de Productos para armar el combo -->
              <div class="space-y-2 pt-2 border-t border-[#232933]">
                <label class="font-bold text-white uppercase tracking-wider block">Seleccionar Productos para el Combo</label>

                <div class="flex gap-2">
                  <select [(ngModel)]="selectedProductId" class="flex-1 bg-[#111418] border border-[#232933] rounded-lg px-3 py-2 text-white focus:outline-none">
                    @for (prod of ordersService.inventory(); track prod.id) {
                      <option [value]="prod.id">{{ prod.name }} (S/ {{ prod.price.toFixed(2) }})</option>
                    }
                  </select>
                  <button (click)="addItemToCombo()" class="px-4 bg-[#FF9F0A] hover:bg-[#FFB340] text-black font-bold rounded-lg transition">Agregar</button>
                </div>

                <!-- Lista de ítems elegidos -->
                <div class="bg-[#111418] border border-[#232933] rounded-xl p-3 space-y-2 mt-2">
                  @if (comboItems().length === 0) {
                    <p class="text-[#6B7280] text-center py-2">Ningún producto agregado al combo aún.</p>
                  }
                  @for (ci of comboItems(); track ci.productId; let idx = $index) {
                    <div class="flex items-center justify-between bg-[#161A1F] p-2 rounded-lg border border-[#232933]">
                      <span class="text-white truncate pr-2">{{ ci.productName }}</span>
                      <div class="flex items-center gap-2">
                        <input type="number" min="1" [ngModel]="ci.quantity" (ngModelChange)="updateQuantity(idx, $event)" class="w-12 bg-[#111418] border border-[#232933] rounded px-1.5 py-1 text-center text-white font-mono" />
                        <span class="font-mono text-[#FF9F0A]">S/ {{ (ci.unitPrice * ci.quantity).toFixed(2) }}</span>
                        <button (click)="removeItem(idx)" class="text-red-400 hover:text-red-300 px-1 font-bold">✕</button>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Liquidación de Precios -->
              <div class="grid grid-cols-2 gap-3 pt-3 border-t border-[#232933]">
                <div class="bg-[#111418] p-3 rounded-xl border border-[#232933]">
                  <span class="text-[10px] text-[#6B7280] uppercase tracking-wider block mb-1">Precio Regular Real</span>
                  <span class="font-mono text-base font-bold text-white">S/ {{ calculatedOriginalPrice().toFixed(2) }}</span>
                </div>
                <div class="bg-[#111418] p-3 rounded-xl border border-[#232933]">
                  <span class="text-[10px] text-[#FF9F0A] uppercase tracking-wider block mb-1">Precio Oferta (Editable)</span>
                  <input type="number" [(ngModel)]="customPromoPrice" class="w-full bg-[#161A1F] border border-[#FF9F0A] rounded px-2 py-1 text-white font-mono text-sm font-bold focus:outline-none" />
                </div>
              </div>

            </div>

            <div class="p-4 border-t border-[#232933] bg-[#111418] flex gap-3">
              <button (click)="closeModal()" class="flex-1 py-2.5 text-xs font-bold text-white bg-[#232933] hover:bg-[#374151] rounded-lg transition">Cancelar</button>
              <button (click)="saveCombo()" class="flex-1 py-2.5 text-xs font-bold text-black bg-[#FF9F0A] hover:bg-[#FFB340] rounded-lg transition">Guardar Combo</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class PromosComponent {
  ordersService = inject(MockOrdersService);

  isModalOpen = signal(false);
  editingCombo = signal<PromoCombo | null>(null);

  comboName = '';
  comboDescription = '';
  selectedProductId = '';

  // Convertido a señal para reactividad instantánea
  comboItems = signal<PromoComboItem[]>([]);
  customPromoPrice = 0;

  calculatedOriginalPrice = computed(() => {
    return this.comboItems().reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  });

  openComboModal(combo?: PromoCombo): void {
    if (combo) {
      this.editingCombo.set(combo);
      this.comboName = combo.name;
      this.comboDescription = combo.description;
      this.comboItems.set(JSON.parse(JSON.stringify(combo.items)));
      this.customPromoPrice = combo.promoPrice;
    } else {
      this.editingCombo.set(null);
      this.comboName = '';
      this.comboDescription = '';
      this.comboItems.set([]);
      // Sugerencia de 10% de descuento automático para nuevo combo
      this.customPromoPrice = Number((this.calculatedOriginalPrice() * 0.9).toFixed(2));
    }
    this.selectedProductId = this.ordersService.inventory()[0]?.id || '';
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  addItemToCombo(): void {
    const prod = this.ordersService.inventory().find(p => p.id === this.selectedProductId);
    if (!prod) return;

    const current = [...this.comboItems()];
    const existing = current.find(i => i.productId === prod.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      current.push({
        productId: prod.id,
        productName: prod.name,
        quantity: 1,
        unitPrice: prod.price
      });
    }

    this.comboItems.set(current);
    this.recalculatePrices();
  }

  updateQuantity(index: number, newQty: any): void {
    const current = [...this.comboItems()];
    const qty = Number(newQty) || 1;
    current[index].quantity = Math.max(1, qty);
    this.comboItems.set(current);
    this.recalculatePrices();
  }

  removeItem(index: number): void {
    const current = [...this.comboItems()];
    current.splice(index, 1);
    this.comboItems.set(current);
    this.recalculatePrices();
  }

  recalculatePrices(): void {
    if (!this.editingCombo() || this.customPromoPrice <= 0) {
      this.customPromoPrice = Number((this.calculatedOriginalPrice() * 0.9).toFixed(2));
    }
  }

  saveCombo(): void {
    if (!this.comboName || this.comboItems().length === 0) return;

    const newCombo: PromoCombo = {
      id: this.editingCombo() ? this.editingCombo()!.id : 'combo-' + Date.now(),
      name: this.comboName,
      description: this.comboDescription || 'Pack promocional exclusivo',
      items: this.comboItems(),
      originalPrice: this.calculatedOriginalPrice(),
      promoPrice: this.customPromoPrice || this.calculatedOriginalPrice(),
      isActive: true
    };

    if (this.editingCombo()) {
      this.ordersService.updateCombo(newCombo);
    } else {
      this.ordersService.addCombo(newCombo);
    }
    this.closeModal();
  }
}
