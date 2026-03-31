# Décisions d'Architecture (ADR) — Alea

## ADR-001 : Stack technique
- **Date** : 2026-03-30
- **Statut** : Accepté
- **Décision** : Ruby on Rails 8.1 + Inertia.js + React 18 + Vite 6 + Tailwind CSS v4
- **Raison** : Rails pour la productivité backend et le proxy API, Inertia pour éviter une SPA complexe, React pour l'écosystème

## ADR-002 : Base de données
- **Date** : 2026-03-30
- **Statut** : Accepté
- **Décision** : PostgreSQL 16 partout (dev + prod) via Docker Compose + Redis 7
- **Raison** : Cohérence dev/prod, jsonb pour conversation/annotations, Redis pour cache/sessions futures

## ADR-003 : Authentification
- **Date** : 2026-03-30
- **Statut** : Accepté
- **Décision** : Devise avec profil joueur optionnel (ELO, style, objectif)
- **Raison** : L'onboarding ne doit pas bloquer l'accès, le profil enrichit l'expérience coach progressivement

## ADR-004 : Échiquier custom vs react-chessboard
- **Date** : 2026-03-30
- **Statut** : Accepté
- **Décision** : Board custom avec chess.js pour la logique, rendu Unicode sur CSS grid
- **Raison** : Le système d'annotations (overlays couleur, flèches SVG, ghost pieces, légende interactive) est trop intégré au rendu pour être greffé sur react-chessboard

## ADR-005 : Stockfish côté client
- **Date** : 2026-03-30
- **Statut** : Accepté
- **Décision** : Stockfish WASM via Web Worker, côté client
- **Raison** : Zéro latence, pas de coût serveur, profondeur configurable (défaut 15)

## ADR-006 : Coach IA via proxy Rails
- **Date** : 2026-03-30
- **Statut** : Accepté
- **Décision** : Proxy Rails pour Claude API (Sonnet), jamais d'appel direct depuis le frontend
- **Raison** : Sécurité de la clé API, possibilité de logging, rate limiting, prompt engineering côté serveur

## ADR-007 : Orchestration IA
- **Date** : 2026-03-30
- **Statut** : Accepté
- **Décision** : 12 agents IA (YAML) via Claude Code pour le développement, sprints organisés
- **Raison** : Qualité de code, revue automatique, documentation systématique
