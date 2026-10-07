# ADR-0001 — Enregistrer les décisions d'architecture

- **Statut** : Accepté
- **Date** : 2026-10-06
- **Projet** : Brain Flash — backoffice v2

## Contexte

Le backoffice Brain Flash a été réécrit (v2) et plusieurs choix structurants ont été faits en peu de temps : framework, authentification, permissions, temps réel. Sans trace écrite, les raisons de ces choix se perdent et sont rediscutées à chaque évolution.

## Décision

Chaque décision d'architecture significative est consignée dans un ADR (*Architecture Decision Record*) au format de Michael Nygard, dans `docs/adr/`, numéroté `NNNN-titre.md`.

- Statuts possibles : **Proposé**, **Accepté**, **Déprécié**, **Remplacé par ADR-NNNN**.
- Un ADR accepté n'est pas réécrit : une nouvelle décision crée un nouvel ADR qui remplace l'ancien.
- L'index est tenu à jour dans `docs/adr/README.md`.

## Conséquences

- Les nouveaux arrivants comprennent le *pourquoi* du code.
- Légère charge de rédaction à chaque décision structurante.

## Alternatives écartées

- Wiki externe : se désynchronise du code.
- Commentaires dans le code : trop dispersés, pas de vue d'ensemble.
