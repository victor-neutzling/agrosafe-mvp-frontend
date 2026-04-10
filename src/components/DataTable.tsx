import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'

// Tabela reaproveitável para histórico, violações e telas de cadastro.
// A intenção é evitar duplicação de tabela com comportamentos parecidos.
type Column<T> = {
  key: keyof T | string
  label: string
  sortable?: boolean
  render?: (row: T) => ReactNode
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  actions,
  searchableKeys,
  loading,
  emptyMessage = 'Nenhum registro encontrado.'
}: {
  columns: Column<T>[]
  data: T[]
  actions?: (row: T) => ReactNode
  searchableKeys?: (keyof T)[]
  loading?: boolean
  emptyMessage?: string
}) {
  // Props principais: columns define visualização, data traz os registros e actions adiciona botões por linha.
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState<string>()
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [term, setTerm] = useState('')

  const pageSize = 8

  const filtered = useMemo(() => {
    const q = term.trim().toLowerCase()
    const base = q
      ? data.filter((row) => (searchableKeys || []).some((key) => String(row[key] || '').toLowerCase().includes(q)))
      : data

    if (!sortKey) return base
    return [...base].sort((a, b) => {
      const av = String(a[sortKey] ?? '')
      const bv = String(b[sortKey] ?? '')
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    })
  }, [data, searchableKeys, sortDir, sortKey, term])

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="card space-y-3 overflow-auto">
      {searchableKeys && (
        <input value={term} onChange={(event) => { setTerm(event.target.value); setPage(1) }} className="input max-w-sm" placeholder="Buscar..." />
      )}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-slate-500">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`px-3 py-2 ${column.sortable ? 'cursor-pointer hover:text-slate-900' : ''}`}
                onClick={() => {
                  if (!column.sortable) return
                  if (sortKey === column.key) {
                    setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
                  } else {
                    setSortKey(String(column.key))
                    setSortDir('asc')
                  }
                }}
              >
                {column.label} {sortKey === column.key && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
            ))}
            {actions && <th className="px-3 py-2 text-right">Ações</th>}
          </tr>
        </thead>
        <tbody>
          {loading && <tr><td className="px-3 py-6 text-slate-500" colSpan={columns.length + 1}>Carregando dados...</td></tr>}
          {!loading && rows.length === 0 && <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={columns.length + 1}>{emptyMessage}</td></tr>}
          {rows.map((row, index) => (
            <tr key={index} className="border-b last:border-none hover:bg-slate-50">
              {columns.map((column) => (
                <td key={String(column.key)} className="px-3 py-2">{column.render ? column.render(row) : row[column.key]}</td>
              ))}
              {actions && <td className="px-3 py-2 text-right">{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-end gap-2 text-xs">
        <button className="btn-secondary" disabled={page <= 1} onClick={() => setPage((prev) => prev - 1)}>Anterior</button>
        <span>Página {page}/{pages}</span>
        <button className="btn-secondary" disabled={page >= pages} onClick={() => setPage((prev) => prev + 1)}>Próxima</button>
      </div>
    </div>
  )
}
