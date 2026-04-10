import { delay } from './mockApi'
import { dbService } from './mockDb'

export const authService = {
  login: async (email: string, password: string) => {
    const user = dbService.getDb().users.find((item) => item.email === email)
    if (!user || password.length < 4) throw new Error('Credenciais inválidas')
    return delay({ token: `mock-token-${user.role}`, user })
  }
}
