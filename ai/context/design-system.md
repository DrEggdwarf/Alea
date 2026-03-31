# Design System — Alea

> Document vivant. Source de vérité pour tous les choix visuels.
> Les tokens sont définis dans `app/frontend/styles/globals.css` via `@theme` Tailwind v4.

---

## Palette de couleurs

### Fond et surfaces
| Token | Valeur | Usage |
|-------|--------|-------|
| `bg` | `#1c1d22` | Fond principal |
| `bg2` | `#22232b` | Surfaces secondaires (sidebar, board shell) |
| `bg3` | `#2a2b35` | Surfaces tertiaires (boutons hover) |
| `bg4` | `#32333f` | Tooltips |

### Bordures
| Token | Valeur | Usage |
|-------|--------|-------|
| `bd` | `#3a3b4a` | Bordures principales |
| `bd2` | `#474860` | Bordures accentuées |

### Texte
| Token | Valeur | Usage |
|-------|--------|-------|
| `t1` | `#f0eee6` | Texte principal (clair sur sombre) |
| `t2` | `#9090a8` | Texte secondaire |
| `t3` | `#50516a` | Texte tertiaire, labels |
| `t4` | `#30314a` | Texte très discret |

### Échiquier
| Token | Valeur |
|-------|--------|
| `sq-light` | `#d4b483` |
| `sq-dark` | `#8b5e34` |

### Couleurs sémantiques (coeur de l'UX)
| Token | Hex | Signification | Usage |
|-------|-----|---------------|-------|
| `danger` / `red` | `#e05252` | Menace / Danger | Pièce en prise, case attaquée |
| `attack` / `blue` | `#4e90e0` | Attaque / Pression | Coup agressif, fourchette |
| `good` / `green` | `#52be6a` | Développement / Bon coup | Roque, case forte |
| `passive` / `yel` | `#e0b83a` | Coup passif | Perte de tempo, sous-activité |
| `explore` / `vio` | `#a06ae0` | Idée à explorer | Variante intéressante |
| `tactical` / `pink` | `#e06aaa` | Tactique spécifique | Clouage, pattern |

Chaque couleur a 3 variantes : pleine, alpha (18%), et semi (72%).

### Panel chat
| Token | Valeur | Usage |
|-------|--------|-------|
| `chat-bg` | `#ffffff` | Fond du chat (blanc pur) |
| `chat-text` | `#18192a` | Texte principal chat |
| `chat-text2` | `#6a6b80` | Texte secondaire |
| `chat-text3` | `#aaaac0` | Labels, placeholders |
| `chat-border` | `#e4e4f0` | Bordures internes |
| `chat-surface` | `#f6f6fb` | Surfaces (input, cards) |

---

## Typographie

### Familles
| Token | Police | Usage |
|-------|--------|-------|
| `font-ui` | Geist | Interface, boutons, labels, messages utilisateur |
| `font-coach` | Lora (serif) | Messages du coach, logo |
| `font-mono` | DM Mono | Coups, FEN, horloges, badges techniques |

### Taille de base : 13px (définie sur body)

---

## Layout

### Structure 3 colonnes
```
| Sidebar (54px) | Centre (flexible) | Chat (390px) |
```

### Responsive
| Breakpoint | Comportement |
|------------|-------------|
| > 960px | Layout 3 colonnes complet |
| ≤ 960px | Chat masqué, FAB pour ouvrir en modal |
| ≤ 580px | Sidebar masquée aussi, FAB pour les coups |

### Échiquier
- Container : `board-shell` avec padding 12px, border-radius 18px, ombre prononcée
- Grille : 8x8, aspect-ratio 1:1, max-width 480px
- Couche SVG pour flèches par-dessus la grille

---

## Composants clés

### Board Shell
```
bg: bg2, border-radius: 18px, border: 1px solid bd2
padding: 12px
box-shadow: 0 24px 64px rgba(0,0,0,.65), 0 4px 16px rgba(0,0,0,.4)
```

### Messages chat
- Coach : fond blanc, bordure chat-border, font Lora serif
- Utilisateur : fond #f0f4ff, bordure #d4dcf8, font Geist
- Système : transparent, DM Mono, centré, petit

### Keywords colorés
- Inline span avec padding 1px 5px, border-radius 4px
- Hover : opacity 0.72
- Fixé (cliqué) : underline dotted, offset 3px

### Question cards
- Fond chat-surface, bordure chat-border, border-radius 10px
- Options : hover highlight + preview sur le plateau
- Badges : pill avec couleur sémantique

---

## Historique des décisions design

| Date | Décision | Raison |
|------|----------|--------|
| 2026-03-30 | Fond sombre #1c1d22 | Concentration sur le plateau — CDC Alea |
| 2026-03-30 | Chat blanc pur | Contraste délibéré, lisibilité maximale — CDC |
| 2026-03-30 | 3 familles de polices | Geist (UI) + Lora (coach, personnalité) + DM Mono (technique) |
| 2026-03-30 | 6 couleurs sémantiques | Cohérence texte ↔ plateau, identité visuelle du coaching |
| 2026-03-30 | Tailwind CSS v4 + @theme | Tokens centralisés, pas de tokens.js séparé |
