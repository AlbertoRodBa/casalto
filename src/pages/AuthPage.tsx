import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { Field, Logo, ThemeToggle } from '../components/ui'

export default function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const { user, login, register } = useAuth()
  const nav = useNavigate()
  const [f, setF] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const isLogin = mode === 'login'
  if (user) return <Navigate to="/" replace />

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!isLogin && f.password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.')
    const err = isLogin ? login(f.email, f.password) : register(f.name, f.email, f.password)
    if (err) setError(err)
    else nav('/')
  }
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => { setError(''); setF({ ...f, [k]: e.target.value }) }

  return (
    <div className="grid min-h-screen bg-white md:grid-cols-2">
      <div className="flex flex-col p-8">
        <div className="relative flex justify-center">
          <Logo />
          <div className="absolute right-0 top-0"><ThemeToggle /></div>
        </div>
        <div className="mx-auto flex w-full max-w-[342px] flex-1 flex-col justify-center py-10">
          <h1 className="mb-8 text-3xl font-semibold tracking-tight">{isLogin ? 'Bienvenido/a de vuelta' : 'Crea tu cuenta'}</h1>
          <form onSubmit={submit} className="space-y-3" noValidate>
            {!isLogin && <Field label="Nombre"><input className="input" required autoComplete="name" value={f.name} onChange={set('name')} placeholder="Tu nombre completo" /></Field>}
            <Field label="Correo electrónico"><input className="input" type="email" required autoComplete="email" value={f.email} onChange={set('email')} placeholder="correo@ejemplo.com" /></Field>
            <Field label="Contraseña"><input className="input" type="password" required autoComplete={isLogin ? 'current-password' : 'new-password'} value={f.password} onChange={set('password')} placeholder="Contraseña" /></Field>
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <button className="btn mt-3 w-full" type="submit">{isLogin ? 'Iniciar sesión' : 'Crear cuenta'}</button>
          </form>
          <p className="mt-6 text-center text-sm">
            {isLogin ? '¿No tienes una cuenta? ' : '¿Ya tienes una cuenta? '}
            <Link to={isLogin ? '/registro' : '/login'} className="font-semibold hover:underline">{isLogin ? 'Regístrate' : 'Inicia sesión'}</Link>
          </p>
          {isLogin && (
            <div className="mt-8 rounded-lg bg-tint p-4 text-xs text-slate-700">
              <p className="mb-2 font-semibold text-brand">Cuentas de prueba</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="rounded-md bg-white px-3 py-1.5 font-medium text-brand hover:bg-slate-50" onClick={() => setF({ ...f, email: 'cliente@casalto.cl', password: 'cliente123' })}>Propietario</button>
                <button type="button" className="rounded-md bg-white px-3 py-1.5 font-medium text-brand hover:bg-slate-50" onClick={() => setF({ ...f, email: 'admin@casalto.cl', password: 'admin123' })}>Administrador</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="hidden bg-brand/20 bg-cover bg-center md:block" style={{ backgroundImage: 'url(/login-image-1.jpg)' }} aria-hidden="true" />
    </div>
  )
}
