import { create } from 'zustand';

const TOKEN_KEY = 'kross_token';

const useAuthStore = create((set) => ({
  token: localStorage.getItem(TOKEN_KEY) || null,
  user:  null,

  setAuth: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ token: null, user: null });
  },
}));

export default useAuthStore;
