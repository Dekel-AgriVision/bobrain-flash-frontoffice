# ADR-0014 — Organisation du code par fonctionnalité

- **Statut** : Accepté
- **Date** : 2026-10-06
- **Projet** : Brain Flash — backoffice v2

## Contexte

La v1 dispersait chaque module entre `pages/`, `views/`, `redux/actions`, `redux/reducers` et `myservices/`, ce qui rendait une modification simple coûteuse.

## Décision

```
src/
  app/                 routes (pages fines)
  features/<module>/   vues du module : *-list-view, *-form-view, détail
  features/shared/     FormLayout, ListLayout, champs react-hook-form
  components/ui/       primitives shadcn/ui
  components/common/   briques transverses
  components/layout/   sidebar, en-tête, menu
  hooks/               useListState, usePaginated, useMutationToast, useFlashSocket…
  lib/                 api, auth, acl, socket, services, types, format, constants
```
Un nouveau module CRUD suit le modèle des stations : liste (`ListLayout` + `DataTable`), formulaire (`FormLayout` + zod), pages `/<module>`, `/<module>/new`, `/<module>/[id]`.

## Conséquences

- Un module se lit et se modifie dans un seul dossier.
- Les écrans ont tous le même comportement (filtres, pagination, toasts, confirmation de suppression).

## Alternatives écartées

- Découpage par type technique (v1) : modifications éparpillées.
