import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

const WS_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

interface NotificationHandlers {
  onTransactionCompleted?: (data: { message: string; amount: number }) => void
  onTransactionFailed?: (data: { message: string; reason: string }) => void
  onBalanceUpdated?: (data: { message: string; accountId: string; newBalance: number }) => void
}

export function useSocket(handlers: NotificationHandlers) {
  const socketRef = useRef<Socket | null>(null)

  const connect = useCallback(() => {
    const user = localStorage.getItem('user')
    if (!user) return

    const { id: userId } = JSON.parse(user)

    socketRef.current = io(WS_URL, {
      transports: ['websocket'],
    })

    socketRef.current.on('connect', () => {
      console.log('WebSocket connected')
      socketRef.current?.emit('join', userId)
    })

    socketRef.current.on('joined', (data) => {
      console.log('Joined room:', data.message)
    })

    socketRef.current.on('transaction.completed', (data) => {
      handlers.onTransactionCompleted?.(data)
    })

    socketRef.current.on('transaction.failed', (data) => {
      handlers.onTransactionFailed?.(data)
    })

    socketRef.current.on('balance.updated', (data) => {
      handlers.onBalanceUpdated?.(data)
    })

    socketRef.current.on('disconnect', () => {
      console.log('WebSocket disconnected')
    })
  }, [])

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect()
    socketRef.current = null
  }, [])

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [])

  return { socket: socketRef.current }
}
