import { create } from 'zustand'

interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

interface AuthState {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),

  setAuth: (user, token) => {
    localStorage.setItem('token', token)
    set({ user, token })
  },

  clearAuth: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },
}))