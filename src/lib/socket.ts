import { io, type Socket } from 'socket.io-client'

let socket: Socket | null = null
let currentToken: string | undefined

/** Socket.IO unique (namespace /ws) — le token de session est passé en auth.token au handshake */
export const getSocket = (token: string) => {
  if (socket && currentToken === token) return socket
  socket?.disconnect()
  currentToken = token
  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://127.0.0.1:3336/ws', {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000
  })

  return socket
}

export const closeSocket = () => {
  socket?.disconnect()
  socket = null
  currentToken = undefined
}
