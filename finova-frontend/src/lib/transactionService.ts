import api from './api'

export interface Transaction {
  id: string
  amount: number
  type: 'credit' | 'debit'
  description: string
  createdAt: string
}

export const transactionService = {
  async getAll(): Promise<Transaction[]> {
    const { data } = await api.get<Transaction[]>('/transactions')
    return data
  },

  async getByAccount(accountId: string): Promise<Transaction[]> {
    const { data } = await api.get<Transaction[]>(`/transactions/${accountId}`)
    return data
  },

  async internalTransfer(body: {
    fromAccountId: string
    toAccountId: string
    amount: number
  }) {
    const { data } = await api.post('/transactions/internal', body)
    return data
  },

  async externalTransfer(body: {
    fromAccountId: string
    recipientName: string
    recipientAccount: string
    amount: number
  }) {
    const { data } = await api.post('/transactions/external', body)
    return data
  },
}
