'use client'

import { createContext, useContext, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { buildAbility, type AppAbility } from '@/lib/acl'

const AbilityContext = createContext<AppAbility>(buildAbility([]))

export function AbilityProvider({ children }: { children: React.ReactNode }) {
  const { data } = useSession()
  const ability = useMemo(() => buildAbility(data?.abilities ?? []), [data?.abilities])

  return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>
}

export const useAbility = () => useContext(AbilityContext)

/** Affiche les enfants si l'utilisateur a le droit `I` sur `a` */
export function Can({ I, a, children, fallback = null }: { I: string; a: string; children: React.ReactNode; fallback?: React.ReactNode }) {
  const ability = useAbility()

  return <>{ability.can(I, a) ? children : fallback}</>
}
