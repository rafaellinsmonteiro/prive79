import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Bell, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface DarkHeaderProps {
  onMenuClick?: () => void;
  title?: string;
}

const DarkHeader: React.FC<DarkHeaderProps> = ({ 
  onMenuClick, 
  title = "Dashboard" 
}) => {
  const { user } = useAuth();

  return (
    <header className="h-14 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 relative z-50">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="text-zinc-300 hover:text-white hover:bg-zinc-800 p-2"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <h1 className="text-xl font-semibold text-yellow-400">
          {title}
        </h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Notification Button */}
        <Button
          variant="ghost"
          size="sm"
          className="text-zinc-300 hover:text-white hover:bg-zinc-800 p-2"
        >
          <Bell className="h-5 w-5" />
        </Button>

        {/* Add Button */}
        <Button
          size="sm"
          className="bg-yellow-400 hover:bg-yellow-500 text-zinc-900 font-medium px-3 py-2 rounded-lg"
        >
          <Plus className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">+</span>
        </Button>

        {/* Profile Picture */}
        <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-700">
          <img
            src={user?.user_metadata?.avatar_url || '/placeholder.svg'}
            alt="Profile"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
        </div>
      </div>
    </header>
  );
};

export default DarkHeader;