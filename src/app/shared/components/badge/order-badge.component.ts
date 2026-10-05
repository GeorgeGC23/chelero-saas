import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderStatus } from '../../../core/domain/models/order.model';

@Component({
  selector: 'app-order-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase border tabular-nums"
      [ngClass]="badgeStyles[status]"
    >
      <span class="w-1.5 h-1.5 rounded-full" [ngClass]="dotStyles[status]"></span>
      {{ status.replace('_', ' ') }}
    </span>
  `
})
export class OrderBadgeComponent {
  @Input({ required: true }) status!: OrderStatus;

  badgeStyles: Record<OrderStatus, string> = {
    NUEVO: 'bg-blue-500/15 text-[#60A5FA] border-[#2563EB]/40',
    CONFIRMADO: 'bg-indigo-500/15 text-[#818CF8] border-[#4F46E5]/40',
    EN_PREPARACION: 'bg-amber-500/15 text-[#FBBF24] border-[#D97706]/40',
    LISTO_DESPACHO: 'bg-emerald-500/15 text-[#34D399] border-[#059669]/40',
    EN_CAMINO: 'bg-sky-500/15 text-[#38BDF8] border-[#0284C7]/40',
    ENTREGADO: 'bg-green-500/12 text-[#4ADE80] border-[#16A34A]/40',
    CANCELADO: 'bg-gray-500/20 text-[#9CA3AF] border-[#4B5563]/40',
    INCIDENCIA: 'bg-red-500/20 text-[#F87171] border-[#DC2626]/40 animate-pulse'
  };

  dotStyles: Record<OrderStatus, string> = {
    NUEVO: 'bg-[#60A5FA]',
    CONFIRMADO: 'bg-[#818CF8]',
    EN_PREPARACION: 'bg-[#FBBF24]',
    LISTO_DESPACHO: 'bg-[#34D399]',
    EN_CAMINO: 'bg-[#38BDF8]',
    ENTREGADO: 'bg-[#4ADE80]',
    CANCELADO: 'bg-[#9CA3AF]',
    INCIDENCIA: 'bg-[#F87171]'
  };
}
