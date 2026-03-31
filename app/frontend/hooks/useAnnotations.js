import { useState, useCallback } from "react";

/**
 * Annotation shape:
 * {
 *   id: string,
 *   label: string,
 *   color: string,           // key from SEMANTIC_COLORS or hex
 *   squares: string[],       // e.g. ['e4', 'd5']
 *   arrows: { from, to, color }[]
 * }
 */

export function useAnnotations() {
  // Persistent annotations toggled by the user or added by the coach
  const [fixedAnnotations, setFixedAnnotations] = useState([]);
  // Transient annotation shown while hovering (e.g. hover over coach message)
  const [hoverAnnotation, setHoverAnnotation] = useState(null);

  /** Show a hover annotation (replaces any previous hover). */
  const setHover = useCallback((annotation) => {
    setHoverAnnotation(annotation);
  }, []);

  /** Clear the hover annotation. */
  const clearHover = useCallback(() => {
    setHoverAnnotation(null);
  }, []);

  /**
   * Toggle a fixed annotation by id.
   * If an annotation with the same id already exists it is removed;
   * otherwise it is added.
   */
  const toggleFixed = useCallback((annotation) => {
    setFixedAnnotations((prev) => {
      const exists = prev.some((a) => a.id === annotation.id);
      if (exists) {
        return prev.filter((a) => a.id !== annotation.id);
      }
      return [...prev, annotation];
    });
  }, []);

  /** Remove all fixed annotations and clear hover. */
  const clearAll = useCallback(() => {
    setFixedAnnotations([]);
    setHoverAnnotation(null);
  }, []);

  /**
   * Replace all fixed annotations at once (used when the coach sends a
   * full set of annotations for a new position).
   */
  const setFixedBulk = useCallback((annotations) => {
    setFixedAnnotations(annotations);
  }, []);

  return {
    fixedAnnotations,
    hoverAnnotation,
    setHover,
    clearHover,
    toggleFixed,
    clearAll,
    setFixedBulk,
  };
}
