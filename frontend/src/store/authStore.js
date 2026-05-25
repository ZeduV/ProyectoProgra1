import { create } from 'zustand';

const API_BASE = 'http://127.0.0.1:8000';

const useAuthStore = create((set, get) => ({
  user: null,
  loading: false,
  error: null,

  // Load user from localStorage on app start
  loadUser: () => {
    try {
      const stored = localStorage.getItem('edugo_user');
      if (stored) {
        const user = JSON.parse(stored);
        set({ user });
      }
    } catch {
      localStorage.removeItem('edugo_user');
    }
  },

  // Login: call the backend and store user data
  login: async (email, password) => {
    set({ loading: true, error: null });

    try {
      const res = await fetch(`${API_BASE}/api/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.detail || 'Error al iniciar sesión';
        set({ loading: false, error: errorMsg });
        return { success: false, message: errorMsg };
      }

      // Store user in state and localStorage
      const user = data.usuario;
      localStorage.setItem('edugo_user', JSON.stringify(user));
      set({ user, loading: false, error: null });
      return { success: true };
    } catch (err) {
      const errorMsg = 'No se pudo conectar con el servidor.';
      set({ loading: false, error: errorMsg });
      return { success: false, message: errorMsg };
    }
  },

  // Logout: clear state and localStorage
  logout: () => {
    localStorage.removeItem('edugo_user');
    set({ user: null, error: null });
  },

  // Helper getters
  isLoggedIn: () => get().user !== null,
  isAdmin: () => get().user?.rol === 'Admin',
  getUserId: () => get().user?.usuarioId || null,
  getUserName: () => {
    const user = get().user;
    return user ? `${user.nombre} ${user.apellido}` : '';
  },
}));

export default useAuthStore;
