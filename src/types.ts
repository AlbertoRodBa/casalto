export type Role = 'admin' | 'client'
export interface User { id: string; name: string; email: string; password: string; role: Role }
export type Status = 'pendiente' | 'en_revision' | 'aprobada' | 'rechazada'
export interface Owner {
  names: string; surnames: string; rut: string; phone: string; email: string
  bank: string; accountType: string; account: string
}
export interface Draft {
  plan: 'basico' | 'full'
  type: 'casa' | 'depto'
  region: string; comuna: string; address: string
  rent: number
  rented: boolean; tenant: string; contractEnd: string
  owner: Owner
  docs: Record<string, string> // clave -> nombre del archivo
}
export interface Solicitud extends Draft { id: string; ownerId: string; createdAt: string; status: Status }
