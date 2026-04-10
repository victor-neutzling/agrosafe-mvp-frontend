import { AlertTriangle, BadgeInfo, Camera, CheckCircle2, ChevronDown, Clock3, SearchX, ShieldAlert, ShieldCheck, UserRoundSearch } from 'lucide-react'
import type { DailyPhotoRecord, LgpdConsent, Visitor } from '@/types/models'
import type { PortariaFlowState, PortariaScenario } from '@/services/visitors'

// Esse arquivo concentra os blocos visuais da portaria.
// A ideia é quebrar a tela grande em módulos menores para facilitar leitura e manutenção.
export const ScenarioSelector = ({ scenario, onChange }: { scenario: PortariaScenario; onChange: (scenario: PortariaScenario) => void }) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
    {/* Esse seletor é só apoio de simulação; no fluxo real ele fica escondido no modo de teste. */}
    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Modo teste da portaria</p>
    <div className="flex flex-wrap gap-2">
      <button className={`btn-secondary ${scenario === 'APTO' ? 'ring-2 ring-green-500' : ''}`} onClick={() => onChange('APTO')}>Visitante apto</button>
      <button className={`btn-secondary ${scenario === 'ALERTA' ? 'ring-2 ring-red-500' : ''}`} onClick={() => onChange('ALERTA')}>Alerta sanitário</button>
      <button className={`btn-secondary ${scenario === 'LGPD_PENDENTE' ? 'ring-2 ring-violet-500' : ''}`} onClick={() => onChange('LGPD_PENDENTE')}>LGPD pendente</button>
      <button className={`btn-secondary ${scenario === 'BAIXA_CONFIANCA' ? 'ring-2 ring-amber-500' : ''}`} onClick={() => onChange('BAIXA_CONFIANCA')}>Baixa confiança</button>
      <button className={`btn-secondary ${scenario === 'NAO_ENCONTRADO' ? 'ring-2 ring-slate-500' : ''}`} onClick={() => onChange('NAO_ENCONTRADO')}>Não encontrado</button>
    </div>
  </div>
)

export function CameraCapture({
  cameraOnline,
  capturedPhotoUrl,
  flowState,
  onCapture,
  onRetake
}: {
  cameraOnline: boolean
  capturedPhotoUrl?: string
  flowState: PortariaFlowState
  onCapture: () => void
  onRetake: () => void
}) {
  // Captura é a porta de entrada do fluxo: quanto mais simples esse bloco, melhor a operação no dia a dia.
  const captureFeedback =
    flowState === 'AGUARDANDO_CAPTURA'
      ? 'Aguardando captura da câmera.'
      : flowState === 'RECONHECENDO'
        ? 'Reconhecendo visitante...'
        : capturedPhotoUrl
          ? 'Captura realizada com sucesso.'
          : 'Captura pendente.'

  return (
    <div className="card space-y-3">
      <h3 className="flex items-center gap-2 text-lg font-semibold"><Camera size={18} /> Captura</h3>
      <p className="text-xs text-slate-500">Status da câmera: <span className={cameraOnline ? 'font-semibold text-green-700' : 'font-semibold text-red-700'}>{cameraOnline ? 'online' : 'offline'}</span></p>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-900">
        {capturedPhotoUrl ? (
          <img src={capturedPhotoUrl} alt="Foto capturada na câmera" className="h-64 w-full object-cover" />
        ) : (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-sm text-slate-200">
            <Camera size={20} />
            Webcam simulada pronta para captura
          </div>
        )}
      </div>
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">{captureFeedback}</div>
      <div className="flex flex-wrap gap-2">
        <button className="btn-primary" onClick={onCapture}>Capturar foto</button>
        <button className="btn-secondary" onClick={onRetake}>Capturar novamente</button>
      </div>
    </div>
  )
}

export function ValidationPanel({
  visitor,
  capturedPhotoUrl,
  dailyPhoto,
  score,
  lgpdConsent,
  currentFarm,
  previousFarm,
  sinceLast,
  remaining,
  sanitaryReason,
  profileHint,
  homeFarmName,
  allowedFarmNames,
  companyName,
  sanitaryStatus
}: {
  visitor?: Visitor
  capturedPhotoUrl?: string
  dailyPhoto?: DailyPhotoRecord
  score?: number
  lgpdConsent?: LgpdConsent
  currentFarm?: string
  previousFarm?: string
  sinceLast?: number
  remaining?: number
  sanitaryReason?: string
  profileHint?: string
  homeFarmName?: string
  allowedFarmNames: string[]
  sanitaryStatus: 'LIBERADO' | 'ALERTA' | 'NAO_ENCONTRADO'
  companyName?: string
}) {
  // Esse é um dos blocos mais sensíveis da tela: identidade + validação sanitária precisam estar lado a lado.
  return (
    <div className="card space-y-4">
      {/*
        Esse bloco junta identidade + validação sanitária no mesmo lugar porque
        o operador precisa bater o olho e decidir sem ficar caçando informação pela tela.
      */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Seção A — Identificação</p>
        <VisitorIdentityCard
          visitor={visitor}
          lgpdConsent={lgpdConsent}
          sanitaryStatus={sanitaryStatus}
          currentFarm={currentFarm}
          previousFarm={previousFarm}
          sinceLast={sinceLast}
          remaining={remaining}
          homeFarmName={homeFarmName}
          allowedFarmNames={allowedFarmNames}
          companyName={companyName}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <PhotoCard title="Foto de cadastro" image={visitor?.registrationPhotoUrl || visitor?.photoUrl} emptyText="Sem foto cadastrada" />
        <PhotoCard title="Foto capturada agora" image={capturedPhotoUrl} emptyText="Captura pendente" />
        <PhotoCard title="Foto diária / última validação" image={dailyPhoto?.photoUrl} emptyText="Sem validação diária" subtitle={dailyPhoto ? `Última captura: ${new Date(dailyPhoto.capturedAt).toLocaleString('pt-BR')}` : undefined} />
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Seção B — Status da validação</p>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Info label="Status da biometria" value={visitor ? 'Visitante identificado' : 'Aguardando reconhecimento'} />
          <Info label="Confiança facial" value={score !== undefined ? `${Math.round(score * 100)}%` : '-'} />
          <Info label="Status LGPD" value={lgpdConsent?.accepted ? 'Consentimento válido' : 'Consentimento LGPD pendente'} />
          <Info label="Granja atual" value={currentFarm || '-'} />
          <Info label="Última granja visitada" value={previousFarm || 'Sem histórico'} />
          <Info label="Data/hora da última visita" value={visitor?.lastVisits[0]?.timestamp ? new Date(visitor.lastVisits[0].timestamp).toLocaleString('pt-BR') : '-'} />
          <Info label="Tempo desde última visita" value={sinceLast !== undefined ? `${sinceLast}h` : '-'} />
          <Info label="Faltam para 48h" value={remaining !== undefined ? `${remaining}h` : '-'} />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Seção C — Apoio de auditoria</p>
        <div className="grid gap-3 md:grid-cols-4">
          <Info label="Última validação do dia" value={dailyPhoto ? 'Realizada' : 'Não registrada'} />
          <Info label="Horário da última captura" value={dailyPhoto ? new Date(dailyPhoto.capturedAt).toLocaleString('pt-BR') : '-'} />
          <Info label="Confiança anterior" value={dailyPhoto ? `${Math.round(dailyPhoto.confidenceScore * 100)}%` : '-'} />
          <Info label="Operador anterior" value={dailyPhoto?.operator || '-'} />
        </div>
      </div>

      {profileHint && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          <p className="mb-1 flex items-center gap-2 font-semibold"><BadgeInfo size={16} /> Regra operacional por perfil</p>
          {profileHint}
        </div>
      )}
      {sanitaryReason && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{sanitaryReason}</div>}
    </div>
  )
}

export function VisitorIdentityCard({
  visitor,
  lgpdConsent,
  sanitaryStatus,
  currentFarm,
  previousFarm,
  sinceLast,
  remaining,
  homeFarmName,
  allowedFarmNames,
  companyName
}: {
  visitor?: Visitor
  lgpdConsent?: LgpdConsent
  sanitaryStatus: 'LIBERADO' | 'ALERTA' | 'NAO_ENCONTRADO'
  companyName?: string
  currentFarm?: string
  previousFarm?: string
  sinceLast?: number
  remaining?: number
  homeFarmName?: string
  allowedFarmNames: string[]
}) {
  if (!visitor) return <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">Aguardando reconhecimento para montar o card de identificação.</div>

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Identidade do visitante</p>
      <div className="flex flex-wrap items-start gap-4">
        <img src={visitor.photoUrl} className="h-24 w-24 rounded-xl object-cover" alt={`Foto de ${visitor.fullName}`} />
        <div className="flex-1 space-y-2">
          <p className="text-lg font-semibold text-slate-900">{visitor.fullName}</p>
          <div className="flex flex-wrap gap-2">
            <Badge tone="blue">{prettyProfile(visitor.accessProfile)}</Badge>
            <Badge tone="slate">{prettyHierarchy(visitor.hierarchyLevel)}</Badge>
            <Badge tone={lgpdConsent?.accepted ? 'green' : 'violet'}>{lgpdConsent?.accepted ? 'LGPD OK' : 'LGPD PENDENTE'}</Badge>
            <Badge tone={sanitaryStatus === 'ALERTA' ? 'red' : 'green'}>{sanitaryStatus === 'ALERTA' ? 'ALERTA SANITÁRIO' : 'SANITÁRIO LIBERADO'}</Badge>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-sm md:grid-cols-2 xl:grid-cols-3">
        <Info label="CPF" value={visitor.cpf} />
        <Info label="Cargo/função" value={visitor.jobTitle} />
        <Info label="Empresa" value={companyName || visitor.companyId} />
        <Info label="Telefone" value={visitor.phone} />
        <Info label="E-mail" value={visitor.email} />
        <Info label="Código/crachá" value={visitor.badgeCode || 'Não informado'} />
        <Info label="Granja base" value={homeFarmName || 'Não vinculada'} />
        <Info label="Granjas autorizadas" value={allowedFarmNames.length ? allowedFarmNames.join(', ') : 'Não informado'} />
        <Info label="Exige escolta" value={visitor.requiresEscort ? 'Sim' : 'Não'} />
        <Info label="Granja atual" value={currentFarm || '-'} />
        <Info label="Última granja" value={previousFarm || 'Sem histórico'} />
        <Info label="Tempo desde última visita" value={sinceLast !== undefined ? `${sinceLast}h` : '-'} />
        <Info label="Faltam para 48h" value={remaining !== undefined ? `${remaining}h` : '-'} />
      </div>
    </div>
  )
}

function prettyProfile(profile: Visitor['accessProfile']) {
  const map = {
    TRABALHADOR_DIARIO: 'Trabalhador diário',
    PRESTADOR_SERVICO: 'Prestador de serviço',
    VISITANTE: 'Visitante'
  }
  return map[profile]
}

function prettyHierarchy(level: Visitor['hierarchyLevel']) {
  const map = {
    OPERACIONAL: 'Operacional',
    TECNICO: 'Técnico',
    SUPERVISAO: 'Supervisão',
    AUDITORIA: 'Auditoria',
    AUTORIDADE: 'Autoridade'
  }
  return map[level]
}

function Badge({ tone, children }: { tone: 'blue' | 'slate' | 'green' | 'red' | 'violet'; children: string }) {
  const map = {
    blue: 'border-blue-200 bg-blue-100 text-blue-800',
    slate: 'border-slate-300 bg-slate-100 text-slate-700',
    green: 'border-green-200 bg-green-100 text-green-800',
    red: 'border-red-200 bg-red-100 text-red-800',
    violet: 'border-violet-200 bg-violet-100 text-violet-800'
  }
  return <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${map[tone]}`}>{children}</span>
}

function PhotoCard({ title, image, subtitle, emptyText }: { title: string; image?: string; subtitle?: string; emptyText: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-2">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      {image ? <img src={image} className="h-40 w-full rounded-lg object-cover" /> : <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-slate-300 text-xs text-slate-500">{emptyText}</div>}
      {subtitle && <p className="mt-2 text-xs text-slate-500">{subtitle}</p>}
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-slate-200 bg-white p-3"><p className="text-xs text-slate-500">{label}</p><p className="text-sm font-semibold">{value}</p></div>
}

export const PortariaStatus = ({ status, reason }: { status: PortariaFlowState; reason: string }) => {
  // Traduz estado técnico em mensagem visual direta para operação não depender de interpretação do código.
  const map: Record<PortariaFlowState, { className: string; icon: JSX.Element; title: string }> = {
    AGUARDANDO_CAPTURA: { className: 'border-slate-500 bg-slate-50 text-slate-800', icon: <Clock3 size={18} />, title: 'AGUARDANDO CAPTURA' },
    RECONHECENDO: { className: 'border-blue-500 bg-blue-50 text-blue-800', icon: <UserRoundSearch size={18} />, title: 'RECONHECENDO' },
    RECONHECIDO_ALTA: { className: 'border-green-500 bg-green-50 text-green-800', icon: <CheckCircle2 size={18} />, title: 'RECONHECIDO - CONFIANÇA ALTA' },
    RECONHECIDO_BAIXA: { className: 'border-amber-500 bg-amber-50 text-amber-800', icon: <AlertTriangle size={18} />, title: 'RECONHECIDO - CONFIANÇA BAIXA' },
    NAO_ENCONTRADO: { className: 'border-slate-500 bg-slate-100 text-slate-800', icon: <SearchX size={18} />, title: 'NÃO ENCONTRADO' },
    LGPD_PENDENTE: { className: 'border-violet-500 bg-violet-50 text-violet-800', icon: <ShieldAlert size={18} />, title: 'LGPD PENDENTE' },
    ALERTA_SANITARIO: { className: 'border-red-500 bg-red-50 text-red-800', icon: <ShieldAlert size={18} />, title: 'ALERTA SANITÁRIO' },
    REVISAO_MANUAL: { className: 'border-violet-500 bg-violet-50 text-violet-800', icon: <UserRoundSearch size={18} />, title: 'EM REVISÃO MANUAL' },
    LIBERADO: { className: 'border-emerald-600 bg-emerald-50 text-emerald-800', icon: <ShieldCheck size={18} />, title: 'LIBERADO' },
    BLOQUEADO: { className: 'border-rose-600 bg-rose-50 text-rose-800', icon: <ShieldAlert size={18} />, title: 'BLOQUEADO' },
    CADASTRO_NECESSARIO: { className: 'border-orange-600 bg-orange-50 text-orange-800', icon: <ChevronDown size={18} />, title: 'CADASTRO NECESSÁRIO' }
  }

  const current = map[status]
  return <div className={`card border-l-4 ${current.className}`}><p className="mb-2 flex items-center gap-2 font-semibold">{current.icon}{current.title}</p><p className="text-sm">{reason}</p></div>
}

export function DecisionPanel({
  flowState,
  exceptionalJustification,
  onExceptionalJustificationChange,
  onRelease,
  onBlock,
  onRetake,
  onValidateByDocument,
  onNewVisitor,
  onAuthorizeException
}: {
  flowState: PortariaFlowState
  exceptionalJustification: string
  onExceptionalJustificationChange: (value: string) => void
  onRelease: () => void
  onBlock: () => void
  onRetake: () => void
  onValidateByDocument: () => void
  onNewVisitor: () => void
  onAuthorizeException: () => void
}) {
  // Esse bloco concentra as ações finais, mas a regra de negócio continua centralizada na página/service.
  const showJustification = flowState === 'ALERTA_SANITARIO' || flowState === 'RECONHECIDO_BAIXA'

  return (
    <div className="card space-y-3">
      {/*
        Aqui a gente restringe os botões por estado para evitar erro de operação.
        O que não faz sentido no momento fica fora da tela principal.
      */}
      <p className="font-semibold">Bloco 3 — Decisão operacional</p>

      {(flowState === 'AGUARDANDO_CAPTURA' || flowState === 'RECONHECENDO') && (
        <p className="text-sm text-slate-600">Capture e valide a identidade para liberar as opções de decisão.</p>
      )}

      {(flowState === 'RECONHECIDO_ALTA' || flowState === 'RECONHECIDO_BAIXA' || flowState === 'ALERTA_SANITARIO') && (
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" onClick={onRelease}>Liberar entrada</button>
          <button className="btn-danger" onClick={onBlock}>Bloquear entrada</button>
          <button className="btn-secondary" onClick={onAuthorizeException}>Liberar com justificativa</button>
          <button className="btn-secondary" onClick={onValidateByDocument}>Enviar para revisão manual</button>
          <button className="btn-secondary" onClick={onRetake}>Capturar novamente</button>
        </div>
      )}

      {flowState === 'LGPD_PENDENTE' && (
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary" onClick={onValidateByDocument}>Enviar para revisão manual</button>
          <button className="btn-danger" onClick={onBlock}>Bloquear entrada</button>
        </div>
      )}

      {flowState === 'NAO_ENCONTRADO' && (
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary" onClick={onValidateByDocument}>Enviar para revisão manual</button>
          <button className="btn-secondary" onClick={onNewVisitor}>Cadastrar novo visitante</button>
          <button className="btn-danger" onClick={onBlock}>Bloquear entrada</button>
        </div>
      )}

      {showJustification && (
        <textarea
          className="input"
          placeholder="Justificativa (obrigatória para exceção sanitária ou liberação com baixa confiança)"
          value={exceptionalJustification}
          onChange={(e) => onExceptionalJustificationChange(e.target.value)}
        />
      )}
    </div>
  )
}

export function ManualReviewPanel({
  document,
  onDocumentChange,
  onSearch,
  foundVisitor,
  justification,
  onJustificationChange,
  onApprove,
  onBlock
}: {
  document: string
  onDocumentChange: (value: string) => void
  onSearch: () => void
  foundVisitor?: Visitor
  justification: string
  onJustificationChange: (value: string) => void
  onApprove: () => void
  onBlock: () => void
}) {
  // Painel de exceção: entra quando o automático não está confiável o bastante para fechar sozinho.
  return (
    <div className="card space-y-3 border-violet-200 bg-violet-50">
      {/*
        Essa parte segura o fluxo manual quando a biometria não fecha a conta sozinha.
        Sem confirmação por documento + justificativa, a revisão não pode ser concluída.
      */}
      <p className="flex items-center gap-2 font-semibold text-violet-800"><ShieldCheck size={16} /> Revisão manual (fluxo de exceção)</p>
      <div className="flex flex-wrap gap-2">
        <input className="input max-w-xs" value={document} onChange={(e) => onDocumentChange(e.target.value)} placeholder="Buscar por CPF/documento" />
        <button className="btn-secondary" onClick={onSearch}>Buscar por documento</button>
      </div>

      {foundVisitor ? (
        <div className="rounded-lg border border-violet-200 bg-white p-3 text-sm text-violet-900">
          Identidade confirmada manualmente: <strong>{foundVisitor.fullName}</strong> ({foundVisitor.cpf})
        </div>
      ) : (
        <p className="text-sm text-violet-900">Confirme o visitante por documento antes de concluir a revisão manual.</p>
      )}

      <textarea
        className="input"
        placeholder="Justificativa obrigatória da revisão manual"
        value={justification}
        onChange={(e) => onJustificationChange(e.target.value)}
      />

      <div className="flex flex-wrap gap-2">
        <button className="btn-primary" onClick={onApprove}>Liberar após revisão manual</button>
        <button className="btn-danger" onClick={onBlock}>Bloquear após revisão manual</button>
      </div>
    </div>
  )
}
