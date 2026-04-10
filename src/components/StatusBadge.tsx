import clsx from 'clsx'

export function StatusBadge({ status }: { status: string }) {
  const color = status.includes('LIBERADO') ? 'bg-green-100 text-green-700' : status.includes('ALERTA') || status.includes('BLOQ') ? 'bg-red-100 text-red-700' : status.includes('NAO') ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
  return <span className={clsx('rounded-full px-2 py-1 text-xs font-semibold', color)}>{status}</span>
}
