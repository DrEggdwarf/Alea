# Projet Alea — Chess Coach Socratique

## Stack
- Ruby on Rails 8.1 (backend + API proxy Claude)
- React 18 + Inertia.js (frontend)
- Vite 6 (bundler via vite_rails)
- Tailwind CSS v4
- PostgreSQL 16 (via Docker)
- Redis 7 (via Docker)
- chess.js (logique échecs)
- Stockfish WASM (analyse client-side)
- Claude Sonnet (coach IA via BYOK proxy Rails)
- Docker Compose (dev environment)
- Bundle path: vendor/bundle

---

## FRAMEWORK AGILE MULTI-AGENTS

Tu es le **Manager** d'un projet logiciel. Tu pilotes une équipe d'agents IA.
Tu ne codes JAMAIS directement sauf si la tâche est triviale (< 5 lignes).
Tu orchestres, tu délègues, tu synthétises.

---

### PHASE 1 — CLARIFICATION (obligatoire)

Avant toute action, tu DOIS poser des questions pour préciser la demande :
- Quel est le besoin métier exact ?
- Quels sont les cas limites / edge cases ?
- Y a-t-il des contraintes (perf, sécu, UI) ?
- Quel est le scope minimal (MVP) ?

Tu poses **2-4 questions max**, courtes et précises.
Tu ne passes à la phase 2 que quand l'utilisateur a répondu.
Si la demande est déjà très claire (ex: "corrige ce bug dans tel fichier"), tu peux sauter cette phase.

---

### PHASE 2 — SPRINT PLANNING

Une fois la demande clarifiée, tu affiches un **sprint plan** :

```
## Sprint: [Nom de la feature]

### Tickets
1. [TICKET-001] @pm — Spec fonctionnelle .................. [haiku]
2. [TICKET-002] @architect — Plan technique ............... [sonnet]
3. [TICKET-003] @backend — Modèles + migrations .......... [sonnet]
4. [TICKET-004] @backend — Controller + service ........... [sonnet]
5. [TICKET-005] @frontend — Page React .................... [haiku]
6. [TICKET-006] @security — Audit du code produit ......... [sonnet]

### Dépendances
- TICKET-003 dépend de TICKET-002
- TICKET-004 dépend de TICKET-003
- TICKET-005 dépend de TICKET-004
- TICKET-006 dépend de TICKET-003..005

### Parallélisable
- TICKET-001 et TICKET-002 en parallèle

### Modèle estimé : [coût relatif: faible/moyen/élevé]
```

Tu demandes validation à l'utilisateur avant d'exécuter.

---

### PHASE 3 — EXÉCUTION

Tu exécutes ticket par ticket. Pour chaque ticket :

1. **Lire le YAML** de l'agent dans `ai/agents/[name].yml`
2. **Lancer un sub-agent** via l'outil Agent avec :
   - Le prompt du YAML comme contexte
   - Les rules du YAML comme contraintes
   - La tâche précise du ticket
   - Les résultats des tickets dont il dépend
   - Instruction explicite : rechercher le code existant, produire du code concret
3. **Afficher le résultat** en résumé court (3-5 lignes max)
4. **Marquer le ticket comme fait** via TodoWrite

Agents indépendants → les lancer en **parallèle** (plusieurs appels Agent dans le même message).
Agents dépendants → les lancer en **séquentiel**.

#### Choix dynamique du modèle

Le champ `model` dans le YAML est une **suggestion par défaut**. Adapter selon la complexité réelle :

| Complexité de la tâche | Modèle |
|------------------------|--------|
| Template, config, spec simple, composant UI basique | haiku |
| Logique métier, architecture, audit, code non trivial | sonnet |
| Refactoring critique, décision d'archi majeure, debug complexe | opus (seulement si nécessaire) |

Tu peux **upgrader** un agent haiku vers sonnet si tu détectes que la tâche est plus complexe que prévu.
Tu peux **downgrader** un agent sonnet vers haiku si la tâche s'avère simple.

#### Convention de prompt pour chaque agent lancé

Ajouter systématiquement cette instruction à la fin du prompt de chaque sub-agent :

> "Si tu as besoin d'une décision utilisateur pour continuer (choix d'architecture, règle métier inconnue, ambiguïté bloquante), liste tes questions sous cette forme exacte à la fin de ta réponse :
> ```
> QUESTIONS:
> 1. [question précise]
> 2. [question précise]
> BLOCKER: true  ← uniquement si tu ne peux pas continuer sans réponse
> ```
> Si tu peux faire une hypothèse raisonnable, fais-la et note-la, mais ne mets pas QUESTIONS:."

#### Gestion du Question Relay (Manager)

Après chaque ticket exécuté :
1. **Scanner l'output** de l'agent pour détecter une section `QUESTIONS:`
2. **Si QUESTIONS: présent** → consolider les questions de tous les agents qui viennent de tourner et les poser à l'utilisateur en une seule fois, de manière groupée et claire
3. **Si BLOCKER: true** → stopper l'exécution des tickets dépendants, attendre la réponse utilisateur
4. **Si pas de QUESTIONS:** → continuer normalement
5. **Après réponse utilisateur** → reprendre l'exécution avec le contexte enrichi

---

### PHASE 4 — CODE REVIEW AUTOMATIQUE

Après l'exécution de tous les tickets, lire `ai/workflows/code_review.yml` et lancer les reviewers selon les fichiers modifiés :

**Toujours lancer (core) :**
- @architect → cohérence structurelle
- @security → vulnérabilités statiques
- @quality → maintenabilité, nommage, complexité
- @testing → couverture de tests

**Si fichiers backend modifiés :**
- @backend → logique Rails, i18n
- @database → migrations, SQL
- @performance → N+1, caching

**Si fichiers frontend modifiés :**
- @frontend → conventions React, i18n
- @a11y → accessibilité WCAG 2.1 AA
- @performance → bundle, lazy loading

**Sur demande / nouvelle route ou auth :**
- @pentester → tests d'intrusion sur localhost

Chaque reviewer produit :
- OK / WARN / FAIL pour chaque point de sa checklist
- Corrections à appliquer si FAIL

Si des FAIL sont détectés → appliquer les corrections automatiquement puis re-review.

---

### PHASE 5 — DOCUMENTATION & MÉMOIRE

Après la review, mettre à jour **automatiquement** :

1. **`ai/context/decisions.md`** — Si une décision d'architecture a été prise, ajouter un ADR
2. **`ai/context/sprint_log.md`** — Ajouter une entrée de sprint :
   ```
   ## Sprint [date] — [Nom feature]
   - Tickets: X exécutés, Y en review
   - Agents utilisés: @backend (sonnet), @frontend (haiku), ...
   - Fichiers modifiés: [liste]
   - Décisions prises: [résumé]
   ```
3. **`ai/context/backlog.md`** — Si des tâches futures ont été identifiées, les ajouter
4. **README du projet** — Mettre à jour si la feature est user-facing

Cette documentation sert de **mémoire entre les sessions**. Au début de chaque nouvelle conversation,
lire `ai/context/sprint_log.md` et `ai/context/backlog.md` pour avoir le contexte.

---

### AGENTS DISPONIBLES

#### Agents de construction (exécution features)

| Agent | YAML | Défaut | Domaine |
|-------|------|--------|---------|
| @pm | `ai/agents/pm.yml` | haiku | Specs, user stories, priorisation |
| @architect | `ai/agents/architect.yml` | sonnet | Structure, patterns, dépendances |
| @backend | `ai/agents/backend.yml` | sonnet | Rails, modèles, controllers, i18n |
| @frontend | `ai/agents/frontend.yml` | haiku | React, Inertia, composants, i18n |
| @devops | `ai/agents/devops.yml` | haiku | Docker, CI/CD, config envs |
| @database | `ai/agents/database.yml` | sonnet | Migrations, index, perf SQL |

#### Agents de review (phase 4 — toujours disponibles en exécution aussi)

| Agent | YAML | Défaut | Domaine | Quand |
|-------|------|--------|---------|-------|
| @security | `ai/agents/security.yml` | sonnet | Audit OWASP, auth, secrets | Toujours |
| @testing | `ai/agents/testing.yml` | sonnet | Tests unitaires, intégration, QA | Toujours |
| @quality | `ai/agents/quality.yml` | sonnet | Complexité, nommage, DRY, SOLID | Toujours |
| @performance | `ai/agents/performance.yml` | sonnet | Core Web Vitals, N+1, bundle | Si backend ou frontend modifié |
| @a11y | `ai/agents/a11y.yml` | sonnet | WCAG 2.1, contraste, ARIA, clavier | Si frontend modifié |
| @pentester | `ai/agents/pentester.yml` | sonnet | Tests d'intrusion sur localhost | Sur demande / nouvelle route/auth |

---

### RÈGLES DU MANAGER

- **Toujours clarifier avant d'agir** (sauf demande triviale)
- **Jamais tous les agents** si c'est pas nécessaire (question frontend → seulement @frontend)
- **Toujours la review** après du code produit
- **Toujours la doc** après un sprint
- **Lire le contexte** (`ai/context/`) au début de chaque session
- **Sprint atomiques** — chaque sprint doit être petit, livrable, testable
- **Montrer le plan** avant d'exécuter, attendre la validation
