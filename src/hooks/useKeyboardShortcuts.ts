import { useEffect } from "react";

interface UseKeyboardShortcutsProps {
  onPlayPause: () => void;
  onStop: () => void;
  onVolumeUp: () => void;
  onVolumeDown: () => void;
  onSpeedUp: () => void;
  onSpeedDown: () => void;
  isEnabled?: boolean;
}

export function useKeyboardShortcuts({
  onPlayPause,
  onStop,
  onVolumeUp,
  onVolumeDown,
  onSpeedUp,
  onSpeedDown,
  isEnabled = true,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      switch (event.code) {
        case "Space":
          event.preventDefault();
          onPlayPause();
          break;
        case "Escape":
          event.preventDefault();
          onStop();
          break;
        case "ArrowUp":
          if (event.shiftKey) {
            event.preventDefault();
            onVolumeUp();
          }
          break;
        case "ArrowDown":
          if (event.shiftKey) {
            event.preventDefault();
            onVolumeDown();
          }
          break;
        case "ArrowRight":
          if (event.shiftKey) {
            event.preventDefault();
            onSpeedUp();
          }
          break;
        case "ArrowLeft":
          if (event.shiftKey) {
            event.preventDefault();
            onSpeedDown();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [onPlayPause, onStop, onVolumeUp, onVolumeDown, onSpeedUp, onSpeedDown, isEnabled]);
}