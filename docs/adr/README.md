# Décisions d'architecture (ADR)

Décisions structurantes du backoffice Brain Flash v2 (front Next.js) et, lorsqu'elles le concernent, de l'API BOBRAINFLASHAPI.
Lecture dans le navigateur : ouvrir [`docs/index.html`](../index.html) (régénérer avec `npm run docs:adr`).

Format : [Michael Nygard](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) — voir ADR-0001.

| N° | Décision | Statut |
| --- | --- | --- |
| [0001](0001-enregistrer-les-decisions-d-architecture.md) | Enregistrer les décisions d'architecture | Accepté |
| [0002](0002-nextjs-15-app-router.md) | Next.js 15 (App Router), React 19 et TypeScript strict | Accepté |
| [0003](0003-tailwind-shadcn-ui.md) | Tailwind CSS et composants shadcn/ui locaux | Accepté |
| [0004](0004-authentification-next-auth.md) | Authentification par next-auth (Credentials) et session JWT | Accepté |
| [0005](0005-proxy-api-same-origin.md) | Appels API en same-origin via les rewrites Next | Accepté |
| [0006](0006-donnees-tanstack-query.md) | Accès aux données : TanStack Query et client HTTP maison | Accepté |
| [0007](0007-formulaires-rhf-zod.md) | Formulaires : react-hook-form + zod, alignés sur la validation de l'API | Accepté |
| [0008](0008-autorisations-casl-front.md) | Autorisations côté front avec CASL | Accepté |
| [0009](0009-permissions-explicites-sans-manage-all.md) | Permissions explicites, sans règle « manage all » | Accepté |
| [0010](0010-temps-reel-socket-io.md) | Temps réel par Socket.IO (namespace /ws) | Accepté |
| [0011](0011-regles-de-supervision.md) | Règles de santé des stations et rapprochement flash ↔ station | Accepté |
| [0012](0012-dates-moment.md) | Gestion des dates avec moment (locale fr) | Accepté |
| [0013](0013-chiffrement-mot-de-passe-login.md) | Chiffrement de l'identifiant et du mot de passe à la connexion (RSA-OAEP) | Accepté |
| [0014](0014-organisation-par-fonctionnalite.md) | Organisation du code par fonctionnalité | Accepté |
| [0015](0015-configuration-et-deploiement.md) | Configuration et déploiement | Accepté |
| [0016](0016-rafraichissement-session-active.md) | Rafraîchissement automatique du token pour un utilisateur actif | Accepté |
| [0017](0017-internationalisation-fr-en-he.md) | Internationalisation : français, anglais et hébreu (RTL) | Accepté |

## Ajouter un ADR

1. Copier `template.md` en `NNNN-titre-court.md` (numéro suivant).
2. Renseigner contexte, décision, conséquences et alternatives.
3. Ajouter la ligne dans le tableau ci-dessus.
4. Régénérer la page HTML : `npm run docs:adr`.
5. Pour revenir sur une décision : nouvel ADR, et passer l'ancien en « Remplacé par ADR-NNNN ».
