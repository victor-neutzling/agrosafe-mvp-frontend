import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'

// Layout base da área autenticada: sidebar + header + conteúdo.
// Mudança aqui costuma afetar praticamente todas as telas internas.
export function AppLayout() {
  // Essa "casca" mantém navegação consistente enquanto as páginas trocam no Outlet.
  return <div className="flex h-screen"><Sidebar/><div className="flex flex-1 flex-col overflow-hidden"><Header/><main className="flex-1 overflow-auto bg-slate-50 p-6"><Outlet/></main></div></div>
}
