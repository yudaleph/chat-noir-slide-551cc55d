import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { FileTreeInterface } from "@/components/filetree/FileTreeInterface";

const Upload = () => {
  const [config, setConfig] = useState({ uploadUrl: "", method: "POST" });

  useEffect(() => {
    // Charger la configuration depuis localStorage
    const savedUrl = localStorage.getItem("upload-api-url") || "";
    const savedMethod = localStorage.getItem("upload-api-method") || "GET";
    setConfig({ uploadUrl: savedUrl, method: savedMethod });
  }, []);

  return (
    <AppLayout>
      <FileTreeInterface apiUrl={config.uploadUrl} method={config.method} />
    </AppLayout>
  );
};

export default Upload;