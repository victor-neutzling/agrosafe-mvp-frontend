import { seedDb } from '@/mocks/data'
import type { AccessRecord, DashboardStats, MockDb, SanitaryViolation } from '@/types/models'

// Base mock/local do MVP para o front funcionar sem backend real.
const STORAGE_KEY = 'frango-access-db-v3'

const readStorage = (): MockDb => {
  // Primeiro acesso hidrata com seed.
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedDb))
    return seedDb
  }

  try {
    return JSON.parse(raw) as MockDb
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedDb))
    return seedDb
  }
}

const writeStorage = (db: MockDb) => {
  // Persistência local facilita demo e testes de fluxo.
  // Se o modelo mudar, vale migrar/limpar storage para não ficar dado inconsistente.
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
}

export const dbService = {
  getDb: () => readStorage(),
  updateDb: (updater: (db: MockDb) => MockDb) => {
    const updated = updater(readStorage())
    writeStorage(updated)
    return updated
  },
  reset: () => writeStorage(seedDb)
}

export const computeDashboardStats = (records: AccessRecord[], violations: SanitaryViolation[]): DashboardStats => {
  const today = new Date().toDateString()
  const entriesToday = records.filter((record) => new Date(record.datetime).toDateString() === today).length
  const entriesPeriod = records.length
  const uniqueVisitors = new Set(records.map((record) => record.visitorId)).size
  const sanitaryViolations = violations.length
  const releasedEntries = records.filter((record) => ['LIBERADO', 'LIBERADO_COM_JUSTIFICATIVA'].includes(record.decision)).length
  const blockedEntries = records.filter((record) => record.decision === 'BLOQUEADO').length

  const accessByDayMap = new Map<string, number>()
  records.slice(0, 7 * 8).forEach((record) => {
    const day = new Date(record.datetime).toLocaleDateString('pt-BR', { weekday: 'short' })
    accessByDayMap.set(day, (accessByDayMap.get(day) || 0) + 1)
  })

  const violationsByWeek = new Map<string, number>()
  violations.forEach((violation) => {
    const date = new Date(violation.attemptAt)
    const week = `${date.getMonth() + 1}/${Math.ceil(date.getDate() / 7)}`
    violationsByWeek.set(week, (violationsByWeek.get(week) || 0) + 1)
  })

  const farmMap = new Map<string, number>()
  records.forEach((record) => farmMap.set(record.farmName, (farmMap.get(record.farmName) || 0) + 1))

  return {
    entriesToday,
    entriesPeriod,
    uniqueVisitors,
    sanitaryViolations,
    releasedEntries,
    blockedEntries,
    accessByDay: [...accessByDayMap.entries()].map(([day, total]) => ({ day, total })),
    violationsByPeriod: [...violationsByWeek.entries()].map(([period, total]) => ({ period, total })),
    farmRanking: [...farmMap.entries()].map(([farm, accesses]) => ({ farm, accesses })).sort((a, b) => b.accesses - a.accesses)
  }
}
