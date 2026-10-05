import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/mock/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-[#0A0C0E] z-50 flex items-center justify-center p-4 select-none">
      <div class="bg-[#111418] border border-[#232933] rounded-3xl w-full max-w-sm p-6 md:p-8 shadow-2xl flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">

        <!-- LOGO Y TÍTULO -->
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1C2129] to-[#12151B] border border-[#FF9F0A]/30 flex items-center justify-center text-[#FF9F0A] shadow-[0_0_20px_rgba(255,159,10,0.2)] mb-3">
          <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 16v-4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v4" />
            <path d="M10 16h4v5a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-5z" />
            <path d="M12 10V3a1 1 0 0 1 1-1h0a1 1 0 0 1 1 1v7" />
            <path d="M10 18h4" />
          </svg>
        </div>

        <h2 class="text-xl font-extrabold tracking-wider text-white">CHELER<span class="text-[#FF9F0A]">O</span></h2>
        <p class="text-xs text-[#9CA3AF] mt-1 mb-6">Ingrese su PIN de seguridad de 6 dígitos</p>

        <!-- PUNTOS INDICADORES DE PIN (6 dígitos) -->
        <div class="flex gap-3 mb-6">
          @for (dot of [1, 2, 3, 4, 5, 6]; track dot) {
            <div class="w-4 h-4 rounded-full border transition-all duration-150"
                 [ngClass]="pin().length >= dot ? 'bg-[#FF9F0A] border-[#FF9F0A] shadow-[0_0_10px_rgba(255,159,10,0.5)]' : 'bg-[#161A1F] border-[#232933]'">
            </div>
          }
        </div>

        @if (errorMessage()) {
          <p class="text-red-400 text-xs font-semibold mb-4 animate-shake">{{ errorMessage() }}</p>
        }

        <!-- TECLADO NUMÉRICO TÁCTIL -->
        <div class="grid grid-cols-3 gap-3 w-full max-w-[260px] mb-6">
          @for (num of ['1', '2', '3', '4', '5', '6', '7', '8', '9']; track num) {
            <button (click)="pressNumber(num)" class="h-14 rounded-2xl bg-[#161A1F] hover:bg-[#232933] active:bg-[#FF9F0A] active:text-black text-white font-mono font-bold text-lg border border-[#232933] transition">
              {{ num }}
            </button>
          }
          <button (click)="clearPin()" class="h-14 rounded-2xl bg-[#161A1F] hover:bg-red-500/10 active:scale-95 text-red-400 font-bold text-xs border border-[#232933] transition">
            Limpiar
          </button>
          <button (click)="pressNumber('0')" class="h-14 rounded-2xl bg-[#161A1F] hover:bg-[#232933] active:bg-[#FF9F0A] active:text-black text-white font-mono font-bold text-lg border border-[#232933] transition">
            0
          </button>
          <button (click)="deleteNumber()" class="h-14 rounded-2xl bg-[#161A1F] hover:bg-[#232933] active:scale-95 text-white flex items-center justify-center border border-[#232933] transition">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414-6.414a2 2 0 011.414-.586H19a2 2 0 012 2v10a2 2 0 01-2 2h-8.172a2 2 0 01-1.414-.586L3 12z" /></svg>
          </button>
        </div>

        <!-- PISTA DE PRUEBA RÁPIDA (Opcional para desarrollo) -->
        <div class="text-[10px] text-[#6B7280] text-center space-y-0.5 border-t border-[#232933] pt-3 w-full">
          <p>PIN Admin: <span class="text-[#FF9F0A] font-mono">123456</span></p>
          <p>PIN Vendedor: <span class="text-[#FF9F0A] font-mono">654321</span> o <span class="text-[#FF9F0A] font-mono">112233</span></p>
        </div>

      </div>
    </div>
  `
})
export class LoginComponent {
  authService = inject(AuthService);
  pin = signal('');
  errorMessage = signal('');

  pressNumber(num: string): void {
    if (this.pin().length < 6) {
      this.pin.update(p => p + num);
      this.errorMessage.set('');

      // Al completar los 6 dígitos, valida automáticamente
      if (this.pin().length === 6) {
        setTimeout(() => this.submitPin(), 150);
      }
    }
  }

  deleteNumber(): void {
    this.pin.update(p => p.slice(0, -1));
    this.errorMessage.set('');
  }

  clearPin(): void {
    this.pin.set('');
    this.errorMessage.set('');
  }

  submitPin(): void {
    const success = this.authService.loginWithPin(this.pin());
    if (!success) {
      this.errorMessage.set('PIN incorrecto o usuario inactivo');
      this.pin.set('');
    }
  }
}
