import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { Field, Shell, Stepper } from '../components/ui'
import { ACCOUNT_TYPES, BANKS, DOCS, PLANS, REGIONS, fmtDate, formatCLP, formatPhone, formatRut, netIncome, validPhone, validRut } from '../lib/chile'
import type { Draft } from '../types'

const STEPS = ['Propiedad', 'Propietario', 'Documentos', 'Resumen']
const EMPTY: Draft = {
  plan: 'full', type: 'depto', region: '', comuna: '', address: '', rent: 0, rented: false, tenant: '', contractEnd: '',
  owner: { names: '', surnames: '', rut: '', phone: '', email: '', bank: '', accountType: 'Cuenta corriente', account: '' },
  docs: {},
}
type Errors = Record<string, string>

function validate(step: number, d: Draft): Errors {
  const e: Errors = {}
  const o = d.owner
  if (step === 0) {
    if (!d.region) e.region = 'Selecciona tu región'
    if (!d.comuna) e.comuna = 'Selecciona tu comuna'
    if (d.address.trim().length < 5) e.address = 'Ingresa la calle y el número'
    if (d.rent < 50000) e.rent = 'Ingresa un monto desde $50.000'
    if (d.rented) {
      if (!d.tenant.trim()) e.tenant = 'Ingresa el nombre del arrendatario'
      if (!d.contractEnd || d.contractEnd <= new Date().toISOString().slice(0, 10)) e.contractEnd = 'Ingresa una fecha futura'
    }
  }
  if (step === 1) {
    if (!o.names.trim()) e.names = 'Ingresa tus nombres'
    if (!o.surnames.trim()) e.surnames = 'Ingresa tus apellidos'
    if (!validRut(o.rut)) e.rut = 'El RUT no es válido'
    if (!validPhone(o.phone)) e.phone = 'Ingresa un celular chileno, ej. +56 9 8765 4321'
    if (!/^\S+@\S+\.\S+$/.test(o.email)) e.email = 'Ingresa un correo válido'
    if (!o.bank) e.bank = 'Selecciona tu banco'
    if (!/^\d{6,20}$/.test(o.account)) e.account = 'Solo números, entre 6 y 20 dígitos'
  }
  if (step === 2) {
    DOCS.forEach(x => { if ((!x.onlyIfRented || d.rented) && !d.docs[x.key]) e[x.key] = 'Adjunta este documento' })
  }
  return e
}

export default function SolicitudPage() {
  const { user } = useAuth()
  const nav = useNavigate()
  const [step, setStep] = useState(0)
  const [d, setD] = useState<Draft>(() => api.loadDraft() ?? { ...EMPTY, owner: { ...EMPTY.owner, email: user?.email ?? '' } })
  const [tried, setTried] = useState(false)
  const [accepted, setAccepted] = useState(false)
  useEffect(() => api.saveDraft(d), [d])

  const err = tried ? validate(step, d) : {}
  const set = (p: Partial<Draft>) => setD(x => ({ ...x, ...p }))
  const setO = (p: Partial<Draft['owner']>) => setD(x => ({ ...x, owner: { ...x.owner, ...p } }))
  const go = (n: number) => { setStep(n); setTried(false); window.scrollTo(0, 0) }
  const next = () => (Object.keys(validate(step, d)).length ? setTried(true) : go(step + 1))
  const send = () => {
    if (!accepted || !user) return setTried(true)
    api.createSolicitud(d, user.id); api.clearDraft()
    nav('/', { state: { sent: true } })
  }
  const bad = (k: string) => (err[k] ? true : undefined)
  const plan = PLANS[d.plan]
  const o = d.owner

  return (
    <Shell back>
      <main className="mx-auto max-w-3xl px-5 py-8">
        <p className="mb-4 text-sm font-medium">Paso {step + 1} de 4 · {STEPS[step]}</p>
        <Stepper steps={STEPS} current={step} />
        <h1 className="mb-6 mt-8 text-3xl font-semibold tracking-tight">
          {['Tu propiedad y tu plan', 'Datos del propietario', 'Documentos', 'Revisa y envía'][step]}
        </h1>

        {step === 0 && (
          <div className="space-y-5">
            <section className="card">
              <h2 className="mb-4 text-lg font-semibold">Planes</h2>
              <div role="radiogroup" aria-label="Plan" className="grid gap-3 sm:grid-cols-2">
                {(Object.keys(PLANS) as (keyof typeof PLANS)[]).map(k => (
                  <label key={k} className={`cursor-pointer rounded-xl border-2 p-4 ${d.plan === k ? 'border-brand bg-tint' : 'border-slate-200'}`}>
                    <input type="radio" name="plan" className="accent-[#2b5b8a]" checked={d.plan === k} onChange={() => set({ plan: k })} />
                    <span className="ml-2 font-semibold">{PLANS[k].name}</span>
                    <p className="my-2 text-3xl font-semibold">{PLANS[k].pct}%</p>
                    <ul className="space-y-1 text-xs text-slate-700">{PLANS[k].perks.map(p => <li key={p}>✓ {p}</li>)}</ul>
                  </label>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-500">% sobre el arriendo mensual. Valores ilustrativos.</p>
            </section>

            <section className="card space-y-4">
              <h2 className="text-lg font-semibold">Datos básicos</h2>
              <div>
                <span className="label">Tipo de propiedad*</span>
                <div role="radiogroup" aria-label="Tipo de propiedad" className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
                  {(['casa', 'depto'] as const).map(t => (
                    <button key={t} type="button" role="radio" aria-checked={d.type === t} onClick={() => set({ type: t })}
                      className={`rounded-md py-2.5 text-sm ${d.type === t ? 'border border-brand bg-white font-semibold text-brand' : 'text-slate-600'}`}>
                      {t === 'casa' ? 'Casa' : 'Depto.'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Región*" error={err.region}>
                  <select className="input" aria-invalid={bad('region')} value={d.region} onChange={e => set({ region: e.target.value, comuna: '' })}>
                    <option value="">Selecciona tu región</option>
                    {Object.keys(REGIONS).map(r => <option key={r}>{r}</option>)}
                  </select>
                </Field>
                <Field label="Comuna*" error={err.comuna}>
                  <select className="input" aria-invalid={bad('comuna')} disabled={!d.region} value={d.comuna} onChange={e => set({ comuna: e.target.value })}>
                    <option value="">Selecciona tu comuna</option>
                    {(REGIONS[d.region] ?? []).map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Dirección de la propiedad*" error={err.address}>
                <input className="input" aria-invalid={bad('address')} autoComplete="street-address" placeholder="Av. Irarrázaval 2450, depto. 504" value={d.address} onChange={e => set({ address: e.target.value })} />
              </Field>
              <Field label="Arriendo mensual esperado (CLP)*" error={err.rent}>
                <input className="input" inputMode="numeric" aria-invalid={bad('rent')} placeholder="$450.000" value={d.rent ? formatCLP(d.rent) : ''} onChange={e => set({ rent: Number(e.target.value.replace(/\D/g, '').slice(0, 9)) })} />
              </Field>
              {d.rent > 0 && <p className="rounded-lg bg-tint px-3 py-2.5 text-sm text-brand">Con el plan elegido recibirías unos {formatCLP(netIncome(d.rent, plan.pct))} al mes.</p>}
            </section>

            <section className="card space-y-4">
              <label className="flex items-center gap-3 font-medium">
                <input type="checkbox" className="h-5 w-5 accent-[#2b5b8a]" checked={d.rented} onChange={e => set({ rented: e.target.checked })} />
                La propiedad ya está arrendada
              </label>
              {d.rented && (
                <div className="grid gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2">
                  <Field label="Nombre del arrendatario actual*" error={err.tenant}>
                    <input className="input" aria-invalid={bad('tenant')} value={d.tenant} onChange={e => set({ tenant: e.target.value })} />
                  </Field>
                  <Field label="Término del contrato actual*" error={err.contractEnd}>
                    <input className="input" type="date" aria-invalid={bad('contractEnd')} value={d.contractEnd} onChange={e => set({ contractEnd: e.target.value })} />
                  </Field>
                </div>
              )}
            </section>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <section className="card space-y-4">
              <h2 className="text-lg font-semibold">Información personal</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nombres*" error={err.names}><input className="input" aria-invalid={bad('names')} autoComplete="given-name" value={o.names} onChange={e => setO({ names: e.target.value })} /></Field>
                <Field label="Apellidos*" error={err.surnames}><input className="input" aria-invalid={bad('surnames')} autoComplete="family-name" value={o.surnames} onChange={e => setO({ surnames: e.target.value })} /></Field>
              </div>
              <Field label="RUT*" error={err.rut}>
                <input className="input" aria-invalid={bad('rut')} placeholder="12.345.678-5" value={o.rut} onChange={e => setO({ rut: formatRut(e.target.value) })} />
              </Field>
              {validRut(o.rut) && <p className="-mt-2 text-xs text-green-700">✓ RUT verificado</p>}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Teléfono*" error={err.phone}><input className="input" type="tel" aria-invalid={bad('phone')} placeholder="+56 9 8765 4321" value={o.phone} onChange={e => setO({ phone: e.target.value })} onBlur={() => setO({ phone: formatPhone(o.phone) })} /></Field>
                <Field label="Correo electrónico*" error={err.email}><input className="input" type="email" aria-invalid={bad('email')} value={o.email} onChange={e => setO({ email: e.target.value })} /></Field>
              </div>
            </section>
            <section className="card space-y-4">
              <h2 className="text-lg font-semibold">Cuenta para recibir tus pagos</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Banco*" error={err.bank}>
                  <select className="input" aria-invalid={bad('bank')} value={o.bank} onChange={e => setO({ bank: e.target.value })}>
                    <option value="">Selecciona tu banco</option>{BANKS.map(b => <option key={b}>{b}</option>)}
                  </select>
                </Field>
                <Field label="Tipo de cuenta*">
                  <select className="input" value={o.accountType} onChange={e => setO({ accountType: e.target.value })}>{ACCOUNT_TYPES.map(t => <option key={t}>{t}</option>)}</select>
                </Field>
              </div>
              <Field label="Número de cuenta*" error={err.account} hint="La cuenta debe estar a nombre del propietario.">
                <input className="input" inputMode="numeric" aria-invalid={bad('account')} value={o.account} onChange={e => setO({ account: e.target.value.replace(/\D/g, '') })} />
              </Field>
              <p className="text-xs text-slate-500">🛡 Solo la usaremos para transferir tus ingresos por arriendo.</p>
            </section>
          </div>
        )}

        {step === 2 && (
          <section className="card space-y-5">
            <p className="text-sm text-slate-600">Adjunta los documentos para preparar tu contrato. Formatos: PDF, JPG o PNG.</p>
            {DOCS.filter(x => !x.onlyIfRented || d.rented).map(x => (
              <div key={x.key}>
                <span className="label">{x.label}*</span>
                <p className="mb-2 text-xs text-slate-500">{x.hint}</p>
                {d.docs[x.key] ? (
                  <div className="flex items-center justify-between rounded-lg bg-tint px-3.5 py-3 text-sm">
                    <span>📄 {d.docs[x.key]}</span>
                    <button type="button" className="font-medium text-brand hover:underline" onClick={() => { const { [x.key]: _, ...rest } = d.docs; set({ docs: rest }) }}>Quitar</button>
                  </div>
                ) : (
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" aria-label={x.label} aria-invalid={bad(x.key)}
                    className="block w-full cursor-pointer rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-tint file:px-3 file:py-1.5 file:font-medium file:text-brand"
                    onChange={e => { const f = e.target.files?.[0]; if (f) set({ docs: { ...d.docs, [x.key]: f.name } }) }} />
                )}
                {err[x.key] && <p role="alert" className="mt-1 text-xs text-red-600">{err[x.key]}</p>}
              </div>
            ))}
          </section>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <Block title="Propiedad" onEdit={() => go(0)} rows={[
              ['Tipo', d.type === 'casa' ? 'Casa' : 'Departamento'], ['Dirección', `${d.address}, ${d.comuna}, ${d.region}`],
              ['Arriendo mensual', formatCLP(d.rent)], ['Plan', `${plan.name} (${plan.pct}%)`],
              ['Recibirías', `${formatCLP(netIncome(d.rent, plan.pct))} al mes`],
              ['Arrendada', d.rented ? `Sí · ${d.tenant} · hasta ${fmtDate(d.contractEnd)}` : 'No']]} />
            <Block title="Propietario" onEdit={() => go(1)} rows={[
              ['Nombre', `${o.names} ${o.surnames}`], ['RUT', o.rut], ['Teléfono', o.phone], ['Correo', o.email],
              ['Cuenta', `${o.bank} · ${o.accountType} · ${o.account}`]]} />
            <Block title="Documentos" onEdit={() => go(2)} rows={DOCS.filter(x => !x.onlyIfRented || d.rented).map(x => [x.label, d.docs[x.key] ?? '—'])} />
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" className="mt-0.5 h-5 w-5 accent-[#2b5b8a]" checked={accepted} onChange={e => setAccepted(e.target.checked)} />
              <span>Declaro que los datos son correctos y autorizo a Casalto a tratarlos para gestionar el arriendo de mi propiedad.</span>
            </label>
            {tried && !accepted && <p role="alert" className="text-xs text-red-600">Debes aceptar para enviar la solicitud.</p>}
          </div>
        )}

        <p className="mt-6 text-xs text-slate-500">* Campos obligatorios</p>
        <div className="mt-6 flex justify-between">
          {step > 0 ? <button className="btn-outline" onClick={() => go(step - 1)}>Atrás</button> : <span />}
          {step < 3 ? <button className="btn min-w-56" onClick={next}>Continuar</button> : <button className="btn min-w-56" onClick={send}>Enviar solicitud</button>}
        </div>
        <p className="mt-10 text-center text-xs text-slate-500">🔒 Tus datos están seguros y protegidos.</p>
      </main>
    </Shell>
  )
}

function Block({ title, rows, onEdit }: { title: string; rows: string[][]; onEdit: () => void }) {
  return (
    <section className="card">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button type="button" onClick={onEdit} className="text-sm font-medium text-brand hover:underline">Editar</button>
      </div>
      <dl className="space-y-2 text-sm">
        {rows.map(([k, v]) => <div key={k} className="grid gap-1 sm:grid-cols-[170px_1fr]"><dt className="text-slate-500">{k}</dt><dd>{v}</dd></div>)}
      </dl>
    </section>
  )
}
