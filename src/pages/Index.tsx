import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ChatInterface } from "@/components/chat/ChatInterface";

const Index = () => {
  const [config, setConfig] = useState({ apiUrl: "", method: "POST" });

  useEffect(() => {
    // Charger la configuration depuis localStorage
    const savedUrl = localStorage.getItem("chat-api-url") || "";
    const savedMethod = localStorage.getItem("chat-api-method") || "POST";
    setConfig({ apiUrl: savedUrl, method: savedMethod });
  }, []);

  return (
    <AppLayout>
      <ChatInterface apiUrl={config.apiUrl} method={config.method} />
    </AppLayout>
  );
};

export default Index;
