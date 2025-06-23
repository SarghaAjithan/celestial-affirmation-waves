
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, User } from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";

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

interface SleepStoryCardProps {
  story: SleepStory;
}

const SleepStoryCard = ({ story }: SleepStoryCardProps) => {
  const { play } = usePlayer();

  const handlePlay = () => {
    play(story);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "Unknown";
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) {
      return `${hrs}h ${mins % 60}m`;
    }
    return `${mins}m`;
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-0 rounded-3xl overflow-hidden">
      <CardContent className="p-0">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-bold text-xl text-white leading-tight">
                {story.title}
              </h3>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:text-white hover:bg-white/20 rounded-full p-2 h-10 w-10 ml-4"
                onClick={handlePlay}
              >
                <Play className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-white/90 text-sm line-clamp-2 leading-relaxed">
              {story.description || "A peaceful sleep story to help you relax"}
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          {/* Tags and Info */}
          <div className="flex flex-wrap gap-2 mb-4">
            {story.category && (
              <Badge variant="outline" className="text-xs px-3 py-1 rounded-full border-indigo-200 text-indigo-700 bg-indigo-50">
                {story.category}
              </Badge>
            )}
            {story.is_premium && (
              <Badge variant="secondary" className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">
                Premium
              </Badge>
            )}
          </div>

          {/* Story Details */}
          <div className="space-y-2 mb-4">
            {story.narrator && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>Narrated by {story.narrator}</span>
              </div>
            )}
            {story.duration && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(story.duration)}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              Sleep Story
            </div>
            <div className="text-xs text-gray-400">
              {new Date(story.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SleepStoryCard;
