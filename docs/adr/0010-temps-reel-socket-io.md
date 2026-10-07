# ADR-0010 — Temps réel par Socket.IO (namespace /ws)

- **Statut** : Accepté
- **Date** : 2026-10-06
- **Projet** : Brain Flash — backoffice v2

## Contexte

L'API diffuse les pesées et événements sur le namespace Socket.IO `/ws` (`sent_new_flash`, `sentWeightData`, `start_flash_backend`, `create_action`). Le *handshake* exige un JWT valide dans `auth.token`. Les rewrites Next ne relaient pas les WebSockets de façon fiable.

## Décision

- Le navigateur se connecte **directement** à `NEXT_PUBLIC_SOCKET_URL` (par défaut `http://127.0.0.1:3336/ws`) avec le token de session dans `auth.token`.
- Transports `websocket` puis repli `polling` ; reconnexion automatique avec délai progressif.
- Une seule connexion partagée (`lib/socket.ts`), fermée à la déconnexion. Le hook `useFlashSocket` diffuse les événements aux écrans (supervision, flashs).

## Conséquences

- Mises à jour instantanées sans interroger l'API en boucle.
- Le port Socket.IO de l'API doit être joignable par les postes clients (CORS `*` côté gateway).
- En HTTPS, il faudra un relais (reverse proxy) en `wss://` pour éviter le contenu mixte.

## Alternatives écartées

- Polling HTTP périodique uniquement : latence et charge plus élevées.
- Relais WebSocket dans Next : non supporté de façon fiable par les rewrites.
