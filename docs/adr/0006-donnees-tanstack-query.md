# ADR-0006 — Accès aux données : TanStack Query et client HTTP maison

- **Statut** : Accepté
- **Date** : 2026-10-06
- **Projet** : Brain Flash — backoffice v2

## Contexte

Toutes les listes de l'API sont paginées (`{ total, per_page, current_page, last_page, data }`) et filtrées selon le format `ApiSearchParamOptions` de la bibliothèque interne `@app/nestjs` : `where` (JSON `[{ value, attribute, type }]`), `relations`, `order_by`, `order`, `page`, `per_page`.

## Décision

- **TanStack Query v5** pour le cache, les rechargements et l'invalidation après mutation (`useMutationToast`). Les listes gardent la page précédente pendant le chargement (`keepPreviousData`).
- Client HTTP minimal `lib/api.ts` (`fetch` + en-tête `x-user-claims`) et générateur `crud()` ; tous les endpoints sont déclarés dans `lib/services/index.ts`.
- `lib/query.ts` construit la query string ; les valeurs vides sont retirées de `where`, `per_page` est plafonné à 500.
- `useListState` centralise filtres, recherche *debouncée*, page et taille de page.
- Les messages d'erreur sont extraits du format du filtre d'exceptions de l'API (`errors`, puis `message` non générique).

## Conséquences

- Un seul endroit à modifier si un endpoint change.
- Pas de code Redux à maintenir.
- Le format `where` est propre à la bibliothèque interne de l'API : tout changement côté API doit être répercuté dans `lib/query.ts`.

## Alternatives écartées

- Redux Toolkit / RTK Query (v1) : plus verbeux.
- SWR : moins complet pour les mutations et l'invalidation.
