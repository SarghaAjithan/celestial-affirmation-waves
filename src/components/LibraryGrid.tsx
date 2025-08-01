
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Heart, Trash2, Pause } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePlayer } from "@/contexts/PlayerContext";
import { useAuth } from "@/contexts/AuthContext";

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
  content_type?: string;
}

const LibraryGrid = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { play, pause, resume, current, isPlaying } = usePlayer();
  const { user } = useAuth();
  const [manifestations, setManifestations] = useState<Manifestation[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch manifestations if user is authenticated
    if (!user) {
      setManifestations([]);
      setLoading(false);
      return;
    }

    // Fetch ONLY the current user's manifestations
    const fetchUserManifestations = async () => {
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data, error } = await supabase
          .from("manifestations")
          .select("*")
          .eq("user_id", user.id) // Only fetch current user's manifestations
          .or("content_type.eq.manifestation,content_type.is.null")
          .order("created_at", { ascending: false });
        
        if (error) {
          console.error("Error fetching user manifestations:", error);
          toast({
            title: "Error loading manifestations",
            description: "Unable to load your manifestations. Please try again.",
            variant: "destructive"
          });
          setManifestations([]);
        } else {
          setManifestations(data || []);
        }
      } catch (error) {
        console.error("Error fetching manifestations:", error);
        setManifestations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserManifestations();
  }, [user, toast]);

  const handlePlayPause = (manifestation: Manifestation) => {
    if (current?.id === manifestation.id && isPlaying) {
      pause();
    } else if (current?.id === manifestation.id && !isPlaying) {
      resume();
    } else {
      play(manifestation);
    }
  };

  const handleDelete = async (manifestationId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to delete manifestations.",
        variant: "destructive"
      });
      return;
    }

    setDeletingId(manifestationId);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase
        .from("manifestations")
        .delete()
        .eq("id", manifestationId)
        .eq("user_id", user.id); // Ensure user can only delete their own manifestations

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

  if (!user) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
          <Heart className="w-12 h-12 text-purple-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">Please sign in</h3>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">Sign in to view your personal manifestations</p>
        <Button 
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all" 
          onClick={() => navigate('/auth')}
        >
          Sign In
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your manifestations...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="text-right text-sm text-gray-500">
          {manifestations.length} manifestation{manifestations.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {manifestations.map((manifestation) => (
          <Card key={manifestation.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              {/* Header Section */}
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-bold text-xl text-white leading-tight">
                      {manifestation.title}
                    </h3>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:text-white hover:bg-white/20 rounded-full p-2 h-10 w-10"
                        onClick={() => handlePlayPause(manifestation)}
                      >
                        {current?.id === manifestation.id && isPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:text-red-200 hover:bg-red-500/20 rounded-full p-2 h-10 w-10"
                        onClick={() => handleDelete(manifestation.id)}
                        disabled={deletingId === manifestation.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-white/90 text-sm line-clamp-2 leading-relaxed">
                    {manifestation.text}
                  </p>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6">
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {manifestation.voice && (
                    <Badge variant="outline" className="text-xs px-3 py-1 rounded-full border-purple-200 text-purple-700 bg-purple-50">
                      {manifestation.voice}
                    </Badge>
                  )}
                  {manifestation.background_music && (
                    <Badge variant="outline" className="text-xs px-3 py-1 rounded-full border-blue-200 text-blue-700 bg-blue-50">
                      {manifestation.background_music}
                    </Badge>
                  )}
                  {manifestation.mood !== undefined && (
                    <Badge variant="secondary" className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                      Mood: {manifestation.mood}
                    </Badge>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    {manifestation.created_at && new Date(manifestation.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Heart className="w-3 h-3 fill-purple-200 text-purple-400" />
                    <span>Saved</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {manifestations.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
            <Heart className="w-12 h-12 text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">No manifestations yet</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">Create your first manifestation to begin your transformative journey</p>
          <Button 
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all" 
            onClick={() => navigate('/builder')}
          >
            Create Manifestation
          </Button>
        </div>
      )}
    </div>
  );
};

export default LibraryGrid;
