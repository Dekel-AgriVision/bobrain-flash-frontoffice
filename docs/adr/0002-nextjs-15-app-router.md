# ADR-0002 — Next.js 15 (App Router), React 19 et TypeScript strict

- **Statut** : Accepté
- **Date** : 2026-10-06
- **Projet** : Brain Flash — backoffice v2

## Contexte

La v1 reprenait le socle du *chatbot-backoffice* : Next 13 *pages router*, MUI (thème Materio), Redux Toolkit, beaucoup de code hérité sans rapport avec la supervision des ponts bascules (chat, exports…). La maintenance était difficile et plusieurs bugs venaient du socle (redirections d'`AuthGuard`, imports sensibles à la casse).

## Décision

Réécriture complète du front sur **Next.js 15 avec l'App Router**, **React 19** et **TypeScript en mode strict**.

- Routes dans `src/app/` ; la zone authentifiée est le groupe `(app)/`, la connexion est `login/`.
- Les pages dynamiques reçoivent `params` sous forme de `Promise` (`await params`), conformément à Next 15.
- Les pages sont de fines enveloppes serveur (métadonnées) qui délèguent l'interface à des composants client de `src/features/`.
- Plus de Redux : l'état serveur est géré par TanStack Query (ADR-0006), l'état local par React.

## Conséquences

- Base moderne, maintenue, plus légère que la v1.
- Typage strict de bout en bout (`npm run typecheck`).
- Certaines bibliothèques n'acceptent pas encore React 19 (ex. `@casl/react`, voir ADR-0008).
- L'ancien dossier BBOBRAINFLASHBACKOFFICE (v1) reste disponible tant que la v2 n'est pas validée.

## Alternatives écartées

- Conserver la v1 et la nettoyer : dette trop importante dans le socle.
- Vite + React Router : perte du rendu serveur, des route handlers et de next-auth.
