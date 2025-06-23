
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    narrator: '',
    duration: '',
    is_premium: false
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      // Simple admin check - you can enhance this with proper role-based auth
      const adminEmails = ['admin@example.com', 'krishna@yopmail.com']; // Add your admin emails here
      if (adminEmails.includes(user.email || '')) {
        setIsAdmin(true);
      } else {
        toast({
          title: "Access Denied",
          description: "You don't have admin access.",
          variant: "destructive"
        });
        navigate('/dashboard');
      }
      setLoading(false);
    };

    checkAdminStatus();
  }, [user, navigate, toast]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
    } else {
      toast({
        title: "Invalid file",
        description: "Please select an audio file.",
        variant: "destructive"
      });
    }
  };

  const handleUpload = async () => {
    if (!audioFile || !formData.title) {
      toast({
        title: "Missing information",
        description: "Please provide a title and audio file.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      
      // Upload audio file to storage
      const fileExt = audioFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('sleep-stories')
        .upload(fileName, audioFile);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('sleep-stories')
        .getPublicUrl(fileName);

      // Insert sleep story into database
      const { error: dbError } = await supabase
        .from('manifestations')
        .insert({
          title: formData.title,
          description: formData.description,
          text: formData.description || formData.title, // Required field
          audio_url: publicUrl,
          content_type: 'sleep_story',
          category: formData.category,
          narrator: formData.narrator,
          duration: formData.duration ? parseInt(formData.duration) : null,
          is_premium: formData.is_premium,
          user_id: null // Admin content, not tied to specific user
        });

      if (dbError) {
        throw dbError;
      }

      toast({
        title: "Success!",
        description: "Sleep story uploaded successfully.",
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        narrator: '',
        duration: '',
        is_premium: false
      });
      setAudioFile(null);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading the sleep story.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen cosmic-bg floating-particles flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen cosmic-bg floating-particles">
      <div className="max-w-4xl mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-4 p-2"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text font-playfair mb-2">
            Admin Panel
          </h1>
          <p className="text-gray-600 font-light">
            Upload sleep stories for the library
          </p>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
          <CardHeader>
            <CardTitle className="text-2xl gradient-text">Upload Sleep Story</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter story title"
                className="mt-1"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of the sleep story"
                className="mt-1"
                rows={3}
              />
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nature">Nature</SelectItem>
                  <SelectItem value="Fantasy">Fantasy</SelectItem>
                  <SelectItem value="Meditation">Meditation</SelectItem>
                  <SelectItem value="Adventure">Adventure</SelectItem>
                  <SelectItem value="Relaxation">Relaxation</SelectItem>
                  <SelectItem value="Ocean">Ocean</SelectItem>
                  <SelectItem value="Forest">Forest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Narrator */}
            <div>
              <Label htmlFor="narrator">Narrator</Label>
              <Input
                id="narrator"
                value={formData.narrator}
                onChange={(e) => handleInputChange('narrator', e.target.value)}
                placeholder="Voice artist name"
                className="mt-1"
              />
            </div>

            {/* Duration */}
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                placeholder="Duration in minutes"
                className="mt-1"
              />
            </div>

            {/* Audio File */}
            <div>
              <Label htmlFor="audio">Audio File *</Label>
              <Input
                id="audio"
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="mt-1"
              />
              {audioFile && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {audioFile.name}
                </p>
              )}
            </div>

            {/* Premium Toggle */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="premium"
                checked={formData.is_premium}
                onChange={(e) => handleInputChange('is_premium', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="premium">Premium Content</Label>
            </div>

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={uploading || !audioFile || !formData.title}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Sleep Story
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
