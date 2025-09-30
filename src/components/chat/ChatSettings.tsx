import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

interface ChatSettingsProps {
  temperature: number;
  onTemperatureChange: (value: number) => void;
  ragEnabled: boolean;
  onRagEnabledChange: (value: boolean) => void;
  ragDocCount: number;
  onRagDocCountChange: (value: number) => void;
}

export function ChatSettings({
  temperature,
  onTemperatureChange,
  ragEnabled,
  onRagEnabledChange,
  ragDocCount,
  onRagDocCountChange,
}: ChatSettingsProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Paramètres du Chat</SheetTitle>
          <SheetDescription>
            Configurez les paramètres de l'IA pour personnaliser les réponses.
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          {/* Température */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="temperature">Température</Label>
              <span className="text-sm text-muted-foreground">{temperature.toFixed(2)}</span>
            </div>
            <Slider
              id="temperature"
              min={0}
              max={2}
              step={0.1}
              value={[temperature]}
              onValueChange={(values) => onTemperatureChange(values[0])}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Contrôle la créativité des réponses (0 = déterministe, 2 = très créatif)
            </p>
          </div>

          {/* Activation RAG */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="rag-enabled">Activer le RAG</Label>
              <Switch
                id="rag-enabled"
                checked={ragEnabled}
                onCheckedChange={onRagEnabledChange}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Utilise les documents pour enrichir les réponses
            </p>
          </div>

          {/* Nombre de documents RAG */}
          {ragEnabled && (
            <div className="space-y-2">
              <Label htmlFor="rag-docs">Nombre de documents</Label>
              <Input
                id="rag-docs"
                type="number"
                min={1}
                max={20}
                value={ragDocCount}
                onChange={(e) => onRagDocCountChange(parseInt(e.target.value) || 1)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Nombre de documents à utiliser pour le RAG (1-20)
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
