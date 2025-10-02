import { MessageSquare, Settings, Upload, Plus, Trash2, Bot } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { useConversations } from "@/hooks/useConversations";

const menuItems = [
  { title: "Chat", url: "/", icon: MessageSquare },
  { title: "Fichiers", url: "/upload", icon: Upload },
  { title: "Configuration", url: "/config", icon: Settings },
];

interface AppSidebarProps {
  conversationHook: ReturnType<typeof useConversations>;
}

export function AppSidebar({ conversationHook }: AppSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const {
    conversations,
    currentConversationId,
    setCurrentConversationId,
    createConversation,
    deleteConversation,
  } = conversationHook;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary text-primary-foreground font-medium" 
      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-sidebar border-r border-sidebar-border flex flex-col overflow-hidden">
        <div className="p-4 flex-shrink-0 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <h2 className="text-lg font-bold text-sidebar-foreground">Chat IA</h2>
            </div>
          )}
          {collapsed && (
            <div className="flex justify-center mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
          )}
          {!collapsed && (
            <Button 
              className="w-full bg-primary hover:bg-primary/90"
              onClick={createConversation}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Chat
            </Button>
          )}
          {collapsed && (
            <Button 
              size="icon" 
              className="w-full bg-primary hover:bg-primary/90"
              onClick={createConversation}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>

        <SidebarGroup className="flex-shrink-0">
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span className="ml-3">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {currentPath === "/" && (
          <SidebarGroup className="flex-1 min-h-0 overflow-hidden">
            <SidebarGroupLabel className="text-sidebar-foreground/70">
              Historique
            </SidebarGroupLabel>
            <SidebarGroupContent className="overflow-hidden">
              <div className="space-y-1 px-2 overflow-hidden">
                {!collapsed && conversations.length === 0 && (
                  <div className="text-sm text-sidebar-foreground/50 px-3 py-2">
                    Aucun historique
                  </div>
                )}
                {conversations.slice(0, 10).map((conv) => (
                  <div
                    key={conv.id}
                    className={cn(
                      "group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors",
                      currentConversationId === conv.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-sidebar-accent"
                    )}
                    onClick={() => setCurrentConversationId(conv.id)}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {!collapsed && (
                        <>
                          <MessageSquare className="h-4 w-4 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{conv.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {conv.messages.length} messages
                            </p>
                          </div>
                        </>
                      )}
                      {collapsed && <MessageSquare className="h-4 w-4" />}
                    </div>
                    {!collapsed && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}