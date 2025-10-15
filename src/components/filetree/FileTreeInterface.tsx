import { useState, useEffect, useRef } from "react";
import { Folder, File, Upload as UploadIcon, Trash2, RefreshCw, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TreeNode {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  children?: TreeNode[];
}

interface FileTreeInterfaceProps {
  apiUrl?: string;
  method?: string;
}

export function FileTreeInterface({ apiUrl = "", method = "GET" }: FileTreeInterfaceProps) {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (apiUrl) {
      fetchTree();
    }
  }, [apiUrl]);

  const fetchTree = async () => {
    if (!apiUrl) {
      toast({
        title: "Configuration requise",
        description: "Veuillez configurer l'URL de l'API dans les paramètres.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(apiUrl, {
        method: method,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setTree(data.tree || data);
      
      toast({
        title: "Arborescence chargée",
        description: "Les fichiers ont été récupérés avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur de chargement",
        description: error instanceof Error ? error.message : "Impossible de charger l'arborescence",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const uploadFiles = async (files: FileList) => {
    if (!apiUrl || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("path", "/");

        const response = await fetch(apiUrl, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Échec de l'upload de ${file.name}: ${response.statusText}`);
        }
      }

      toast({
        title: "Fichiers uploadés",
        description: `${files.length} fichier(s) uploadé(s) avec succès.`,
      });

      await fetchTree();
    } catch (error) {
      toast({
        title: "Erreur d'upload",
        description: error instanceof Error ? error.message : "Impossible d'uploader les fichiers",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const createFolder = async () => {
    if (!apiUrl || !newFolderName.trim()) return;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "folder",
          path: `/${newFolderName.trim()}`,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      toast({
        title: "Dossier créé",
        description: `Le dossier "${newFolderName}" a été créé avec succès.`,
      });

      setNewFolderName("");
      setIsCreateFolderOpen(false);
      await fetchTree();
    } catch (error) {
      toast({
        title: "Erreur de création",
        description: error instanceof Error ? error.message : "Impossible de créer le dossier",
        variant: "destructive",
      });
    }
  };

  const deleteItem = async (path: string, type: string) => {
    if (!apiUrl) return;

    try {
      const response = await fetch(apiUrl, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: path,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      toast({
        title: `${type === "folder" ? "Dossier" : "Fichier"} supprimé`,
        description: "L'élément a été supprimé avec succès.",
      });

      await fetchTree();
    } catch (error) {
      toast({
        title: "Erreur de suppression",
        description: error instanceof Error ? error.message : "Impossible de supprimer l'élément",
        variant: "destructive",
      });
    }
  };

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderTree = (nodes: TreeNode[], level: number = 0): JSX.Element => {
    return (
      <div className="space-y-1">
        {nodes.map((node) => {
          const isExpanded = expandedFolders.has(node.id);
          const isFolder = node.type === "folder";
          
          return (
            <div key={node.id}>
              <div
                className={`flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 cursor-pointer transition-colors`}
                style={{ paddingLeft: `${level * 20 + 8}px` }}
              >
                <div
                  className="flex items-center gap-2 flex-1"
                  onClick={() => isFolder && toggleFolder(node.id)}
                >
                  {isFolder ? (
                    <Folder className={`h-4 w-4 ${isExpanded ? "text-primary" : "text-muted-foreground"}`} />
                  ) : (
                    <File className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">{node.name}</span>
                </div>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteItem(node.path, node.type)}
                  className="h-6 w-6 p-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              
              {isFolder && isExpanded && node.children && node.children.length > 0 && (
                <div className="mt-1">
                  {renderTree(node.children, level + 1)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Folder className="h-6 w-6" />
                Gestionnaire de fichiers
              </CardTitle>
              <CardDescription>
                Gérez vos fichiers et dossiers via l'API configurée.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchTree}
                disabled={loading || !apiUrl}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Actualiser
              </Button>
              
              <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!apiUrl}
                  >
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Nouveau dossier
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Créer un nouveau dossier</DialogTitle>
                    <DialogDescription>
                      Entrez le nom du dossier à créer.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="folder-name">Nom du dossier</Label>
                      <Input
                        id="folder-name"
                        placeholder="mon-dossier"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            createFolder();
                          }
                        }}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsCreateFolderOpen(false);
                          setNewFolderName("");
                        }}
                      >
                        Annuler
                      </Button>
                      <Button
                        onClick={createFolder}
                        disabled={!newFolderName.trim()}
                      >
                        Créer
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    uploadFiles(e.target.files);
                  }
                }}
              />
              
              <Button
                size="sm"
                disabled={!apiUrl || uploading}
                onClick={handleFileSelect}
                className="bg-primary hover:bg-primary/90"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Upload...
                  </>
                ) : (
                  <>
                    <UploadIcon className="h-4 w-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {!apiUrl ? (
            <div className="text-center py-12 text-muted-foreground">
              <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Veuillez configurer l'URL de l'API dans les paramètres</p>
            </div>
          ) : loading ? (
            <div className="text-center py-12 text-muted-foreground">
              <RefreshCw className="h-12 w-12 mx-auto mb-4 animate-spin" />
              <p>Chargement de l'arborescence...</p>
            </div>
          ) : tree.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun fichier trouvé</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              {renderTree(tree)}
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}