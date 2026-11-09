import { createContext, useContext, useState, type ReactNode } from 'react'
import { api } from './api'
import type { User } from './types'

interface Auth {
  user: User | null
  login: (email: string, password: string) => string | null
  register: (name: string, email: string, password: string) => string | null
  logout: () => void
}
const Ctx = createContext<Auth>(null!)
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => api.getSession())
  const value: Auth = {
    user,
    login: (email, password) => {
      const u = api.login(email, password)
      if (!u) return 'Correo o contraseña incorrectos.'
      setUser(u); return null
    },
    register: (name, email, password) => {
      const u = api.register(name, email, password)
      if (!u) return 'Ya existe una cuenta con ese correo.'
      setUser(u); return null
    },
    logout: () => { api.logout(); setUser(null) },
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
