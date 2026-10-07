# ADR-0009 — Permissions explicites, sans règle « manage all »

- **Statut** : Accepté
- **Date** : 2026-10-06
- **Projet** : Brain Flash — backoffice v2

## Contexte

Dans l'API, `Role.buildAbilityRules()` ajoutait une règle `manage all` à tous les rôles (via `applyManagerPermission`), et `Sujet: true` produisait une action `all` inconnue de CASL. Résultat : tout utilisateur connecté avait tous les droits, et les filtres par surccusale reposaient sur `can('manage', 'all')`.

## Décision

**API (BOBRAINFLASHAPI)**

- Aucune règle `manage` ni sujet `all` n'est plus générée. Les droits sont des couples explicites *sujet × action* parmi `read`, `create`, `edit`, `delete`, `stream`.
- `adminPermission: true` (« Accès complet ») donne ces 5 actions sur tous les sujets métier de `AbilitySubjectEnum`.
- `permissions[Sujet] === true` donne les 5 actions sur ce sujet ; `{ read: true, … }` seulement les actions cochées. Les clés inconnues sont ignorées.
- Le test `can('manage', 'all')` des services est remplacé par `AuthUser.hasAllBranchesAccess()` : rôle en accès complet **ou** compte rattaché à la société mère. Dans ce cas, les conditions de surccusale ne sont pas appliquées aux règles.
- Le rôle `manager` par défaut est créé en accès complet ; au démarrage, s'il existe sans aucune permission, il passe en accès complet pour ne pas bloquer l'administrateur.

**Front** : la matrice des rôles couvre tous les sujets (dont `SentWeight` et `AuthUser`) ; « Accès complet » et le sélecteur de surccusale reposent sur `adminPermission` / `isParentCompany`.

## Conséquences

- Principe du moindre privilège : un nouveau sujet n'est jamais ouvert implicitement.
- **Les rôles existants sans permission n'ont plus aucun droit** : ils doivent être configurés dans l'écran Rôles.
- Les utilisateurs doivent se reconnecter pour recevoir leurs nouvelles règles.

## Alternatives écartées

- Garder `manage all` pour les gestionnaires : contraire au besoin exprimé, et ouvre tout nouveau module par défaut.
