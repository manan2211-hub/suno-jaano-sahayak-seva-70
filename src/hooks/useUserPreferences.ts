import { useState, useEffect } from "react";

interface UserPreferences {
  defaultVolume: number;
  defaultSpeed: number;
  autoplay: boolean;
  keyboardShortcuts: boolean;
  highContrast: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  defaultVolume: 0.8,
  defaultSpeed: 0.9,
  autoplay: false,
  keyboardShortcuts: true,
  highContrast: false,
};

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load preferences from localStorage
    try {
      const stored = localStorage.getItem("voice-review-preferences");
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      }
    } catch (error) {
      console.error("Failed to load user preferences:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);
    
    try {
      localStorage.setItem("voice-review-preferences", JSON.stringify(newPreferences));
    } catch (error) {
      console.error("Failed to save user preferences:", error);
    }
  };

  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
    try {
      localStorage.removeItem("voice-review-preferences");
    } catch (error) {
      console.error("Failed to reset user preferences:", error);
    }
  };

  return {
    preferences,
    updatePreferences,
    resetPreferences,
    isLoaded,
  };
}