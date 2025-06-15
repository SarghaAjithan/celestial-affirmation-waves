import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Heart, ArrowLeft, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Manifestation {
  id: string;
  title: string;
  text: string;
  audio_url: string;
  created_at: string;
  playCount?: number;
  lastPlayed?: string;
  journalEntries?: number;
  mood?: number;
  voice?: string;
  background_music?: string;
}

const LibraryGrid = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [manifestations, setManifestations] = useState<Manifestation[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch manifestations from Supabase
    const fetchManifestations = async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase
        .from("manifestations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        setManifestations([]);
      } else {
        setManifestations(data || []);
      }
    };
    fetchManifestations();
  }, []);

  const handlePlay = (manifestation: Manifestation) => {
    // Navigate to the immersive Now Playing screen
    navigate(`/now-playing?id=${manifestation.id}`);
  };

  const handleDelete = async (manifestationId: string) => {
    setDeletingId(manifestationId);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase
        .from("manifestations")
        .delete()
        .eq("id", manifestationId);

      if (error) {
        toast({
          title: "Delete failed",
          description: "There was an error deleting your manifestation.",
          variant: "destructive"
        });
      } else {
        // Remove from local state
        setManifestations(prev => prev.filter(m => m.id !== manifestationId));
        toast({
          title: "Deleted successfully",
          description: "Your manifestation has been removed from your library."
        });
      }
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "There was an error deleting your manifestation.",
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/dashboard')}
        className="mb-4 p-2"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Home
      </Button>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text font-playfair mb-2">
            My Library
          </h1>
          <p className="text-gray-600 font-light">
            Your collection of transformative manifestations
          </p>
        </div>
        <div className="text-right text-sm text-gray-500">
          {manifestations.length} manifestation{manifestations.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {manifestations.map((manifestation) => (
          <Card key={manifestation.id} className="goal-card group hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-800 mb-2 group-hover:text-purple-700 transition-colors">
                    {manifestation.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {manifestation.text}
                  </p>
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    onClick={() => handlePlay(manifestation)}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(manifestation.id)}
                    disabled={deletingId === manifestation.id}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {manifestation.voice && (
                  <Badge variant="outline" className="text-xs">
                    {manifestation.voice}
                  </Badge>
                )}
                {manifestation.background_music && (
                  <Badge variant="outline" className="text-xs">
                    {manifestation.background_music}
                  </Badge>
                )}
                {manifestation.mood !== undefined && (
                  <Badge variant="secondary" className="text-xs">
                    Mood: {manifestation.mood}
                  </Badge>
                )}
              </div>
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <span>{manifestation.created_at && new Date(manifestation.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="w-3 h-3" />
                    <span>Saved</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {manifestations.length === 0 && (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No manifestations yet</h3>
          <p className="text-gray-500 mb-6">Create your first manifestation to get started</p>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" onClick={() => navigate('/builder')}>
            Create Manifestation
          </Button>
        </div>
      )}
    </div>
  );
};

export default LibraryGrid;
