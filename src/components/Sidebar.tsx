import { NavLink } from 'react-router-dom'
import { Camera, ClipboardList, Factory, LayoutDashboard, Settings, ShieldAlert, UserCog, UserPlus, Users, Warehouse } from 'lucide-react'
import type { Role } from '@/types/models'
import { useAppStore } from '@/store/appStore'

// Sidebar organiza a navegação lateral.
// A ordem dos itens tenta refletir prioridade operacional do time.
const links: Array<{ label: string; to: string; icon: any; roles?: Role[] }> = [
  // A portaria fica em primeiro para reforçar o fluxo operacional principal logo após login.
  { label: 'Portaria', to: '/portaria', icon: Camera, roles: ['ADMIN', 'OPERADOR'] },
  // Dashboard vem como visão de apoio; não substitui o fluxo operacional da portaria.
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Visitantes', to: '/visitantes', icon: UserPlus },
  { label: 'Veículos', to: '/veiculos', icon: ClipboardList },
  { label: 'Histórico', to: '/historico', icon: ClipboardList },
  { label: 'Violações', to: '/violacoes', icon: ShieldAlert },
  { label: 'LGPD', to: '/lgpd', icon: ClipboardList },
  { label: 'Empresas', to: '/empresas', icon: Factory, roles: ['ADMIN', 'GESTOR'] },
  { label: 'Responsáveis', to: '/responsaveis', icon: Users, roles: ['ADMIN', 'GESTOR'] },
  { label: 'Granjas', to: '/granjas', icon: Warehouse, roles: ['ADMIN', 'GESTOR'] },
  { label: 'Usuários', to: '/usuarios', icon: UserCog, roles: ['ADMIN'] },
  { label: 'Configurações', to: '/configuracoes', icon: Settings, roles: ['ADMIN'] }
]

export function Sidebar() {
  const userRole = useAppStore((state) => state.user?.role)

  return (
    <aside className="w-64 border-r bg-slate-950 text-slate-100">
      <div className="p-4 text-lg font-bold">Frango Access</div>
      <nav className="space-y-1 px-2">
        {links
          .filter((link) => !link.roles || (userRole && link.roles.includes(userRole)))
          .map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-blue-600' : 'hover:bg-slate-800'}`
              }
            >
              <link.icon size={16} />
              {link.label}
            </NavLink>
          ))}
      </nav>
    </aside>
  )
}
