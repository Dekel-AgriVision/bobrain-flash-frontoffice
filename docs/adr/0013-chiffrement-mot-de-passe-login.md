# ADR-0013 — Chiffrement de l'identifiant et du mot de passe à la connexion (RSA-OAEP)

- **Statut** : Accepté
- **Date** : 2026-10-06
- **Projet** : Brain Flash — backoffice v2

## Contexte

Dans l'onglet Réseau du navigateur, la requête `callback/credentials` de next-auth montrait l'identifiant et le mot de passe en clair. Tant que le site n'est pas servi en HTTPS, il circule aussi en clair sur le réseau local.

## Décision

- Au démarrage, le serveur Next génère une paire de clés **RSA 2048** (`lib/login-crypto.ts`) ; la clé privée ne quitte jamais le serveur.
- Le formulaire récupère la clé publique (`GET /api/auth/login-key`) et chiffre `{ u: identifiant, p: motDePasse, t: horodatage, n: nonce }` en **RSA-OAEP SHA-256** (Web Crypto ; repli sur une implémentation JavaScript sans dépendance, `lib/rsa-oaep.ts`, en HTTP sur une adresse IP où Web Crypto est indisponible).
- Seul `credential` (texte chiffré) est envoyé : ni l'identifiant ni le mot de passe n'apparaissent dans la requête ; `authorize()` déchiffre puis appelle l'API sur `127.0.0.1`.
- **Anti-rejeu** : un message expire après 2 minutes et chaque nonce n'est accepté qu'une fois.

## Conséquences

- L'identifiant et le mot de passe n'apparaissent plus dans les outils de développement, les proxys ni les journaux.
- Un redémarrage du serveur Next change la clé : une page de connexion ouverte avant doit être rechargée.
- En déploiement multi-instances, chaque instance a sa propre clé : prévoir des sessions « collantes » ou une clé partagée.
- **Ne remplace pas HTTPS**, indispensable en production (le cookie de session reste sinon lisible sur le réseau).

## Alternatives écartées

- Chiffrement AES avec une clé `NEXT_PUBLIC_*` (v1) : la clé est dans le bundle, n'importe qui peut déchiffrer.
- HTTPS seul : solution cible, mais ne masque pas le mot de passe dans l'onglet Réseau.
