
import { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import SleepStoryCard from "./SleepStoryCard";
import { Moon } from "lucide-react";

interface SleepStory {
  id: string;
  title: string;
  description?: string;
  audio_url: string;
  created_at: string;
  duration?: number;
  category?: string;
  narrator?: string;
  thumbnail_url?: string;
  is_premium?: boolean;
  content_type: string;
  text: string;
}

const SleepStoriesGrid = () => {
  const { toast } = useToast();
  const [sleepStories, setSleepStories] = useState<SleepStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSleepStories = async () => {
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data, error } = await supabase
          .from("manifestations")
          .select("*")
          .eq("content_type", "sleep_story")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching sleep stories:", error);
          setSleepStories([]);
        } else {
          setSleepStories(data || []);
        }
      } catch (error) {
        console.error("Error fetching sleep stories:", error);
        toast({
          title: "Error loading sleep stories",
          description: "There was an error loading the sleep stories.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSleepStories();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sleepStories.map((story) => (
          <SleepStoryCard key={story.id} story={story} />
        ))}
      </div>

      {sleepStories.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
            <Moon className="w-12 h-12 text-indigo-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">No sleep stories yet</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">Sleep stories will appear here once they are added to the library</p>
        </div>
      )}
    </div>
  );
};

export default SleepStoriesGrid;
