# Backlog — Alea

## Sprints planifiés

### Sprint 1 — Core Chess UI
- [ ] Layout 3 colonnes (AppLayout + Sidebar)
- [ ] Échiquier custom (BoardGrid + Square + ArrowLayer)
- [ ] Hook useChessGame (chess.js wrapper)
- [ ] Hook useAnnotations
- [ ] Types TypeScript pour chess/annotations
- [ ] Page Play complète
- [ ] GamesController Rails

### Sprint 2 — Stockfish WASM + Coach Proxy
- [ ] useStockfish hook (Web Worker + UCI)
- [ ] stockfish.worker.ts
- [ ] useOpponent hook (random + stockfish modes)
- [ ] DepthSelector component
- [ ] Intégration CoachService + ClaudeClient (déjà scaffoldés)

### Sprint 3 — Chat System + Annotations
- [ ] ChatPanel + ChatHeader + ChatMessages
- [ ] MessageBubble avec parsing [mot|couleur]
- [ ] KeywordSpan (hover/click → annotations plateau)
- [ ] ThinkingIndicator
- [ ] ChatInput
- [ ] QuestionCard + QuestionOption (4 types)
- [ ] Modals mobile (ChatModal + MovesModal)
- [ ] useCoach hook

### Sprint 4 — Features Interactives
- [ ] TermTooltip + chess-terms dictionary
- [ ] Variant Explorer (shadow state)
- [ ] MoveList + MoveCell + MiniBoard
- [ ] Persistance parties (API CRUD)

## v2 — Post-MVP
- [ ] Plateau jouable vs Stockfish (niveaux de difficulté)
- [ ] Profil de personnalité joueur (archétypes)
- [ ] Import PGN (parties chess.com)
- [ ] Mode tutoriel débutant
- [ ] Historique des parties sauvegardé
- [ ] Arbre de variantes post-partie
- [ ] Version mobile native (responsive v2)
