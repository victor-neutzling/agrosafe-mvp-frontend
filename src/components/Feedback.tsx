import type { ReactNode } from 'react'
export const FilterBar = ({ children }: { children: ReactNode }) => <div className="card grid gap-2 md:grid-cols-4">{children}</div>
export const FormSection = ({ title, children }: { title: string; children: ReactNode }) => <section className="card"><h3 className="mb-3 font-semibold">{title}</h3>{children}</section>
export const EmptyState = ({ message }: { message: string }) => <div className="card text-center text-sm text-slate-500">{message}</div>
export const LoadingState = ({ message = 'Carregando...' }: { message?: string }) => <div className="card text-sm">{message}</div>
export const ToastFeedback = ({ message }: { message: string }) => <div className="rounded-lg bg-blue-600 px-4 py-2 text-white">{message}</div>
export const ConfirmDialog = ({ open, title, onConfirm }: { open: boolean; title: string; onConfirm: () => void }) => open ? <div className="card"><p>{title}</p><button className="btn-primary mt-2" onClick={onConfirm}>Confirmar</button></div> : null
export const AppModal = ({ open, children }: { open: boolean; children: ReactNode }) => open ? <div className="fixed inset-0 grid place-items-center bg-black/40"><div className="card max-w-lg">{children}</div></div> : null
