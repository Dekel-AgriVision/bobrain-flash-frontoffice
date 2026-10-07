# ADR-0016 — Rafraîchissement automatique du token pour un utilisateur actif

- **Statut** : Accepté
- **Date** : 2026-10-06
- **Projet** : Brain Flash — backoffice v2

## Contexte

Quand le JWT de l'API expirait, la requête suivante renvoyait 401 et l'utilisateur était renvoyé vers la page de connexion, même s'il était en train de travailler (saisie d'un formulaire, supervision ouverte). À l'inverse, une session laissée ouverte sur un poste inoccupé ne doit pas rester valide indéfiniment.

## Décision

Politique de session (valeurs par défaut, réglables) :

| Élément | Valeur | Réglage |
| --- | --- | --- |
| Durée du token API | 30 min | API : `APP_JWT_SESSION_EXPIRES_IN=1800` (secondes) |
| Renouvellement du token | toutes les 20 min si l'utilisateur est actif | front : `NEXT_PUBLIC_SESSION_REFRESH_MINUTES=20` |
| Inactivité avant retour à la connexion | 10 min | front : `NEXT_PUBLIC_SESSION_IDLE_MINUTES=10` ; API : `APP_JWT_INACTIVE_SESSION_TTL=600000` (ms) |

- Le front suit l'**activité** (souris, clavier, molette, défilement, tactile) dans `hooks/use-session-keepalive.ts`, partagée entre onglets via `localStorage`.
- **Renouvellement** : quand le token a 20 min (ou qu'il lui reste moins de 2 min) et que l'utilisateur est actif, le front appelle `POST auth/refresh` (ADR-0017 de l'API). Garde-fous : un seul appel à la fois, pas plus d'un appel par tiers de durée de vie du token.
- **Inactivité** : après 9 min sans interaction, un avertissement s'affiche ; à 10 min, la session API est fermée (`auth/logout`) et l'utilisateur revient sur `/login?idle=1`.
- **Sur 401** : le client HTTP tente un renouvellement puis rejoue la requête une fois ; sinon déconnexion.
- Le nouveau token est enregistré dans la session next-auth (`update({ apiToken, session, abilities })`) et dans le client HTTP. Le cookie next-auth dure 7 jours ; la durée réelle est pilotée par l'API.

## Conséquences

- Un utilisateur actif n'est plus déconnecté à l'expiration du token.
- Un poste inactif 10 minutes revient à la page de connexion, même si un écran (supervision) continue d'interroger l'API en arrière-plan.
- La connexion Socket.IO est rouverte avec le nouveau token après chaque rafraîchissement.
- Nécessite l'endpoint `POST /auth/refresh` de l'API.

## Alternatives écartées

- Token très long sans rafraîchissement : une session abandonnée resterait valide.
- Refresh token séparé stocké côté navigateur : plus de complexité ; la session en base de l'API remplit déjà ce rôle.
