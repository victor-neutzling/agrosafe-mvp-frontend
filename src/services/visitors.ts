import type { DailyPhotoRecord, LgpdConsent, Visitor } from '@/types/models'
import { delay } from './mockApi'
import { dbService } from './mockDb'

// Service de reconhecimento facial mockado.
// A ideia aqui é manter previsibilidade suficiente para demo/teste sem virar loteria a cada captura.
export type PortariaScenario = 'APTO' | 'ALERTA' | 'NAO_ENCONTRADO' | 'LGPD_PENDENTE' | 'BAIXA_CONFIANCA'
export type PortariaFlowState =
  | 'AGUARDANDO_CAPTURA'
  | 'RECONHECENDO'
  | 'RECONHECIDO_ALTA'
  | 'RECONHECIDO_BAIXA'
  | 'NAO_ENCONTRADO'
  | 'LGPD_PENDENTE'
  | 'ALERTA_SANITARIO'
  | 'REVISAO_MANUAL'
  | 'LIBERADO'
  | 'BLOQUEADO'
  | 'CADASTRO_NECESSARIO'

export interface RecognitionResult {
  flowState: PortariaFlowState
  visitor?: Visitor
  score: number
  lgpdConsent?: LgpdConsent
  dailyPhoto?: DailyPhotoRecord
  suggestedManualReview: boolean
  reason: string
  profileHint?: string
}

const scenarioVisitorMap: Record<Exclude<PortariaScenario, 'NAO_ENCONTRADO'>, string> = {
  // Esses cenários fixos deixam teste de fluxo mais previsível.
  // Cada um representa uma condição operacional diferente da portaria.
  APTO: 'v2',
  ALERTA: 'v1',
  LGPD_PENDENTE: 'v4',
  BAIXA_CONFIANCA: 'v3'
}

const scenarioScoreMap: Record<Exclude<PortariaScenario, 'NAO_ENCONTRADO'>, number> = {
  // A confiança facial define bastante a rota do fluxo.
  // Quando cai, a tendência é empurrar para revisão manual por segurança.
  APTO: 0.96,
  ALERTA: 0.91,
  LGPD_PENDENTE: 0.88,
  BAIXA_CONFIANCA: 0.61
}

export const visitorsService = {
  list: async () => delay(dbService.getDb().visitors),
  findByDocument: async (document: string) => {
    const cleaned = document.replace(/\D/g, '')
    const visitor = dbService
      .getDb()
      .visitors.find((item) => [item.document, item.cpf].some((doc) => doc.replace(/\D/g, '') === cleaned))
    return delay(visitor)
  },
  getLatestDailyPhoto: (visitorId: string) => {
    // A última foto do dia ajuda auditoria e dá contexto histórico para a validação atual.
    const today = new Date().toDateString()
    const records = dbService
      .getDb()
      .dailyPhotos.filter((photo) => photo.visitorId === visitorId)
      .sort((a, b) => +new Date(b.capturedAt) - +new Date(a.capturedAt))

    return {
      latest: records[0],
      hasPhotoToday: records.some((record) => new Date(record.capturedAt).toDateString() === today)
    }
  },
  recognizeByFace: async (scenario: PortariaScenario, capturedPhotoUrl: string, currentFarmId?: string): Promise<RecognitionResult> => {
    // Simula reconhecimento a partir da captura e devolve visitante + score + estado da portaria.
    // Quando virar integração real, esse ponto vira uma fronteira importante do sistema.
    const db = dbService.getDb()

    if (scenario === 'NAO_ENCONTRADO') {
      return delay({
        flowState: 'NAO_ENCONTRADO',
        score: 0.22,
        suggestedManualReview: true,
        reason: 'Visitante não identificado na base facial. Siga para busca manual por CPF/documento.'
      })
    }

    const visitor = db.visitors.find((item) => item.id === scenarioVisitorMap[scenario])
    const lgpdConsent = db.lgpdConsents.find((item) => item.visitorId === visitor?.id)
    const { latest } = visitorsService.getLatestDailyPhoto(visitor?.id || '')

    // Além dos cenários fixos, aplicamos regra por perfil operacional para simular decisão real na portaria.
    const score = scenarioScoreMap[scenario]
    const decisionContext = buildRecognitionDecision({ visitor, score, lgpdAccepted: lgpdConsent?.accepted, currentFarmId })

    return delay({
      flowState: decisionContext.flowState,
      visitor,
      score,
      lgpdConsent,
      dailyPhoto: latest,
      suggestedManualReview: decisionContext.suggestedManualReview,
      profileHint: decisionContext.profileHint,
      reason: decisionContext.reason || `Visitante identificado na foto capturada agora.`
    })
  }
}

function buildRecognitionDecision({
  visitor,
  score,
  lgpdAccepted,
  currentFarmId
}: {
  visitor?: Visitor
  score: number
  lgpdAccepted?: boolean
  currentFarmId?: string
}) {
  // LGPD, confiança facial e status sanitário mexem diretamente no flowState retornado.
  // Separar esses caminhos evita decisão automática incoerente (ex.: tratar alerta igual caso apto).
  const lgpdInvalid = !lgpdAccepted
  const lowConfidence = score < 0.75
  const hasSanitaryAlert = visitor?.id === 'v1'

  if (lgpdInvalid) {
    return {
      flowState: 'LGPD_PENDENTE' as const,
      suggestedManualReview: true,
      reason: 'Consentimento LGPD pendente. Biometria automática bloqueada até revisão manual.',
      profileHint: 'Sem LGPD válido, o operador precisa confirmar documento e registrar justificativa.'
    }
  }

  if (lowConfidence) {
    return {
      flowState: 'RECONHECIDO_BAIXA' as const,
      suggestedManualReview: true,
      reason: 'Reconhecimento facial com confiança baixa. Revisão manual recomendada antes da liberação.',
      profileHint: 'Confiança baixa: compare CPF, crachá e foto de cadastro antes da decisão final.'
    }
  }

  if (hasSanitaryAlert) {
    return {
      flowState: 'ALERTA_SANITARIO' as const,
      suggestedManualReview: true,
      reason: 'Alerta sanitário encontrado na janela de 48h.',
      profileHint: 'Alerta sanitário: só libere com justificativa ou encaminhe para revisão manual.'
    }
  }

  if (visitor?.accessProfile === 'TRABALHADOR_DIARIO') {
    const atHomeFarm = visitor.homeFarmId && currentFarmId && visitor.homeFarmId === currentFarmId
    if (atHomeFarm) {
      return {
        flowState: 'RECONHECIDO_ALTA' as const,
        suggestedManualReview: false,
        reason: 'Trabalhador diário na granja base. Fluxo simplificado disponível.',
        profileHint: 'Perfil diário na própria granja: operação tende a ser mais rápida quando está tudo regular.'
      }
    }

    return {
      flowState: 'RECONHECIDO_BAIXA' as const,
      suggestedManualReview: true,
      reason: 'Trabalhador diário tentando acesso fora da granja base. Validar motivo operacional.',
      profileHint: 'Fora da granja base pede checagem extra e, se necessário, aprovação de gestão.'
    }
  }

  if (visitor?.accessProfile === 'PRESTADOR_SERVICO') {
    return {
      flowState: 'RECONHECIDO_ALTA' as const,
      suggestedManualReview: false,
      reason: 'Prestador de serviço identificado. Confira empresa, função e status sanitário.',
      profileHint: 'Prestador de serviço: validar empresa contratada, função e risco sanitário do dia.'
    }
  }

  if (visitor?.accessProfile === 'VISITANTE') {
    return {
      flowState: visitor.requiresEscort ? ('REVISAO_MANUAL' as const) : ('RECONHECIDO_ALTA' as const),
      suggestedManualReview: Boolean(visitor.requiresEscort),
      reason: visitor.requiresEscort
        ? 'Visitante externo com exigência de escolta. Encaminhe para revisão manual.'
        : 'Visitante identificado. Conferir motivo da visita e nível hierárquico.',
      profileHint: 'Visitante externo pede atenção em autorização, nível hierárquico e necessidade de acompanhamento.'
    }
  }

  return { flowState: 'RECONHECIDO_ALTA' as const, suggestedManualReview: false, reason: '' }
}
