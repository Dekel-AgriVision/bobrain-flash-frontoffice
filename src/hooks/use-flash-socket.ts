'use client'

import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { getSocket } from '@/lib/socket'
import { SocketEvent } from '@/lib/constants'
import type { Flash } from '@/lib/types'

export type SocketLogEvent = { event: string; payload: any; at: Date }

type Options = {
  /** `sent_new_flash` : nouveau flash, ou flash mis à jour par le scheduler (passage STALE) */
  onFlash?: (flash: Flash) => void
  /** `start_flash_backend` : l'API (re)démarre */
  onBackendStart?: (payload: any) => void
  /** `create_action` : action créée côté poste */
  onAction?: (payload: any) => void
  /** Reconnexion après coupure : rattraper ce qui a été manqué */
  onReconnect?: () => void
  /** Tous les événements (journal) */
  onAny?: (e: SocketLogEvent) => void
}

/** Abonnement temps réel au namespace /ws de l'API flash */
export function useFlashSocket(options: Options = {}) {
  const { data } = useSession()
  const token = data?.apiToken
  const [connected, setConnected] = useState(false)
  const [lastEventAt, setLastEventAt] = useState<Date | null>(null)
  const ref = useRef(options)
  ref.current = options

  useEffect(() => {
    if (!token) return
    const socket = getSocket(token)
    let connectedOnce = socket.connected

    const log = (event: string, payload: any) => {
      const at = new Date()
      setLastEventAt(at)
      ref.current.onAny?.({ event, payload, at })
    }

    const onConnect = () => {
      setConnected(true)
      if (connectedOnce) ref.current.onReconnect?.()
      connectedOnce = true
      log('connect', null)
    }
    const onDisconnect = (reason: string) => {
      setConnected(false)
      log('disconnect', reason)
    }
    const onConnectError = (err: Error) => log('connect_error', err?.message)
    const onFlash = (payload: any) => {
      const flash = payload?.data ?? payload
      log(SocketEvent.SENT_NEW_FLASH, flash)
      if (flash && typeof flash === 'object') ref.current.onFlash?.(flash)
    }
    const onWeight = (payload: any) => {
      log(SocketEvent.SENT_WEIGHT_DATA, payload)
      if (payload?.status === 'success' && payload?.data) ref.current.onFlash?.(payload.data)
    }
    const onStart = (payload: any) => {
      log(SocketEvent.START_FLASH_BACKEND, payload)
      ref.current.onBackendStart?.(payload)
    }
    const onAction = (payload: any) => {
      log(SocketEvent.CREATE_ACTION, payload?.data ?? payload)
      ref.current.onAction?.(payload?.data ?? payload)
    }

    setConnected(socket.connected)
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('connect_error', onConnectError)
    socket.on(SocketEvent.SENT_NEW_FLASH, onFlash)
    socket.on(SocketEvent.SENT_WEIGHT_DATA, onWeight)
    socket.on(SocketEvent.START_FLASH_BACKEND, onStart)
    socket.on(SocketEvent.CREATE_ACTION, onAction)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('connect_error', onConnectError)
      socket.off(SocketEvent.SENT_NEW_FLASH, onFlash)
      socket.off(SocketEvent.SENT_WEIGHT_DATA, onWeight)
      socket.off(SocketEvent.START_FLASH_BACKEND, onStart)
      socket.off(SocketEvent.CREATE_ACTION, onAction)
    }
  }, [token])

  return { connected, lastEventAt }
}
