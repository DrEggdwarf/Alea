# Alea — Coach d'echecs socratique

Un coach IA qui te guide par le questionnement, sans jamais reveler le meilleur coup.

## Stack

| Couche | Technologie |
|--------|------------|
| Backend | Ruby on Rails 8.1 |
| Frontend | React 18 + Inertia.js |
| Bundler | Vite 6 (vite_rails) |
| DB | PostgreSQL 16 |
| Cache | Redis 7 |
| Echecs | chess.js + Stockfish WASM |
| Coach IA | Claude Sonnet (BYOK) |
| Dev | Docker Compose |

## Quickstart

```bash
git clone https://github.com/DrEggdwarf/Alea.git
cd Alea
cp .env.example .env
docker compose up
```

Ouvrir **http://localhost:3000**, entrer ta cle API Anthropic, et jouer.

## BYOK (Bring Your Own Key)

Pas de compte, pas d'inscription. Tu fournis ta propre cle API Anthropic (`sk-ant-...`).
La cle est stockee dans le `localStorage` de ton navigateur — jamais envoyee au serveur pour stockage.
Elle transite uniquement dans les headers HTTP vers le proxy Rails qui la forwarde a l'API Anthropic.

## Comment ca marche

1. **Joue un coup** contre Stockfish (WASM, dans ton navigateur)
2. **Le coach reagit** — Claude analyse la position et te questionne
3. **Explore les idees** — annotations colorees, tooltips, termes d'echecs
4. **Trouve par toi-meme** — le coach ne revele jamais le meilleur coup

## Architecture

```
Frontend (React)
  ├── chess.js        — logique echecs
  ├── Stockfish WASM  — analyse + adversaire
  └── useCoach        — conversation avec le proxy

Rails API (proxy)
  ├── CoachController — recoit FEN + contexte + cle API
  ├── CoachService    — construit le prompt, parse la reponse
  └── ClaudeClient    — forwarde vers api.anthropic.com
```

Stockfish fait TOUTE l'analyse (evaluation, top coups, detection d'erreurs).
Claude reformule ces faits en pedagogie socratique — il ne calcule rien lui-meme.

## Developpement

```bash
docker compose up        # lance Rails + PG + Redis
docker compose logs -f   # voir les logs
docker compose restart web  # apres modification Ruby
```

Les fichiers frontend (React/JSX) sont hot-reloades par Vite.
Les fichiers backend (Ruby) necessitent un restart du container `web`.
