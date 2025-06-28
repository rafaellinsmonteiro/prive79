
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Contact } from '@/hooks/useContactsUpdates';

interface ContactStatusItemProps {
  contact: Contact;
  onClick: () => void;
}

const ContactStatusItem: React.FC<ContactStatusItemProps> = ({ contact, onClick }) => {
  const formatLastUpdate = (date: string) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true, 
      locale: ptBR 
    });
  };

  const hasUnreadUpdates = contact.updates.some(update => update.has_unread);
  const latestUpdate = contact.updates[0];

  if (!latestUpdate) return null;

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
    >
      <div className="relative">
        <div className={`w-12 h-12 rounded-full p-0.5 ${
          hasUnreadUpdates 
            ? 'bg-gradient-to-r from-green-400 to-green-600' 
            : 'bg-zinc-600'
        }`}>
          <img
            src={contact.model_photo}
            alt={contact.model_name}
            className="w-full h-full rounded-full object-cover bg-zinc-700"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
        </div>
      </div>
      <div className="flex-1">
        <p className="text-white font-medium">{contact.model_name}</p>
        <p className="text-sm text-zinc-400">
          {formatLastUpdate(latestUpdate.created_at)}
        </p>
      </div>
      {hasUnreadUpdates && (
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      )}
    </div>
  );
};

export default ContactStatusItem;
