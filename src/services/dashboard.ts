import { delay } from './mockApi'
import { computeDashboardStats, dbService } from './mockDb'

export const dashboardService = {
  getStats: async () => {
    const db = dbService.getDb()
    return delay(computeDashboardStats(db.accessRecords, db.violations))
  }
}
