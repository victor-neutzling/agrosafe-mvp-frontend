import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/layouts/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { PortariaPage } from '@/pages/PortariaPage'
import { ConfiguracoesPage, EmpresasPage, GranjasPage, HistoricoPage, LgpdPage, OccurrenceDetailPage, ResponsaveisPage, UsuariosPage, VeiculosPage, ViolacoesPage, VisitantesPage, VisitorDetailPage } from '@/pages/CrudPages'
import { ProtectedRoute } from '@/components/ProtectedRoute'

// Aqui fica a navegação principal separando área pública (login) da área autenticada.
const protect = (element: JSX.Element, roles?: Array<'ADMIN' | 'OPERADOR' | 'GESTOR'>) => <ProtectedRoute roles={roles}>{element}</ProtectedRoute>

export const appRouter = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: protect(<AppLayout />),
    children: [
      { index: true, element: <Navigate to="/portaria" replace /> },
      // Rotas internas passam por autenticação; portaria abre primeiro por ser o foco operacional.
      { path: 'portaria', element: protect(<PortariaPage />, ['ADMIN', 'OPERADOR']) },
      { path: 'dashboard', element: protect(<DashboardPage />) },
      { path: 'visitantes', element: protect(<VisitantesPage />) },
      { path: 'empresas', element: protect(<EmpresasPage />, ['ADMIN', 'GESTOR']) },
      { path: 'responsaveis', element: protect(<ResponsaveisPage />, ['ADMIN', 'GESTOR']) },
      { path: 'granjas', element: protect(<GranjasPage />, ['ADMIN', 'GESTOR']) },
      { path: 'veiculos', element: protect(<VeiculosPage />) },
      { path: 'historico', element: protect(<HistoricoPage />) },
      { path: 'violacoes', element: protect(<ViolacoesPage />) },
      { path: 'usuarios', element: protect(<UsuariosPage />, ['ADMIN']) },
      { path: 'lgpd', element: protect(<LgpdPage />) },
      { path: 'configuracoes', element: protect(<ConfiguracoesPage />, ['ADMIN']) },
      { path: 'visitantes/:id', element: protect(<VisitorDetailPage />) },
      { path: 'ocorrencias/:id', element: protect(<OccurrenceDetailPage />) }
    ]
  }
])
