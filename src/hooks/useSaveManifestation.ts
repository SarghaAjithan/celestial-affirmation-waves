
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const useSaveManifestation = (
  generatedText: string,
  audioUrl: string | null,
  mood: number | null,
  voice: string,
  backgroundMusic: string
) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const saveManifestation = async (title: string, onSuccess?: () => void, onError?: () => void) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save manifestations.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase
        .from("manifestations")
        .insert([{
          title,
          text: generatedText,
          audio_url: audioUrl,
          mood,
          voice,
          background_music: backgroundMusic,
          user_id: user.id
        }]);
      if (error) throw error;

      toast({
        title: "Saved to Library",
        description: "Your manifestation has been added to your personal collection."
      });
      onSuccess && onSuccess();
    } catch (error) {
      toast({
        title: "Save failed",
        description: "There was an error saving your manifestation.",
        variant: "destructive"
      });
      onError && onError();
    } finally {
      setIsSaving(false);
    }
  };

  return { isSaving, saveManifestation };
};
