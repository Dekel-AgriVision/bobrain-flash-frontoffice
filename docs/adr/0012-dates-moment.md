# ADR-0012 — Gestion des dates avec moment (locale fr)

- **Statut** : Accepté
- **Date** : 2026-10-06
- **Projet** : Brain Flash — backoffice v2

## Contexte

Les dates arrivent sous plusieurs formes : ISO (`createdAt`), horodatages en secondes ou millisecondes (`timestamp` des flashs). L'affichage doit être en français et homogène.

## Décision

- **moment** avec la locale `fr`, centralisé dans `lib/format.ts` (`formatDateTime`, `formatCalendar`, `formatFromNow`, `formatDuration`, `toApiStartOfDay` / `toApiEndOfDay`).
- Un horodatage numérique inférieur à 10¹² est considéré en secondes et converti en millisecondes.
- La date d'un flash est son `timestamp` s'il existe, sinon `updatedAt` / `createdAt` (`flashDate`).

## Conséquences

- Formats homogènes dans toute l'application.
- moment est en maintenance (pas de nouvelles fonctionnalités) et plus lourd que day.js ; choix fait à la demande, cohérent avec la v1.

## Alternatives écartées

- day.js (utilisé par l'API) ou date-fns : plus légers, à envisager si le poids du bundle devient un sujet.
