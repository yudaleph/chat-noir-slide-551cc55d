import { AppLayout } from "@/components/layout/AppLayout";
import { VoiceTranscription } from "@/components/speech/VoiceTranscription";

const Transcription = () => {
  return (
    <AppLayout>
      <div className="p-6">
        <VoiceTranscription />
      </div>
    </AppLayout>
  );
};

export default Transcription;