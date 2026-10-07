# ADR-0017 — Internationalisation : français, anglais et hébreu (RTL)

- **Statut** : Accepté
- **Date** : 2026-10-06
- **Projet** : Brain Flash — backoffice v2

## Contexte

Le backoffice doit être utilisable en **français (langue par défaut)**, en **anglais** et en **hébreu**. L'hébreu s'écrit de droite à gauche : toute la mise en page doit être miroir, pas seulement le texte. Le code existant était écrit avec des libellés français en dur.

## Décision

- **Pas de bibliothèque i18n supplémentaire.** Un module maison léger, `src/i18n/` :
  - `config.ts` : langues `fr`, `en`, `he`, langue par défaut `fr`, cookie `brainflash.locale`, sens d'écriture (`he` → `rtl`).
  - `translate.ts` : `translate(locale, clé, variables)`, interpolation `{var}`, `tr()` pour le code hors rendu (toasts).
  - `server.ts` : `getLocale()` / `getT()` pour les composants serveur et `generateMetadata`.
  - `provider.tsx` : `I18nProvider`, hooks `useT()`, `useI18n()` (`locale`, `dir`, `setLocale`).
  - `messages/en.ts`, `messages/he.ts` : catalogues.
- **La clé est le texte français.** Le français n'a pas de catalogue : une clé absente d'un catalogue s'affiche en français. Le code reste lisible et aucun écran ne casse si une traduction manque.
- **Traduction aux frontières des composants partagés.** `PageHeader`, `ListLayout`, `FormLayout`, `Field` (libellé, aide et erreur, donc les messages zod), `DataTable` (en-têtes), `EmptyState`, `KpiCard`, `ConfirmButton`, filtres… traduisent leurs props texte. Les écrans leur passent la clé française.
- **Choix de la langue** : sélecteur dans l'en-tête et sur la page de connexion. Il écrit le cookie (1 an), met à jour `<html lang dir>` puis rafraîchit les composants serveur. Le layout racine lit le cookie et rend directement `lang`/`dir` : pas de clignotement au chargement.
- **RTL** :
  - utilitaires Tailwind logiques (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`, `text-end`, `border-s`…) au lieu de `left/right` ;
  - `DirectionProvider` de Radix pour les menus, listes et sélecteurs ;
  - classe `.rtl-flip` pour les icônes directionnelles (chevrons, flèches) ;
  - toasts positionnés en haut à gauche en RTL ;
  - police Noto Sans Hebrew.
- **Dates et nombres** : `moment.locale(fr | en | he)` et `Intl` (`fr-FR`, `en-GB`, `he-IL`) selon la langue.
- **Contrôle** : `npm run i18n:check` liste les textes utilisés dans le code et absents des catalogues `en`/`he`.

## Conséquences

- Ajouter un texte : écrire `t('Texte français')` (ou passer la clé à un composant partagé), puis ajouter la traduction dans `en.ts` et `he.ts`. `npm run i18n:check` signale les oublis.
- Les données (noms de rôles, stations, surccusales, messages libres renvoyés par l'API) ne sont pas traduites. Les messages d'erreur connus de l'API ont une traduction dans les catalogues.
- Toute nouvelle classe Tailwind de positionnement horizontal doit être logique ; les icônes directionnelles doivent recevoir `rtl-flip`.
- Changer une phrase française change la clé : il faut reporter la modification dans les catalogues.

## Alternatives écartées

- **next-intl / i18next** : plus complets (pluriels ICU, routage `/[locale]`), mais imposent des clés techniques, un segment d'URL par langue et une refonte des routes, sans besoin réel pour trois langues dans un backoffice interne.
- **Langue dans l'URL** (`/fr/...`) : inutile pour un outil authentifié non indexé ; le cookie suffit.
