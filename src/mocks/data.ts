import type { AccessRecord, Company, DailyPhotoRecord, Farm, LgpdConsent, MockDb, ResponsiblePerson, SanitaryViolation, User, Vehicle, Visitor } from '@/types/models'

// Massa de dados fake do sistema.
// A ideia é manter coerência entre visitantes, histórico, LGPD, violações e fotos para a demo fazer sentido.
const now = Date.now()

const companies: Company[] = [
  { id: 'c1', cnpj: '12.345.678/0001-90', legalName: 'Agro Sul Alimentos LTDA', tradeName: 'Agro Sul', email: 'contato@agrosul.com.br', phone: '(41) 98888-1111', address: 'Rua das Granjas, 50 - Cascavel/PR' },
  { id: 'c2', cnpj: '88.221.334/0001-44', legalName: 'Frango Forte Insumos LTDA', tradeName: 'Frango Forte', email: 'operacao@frangoforte.com.br', phone: '(45) 99888-3131', address: 'Av. Paraná, 810 - Toledo/PR' },
  { id: 'c3', cnpj: '54.887.120/0001-66', legalName: 'BioSeg Consultoria Sanitária SA', tradeName: 'BioSeg', email: 'suporte@bioseg.com.br', phone: '(11) 99771-0000', address: 'Rua Tuiuti, 1450 - Curitiba/PR' }
]

const farms: Farm[] = [
  { id: 'f1', name: 'Granja Primavera', code: 'GRA-001', location: 'Cascavel/PR', address: 'BR-277 km 12', status: 'ATIVA' },
  { id: 'f2', name: 'Granja Boa Vista', code: 'GRA-002', location: 'Toledo/PR', address: 'PR-239 km 3', status: 'ATIVA' },
  { id: 'f3', name: 'Granja Santa Luzia', code: 'GRA-003', location: 'Marechal Cândido Rondon/PR', address: 'PR-495 km 9', status: 'ATIVA' }
]

const visitors: Visitor[] = [
  // Aqui a gente mistura perfis diferentes para cobrir cenários reais de operação na portaria.
  {
    id: 'v1',
    fullName: 'Carlos Eduardo Silva',
    document: '123.456.789-10',
    cpf: '123.456.789-10',
    photoUrl: 'https://i.pravatar.cc/300?img=12',
    registrationPhotoUrl: 'https://i.pravatar.cc/300?img=12',
    birthDate: '1988-01-03',
    gender: 'M',
    phone: '(45) 99911-2233',
    email: 'carlos@agrosul.com.br',
    profession: 'Tratador avícola',
    jobTitle: 'Tratador líder de aviário',
    department: 'Produção',
    accessProfile: 'TRABALHADOR_DIARIO',
    hierarchyLevel: 'OPERACIONAL',
    homeFarmId: 'f1',
    allowedFarmIds: ['f1'],
    badgeCode: 'CRCH-1001',
    requiresEscort: false,
    sanitaryRiskLevel: 'MEDIO',
    active: true,
    zipCode: '85800-000',
    companyId: 'c1',
    lastVisits: []
  },
  {
    id: 'v2',
    fullName: 'Marina Costa',
    document: '987.654.321-00',
    cpf: '987.654.321-00',
    photoUrl: 'https://i.pravatar.cc/300?img=32',
    registrationPhotoUrl: 'https://i.pravatar.cc/300?img=32',
    birthDate: '1992-02-13',
    gender: 'F',
    phone: '(45) 99977-0033',
    email: 'marina@frangoforte.com.br',
    profession: 'Médica veterinária',
    jobTitle: 'Veterinária de campo',
    department: 'Sanidade Animal',
    accessProfile: 'PRESTADOR_SERVICO',
    hierarchyLevel: 'TECNICO',
    allowedFarmIds: ['f1', 'f2'],
    badgeCode: 'SERV-2201',
    requiresEscort: false,
    sanitaryRiskLevel: 'ALTO',
    active: true,
    zipCode: '85900-000',
    companyId: 'c2',
    lastVisits: []
  },
  {
    id: 'v3',
    fullName: 'João Pedro Nunes',
    document: '321.654.987-44',
    cpf: '321.654.987-44',
    photoUrl: 'https://i.pravatar.cc/300?img=22',
    registrationPhotoUrl: 'https://i.pravatar.cc/300?img=22',
    birthDate: '1985-05-21',
    gender: 'M',
    phone: '(45) 99881-7722',
    email: 'joao.nunes@bioseg.com.br',
    profession: 'Técnico de manutenção',
    jobTitle: 'Especialista em manutenção de climatização',
    department: 'Infraestrutura',
    accessProfile: 'PRESTADOR_SERVICO',
    hierarchyLevel: 'TECNICO',
    allowedFarmIds: ['f1', 'f3'],
    badgeCode: 'SERV-2202',
    requiresEscort: true,
    sanitaryRiskLevel: 'MEDIO',
    active: true,
    zipCode: '85760-000',
    companyId: 'c3',
    lastVisits: []
  },
  {
    id: 'v4',
    fullName: 'Patrícia Almeida',
    document: '741.852.963-99',
    cpf: '741.852.963-99',
    photoUrl: 'https://i.pravatar.cc/300?img=45',
    registrationPhotoUrl: 'https://i.pravatar.cc/300?img=45',
    birthDate: '1991-11-07',
    gender: 'F',
    phone: '(41) 99713-5522',
    email: 'patricia@bioseg.com.br',
    profession: 'Auditora sanitária',
    jobTitle: 'Auditora de biosseguridade cooperativa',
    department: 'Auditoria',
    accessProfile: 'VISITANTE',
    hierarchyLevel: 'AUDITORIA',
    allowedFarmIds: ['f1', 'f2', 'f3'],
    badgeCode: 'AUD-501',
    requiresEscort: true,
    sanitaryRiskLevel: 'BAIXO',
    active: true,
    zipCode: '80000-000',
    companyId: 'c3',
    lastVisits: []
  },
  {
    id: 'v5',
    fullName: 'Rafael Martins',
    document: '159.753.468-20',
    cpf: '159.753.468-20',
    photoUrl: 'https://i.pravatar.cc/300?img=52',
    registrationPhotoUrl: 'https://i.pravatar.cc/300?img=52',
    birthDate: '1980-08-14',
    gender: 'M',
    phone: '(45) 99955-6677',
    email: 'rafael.fiscal@gov.pr.br',
    profession: 'Fiscal agropecuário',
    jobTitle: 'Fiscal estadual de defesa sanitária',
    department: 'Fiscalização Oficial',
    accessProfile: 'VISITANTE',
    hierarchyLevel: 'AUTORIDADE',
    allowedFarmIds: ['f1', 'f2'],
    badgeCode: 'FISC-PR-88',
    requiresEscort: true,
    sanitaryRiskLevel: 'BAIXO',
    active: true,
    zipCode: '85812-220',
    companyId: 'c2',
    lastVisits: []
  }
]

const responsibles: ResponsiblePerson[] = [
  { id: 'rp1', fullName: 'Ana Luiza Prado', cpf: '653.111.222-33', gender: 'F', phone: '(45) 99990-1111', email: 'ana.prado@agrosul.com.br', birthDate: '1987-03-17' },
  { id: 'rp2', fullName: 'Fernando Tavares', cpf: '470.222.555-80', gender: 'M', phone: '(45) 99903-2299', email: 'fernando@frangoforte.com.br', birthDate: '1984-10-09' }
]

const vehicles: Vehicle[] = [
  { id: 've1', plate: 'ABC1D23', model: 'Fiat Strada', type: 'Utilitário', visitorId: 'v1', companyId: 'c1' },
  { id: 've2', plate: 'RHU9A81', model: 'Toyota Hilux', type: 'Pickup', visitorId: 'v2', companyId: 'c2' },
  { id: 've3', plate: 'JQR5P77', model: 'VW Gol', type: 'Passeio', visitorId: 'v3', companyId: 'c3' }
]

const users: User[] = [
  { id: 'u1', name: 'Ana Operadora', email: 'ana@granja.com', role: 'OPERADOR', status: 'ATIVO' },
  { id: 'u2', name: 'Bruno Admin', email: 'admin@granja.com', role: 'ADMIN', status: 'ATIVO' },
  { id: 'u3', name: 'Carla Gestora', email: 'gestor@granja.com', role: 'GESTOR', status: 'ATIVO' }
]

const buildAccessRecords = (): AccessRecord[] => {
  const records: AccessRecord[] = []
  for (let i = 0; i < 36; i++) {
    const visitor = visitors[i % visitors.length]
    const farm = farms[i % farms.length]
    const previousFarm = farms[(i + 1) % farms.length]
    const hoursAgo = i < 8 ? i * 2 : i * 8
    const dt = new Date(now - hoursAgo * 3600_000).toISOString()
    const status: AccessRecord['sanitaryStatus'] = i % 7 === 0 ? 'ALERTA' : 'LIBERADO'
    const decision: AccessRecord['decision'] = status === 'ALERTA' ? (i % 2 === 0 ? 'BLOQUEADO' : 'LIBERADO_COM_JUSTIFICATIVA') : 'LIBERADO'
    records.push({
      id: `a${i + 1}`,
      datetime: dt,
      visitorId: visitor.id,
      visitorName: visitor.fullName,
      document: visitor.document,
      farmId: farm.id,
      farmName: farm.name,
      previousFarmId: previousFarm.id,
      previousFarmName: previousFarm.name,
      operator: 'Ana Operadora',
      sanitaryStatus: status,
      decision,
      decisionJustification: decision === 'LIBERADO_COM_JUSTIFICATIVA' ? 'Entrada autorizada com higienização reforçada e troca de EPIs.' : undefined,
      vehicle: vehicles.find((vehicle) => vehicle.visitorId === visitor.id)?.plate,
      capturedPhotoUrl: visitor.photoUrl,
      captureDatetime: dt,
      confidenceScore: status === 'ALERTA' ? 0.79 : 0.93,
      manualReview: status === 'ALERTA' && i % 2 !== 0,
      lgpdStatus: visitor.id === 'v4' ? 'PENDENTE' : 'VALIDO'
    })
  }
  return records.sort((a, b) => +new Date(b.datetime) - +new Date(a.datetime))
}

const accessRecords = buildAccessRecords()

// Aqui a gente força alguns cenários para a portaria ficar crível em demo.
const dailyPhotos: DailyPhotoRecord[] = [
  // A foto de cadastro e a foto capturada usam referência compatível da mesma pessoa.
  // Se faltar imagem coerente no futuro, vale preferir placeholder a trocar por alguém aleatório.
  {
    id: 'd1',
    visitorId: 'v2',
    capturedAt: new Date(now - 2 * 3600_000).toISOString(),
    photoUrl: 'https://i.pravatar.cc/300?img=32',
    confidenceScore: 0.95,
    operator: 'Ana Operadora',
    manualReview: false,
    finalDecision: 'LIBERADO'
  },
  {
    id: 'd2',
    visitorId: 'v1',
    capturedAt: new Date(now - 4 * 3600_000).toISOString(),
    photoUrl: 'https://i.pravatar.cc/300?img=12&u=daily-v1',
    confidenceScore: 0.81,
    operator: 'Ana Operadora',
    manualReview: true,
    finalDecision: 'LIBERADO_COM_JUSTIFICATIVA'
  },
  {
    id: 'd3',
    visitorId: 'v3',
    capturedAt: new Date(now - 26 * 3600_000).toISOString(),
    photoUrl: 'https://i.pravatar.cc/300?img=22&u=daily-v3',
    confidenceScore: 0.66,
    operator: 'Ana Operadora',
    manualReview: true,
    finalDecision: 'REVISAO_MANUAL'
  }
]

const violations: SanitaryViolation[] = accessRecords
  .filter((record) => record.sanitaryStatus === 'ALERTA')
  .map((record, index) => ({
    id: `s${index + 1}`,
    recordId: record.id,
    visitorId: record.visitorId,
    visitorName: record.visitorName,
    previousFarm: record.previousFarmName || 'N/A',
    currentFarm: record.farmName,
    attemptAt: record.datetime,
    intervalHours: 12 + index * 2,
    operatorDecision: record.decision === 'BLOQUEADO' ? 'BLOQUEADO' : 'LIBERADO_COM_JUSTIFICATIVA',
    justification: record.decisionJustification,
    reason: 'Intervalo mínimo de vazio sanitário (48h) não cumprido.',
    finalStatus: record.decision === 'BLOQUEADO' ? 'BLOQUEADO' : 'LIBERADO_COM_RESTRICAO'
  }))

const lgpdConsents: LgpdConsent[] = visitors.map((visitor, index) => ({
  id: `lgpd-${visitor.id}`,
  visitorId: visitor.id,
  accepted: index !== 3,
  acceptedAt: new Date(now - (index + 1) * 24 * 3600_000).toISOString(),
  version: index === 3 ? 'v2.0' : 'v2.1',
  purpose: 'Controle de acesso, rastreabilidade sanitária e prevenção de riscos biológicos.'
}))

const hydratedVisitors = visitors.map((visitor) => ({
  ...visitor,
  lastVisits: accessRecords
    .filter((record) => record.visitorId === visitor.id)
    .slice(0, 3)
    .map((record) => ({ farmId: record.farmId, farmName: record.farmName, timestamp: record.datetime }))
}))

export const seedDb: MockDb = {
  users,
  companies,
  responsibles,
  farms,
  visitors: hydratedVisitors,
  vehicles,
  accessRecords,
  violations,
  lgpdConsents,
  dailyPhotos,
  currentFarmId: 'f1'
}
