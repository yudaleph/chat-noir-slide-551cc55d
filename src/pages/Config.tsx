import { AppLayout } from "@/components/layout/AppLayout";
import { ConfigPage } from "@/components/config/ConfigPage";

const Config = () => {
  const handleConfigChange = (config: { apiUrl: string; method: string }) => {
    // La configuration est déjà sauvegardée dans localStorage par le composant ConfigPage
    console.log("Configuration mise à jour:", config);
  };

  return (
    <AppLayout>
      <ConfigPage onConfigChange={handleConfigChange} />
    </AppLayout>
  );
};

export default Config;