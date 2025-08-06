import { useState, useRef } from "react";
import { Upload, X, FileText, Image, Video, Music, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  response?: any;
  error?: string;
}

interface UploadInterfaceProps {
  uploadUrl?: string;
  method?: string;
}

export function UploadInterface({ uploadUrl = "", method = "POST" }: UploadInterfaceProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith("image/")) return <Image className="h-6 w-6" />;
    if (type.startsWith("video/")) return <Video className="h-6 w-6" />;
    if (type.startsWith("audio/")) return <Music className="h-6 w-6" />;
    if (type.includes("zip") || type.includes("rar") || type.includes("tar")) 
      return <Archive className="h-6 w-6" />;
    return <FileText className="h-6 w-6" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const addFiles = (newFiles: FileList) => {
    const fileArray = Array.from(newFiles);
    const uploadFiles: UploadedFile[] = fileArray.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: "pending"
    }));
    
    setFiles(prev => [...prev, ...uploadFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleUpload = async (uploadFile: UploadedFile) => {
    if (!uploadUrl) {
      toast({
        title: "Configuration requise",
        description: "Veuillez configurer l'URL d'upload dans les paramètres.",
        variant: "destructive",
      });
      return;
    }

    setFiles(prev => prev.map(f => 
      f.id === uploadFile.id ? { ...f, status: "uploading" as const } : f
    ));

    try {
      const formData = new FormData();
      formData.append("file", uploadFile.file);

      const xhr = new XMLHttpRequest();
      
      // Gestion de la progression
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id ? { ...f, progress } : f
          ));
        }
      });

      // Gestion de la réponse
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          let response;
          try {
            response = JSON.parse(xhr.responseText);
          } catch {
            response = xhr.responseText;
          }
          
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, status: "completed" as const, progress: 100, response }
              : f
          ));
          
          toast({
            title: "Upload réussi",
            description: `${uploadFile.file.name} a été uploadé avec succès.`,
          });
        } else {
          throw new Error(`HTTP ${xhr.status}: ${xhr.statusText}`);
        }
      });

      // Gestion des erreurs
      xhr.addEventListener("error", () => {
        const error = "Erreur réseau lors de l'upload";
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: "error" as const, error }
            : f
        ));
        
        toast({
          title: "Erreur d'upload",
          description: error,
          variant: "destructive",
        });
      });

      xhr.open(method, uploadUrl);
      xhr.send(formData);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Erreur inconnue";
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: "error" as const, error: errorMsg }
          : f
      ));
      
      toast({
        title: "Erreur d'upload",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  const uploadAllPending = () => {
    const pendingFiles = files.filter(f => f.status === "pending");
    pendingFiles.forEach(file => handleUpload(file));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      addFiles(event.target.files);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    if (event.dataTransfer.files) {
      addFiles(event.dataTransfer.files);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const getStatusColor = (status: UploadedFile["status"]) => {
    switch (status) {
      case "completed": return "bg-primary text-primary-foreground";
      case "uploading": return "bg-accent text-accent-foreground";
      case "error": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: UploadedFile["status"]) => {
    switch (status) {
      case "completed": return "Terminé";
      case "uploading": return "Upload...";
      case "error": return "Erreur";
      default: return "En attente";
    }
  };

  const pendingCount = files.filter(f => f.status === "pending").length;

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Upload className="h-6 w-6" />
            Upload de fichiers
          </CardTitle>
          <CardDescription>
            Glissez-déposez vos fichiers ou cliquez pour les sélectionner.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver 
                ? "border-primary bg-primary/10" 
                : "border-border hover:border-primary/50"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">
              Glissez vos fichiers ici ou cliquez pour parcourir
            </h3>
            <p className="text-muted-foreground">
              Tous types de fichiers acceptés
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          {pendingCount > 0 && (
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {pendingCount} fichier(s) en attente
              </span>
              <Button 
                onClick={uploadAllPending}
                disabled={!uploadUrl}
                className="bg-primary hover:bg-primary/90"
              >
                Uploader tout
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <CardTitle>Fichiers ({files.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {files.map((uploadFile) => (
                  <div key={uploadFile.id} className="flex items-center space-x-4 p-4 bg-accent/50 rounded-lg">
                    <div className="flex-shrink-0 text-muted-foreground">
                      {getFileIcon(uploadFile.file)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium truncate">
                          {uploadFile.file.name}
                        </h4>
                        <Badge className={getStatusColor(uploadFile.status)}>
                          {getStatusText(uploadFile.status)}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-2">
                        {formatFileSize(uploadFile.file.size)}
                      </p>
                      
                      {uploadFile.status === "uploading" && (
                        <Progress value={uploadFile.progress} className="h-2" />
                      )}
                      
                      {uploadFile.status === "error" && uploadFile.error && (
                        <p className="text-xs text-destructive">{uploadFile.error}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {uploadFile.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => handleUpload(uploadFile)}
                          disabled={!uploadUrl}
                          className="bg-primary hover:bg-primary/90"
                        >
                          Upload
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(uploadFile.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}