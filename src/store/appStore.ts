import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Role, User } from '@/types/models'

// Store global só com sessão/autorização.
// Essas infos ficam globais porque várias rotas/componentes dependem delas ao mesmo tempo.
type AppState = {
  user?: User
  token?: string
  setAuth: (token: string, user: User) => void
  logout: () => void
  canAccess: (roles?: Role[]) => boolean
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: undefined,
      token: undefined,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: undefined, user: undefined }),
      canAccess: (roles) => {
        // Nem tudo precisa ir para store: aqui mantemos só o essencial de auth para não virar estado bagunçado.
        if (!roles || roles.length === 0) return Boolean(get().token)
        const role = get().user?.role
        return Boolean(role && roles.includes(role))
      }
    }),
    { name: 'frango-auth-session' }
  )
)
