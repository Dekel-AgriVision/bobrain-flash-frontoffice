# ADR-0011 — Règles de santé des stations et rapprochement flash ↔ station

- **Statut** : Accepté
- **Date** : 2026-10-06
- **Projet** : Brain Flash — backoffice v2

## Contexte

Le tableau de supervision affichait des stations « Sans données » alors que le service envoyait bien des pesées : les codes station / surccusale reçus par socket ne correspondaient pas exactement (casse, espaces, code ou libellé de surccusale).

## Décision

Chaque station reçoit un état calculé à partir de son dernier flash (API + événements socket reçus sur la page) — `features/supervision/health.ts` :

| État | Règle |
| --- | --- |
| **Désactivée** (`off`) | station inactive |
| **Sans données** (`idle`) | active, aucun flash connu |
| **En alerte** (`alert`) | dernier statut en erreur ou avertissement |
| **Muette** (`silent`) | aucun flash depuis plus de *N* minutes (1 à 60, 5 par défaut, mémorisé dans le navigateur) |
| **Opérationnelle** (`ok`) | flash récent et statut valide |

Le rapprochement utilise une clé normalisée `SURCCUSALE::STATION` (trim + majuscules), testée avec le code, le libellé et l'id de la surccusale, puis un repli sur le code station s'il est unique.

## Conséquences

- Le tableau correspond exactement au journal temps réel.
- Les changements d'état (passage en « muette ») sont tracés dans le journal de la page.
- Le seuil est propre à chaque navigateur, pas partagé entre utilisateurs.

## Alternatives écartées

- Comparaison stricte des codes : faux « Sans données ».
- Seuil stocké côté API : possible plus tard via un paramètre système.
