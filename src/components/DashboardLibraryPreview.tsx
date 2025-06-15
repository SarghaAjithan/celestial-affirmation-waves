
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { View } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Manifestation {
  id: string;
  title: string;
  created_at: string;
  text?: string;
  voice?: string;
  background_music?: string;
  mood?: number;
}

interface Props {
  manifestations: Manifestation[];
}

const DashboardLibraryPreview = ({ manifestations }: Props) => {
  const navigate = useNavigate();
  // Show only first 3 manifestations
  const preview = manifestations.slice(0, 3);

  if (!preview.length) {
    return (
      <div className="rounded-2xl bg-white/50 shadow py-8 px-6 text-center text-gray-500 text-base italic mb-2">
        No items in your library yet.
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
        {preview.map(item => (
          <Card
            key={item.id}
            className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-0 rounded-3xl overflow-hidden cursor-pointer"
            onClick={() => navigate(`/now-playing?id=${item.id}`)}
            style={{ minHeight: 127 }}
          >
            <CardContent className="p-0">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-5 text-white relative overflow-hidden rounded-t-3xl">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>
                <div className="relative z-10 flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#b38ffa] to-[#dcbafa] flex items-center justify-center font-mulish text-white text-lg font-bold mr-3 select-none">
                    {item.title?.[0] || "A"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white truncate">{item.title || "Untitled"}</h4>
                    <div className="text-white/70 text-xs truncate">
                      Created: {item.created_at && new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex justify-end">
        <Button
          variant="outline"
          className="text-purple-700 hover:text-purple-900 hover:border-purple-400 gap-2 font-semibold"
          onClick={() => navigate("/library")}
        >
          <View className="w-4 h-4" />
          View More
        </Button>
      </div>
    </div>
  );
};

export default DashboardLibraryPreview;
