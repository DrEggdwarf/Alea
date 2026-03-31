import { useState, useCallback } from "react";

// Rails CSRF token — injected by the layout as a meta tag
function getCsrfToken() {
  return document.querySelector('meta[name="csrf-token"]')?.content ?? "";
}

/**
 * Manages conversation with the AI coach via POST /api/coach.
 *
 * Each message has the shape:
 *   { role: 'user' | 'assistant', text, annotations, question }
 */
export function useCoach(apiKey = null) {
  // Full conversation log displayed in the UI
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Send a message to the coach.
   * @param {string} text          — the user's message / question
   * @param {string} fen           — current position FEN
   * @param {number|null} evaluation — Stockfish score in centipawns (optional)
   */
  const sendMessage = useCallback(
    async (text, fen, evaluation = null, legalMoves = [], topMoves = [], context = null) => {
      if (!apiKey) {
        setError("API key required");
        return;
      }
      setError(null);

      // Optimistically add the user message (clean text, not the factual report)
      const userMessage = { role: "user", text };
      const nextMessages = [...messages, userMessage];
      setMessages(nextMessages);
      setIsThinking(true);

      // Keep only the last 6 messages (3 exchanges) to prevent context drift.
      const recentMessages = nextMessages.slice(-6);
      const conversationHistory = recentMessages.map((m) => ({
        role: m.role,
        content: m.text,
      }));

      try {
        const response = await fetch("/api/coach", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": getCsrfToken(),
            "X-API-Key": apiKey,
          },
          body: JSON.stringify({
            fen,
            conversation: conversationHistory,
            evaluation,
            legal_moves: legalMoves,
            top_moves: topMoves,
            context,
          }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error ?? `HTTP ${response.status}`);
        }

        const data = await response.json();

        const coachMessage = {
          role: "assistant",
          text: data.text ?? "",
          annotations: data.annotations ?? [],
          question: data.question ?? null,
          terms: data.terms ?? [],
          isKeyMoment: data.is_key_moment ?? false,
        };

        setMessages((prev) => [...prev, coachMessage]);
      } catch (err) {
        setError(err.message);
        // Remove the optimistic user message on failure so the user can retry
        setMessages(messages);
      } finally {
        setIsThinking(false);
      }
    },
    [messages, apiKey]
  );

  const clearConversation = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isThinking,
    error,
    sendMessage,
    clearConversation,
  };
}
