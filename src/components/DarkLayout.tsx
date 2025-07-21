import React, { useState } from 'react';
import DarkHeader from './DarkHeader';
import DarkSidebar from './DarkSidebar';

interface DarkLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const DarkLayout: React.FC<DarkLayoutProps> = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <DarkHeader 
        onMenuClick={handleMenuClick}
        title={title}
      />
      
      <DarkSidebar 
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
      />
      
      <main className={`transition-all duration-300 lg:ml-64 pt-0 min-h-[calc(100vh-3.5rem)]`}>
        <div className="bg-zinc-950">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DarkLayout;