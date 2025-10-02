import { useState, useEffect } from "react";

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

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const convs = parsed.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
          messages: c.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })),
        }));
        setConversations(convs);
        if (convs.length > 0 && !currentConversationId) {
          setCurrentConversationId(convs[0].id);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des conversations:", error);
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
    return newConv.id;
  };

  const deleteConversation = (id: string) => {
    const updated = conversations.filter((c) => c.id !== id);
    saveConversations(updated);
    if (currentConversationId === id) {
      setCurrentConversationId(updated.length > 0 ? updated[0].id : null);
    }
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
  };
}
