import { Database, FolderOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RagIndicatorProps {
  ragEnabled: boolean;
  collection: string;
}

export function RagIndicator({ ragEnabled, collection }: RagIndicatorProps) {
  if (!ragEnabled) {
    return (
      <Badge variant="outline" className="flex items-center gap-2">
        <Database className="h-3 w-3" />
        <span className="text-xs">RAG désactivé</span>
      </Badge>
    );
  }

  return (
    <Badge variant="default" className="flex items-center gap-2 bg-primary/20 text-primary hover:bg-primary/30">
      <Database className="h-3 w-3" />
      <span className="text-xs">RAG activé</span>
      {collection && (
        <>
          <span className="text-xs opacity-50">|</span>
          <FolderOpen className="h-3 w-3" />
          <span className="text-xs font-semibold">{collection}</span>
        </>
      )}
    </Badge>
  );
}
