import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface VoiceReview {
  id: string;
  userName: string;
  schemeName: string;
  reviewText: string;
  language: string;
}

interface UseSpeechSynthesisReturn {
  playingReviewId: string | null;
  availableVoices: SpeechSynthesisVoice[];
  isLoading: boolean;
  playReview: (review: VoiceReview, volume?: number, rate?: number) => Promise<void>;
  stopReview: () => void;
  pauseReview: () => void;
  resumeReview: () => void;
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [playingReviewId, setPlayingReviewId] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initVoices = () => {
      if (window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        console.log("Available voices:", voices.map(v => `${v.name} (${v.lang})`));
      }
    };
    
    initVoices();
    
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = initVoices;
    }
    
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const getBestVoiceForLanguage = useCallback((langCode: string): SpeechSynthesisVoice | null => {
    if (!window.speechSynthesis || availableVoices.length === 0) {
      return null;
    }
    
    const exactMatch = availableVoices.find(voice => 
      voice.lang.toLowerCase() === langCode.toLowerCase()
    );
    
    if (exactMatch) {
      console.log(`Found exact match for ${langCode}: ${exactMatch.name}`);
      return exactMatch;
    }
    
    const langPrefix = langCode.split('-')[0].toLowerCase();
    const partialMatch = availableVoices.find(voice => 
      voice.lang.toLowerCase().startsWith(langPrefix)
    );
    
    if (partialMatch) {
      console.log(`Found partial match for ${langCode}: ${partialMatch.name} (${partialMatch.lang})`);
      return partialMatch;
    }
    
    console.log(`No voice found for ${langCode}, falling back to default voice`);
    return null;
  }, [availableVoices]);

  const playReview = useCallback(async (review: VoiceReview, volume = 0.8, rate = 0.9) => {
    if (!window.speechSynthesis) {
      toast({
        title: "Speech synthesis not supported",
        description: "Your browser does not support speech synthesis.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Stop any currently playing speech
    if (playingReviewId === review.id) {
      window.speechSynthesis.cancel();
      setPlayingReviewId(null);
      setCurrentUtterance(null);
      setIsLoading(false);
      return;
    }

    if (playingReviewId) {
      window.speechSynthesis.cancel();
    }

    try {
      // Small delay to ensure speech synthesis is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const utterance = new SpeechSynthesisUtterance(review.reviewText);
      
      utterance.lang = review.language;
      utterance.volume = volume;
      utterance.rate = rate;
      
      const bestVoice = getBestVoiceForLanguage(review.language);
      if (bestVoice) {
        utterance.voice = bestVoice;
        console.log(`Selected voice: ${bestVoice.name} (${bestVoice.lang}) for language ${review.language}`);
      } else {
        console.log(`No specific voice found for ${review.language}, using default voice`);
      }

      utterance.onstart = () => {
        setIsLoading(false);
        setPlayingReviewId(review.id);
      };

      utterance.onend = () => {
        setPlayingReviewId(null);
        setCurrentUtterance(null);
      };

      utterance.onerror = (event) => {
        console.error("SpeechSynthesis error:", event);
        toast({
          title: "Playback error",
          description: "There was an error playing this review.",
          variant: "destructive",
        });
        setPlayingReviewId(null);
        setCurrentUtterance(null);
        setIsLoading(false);
      };

      setCurrentUtterance(utterance);
      
      window.speechSynthesis.speak(utterance);
      
      const langName = getLangDisplayName(review.language);
      
      toast({
        title: "Playing review",
        description: `Playing ${review.userName}'s review in ${langName}`,
      });
    } catch (error) {
      console.error("Speech synthesis error:", error);
      toast({
        title: "Playback error",
        description: "There was an error playing this review.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }, [playingReviewId, getBestVoiceForLanguage, toast]);

  const stopReview = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setPlayingReviewId(null);
      setCurrentUtterance(null);
    }
  }, []);

  const pauseReview = useCallback(() => {
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
    }
  }, []);

  const resumeReview = useCallback(() => {
    if (window.speechSynthesis && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }, []);

  return {
    playingReviewId,
    availableVoices,
    isLoading,
    playReview,
    stopReview,
    pauseReview,
    resumeReview,
  };
}

function getLangDisplayName(langCode: string): string {
  switch (langCode) {
    case "hi-IN": return "Hindi";
    case "bn-IN": return "Bengali";
    case "en-US": return "English";
    default: return langCode.split('-')[0].toUpperCase();
  }
}