import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Heart, Calendar, Clock, BookOpen, ArrowLeft } from "lucide-react";

interface Manifestation {
  id: string;
  title: string;
  goal: string;
  tone: string;
  voiceStyle: string;
  backgroundMusic: string;
  duration: string;
  createdAt: string;
  playCount: number;
  lastPlayed?: string;
  journalEntries: number;
}

const LibraryGrid = () => {
  const navigate = useNavigate();
  
  // Mock data - will be replaced with Supabase data
  const [manifestations] = useState<Manifestation[]>([
    {
      id: '1',
      title: 'Abundance & Prosperity',
      goal: 'I attract wealth and abundance into my life effortlessly',
      tone: 'empowering',
      voiceStyle: 'female',
      backgroundMusic: 'ocean',
      duration: '5:23',
      createdAt: '2024-01-15',
      playCount: 12,
      lastPlayed: 'Today',
      journalEntries: 3
    },
    {
      id: '2',
      title: 'Inner Peace & Calm',
      goal: 'I find tranquility and balance in every moment',
      tone: 'soothing',
      voiceStyle: 'whisper',
      backgroundMusic: 'forest',
      duration: '7:45',
      createdAt: '2024-01-10',
      playCount: 8,
      lastPlayed: 'Yesterday',
      journalEntries: 5
    },
    {
      id: '3',
      title: 'Confidence Boost',
      goal: 'I am confident, capable, and worthy of success',
      tone: 'motivational',
      voiceStyle: 'male',
      backgroundMusic: 'piano',
      duration: '4:12',
      createdAt: '2024-01-08',
      playCount: 15,
      lastPlayed: '2 days ago',
      journalEntries: 2
    }
  ]);

  const getToneColor = (tone: string) => {
    const colors = {
      empowering: 'bg-purple-100 text-purple-800',
      soothing: 'bg-blue-100 text-blue-800',
      motivational: 'bg-green-100 text-green-800',
      spiritual: 'bg-indigo-100 text-indigo-800'
    };
    return colors[tone as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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
          {manifestations.length} manifestations
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {manifestations.map((manifestation) => (
          <Card key={manifestation.id} className="goal-card cursor-pointer group hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-800 mb-2 group-hover:text-purple-700 transition-colors">
                    {manifestation.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {manifestation.goal}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                >
                  <Play className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className={getToneColor(manifestation.tone)}>
                  {manifestation.tone}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {manifestation.voiceStyle}
                </Badge>
              </div>

              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{manifestation.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="w-3 h-3" />
                    <span>{manifestation.playCount} plays</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>Last: {manifestation.lastPlayed}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BookOpen className="w-3 h-3" />
                    <span>{manifestation.journalEntries} notes</span>
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
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            Create Manifestation
          </Button>
        </div>
      )}
    </div>
  );
};

export default LibraryGrid;
