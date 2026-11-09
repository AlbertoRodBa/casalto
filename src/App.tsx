import type { ReactElement } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth'
import type { Role } from './types'
import AuthPage from './pages/AuthPage'
import Home from './pages/Home'
import SolicitudPage from './pages/SolicitudPage'

function Guard({ role, children }: { role?: Role; children: ReactElement }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/registro" element={<AuthPage mode="register" />} />
      <Route path="/" element={<Guard><Home /></Guard>} />
      <Route path="/solicitud/nueva" element={<Guard role="client"><SolicitudPage /></Guard>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
