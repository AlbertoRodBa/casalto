import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { useTheme } from './theme'
import type { Status } from '../types'

export const Logo = () => (
  <div className="flex items-center gap-2.5">
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-brand" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" /><path d="M9.5 21v-6h5v6" />
    </svg>
    <div>
      <div className="text-xl font-bold leading-none tracking-[0.15em] text-brand">CASALTO</div>
      <div className="mt-1 text-[11px] leading-none text-slate-500">Administración de arriendo</div>
    </div>
  </div>
)

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      onClick={toggleTheme}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      {isDark ? (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-brand">
          <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" />
        </svg>
      ) : (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-brand">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
        </svg>
      )}
    </button>
  )
}

export function Shell({ children, back }: { children: ReactNode; back?: boolean }) {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
          <Link to="/" aria-label="Ir al inicio"><Logo /></Link>
          <div className="flex items-center gap-4 text-sm">
            <ThemeToggle />
            {back ? (
              <Link to="/" className="text-brand hover:underline">← Volver</Link>
            ) : (
              <>
                <span className="hidden text-slate-600 sm:inline">{user?.name}</span>
                <button onClick={logout} className="font-medium text-brand hover:underline">Salir</button>
              </>
            )}
          </div>
        </div>
      </header>
      {children}
    </div>
  )
}

export function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {error ? <span role="alert" className="mt-1 block text-xs text-red-600">{error}</span>
        : hint ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}
    </label>
  )
}

export const STATUS: Record<Status, { label: string; cls: string }> = {
  pendiente: { label: 'Pendiente', cls: 'bg-amber-100 text-amber-800' },
  en_revision: { label: 'En revisión', cls: 'bg-tint text-brand' },
  aprobada: { label: 'Aprobada', cls: 'bg-green-100 text-green-800' },
  rechazada: { label: 'Rechazada', cls: 'bg-red-100 text-red-700' },
}
export const Badge = ({ status }: { status: Status }) => (
  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS[status].cls}`}>{STATUS[status].label}</span>
)

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-start" aria-label="Progreso">
      {steps.map((s, i) => (
        <li key={s} className="flex flex-1 flex-col items-center gap-2" aria-current={i === current ? 'step' : undefined}>
          <div className="flex w-full items-center">
            <div className={`h-px flex-1 ${i <= current ? 'bg-brand' : 'bg-slate-300'}`} />
            <div className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${i <= current ? 'border-brand bg-brand text-white' : 'border-slate-300 bg-white text-slate-500'}`}>
              {i < current ? '✓' : i + 1}
            </div>
            <div className={`h-px flex-1 ${i < current ? 'bg-brand' : 'bg-slate-300'}`} />
          </div>
          <span className={`text-xs sm:text-sm ${i === current ? 'font-semibold text-brand' : 'text-slate-500'}`}>{s}</span>
        </li>
      ))}
    </ol>
  )
}
