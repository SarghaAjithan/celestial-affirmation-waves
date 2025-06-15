
import ManifestationCreator from "@/components/ManifestationCreator";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Builder = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen cosmic-bg floating-particles p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-4 text-gray-700 hover:text-gray-900 hover:bg-gray-100"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <ManifestationCreator />
      </div>
    </div>
  );
};

export default Builder;
