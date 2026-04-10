import { LogOut, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'

export function Header() {
  const navigate = useNavigate()
  const user = useAppStore((state) => state.user)
  const logout = useAppStore((state) => state.logout)

  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-3">
      <div className="relative w-72">
        <Search className="absolute left-2 top-2.5" size={16} />
        <input className="input pl-8" placeholder="Buscar visitante, CPF, granja..." />
      </div>
      <div className="flex items-center gap-4 text-sm">
        <div>
          <p className="font-semibold">{user?.name ?? 'Usuário'}</p>
          <p className="text-slate-500">{user?.role ?? 'Operador'}</p>
        </div>
        <button
          className="btn-secondary"
          onClick={() => {
            logout()
            navigate('/login')
          }}
        >
          <LogOut size={14} className="mr-1" />
          Sair
        </button>
      </div>
    </header>
  )
}
