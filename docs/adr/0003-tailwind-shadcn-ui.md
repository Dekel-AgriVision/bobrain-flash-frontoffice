# ADR-0003 — Tailwind CSS et composants shadcn/ui locaux

- **Statut** : Accepté
- **Date** : 2026-10-06
- **Projet** : Brain Flash — backoffice v2

## Contexte

La v1 utilisait MUI + Materio : bundle lourd, surcharges de styles nombreuses (`sx`), DataGrid limité à 100 lignes par page en version gratuite (erreur `pageSize > 100`), rendu peu homogène avec la charte Dekel Agri-Vision.

## Décision

- **Tailwind CSS 3** pour le style, avec les couleurs de la charte (vert Dekel, vert Agri, orange récolte) déclarées dans `tailwind.config.ts`.
- Composants **shadcn/ui** copiés et adaptés dans `src/components/ui/` (Radix UI pour l'accessibilité : Select, Dialog, DropdownMenu, Checkbox, Switch…).
- Briques métier partagées dans `src/components/common/` : `DataTable` (pagination serveur), filtres, badges de statut, `Confirm`, `PasswordInput`, `EmptyState`.
- Icônes **lucide-react**, notifications **sonner**.

## Conséquences

- Le code des composants appartient au projet : modifiable sans dépendre d'une bibliothèque tierce.
- Tableau maison sans limite de taille de page.
- Il faut maintenir soi-même les composants UI copiés.
- Piège connu : le `Select` Radix émet `''` lors d'un `reset` du formulaire ; `SelectControl` ignore cette valeur (`features/shared/fields.tsx`).

## Alternatives écartées

- Garder MUI : poids, limites du DataGrid, personnalisation coûteuse.
- Ant Design / Mantine : mêmes inconvénients de bibliothèque fermée.
