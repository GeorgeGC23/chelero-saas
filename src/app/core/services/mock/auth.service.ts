import { Injectable, signal, computed } from '@angular/core';
import { UserWorker, UserRole } from '../../domain/models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Lista inicial de trabajadores del sistema (puedes modificar PINs o agregar más)
  workers = signal<UserWorker[]>([
    { id: 'usr-1', name: 'George Galván (Admin)', pin: '123456', role: 'ADMIN', active: true },
    { id: 'usr-2', name: 'Yoru (Vendedor)', pin: '654321', role: 'VENDEDOR', active: true },
    { id: 'usr-3', name: 'Sebastián (Vendedor)', pin: '112233', role: 'VENDEDOR', active: true }
  ]);

  // Trabajador que ha iniciado sesión actualmente (null si no hay sesión)
  currentUser = signal<UserWorker | null>(null);

  // Propiedades computadas útiles para la UI
  isAuthenticated = computed(() => this.currentUser() !== null);
  isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');

  /**
   * Intenta iniciar sesión validando el PIN de 6 dígitos
   */
  loginWithPin(pin: string): boolean {
    const found = this.workers().find(w => w.pin === pin && w.active);
    if (found) {
      this.currentUser.set(found);
      return true;
    }
    return false;
  }

  /**
   * Cierra la sesión actual
   */
  logout(): void {
    this.currentUser.set(null);
  }

  /**
   * Valida si el usuario actual tiene permisos de Administrador
   */
  hasAdminAccess(): boolean {
    return this.isAdmin();
  }
}
