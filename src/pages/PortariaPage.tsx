import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronDown } from 'lucide-react'
import { PageTitle } from '@/components/PageTitle'
import { accessService } from '@/services/access-records'
import { farmService } from '@/services/farms'
import { visitorsService, type PortariaFlowState, type PortariaScenario, type RecognitionResult } from '@/services/visitors'
import { CameraCapture, DecisionPanel, ManualReviewPanel, PortariaStatus, ScenarioSelector, ValidationPanel } from '@/components/portaria'
import { dbService } from '@/services/mockDb'
import { useSanitaryValidation } from '@/hooks/useSanitaryValidation'

type DecisionAction = 'LIBERADO' | 'BLOQUEADO' | 'LIBERADO_COM_JUSTIFICATIVA' | 'REVISAO_MANUAL'

const scenarioCapturePool: Record<PortariaScenario, string[]> = {
  // As fotos de captura por cenário seguem a mesma pessoa do cadastro para manter credibilidade visual.
  APTO: ['https://i.pravatar.cc/640?img=32&u=cap1', 'https://i.pravatar.cc/640?img=32&u=cap2'],
  ALERTA: ['https://i.pravatar.cc/640?img=12&u=cap1', 'https://i.pravatar.cc/640?img=12&u=cap2'],
  LGPD_PENDENTE: ['https://i.pravatar.cc/640?img=45&u=cap1', 'https://i.pravatar.cc/640?img=45&u=cap2'],
  BAIXA_CONFIANCA: ['https://i.pravatar.cc/640?img=22&u=cap1', 'https://i.pravatar.cc/640?img=22&u=cap2'],
  NAO_ENCONTRADO: ['https://images.unsplash.com/photo-1613145997970-db84a7975fbb?auto=format&fit=crop&w=900&q=80']
}

// Essa página segura o fluxo principal da portaria.
// É aqui que captura, reconhecimento, validação sanitária, revisão manual e decisão final se encontram.
// Se mexer nesse arquivo, vale lembrar que ele é o coração operacional da aplicação.
export function PortariaPage() {
  // Aqui a gente mantém estados separados porque cada um representa uma etapa do fluxo.
  // Misturar tudo sem critério costuma gerar tela contraditória (status dizendo uma coisa e ação fazendo outra).
  const [scenario, setScenario] = useState<PortariaScenario>('APTO')
  const [testModeOpen, setTestModeOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [justification, setJustification] = useState('')
  const [manualDocument, setManualDocument] = useState('')
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string>()
  const [cameraOnline] = useState(true)
  const [flowState, setFlowState] = useState<PortariaFlowState>('AGUARDANDO_CAPTURA')
  const [recognition, setRecognition] = useState<RecognitionResult>()
  const [manualVisitorId, setManualVisitorId] = useState<string>()
  const queryClient = useQueryClient()

  const { data: farm } = useQuery({ queryKey: ['farm-current'], queryFn: farmService.getCurrent })

  const foundManualVisitor = useMemo(() => dbService.getDb().visitors.find((item) => item.id === manualVisitorId), [manualVisitorId])
  const visitorInDecision = recognition?.visitor ?? foundManualVisitor
  const sanitaryValidation = useSanitaryValidation(visitorInDecision, farm?.id)
  const isManualReviewFlow = flowState === 'REVISAO_MANUAL'

  const sinceLast = recognition?.visitor?.lastVisits[0]
    ? Math.floor((Date.now() - +new Date(recognition.visitor.lastVisits[0].timestamp)) / 3600_000)
    : undefined
  const remaining = sinceLast !== undefined ? Math.max(0, 48 - sinceLast) : undefined

  const decisionMutation = useMutation({
    // Essa mutation é sensível: registra desfecho final e conversa com a trilha mockada de auditoria.
    // Daqui sai histórico de acesso, foto diária e também possíveis violações sanitárias.
    mutationFn: (action: DecisionAction) =>
      accessService.registerDecision({
        visitorId: visitorInDecision?.id,
        action,
        sanitaryStatus: getSanitaryStatus({ flowState, sanitaryValidationStatus: sanitaryValidation.status, action }),
        justification,
        reason: recognition?.reason,
        capturedPhotoUrl,
        confidenceScore: recognition?.score,
        manualReview: isManualReviewFlow || action === 'REVISAO_MANUAL',
        lgpdStatus: recognition?.lgpdConsent?.accepted ? 'VALIDO' : 'PENDENTE'
      }),
    onSuccess: (record) => {
      // Depois da decisão, a gente força refresh dos dados que a tela depende.
      // Sem invalidar essas queries, a UI pode continuar mostrando número/status antigo.
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['records'] })
      queryClient.invalidateQueries({ queryKey: ['violations'] })

      // O pós-decisão precisa ficar alinhado com os status mostrados na UI.
      // Se esse mapeamento mudar, vale revisar os badges/mensagens para evitar contradição visual.
      const finalState: PortariaFlowState = record.decision === 'BLOQUEADO' ? 'BLOQUEADO' : 'LIBERADO'
      setFlowState(finalState)
      setFeedback(`Decisão final registrada: ${record.decision}. Operação salva para auditoria.`)
      setJustification('')
    }
  })

  const handleCapture = async () => {
    // Esse ponto liga captura + reconhecimento: sai do "aguardando" e entra em "reconhecendo".
    // Qualquer ajuste aqui impacta direto a transição crítica entre imagem e validação.
    const options = scenarioCapturePool[scenario]
    const randomPhoto = options[Math.floor(Math.random() * options.length)]
    setCapturedPhotoUrl(randomPhoto)
    setFlowState('RECONHECENDO')
    setFeedback('')
    setManualVisitorId(undefined)

    const result = await visitorsService.recognizeByFace(scenario, randomPhoto, farm?.id)
    setRecognition(result)
    setFlowState(result.flowState)

    if (result.visitor) {
      const dailyContext = visitorsService.getLatestDailyPhoto(result.visitor.id)
      if (dailyContext.hasPhotoToday) {
        setFeedback('Visitante já validado hoje. Use essa referência como apoio e siga com a decisão atual.')
      }
    }
  }

  const resetCapture = () => {
    // Aqui a gente limpa o fluxo atual para a nova tentativa não herdar estado velho.
    // Se entrarem novos states no futuro, lembrar de zerar aqui também.
    setCapturedPhotoUrl(undefined)
    setFlowState('AGUARDANDO_CAPTURA')
    setRecognition(undefined)
    setFeedback('')
    setJustification('')
    setManualVisitorId(undefined)
    setManualDocument('')
  }

  const submitDecision = (action: DecisionAction) => {
    decisionMutation.mutate(action)
  }

  // Centraliza a decisão final do operador num lugar só e evita regra espalhada em botão.
  // Regra nova de bloqueio/liberação deveria passar por aqui antes de chegar no submit.
  const runAction = (action: 'LIBERADO' | 'BLOQUEADO') => {
    if (flowState === 'LGPD_PENDENTE' && action === 'LIBERADO') {
      setFeedback('Consentimento LGPD pendente. A liberação automática foi bloqueada, siga para revisão manual.')
      return
    }
    if (flowState === 'ALERTA_SANITARIO' && action === 'LIBERADO') {
      setFeedback('Alerta sanitário ativo. Para liberar, use "Liberar com justificativa".')
      return
    }
    submitDecision(action)
  }

  const authorizeSanitaryException = () => {
    if (!justification.trim()) {
      setFeedback('Informe uma justificativa antes de liberar com exceção.')
      return
    }
    submitDecision('LIBERADO_COM_JUSTIFICATIVA')
  }

  const openManualReview = () => {
    // Aqui a gente tira o sistema do automático.
    // Serve para baixa confiança, LGPD pendente, não encontrado ou alertas sensíveis.
    setFlowState('REVISAO_MANUAL')
    setFeedback('Revisão manual aberta. Confirme documento e registre justificativa obrigatória.')
  }

  const handleManualSearch = async () => {
    // Busca manual é o fallback quando facial não resolve.
    // Em geral a confirmação por CPF/documento traz mais controle para fechar exceção.
    const found = await visitorsService.findByDocument(manualDocument)
    if (!found) {
      setManualVisitorId(undefined)
      setFeedback('Documento não encontrado. Se necessário, finalize como cadastro de novo visitante.')
      return
    }

    setManualVisitorId(found.id)
    setFeedback(`Visitante ${found.fullName} encontrado para revisão manual.`)
  }

  const handleManualConfirm = (action: 'LIBERADO' | 'BLOQUEADO') => {
    // Esse fechamento é decisão humana explícita e precisa deixar rastro para auditoria.
    if (!foundManualVisitor) {
      setFeedback('Confirme a identidade por documento antes de concluir a revisão manual.')
      return
    }
    if (!justification.trim()) {
      setFeedback('A revisão manual exige justificativa antes do fechamento.')
      return
    }

    submitDecision(action)
  }

  const signalNewVisitor = () => {
    setFlowState('CADASTRO_NECESSARIO')
    setFeedback('Cadastro necessário: direcione para o módulo de visitantes e registre o motivo da ausência na base.')
  }

  return (
    <div className="space-y-4">
      <PageTitle title="Portaria / Validação de acesso" subtitle="Fluxo principal da operação: captura, validação e decisão com trilha de auditoria" />

      <div className="flex items-center justify-end">
        <button className="btn-secondary" onClick={() => setTestModeOpen((prev) => !prev)}>
          <ChevronDown size={16} className={testModeOpen ? 'rotate-180 transition' : 'transition'} />
          Modo teste
        </button>
      </div>

      {testModeOpen && (
        <div className="card border-dashed border-slate-300 bg-slate-50">
          {/* aqui a gente esconde o modo teste da tela principal pra portaria não ficar com cara de ambiente de demo */}
          <ScenarioSelector scenario={scenario} onChange={(value) => { setScenario(value); resetCapture() }} />
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4">
          <CameraCapture
            cameraOnline={cameraOnline}
            capturedPhotoUrl={capturedPhotoUrl}
            flowState={flowState}
            onCapture={handleCapture}
            onRetake={resetCapture}
          />
        </div>

        <div className="xl:col-span-2 space-y-4">
          <ValidationPanel
            visitor={recognition?.visitor}
            capturedPhotoUrl={capturedPhotoUrl}
            dailyPhoto={recognition?.dailyPhoto}
            score={recognition?.score}
            lgpdConsent={recognition?.lgpdConsent}
            currentFarm={farm?.name}
            previousFarm={recognition?.visitor?.lastVisits[0]?.farmName}
            sinceLast={sinceLast}
            remaining={remaining}
            sanitaryReason={recognition?.reason}
            profileHint={recognition?.profileHint}
            homeFarmName={dbService.getDb().farms.find((item) => item.id === recognition?.visitor?.homeFarmId)?.name}
            allowedFarmNames={(recognition?.visitor?.allowedFarmIds || [])
              .map((farmId) => dbService.getDb().farms.find((item) => item.id === farmId)?.name)
              .filter(Boolean) as string[]}
            sanitaryStatus={sanitaryValidation.status}
            companyName={dbService.getDb().companies.find((item) => item.id === recognition?.visitor?.companyId)?.tradeName}
          />
          <PortariaStatus status={flowState} reason={recognition?.reason || 'Aguardando captura da câmera para iniciar validação.'} />
        </div>
      </div>

      {!isManualReviewFlow && (
        <DecisionPanel
          flowState={flowState}
          exceptionalJustification={justification}
          onExceptionalJustificationChange={setJustification}
          onRelease={() => runAction('LIBERADO')}
          onBlock={() => runAction('BLOQUEADO')}
          onRetake={resetCapture}
          onValidateByDocument={openManualReview}
          onNewVisitor={signalNewVisitor}
          onAuthorizeException={authorizeSanitaryException}
        />
      )}

      {isManualReviewFlow && (
        <ManualReviewPanel
          document={manualDocument}
          onDocumentChange={setManualDocument}
          onSearch={handleManualSearch}
          foundVisitor={foundManualVisitor}
          justification={justification}
          onJustificationChange={setJustification}
          onApprove={() => handleManualConfirm('LIBERADO')}
          onBlock={() => handleManualConfirm('BLOQUEADO')}
        />
      )}

      {feedback && <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-blue-700">{feedback}</div>}
      <div className="card text-xs text-slate-500">
        Base mock ativa com {dbService.getDb().accessRecords.length} acessos e {dbService.getDb().dailyPhotos.length} fotos diárias registradas.
      </div>
    </div>
  )
}

function getSanitaryStatus({
  flowState,
  sanitaryValidationStatus,
  action
}: {
  flowState: PortariaFlowState
  sanitaryValidationStatus: 'ALERTA' | 'LIBERADO' | 'NAO_ENCONTRADO'
  action: DecisionAction
}) {
  if (flowState === 'NAO_ENCONTRADO' || flowState === 'CADASTRO_NECESSARIO') return 'NAO_ENCONTRADO'
  if (flowState === 'REVISAO_MANUAL') return 'REVISAO_MANUAL'
  if (action === 'REVISAO_MANUAL') return 'REVISAO_MANUAL'
  if (flowState === 'ALERTA_SANITARIO' || sanitaryValidationStatus === 'ALERTA') return 'ALERTA'
  return 'LIBERADO'
}
