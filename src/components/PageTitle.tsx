export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return <div><h1 className="text-2xl font-bold">{title}</h1>{subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}</div>
}
