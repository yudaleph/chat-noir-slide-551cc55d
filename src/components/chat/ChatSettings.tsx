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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface Tool {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface ChatSettingsProps {
  temperature: number;
  onTemperatureChange: (value: number) => void;
  ragEnabled: boolean;
  onRagEnabledChange: (value: boolean) => void;
  ragDocCount: number;
  onRagDocCountChange: (value: number) => void;
  collection: string;
  onCollectionChange: (value: string) => void;
  toolsEnabled: boolean;
  onToolsEnabledChange: (value: boolean) => void;
  enabledTools: string[];
  onEnabledToolsChange: (tools: string[]) => void;
  apiUrl?: string;
}

export function ChatSettings({
  temperature,
  onTemperatureChange,
  ragEnabled,
  onRagEnabledChange,
  ragDocCount,
  onRagDocCountChange,
  collection,
  onCollectionChange,
  toolsEnabled,
  onToolsEnabledChange,
  enabledTools,
  onEnabledToolsChange,
  apiUrl = "",
}: ChatSettingsProps) {
  const [collections, setCollections] = useState<string[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTools, setLoadingTools] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCollections = async () => {
      if (!apiUrl) return;
      
      setLoading(true);
      try {
        const response = await fetch(apiUrl, {
          method: "GET",
        });
        if (!response.ok) throw new Error("Erreur lors de la récupération de l'arborescence");
        
        const data = await response.json();
        const tree = data.tree || data;
        
        // Extraire tous les dossiers de l'arborescence
        const extractFolders = (nodes: any[]): string[] => {
          const folders: string[] = [];
          for (const node of nodes) {
            if (node.type === "folder") {
              folders.push(node.path);
              if (node.children && node.children.length > 0) {
                folders.push(...extractFolders(node.children));
              }
            }
          }
          return folders;
        };
        
        setCollections(extractFolders(tree));
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les collections",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [apiUrl, toast]);

  useEffect(() => {
    const fetchTools = async () => {
      const toolsApiUrl = localStorage.getItem("tools-api-url");
      const toolsApiMethod = localStorage.getItem("tools-api-method") || "GET";
      
      if (!toolsApiUrl) return;
      
      setLoadingTools(true);
      try {
        const response = await fetch(toolsApiUrl, {
          method: toolsApiMethod,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error("Erreur lors de la récupération des outils");
        
        const data = await response.json();
        const fetchedTools = data.tools || data;
        
        if (Array.isArray(fetchedTools)) {
          setTools(fetchedTools);
        }
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les outils",
          variant: "destructive",
        });
      } finally {
        setLoadingTools(false);
      }
    };

    fetchTools();
  }, [toast]);

  const handleToolToggle = (toolId: string, checked: boolean) => {
    if (checked) {
      onEnabledToolsChange([...enabledTools, toolId]);
    } else {
      onEnabledToolsChange(enabledTools.filter(id => id !== toolId));
    }
  };
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

          {/* Sélection de collection */}
          <div className="space-y-2">
            <Label htmlFor="collection">Collection</Label>
            <Select value={collection} onValueChange={onCollectionChange} disabled={loading || collections.length === 0}>
              <SelectTrigger id="collection" className="w-full">
                <SelectValue placeholder={loading ? "Chargement..." : "Sélectionner une collection"} />
              </SelectTrigger>
              <SelectContent>
                {collections.map((col) => (
                  <SelectItem key={col} value={col}>
                    {col}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Sélectionnez la collection à utiliser
            </p>
          </div>

          {/* Activation des outils */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="tools-enabled">Activer les outils</Label>
              <Switch
                id="tools-enabled"
                checked={toolsEnabled}
                onCheckedChange={onToolsEnabledChange}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Permet à l'IA d'utiliser des outils externes
            </p>
          </div>

          {/* Liste des outils */}
          {toolsEnabled && (
            <div className="space-y-2">
              <Label>Outils disponibles</Label>
              {loadingTools ? (
                <p className="text-sm text-muted-foreground">Chargement des outils...</p>
              ) : tools.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun outil disponible. Configurez l'API des outils.</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {tools.map((tool) => (
                    <div key={tool.id} className="flex items-start space-x-3 p-3 border border-border rounded-lg">
                      <Checkbox
                        id={`tool-${tool.id}`}
                        checked={enabledTools.includes(tool.id)}
                        onCheckedChange={(checked) => handleToolToggle(tool.id, checked as boolean)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={`tool-${tool.id}`}
                          className="font-medium cursor-pointer"
                        >
                          {tool.name}
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
