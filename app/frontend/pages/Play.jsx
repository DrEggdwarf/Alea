import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useChessGame } from "../hooks/useChessGame";
import { useStockfish } from "../hooks/useStockfish";
import { useCoach } from "../hooks/useCoach";
import { useAnnotations } from "../hooks/useAnnotations";
import {
  FILES,
  RANKS,
  squareToCoords,
  coordsToSquare,
  SEMANTIC_COLORS,
} from "../utils/chess-helpers";
import { identifyOpening } from "../utils/openings";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseCoachText(text) {
  if (!text) return [];
  const parts = [];
  const regex = /\[([^\]|]+)\|(\w+)\]/g;
  let last = 0;
  let match;
  while ((match = regex.exec(text))) {
    if (match.index > last) parts.push({ type: "text", value: text.slice(last, match.index) });
    parts.push({ type: "kw", value: match[1], color: match[2] });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ type: "text", value: text.slice(last) });
  return parts;
}

const PIECE_CDN = "https://lichess1.org/assets/piece/cburnett";

// Convert UCI move (e2e4) to approximate SAN (e4, Nf3, etc.)
// This is a rough conversion — just for display in coach context
function uciToSan(uci) {
  if (!uci || uci.length < 4) return uci;
  if (uci === "e1g1" || uci === "e8g8") return "O-O";
  if (uci === "e1c1" || uci === "e8c8") return "O-O-O";
  return uci.slice(0, 2) + "-" + uci.slice(2, 4);
}

function formatScore(cp) {
  if (cp === null || cp === undefined) return "?";
  if (cp >= 100000) return "#";
  if (cp <= -100000) return "-#";
  const pawns = (cp / 100).toFixed(1);
  return cp >= 0 ? `+${pawns}` : `${pawns}`;
}

// Build a structured factual report for the coach.
// Claude doesn't analyze — it reformulates these FACTS into pedagogy.
function buildFactualReport({ userMove, sfMove, topMoves, currentEval, evalDelta, opening, moveNumber }) {
  const lines = [];

  lines.push(`Coup ${moveNumber}: j'ai joue ${userMove}, Stockfish a repondu ${sfMove}.`);

  // Eval assessment
  if (currentEval !== null) {
    const evalStr = formatScore(currentEval);
    if (currentEval > 150) lines.push(`FAIT: Avantage blanc decisif (${evalStr}).`);
    else if (currentEval > 50) lines.push(`FAIT: Leger avantage blanc (${evalStr}).`);
    else if (currentEval > -50) lines.push(`FAIT: Position equilibree (${evalStr}).`);
    else if (currentEval > -150) lines.push(`FAIT: Leger avantage noir (${evalStr}).`);
    else lines.push(`FAIT: Avantage noir decisif (${evalStr}).`);
  }

  // Blunder detection
  if (evalDelta !== null) {
    if (evalDelta < -150) lines.push(`FAIT: Mon dernier coup etait une ERREUR GRAVE (perte de ${formatScore(-evalDelta)} pions).`);
    else if (evalDelta < -50) lines.push(`FAIT: Mon dernier coup etait imprecis (perte de ${formatScore(-evalDelta)} pions).`);
    else if (evalDelta > 100) lines.push(`FAIT: Bon coup ! L'evaluation s'est amelioree de ${formatScore(evalDelta)}.`);
  }

  // Opening
  if (opening) {
    lines.push(`FAIT: Ouverture identifiee = ${opening.name}${opening.variation ? " (" + opening.variation + ")" : ""}.`);
  }

  // Top moves
  if (topMoves.length > 0) {
    const movesStr = topMoves.map((m, i) => `${i + 1}. ${m.san} (eval: ${formatScore(m.score)})`).join(", ");
    lines.push(`TOP COUPS STOCKFISH (les seuls que tu peux proposer): ${movesStr}`);
  }

  return lines.join("\n");
}

// ─── Square ───────────────────────────────────────────────────────────────────

function Square({ row, col, piece, selected, isDot, lastMove, colorOverlay, onClick, onDragStart, onDragOver, onDrop, flipped }) {
  const isLight = (row + col) % 2 === 0;
  let cls = `play-sq ${isLight ? "play-sq--light" : "play-sq--dark"}`;
  if (selected) cls += " play-sq--selected";
  if (lastMove) cls += " play-sq--lastmove";
  if (isDot) cls += " play-sq--dot";
  if (piece && isDot) cls += " play-sq--occupied";
  if (colorOverlay) cls += ` play-sq--${colorOverlay}`;

  // Labels: files on bottom rank, ranks on left file (relative to orientation)
  const displayRow = flipped ? 7 - row : row;
  const displayCol = flipped ? 7 - col : col;
  const fileLabel = displayRow === 7 ? FILES[flipped ? 7 - col : col] : null;
  const rankLabel = displayCol === 0 ? RANKS[flipped ? 7 - row : row] : null;

  const pieceUrl = piece ? `${PIECE_CDN}/${piece.color}${piece.type.toUpperCase()}.svg` : null;

  return (
    <div
      className={cls}
      onClick={onClick}
      onDragOver={(e) => { e.preventDefault(); onDragOver?.(); }}
      onDrop={onDrop}
    >
      {pieceUrl && (
        <img
          className="play-sq__piece"
          src={pieceUrl}
          alt=""
          draggable
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = "move";
            onDragStart?.();
          }}
        />
      )}
      {fileLabel && <span className={`play-sq__label-file ${isLight ? "" : "play-sq__label--dark"}`}>{fileLabel}</span>}
      {rankLabel && <span className={`play-sq__label-rank ${isLight ? "" : "play-sq__label--dark"}`}>{rankLabel}</span>}
    </div>
  );
}

// ─── Arrow Layer ──────────────────────────────────────────────────────────────

function arrowPolygon(x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 0.01) return "";
  const ux = dx / len, uy = dy / len;
  const px = -uy, py = ux;
  const sw = 0.14, hw = 0.32, hl = 0.32;
  const sx = x2 - ux * hl, sy = y2 - uy * hl;
  const pts = [
    [x1 + px * sw, y1 + py * sw],
    [sx + px * sw, sy + py * sw],
    [sx + px * hw, sy + py * hw],
    [x2, y2],
    [sx - px * hw, sy - py * hw],
    [sx - px * sw, sy - py * sw],
    [x1 - px * sw, y1 - py * sw],
  ];
  return pts.map(([x, y]) => `${x},${y}`).join(" ");
}

function ArrowLayer({ arrows, flipped }) {
  if (!arrows || arrows.length === 0) return null;
  return (
    <svg className="play-arrow-layer" viewBox="0 0 8 8" preserveAspectRatio="none">
      {arrows.map((a, i) => {
        const from = squareToCoords(a.from);
        const to = squareToCoords(a.to);
        const fx = flipped ? 7 - from.col : from.col;
        const fy = flipped ? 7 - from.row : from.row;
        const tx = flipped ? 7 - to.col : to.col;
        const ty = flipped ? 7 - to.row : to.row;
        const color = SEMANTIC_COLORS[a.color] || SEMANTIC_COLORS.blue;
        return (
          <polygon key={i} points={arrowPolygon(fx + 0.5, fy + 0.5, tx + 0.5, ty + 0.5)}
            fill={color.stroke} opacity="0.85" />
        );
      })}
    </svg>
  );
}

// ─── Board ────────────────────────────────────────────────────────────────────

function Board({ board, selectedSquare, legalTargets, lastMove, squareOverlays, arrows, flipped, onSquareClick, onDragStart, onDrop }) {
  const renderBoard = flipped ? [...board].reverse().map(row => [...row].reverse()) : board;

  return (
    <div className="play-board-shell">
      <div className="play-board-wrap">
        <div className="play-board-grid">
          {renderBoard.map((row, r) =>
            row.map((piece, c) => {
              const actualRow = flipped ? 7 - r : r;
              const actualCol = flipped ? 7 - c : c;
              const sq = coordsToSquare(actualCol, actualRow);
              return (
                <Square key={sq} row={r} col={c} piece={piece}
                  selected={selectedSquare === sq}
                  isDot={legalTargets.includes(sq)}
                  lastMove={lastMove?.includes(sq)}
                  colorOverlay={squareOverlays[sq] || null}
                  flipped={flipped}
                  onClick={() => onSquareClick(sq)}
                  onDragStart={() => onDragStart(sq)}
                  onDrop={() => onDrop(sq)}
                />
              );
            })
          )}
        </div>
        <ArrowLayer arrows={arrows} flipped={flipped} />
      </div>
    </div>
  );
}

// ─── Player Row ───────────────────────────────────────────────────────────────

function PlayerRow({ name, rating, avatarLetter, avatarStyle, isActive, captures }) {
  return (
    <div className={`play-player ${isActive ? "play-player--active" : ""}`}>
      <div className="play-player__avatar" style={avatarStyle}>{avatarLetter}</div>
      <div className="play-player__name">
        {name}
        {rating && <span className="play-player__rating">{rating}</span>}
      </div>
      {captures && captures.length > 0 && (
        <div className="play-player__captures">
          {captures.map((p, i) => (
            <img key={i} src={`${PIECE_CDN}/${p}.svg`} alt="" className="play-player__capture-piece" />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Chat Message ─────────────────────────────────────────────────────────────

function TermTooltip({ term, anchorRect }) {
  if (!anchorRect) return null;

  // Position above the keyword, centered, clamped to viewport
  const cardW = 280;
  let left = anchorRect.left + anchorRect.width / 2 - cardW / 2;
  left = Math.max(8, Math.min(left, window.innerWidth - cardW - 8));
  let top = anchorRect.top - 8;

  // Arrow pointing down to the keyword
  const arrowLeft = anchorRect.left + anchorRect.width / 2 - left;

  return createPortal(
    <div className="play-termcard" style={{ left, bottom: window.innerHeight - top }}>
      <div className="play-termcard__title">{term.title || term.label}</div>
      {term.description && <div className="play-termcard__desc">{term.description}</div>}
      {term.tips && (
        <div className="play-termcard__tips">
          <i className="fa-solid fa-triangle-exclamation"></i> {term.tips}
        </div>
      )}
      <div className="play-termcard__arrow" style={{ left: arrowLeft }} />
    </div>,
    document.body
  );
}

function KeywordSpan({ value, color, annotations, term, onKeywordHover, onKeywordLeave, onKeywordClick }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [rect, setRect] = useState(null);
  const spanRef = useRef(null);

  function handleEnter() {
    setShowTooltip(true);
    if (spanRef.current) setRect(spanRef.current.getBoundingClientRect());
    if (annotations?.length > 0) {
      onKeywordHover?.(color, annotations);
    }
  }

  function handleLeave() {
    setShowTooltip(false);
    onKeywordLeave?.();
  }

  return (
    <span ref={spanRef} className={`play-kw play-kw--${color}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={() => onKeywordClick?.(color, annotations)}>
      {value}
      {showTooltip && term && <TermTooltip term={term} anchorRect={rect} />}
    </span>
  );
}

function ChatMessage({ msg, onKeywordHover, onKeywordLeave, onKeywordClick, onQuestionSelect, onOptionHover, onOptionLeave }) {
  const parts = parseCoachText(msg.text);

  if (msg.role === "system") {
    return <div className="play-msg play-msg--system"><div className="play-bubble">{msg.text}</div></div>;
  }
  if (msg.role === "user") {
    return <div className="play-msg play-msg--user"><div className="play-msg__who">Vous</div><div className="play-bubble">{msg.text}</div></div>;
  }

  // Build a lookup for terms by label (case-insensitive)
  const termsMap = {};
  (msg.terms || []).forEach((t) => { termsMap[t.label.toLowerCase()] = t; });

  return (
    <div className="play-msg">
      <div className="play-msg__who">Coach</div>
      <div className="play-bubble">
        {parts.map((p, i) =>
          p.type === "kw" ? (
            <KeywordSpan key={i} value={p.value} color={p.color}
              annotations={msg.annotations}
              term={termsMap[p.value.toLowerCase()]}
              onKeywordHover={onKeywordHover}
              onKeywordLeave={onKeywordLeave}
              onKeywordClick={onKeywordClick} />
          ) : <span key={i}>{p.value}</span>
        )}
      </div>
      {msg.question && (
        <QuestionCard question={msg.question}
          onSelect={onQuestionSelect}
          onHover={onOptionHover}
          onLeave={onOptionLeave} />
      )}
    </div>
  );
}

// ─── Question Card ────────────────────────────────────────────────────────────

function QuestionCard({ question, onSelect, onHover, onLeave }) {
  const [selected, setSelected] = useState(null);
  if (!question) return null;

  function handleSelect(opt, i) {
    if (selected !== null) return;
    setSelected(i);
    onSelect?.(opt);
  }

  return (
    <div className="play-qcard">
      <div className="play-qcard__title">{question.title}</div>
      <div className={`play-qcard__opts ${question.type === "plan" ? "play-qcard__opts--row" : ""}`}>
        {(question.opts || []).map((opt, i) => (
          <div key={i}
            className={`play-qopt ${selected === i ? "play-qopt--selected" : ""} ${selected !== null && selected !== i ? "play-qopt--answered" : ""}`}
            onClick={() => handleSelect(opt, i)}
            onMouseEnter={() => onHover?.(opt)}
            onMouseLeave={onLeave}>
            {opt.icon && <div className="play-qopt__icon">{opt.icon}</div>}
            <div className="play-qopt__label">
              {opt.label}
              {opt.sub && <div className="play-qopt__sub">{opt.sub}</div>}
            </div>
            {opt.badge && (
              <span className="play-qopt__badge"
                style={{ background: `var(--color-${opt.badgeColor || "attack"}-a)`, color: `var(--color-${opt.badgeColor || "attack"})` }}>
                {opt.badge}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Thinking ─────────────────────────────────────────────────────────────────

function ThinkingIndicator() {
  return <div className="play-thinking"><div className="play-thinking__dot" /><div className="play-thinking__dot" /><div className="play-thinking__dot" /></div>;
}

// ─── Move List ────────────────────────────────────────────────────────────────

function MoveList({ history }) {
  if (!history || history.length === 0) {
    return <div className="play-movelist__empty">Aucun coup joue</div>;
  }

  const pairs = [];
  for (let i = 0; i < history.length; i += 2) {
    pairs.push({ num: Math.floor(i / 2) + 1, white: history[i], black: history[i + 1] || null });
  }

  return (
    <div className="play-movelist">
      {pairs.map((p) => (
        <div key={p.num} className="play-move-pair">
          <span className="play-move-pair__num">{p.num}.</span>
          <span className="play-move-cell">{p.white}</span>
          {p.black && <span className="play-move-cell">{p.black}</span>}
        </div>
      ))}
    </div>
  );
}

// ─── Chat Panel ───────────────────────────────────────────────────────────────

function ChatPanel({ messages, history, isThinking, onSend, onKeywordHover, onKeywordLeave, onKeywordClick, onQuestionSelect, onOptionHover, onOptionLeave }) {
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages, isThinking]);

  function handleSend() {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  return (
    <div className="play-chat">
      <div className="play-chat__header">
        <div className="play-chat__avatar">A</div>
        <div>
          <div className="play-chat__name">Coach Alea</div>
          <div className="play-chat__sub">Socratique</div>
        </div>
      </div>

      <div className="play-chat__tabs">
        <button className={`play-chat__tab ${activeTab === "chat" ? "play-chat__tab--active" : ""}`} onClick={() => setActiveTab("chat")}>Discussion</button>
        <button className={`play-chat__tab ${activeTab === "moves" ? "play-chat__tab--active" : ""}`} onClick={() => setActiveTab("moves")}>Coups</button>
      </div>

      <div className={`play-chat__panel ${activeTab === "chat" ? "play-chat__panel--active" : ""}`}>
        <div className="play-chat__messages" ref={messagesRef}>
          {messages.length === 0 && !isThinking && (
            <div className="play-chat__welcome">
              <div className="play-chat__welcome-icon">A</div>
              <p>Joue ton premier coup. Je t'accompagne.</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <ChatMessage key={i} msg={msg} onKeywordHover={onKeywordHover} onKeywordLeave={onKeywordLeave} onKeywordClick={onKeywordClick}
              onQuestionSelect={onQuestionSelect} onOptionHover={onOptionHover} onOptionLeave={onOptionLeave} />
          ))}
          {isThinking && <ThinkingIndicator />}
        </div>
        <div className="play-chat__input">
          <div className="play-chat__input-row">
            <textarea className="play-chat__textarea" rows={1} placeholder="Pose une question au coach..."
              value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} />
            <button className="play-chat__send" onClick={handleSend} disabled={isThinking}>
              <i className="fa-solid fa-arrow-up"></i>
            </button>
          </div>
        </div>
      </div>

      <div className={`play-chat__panel ${activeTab === "moves" ? "play-chat__panel--active" : ""}`}>
        <MoveList history={history} />
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ onUndo, onReset, onFlip, onNewGame, level, onLevelChange, onChangeKey }) {
  const levelLabels = { 1: "Déb.", 5: "Facile", 10: "Moyen", 15: "Fort", 20: "Expert" };
  const closest = Object.keys(levelLabels).reduce((a, b) => Math.abs(b - level) < Math.abs(a - level) ? b : a);

  return (
    <div className="play-sidebar">
      <div className="play-sidebar__logo">A</div>
      <div className="play-sidebar__sep" />
      <button className="play-sidebar__btn" onClick={onNewGame} title="Nouvelle partie">
        <i className="fa-solid fa-plus"></i>
        <span className="play-sidebar__tip">Nouvelle partie</span>
      </button>
      <button className="play-sidebar__btn" onClick={onFlip} title="Retourner">
        <i className="fa-solid fa-arrows-up-down"></i>
        <span className="play-sidebar__tip">Retourner le plateau</span>
      </button>
      <button className="play-sidebar__btn" onClick={onUndo} title="Annuler">
        <i className="fa-solid fa-rotate-left"></i>
        <span className="play-sidebar__tip">Annuler le coup</span>
      </button>
      <div className="play-sidebar__sep" />
      <button className="play-sidebar__btn" onClick={onReset} title="Reset">
        <i className="fa-solid fa-arrow-rotate-right"></i>
        <span className="play-sidebar__tip">Recommencer</span>
      </button>

      <div className="play-sidebar__level">
        <input
          type="range"
          min="1"
          max="20"
          value={level}
          onChange={(e) => onLevelChange(Number(e.target.value))}
          className="play-sidebar__level-slider"
        />
        <span className="play-sidebar__level-label">
          {levelLabels[closest]}<br />({level})
        </span>
      </div>

      <div className="play-sidebar__spacer" />
      <button className="play-sidebar__btn" onClick={onChangeKey} title="Changer la cle API">
        <i className="fa-solid fa-key"></i>
        <span className="play-sidebar__tip">Changer la cle API</span>
      </button>
    </div>
  );
}

// ─── Bottom Bar (under board) ─────────────────────────────────────────────────

function BottomBar({ level, onLevelChange }) {
  const levelLabels = { 1: "Debutant", 5: "Facile", 10: "Moyen", 15: "Fort", 20: "Expert" };
  const closest = Object.keys(levelLabels).reduce((a, b) => Math.abs(b - level) < Math.abs(a - level) ? b : a);

  return (
    <div className="play-bottombar">
      <div className="play-bottombar__level">
        <i className="fa-solid fa-robot"></i>
        <span className="play-bottombar__level-label">{levelLabels[closest]} ({level})</span>
        <input type="range" min="1" max="20" value={level}
          onChange={(e) => onLevelChange(Number(e.target.value))}
          className="play-bottombar__slider" />
      </div>
    </div>
  );
}

// ─── Legend ────────────────────────────────────────────────────────────────────

function Legend({ annotations, onToggle }) {
  if (!annotations || annotations.length === 0) return null;
  return (
    <div className="play-legend">
      {annotations.map((a) => (
        <div key={a.id} className="play-legend__pill" onClick={() => onToggle(a)}>
          <span className="play-legend__dot" style={{ background: SEMANTIC_COLORS[a.color]?.hex || a.color }} />
          <span>{a.label}</span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

// ─── BYOK Gate ───────────────────────────────────────────────────────────────

function ApiKeyGate({ onSubmit }) {
  const [key, setKey] = useState(() => localStorage.getItem("alea_api_key") || "");
  const [error, setError] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = key.trim();
    if (!trimmed.startsWith("sk-ant-")) {
      setError("Format invalide. La cle doit commencer par sk-ant-");
      return;
    }
    localStorage.setItem("alea_api_key", trimmed);
    onSubmit(trimmed);
  }

  return (
    <div className="play-byok">
      <div className="play-byok__card">
        <div className="play-byok__logo">A</div>
        <h2 className="play-byok__title">Alea</h2>
        <p className="play-byok__desc">
          Entre ta cle API Anthropic pour activer le coach.
          <br />
          <span className="play-byok__hint">Ta cle reste dans ton navigateur, jamais stockee sur le serveur.</span>
        </p>
        <form onSubmit={handleSubmit} className="play-byok__form">
          <input
            type="password"
            className="play-byok__input"
            placeholder="sk-ant-api03-..."
            value={key}
            onChange={(e) => { setKey(e.target.value); setError(null); }}
            autoFocus
          />
          {error && <div className="play-byok__error">{error}</div>}
          <button type="submit" className="play-byok__btn">
            <i className="fa-solid fa-chess-knight"></i>
            Commencer
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Play() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("alea_api_key") || "");

  if (!apiKey) {
    return <ApiKeyGate onSubmit={setApiKey} />;
  }

  return <PlayBoard apiKey={apiKey} onChangeKey={() => { localStorage.removeItem("alea_api_key"); setApiKey(""); }} />;
}

function PlayBoard({ apiKey, onChangeKey }) {
  const game = useChessGame();
  const stockfish = useStockfish();
  const coach = useCoach(apiKey);
  const annots = useAnnotations();

  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalTargets, setLegalTargets] = useState([]);
  const [dragSource, setDragSource] = useState(null);
  const [stockfishLevel, setStockfishLevel] = useState(5);
  const [flipped, setFlipped] = useState(false);
  const [lastMove, setLastMove] = useState(null);

  const stockfishLevelRef = useRef(stockfishLevel);
  stockfishLevelRef.current = stockfishLevel;

  // Track the last move played by the user for coach context
  const lastUserMoveRef = useRef(null);

  // Eval tracking — detect blunders by comparing eval before/after
  const prevEvalRef = useRef(null);

  // Build board overlays from annotations
  const squareOverlays = {};
  const allArrows = [];
  annots.fixedAnnotations.forEach((a) => {
    (a.squares || []).forEach((sq) => { if (!squareOverlays[sq]) squareOverlays[sq] = a.color; });
    (a.arrows || []).forEach((arr) => allArrows.push(arr));
  });
  if (annots.hoverAnnotation) {
    (annots.hoverAnnotation.squares || []).forEach((sq) => { squareOverlays[sq] = annots.hoverAnnotation.color; });
    (annots.hoverAnnotation.arrows || []).forEach((arr) => allArrows.push(arr));
  }

  // ─── Flow: user plays → Stockfish responds → Build factual report → Coach ─
  useEffect(() => {
    if (game.turn !== "b" || game.gameOver || !stockfish.isReady || stockfish.isThinking) return;

    const timer = setTimeout(async () => {
      try {
        // 1. Stockfish plays as black
        const move = await stockfish.getBestMove(game.fen, stockfishLevelRef.current);
        if (!move || move.length < 4) return;

        const from = move.slice(0, 2);
        const to = move.slice(2, 4);
        const sfResult = game.makeMove(from, to);
        if (!sfResult) return;
        setLastMove([from, to]);

        const userMove = lastUserMoveRef.current;
        if (!userMove) return;

        // Use FRESH fen/legalMoves from the move result (not stale React state)
        const freshFen = sfResult.afterFen;
        const freshLegalMoves = sfResult.afterLegalMoves;

        // 2. Analyze: top 3 moves for WHITE's next turn
        let topMoves = [];
        let currentEval = null;
        try {
          const analysis = await stockfish.getTopMoves(freshFen, 3, 12);
          topMoves = analysis.map((m) => ({
            uci: m.move,
            san: uciToSan(m.move),
            score: m.score,
          }));
          currentEval = analysis[0]?.score ?? null;
        } catch { /* non-blocking */ }

        // 3. Build factual context (internal, not shown to user)
        const opening = identifyOpening(game.history);
        const evalDelta = prevEvalRef.current !== null && currentEval !== null
          ? currentEval - prevEvalRef.current : null;
        prevEvalRef.current = currentEval;

        const context = buildFactualReport({
          userMove,
          sfMove: sfResult.san,
          topMoves,
          currentEval,
          evalDelta,
          opening,
          moveNumber: Math.ceil(game.history.length / 2),
        });

        // Display message = clean, context = factual report (sent separately)
        const displayMsg = `J'ai joue ${userMove}. Stockfish a repondu ${sfResult.san}.`;
        coach.sendMessage(displayMsg, freshFen, currentEval, freshLegalMoves,
          topMoves.map((m) => `${m.san} (${formatScore(m.score)})`), context);
        lastUserMoveRef.current = null;
      } catch (err) {
        console.error("Stockfish error:", err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [game.turn, game.fen, game.gameOver, stockfish.isReady, stockfish.isThinking]);

  // ─── Move execution (click or drag) ───────────────────────────────────
  const executeMove = useCallback((from, to) => {
    if (game.turn !== "w" || game.gameOver) return false;
    const result = game.makeMove(from, to);
    if (result) {
      setLastMove([from, to]);
      lastUserMoveRef.current = result.san;
      setSelectedSquare(null);
      setLegalTargets([]);
      annots.clearAll();
      return true;
    }
    return false;
  }, [game, annots]);

  // ─── Board click handler ──────────────────────────────────────────────
  const handleSquareClick = useCallback((sq) => {
    if (game.turn !== "w" || game.gameOver) return;

    if (selectedSquare) {
      if (legalTargets.includes(sq)) {
        executeMove(selectedSquare, sq);
      } else {
        // Click on another own piece → reselect
        const targets = game.getLegalMoves(sq);
        if (targets.length > 0) {
          setSelectedSquare(sq);
          setLegalTargets(targets);
        } else {
          setSelectedSquare(null);
          setLegalTargets([]);
        }
      }
    } else {
      const targets = game.getLegalMoves(sq);
      if (targets.length > 0) {
        setSelectedSquare(sq);
        setLegalTargets(targets);
      }
    }
  }, [selectedSquare, legalTargets, game, executeMove]);

  // ─── Drag & Drop ──────────────────────────────────────────────────────
  const handleDragStart = useCallback((sq) => {
    if (game.turn !== "w" || game.gameOver) return;
    const targets = game.getLegalMoves(sq);
    if (targets.length > 0) {
      setDragSource(sq);
      setSelectedSquare(sq);
      setLegalTargets(targets);
    }
  }, [game]);

  const handleDrop = useCallback((sq) => {
    if (dragSource && dragSource !== sq) {
      executeMove(dragSource, sq);
    }
    setDragSource(null);
  }, [dragSource, executeMove]);

  // ─── Keyword interactions ─────────────────────────────────────────────
  const handleKwHover = useCallback((color, msgAnnotations) => {
    if (!msgAnnotations) return;
    const m = msgAnnotations.filter((a) => a.color === color);
    if (m.length > 0) annots.setHover({ squares: m.flatMap((a) => a.squares || []), arrows: m.flatMap((a) => a.arrows || []), color });
  }, [annots]);

  const handleKwLeave = useCallback(() => annots.clearHover(), [annots]);

  const handleKwClick = useCallback((color, msgAnnotations) => {
    if (!msgAnnotations) return;
    msgAnnotations.filter((a) => a.color === color).forEach((a) => annots.toggleFixed(a));
  }, [annots]);

  // Question option selected → try to play the move, then let Stockfish + coach flow handle the rest
  const handleQuestionSelect = useCallback((opt) => {
    if (game.turn !== "w" || game.gameOver) return;

    // Try to play the move from onhover arrows (most reliable: has from/to)
    let played = false;
    if (opt.onhover?.arrows?.length > 0) {
      const arrow = opt.onhover.arrows[0];
      const result = game.makeMove(arrow.from, arrow.to);
      if (result) {
        setLastMove([arrow.from, arrow.to]);
        lastUserMoveRef.current = result.san;
        setSelectedSquare(null);
        setLegalTargets([]);
        annots.clearAll();
        played = true;
      }
    }

    // Fallback: try to parse label as SAN (e.g. "Cf3", "e4")
    if (!played && opt.label) {
      const san = opt.label.replace(/[+#!?].*$/, "").trim();
      const result = game.makeMoveSan(san);
      if (result) {
        setLastMove([result.from, result.to]);
        lastUserMoveRef.current = result.san;
        setSelectedSquare(null);
        setLegalTargets([]);
        annots.clearAll();
        played = true;
      }
    }

    // If we couldn't play a move, just send the reply as text to the coach
    if (!played) {
      const reply = opt.reply || opt.label;
      coach.sendMessage(reply, game.fen, null, game.allLegalMoves);
    }
    // If we played a move, the useEffect for Stockfish will fire → then coach will be called automatically
  }, [game, coach, annots]);

  // Question option hover → show board annotations
  const handleOptionHover = useCallback((opt) => {
    if (!opt.onhover) return;
    const sq = (opt.onhover.squares || []).map((s) => typeof s === "string" ? s : s.sq);
    const color = opt.onhover.squares?.[0]?.color || opt.badgeColor || "blue";
    annots.setHover({ squares: sq, arrows: opt.onhover.arrows || [], color });
  }, [annots]);

  const handleOptionLeave = useCallback(() => annots.clearHover(), [annots]);

  // ─── Actions ──────────────────────────────────────────────────────────
  const handleUndo = useCallback(() => {
    game.undo(); // undo Stockfish
    game.undo(); // undo player
    setSelectedSquare(null);
    setLegalTargets([]);
    setLastMove(null);
  }, [game]);

  const handleReset = useCallback(() => {
    game.reset();
    coach.clearConversation();
    annots.clearAll();
    setSelectedSquare(null);
    setLegalTargets([]);
    setLastMove(null);
    lastUserMoveRef.current = null;
  }, [game, coach, annots]);

  const handleCoachSend = useCallback((text) => {
    coach.sendMessage(text, game.fen, null, game.allLegalMoves);
  }, [coach, game.fen, game.allLegalMoves]);

  // ─── Render ───────────────────────────────────────────────────────────
  const playerInfo = { name: "Joueur", letter: "J", style: { background: "#101828", border: "1px solid #1a2e50", color: "#5080b8" } };
  const sfInfo = { name: "Stockfish", rating: `~${stockfishLevel * 100}`, letter: "S", style: { background: "#221a0e", border: "1px solid #40300e", color: "#a07828" } };

  const topPlayer = flipped
    ? { ...playerInfo, active: game.turn === "w", captures: game.captures.b }
    : { ...sfInfo, active: game.turn === "b", captures: game.captures.w };

  const bottomPlayer = flipped
    ? { ...sfInfo, active: game.turn === "b", captures: game.captures.w }
    : { ...playerInfo, active: game.turn === "w", captures: game.captures.b };

  return (
    <div className="play">
      <Sidebar onUndo={handleUndo} onReset={handleReset} onFlip={() => setFlipped(!flipped)} onNewGame={handleReset} level={stockfishLevel} onLevelChange={setStockfishLevel} onChangeKey={onChangeKey} />

      <div className="play-center">
        <PlayerRow name={topPlayer.name} rating={topPlayer.rating} avatarLetter={topPlayer.letter}
          avatarStyle={topPlayer.style} isActive={topPlayer.active} captures={topPlayer.captures} />

        <Board board={game.board} selectedSquare={selectedSquare} legalTargets={legalTargets}
          lastMove={lastMove} squareOverlays={squareOverlays} arrows={allArrows} flipped={flipped}
          onSquareClick={handleSquareClick} onDragStart={handleDragStart} onDrop={handleDrop} />

        <PlayerRow name={bottomPlayer.name} rating={bottomPlayer.rating} avatarLetter={bottomPlayer.letter}
          avatarStyle={bottomPlayer.style} isActive={bottomPlayer.active} captures={bottomPlayer.captures} />

        <Legend annotations={annots.fixedAnnotations} onToggle={annots.toggleFixed} />
      </div>

      <ChatPanel messages={coach.messages} history={game.history} isThinking={coach.isThinking}
        onSend={handleCoachSend} onKeywordHover={handleKwHover} onKeywordLeave={handleKwLeave} onKeywordClick={handleKwClick}
        onQuestionSelect={handleQuestionSelect} onOptionHover={handleOptionHover} onOptionLeave={handleOptionLeave} />
    </div>
  );
}
