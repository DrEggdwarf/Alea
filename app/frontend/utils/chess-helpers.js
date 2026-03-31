export const PIECE_UNICODE = {
  wK: "♔", wQ: "♕", wR: "♖", wB: "♗", wN: "♘", wP: "♙",
  bK: "♚", bQ: "♛", bR: "♜", bB: "♝", bN: "♞", bP: "♟",
};

export const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
export const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"];

export function squareToCoords(sq) {
  return { col: FILES.indexOf(sq[0]), row: RANKS.indexOf(sq[1]) };
}

export function coordsToSquare(col, row) {
  return `${FILES[col]}${RANKS[row]}`;
}

// Matches the design tokens in globals.css
export const SEMANTIC_COLORS = {
  red:   { hex: "#e05252", rgba: "rgba(224,82,82,0.48)",   stroke: "rgba(224,82,82,0.8)" },
  blue:  { hex: "#4e90e0", rgba: "rgba(78,144,224,0.42)",  stroke: "rgba(78,144,224,0.8)" },
  green: { hex: "#52be6a", rgba: "rgba(82,190,106,0.38)",  stroke: "rgba(82,190,106,0.8)" },
  yel:   { hex: "#e0b83a", rgba: "rgba(224,184,58,0.42)",  stroke: "rgba(224,184,58,0.8)" },
  vio:   { hex: "#a06ae0", rgba: "rgba(160,106,224,0.38)", stroke: "rgba(160,106,224,0.8)" },
  pink:  { hex: "#e06aaa", rgba: "rgba(224,106,170,0.38)", stroke: "rgba(224,106,170,0.8)" },
};
