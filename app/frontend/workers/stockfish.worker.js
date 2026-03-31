// Stockfish Web Worker
// Loads Stockfish from CDN and bridges UCI communication with the main thread.

/* global importScripts */

const STOCKFISH_CDN =
  "https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js";

let engine = null;
let resolveMove = null;
let isReady = false;

function initEngine() {
  try {
    importScripts(STOCKFISH_CDN);
    // After importScripts, `Stockfish` is a factory function in global scope
    engine = Stockfish(); // eslint-disable-line no-undef

    engine.onmessage = (event) => {
      const line = typeof event === "string" ? event : event.data;
      handleEngineLine(line);
    };

    engine.postMessage("uci");
    engine.postMessage("isready");
  } catch (err) {
    self.postMessage({ type: "error", error: `Failed to load Stockfish: ${err.message}` });
  }
}

function handleEngineLine(line) {
  if (line === "readyok" && !isReady) {
    isReady = true;
    self.postMessage({ type: "ready" });
    return;
  }

  if (line.startsWith("bestmove") && resolveMove) {
    // "bestmove e7e5 ponder ..."  or  "bestmove (none)"
    const parts = line.split(" ");
    const move = parts[1];
    if (move && move !== "(none)") {
      resolveMove({ type: "bestmove", move });
    } else {
      resolveMove({ type: "error", error: "No legal move found" });
    }
    resolveMove = null;
  }
}

function requestBestMove(fen, skillLevel, depth) {
  if (!engine || !isReady) {
    self.postMessage({ type: "error", error: "Engine not ready" });
    return;
  }
  if (resolveMove) {
    // Already thinking — ignore duplicate request
    return;
  }

  resolveMove = (result) => self.postMessage(result);

  engine.postMessage("ucinewgame");
  engine.postMessage(`setoption name Skill Level value ${skillLevel}`);
  engine.postMessage(`position fen ${fen}`);
  engine.postMessage(`go depth ${depth}`);
}

self.onmessage = (event) => {
  const { type, fen, skillLevel, depth } = event.data;

  switch (type) {
    case "init":
      initEngine();
      break;

    case "bestmove":
      requestBestMove(fen, skillLevel, depth);
      break;

    default:
      self.postMessage({ type: "error", error: `Unknown message type: ${type}` });
  }
};
