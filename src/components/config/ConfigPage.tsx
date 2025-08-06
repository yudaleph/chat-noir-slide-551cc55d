import { useState, useEffect } from "react";
import { Save, TestTube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

interface ConfigPageProps {
  onConfigChange?: (config: { apiUrl: string; method: string }) => void;
}

export function ConfigPage({ onConfigChange }: ConfigPageProps) {
  const [apiUrl, setApiUrl] = useState("");
  const [method, setMethod] = useState("POST");
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Charger la configuration depuis localStorage
    const savedUrl = localStorage.getItem("chat-api-url");
    const savedMethod = localStorage.getItem("chat-api-method");
    
    if (savedUrl) setApiUrl(savedUrl);
    if (savedMethod) setMethod(savedMethod);
  }, []);

  const saveConfig = () => {
    localStorage.setItem("chat-api-url", apiUrl);
    localStorage.setItem("chat-api-method", method);
    
    onConfigChange?.({ apiUrl, method });
    
    toast({
      title: "Configuration sauvegardée",
      description: "Les paramètres ont été enregistrés avec succès.",
    });
  };

  const testConnection = async () => {
    if (!apiUrl) {
      toast({
        title: "URL requise",
        description: "Veuillez entrer une URL d'API valide.",
        variant: "destructive",
      });
      return;
    }

    setIsTestingConnection(true);
    
    try {
      const response = await fetch(apiUrl, {
        method: "HEAD", // Test simple sans données
      });
      
      if (response.ok || response.status === 405) { // 405 = Method Not Allowed est OK pour un test
        toast({
          title: "Connexion réussie",
          description: "L'API est accessible.",
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: error instanceof Error ? error.message : "Impossible de joindre l'API",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-2xl">Configuration du Chat IA</CardTitle>
          <CardDescription>
            Configurez l'URL de votre API et la méthode HTTP pour les requêtes de chat.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="api-url">URL de l'API</Label>
            <Input
              id="api-url"
              type="url"
              placeholder="https://api.example.com/chat"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="bg-background text-foreground"
            />
            <p className="text-sm text-muted-foreground">
              L'URL de votre endpoint d'API de chat
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Méthode HTTP</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="bg-background text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              La méthode HTTP à utiliser pour envoyer les messages
            </p>
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-medium mb-4">Format des données envoyées</h3>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm text-muted-foreground">
{`FormData {
  message: "contenu du message",
  files: [fichiers uploadés] // optionnel
}`}
              </pre>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Les données sont envoyées en tant que FormData pour supporter l'upload de fichiers.
            </p>
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-medium mb-4">Format de réponse attendu</h3>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm text-muted-foreground">
{`{
  "response": "réponse de l'IA",
  // ou
  "message": "réponse de l'IA"
}`}
              </pre>
            </div>
          </div>

          <div className="flex space-x-4 pt-6">
            <Button onClick={saveConfig} className="bg-primary hover:bg-primary/90">
              <Save className="mr-2 h-4 w-4" />
              Sauvegarder
            </Button>
            
            <Button
              variant="outline"
              onClick={testConnection}
              disabled={isTestingConnection || !apiUrl}
              className="border-border text-foreground hover:bg-accent"
            >
              <TestTube className="mr-2 h-4 w-4" />
              {isTestingConnection ? "Test en cours..." : "Tester la connexion"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}