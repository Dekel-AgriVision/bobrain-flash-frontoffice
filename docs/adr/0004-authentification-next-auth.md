# ADR-0004 — Authentification par next-auth (Credentials) et session JWT

- **Statut** : Accepté
- **Date** : 2026-10-06
- **Projet** : Brain Flash — backoffice v2

## Contexte

L'API BOBRAINFLASHAPI expose `POST /auth/login` (stratégie *local*) et renvoie `{ token, session, abilities }`. Les requêtes suivantes doivent porter le JWT dans l'en-tête `x-user-claims`. Le front doit protéger toutes ses pages et connaître les droits de l'utilisateur dès le premier rendu.

## Décision

- **next-auth 4** avec le fournisseur *Credentials* : `authorize()` appelle `auth/login` **côté serveur Next**.
- Le JWT next-auth (cookie chiffré) contient le token API, une **session compacte** (utilisateur, rôle, surccusale, surccusale cible) et les règles CASL. Il est mis à jour lors du changement de surccusale (`auth/switch/:branchId`).
- La session est lue côté serveur dans le layout racine (`getServerSession`) et transmise au `SessionProvider` : le token est disponible avant la première requête. Les pages attendent en plus `status === 'authenticated'`.
- Le middleware `withAuth` protège toutes les routes sauf `/login`, `/api/auth/*` et le proxy API.
- Un 401 de l'API **avec** token déconnecte l'utilisateur ; un 401 sans token (session pas encore chargée) est ignoré.
- La clé `NEXTAUTH_SECRET` est lue dans `.env` ; à défaut, une clé de développement est utilisée (`lib/auth-secret.ts`) pour que l'application démarre.

## Conséquences

- Une seule source de vérité de session, côté serveur, sans stockage du token en `localStorage`.
- Le changement de mot de passe ferme la session côté API : le front déconnecte l'utilisateur.
- **En production, `NEXTAUTH_SECRET` doit être défini** ; la clé par défaut n'est acceptable qu'en développement.

## Alternatives écartées

- Stocker le token dans `localStorage` : exposé au XSS, pas disponible au rendu serveur.
- NextAuth v5 (Auth.js) : encore en évolution au moment du choix.
