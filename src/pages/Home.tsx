import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { Badge, Shell, STATUS } from '../components/ui'
import { PLANS, fmtDate, formatCLP } from '../lib/chile'
import type { Solicitud, Status } from '../types'

export default function Home() {
  const { user } = useAuth()
  return <Shell>{user?.role === 'admin' ? <AdminHome /> : <ClientHome />}</Shell>
}

const title = (s: Solicitud) => `${s.type === 'casa' ? 'Casa' : 'Depto.'} · ${s.address}`

function ClientHome() {
  const { user } = useAuth()
  const items = api.listSolicitudes().filter(s => s.ownerId === user?.id)
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Mis solicitudes</h1>
        <Link to="/solicitud/nueva" className="btn">Solicitar administración</Link>
      </div>
      {items.length === 0 ? (
        <div className="card text-center">
          <p className="font-medium">Aún no tienes solicitudes</p>
          <p className="mt-1 text-sm text-slate-500">Cuéntanos sobre tu propiedad y nosotros nos encargamos del arriendo.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map(s => (
            <li key={s.id} className="card flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">{title(s)}</p>
                <p className="text-sm text-slate-500">{s.comuna} · {formatCLP(s.rent)} al mes · Plan {PLANS[s.plan].name} · Enviada el {fmtDate(s.createdAt)}</p>
              </div>
              <Badge status={s.status} />
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

function AdminHome() {
  const [items, setItems] = useState(api.listSolicitudes())
  const [filter, setFilter] = useState<Status | 'todas'>('todas')
  const change = (id: string, st: Status) => { api.setStatus(id, st); setItems(api.listSolicitudes()) }
  const shown = items.filter(s => filter === 'todas' || s.status === filter)
  const chips: (Status | 'todas')[] = ['todas', 'pendiente', 'en_revision', 'aprobada', 'rechazada']
  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">Solicitudes de administración</h1>
      <div className="mb-5 flex flex-wrap gap-2">
        {chips.map(c => {
          const n = c === 'todas' ? items.length : items.filter(s => s.status === c).length
          return (
            <button key={c} onClick={() => setFilter(c)} aria-pressed={filter === c}
              className={`rounded-full border px-3.5 py-1.5 text-sm ${filter === c ? 'border-brand bg-brand text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}>
              {c === 'todas' ? 'Todas' : STATUS[c].label} ({n})
            </button>
          )
        })}
      </div>
      {shown.length === 0 && <p className="card text-center text-sm text-slate-500">No hay solicitudes en este estado.</p>}
      <ul className="space-y-3">
        {shown.map(s => (
          <li key={s.id} className="card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">{title(s)}</p>
                <p className="text-sm text-slate-500">{s.comuna}, {s.region} · {formatCLP(s.rent)} · Plan {PLANS[s.plan].name} ({PLANS[s.plan].pct}%) · {fmtDate(s.createdAt)}</p>
              </div>
              <select aria-label="Cambiar estado" className="input w-auto" value={s.status} onChange={e => change(s.id, e.target.value as Status)}>
                {(Object.keys(STATUS) as Status[]).map(k => <option key={k} value={k}>{STATUS[k].label}</option>)}
              </select>
            </div>
            <details className="mt-3 text-sm">
              <summary className="cursor-pointer font-medium text-brand">Ver detalle</summary>
              <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                <Row k="Propietario" v={`${s.owner.names} ${s.owner.surnames}`} />
                <Row k="RUT" v={s.owner.rut} />
                <Row k="Teléfono" v={s.owner.phone} />
                <Row k="Correo" v={s.owner.email} />
                <Row k="Cuenta" v={`${s.owner.bank} · ${s.owner.accountType} · ${s.owner.account}`} />
                <Row k="Arrendatario actual" v={s.rented ? `${s.tenant} (hasta ${fmtDate(s.contractEnd)})` : 'Sin arrendar'} />
                <Row k="Documentos" v={Object.values(s.docs).join(', ') || '—'} />
              </dl>
            </details>
          </li>
        ))}
      </ul>
    </main>
  )
}

const Row = ({ k, v }: { k: string; v: string }) => (
  <div><dt className="text-xs text-slate-500">{k}</dt><dd>{v}</dd></div>
)
