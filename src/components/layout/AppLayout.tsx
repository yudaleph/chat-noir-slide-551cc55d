import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { RagIndicator } from "@/components/chat/RagIndicator";
import type { useConversations } from "@/hooks/useConversations";

interface AppLayoutProps {
  children: React.ReactNode;
  conversationHook?: ReturnType<typeof useConversations>;
  ragEnabled?: boolean;
  collection?: string;
}

export function AppLayout({ children, conversationHook, ragEnabled = false, collection = "" }: AppLayoutProps) {
  const currentConversation = conversationHook?.getCurrentConversation();
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {conversationHook ? (
          <AppSidebar conversationHook={conversationHook} />
        ) : (
          <AppSidebar conversationHook={{
            conversations: [],
            currentConversationId: null,
            setCurrentConversationId: () => {},
            createConversation: () => "",
            deleteConversation: () => {},
            updateConversation: () => {},
            getCurrentConversation: () => null,
            syncWithServer: async () => {},
            isSyncing: false,
          }} />
        )}
        
        <div className="flex flex-col flex-1">
          <header className="h-14 flex items-center justify-between border-b border-border bg-card px-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-foreground hover:bg-accent" />
              <h1 className="text-lg font-semibold text-foreground">
                {currentConversation?.title || "Nouvelle conversation"}
              </h1>
            </div>
            <RagIndicator ragEnabled={ragEnabled} collection={collection} />
          </header>
          
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}