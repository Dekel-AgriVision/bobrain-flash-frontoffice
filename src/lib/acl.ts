import { createMongoAbility, type MongoAbility } from '@casl/ability'
import type { AbilityRule } from './types'

export type AppAbility = MongoAbility

/** L'API emploie « edit » là où CASL emploie souvent « update » : on accepte les deux */
export const buildAbility = (rules: AbilityRule[] = []): AppAbility =>
  createMongoAbility(
    rules.flatMap(r => {
      const actions = Array.isArray(r.action) ? r.action : [r.action]

      return actions.map(a => ({ ...r, action: a === 'update' ? 'edit' : a })) as any
    })
  )
