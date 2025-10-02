import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AudioRecorderProps {
  apiUrl: string;
  method: string;
  onResponse?: (response: string) => void;
  conversationId?: string;
  temperature?: number;
  ragEnabled?: boolean;
  ragDocCount?: number;
  collection?: string;
}

export const AudioRecorder = ({ 
  apiUrl, 
  method, 
  onResponse,
  conversationId,
  temperature = 0.7,
  ragEnabled = false,
  ragDocCount = 5,
  collection = ""
}: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await convertAndSend(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'accéder au microphone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const convertAndSend = async (audioBlob: Blob) => {
    if (!apiUrl) {
      toast({
        title: "Configuration manquante",
        description: "Veuillez configurer l'URL de l'API audio",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Convert to WAV using Web Audio API
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const wavBlob = audioBufferToWav(audioBuffer);
      
      const formData = new FormData();
      formData.append('audio', wavBlob, 'recording.wav');
      
      if (conversationId) {
        formData.append('conversation_id', conversationId);
      }
      formData.append('temperature', temperature.toString());
      formData.append('rag_enabled', ragEnabled.toString());
      formData.append('rag_doc_count', ragDocCount.toString());
      formData.append('collection', collection);

      const response = await fetch(apiUrl, {
        method: method,
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const responseText = data.message || data.response || data.text || "Réponse reçue";
        
        if (onResponse) {
          onResponse(responseText);
        }
        
        toast({
          title: "Succès",
          description: "Audio envoyé avec succès",
        });
      } else {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Échec de l'envoi de l'audio",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);

    // Convert float32 to int16
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  };

  if (isUploading) {
    return (
      <Button disabled variant="outline" size="icon">
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <Button
      variant={isRecording ? "destructive" : "outline"}
      size="icon"
      onClick={isRecording ? stopRecording : startRecording}
      className="transition-all duration-200"
    >
      {isRecording ? (
        <Square className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );
};