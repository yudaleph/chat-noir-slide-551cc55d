import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { useConversations } from "@/hooks/useConversations";

const Index = () => {
  const [config, setConfig] = useState({ apiUrl: "", method: "POST" });
  const conversationHook = useConversations();
  const [ragEnabled, setRagEnabled] = useState(false);
  const [collection, setCollection] = useState("");

  useEffect(() => {
    const savedUrl = localStorage.getItem("chat-api-url") || "";
    const savedMethod = localStorage.getItem("chat-api-method") || "POST";
    setConfig({ apiUrl: savedUrl, method: savedMethod });
    // Assurer un cookie conversation stable
    import("@/lib/cookies").then(({ ensureConversationCookie }) => ensureConversationCookie());
  }, []);

  useEffect(() => {
    // Synchroniser avec le serveur au chargement
    conversationHook.syncWithServer().then(() => {
      // Créer une nouvelle conversation seulement si aucune n'existe après la sync
      if (conversationHook.conversations.length === 0) {
        conversationHook.createConversation();
      }
    });
  }, []);

  return (
    <AppLayout 
      conversationHook={conversationHook}
      ragEnabled={ragEnabled}
      collection={collection}
    >
      <ChatInterface 
        apiUrl={config.apiUrl} 
        method={config.method}
        conversationHook={conversationHook}
        onRagChange={setRagEnabled}
        onCollectionChange={setCollection}
      />
    </AppLayout>
  );
};

export default Index;
