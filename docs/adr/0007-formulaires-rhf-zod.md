# ADR-0007 — Formulaires : react-hook-form + zod, alignés sur la validation de l'API

- **Statut** : Accepté
- **Date** : 2026-10-06
- **Projet** : Brain Flash — backoffice v2

## Contexte

L'API valide les corps avec `class-validator` et un `ValidationPipe` en `whitelist: true` (propriétés inconnues supprimées). Certaines règles posent problème au front : `@IsOptional()` ne tolère que `null`/`undefined` (une chaîne vide échoue sur `@IsEmail`), le port ERP est obligatoire (`@IsNumber`), la valeur d'un paramètre est obligatoire (`@IsNotEmpty`).

## Décision

- **react-hook-form** + **zod** (`@hookform/resolvers`) pour tous les formulaires ; mise en page commune `FormLayout` / `FormSection` / `AsideCard`.
- Les schémas zod reprennent les contraintes de l'API (champs obligatoires, port ERP 1-65535, valeur de paramètre non vide, complexité du mot de passe).
- Les champs optionnels vides sont envoyés à `null` quand l'API utilise `IsEmail` (surccusales).
- Le mot de passe utilisateur n'est envoyé (`newPassword`) que s'il est renseigné.

## Conséquences

- Les erreurs sont détectées avant l'appel API, avec un message en français.
- Les schémas doivent suivre les DTO de l'API : toute nouvelle contrainte côté API doit être reportée.

## Alternatives écartées

- Validation uniquement côté API : messages moins clairs, allers-retours inutiles.
