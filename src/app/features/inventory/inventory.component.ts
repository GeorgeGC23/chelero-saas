import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockOrdersService, CatalogProduct } from '../../core/services/mock/mock-orders.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-in fade-in duration-200 pb-24 md:pb-0">
      <div class="flex items-center justify-between mb-5">
        <div>
          <h1 class="text-lg font-bold tracking-tight text-white">Gestión de Inventario</h1>
          <p class="text-xs text-[#9CA3AF] mt-0.5">Control de catálogo, precios y categorías personalizadas</p>
        </div>
        <button (click)="openModal()" class="bg-[#FF9F0A] hover:bg-[#FFB340] text-black text-xs font-bold px-4 py-2.5 rounded-lg transition shadow-[0_0_15px_rgba(255,159,10,0.2)] active:scale-95 flex items-center gap-1.5 shrink-0">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
          <span class="hidden sm:inline">Nuevo Producto</span>
        </button>
      </div>

      <div class="bg-[#161A1F] border border-[#232933] rounded-xl overflow-hidden shadow-sm">
        <table class="w-full text-left border-collapse">
          <thead>
          <tr class="bg-[#111418] border-b border-[#232933] text-[11px] uppercase tracking-wider text-[#9CA3AF]">
            <th class="px-3 md:px-4 py-3 font-semibold">SKU / Producto</th>
            <th class="hidden md:table-cell px-4 py-3 font-semibold">Categoría</th>
            <th class="hidden md:table-cell px-4 py-3 font-semibold">Empaque</th>
            <th class="px-3 md:px-4 py-3 font-semibold text-right">Precio Base</th>
            <th class="px-3 md:px-4 py-3 font-semibold text-right">Stock</th>
          </tr>
          </thead>
          <tbody class="divide-y divide-[#232933] text-sm">
            @if (filteredInventory().length === 0) {
              <tr><td colspan="5" class="px-4 py-8 text-center text-[#6B7280] text-xs">No se encontraron productos.</td></tr>
            }
            @for (prod of filteredInventory(); track prod.id) {
              <tr (click)="handleRowClick(prod)" class="hover:bg-[#1C2129] transition cursor-pointer group" [ngClass]="{'opacity-60': prod.stock === 0}">
                <td class="px-3 md:px-4 py-3.5">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded bg-[#111418] border border-[#232933] flex items-center justify-center shrink-0 text-xs font-bold text-[#FF9F0A]">
                      {{ prod.category.charAt(0).toUpperCase() }}
                    </div>
                    <div class="min-w-0">
                      <p class="font-bold text-white text-xs md:text-sm truncate group-hover:text-[#FF9F0A] transition">{{ prod.name }}</p>
                      <p class="text-[10px] text-[#6B7280] font-mono">{{ prod.id.toUpperCase() }}</p>
                    </div>
                  </div>
                </td>
                <td class="hidden md:table-cell px-4 py-3">
                  <span class="bg-[#232933] text-[#D1D5DB] text-[10px] px-2 py-1 rounded uppercase tracking-widest">{{ prod.category }}</span>
                </td>
                <td class="hidden md:table-cell px-4 py-3 text-xs text-[#9CA3AF]">{{ prod.packaging }}</td>
                <td class="px-3 md:px-4 py-3 text-right font-mono font-bold text-white text-xs md:text-sm">S/ {{ prod.price.toFixed(2) }}</td>
                <td class="px-3 md:px-4 py-3 text-right">
                  <div class="inline-flex items-center gap-1.5 bg-[#111418] px-2.5 py-1 rounded-lg border border-[#232933]">
                    <div class="w-2 h-2 rounded-full shrink-0" [ngClass]="prod.stock > 15 ? 'bg-[#00D2B4]' : (prod.stock > 0 ? 'bg-yellow-500' : 'bg-red-500')"></div>
                    <span class="font-mono font-bold text-xs md:text-sm" [ngClass]="prod.stock === 0 ? 'text-red-500' : 'text-white'">{{ prod.stock }}</span>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- MODAL CREAR / EDITAR PRODUCTO CON CATEGORÍA DINÁMICA -->
      @if (isModalOpen()) {
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-[#161A1F] border border-[#232933] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in duration-200">
            <div class="px-5 py-4 border-b border-[#232933] bg-[#111418] flex items-center justify-between">
              <h3 class="font-bold text-sm text-white">{{ editingProduct() ? 'Editar Producto' : 'Registrar Nuevo Producto' }}</h3>
              <button (click)="closeModal()" class="text-[#6B7280] hover:text-white transition bg-[#232933]/50 p-1.5 rounded-full"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>

            <div class="p-5 space-y-4 text-xs">
              <div class="space-y-1.5">
                <label class="font-bold text-white uppercase tracking-wider block">Nombre del Producto</label>
                <input type="text" [(ngModel)]="formData.name" placeholder="Ej. Tequila Jose Cuervo 750ml" class="w-full bg-[#111418] border border-[#232933] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FF9F0A]" />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1.5">
                  <label class="font-bold text-white uppercase tracking-wider block">Categoría</label>

                  <!-- Selector dinámico: elige existente o escribe una nueva -->
                  @if (!isAddingNewCategory) {
                    <div class="flex gap-1.5">
                      <select [(ngModel)]="formData.category" class="w-full bg-[#111418] border border-[#232933] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FF9F0A]">
                        @for (cat of ordersService.availableCategories(); track cat) {
                          <option [value]="cat">{{ cat }}</option>
                        }
                      </select>
                      <button (click)="isAddingNewCategory = true" class="px-2.5 bg-[#232933] hover:bg-[#374151] text-white rounded-lg font-bold text-sm" title="Agregar nueva categoría">+</button>
                    </div>
                  } @else {
                    <div class="flex gap-1.5">
                      <input type="text" [(ngModel)]="formData.category" placeholder="Nueva categoría..." class="w-full bg-[#111418] border border-[#FF9F0A] rounded-lg px-3 py-2 text-white focus:outline-none" />
                      <button (click)="isAddingNewCategory = false" class="px-2.5 bg-[#232933] text-gray-400 hover:text-white rounded-lg text-xs" title="Volver a lista">↩</button>
                    </div>
                  }
                </div>

                <div class="space-y-1.5">
                  <label class="font-bold text-white uppercase tracking-wider block">Empaque</label>
                  <input type="text" [(ngModel)]="formData.packaging" placeholder="Ej. Botella 750ml" class="w-full bg-[#111418] border border-[#232933] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FF9F0A]" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3 pt-3 border-t border-[#232933] mt-2">
                <div class="space-y-1.5">
                  <label class="font-bold text-[#FF9F0A] uppercase tracking-wider block">Precio (S/)</label>
                  <input type="number" [(ngModel)]="formData.price" class="w-full bg-[#111418] border border-[#232933] rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-[#FF9F0A]" />
                </div>
                <div class="space-y-1.5">
                  <label class="font-bold text-[#00D2B4] uppercase tracking-wider block">Stock Físico</label>
                  <input type="number" [(ngModel)]="formData.stock" class="w-full bg-[#111418] border border-[#232933] rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-[#00D2B4]" />
                </div>
              </div>
            </div>

            <div class="p-4 border-t border-[#232933] bg-[#111418] flex gap-3">
              <button (click)="closeModal()" class="flex-1 py-2.5 text-xs font-bold text-white bg-[#232933] hover:bg-[#374151] rounded-lg transition">Cancelar</button>
              <button (click)="saveProduct()" class="flex-1 py-2.5 text-xs font-bold text-black bg-[#FF9F0A] hover:bg-[#FFB340] rounded-lg transition">Guardar</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class InventoryComponent {
  ordersService = inject(MockOrdersService);

  isModalOpen = signal(false);
  editingProduct = signal<CatalogProduct | null>(null);
  isAddingNewCategory = false;

  formData: Partial<CatalogProduct> = { name: '', category: 'Cerveza', packaging: '', price: 0, stock: 0 };

  filteredInventory = computed(() => {
    const term = this.ordersService.globalSearchTerm().toLowerCase();
    if (!term) return this.ordersService.inventory();
    return this.ordersService.inventory().filter(p =>
      p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term) || p.id.toLowerCase().includes(term)
    );
  });

  handleRowClick(product: CatalogProduct): void {
    this.openModal(product);
  }

  openModal(product?: CatalogProduct): void {
    this.isAddingNewCategory = false;
    if (product) {
      this.editingProduct.set(product);
      this.formData = { ...product };
    } else {
      this.editingProduct.set(null);
      this.formData = { name: '', category: 'Cerveza', packaging: '', price: 0, stock: 0 };
    }
    this.isModalOpen.set(true);
  }

  closeModal(): void { this.isModalOpen.set(false); }

  saveProduct(): void {
    if (!this.formData.name || !this.formData.price) return;
    if (this.editingProduct()) {
      this.ordersService.updateProduct(this.formData as CatalogProduct);
    } else {
      const newProduct: CatalogProduct = {
        id: 'p' + Math.floor(Math.random() * 10000),
        name: this.formData.name!,
        category: this.formData.category || 'General',
        packaging: this.formData.packaging || 'Unidad',
        price: this.formData.price!,
        stock: this.formData.stock || 0
      };
      this.ordersService.addProduct(newProduct);
    }
    this.closeModal();
  }
}
