import { useState, useEffect } from "react";
import { getConversationIds, addConversationId, removeConversationId, setConversationIds } from "@/lib/cookies";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  files?: File[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

const STORAGE_KEY = "chat-conversations";

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadConversationsFromCookie();
  }, []);

  const loadConversationsFromCookie = () => {
    try {
      // Récupérer les données depuis localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setConversations([]);
        return;
      }

      const storedConvs: any[] = JSON.parse(stored);
      
      // Créer les conversations depuis localStorage
      const convs = storedConvs.map(conv => ({
        ...conv,
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt),
        messages: Array.isArray(conv.messages) ? conv.messages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        })) : [],
      }));

      setConversations(convs);
      
      // Synchroniser les IDs dans le cookie
      setConversationIds(convs.map(c => c.id));
      
      if (convs.length > 0 && !currentConversationId) {
        setCurrentConversationId(convs[0].id);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des conversations:", error);
      setConversations([]);
    }
  };

  const syncWithServer = async () => {
    const historyUrl = localStorage.getItem("history-api-url");
    const historyMethod = localStorage.getItem("history-api-method") || "GET";
    
    if (!historyUrl) {
      console.log("Aucune API d'historique configurée");
      return;
    }

    setIsSyncing(true);
    try {
      const response = await fetch(historyUrl, {
        method: historyMethod,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const serverConvs = data.conversations || data;
      
      if (Array.isArray(serverConvs) && serverConvs.length > 0) {
        const convs = serverConvs.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
          messages: Array.isArray(c.messages) ? c.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })) : [],
        }));
        
        // Mettre à jour le cookie d'IDs pour la reconstruction au reload
        setConversationIds(convs.map((c: any) => c.id));
        // Sauvegarder l'historique récupéré
        saveConversations(convs);
        console.log(`${convs.length} conversations synchronisées depuis le serveur`);
      }
    } catch (error) {
      console.error("Erreur lors de la synchronisation de l'historique:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const saveConversations = (convs: Conversation[]) => {
    try {
      // Remove files from messages before saving (files are not serializable)
      const serializable = convs.map(c => ({
        ...c,
        messages: c.messages.map(m => ({
          ...m,
          files: undefined // Don't persist files
        }))
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
      setConversations(convs);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des conversations:", error);
    }
  };

  const createConversation = () => {
    const newConv: Conversation = {
      id: crypto.randomUUID(),
      title: `Nouvelle conversation ${conversations.length + 1}`,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updated = [newConv, ...conversations];
    saveConversations(updated);
    setCurrentConversationId(newConv.id);
    
    // Ajouter l'ID au cookie
    addConversationId(newConv.id);
    
    return newConv.id;
  };

  const deleteConversation = (id: string) => {
    const updated = conversations.filter((c) => c.id !== id);
    saveConversations(updated);
    if (currentConversationId === id) {
      setCurrentConversationId(updated.length > 0 ? updated[0].id : null);
    }
    
    // Retirer l'ID du cookie
    removeConversationId(id);
  };

  const updateConversation = (id: string, messages: Message[]) => {
    const updated = conversations.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          messages,
          updatedAt: new Date(),
          title: messages.length > 0 && c.title.startsWith("Nouvelle conversation") 
            ? messages[0].content.slice(0, 50) + (messages[0].content.length > 50 ? "..." : "")
            : c.title,
        };
      }
      return c;
    });
    saveConversations(updated);
  };

  const getCurrentConversation = (): Conversation | null => {
    return conversations.find((c) => c.id === currentConversationId) || null;
  };

  return {
    conversations,
    currentConversationId,
    setCurrentConversationId,
    createConversation,
    deleteConversation,
    updateConversation,
    getCurrentConversation,
    syncWithServer,
    isSyncing,
  };
}
