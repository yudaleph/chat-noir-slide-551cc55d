import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { useConversations } from "@/hooks/useConversations";

const Index = () => {
  const [config, setConfig] = useState({ apiUrl: "", method: "POST" });
  const conversationHook = useConversations();

  useEffect(() => {
    const savedUrl = localStorage.getItem("chat-api-url") || "";
    const savedMethod = localStorage.getItem("chat-api-method") || "POST";
    setConfig({ apiUrl: savedUrl, method: savedMethod });
  }, []);

  useEffect(() => {
    if (conversationHook.conversations.length === 0) {
      conversationHook.createConversation();
    }
  }, []);

  return (
    <AppLayout conversationHook={conversationHook}>
      <ChatInterface 
        apiUrl={config.apiUrl} 
        method={config.method}
        conversationHook={conversationHook}
      />
    </AppLayout>
  );
};

export default Index;
