import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Play, Pause, RotateCcw, Save, Share, BookOpen, Heart, ArrowLeft } from "lucide-react";

const AudioPlayer = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState([45]);
  const [journalEntry, setJournalEntry] = useState('');
  const [moodRating, setMoodRating] = useState(0);

  // Mock manifestation data
  const manifestation = {
    title: 'Abundance & Prosperity',
    goal: 'I attract wealth and abundance into my life effortlessly',
    tone: 'empowering',
    duration: '5:23',
    totalSeconds: 323
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSaveJournal = () => {
    console.log('Saving journal entry:', journalEntry, 'Mood:', moodRating);
    // Here we'll save to Supabase later
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const moodEmojis = ['😔', '😐', '🙂', '😊', '✨'];

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/library')}
        className="mb-6 p-2"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </Button>

      <div className="space-y-8">
        {/* Player Section */}
        <Card className="goal-card">
          <CardContent className="p-8">
            {/* Artwork/Waveform */}
            <div className="bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 rounded-2xl p-12 mb-6 text-center">
              <div className="w-full h-32 bg-gradient-to-r from-purple-300 to-pink-300 rounded-lg flex items-center justify-center mb-4">
                <div className="flex space-x-1">
                  {[...Array(20)].map((_, i) => (
                    <div 
                      key={i}
                      className="w-1 bg-white rounded-full animate-pulse"
                      style={{ 
                        height: `${Math.random() * 60 + 20}px`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Track Info */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2 font-playfair">
                {manifestation.title}
              </h2>
              <p className="text-gray-600 mb-3">{manifestation.goal}</p>
              <Badge className="bg-purple-100 text-purple-800">
                {manifestation.tone}
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <Slider
                value={currentTime}
                onValueChange={setCurrentTime}
                max={manifestation.totalSeconds}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>{formatTime(currentTime[0])}</span>
                <span>{manifestation.duration}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              <Button variant="outline" size="sm">
                <RotateCcw className="w-4 h-4" />
              </Button>
              
              <Button 
                onClick={togglePlayPause}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full w-16 h-16"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </Button>
              
              <Button variant="outline" size="sm">
                <Share className="w-4 h-4" />
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button variant="outline" className="flex-1">
                <Heart className="w-4 h-4 mr-2" />
                Add to Rituals
              </Button>
              <Button variant="outline" className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Journal Section */}
        <Card className="goal-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="w-5 h-5 text-purple-500" />
              <h3 className="text-xl font-semibold">Reflection Journal</h3>
            </div>

            {/* Mood Tracker */}
            <div className="mb-6">
              <Label className="text-sm font-medium mb-3 block">How are you feeling right now?</Label>
              <div className="flex space-x-3 justify-center">
                {moodEmojis.map((emoji, index) => (
                  <Button
                    key={index}
                    variant={moodRating === index + 1 ? "default" : "ghost"}
                    size="lg"
                    className="text-2xl hover:scale-110 transition-transform"
                    onClick={() => setMoodRating(index + 1)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </div>

            {/* Journal Entry */}
            <div className="mb-6">
              <Label htmlFor="journal" className="text-sm font-medium mb-3 block">
                What thoughts or feelings came up during this manifestation?
              </Label>
              <Textarea
                id="journal"
                placeholder="I felt a deep sense of calm and possibility. The affirmations about abundance really resonated with me today..."
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
                className="min-h-32"
              />
            </div>

            <Button 
              onClick={handleSaveJournal}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Reflection
            </Button>

            {/* Previous Entries Preview */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Reflections</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Yesterday</span>
                    <span>😊</span>
                  </div>
                  <p className="line-clamp-2">Felt really motivated after this session. The wealth affirmations are starting to shift my mindset...</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">3 days ago</span>
                    <span>✨</span>
                  </div>
                  <p className="line-clamp-2">Amazing session today. I could really feel the energy of abundance flowing through me...</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AudioPlayer;
