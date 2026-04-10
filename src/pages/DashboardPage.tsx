import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, CheckCircle2, ShieldAlert, Users } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { PageTitle } from '@/components/PageTitle'
import { StatCard } from '@/components/StatCard'
import { dashboardService } from '@/services/dashboard'
import { dbService } from '@/services/mockDb'
import { DataTable } from '@/components/DataTable'

// Dashboard é visão resumida/analítica da operação.
// Ele ajuda acompanhamento, mas não substitui o fluxo de decisão da portaria.
export function DashboardPage() {
  const { data } = useQuery({ queryKey: ['stats', 'db'], queryFn: dashboardService.getStats })
  const records = useMemo(() => dbService.getDb().accessRecords, [data])

  if (!data) return <p>Carregando...</p>

  return (
    <div className="space-y-6">
      <PageTitle title="Dashboard" subtitle="Indicadores calculados dinamicamente da base mock" />
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {/* Esses cards precisam conversar com a base atual; incoerência aqui passa sensação de dado quebrado. */}
        <StatCard label="Entradas Hoje" value={data.entriesToday} icon={CheckCircle2} />
        <StatCard label="Período" value={data.entriesPeriod} icon={Users} />
        <StatCard label="Visitantes únicos" value={data.uniqueVisitors} icon={Users} />
        <StatCard label="Violações" value={data.sanitaryViolations} icon={ShieldAlert} />
        <StatCard label="Liberadas" value={data.releasedEntries} icon={CheckCircle2} />
        <StatCard label="Bloqueadas" value={data.blockedEntries} icon={AlertTriangle} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card h-72">
          <p className="mb-2 text-sm font-semibold">Acessos por dia</p>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.accessByDay}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis /><Tooltip /><Bar dataKey="total" fill="#2563eb" /></BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card h-72">
          <p className="mb-2 text-sm font-semibold">Violações por período</p>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.violationsByPeriod}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="period" /><YAxis /><Tooltip /><Line dataKey="total" stroke="#dc2626" strokeWidth={3} /></LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <DataTable
        columns={[
          { key: 'datetime', label: 'Data/Hora', sortable: true, render: (row) => new Date(row.datetime).toLocaleString('pt-BR') },
          { key: 'visitorName', label: 'Visitante', sortable: true },
          { key: 'farmName', label: 'Granja', sortable: true },
          { key: 'sanitaryStatus', label: 'Status' },
          { key: 'decision', label: 'Decisão' }
        ]}
        searchableKeys={['visitorName', 'document', 'farmName']}
        data={records}
      />
    </div>
  )
}
