# ADR-0015 — Configuration et déploiement

- **Statut** : Accepté
- **Date** : 2026-10-06
- **Projet** : Brain Flash — backoffice v2

## Contexte

Le front doit tourner en développement sur le poste (API sur `127.0.0.1:3336`) et être déployable sur un serveur, éventuellement en conteneur.

## Décision

- Configuration par variables d'environnement (`.env.example` fourni) : `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `API_ORIGIN`, `NEXT_PUBLIC_API_PREFIX`, `NEXT_PUBLIC_SOCKET_URL`.
- `npm run build && npm start` par défaut ; sortie autonome optionnelle avec `NEXT_OUTPUT=standalone` (copier `public/` et `.next/static/` dans `.next/standalone/`).
- Contrôles avant livraison : `npm run typecheck`, `npm run lint`, `npm run build`.
- Le `.env` n'est jamais versionné.

## Conséquences

- Un même code pour le développement et la production.
- `API_ORIGIN` et les variables `NEXT_PUBLIC_*` sont figées au build : une image par environnement.

## Alternatives écartées

- Sortie *standalone* systématique : `next start` ne fonctionne plus, gênant en développement.
