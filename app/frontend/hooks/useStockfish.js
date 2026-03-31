import { useState, useEffect, useRef, useCallback } from "react";

const STOCKFISH_CDN = "https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js";

function levelToParams(level) {
  const clamped = Math.max(1, Math.min(20, level));
  const skillLevel = clamped - 1;
  const depth = Math.round(1 + ((clamped - 1) / 19) * 14);
  return { skillLevel, depth };
}

// Parse a UCI "info" line to extract multipv index, score, and principal variation
function parseInfoLine(line) {
  const mpvMatch = line.match(/multipv\s+(\d+)/);
  const pvMatch = line.match(/\spv\s+(.+)/);
  const cpMatch = line.match(/score cp\s+(-?\d+)/);
  const mateMatch = line.match(/score mate\s+(-?\d+)/);
  const depthMatch = line.match(/depth\s+(\d+)/);

  if (!pvMatch) return null;

  let score = null;
  if (cpMatch) score = parseInt(cpMatch[1], 10);
  else if (mateMatch) score = parseInt(mateMatch[1], 10) > 0 ? 100000 : -100000;

  return {
    multipv: mpvMatch ? parseInt(mpvMatch[1], 10) : 1,
    depth: depthMatch ? parseInt(depthMatch[1], 10) : 0,
    score,
    pv: pvMatch[1].trim().split(/\s+/),
  };
}

export function useStockfish() {
  const workerRef = useRef(null);
  const pendingRef = useRef(null);
  const isReadyRef = useRef(false);
  const isThinkingRef = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  // Collected info lines during analysis (for multipv)
  const infoLinesRef = useRef({});

  useEffect(() => {
    const workerCode = `importScripts("${STOCKFISH_CDN}");`;
    const blob = new Blob([workerCode], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);

    worker.onmessage = (e) => {
      const line = typeof e.data === "string" ? e.data : "";

      if (line === "readyok") {
        isReadyRef.current = true;
        setIsReady(true);
      }

      // Collect info lines with pv data (for multipv analysis)
      if (line.startsWith("info") && line.includes(" pv ")) {
        const parsed = parseInfoLine(line);
        if (parsed) {
          // Keep the deepest info for each multipv slot
          const existing = infoLinesRef.current[parsed.multipv];
          if (!existing || parsed.depth >= existing.depth) {
            infoLinesRef.current[parsed.multipv] = parsed;
          }
        }
      }

      if (line.startsWith("bestmove")) {
        const move = line.split(" ")[1];
        isThinkingRef.current = false;
        setIsThinking(false);

        if (pendingRef.current) {
          const pending = pendingRef.current;
          pendingRef.current = null;

          if (pending.mode === "topMoves") {
            // Resolve with collected multipv data
            const results = [];
            const collected = infoLinesRef.current;
            for (let i = 1; i <= (pending.count || 3); i++) {
              if (collected[i]) {
                results.push({
                  move: collected[i].pv[0],
                  score: collected[i].score,
                  pv: collected[i].pv,
                });
              }
            }
            // Fallback: if no multipv data, use bestmove
            if (results.length === 0 && move && move !== "(none)") {
              results.push({ move, score: null, pv: [move] });
            }
            pending.resolve(results);
          } else {
            // Standard bestmove mode
            if (move && move !== "(none)") {
              pending.resolve(move);
            } else {
              pending.reject(new Error("No legal move"));
            }
          }
        }
      }
    };

    worker.onerror = (err) => {
      console.error("Stockfish worker error:", err);
      isThinkingRef.current = false;
      setIsThinking(false);
      if (pendingRef.current) {
        pendingRef.current.reject(err);
        pendingRef.current = null;
      }
    };

    worker.postMessage("uci");
    worker.postMessage("isready");

    workerRef.current = worker;

    return () => {
      worker.terminate();
      URL.revokeObjectURL(url);
      workerRef.current = null;
    };
  }, []);

  // Get the single best move (for opponent play)
  const getBestMove = useCallback((fen, level = 10) => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current || !isReadyRef.current) {
        reject(new Error("Stockfish not ready"));
        return;
      }
      if (isThinkingRef.current) {
        reject(new Error("Already thinking"));
        return;
      }

      const { skillLevel, depth } = levelToParams(level);
      pendingRef.current = { resolve, reject, mode: "bestmove" };
      infoLinesRef.current = {};
      isThinkingRef.current = true;
      setIsThinking(true);

      const w = workerRef.current;
      w.postMessage("ucinewgame");
      w.postMessage("setoption name Skill Level value " + skillLevel);
      w.postMessage("setoption name MultiPV value 1");
      w.postMessage("position fen " + fen);
      w.postMessage("go depth " + depth);
    });
  }, []);

  // Get top N moves with scores (for coach analysis)
  const getTopMoves = useCallback((fen, count = 3, depth = 12) => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current || !isReadyRef.current) {
        reject(new Error("Stockfish not ready"));
        return;
      }
      if (isThinkingRef.current) {
        reject(new Error("Already thinking"));
        return;
      }

      pendingRef.current = { resolve, reject, mode: "topMoves", count };
      infoLinesRef.current = {};
      isThinkingRef.current = true;
      setIsThinking(true);

      const w = workerRef.current;
      w.postMessage("ucinewgame");
      w.postMessage("setoption name Skill Level value 20");
      w.postMessage("setoption name MultiPV value " + count);
      w.postMessage("position fen " + fen);
      w.postMessage("go depth " + depth);
    });
  }, []);

  return { isReady, isThinking, getBestMove, getTopMoves };
}
