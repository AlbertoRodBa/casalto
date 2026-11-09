// Capa de datos simulada con localStorage. Para conectar un backend real,
// reemplaza el cuerpo de estas funciones por llamadas fetch (idealmente async).
import type { Draft, Solicitud, Status, User } from './types'

const K = { users: 'casalto_users', reqs: 'casalto_solicitudes', session: 'casalto_session', draft: 'casalto_draft' }

function read<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback } catch { return fallback }
}
const write = (key: string, value: unknown) => localStorage.setItem(key, JSON.stringify(value))
const uid = () => Math.random().toString(36).slice(2, 10)

const SEED_USERS: User[] = [
  { id: 'u-admin', name: 'Administración Casalto', email: 'admin@casalto.cl', password: 'admin123', role: 'admin' },
  { id: 'u-cliente', name: 'Camila Soto', email: 'cliente@casalto.cl', password: 'cliente123', role: 'client' },
]
const SEED_REQS: Solicitud[] = [{
  id: 'demo1', ownerId: 'u-cliente', createdAt: new Date().toISOString(), status: 'en_revision', plan: 'full', type: 'depto',
  region: 'Metropolitana de Santiago', comuna: 'Ñuñoa', address: 'Av. Irarrázaval 2450, depto. 504', rent: 450000,
  rented: true, tenant: 'Diego Pérez Rojas', contractEnd: '2027-06-30',
  owner: { names: 'Camila Andrea', surnames: 'Soto Muñoz', rut: '12.345.678-5', phone: '+56 9 8765 4321', email: 'cliente@casalto.cl', bank: 'Banco de Chile', accountType: 'Cuenta corriente', account: '00123456789' },
  docs: { cedula: 'cedula.pdf', dominio: 'dominio.pdf', contrato: 'contrato.pdf' },
}]

const users = () => { const u = read<User[] | null>(K.users, null); if (u) return u; write(K.users, SEED_USERS); return SEED_USERS }
const reqs = () => { const r = read<Solicitud[] | null>(K.reqs, null); if (r) return r; write(K.reqs, SEED_REQS); return SEED_REQS }

export const api = {
  getSession(): User | null { const id = read<string | null>(K.session, null); return users().find(u => u.id === id) ?? null },
  login(email: string, password: string): User | null {
    const u = users().find(x => x.email === email.trim().toLowerCase() && x.password === password)
    if (u) write(K.session, u.id)
    return u ?? null
  },
  register(name: string, email: string, password: string): User | null {
    const list = users(); const e = email.trim().toLowerCase()
    if (list.some(u => u.email === e)) return null
    const u: User = { id: uid(), name: name.trim(), email: e, password, role: 'client' }
    write(K.users, [...list, u]); write(K.session, u.id)
    return u
  },
  logout() { localStorage.removeItem(K.session) },
  listSolicitudes: () => reqs().slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  createSolicitud(d: Draft, ownerId: string): Solicitud {
    const solicitud: Solicitud = { ...d, id: uid(), ownerId, createdAt: new Date().toISOString(), status: 'pendiente' }
    write(K.reqs, [...reqs(), solicitud])
    return solicitud
  },
  setStatus(id: string, status: Status) { write(K.reqs, reqs().map(r => (r.id === id ? { ...r, status } : r))) },
  loadDraft: () => read<Draft | null>(K.draft, null),
  saveDraft: (d: Draft) => write(K.draft, d),
  clearDraft: () => localStorage.removeItem(K.draft),
}
