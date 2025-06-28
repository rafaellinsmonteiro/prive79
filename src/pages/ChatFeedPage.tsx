
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useContactsUpdates, Contact } from '@/hooks/useContactsUpdates';
import ContactStatusItem from '@/components/chat/ContactStatusItem';
import ContactUpdatesModal from '@/components/chat/ContactUpdatesModal';

const ChatFeedPage = () => {
  const navigate = useNavigate();
  const { data: contacts = [], isLoading } = useContactsUpdates();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedContact(null);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-zinc-900 border-b border-zinc-800 p-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/chat')}
            className="text-white hover:bg-zinc-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-white">Atualizações</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 mobile-content">
        <div className="space-y-6">
          {/* My Status Section */}
          <div>
            <h2 className="text-sm font-medium text-zinc-400 mb-3">Meu status</h2>
            <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg">
              <div className="relative">
                <div className="w-12 h-12 bg-zinc-700 rounded-full flex items-center justify-center border-2 border-dashed border-zinc-600">
                  <Plus className="h-5 w-5 text-zinc-400" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Meu status</p>
                <p className="text-sm text-zinc-400">Toque para adicionar uma atualização</p>
              </div>
            </div>
          </div>

          {/* Recent Updates Section */}
          <div>
            <h2 className="text-sm font-medium text-zinc-400 mb-3">Atualizações recentes</h2>
            
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-zinc-400">Carregando atualizações...</p>
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-zinc-400">Nenhuma atualização disponível</p>
                <p className="text-zinc-500 text-sm mt-2">
                  Converse com alguém para ver as atualizações aqui
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {contacts.map((contact) => (
                  <ContactStatusItem
                    key={contact.model_id}
                    contact={contact}
                    onClick={() => handleContactClick(contact)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Updates Modal */}
      <ContactUpdatesModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        contact={selectedContact}
      />
    </div>
  );
};

export default ChatFeedPage;
