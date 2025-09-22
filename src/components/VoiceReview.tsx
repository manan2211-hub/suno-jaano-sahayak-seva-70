import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Square, Volume2, Gauge } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface VoiceReview {
  id: string;
  userName: string;
  schemeName: string;
  reviewText: string;
  language: string;
}

interface VoiceReviewProps {
  review: VoiceReview;
  dictionary: Record<string, string>;
  isPlaying: boolean;
  onPlayToggle: (review: VoiceReview) => void;
  onStop: () => void;
}

export function VoiceReview({ review, dictionary, isPlaying, onPlayToggle, onStop }: VoiceReviewProps) {
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState([0.8]);
  const [speed, setSpeed] = useState([0.9]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const progressInterval = useRef<NodeJS.Timeout>();

  const handlePlay = async () => {
    setIsLoading(true);
    try {
      await onPlayToggle(review);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      // Simulate progress tracking
      progressInterval.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval.current);
            return 100;
          }
          return prev + 1;
        });
      }, 100);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      if (!isPlaying) {
        setProgress(0);
      }
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying]);


  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      // Note: Volume can't be changed during playback in most browsers
      toast({
        title: "Volume will apply to next playback",
        description: `Volume set to ${Math.round(newVolume[0] * 100)}%`,
      });
    }
  };

  const handleSpeedChange = (newSpeed: number[]) => {
    setSpeed(newSpeed);
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      toast({
        title: "Speed will apply to next playback",
        description: `Speed set to ${newSpeed[0].toFixed(1)}x`,
      });
    }
  };

  const getLangDisplayName = (langCode: string) => {
    switch (langCode) {
      case "hi-IN": return "Hindi";
      case "bn-IN": return "Bengali";
      case "en-US": return "English";
      default: return langCode.split('-')[0].toUpperCase();
    }
  };

  return (
    <div className="p-4 rounded-lg bg-gradient-to-r from-desi-orange/5 to-desi-yellow/5 border border-desi-orange/10 transition-all duration-300 hover-scale">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-medium text-desi-textDark">{review.userName}</p>
          <p className="text-sm text-desi-textDark/70">{review.schemeName}</p>
          <span className="inline-block px-2 py-1 text-xs bg-desi-purple/10 text-desi-purple rounded-full mt-1">
            {getLangDisplayName(review.language)}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={handlePlay}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isLoading ? "Loading..." : isPlaying ? (dictionary.pause || "Pause") : (dictionary.play || "Play")}
          </Button>
          
          {isPlaying && (
            <Button
              variant="outline"
              size="sm"
              onClick={onStop}
            >
              <Square className="h-4 w-4" />
              {dictionary.stop || "Stop"}
            </Button>
          )}
        </div>
      </div>

      {isPlaying && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-desi-textDark/60">Progress</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-desi-textDark/60" />
            <span className="text-sm text-desi-textDark/60">Volume: {Math.round(volume[0] * 100)}%</span>
          </div>
          <Slider
            value={volume}
            onValueChange={handleVolumeChange}
            max={1}
            min={0}
            step={0.1}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-desi-textDark/60" />
            <span className="text-sm text-desi-textDark/60">Speed: {speed[0].toFixed(1)}x</span>
          </div>
          <Slider
            value={speed}
            onValueChange={handleSpeedChange}
            max={2}
            min={0.5}
            step={0.1}
            className="w-full"
          />
        </div>
      </div>

      <p className="text-sm text-desi-textDark/80 leading-relaxed">{review.reviewText}</p>
    </div>
  );
}