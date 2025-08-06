import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex flex-col flex-1">
          <header className="h-14 flex items-center border-b border-border bg-card px-4">
            <SidebarTrigger className="text-foreground hover:bg-accent" />
            <h1 className="ml-4 text-lg font-semibold text-foreground">Chat IA</h1>
          </header>
          
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}