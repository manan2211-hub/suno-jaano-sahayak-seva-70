import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Settings, Volume2, Gauge, Keyboard, Eye, RotateCcw } from "lucide-react";
import { useUserPreferences } from "@/hooks/useUserPreferences";

interface VoiceReviewSettingsProps {
  dictionary: Record<string, string>;
}

export function VoiceReviewSettings({ dictionary }: VoiceReviewSettingsProps) {
  const { preferences, updatePreferences, resetPreferences, isLoaded } = useUserPreferences();

  if (!isLoaded) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in border-2 border-desi-purple/10">
      <CardHeader className="bg-gradient-to-r from-desi-purple/10 to-desi-blue/10">
        <CardTitle className="flex items-center gap-2 text-desi-textDark">
          <Settings className="h-5 w-5" />
          {dictionary.voiceSettings || "Voice Settings"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Volume Setting */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-desi-textDark/60" />
            <Label className="text-sm font-medium">
              {dictionary.defaultVolume || "Default Volume"}: {Math.round(preferences.defaultVolume * 100)}%
            </Label>
          </div>
          <Slider
            value={[preferences.defaultVolume]}
            onValueChange={([value]) => updatePreferences({ defaultVolume: value })}
            max={1}
            min={0}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Speed Setting */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-desi-textDark/60" />
            <Label className="text-sm font-medium">
              {dictionary.defaultSpeed || "Default Speed"}: {preferences.defaultSpeed.toFixed(1)}x
            </Label>
          </div>
          <Slider
            value={[preferences.defaultSpeed]}
            onValueChange={([value]) => updatePreferences({ defaultSpeed: value })}
            max={2}
            min={0.5}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Autoplay Setting */}
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">
            {dictionary.autoplay || "Autoplay next review"}
          </Label>
          <Switch
            checked={preferences.autoplay}
            onCheckedChange={(checked) => updatePreferences({ autoplay: checked })}
          />
        </div>

        {/* Keyboard Shortcuts */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard className="h-4 w-4 text-desi-textDark/60" />
            <Label className="text-sm font-medium">
              {dictionary.keyboardShortcuts || "Keyboard shortcuts"}
            </Label>
          </div>
          <Switch
            checked={preferences.keyboardShortcuts}
            onCheckedChange={(checked) => updatePreferences({ keyboardShortcuts: checked })}
          />
        </div>

        {/* High Contrast */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-desi-textDark/60" />
            <Label className="text-sm font-medium">
              {dictionary.highContrast || "High contrast mode"}
            </Label>
          </div>
          <Switch
            checked={preferences.highContrast}
            onCheckedChange={(checked) => updatePreferences({ highContrast: checked })}
          />
        </div>

        {/* Keyboard Shortcuts Guide */}
        {preferences.keyboardShortcuts && (
          <div className="p-4 bg-desi-blue/5 rounded-lg border border-desi-blue/10 animate-fade-in">
            <h4 className="font-medium text-sm mb-2 text-desi-textDark">
              {dictionary.keyboardShortcuts || "Keyboard Shortcuts"}:
            </h4>
            <div className="text-xs text-desi-textDark/70 space-y-1">
              <div><kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Space</kbd> - Play/Pause</div>
              <div><kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Esc</kbd> - Stop</div>
              <div><kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Shift + ↑/↓</kbd> - Volume</div>
              <div><kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Shift + ←/→</kbd> - Speed</div>
            </div>
          </div>
        )}

        {/* Reset Button */}
        <div className="pt-4 border-t border-desi-purple/10">
          <Button
            variant="outline"
            size="sm"
            onClick={resetPreferences}
            className="w-full hover-scale"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {dictionary.resetSettings || "Reset to defaults"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}