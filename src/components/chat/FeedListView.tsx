
import React from 'react';
import { Contact } from '@/hooks/useContactsUpdates';
import ContactStatusItem from './ContactStatusItem';

interface FeedListViewProps {
  contacts: Contact[];
  onContactClick: (contact: Contact) => void;
}

const FeedListView: React.FC<FeedListViewProps> = ({ contacts, onContactClick }) => {
  return (
    <div className="p-4">
      <div className="space-y-6">
        {/* My Status Section */}
        <div>
          <h2 className="text-sm font-medium text-zinc-400 mb-3">Meu status</h2>
          <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg">
            <div className="relative">
              <div className="w-12 h-12 bg-zinc-700 rounded-full flex items-center justify-center border-2 border-dashed border-zinc-600">
                <span className="text-zinc-400 text-xl">+</span>
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
          {contacts.length === 0 ? (
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
                  onClick={() => onContactClick(contact)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedListView;
