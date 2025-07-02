
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const getGreeting = () => {
      const now = new Date();
      const hour = now.getHours();

      if (hour < 12) {
        return 'Good Morning';
      } else if (hour < 18) {
        return 'Good Afternoon';
      } else {
        return 'Good Evening';
      }
    };

    setGreeting(getGreeting());
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Check if user is admin
  const isAdmin = user?.email && ['admin@example.com', 'krishna@yopmail.com'].includes(user.email);

  return (
    <div className="min-h-screen cosmic-bg floating-particles">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold gradient-text font-playfair mb-2">
              {greeting}
            </h1>
            <p className="text-gray-600 font-light text-lg">
              Welcome back to your transformation journey
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {isAdmin && (
              <Button
                variant="outline"
                onClick={() => navigate('/admin')}
                className="bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200"
              >
                Admin Panel
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="hover:bg-red-50 hover:border-red-200 hover:text-red-600"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Manifestation Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold gradient-text font-playfair mb-4">
              Create Manifestation
            </h2>
            <p className="text-gray-600 mb-6">
              Craft your dreams into reality with guided manifestation.
            </p>
            <Button
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              onClick={() => navigate('/builder')}
            >
              Start Building
            </Button>
          </div>

          {/* Library Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold gradient-text font-playfair mb-4">
              My Library
            </h2>
            <p className="text-gray-600 mb-6">
              Access your saved manifestations and sleep stories.
            </p>
            <Button
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
              onClick={() => navigate('/library')}
            >
              Go to Library
            </Button>
          </div>

          {/* Upload Content Card (Admin Only) */}
          {isAdmin && (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold gradient-text font-playfair mb-4">
                Upload Content
              </h2>
              <p className="text-gray-600 mb-6">
                Upload MP3 sleep stories and manage content library.
              </p>
              <Button
                className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                onClick={() => navigate('/admin')}
              >
                Upload Content
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
