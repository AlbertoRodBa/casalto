// Subconjunto de comunas principales por región (suficiente para un MVP).
export const REGIONS: Record<string, string[]> = {
  'Arica y Parinacota': ['Arica', 'Putre'],
  'Tarapacá': ['Iquique', 'Alto Hospicio'],
  'Antofagasta': ['Antofagasta', 'Calama', 'Mejillones', 'Tocopilla'],
  'Atacama': ['Copiapó', 'Caldera', 'Vallenar'],
  'Coquimbo': ['La Serena', 'Coquimbo', 'Ovalle'],
  'Valparaíso': ['Valparaíso', 'Viña del Mar', 'Concón', 'Quilpué', 'Villa Alemana'],
  'Metropolitana de Santiago': ['Santiago', 'Providencia', 'Las Condes', 'Ñuñoa', 'La Florida', 'Maipú', 'Puente Alto', 'San Miguel', 'Vitacura', 'Macul'],
  "O'Higgins": ['Rancagua', 'Machalí', 'San Fernando'],
  'Maule': ['Talca', 'Curicó', 'Linares'],
  'Ñuble': ['Chillán', 'San Carlos'],
  'Biobío': ['Concepción', 'Talcahuano', 'San Pedro de la Paz', 'Los Ángeles'],
  'La Araucanía': ['Temuco', 'Padre Las Casas', 'Villarrica', 'Pucón'],
  'Los Ríos': ['Valdivia', 'La Unión'],
  'Los Lagos': ['Puerto Montt', 'Osorno', 'Puerto Varas', 'Castro'],
  'Aysén': ['Coyhaique', 'Puerto Aysén'],
  'Magallanes': ['Punta Arenas', 'Puerto Natales'],
}

export const BANKS = ['Banco de Chile', 'BancoEstado', 'Banco Santander', 'BCI', 'Scotiabank', 'Banco Itaú', 'Banco Falabella', 'Banco Security', 'Banco Ripley', 'Banco Consorcio']
export const ACCOUNT_TYPES = ['Cuenta corriente', 'Cuenta vista', 'Cuenta de ahorro', 'Cuenta RUT']

export const PLANS = {
  basico: { name: 'Básico', pct: 6, perks: ['Cobro mensual', 'Transferencia a tu cuenta', 'Reporte mensual'] },
  full: { name: 'Full', pct: 9, perks: ['Todo lo del Básico', 'Gestión de mantenciones', 'Reajustes y renovaciones'] },
} as const

export const DOCS = [
  { key: 'cedula', label: 'Cédula de identidad (ambos lados)', hint: 'Foto o PDF legible', onlyIfRented: false },
  { key: 'dominio', label: 'Certificado de dominio vigente', hint: 'Lo pides en el Conservador de Bienes Raíces', onlyIfRented: false },
  { key: 'contrato', label: 'Contrato de arriendo vigente', hint: 'Solo si la propiedad ya está arrendada', onlyIfRented: true },
]

export const netIncome = (rent: number, pct: number) => Math.round(rent * (1 - pct / 100))
export const formatCLP = (n: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)
export const fmtDate = (s: string) => s.slice(0, 10).split('-').reverse().join('/')

const cleanRut = (v: string) => v.replace(/[^0-9kK]/g, '').toUpperCase()
export function formatRut(v: string) {
  const c = cleanRut(v).slice(0, 9)
  if (c.length < 2) return c
  return c.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + c.slice(-1)
}
export function validRut(v: string) {
  const c = cleanRut(v)
  if (c.length < 8) return false
  const body = c.slice(0, -1)
  let sum = 0, mul = 2
  for (let i = body.length - 1; i >= 0; i--) { sum += Number(body[i]) * mul; mul = mul === 7 ? 2 : mul + 1 }
  const r = 11 - (sum % 11)
  return (r === 11 ? '0' : r === 10 ? 'K' : String(r)) === c.slice(-1)
}

const phoneDigits = (v: string) => v.replace(/\D/g, '').replace(/^56/, '')
export const validPhone = (v: string) => /^9\d{8}$/.test(phoneDigits(v))
export function formatPhone(v: string) {
  const d = phoneDigits(v)
  return /^9\d{8}$/.test(d) ? `+56 9 ${d.slice(1, 5)} ${d.slice(5)}` : v
}
