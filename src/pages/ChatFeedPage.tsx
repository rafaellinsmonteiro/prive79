
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Grid3X3, List, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useContactsUpdates, Contact } from '@/hooks/useContactsUpdates';
import ContactUpdatesModal from '@/components/chat/ContactUpdatesModal';
import FeedListView from '@/components/chat/FeedListView';
import FeedGridView from '@/components/chat/FeedGridView';
import FeedReelsView from '@/components/chat/FeedReelsView';

type ViewMode = 'list' | 'grid' | 'reels';

const ChatFeedPage = () => {
  const navigate = useNavigate();
  const { data: contacts = [], isLoading } = useContactsUpdates();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedUpdateIndex, setSelectedUpdateIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const handleContactClick = (contact: Contact, updateIndex: number = 0) => {
    setSelectedContact(contact);
    setSelectedUpdateIndex(updateIndex);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedContact(null);
    setSelectedUpdateIndex(0);
  };

  const viewModeButtons = [
    { mode: 'reels' as ViewMode, icon: Play, label: 'Reels' },
    { mode: 'grid' as ViewMode, icon: Grid3X3, label: 'Grid' },
    { mode: 'list' as ViewMode, icon: List, label: 'Lista' },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-4 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/chat')}
            className="text-white hover:bg-zinc-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-white flex-1">Atualizações</h1>
        </div>
        
        {/* View Mode Controls */}
        <div className="flex items-center gap-1 px-4 pb-4">
          {viewModeButtons.map(({ mode, icon: Icon, label }) => (
            <Button
              key={mode}
              variant={viewMode === mode ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode(mode)}
              className={`flex items-center gap-2 ${
                viewMode === mode 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="mobile-content">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-zinc-400">Carregando atualizações...</p>
          </div>
        ) : (
          <>
            {viewMode === 'list' && (
              <FeedListView
                contacts={contacts}
                onContactClick={(contact) => handleContactClick(contact, 0)}
              />
            )}
            
            {viewMode === 'grid' && (
              <FeedGridView
                contacts={contacts}
                onMediaClick={handleContactClick}
              />
            )}
            
            {viewMode === 'reels' && (
              <FeedReelsView contacts={contacts} />
            )}
          </>
        )}
      </div>

      {/* Contact Updates Modal */}
      {viewMode !== 'reels' && (
        <ContactUpdatesModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          contact={selectedContact}
          initialUpdateIndex={selectedUpdateIndex}
        />
      )}
    </div>
  );
};

export default ChatFeedPage;
