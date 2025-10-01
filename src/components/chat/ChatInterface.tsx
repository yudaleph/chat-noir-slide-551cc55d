import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { AudioRecorder } from "@/components/audio/AudioRecorder";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { ChatSettings } from "./ChatSettings";
import { ConversationSidebar } from "./ConversationSidebar";
import { RagIndicator } from "./RagIndicator";
import { useConversations, type Message } from "@/hooks/useConversations";

interface ChatInterfaceProps {
  apiUrl?: string;
  method?: string;
}

export function ChatInterface({ apiUrl = "", method = "POST" }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [audioConfig, setAudioConfig] = useState({ apiUrl: "", method: "POST" });
  const [fileApiUrl, setFileApiUrl] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [ragEnabled, setRagEnabled] = useState(false);
  const [ragDocCount, setRagDocCount] = useState(5);
  const [collection, setCollection] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const {
    conversations,
    currentConversationId,
    setCurrentConversationId,
    createConversation,
    deleteConversation,
    updateConversation,
    getCurrentConversation,
  } = useConversations();

  const currentConversation = getCurrentConversation();
  const messages = currentConversation?.messages || [];

  useEffect(() => {
    const savedAudioUrl = localStorage.getItem("audio-api-url") || "";
    const savedAudioMethod = localStorage.getItem("audio-api-method") || "POST";
    setAudioConfig({ apiUrl: savedAudioUrl, method: savedAudioMethod });
    
    const savedFileApiUrl = localStorage.getItem("upload-api-url") || "";
    setFileApiUrl(savedFileApiUrl);
  }, []);

  useEffect(() => {
    if (conversations.length === 0) {
      createConversation();
    }
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async () => {
    if (!input.trim() && files.length === 0) return;
    if (!apiUrl) {
      toast({
        title: "Configuration requise",
        description: "Veuillez configurer l'URL de l'API dans les paramètres.",
        variant: "destructive",
      });
      return;
    }

    if (!currentConversationId) {
      createConversation();
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: input,
      role: "user",
      timestamp: new Date(),
      files: files.length > 0 ? [...files] : undefined,
    };

    const updatedMessages = [...messages, userMessage];
    updateConversation(currentConversationId, updatedMessages);
    setInput("");
    setFiles([]);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("message", input);
      formData.append("conversation_id", currentConversationId);
      formData.append("temperature", temperature.toString());
      formData.append("rag_enabled", ragEnabled.toString());
      formData.append("rag_doc_count", ragDocCount.toString());
      formData.append("collection", collection);
      
      files.forEach(file => {
        formData.append("files", file);
      });

      const response = await fetch(apiUrl, {
        method: method,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        content: data.response || data.message || "Réponse reçue",
        role: "assistant",
        timestamp: new Date(),
      };

      updateConversation(currentConversationId, [...updatedMessages, assistantMessage]);
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de l'envoi du message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-full bg-background">
      <ConversationSidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={setCurrentConversationId}
        onCreateConversation={createConversation}
        onDeleteConversation={deleteConversation}
      />
      
      <div className="flex flex-col flex-1">
        <div className="border-b border-border p-4 flex items-center justify-between bg-card">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">
              {currentConversation?.title || "Nouvelle conversation"}
            </h2>
          </div>
          <RagIndicator ragEnabled={ragEnabled} collection={collection} />
        </div>
        
        <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              <MessageSquareIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Commencez une conversation</h3>
              <p>Tapez votre message ou uploadez des fichiers pour commencer.</p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <Card
                className={`max-w-[80%] p-4 ${
                  message.role === "user"
                    ? "bg-chat-user text-chat-user-foreground"
                    : "bg-chat-assistant text-chat-assistant-foreground"
                }`}
              >
                <MarkdownRenderer content={message.content} />
                {message.files && message.files.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.files.map((file, index) => (
                      <Badge key={index} variant="secondary" className="mr-1">
                        {file.name}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </Card>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <Card className="bg-chat-assistant text-chat-assistant-foreground p-4">
                <div className="flex items-center justify-center">
                  <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-border p-4">
        <div className="max-w-4xl mx-auto">
          {files.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {files.map((file, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {file.name}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-4 w-4 p-0"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex space-x-2">
            <ChatSettings
              temperature={temperature}
              onTemperatureChange={setTemperature}
              ragEnabled={ragEnabled}
              onRagEnabledChange={setRagEnabled}
              ragDocCount={ragDocCount}
              onRagDocCountChange={setRagDocCount}
              collection={collection}
              onCollectionChange={setCollection}
              apiUrl={fileApiUrl}
            />
            
            <div className="flex-1 relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre message..."
                className="resize-none pr-12 bg-card text-card-foreground"
                rows={1}
              />
              <div className="absolute right-2 top-2 flex space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <AudioRecorder 
                  apiUrl={audioConfig.apiUrl} 
                  method={audioConfig.method}
                  onResponse={(response) => {
                    if (currentConversationId) {
                      const assistantMessage: Message = {
                        id: crypto.randomUUID(),
                        content: response,
                        role: "assistant",
                        timestamp: new Date(),
                      };
                      updateConversation(currentConversationId, [...messages, assistantMessage]);
                    }
                  }}
                />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
            
            <Button
              onClick={sendMessage}
              disabled={isLoading || (!input.trim() && files.length === 0)}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

function MessageSquareIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}