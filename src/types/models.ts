// Contratos principais do front.
// Concentrar os tipos aqui ajuda a manter páginas/services falando a mesma língua.
export type Role = 'ADMIN' | 'OPERADOR' | 'GESTOR'

// User é quem opera/administra o sistema.
export interface User {
  id: string
  name: string
  email: string
  role: Role
  status: 'ATIVO' | 'INATIVO'
}

export interface Company {
  id: string
  cnpj: string
  legalName: string
  tradeName: string
  email: string
  phone: string
  address: string
}

export interface ResponsiblePerson {
  id: string
  fullName: string
  cpf: string
  gender: 'M' | 'F' | 'O'
  phone: string
  email: string
  birthDate: string
}

export interface Farm {
  id: string
  name: string
  code: string
  location: string
  address: string
  status: 'ATIVA' | 'INATIVA'
  observations?: string
}

export interface Vehicle {
  id: string
  plate: string
  model: string
  type: string
  companyId?: string
  visitorId?: string
  notes?: string
}

export interface VisitEvent {
  farmId: string
  farmName: string
  timestamp: string
}

export type VisitorAccessProfile = 'TRABALHADOR_DIARIO' | 'PRESTADOR_SERVICO' | 'VISITANTE'

export type VisitorHierarchyLevel = 'OPERACIONAL' | 'TECNICO' | 'SUPERVISAO' | 'AUDITORIA' | 'AUTORIDADE'

export type SanitaryRiskLevel = 'BAIXO' | 'MEDIO' | 'ALTO'

// Visitor é a pessoa que tenta entrar na granja (não confundir com usuário logado).
export interface Visitor {
  id: string
  fullName: string
  document: string
  // Mantemos o campo legado para não quebrar telas antigas; o CPF vira fonte oficial daqui em diante.
  cpf: string
  photoUrl: string
  registrationPhotoUrl?: string
  birthDate: string
  gender: string
  phone: string
  email: string
  profession: string
  // Novo campo mais claro para operação na portaria (cargo/função atual).
  jobTitle: string
  department?: string
  accessProfile: VisitorAccessProfile
  hierarchyLevel: VisitorHierarchyLevel
  homeFarmId?: string
  allowedFarmIds?: string[]
  badgeCode?: string
  requiresEscort?: boolean
  sanitaryRiskLevel: SanitaryRiskLevel
  active: boolean
  zipCode: string
  companyId: string
  lastVisits: VisitEvent[]
}

export interface DailyPhotoRecord {
  // Trilha da imagem capturada no dia para auditoria e rastreio operacional.
  id: string
  visitorId: string
  capturedAt: string
  photoUrl: string
  confidenceScore: number
  operator: string
  manualReview: boolean
  finalDecision: 'LIBERADO' | 'BLOQUEADO' | 'LIBERADO_COM_JUSTIFICATIVA' | 'REVISAO_MANUAL'
}

export interface AccessRecord {
  // Registro final do acesso após decisão da portaria.
  id: string
  datetime: string
  visitorId: string
  visitorName: string
  document: string
  farmId: string
  farmName: string
  previousFarmId?: string
  previousFarmName?: string
  operator: string
  sanitaryStatus: 'LIBERADO' | 'ALERTA' | 'NAO_ENCONTRADO' | 'REVISAO_MANUAL'
  decision: 'LIBERADO' | 'BLOQUEADO' | 'LIBERADO_COM_JUSTIFICATIVA' | 'REVISAO_MANUAL'
  decisionJustification?: string
  vehicle?: string
  capturedPhotoUrl?: string
  captureDatetime?: string
  confidenceScore?: number
  manualReview?: boolean
  lgpdStatus?: 'VALIDO' | 'PENDENTE' | 'NEGADO'
}

export interface SanitaryViolation {
  // Ocorrência sanitária ligada a uma tentativa de acesso específica.
  id: string
  recordId: string
  visitorId: string
  visitorName: string
  previousFarm: string
  currentFarm: string
  attemptAt: string
  intervalHours: number
  operatorDecision: 'BLOQUEADO' | 'LIBERADO_COM_JUSTIFICATIVA'
  justification?: string
  reason: string
  finalStatus: 'BLOQUEADO' | 'LIBERADO_COM_RESTRICAO'
}

export interface LgpdConsent {
  // Consentimento fica separado por ser dado sensível e com ciclo de vida próprio.
  id: string
  visitorId: string
  acceptedAt: string
  accepted: boolean
  version: string
  purpose: string
}

export interface DashboardStats {
  entriesToday: number
  entriesPeriod: number
  uniqueVisitors: number
  sanitaryViolations: number
  releasedEntries: number
  blockedEntries: number
  accessByDay: Array<{ day: string; total: number }>
  violationsByPeriod: Array<{ period: string; total: number }>
  farmRanking: Array<{ farm: string; accesses: number }>
}

export interface MockDb {
  users: User[]
  companies: Company[]
  responsibles: ResponsiblePerson[]
  farms: Farm[]
  visitors: Visitor[]
  vehicles: Vehicle[]
  accessRecords: AccessRecord[]
  violations: SanitaryViolation[]
  lgpdConsents: LgpdConsent[]
  dailyPhotos: DailyPhotoRecord[]
  currentFarmId: string
}
