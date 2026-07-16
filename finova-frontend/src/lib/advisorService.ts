import api from './api'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

export const advisorService = {
  async chat(message: string): Promise<{ reply: string }> {
    const { data } = await api.post<string>('/advisor/chat', { message })
    return data
  },

  async getHistory(): Promise<ChatMessage[]> {
    const { data } = await api.get<ChatMessage[]>('/advisor/history')
    return data
  },

  async clearHistory(): Promise<void> {
    await api.delete('/advisor/history')
  },
}
