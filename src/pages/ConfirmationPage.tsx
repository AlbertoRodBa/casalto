import { Link, Navigate, useLocation } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { Shell } from '../components/ui'
import { fmtDate, formatCLP, PLANS } from '../lib/chile'

export default function ConfirmationPage() {
  const { user } = useAuth()
  const location = useLocation()
  const state = location.state as { solicitudId?: string } | null
  const solicitud = state?.solicitudId
    ? api.listSolicitudes().find(item => item.id === state.solicitudId && item.ownerId === user?.id)
    : undefined

  if (!solicitud) return <Navigate to="/" replace />

  return (
    <Shell>
      <main className="mx-auto max-w-2xl px-5 py-10 sm:py-16">
        <section className="card text-center" aria-labelledby="confirmation-title">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-tint text-brand" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
              <path d="m5 12 4 4L19 6" />
            </svg>
          </div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand">Solicitud registrada</p>
          <h1 id="confirmation-title" className="text-3xl font-semibold tracking-tight">¡Gracias! Ya completaste la solicitud</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">
            En un proceso real, el equipo de Casalto revisaría los antecedentes y se pondría en contacto contigo.
          </p>

          <dl className="mt-8 divide-y divide-slate-200 rounded-xl border border-slate-200 text-left">
            <div className="flex flex-wrap justify-between gap-2 px-4 py-3">
              <dt className="text-sm text-slate-500">Propiedad</dt>
              <dd className="text-right text-sm font-medium">{solicitud.type === 'casa' ? 'Casa' : 'Departamento'} · {solicitud.comuna}</dd>
            </div>
            <div className="flex flex-wrap justify-between gap-2 px-4 py-3">
              <dt className="text-sm text-slate-500">Arriendo mensual</dt>
              <dd className="text-right text-sm font-medium">{formatCLP(solicitud.rent)}</dd>
            </div>
            <div className="flex flex-wrap justify-between gap-2 px-4 py-3">
              <dt className="text-sm text-slate-500">Plan</dt>
              <dd className="text-right text-sm font-medium">{PLANS[solicitud.plan].name}</dd>
            </div>
            <div className="flex flex-wrap justify-between gap-2 px-4 py-3">
              <dt className="text-sm text-slate-500">Fecha</dt>
              <dd className="text-right text-sm font-medium">{fmtDate(solicitud.createdAt)}</dd>
            </div>
          </dl>

          <p role="note" className="mt-6 rounded-lg bg-tint p-4 text-left text-sm leading-6 text-slate-700">
            <span className="font-semibold text-brand">Esto es una demo:</span> la solicitud no se envió a Casalto. Los datos se guardaron solo en este navegador y los documentos no se cargaron.
          </p>

          <Link to="/" className="btn mt-6 w-full sm:w-auto">Volver a mis solicitudes</Link>
        </section>
      </main>
    </Shell>
  )
}
