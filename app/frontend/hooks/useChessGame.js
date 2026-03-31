import { useState, useCallback, useMemo } from "react";
import { Chess } from "chess.js";

const INITIAL_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

// Converts chess.js board array to a flat 8x8 array of piece objects or null
function buildBoard(chess) {
  return chess.board(); // 8x8 array: { type, color } | null
}

export function useChessGame() {
  const [chess] = useState(() => new Chess());
  const [fen, setFen] = useState(INITIAL_FEN);
  const [history, setHistory] = useState([]); // array of SAN strings
  const [gameOver, setGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState(null);

  // Sync react state from chess.js instance
  const sync = useCallback(() => {
    setFen(chess.fen());
    setHistory(chess.history());

    if (chess.isGameOver()) {
      setGameOver(true);
      if (chess.isCheckmate()) setGameOverReason("checkmate");
      else if (chess.isDraw()) setGameOverReason("draw");
      else if (chess.isStalemate()) setGameOverReason("stalemate");
      else if (chess.isThreefoldRepetition()) setGameOverReason("repetition");
      else if (chess.isInsufficientMaterial()) setGameOverReason("insufficient");
      else setGameOverReason("unknown");
    } else {
      setGameOver(false);
      setGameOverReason(null);
    }
  }, [chess]);

  // Make a move by from/to; always promotes to queen
  // Returns the move result + fresh fen/legalMoves (avoids stale React state)
  const makeMove = useCallback(
    (from, to) => {
      try {
        const result = chess.move({ from, to, promotion: "q" });
        if (!result) return null;
        sync();
        result.afterFen = chess.fen();
        result.afterLegalMoves = chess.moves();
        return result;
      } catch {
        return null;
      }
    },
    [chess, sync]
  );

  // Make a move by SAN (supports French notation: C=N, F=B, T=R, D=Q, R=K)
  const makeMoveSan = useCallback(
    (san) => {
      // Try raw SAN first
      try {
        const result = chess.move(san);
        if (result) { sync(); return result; }
      } catch { /* ignore */ }
      // Convert French SAN to English
      const frToEn = { C: "N", F: "B", T: "R", D: "Q", R: "K" };
      const converted = san.replace(/^[CFTDR]/, (ch) => frToEn[ch] || ch);
      if (converted !== san) {
        try {
          const result = chess.move(converted);
          if (result) { sync(); return result; }
        } catch { /* ignore */ }
      }
      return null;
    },
    [chess, sync]
  );

  // Undo the last half-move
  const undo = useCallback(() => {
    const undone = chess.undo();
    if (undone) sync();
    return undone;
  }, [chess, sync]);

  // Reset to starting position
  const reset = useCallback(() => {
    chess.reset();
    sync();
  }, [chess, sync]);

  // Returns legal moves for a given square as an array of target squares
  const getLegalMoves = useCallback(
    (square) => {
      const moves = chess.moves({ square, verbose: true });
      return moves.map((m) => m.to);
    },
    [chess]
  );

  // All legal moves in SAN notation (for sending to coach)
  const allLegalMoves = useMemo(() => chess.moves(), [fen]); // eslint-disable-line react-hooks/exhaustive-deps

  // 8x8 board — recomputed only when FEN changes
  const board = useMemo(() => buildBoard(chess), [fen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Captured pieces — recomputed only when FEN changes
  // Returns { w: [...], b: [...] } where w = pieces white captured (black pieces missing from board)
  // Piece codes: "{color}{TYPE}" e.g. "bP", "wN" — color of the captured piece, type uppercase
  const captures = useMemo(() => { // eslint-disable-line react-hooks/exhaustive-deps
    // Initial counts per color
    const initial = { w: { p: 8, n: 2, b: 2, r: 2, q: 1 }, b: { p: 8, n: 2, b: 2, r: 2, q: 1 } };
    // Count pieces currently on the board
    const current = { w: { p: 0, n: 0, b: 0, r: 0, q: 0 }, b: { p: 0, n: 0, b: 0, r: 0, q: 0 } };
    chess.board().forEach((row) => {
      row.forEach((sq) => {
        if (sq && current[sq.color] !== undefined && sq.type in current[sq.color]) {
          current[sq.color][sq.type]++;
        }
      });
    });
    // Build sorted capture arrays: pieces missing from each color = captured by the opponent
    const buildArray = (color) => {
      const arr = [];
      const prefix = color === "w" ? "w" : "b";
      for (const type of ["q", "r", "b", "n", "p"]) {
        const missing = initial[color][type] - current[color][type];
        for (let i = 0; i < missing; i++) arr.push(`${prefix}${type.toUpperCase()}`);
      }
      return arr;
    };
    return { w: buildArray("w"), b: buildArray("b") };
  }, [fen]); // eslint-disable-line react-hooks/exhaustive-deps

  const turn = chess.turn(); // 'w' | 'b'
  const isCheck = chess.isCheck();

  return {
    // State
    fen,
    history,
    gameOver,
    gameOverReason,
    turn,
    isCheck,
    board,
    allLegalMoves,
    captures,
    // Actions
    makeMove,
    makeMoveSan,
    undo,
    reset,
    getLegalMoves,
  };
}
