
import React from 'react';
import { Contact } from '@/hooks/useContactsUpdates';
import { Play } from 'lucide-react';

interface FeedGridViewProps {
  contacts: Contact[];
  onMediaClick: (contact: Contact, updateIndex: number) => void;
}

const FeedGridView: React.FC<FeedGridViewProps> = ({ contacts, onMediaClick }) => {
  // Coletar todas as atualizações de todos os contatos
  const allUpdates = contacts.flatMap(contact => 
    contact.updates.map(update => ({ ...update, contact }))
  );

  // Ordenar por data mais recente
  allUpdates.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleMediaClick = (updateItem: any) => {
    const contact = updateItem.contact;
    const updateIndex = contact.updates.findIndex(u => u.id === updateItem.id);
    onMediaClick(contact, updateIndex);
  };

  return (
    <div className="grid grid-cols-3 gap-1 p-4">
      {allUpdates.map((updateItem) => (
        <div
          key={updateItem.id}
          onClick={() => handleMediaClick(updateItem)}
          className="aspect-square relative cursor-pointer bg-zinc-800 rounded-lg overflow-hidden"
        >
          {updateItem.media_type === 'photo' ? (
            <img
              src={updateItem.media_url}
              alt="Update"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          ) : (
            <>
              <img
                src={updateItem.thumbnail_url || '/placeholder.svg'}
                alt="Video thumbnail"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/50 rounded-full p-2">
                  <Play className="h-4 w-4 text-white fill-white" />
                </div>
              </div>
            </>
          )}
          
          {/* Avatar do contato no canto */}
          <div className="absolute top-1 left-1">
            <img
              src={updateItem.contact.model_photo}
              alt={updateItem.contact.model_name}
              className="w-6 h-6 rounded-full border border-white"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeedGridView;
