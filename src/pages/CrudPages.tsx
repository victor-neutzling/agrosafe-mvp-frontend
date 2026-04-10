import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import { DataTable } from '@/components/DataTable'
import { PageTitle } from '@/components/PageTitle'
import { StatusBadge } from '@/components/StatusBadge'
import { dbService } from '@/services/mockDb'

// Esse arquivo concentra várias telas de cadastro/CRUD.
// Parte dele já está estruturada, mas ainda tem blocos mais enxutos (quase placeholder) para fechar no MVP.
const maskCpf = (value: string) => value.replace(/\D/g, '').slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2')
const maskCnpj = (value: string) => value.replace(/\D/g, '').slice(0, 14).replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1/$2').replace(/(\d{4})(\d{1,2})$/, '$1-$2')
const maskPhone = (value: string) => value.replace(/\D/g, '').slice(0, 11).replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{1,4})$/, '$1-$2')
const maskCep = (value: string) => value.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d{1,3})/, '$1-$2')
const maskPlate = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7)

function RecordActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return <div className="flex justify-end gap-2"><button className="btn-secondary" onClick={onEdit}>Editar</button><button className="btn-danger" onClick={onDelete}>Excluir</button></div>
}

function FormModal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/50 p-4"><div className="card w-full max-w-2xl"><div className="mb-3 flex items-center justify-between"><p className="text-lg font-semibold">{title}</p><button onClick={onClose} className="btn-secondary">Fechar</button></div>{children}</div></div>
}

const visitorSchema = z.object({
  fullName: z.string().min(3),
  document: z.string().min(11),
  cpf: z.string().min(14),
  phone: z.string().min(14),
  email: z.string().email(),
  profession: z.string().min(2),
  jobTitle: z.string().min(2),
  department: z.string().optional(),
  accessProfile: z.enum(['TRABALHADOR_DIARIO', 'PRESTADOR_SERVICO', 'VISITANTE']),
  hierarchyLevel: z.enum(['OPERACIONAL', 'TECNICO', 'SUPERVISAO', 'AUDITORIA', 'AUTORIDADE']),
  homeFarmId: z.string().optional(),
  allowedFarmIds: z.array(z.string()).optional(),
  badgeCode: z.string().optional(),
  requiresEscort: z.boolean().optional(),
  sanitaryRiskLevel: z.enum(['BAIXO', 'MEDIO', 'ALTO']),
  active: z.boolean(),
  zipCode: z.string().min(9),
  companyId: z.string().min(1)
})
const companySchema = z.object({ cnpj: z.string().min(18), legalName: z.string().min(3), tradeName: z.string().min(3), email: z.string().email(), phone: z.string().min(14), address: z.string().min(5) })
const responsibleSchema = z.object({ fullName: z.string().min(3), cpf: z.string().min(14), gender: z.enum(['M', 'F', 'O']), phone: z.string().min(14), email: z.string().email(), birthDate: z.string().min(10) })
const farmSchema = z.object({ name: z.string().min(3), code: z.string().min(3), location: z.string().min(3), address: z.string().min(3), status: z.enum(['ATIVA', 'INATIVA']) })
const vehicleSchema = z.object({ plate: z.string().min(7), model: z.string().min(2), type: z.string().min(2), visitorId: z.string().optional(), companyId: z.string().optional() })

function CrudForm<T extends z.ZodTypeAny>({ schema, defaultValues, onSubmit, fields }: any) {
  // Formulário genérico já resolve base dos cadastros; campos específicos continuam em cada página.
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({ resolver: zodResolver(schema), defaultValues })
  return <form className="grid gap-3 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>{fields({ register, errors, setValue, watch })}<button className="btn-primary md:col-span-2">Salvar</button></form>
}

export function VisitantesPage() {
  const db = dbService.getDb(); const [editing, setEditing] = useState<any>()
  const save = (data: any) => {
    // A gente normaliza os campos novos aqui para não deixar perfil operacional sem vínculo mínimo.
    const payload = {
      ...data,
      document: data.cpf,
      department: data.department || undefined,
      homeFarmId: data.homeFarmId || undefined,
      allowedFarmIds: data.allowedFarmIds?.length ? data.allowedFarmIds : undefined,
      badgeCode: data.badgeCode || undefined,
      requiresEscort: Boolean(data.requiresEscort)
    }

    dbService.updateDb((s) => ({
      ...s,
      visitors: editing?.id
        ? s.visitors.map((v) => (v.id === editing.id ? { ...v, ...payload } : v))
        : [{
          id: `v${Date.now()}`,
          photoUrl: 'https://i.pravatar.cc/200',
          registrationPhotoUrl: 'https://i.pravatar.cc/200',
          birthDate: '1990-01-01',
          gender: 'N/I',
          lastVisits: [],
          ...payload
        }, ...s.visitors]
    }))
    setEditing(undefined)
  }

  return <div className="space-y-4"><PageTitle title="Cadastro de Visitantes" /><button className="btn-primary" onClick={() => setEditing({ active: true, requiresEscort: false, accessProfile: 'TRABALHADOR_DIARIO', hierarchyLevel: 'OPERACIONAL', sanitaryRiskLevel: 'BAIXO', allowedFarmIds: [] })}>Novo visitante</button><DataTable columns={[{ key: 'fullName', label: 'Nome', sortable: true }, { key: 'cpf', label: 'CPF' }, { key: 'accessProfile', label: 'Perfil operacional' }, { key: 'active', label: 'Status', render: (row) => <StatusBadge status={row.active ? 'ATIVO' : 'INATIVO'} /> }]} searchableKeys={['fullName', 'cpf', 'jobTitle']} data={dbService.getDb().visitors} actions={(row) => <RecordActions onEdit={() => setEditing({ ...row, allowedFarmIds: row.allowedFarmIds || [] })} onDelete={() => dbService.updateDb((s) => ({ ...s, visitors: s.visitors.filter((v) => v.id !== row.id) }))} />} />{editing && <FormModal title={`${editing.id ? 'Editar' : 'Novo'} visitante`} onClose={() => setEditing(undefined)}><CrudForm schema={visitorSchema} defaultValues={{ ...editing, cpf: editing.cpf || editing.document }} onSubmit={save} fields={({ register, errors, setValue, watch }: any) => <>
      <input className="input" placeholder="Nome completo" {...register('fullName')} />
      <p className="text-xs text-red-500">{errors.fullName?.message as string}</p>
      <input className="input" placeholder="CPF" {...register('cpf')} onChange={(e) => { const cpf = maskCpf(e.target.value); setValue('cpf', cpf); setValue('document', cpf) }} />
      <input className="input" placeholder="Celular" {...register('phone')} onChange={(e) => setValue('phone', maskPhone(e.target.value))} />
      <input className="input" placeholder="E-mail" {...register('email')} />
      <input className="input" placeholder="Cargo/função" {...register('jobTitle')} />
      <input className="input" placeholder="Profissão (campo legado)" {...register('profession')} />
      <input className="input" placeholder="Departamento (opcional)" {...register('department')} />
      <select className="input" {...register('accessProfile')}><option value="TRABALHADOR_DIARIO">Trabalhador diário</option><option value="PRESTADOR_SERVICO">Prestador de serviço</option><option value="VISITANTE">Visitante</option></select>
      <select className="input" {...register('hierarchyLevel')}><option value="OPERACIONAL">Operacional</option><option value="TECNICO">Técnico</option><option value="SUPERVISAO">Supervisão</option><option value="AUDITORIA">Auditoria</option><option value="AUTORIDADE">Autoridade</option></select>
      <select className="input" {...register('homeFarmId')}><option value="">Sem granja base</option>{db.farms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</select>
      <div className="rounded-lg border border-slate-200 p-3 md:col-span-2"><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Granjas autorizadas</p><div className="grid gap-2 md:grid-cols-2">{db.farms.map((farm) => { const selected = (watch('allowedFarmIds') || []).includes(farm.id); return <label key={farm.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selected} onChange={(e) => { const current = watch('allowedFarmIds') || []; const next = e.target.checked ? [...current, farm.id] : current.filter((id: string) => id !== farm.id); setValue('allowedFarmIds', next, { shouldValidate: true }) }} />{farm.name}</label> })}</div></div>
      <input className="input" placeholder="Código do crachá (opcional)" {...register('badgeCode')} />
      <select className="input" {...register('sanitaryRiskLevel')}><option value="BAIXO">Risco baixo</option><option value="MEDIO">Risco médio</option><option value="ALTO">Risco alto</option></select>
      <div className="flex items-center gap-2"><input type="checkbox" checked={Boolean(watch('requiresEscort'))} onChange={(e) => setValue('requiresEscort', e.target.checked)} /><span className="text-sm">Exige escolta</span></div>
      <div className="flex items-center gap-2"><input type="checkbox" checked={Boolean(watch('active'))} onChange={(e) => setValue('active', e.target.checked)} /><span className="text-sm">Cadastro ativo</span></div>
      <input className="input" placeholder="CEP" {...register('zipCode')} onChange={(e) => setValue('zipCode', maskCep(e.target.value))} />
      <select className="input" {...register('companyId')}>{db.companies.map((c) => <option key={c.id} value={c.id}>{c.tradeName}</option>)}</select>
      <input type="hidden" {...register('document')} />
    </>} /></FormModal>}</div>
}


export function EmpresasPage() { const db = dbService.getDb(); const [editing, setEditing] = useState<any>(); const save = (data: any) => { dbService.updateDb((s) => ({ ...s, companies: editing?.id ? s.companies.map((c) => c.id === editing.id ? { ...c, ...data } : c) : [{ id: `c${Date.now()}`, ...data }, ...s.companies] })); setEditing(undefined) }; return <div className="space-y-4"><PageTitle title="Cadastro de Empresas" /><button className="btn-primary" onClick={() => setEditing({})}>Nova empresa</button><DataTable columns={[{ key: 'cnpj', label: 'CNPJ' }, { key: 'tradeName', label: 'Nome fantasia' }, { key: 'email', label: 'E-mail' }]} data={dbService.getDb().companies} searchableKeys={['tradeName', 'cnpj']} actions={(row) => <RecordActions onEdit={() => setEditing(row)} onDelete={() => dbService.updateDb((s) => ({ ...s, companies: s.companies.filter((c) => c.id !== row.id) }))} />} />{editing && <FormModal title="Empresa" onClose={() => setEditing(undefined)}><CrudForm schema={companySchema} defaultValues={editing} onSubmit={save} fields={({ register, setValue }: any) => <><input className="input" placeholder="CNPJ" {...register('cnpj')} onChange={(e) => setValue('cnpj', maskCnpj(e.target.value))} /><input className="input" placeholder="Razão social" {...register('legalName')} /><input className="input" placeholder="Nome fantasia" {...register('tradeName')} /><input className="input" placeholder="E-mail" {...register('email')} /><input className="input" placeholder="Telefone" {...register('phone')} onChange={(e) => setValue('phone', maskPhone(e.target.value))} /><input className="input" placeholder="Endereço" {...register('address')} /></>} /></FormModal>}</div> }

export function ResponsaveisPage() { const [editing, setEditing] = useState<any>(); const save = (data: any) => { dbService.updateDb((s) => ({ ...s, responsibles: editing?.id ? s.responsibles.map((c) => c.id === editing.id ? { ...c, ...data } : c) : [{ id: `rp${Date.now()}`, ...data }, ...s.responsibles] })); setEditing(undefined) }; return <div className="space-y-4"><PageTitle title="Cadastro de Responsáveis" /><button className="btn-primary" onClick={() => setEditing({})}>Novo responsável</button><DataTable columns={[{ key: 'fullName', label: 'Nome' }, { key: 'cpf', label: 'CPF' }, { key: 'phone', label: 'Celular' }]} data={dbService.getDb().responsibles} searchableKeys={['fullName', 'cpf']} actions={(row) => <RecordActions onEdit={() => setEditing(row)} onDelete={() => dbService.updateDb((s) => ({ ...s, responsibles: s.responsibles.filter((c) => c.id !== row.id) }))} />} />{editing && <FormModal title="Responsável" onClose={() => setEditing(undefined)}><CrudForm schema={responsibleSchema} defaultValues={editing} onSubmit={save} fields={({ register, setValue }: any) => <><input className="input" placeholder="Nome" {...register('fullName')} /><input className="input" placeholder="CPF" {...register('cpf')} onChange={(e) => setValue('cpf', maskCpf(e.target.value))} /><select className="input" {...register('gender')}><option value="M">Masculino</option><option value="F">Feminino</option><option value="O">Outro</option></select><input className="input" placeholder="Celular" {...register('phone')} onChange={(e) => setValue('phone', maskPhone(e.target.value))} /><input className="input" placeholder="E-mail" {...register('email')} /><input className="input" type="date" {...register('birthDate')} /></>} /></FormModal>}</div> }

export function GranjasPage() { const [editing, setEditing] = useState<any>(); const save = (data: any) => { dbService.updateDb((s) => ({ ...s, farms: editing?.id ? s.farms.map((f) => f.id === editing.id ? { ...f, ...data } : f) : [{ id: `f${Date.now()}`, ...data }, ...s.farms] })); setEditing(undefined) }; return <div className="space-y-4"><PageTitle title="Cadastro de Granjas" /><button className="btn-primary" onClick={() => setEditing({})}>Nova granja</button><DataTable columns={[{ key: 'name', label: 'Nome' }, { key: 'code', label: 'Código' }, { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }]} data={dbService.getDb().farms} searchableKeys={['name', 'code']} actions={(row) => <RecordActions onEdit={() => setEditing(row)} onDelete={() => dbService.updateDb((s) => ({ ...s, farms: s.farms.filter((f) => f.id !== row.id) }))} />} />{editing && <FormModal title="Granja" onClose={() => setEditing(undefined)}><CrudForm schema={farmSchema} defaultValues={editing} onSubmit={save} fields={({ register }: any) => <><input className="input" placeholder="Nome" {...register('name')} /><input className="input" placeholder="Código" {...register('code')} /><input className="input" placeholder="Localização" {...register('location')} /><input className="input" placeholder="Endereço" {...register('address')} /><select className="input" {...register('status')}><option value="ATIVA">Ativa</option><option value="INATIVA">Inativa</option></select></>} /></FormModal>}</div> }

export function VeiculosPage() { const db = dbService.getDb(); const [editing, setEditing] = useState<any>(); const save = (data: any) => { dbService.updateDb((s) => ({ ...s, vehicles: editing?.id ? s.vehicles.map((v) => v.id === editing.id ? { ...v, ...data } : v) : [{ id: `ve${Date.now()}`, ...data }, ...s.vehicles] })); setEditing(undefined) }; return <div className="space-y-4"><PageTitle title="Cadastro de Veículos" /><button className="btn-primary" onClick={() => setEditing({})}>Novo veículo</button><DataTable columns={[{ key: 'plate', label: 'Placa' }, { key: 'model', label: 'Modelo' }, { key: 'type', label: 'Tipo' }]} data={dbService.getDb().vehicles} searchableKeys={['plate', 'model']} actions={(row) => <RecordActions onEdit={() => setEditing(row)} onDelete={() => dbService.updateDb((s) => ({ ...s, vehicles: s.vehicles.filter((v) => v.id !== row.id) }))} />} />{editing && <FormModal title="Veículo" onClose={() => setEditing(undefined)}><CrudForm schema={vehicleSchema} defaultValues={editing} onSubmit={save} fields={({ register, setValue }: any) => <><input className="input" placeholder="Placa" {...register('plate')} onChange={(e) => setValue('plate', maskPlate(e.target.value))} /><input className="input" placeholder="Modelo" {...register('model')} /><input className="input" placeholder="Tipo" {...register('type')} /><select className="input" {...register('visitorId')}><option value="">Sem visitante</option>{db.visitors.map((v) => <option key={v.id} value={v.id}>{v.fullName}</option>)}</select><select className="input" {...register('companyId')}><option value="">Sem empresa</option>{db.companies.map((c) => <option key={c.id} value={c.id}>{c.tradeName}</option>)}</select></>} /></FormModal>}</div> }

export function HistoricoPage() { const navigate = useNavigate(); const [farm, setFarm] = useState(''); const db = dbService.getDb(); const records = useMemo(() => db.accessRecords.filter((r) => !farm || r.farmName === farm), [db.accessRecords, farm]); return <div className="space-y-4"><PageTitle title="Histórico de Acessos" /><div className="card flex flex-wrap gap-2"><select className="input max-w-xs" value={farm} onChange={(e) => setFarm(e.target.value)}><option value="">Todas granjas</option>{db.farms.map((f) => <option key={f.id} value={f.name}>{f.name}</option>)}</select></div><DataTable columns={[{ key: 'datetime', label: 'Data/Hora', sortable: true, render: (row) => new Date(row.datetime).toLocaleString('pt-BR') }, { key: 'visitorName', label: 'Visitante', sortable: true }, { key: 'document', label: 'Documento' }, { key: 'farmName', label: 'Granja' }, { key: 'sanitaryStatus', label: 'Status', render: (row) => <StatusBadge status={row.sanitaryStatus} /> }, { key: 'decision', label: 'Decisão' }]} data={records} searchableKeys={['visitorName', 'document', 'farmName']} actions={(row) => <button className="btn-secondary" onClick={() => navigate(`/ocorrencias/${row.id}`)}>Detalhe</button>} /></div> }

export function ViolacoesPage() { const navigate = useNavigate(); const [status, setStatus] = useState(''); const db = dbService.getDb(); const rows = db.violations.filter((v) => !status || v.finalStatus === status); return <div className="space-y-4"><PageTitle title="Violações Sanitárias" /><div className="card"><select className="input max-w-xs" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Todos status</option><option value="BLOQUEADO">Bloqueado</option><option value="LIBERADO_COM_RESTRICAO">Liberado com restrição</option></select></div><DataTable columns={[{ key: 'visitorName', label: 'Visitante' }, { key: 'previousFarm', label: 'Granja anterior' }, { key: 'currentFarm', label: 'Granja atual' }, { key: 'attemptAt', label: 'Tentativa', sortable: true, render: (row) => new Date(row.attemptAt).toLocaleString('pt-BR') }, { key: 'intervalHours', label: 'Intervalo', render: (row) => `${row.intervalHours}h` }, { key: 'finalStatus', label: 'Status', render: (row) => <StatusBadge status={row.finalStatus} /> }]} data={rows} searchableKeys={['visitorName', 'currentFarm']} actions={(row) => <button className="btn-secondary" onClick={() => navigate(`/ocorrencias/${row.recordId}`)}>Detalhe</button>} /></div> }

// Usuários e Configurações ainda estão em estágio mais leve no MVP: leitura já está útil, edição fina vem depois.
export const UsuariosPage = () => <div className="space-y-4"><PageTitle title="Gestão de Usuários" /><DataTable columns={[{ key: 'name', label: 'Nome' }, { key: 'email', label: 'E-mail' }, { key: 'role', label: 'Perfil' }, { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }]} data={dbService.getDb().users} /></div>

export function LgpdPage() { const db = dbService.getDb(); const version = 'v2.1'; return <div className="space-y-4"><PageTitle title="Termo LGPD / Consentimento" /><div className="card space-y-2"><p className="text-lg font-semibold">Termo de Consentimento de Biometria</p><p className="text-sm text-slate-600">Finalidade: controle de acesso, prevenção sanitária e auditoria de trânsito entre granjas.</p><p className="text-sm text-slate-600">Versão vigente: <strong>{version}</strong> • Biometria só é utilizada mediante aceite ativo.</p></div><DataTable columns={[{ key: 'visitorId', label: 'Visitante', render: (row) => db.visitors.find((v) => v.id === row.visitorId)?.fullName || row.visitorId }, { key: 'version', label: 'Versão' }, { key: 'acceptedAt', label: 'Aceito em', sortable: true, render: (row) => new Date(row.acceptedAt).toLocaleString('pt-BR') }, { key: 'purpose', label: 'Finalidade' }, { key: 'accepted', label: 'Status', render: (row) => <StatusBadge status={row.accepted ? 'ACEITO' : 'PENDENTE'} /> }]} data={db.lgpdConsents} searchableKeys={['visitorId', 'version']} /></div> }

export const ConfiguracoesPage = () => <div className="space-y-4"><PageTitle title="Configurações" /><div className="card text-sm">Parâmetros de integração, regra de 48 horas e notificações.</div></div>

export function VisitorDetailPage() {
  const { id } = useParams(); const db = dbService.getDb(); const visitor = db.visitors.find((item) => item.id === id); if (!visitor) return <div className="card">Visitante não encontrado.</div>
  const consent = db.lgpdConsents.find((item) => item.visitorId === visitor.id)
  const records = db.accessRecords.filter((item) => item.visitorId === visitor.id)
  const violations = db.violations.filter((item) => item.visitorId === visitor.id)
  const vehicles = db.vehicles.filter((item) => item.visitorId === visitor.id)
  return <div className="space-y-4"><PageTitle title={`Visitante: ${visitor.fullName}`} /><div className="card flex items-center gap-4"><img src={visitor.photoUrl} className="h-28 w-28 rounded-xl" /><div><p className="font-semibold">{visitor.fullName}</p><p className="text-sm">Documento: {visitor.document}</p><p className="text-sm">Empresa: {db.companies.find((c) => c.id === visitor.companyId)?.tradeName}</p></div></div><div className="grid gap-4 md:grid-cols-2"><div className="card"><p className="font-semibold">Dados pessoais</p><ul className="mt-2 text-sm"><li>Profissão: {visitor.profession}</li><li>Telefone: {visitor.phone}</li><li>Email: {visitor.email}</li><li>CEP: {visitor.zipCode}</li></ul></div><div className="card"><p className="font-semibold">LGPD</p><p className="text-sm">Status: <StatusBadge status={consent?.accepted ? 'ACEITO' : 'PENDENTE'} /></p><p className="text-sm">Versão: {consent?.version}</p><p className="text-sm">Aceite: {consent ? new Date(consent.acceptedAt).toLocaleString('pt-BR') : 'Não aceito'}</p></div></div><DataTable columns={[{ key: 'plate', label: 'Placa' }, { key: 'model', label: 'Modelo' }, { key: 'type', label: 'Tipo' }]} data={vehicles} emptyMessage="Sem veículos vinculados." /><DataTable columns={[{ key: 'datetime', label: 'Histórico de acessos', render: (row) => new Date(row.datetime).toLocaleString('pt-BR') }, { key: 'farmName', label: 'Granja' }, { key: 'decision', label: 'Decisão' }]} data={records} /><DataTable columns={[{ key: 'attemptAt', label: 'Violação em', render: (row) => new Date(row.attemptAt).toLocaleString('pt-BR') }, { key: 'reason', label: 'Motivo' }, { key: 'finalStatus', label: 'Status', render: (row) => <StatusBadge status={row.finalStatus} /> }]} data={violations} emptyMessage="Sem violações sanitárias." /></div>
}

export function OccurrenceDetailPage() {
  const { id } = useParams(); const db = dbService.getDb(); const record = db.accessRecords.find((item) => item.id === id); if (!record) return <div className="card">Ocorrência não encontrada.</div>
  const violation = db.violations.find((item) => item.recordId === record.id)
  return <div className="space-y-4"><PageTitle title="Detalhe da ocorrência" subtitle={`Registro ${record.id}`} /><div className="grid gap-4 md:grid-cols-2"><div className="card space-y-1 text-sm"><p><strong>Visitante:</strong> {record.visitorName}</p><p><strong>Granja anterior:</strong> {record.previousFarmName || 'N/A'}</p><p><strong>Granja atual:</strong> {record.farmName}</p><p><strong>Data/hora:</strong> {new Date(record.datetime).toLocaleString('pt-BR')}</p><p><strong>Status final:</strong> <StatusBadge status={record.decision} /></p></div><div className="card space-y-1 text-sm"><p><strong>Intervalo encontrado:</strong> {violation?.intervalHours ? `${violation.intervalHours}h` : 'N/A'}</p><p><strong>Decisão do operador:</strong> {record.decision}</p><p><strong>Justificativa:</strong> {record.decisionJustification || violation?.justification || '-'}</p><p><strong>Motivo do alerta:</strong> {violation?.reason || 'Sem alerta sanitário'}</p><p><strong>Vínculo histórico:</strong> {record.visitorId}</p></div></div></div>
}
