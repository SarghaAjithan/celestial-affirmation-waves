
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LibraryGrid from "@/components/LibraryGrid";
import SleepStoriesGrid from "@/components/SleepStoriesGrid";

const Library = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen cosmic-bg floating-particles">
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

        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text font-playfair mb-2">
            My Library
          </h1>
          <p className="text-gray-600 font-light">
            Your collection of transformative content
          </p>
        </div>

        <Tabs defaultValue="manifestations" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="manifestations">My Manifestations</TabsTrigger>
            <TabsTrigger value="sleep-stories">Sleep Stories</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manifestations">
            <LibraryGrid />
          </TabsContent>
          
          <TabsContent value="sleep-stories">
            <SleepStoriesGrid />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Library;
