import type { LucideIcon } from 'lucide-react'
import clsx from 'clsx'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  isActive?: boolean
  onClick?: () => void
}

export function StatCard({ label, value, icon: Icon, isActive = false, onClick }: StatCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'card w-full text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md',
        isActive
          ? 'border-blue-500 bg-blue-50/60 shadow-md ring-2 ring-blue-200'
          : 'hover:border-blue-300'
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <Icon size={18} className={isActive ? 'text-blue-700' : 'text-blue-600'} />
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </button>
  )
}
