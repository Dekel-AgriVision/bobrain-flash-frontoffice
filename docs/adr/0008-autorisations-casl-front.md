# ADR-0008 — Autorisations côté front avec CASL

- **Statut** : Accepté
- **Date** : 2026-10-06
- **Projet** : Brain Flash — backoffice v2

## Contexte

L'API renvoie au login la liste des règles CASL de l'utilisateur (`abilities`) et applique elle-même les contrôles (`throwUnlessCan`). Le front doit masquer les menus, boutons et listes non autorisés. `@casl/react` n'est pas compatible avec React 19.

## Décision

- `@casl/ability` (`createMongoAbility`) construit l'*ability* à partir des règles stockées dans la session.
- `AbilityProvider`, `useAbility()` et `<Can I a>` sont écrits dans le projet (`components/common/ability.tsx`).
- Le menu (`components/layout/nav.ts`) filtre chaque entrée selon `subject` + `action` (lecture par défaut).
- `ListLayout` accepte `action` (lecture par défaut) : sans le droit, la liste est remplacée par « Accès refusé ». La création demande le droit `create`, la modification le droit `edit`.
- Constantes partagées : `Subject`, `SubjectAction`, `SUBJECT_LABELS`, `ACTIONS` (`lib/constants.ts`).

## Conséquences

- Le front reflète exactement les droits calculés par l'API.
- Le contrôle front n'est qu'un confort d'affichage : **la sécurité reste assurée par l'API**.
- Après un changement de rôle, l'utilisateur doit se reconnecter pour recharger ses règles.

## Alternatives écartées

- `@casl/react` : incompatible React 19.
- Contrôles « en dur » par nom de rôle : non maintenable.
