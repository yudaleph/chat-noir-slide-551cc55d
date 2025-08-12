import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Copy, Trash2, Send } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export const VoiceTranscription = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [chatConfig, setChatConfig] = useState({ apiUrl: "", method: "POST" });
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Charger la configuration chat depuis localStorage
    const savedChatUrl = localStorage.getItem("chat-api-url") || "";
    const savedChatMethod = localStorage.getItem("chat-api-method") || "POST";
    setChatConfig({ apiUrl: savedChatUrl, method: savedChatMethod });

    // Vérifier le support de la reconnaissance vocale
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'fr-FR';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript + ' ';
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
        }
        setInterimTranscript(interimTranscript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Erreur de reconnaissance vocale:', event.error);
        setIsListening(false);
        toast({
          title: "Erreur",
          description: `Erreur de reconnaissance vocale: ${event.error}`,
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [toast]);

  const startListening = async () => {
    if (recognitionRef.current && !isListening) {
      try {
        // Demander l'autorisation d'accès au microphone
        await navigator.mediaDevices.getUserMedia({ audio: true });
        
        recognitionRef.current.start();
        setIsListening(true);
        toast({
          title: "Écoute en cours",
          description: "La transcription vocale a commencé",
        });
      } catch (error) {
        console.error('Erreur lors du démarrage:', error);
        
        if (error instanceof Error) {
          if (error.name === 'NotAllowedError') {
            toast({
              title: "Permission refusée",
              description: "Veuillez autoriser l'accès au microphone pour utiliser cette fonction",
              variant: "destructive",
            });
          } else if (error.name === 'NotFoundError') {
            toast({
              title: "Microphone introuvable",
              description: "Aucun microphone n'a été détecté sur votre appareil",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Erreur",
              description: "Impossible de démarrer la reconnaissance vocale",
              variant: "destructive",
            });
          }
        }
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      toast({
        title: "Arrêt",
        description: "La transcription vocale s'est arrêtée",
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(transcript);
      toast({
        title: "Copié",
        description: "Le texte a été copié dans le presse-papiers",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le texte",
        variant: "destructive",
      });
    }
  };

  const clearTranscript = () => {
    setTranscript("");
    setInterimTranscript("");
  };

  const sendToChat = async () => {
    if (!transcript.trim()) {
      toast({
        title: "Aucun texte",
        description: "Aucun texte à envoyer",
        variant: "destructive",
      });
      return;
    }

    if (!chatConfig.apiUrl) {
      toast({
        title: "Configuration manquante",
        description: "Veuillez configurer l'URL de l'API chat dans les paramètres.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      const formData = new FormData();
      formData.append("message", transcript);

      const response = await fetch(chatConfig.apiUrl, {
        method: chatConfig.method,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      toast({
        title: "Succès",
        description: "Transcription envoyée au chat avec succès",
      });

      // Optionnel: vider la transcription après envoi
      clearTranscript();

    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de l'envoi",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!isSupported) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <MicOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Reconnaissance vocale non supportée</h3>
          <p>Votre navigateur ne supporte pas la reconnaissance vocale.</p>
          <p className="text-sm mt-2">Veuillez utiliser Chrome, Edge ou Safari.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Transcription Vocale</h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              disabled={!transcript}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={sendToChat}
              disabled={!transcript || isSending}
            >
              {isSending ? "Envoi..." : <Send className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearTranscript}
              disabled={!transcript && !interimTranscript}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <Button
            variant={isListening ? "destructive" : "default"}
            size="lg"
            onClick={isListening ? stopListening : startListening}
            className="h-16 w-16 rounded-full"
          >
            {isListening ? (
              <MicOff className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Transcription
            </label>
            <Textarea
              value={transcript + (interimTranscript ? ` ${interimTranscript}` : '')}
              readOnly
              className="mt-1 min-h-[200px] bg-muted/50"
              placeholder="Cliquez sur le microphone et commencez à parler..."
            />
          </div>

          {isListening && (
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 bg-destructive rounded-full animate-pulse" />
              <span>Écoute en cours...</span>
            </div>
          )}

          {interimTranscript && (
            <div className="p-2 bg-muted/30 rounded text-sm text-muted-foreground">
              <strong>En cours:</strong> {interimTranscript}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};