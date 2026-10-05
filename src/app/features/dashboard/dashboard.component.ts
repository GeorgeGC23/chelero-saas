import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockOrdersService } from '../../core/services/mock/mock-orders.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="animate-in fade-in duration-200 pb-20 md:pb-0 space-y-6">

      <!-- HEADER -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-lg font-bold tracking-tight text-white">Dashboard Gerencial & Negocio</h1>
          <p class="text-xs text-[#9CA3AF] mt-0.5">Análisis de rendimiento, productos estrella, canales y control de mermas/anulaciones</p>
        </div>
      </div>

      <!-- KPI CARDS PRINCIPALES (AMPLIADO CON ANULACIONES) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

        <!-- Ingresos Netos -->
        <div class="bg-[#161A1F] border border-[#232933] rounded-xl p-4 relative overflow-hidden">
          <div class="flex justify-between items-start">
            <div>
              <span class="text-[#9CA3AF] text-[11px] font-bold uppercase tracking-wider block mb-1">Ingresos Netos</span>
              <span class="font-mono text-xl lg:text-2xl font-bold text-white">S/ {{ ordersService.totalSalesToday().toFixed(2) }}</span>
            </div>
            <div class="w-8 h-8 rounded-lg bg-[#FF9F0A]/10 border border-[#FF9F0A]/20 flex items-center justify-center text-[#FF9F0A] shrink-0">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div class="mt-3 text-[11px] font-medium text-[#00D2B4]">
            <span>🟢 Caja real recaudada</span>
          </div>
        </div>

        <!-- Ventas Exitosas -->
        <div class="bg-[#161A1F] border border-[#232933] rounded-xl p-4 relative overflow-hidden">
          <div class="flex justify-between items-start">
            <div>
              <span class="text-[#9CA3AF] text-[11px] font-bold uppercase tracking-wider block mb-1">Ventas Netas</span>
              <span class="font-mono text-xl lg:text-2xl font-bold text-white">{{ ordersService.completedSalesCount() }}</span>
            </div>
            <div class="w-8 h-8 rounded-lg bg-[#00D2B4]/10 border border-[#00D2B4]/20 flex items-center justify-center text-[#00D2B4] shrink-0">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div class="mt-3 text-[11px] font-medium text-[#9CA3AF]">
            <span>Órdenes completadas</span>
          </div>
        </div>

        <!-- Ventas Canceladas (NUEVO) -->
        <div class="bg-[#161A1F] border border-red-500/20 rounded-xl p-4 relative overflow-hidden">
          <div class="flex justify-between items-start">
            <div>
              <span class="text-red-400 text-[11px] font-bold uppercase tracking-wider block mb-1">Anulaciones</span>
              <span class="font-mono text-xl lg:text-2xl font-bold text-red-400">{{ ordersService.cancelledSalesCount() }}</span>
            </div>
            <div class="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
          </div>
          <div class="mt-3 text-[11px] font-medium text-red-400/80">
            <span>Stock devuelto a almacén</span>
          </div>
        </div>

        <!-- Ticket Promedio -->
        <div class="bg-[#161A1F] border border-[#232933] rounded-xl p-4 relative overflow-hidden">
          <div class="flex justify-between items-start">
            <div>
              <span class="text-[#9CA3AF] text-[11px] font-bold uppercase tracking-wider block mb-1">Ticket Promedio</span>
              <span class="font-mono text-xl lg:text-2xl font-bold text-white">
                S/ {{ ordersService.completedSalesCount() > 0 ? (ordersService.totalSalesToday() / ordersService.completedSalesCount()).toFixed(2) : '0.00' }}
              </span>
            </div>
            <div class="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            </div>
          </div>
          <div class="mt-3 text-[11px] font-medium text-[#9CA3AF]">
            <span>Gasto medio neto</span>
          </div>
        </div>

        <!-- Clientes Únicos CRM -->
        <div class="bg-[#161A1F] border border-[#232933] rounded-xl p-4 relative overflow-hidden">
          <div class="flex justify-between items-start">
            <div>
              <span class="text-[#9CA3AF] text-[11px] font-bold uppercase tracking-wider block mb-1">Base Clientes</span>
              <span class="font-mono text-xl lg:text-2xl font-bold text-white">{{ ordersService.crmClients().length }}</span>
            </div>
            <div class="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
          </div>
          <div class="mt-3 text-[11px] font-medium text-[#9CA3AF]">
            <span>Registrados en CRM</span>
          </div>
        </div>

      </div>

      <!-- SECCIÓN INFERIOR -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <!-- PRODUCTOS MÁS VENDIDOS -->
        <div class="lg:col-span-2 bg-[#161A1F] border border-[#232933] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-sm font-bold text-white uppercase tracking-wider">Productos Estrella (Más Vendidos)</h2>
              <span class="text-[11px] text-[#9CA3AF]">Excluye artículos de ventas anuladas</span>
            </div>

            @if (ordersService.topSellingProducts().length === 0) {
              <div class="py-10 text-center text-[#6B7280] text-xs">Aún no hay ventas registradas para generar estadísticas.</div>
            } @else {
              <div class="space-y-3.5">
                @for (prod of ordersService.topSellingProducts(); track prod.name; let i = $index) {
                  <div class="bg-[#111418] border border-[#232933] p-3 rounded-lg flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <span class="w-6 h-6 rounded-full bg-[#232933] text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {{ i + 1 }}
                      </span>
                      <div>
                        <p class="font-bold text-white text-xs">{{ prod.name }}</p>
                        <p class="text-[10px] text-[#6B7280]">Total unidades: <strong class="text-[#FF9F0A]">{{ prod.quantity }} un.</strong></p>
                      </div>
                    </div>
                    <div class="text-right">
                      <span class="font-mono text-xs font-bold text-[#00D2B4]">S/ {{ prod.revenue.toFixed(2) }}</span>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- CANALES DE VENTA & STOCK -->
        <div class="space-y-5">

          <!-- Canales de Venta -->
          <div class="bg-[#161A1F] border border-[#232933] rounded-xl p-5">
            <h2 class="text-sm font-bold text-white uppercase tracking-wider mb-4">Canales de Venta (Netos)</h2>

            <div class="space-y-4 text-xs">
              <div>
                <div class="flex justify-between mb-1">
                  <span class="text-[#9CA3AF]">Mostrador / Tienda Física</span>
                  <span class="font-mono font-bold text-white">S/ {{ ordersService.salesByChannel().mostradorRevenue.toFixed(2) }}</span>
                </div>
                <div class="w-full h-2 bg-[#111418] rounded-full overflow-hidden border border-[#232933]">
                  <div class="h-full bg-[#00D2B4]" [style.width.%]="getChannelPercentage().mostrador"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between mb-1">
                  <span class="text-[#9CA3AF]">Delivery (WhatsApp / Teléfono)</span>
                  <span class="font-mono font-bold text-white">S/ {{ ordersService.salesByChannel().deliveryRevenue.toFixed(2) }}</span>
                </div>
                <div class="w-full h-2 bg-[#111418] rounded-full overflow-hidden border border-[#232933]">
                  <div class="h-full bg-[#FF9F0A]" [style.width.%]="getChannelPercentage().delivery"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Alertas de Stock Bajo -->
          <div class="bg-[#161A1F] border border-[#232933] rounded-xl p-5">
            <h2 class="text-sm font-bold text-white uppercase tracking-wider mb-3">Alertas de Reposición</h2>

            <div class="space-y-2 max-h-44 overflow-y-auto">
              @let lowStockItems = getLowStockProducts();
              @if (lowStockItems.length === 0) {
                <p class="text-xs text-[#00D2B4] italic py-2">✓ Todo el inventario tiene niveles óptimos de stock.</p>
              } @else {
                @for (p of lowStockItems; track p.id) {
                  <div class="flex items-center justify-between bg-[#111418] border border-red-500/20 p-2.5 rounded-lg text-xs">
                    <span class="text-white truncate pr-2">{{ p.name }}</span>
                    <span class="font-mono font-bold text-red-400 shrink-0">{{ p.stock === 0 ? 'Agotado' : p.stock + ' un.' }}</span>
                  </div>
                }
              }
            </div>
          </div>

        </div>

      </div>
    </div>
  `
})
export class DashboardComponent {
  ordersService = inject(MockOrdersService);

  getChannelPercentage() {
    const data = this.ordersService.salesByChannel();
    const total = data.mostradorRevenue + data.deliveryRevenue;
    if (total === 0) return { mostrador: 50, delivery: 50 };
    return {
      mostrador: Math.round((data.mostradorRevenue / total) * 100),
      delivery: Math.round((data.deliveryRevenue / total) * 100)
    };
  }

  getLowStockProducts() {
    return this.ordersService.inventory().filter(p => p.stock <= 10);
  }
}
