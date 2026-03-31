# Système Multi-Agents IA

## Fonctionnement

Claude Code est l'orchestrateur (le **Manager**). Aucune clé API supplémentaire — utilise votre abonnement Claude Code.

```
  Vous: "Ajouter l'authentification"
       │
       ▼
  Manager (Claude Code)
  ├── Phase 1 : Clarifie la demande (2-4 questions)
  ├── Phase 2 : Sprint plan à valider
  ├── Phase 3 : Exécute les agents (séquentiel/parallèle)
  ├── Phase 4 : Code review automatique
  └── Phase 5 : Documentation & mémoire
```

## Les 12 agents

### Agents de construction

| Agent | Modèle | Responsabilité |
|-------|--------|----------------|
| @pm | haiku | Specs, user stories, critères d'acceptation |
| @architect | sonnet | Architecture, patterns, dépendances |
| @backend | sonnet | Rails, modèles, controllers, i18n |
| @frontend | haiku | React, Inertia, composants, i18n |
| @devops | haiku | Docker, CI/CD, variables d'environnement |
| @database | sonnet | Migrations, index, performance SQL |

### Agents de review (phase 4 automatique)

| Agent | Modèle | Responsabilité | Quand |
|-------|--------|----------------|-------|
| @security | sonnet | Audit OWASP, injections, secrets | Toujours |
| @testing | sonnet | Couverture de tests, cas limites | Toujours |
| @quality | sonnet | Complexité, nommage, DRY, SOLID | Toujours |
| @performance | sonnet | Core Web Vitals, N+1, bundle size | Backend/frontend modifié |
| @a11y | sonnet | WCAG 2.1 AA, contraste, ARIA | Frontend modifié |
| @pentester | sonnet | Tests d'intrusion (localhost uniquement) | Sur demande |

## Fichiers

```
ai/
├── agents/          # Un YAML par agent (rôle, scope, rules, prompt)
├── workflows/
│   ├── new_feature.yml    # Workflow complet pour une nouvelle feature
│   └── code_review.yml    # Reviewers par contexte (core/backend/frontend/on-demand)
└── context/
    ├── sprint_log.md      # Historique des sprints (mis à jour automatiquement)
    ├── decisions.md       # ADR — décisions d'architecture
    └── backlog.md         # Tâches futures identifiées
```

## Convention Question Relay

Si un agent a besoin d'une décision utilisateur, il termine son output par :

```
QUESTIONS:
1. [question précise]
BLOCKER: true  ← si impossible de continuer sans réponse
```

Le Manager consolide les questions et les pose en une seule fois avant de continuer.
