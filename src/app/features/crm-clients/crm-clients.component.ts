import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockOrdersService } from '../../core/services/mock/mock-orders.service';
import { OrderBadgeComponent } from '../../shared/components/badge/order-badge.component';

@Component({
  selector: 'app-crm-clients',
  standalone: true,
  imports: [CommonModule, OrderBadgeComponent, FormsModule],
  template: `
    <div class="animate-in fade-in duration-200 pb-24 md:pb-0">
      <div class="flex items-center justify-between mb-5">
        <div>
          <h1 class="text-lg font-bold tracking-tight text-white">Directorio de Clientes CRM</h1>
          <p class="text-xs text-[#9CA3AF] mt-0.5">Historial de compras, fidelización y contacto</p>
        </div>
        <button (click)="exportToCSV()" class="bg-[#232933] hover:bg-[#374151] text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition border border-[#374151] flex items-center gap-2 active:scale-95 shrink-0">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <span class="hidden sm:inline">Exportar CSV</span>
        </button>
      </div>

      <!-- TABLA CRM ADAPTATIVA -->
      <div class="bg-[#161A1F] border border-[#232933] rounded-xl overflow-hidden shadow-sm">
        <table class="w-full text-left border-collapse">
          <thead>
          <tr class="bg-[#111418] border-b border-[#232933] text-[11px] uppercase tracking-wider text-[#9CA3AF]">
            <th class="px-3 md:px-4 py-3 font-semibold">Cliente</th>
            <th class="px-3 md:px-4 py-3 font-semibold">Tier</th>
            <th class="hidden md:table-cell px-4 py-3 font-semibold text-center">Pedidos</th>
            <th class="px-3 md:px-4 py-3 font-semibold text-right">LTV (Total)</th>
          </tr>
          </thead>
          <tbody class="divide-y divide-[#232933] text-sm">
            @if (filteredClients().length === 0) {
              <tr><td colspan="4" class="px-4 py-8 text-center text-[#6B7280] text-xs">No se encontraron clientes.</td></tr>
            }
            @for (client of filteredClients(); track client.fullName) {
              <tr (click)="viewClientDetails(client)" class="hover:bg-[#1C2129] transition cursor-pointer group">
                <td class="px-3 md:px-4 py-3.5">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full text-black font-bold flex items-center justify-center shrink-0 text-xs shadow-sm"
                         [ngClass]="{'bg-yellow-400': client.tier === 'VIP', 'bg-blue-400': client.tier === 'Frecuente', 'bg-green-400': client.tier === 'Nuevo'}">
                      {{ client.fullName.charAt(0).toUpperCase() }}
                    </div>
                    <div class="min-w-0">
                      <p class="font-bold text-white text-xs md:text-sm truncate group-hover:text-[#FF9F0A] transition">{{ client.fullName }}</p>
                      <p class="text-[10px] text-[#6B7280] font-mono">{{ client.phoneNumber || 'Sin teléfono' }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-3 md:px-4 py-3">
                  <span class="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border inline-block"
                        [ngClass]="{'bg-yellow-500/10 text-yellow-500 border-yellow-500/20': client.tier === 'VIP', 'bg-blue-500/10 text-blue-400 border-blue-500/20': client.tier === 'Frecuente', 'bg-green-500/10 text-green-400 border-green-500/20': client.tier === 'Nuevo'}">
                    {{ client.tier }}
                  </span>
                </td>
                <td class="hidden md:table-cell px-4 py-3 text-center">
                  <span class="bg-[#262D38] border border-[#374151] px-2.5 py-0.5 rounded text-xs font-mono font-bold text-white">{{ client.orderCount }}</span>
                </td>
                <td class="px-3 md:px-4 py-3 text-right font-mono font-bold text-xs md:text-sm" [ngClass]="client.totalSpent > 100 ? 'text-[#00D2B4]' : 'text-white'">
                  S/ {{ client.totalSpent.toFixed(2) }}
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL DE PERFIL COMPLETO DEL CLIENTE -->
    @if (selectedClient()) {
      <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-[#161A1F] border border-[#232933] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in duration-200">

          <div class="px-5 py-4 border-b border-[#232933] bg-[#111418] flex items-center justify-between">
            <h3 class="font-bold text-sm text-white">Perfil de Cliente</h3>
            <button (click)="closeClientDetails()" class="text-[#6B7280] hover:text-white transition bg-[#232933]/50 p-1.5 rounded-full"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>

          <div class="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">

            @if (!isEditingMode()) {
              <!-- VISTA DE LECTURA -->
              <div class="flex items-center gap-3 bg-[#111418] p-3.5 rounded-xl border border-[#232933]">
                <div class="w-12 h-12 rounded-full text-black font-bold flex items-center justify-center text-lg shrink-0"
                     [ngClass]="{'bg-yellow-400': selectedClient().tier === 'VIP', 'bg-blue-400': selectedClient().tier === 'Frecuente', 'bg-green-400': selectedClient().tier === 'Nuevo'}">
                  {{ selectedClient().fullName.charAt(0).toUpperCase() }}
                </div>
                <div class="min-w-0 flex-1">
                  <h2 class="font-bold text-white text-sm truncate">{{ selectedClient().fullName }}</h2>
                  <p class="text-[#9CA3AF] font-mono text-[11px] mt-0.5">Tel: {{ selectedClient().phoneNumber || 'No registrado' }}</p>
                  <p class="text-[#9CA3AF] text-[11px] truncate">Dir: {{ selectedClient().address || 'Sin dirección guardada' }}</p>
                </div>
                <button (click)="enableEditMode()" class="bg-[#232933] hover:bg-[#374151] p-2 rounded-lg text-white transition shrink-0" title="Editar Cliente">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
              </div>

              @if (selectedClient().phoneNumber) {
                <a [href]="'https://wa.me/51' + selectedClient().phoneNumber" target="_blank" class="w-full py-2.5 bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 rounded-xl font-bold transition flex items-center justify-center gap-2">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.383 0 .001 5.385.001 12.035c0 2.12.553 4.19 1.603 6.012L.001 24l6.114-1.604a11.968 11.968 0 005.916 1.564h.005c6.647 0 12.031-5.386 12.031-12.035C24.067 5.385 18.68 0 12.031 0zm0 21.967h-.005c-1.785 0-3.535-.48-5.069-1.39l-.364-.215-3.766.987.997-3.667-.236-.376a10.021 10.021 0 01-1.534-5.272c0-5.545 4.512-10.059 10.057-10.059 5.546 0 10.06 4.514 10.06 10.059 0 5.544-4.514 10.059-10.06 10.059zm5.522-7.545c-.303-.151-1.794-.886-2.072-.988-.278-.101-.481-.151-.683.151-.202.303-.784.988-.96 1.19-.177.202-.354.227-.657.076-.303-.151-1.28-.471-2.438-1.503-.902-.802-1.51-1.792-1.687-2.095-.177-.303-.019-.467.133-.618.136-.135.303-.354.454-.531.151-.177.202-.303.303-.505.101-.202.05-.379-.025-.531-.076-.151-.683-1.644-.936-2.25-.246-.593-.496-.513-.683-.522-.177-.01-.379-.01-.581-.01-.202 0-.531.076-.809.379-.278.303-1.062 1.037-1.062 2.529s1.087 2.933 1.239 3.135c.151.202 2.138 3.262 5.18 4.573 1.944.836 2.671.933 3.633.784.664-.103 2.138-.874 2.438-1.718.303-.844.303-1.566.212-1.718-.09-.151-.343-.227-.646-.379z"/></svg>
                  <span>Escribir por WhatsApp</span>
                </a>
              }

              <div>
                <h4 class="font-bold text-white uppercase tracking-wider mb-2">Historial de Compras ({{ clientHistory().length }})</h4>
                <div class="bg-[#111418] border border-[#232933] rounded-xl overflow-hidden space-y-1 p-2 max-h-48 overflow-y-auto">
                  @for (order of clientHistory(); track order.id) {
                    <div class="flex justify-between items-center p-2 rounded-lg bg-[#161A1F] border border-[#232933]/50">
                      <div>
                        <span class="font-mono text-[#FF9F0A] font-bold">{{ order.shortCode }}</span>
                        <p class="text-[10px] text-[#9CA3AF] mt-0.5">{{ order.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
                      </div>
                      <div class="text-right">
                        <span class="font-mono text-white font-bold block">S/ {{ order.total.toFixed(2) }}</span>
                        <app-order-badge [status]="order.orderStatus"></app-order-badge>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- VISTA DE EDICIÓN -->
            } @else {
              <div class="space-y-3">
                <div>
                  <label class="font-bold text-[#9CA3AF] uppercase tracking-wider block mb-1">Nombre Completo</label>
                  <input type="text" [(ngModel)]="editData.fullName" class="w-full bg-[#111418] border border-[#232933] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FF9F0A]" />
                </div>
                <div>
                  <label class="font-bold text-[#9CA3AF] uppercase tracking-wider block mb-1">Número de Teléfono</label>
                  <input type="text" [(ngModel)]="editData.phoneNumber" placeholder="Ej. 987654321" class="w-full bg-[#111418] border border-[#232933] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#FF9F0A]" />
                </div>
                <div>
                  <label class="font-bold text-[#9CA3AF] uppercase tracking-wider block mb-1">Dirección Predeterminada</label>
                  <input type="text" [(ngModel)]="editData.address" placeholder="Av. Los Pinos 123" class="w-full bg-[#111418] border border-[#232933] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FF9F0A]" />
                </div>
              </div>
            }

          </div>

          <div class="p-4 border-t border-[#232933] bg-[#111418] flex gap-2">
            @if (!isEditingMode()) {
              <button (click)="closeClientDetails()" class="w-full py-2.5 text-xs font-bold text-black bg-white hover:bg-gray-200 rounded-lg transition">Cerrar</button>
            } @else {
              <button (click)="cancelEdit()" class="flex-1 py-2.5 text-xs font-semibold text-white bg-[#232933] hover:bg-[#374151] rounded-lg transition">Cancelar</button>
              <button (click)="saveClientChanges()" class="flex-1 py-2.5 text-xs font-bold text-black bg-[#FF9F0A] hover:bg-[#FFB340] rounded-lg transition">Guardar Cambios</button>
            }
          </div>

        </div>
      </div>
    }
  `
})
export class CrmClientsComponent {
  ordersService = inject(MockOrdersService);

  selectedClient = signal<any>(null);

  // Variables para edición
  isEditingMode = signal(false);
  editData = { fullName: '', phoneNumber: '', address: '' };
  originalClientName = '';

  filteredClients = computed(() => {
    const term = this.ordersService.globalSearchTerm().toLowerCase();
    if (!term) return this.ordersService.crmClients();
    return this.ordersService.crmClients().filter(c =>
      c.fullName.toLowerCase().includes(term) || (c.phoneNumber && c.phoneNumber.includes(term))
    );
  });

  clientHistory = computed(() => {
    if (!this.selectedClient()) return [];
    return this.ordersService.orders().filter(o => o.client.fullName === this.selectedClient().fullName);
  });

  viewClientDetails(client: any): void {
    this.selectedClient.set(client);
    this.isEditingMode.set(false);
  }

  closeClientDetails(): void {
    this.selectedClient.set(null);
    this.isEditingMode.set(false);
  }

  enableEditMode(): void {
    const client = this.selectedClient();
    this.originalClientName = client.fullName;
    this.editData = {
      fullName: client.fullName,
      phoneNumber: client.phoneNumber || '',
      address: client.address || ''
    };
    this.isEditingMode.set(true);
  }

  cancelEdit(): void {
    this.isEditingMode.set(false);
  }

  saveClientChanges(): void {
    if (!this.editData.fullName.trim()) return;

    // Llamamos al servicio para que haga el cambio oficial
    this.ordersService.updateClientInfo(
      this.originalClientName,
      this.editData.fullName,
      this.editData.phoneNumber,
      this.editData.address
    );

    // Actualizamos la vista modal local seleccionada
    const updatedClient = { ...this.selectedClient(), ...this.editData };
    this.selectedClient.set(updatedClient);

    this.isEditingMode.set(false);
  }

  exportToCSV(): void {
    const clients = this.ordersService.crmClients();
    const csvRows = ['Nombre,Teléfono,Dirección,Pedidos,Total Gastado,Última Compra,Segmento'];
    clients.forEach(c => {
      csvRows.push(`${c.fullName},${c.phoneNumber || 'Sin registro'},"${c.address || ''}",${c.orderCount},S/ ${c.totalSpent.toFixed(2)},${new Date(c.lastPurchase).toLocaleDateString()},${c.tier}`);
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CRM_Clientes_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
