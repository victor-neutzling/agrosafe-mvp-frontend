import { Navigate } from 'react-router-dom'
import type { Role } from '@/types/models'
import { useAppStore } from '@/store/appStore'

// Barreira entre área pública e autenticada.
// Esse componente evita acesso indevido às rotas internas.
export function ProtectedRoute({ children, roles }: { children: JSX.Element; roles?: Role[] }) {
  const token = useAppStore((state) => state.token)
  const canAccess = useAppStore((state) => state.canAccess)

  // Se a autenticação evoluir (refresh token, permissões dinâmicas etc.), esse é o ponto para revisar junto.
  if (!token) return <Navigate to="/login" replace />
  if (!canAccess(roles)) return <Navigate to="/dashboard" replace />
  return children
}
