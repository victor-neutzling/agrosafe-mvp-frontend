import { dbService } from './mockDb'
import { delay } from './mockApi'
import type { AccessRecord, DailyPhotoRecord, SanitaryViolation } from '@/types/models'

// Esse service registra o desfecho da validação da portaria.
// Ele monta a trilha mockada de auditoria que depois alimenta histórico, dashboard e violações.
interface DecisionPayload {
  visitorId?: string
  action: AccessRecord['decision']
  justification?: string
  sanitaryStatus: AccessRecord['sanitaryStatus']
  reason?: string
  capturedPhotoUrl?: string
  confidenceScore?: number
  manualReview?: boolean
  lgpdStatus?: AccessRecord['lgpdStatus']
}

export const accessService = {
  getRecords: async () => delay(dbService.getDb().accessRecords),
  getViolations: async () => delay(dbService.getDb().violations),
  registerDecision: async (payload: DecisionPayload) => {
    // Função central do registro final: junta decisão, justificativa, operador e contexto sanitário.
    // Mudança aqui costuma respingar em relatório, histórico e auditoria.
    const updated = dbService.updateDb((db) => {
      const visitor = db.visitors.find((item) => item.id === payload.visitorId)
      const farm = db.farms.find((item) => item.id === db.currentFarmId)
      const previousVisit = visitor?.lastVisits[0]
      const captureDatetime = new Date().toISOString()

      // Esse objeto é o registro principal de acesso e precisa ficar coerente com as outras telas.
      const record: AccessRecord = {
        id: `a${Date.now()}`,
        datetime: captureDatetime,
        visitorId: visitor?.id || 'nao-encontrado',
        visitorName: visitor?.fullName || 'Visitante não identificado',
        document: visitor?.cpf || visitor?.document || '-',
        farmId: farm?.id || 'N/A',
        farmName: farm?.name || 'N/A',
        previousFarmId: previousVisit?.farmId,
        previousFarmName: previousVisit?.farmName,
        operator: 'Ana Operadora',
        sanitaryStatus: payload.sanitaryStatus,
        decision: payload.action,
        decisionJustification: payload.justification,
        vehicle: db.vehicles.find((vehicle) => vehicle.visitorId === visitor?.id)?.plate,
        capturedPhotoUrl: payload.capturedPhotoUrl,
        captureDatetime,
        confidenceScore: payload.confidenceScore,
        manualReview: payload.manualReview,
        lgpdStatus: payload.lgpdStatus
      }

      const visitors = db.visitors.map((item) =>
        item.id === visitor?.id
          ? {
              ...item,
              lastVisits: [{ farmId: record.farmId, farmName: record.farmName, timestamp: record.datetime }, ...item.lastVisits].slice(0, 5)
            }
          : item
      )

      // A foto do dia fica separada para manter vínculo claro entre decisão e imagem capturada.
      const shouldRegisterDailyPhoto = Boolean(visitor?.id && payload.capturedPhotoUrl)
      const dailyPhoto: DailyPhotoRecord | undefined = shouldRegisterDailyPhoto
        ? {
            id: `d${Date.now()}`,
            visitorId: visitor!.id,
            capturedAt: captureDatetime,
            photoUrl: payload.capturedPhotoUrl!,
            confidenceScore: payload.confidenceScore ?? 0,
            operator: 'Ana Operadora',
            manualReview: Boolean(payload.manualReview),
            finalDecision: payload.action
          }
        : undefined

      const violations = createUpdatedViolations({ dbViolations: db.violations, payload, record })

      return {
        ...db,
        visitors,
        accessRecords: [record, ...db.accessRecords],
        violations,
        dailyPhotos: dailyPhoto ? [dailyPhoto, ...db.dailyPhotos] : db.dailyPhotos
      }
    })

    return delay(updated.accessRecords[0])
  }
}

function createUpdatedViolations({
  dbViolations,
  payload,
  record
}: {
  dbViolations: SanitaryViolation[]
  payload: DecisionPayload
  record: AccessRecord
}) {
  // Violação não nasce em qualquer cenário: só entra quando o contexto sanitário realmente exige.
  // Esse ponto precisa continuar alinhado com regra de UI e mensagem operacional.
  if (payload.sanitaryStatus !== 'ALERTA') return dbViolations

  const violation: SanitaryViolation = {
    id: `s${Date.now()}`,
    recordId: record.id,
    visitorId: record.visitorId,
    visitorName: record.visitorName,
    previousFarm: record.previousFarmName || 'N/A',
    currentFarm: record.farmName,
    attemptAt: record.datetime,
    intervalHours: 24,
    operatorDecision: payload.action === 'BLOQUEADO' ? 'BLOQUEADO' : 'LIBERADO_COM_JUSTIFICATIVA',
    justification: payload.justification,
    reason: payload.reason || 'Intervalo sanitário inferior a 48 horas.',
    finalStatus: payload.action === 'BLOQUEADO' ? 'BLOQUEADO' : 'LIBERADO_COM_RESTRICAO'
  }

  return [violation, ...dbViolations]
}
