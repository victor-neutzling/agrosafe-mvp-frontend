import { delay } from './mockApi'
import { dbService } from './mockDb'

export const farmService = {
  getAll: async () => delay(dbService.getDb().farms),
  getCurrent: async () => {
    const db = dbService.getDb()
    return delay(db.farms.find((farm) => farm.id === db.currentFarmId))
  }
}
