# ADR-0005 — Appels API en same-origin via les rewrites Next

- **Statut** : Accepté
- **Date** : 2026-10-06
- **Projet** : Brain Flash — backoffice v2

## Contexte

L'API écoute sur `127.0.0.1:3336` avec le préfixe `flash-backend/api/v1`. Appeler directement l'API depuis le navigateur impose une configuration CORS exacte (`APP_CORS_ORIGIN`) et expose l'adresse interne de l'API.

## Décision

Le navigateur appelle `/flash-backend/api/v1/*` **sur l'origine du front** ; `next.config.ts` réécrit ces URL vers `API_ORIGIN` (rewrites). Le login, lui, est fait par le serveur Next directement sur `API_ORIGIN`.

Variables : `API_ORIGIN` (vu par le serveur Next), `NEXT_PUBLIC_API_PREFIX`, `NEXT_PUBLIC_SOCKET_URL`.

## Conséquences

- Plus de problème CORS pour les appels HTTP.
- L'API n'a pas besoin d'être exposée publiquement, seul le front l'est.
- **Les rewrites sont figées au build** : changer `API_ORIGIN` impose de reconstruire (`npm run build`).
- Le Socket.IO n'est pas relayé (ADR-0010).

## Alternatives écartées

- CORS ouvert sur l'API : surface d'attaque plus grande, configuration fragile.
- Route handler proxy écrit à la main : plus de code pour le même résultat.
