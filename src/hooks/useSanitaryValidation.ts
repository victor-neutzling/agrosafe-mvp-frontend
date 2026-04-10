import type { Visitor } from '@/types/models'

// Hook para centralizar regra sanitária reaproveitada na portaria.
// A ideia é evitar espalhar regra de janela entre página e service.
interface SanitaryValidationResult {
  status: 'ALERTA' | 'LIBERADO' | 'NAO_ENCONTRADO'
  hours: number
  needsJustification: boolean
  latest?: Visitor['lastVisits'][number]
}

export function useSanitaryValidation(visitor?: Visitor, currentFarmId?: string): SanitaryValidationResult {
  // A leitura parte da última visita registrada e muda conforme granja atual x granja anterior.
  // Mesmo visitante na mesma granja não entra na mesma regra de troca entre granjas.
  if (!visitor) return { status: 'NAO_ENCONTRADO', hours: 0, needsJustification: false }
  const latest = visitor.lastVisits[0]
  if (!latest) return { status: 'LIBERADO', hours: 0, needsJustification: false }
  const hours = (Date.now() - new Date(latest.timestamp).getTime()) / 3600000
  const alert = latest.farmId !== currentFarmId && hours < 48
  // Se a janela de 48h mudar, revisar esse hook junto com PortariaPage e services de decisão/auditoria.
  return { status: alert ? 'ALERTA' : 'LIBERADO', hours: Math.floor(hours), needsJustification: alert, latest }
}
