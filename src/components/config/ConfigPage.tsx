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
  const [uploadUrl, setUploadUrl] = useState("");
  const [uploadMethod, setUploadMethod] = useState("GET");
  const [audioUrl, setAudioUrl] = useState("");
  const [audioMethod, setAudioMethod] = useState("POST");
  const [historyUrl, setHistoryUrl] = useState("");
  const [historyMethod, setHistoryMethod] = useState("GET");
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isTestingUpload, setIsTestingUpload] = useState(false);
  const [isTestingHistory, setIsTestingHistory] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Charger la configuration depuis localStorage
    const savedUrl = localStorage.getItem("chat-api-url");
    const savedMethod = localStorage.getItem("chat-api-method");
    const savedUploadUrl = localStorage.getItem("upload-api-url");
    const savedUploadMethod = localStorage.getItem("upload-api-method");
    const savedAudioUrl = localStorage.getItem("audio-api-url");
    const savedAudioMethod = localStorage.getItem("audio-api-method");
    const savedHistoryUrl = localStorage.getItem("history-api-url");
    const savedHistoryMethod = localStorage.getItem("history-api-method");
    
    if (savedUrl) setApiUrl(savedUrl);
    if (savedMethod) setMethod(savedMethod);
    if (savedUploadUrl) setUploadUrl(savedUploadUrl);
    if (savedUploadMethod) setUploadMethod(savedUploadMethod);
    if (savedAudioUrl) setAudioUrl(savedAudioUrl);
    if (savedAudioMethod) setAudioMethod(savedAudioMethod);
    if (savedHistoryUrl) setHistoryUrl(savedHistoryUrl);
    if (savedHistoryMethod) setHistoryMethod(savedHistoryMethod);
  }, []);

  const saveConfig = () => {
    localStorage.setItem("chat-api-url", apiUrl);
    localStorage.setItem("chat-api-method", method);
    localStorage.setItem("upload-api-url", uploadUrl);
    localStorage.setItem("upload-api-method", uploadMethod);
    localStorage.setItem("audio-api-url", audioUrl);
    localStorage.setItem("audio-api-method", audioMethod);
    localStorage.setItem("history-api-url", historyUrl);
    localStorage.setItem("history-api-method", historyMethod);
    
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
          title: "Connexion chat réussie",
          description: "L'API de chat est accessible.",
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      toast({
        title: "Erreur de connexion chat",
        description: error instanceof Error ? error.message : "Impossible de joindre l'API de chat",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const testUploadConnection = async () => {
    if (!uploadUrl) {
      toast({
        title: "URL d'upload requise",
        description: "Veuillez entrer une URL d'upload valide.",
        variant: "destructive",
      });
      return;
    }

    setIsTestingUpload(true);
    
    try {
      const response = await fetch(uploadUrl, {
        method: "HEAD", // Test simple sans données
      });
      
      if (response.ok || response.status === 405) { // 405 = Method Not Allowed est OK pour un test
        toast({
          title: "Connexion upload réussie",
          description: "L'API d'upload est accessible.",
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      toast({
        title: "Erreur de connexion upload",
        description: error instanceof Error ? error.message : "Impossible de joindre l'API d'upload",
        variant: "destructive",
      });
    } finally {
      setIsTestingUpload(false);
    }
  };

  const testHistoryConnection = async () => {
    if (!historyUrl) {
      toast({
        title: "URL d'historique requise",
        description: "Veuillez entrer une URL d'historique valide.",
        variant: "destructive",
      });
      return;
    }

    setIsTestingHistory(true);
    
    try {
      const response = await fetch(historyUrl, {
        method: historyMethod,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const convs = data.conversations || data;
        toast({
          title: "Connexion historique réussie",
          description: `L'API d'historique est accessible. ${Array.isArray(convs) ? convs.length : 0} conversations trouvées.`,
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      toast({
        title: "Erreur de connexion historique",
        description: error instanceof Error ? error.message : "Impossible de joindre l'API d'historique",
        variant: "destructive",
      });
    } finally {
      setIsTestingHistory(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-2xl">Configuration du Chat IA</CardTitle>
          <CardDescription>
            Configurez les URLs et méthodes HTTP pour le chat et l'upload de fichiers.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Configuration Chat */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b border-border pb-2">API de Chat</h3>
            <div className="space-y-2">
              <Label htmlFor="api-url">URL de l'API Chat</Label>
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
              <Label htmlFor="method">Méthode HTTP Chat</Label>
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

            <Button
              variant="outline"
              onClick={testConnection}
              disabled={isTestingConnection || !apiUrl}
              className="border-border text-foreground hover:bg-accent"
            >
              <TestTube className="mr-2 h-4 w-4" />
              {isTestingConnection ? "Test en cours..." : "Tester la connexion chat"}
            </Button>
          </div>

          {/* Configuration FileTree */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b border-border pb-2">API d'Arborescence de Fichiers</h3>
            
            <div className="space-y-2">
              <Label htmlFor="upload-url">URL de l'API Arborescence</Label>
              <Input
                id="upload-url"
                type="url"
                placeholder="https://api.example.com/files"
                value={uploadUrl}
                onChange={(e) => setUploadUrl(e.target.value)}
                className="bg-background text-foreground"
              />
              <p className="text-sm text-muted-foreground">
                L'URL de votre endpoint d'API de gestion de fichiers
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="upload-method">Méthode HTTP pour récupérer l'arborescence</Label>
              <Select value={uploadMethod} onValueChange={setUploadMethod}>
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                La méthode HTTP à utiliser pour récupérer l'arborescence
              </p>
            </div>

            <Button
              variant="outline"
              onClick={testUploadConnection}
              disabled={isTestingUpload || !uploadUrl}
              className="border-border text-foreground hover:bg-accent"
            >
              <TestTube className="mr-2 h-4 w-4" />
              {isTestingUpload ? "Test en cours..." : "Tester la connexion fichiers"}
            </Button>
            
            <div className="bg-muted p-4 rounded-lg mt-4">
              <h4 className="font-medium mb-2">Format attendu de l'API</h4>
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
{`GET/POST - Récupérer l'arborescence:
Réponse: {
  "tree": [
    {
      "id": "1",
      "name": "dossier1",
      "type": "folder",
      "path": "/dossier1",
      "children": [
        {
          "id": "2",
          "name": "fichier.txt",
          "type": "file",
          "path": "/dossier1/fichier.txt"
        }
      ]
    }
  ]
}

POST - Créer fichier/dossier:
Body: {
  "name": "nom",
  "type": "file|folder",
  "path": "/chemin/parent"
}

DELETE - Supprimer:
Body: {
  "path": "/chemin/element"
}`}
              </pre>
            </div>
          </div>

          {/* Configuration Audio */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b border-border pb-2">API Audio</h3>
            
            <div className="space-y-2">
              <Label htmlFor="audio-url">URL de l'API Audio</Label>
              <Input
                id="audio-url"
                type="url"
                placeholder="https://api.example.com/audio"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                className="bg-background text-foreground"
              />
              <p className="text-sm text-muted-foreground">
                L'URL de votre endpoint d'API d'enregistrement audio
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audio-method">Méthode HTTP Audio</Label>
              <Select value={audioMethod} onValueChange={setAudioMethod}>
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
                La méthode HTTP à utiliser pour envoyer les enregistrements audio
              </p>
            </div>
          </div>

          {/* Configuration Historique */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b border-border pb-2">API Historique</h3>
            
            <div className="space-y-2">
              <Label htmlFor="history-url">URL de l'API Historique</Label>
              <Input
                id="history-url"
                type="url"
                placeholder="https://api.example.com/history"
                value={historyUrl}
                onChange={(e) => setHistoryUrl(e.target.value)}
                className="bg-background text-foreground"
              />
              <p className="text-sm text-muted-foreground">
                L'URL de votre endpoint d'API d'historique des conversations
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="history-method">Méthode HTTP Historique</Label>
              <Select value={historyMethod} onValueChange={setHistoryMethod}>
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                La méthode HTTP à utiliser pour récupérer l'historique
              </p>
            </div>

            <Button
              variant="outline"
              onClick={testHistoryConnection}
              disabled={isTestingHistory || !historyUrl}
              className="border-border text-foreground hover:bg-accent"
            >
              <TestTube className="mr-2 h-4 w-4" />
              {isTestingHistory ? "Test en cours..." : "Tester la connexion historique"}
            </Button>

            <div className="bg-muted p-4 rounded-lg mt-4">
              <h4 className="font-medium mb-2">Format attendu de l'API</h4>
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
{`GET/POST - Récupérer l'historique:
Réponse: {
  "conversations": [
    {
      "id": "uuid",
      "title": "Titre de la conversation",
      "messages": [
        {
          "id": "uuid",
          "content": "message",
          "role": "user|assistant",
          "timestamp": "2024-01-01T00:00:00Z"
        }
      ],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}`}
              </pre>
            </div>
          </div>

          {/* Format des données */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b border-border pb-2">Formats de données</h3>
            <div>
              <h4 className="font-medium mb-2">Format Chat</h4>
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


            <div>
              <h4 className="font-medium mb-2">Format Audio</h4>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm text-muted-foreground">
{`FormData {
  audio: [fichier .wav enregistré]
}`}
                </pre>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                L'enregistrement audio est automatiquement converti en .wav et envoyé en tant que FormData.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Format de réponse attendu</h4>
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
          </div>

          <div className="flex space-x-4 pt-6 border-t border-border">
            <Button onClick={saveConfig} className="bg-primary hover:bg-primary/90">
              <Save className="mr-2 h-4 w-4" />
              Sauvegarder tout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}