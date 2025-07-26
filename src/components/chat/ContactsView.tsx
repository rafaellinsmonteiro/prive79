import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, UserPlus } from 'lucide-react';

const ContactsView: React.FC = () => {
  // Mock data para demonstração
  const contacts = [
    {
      id: '1',
      name: 'Ana Silva',
      photo: '/placeholder.svg',
      isOnline: true,
      lastSeen: 'Online',
    },
    {
      id: '2',
      name: 'Carla Santos',
      photo: '/placeholder.svg',
      isOnline: false,
      lastSeen: 'Visto por último há 2h',
    },
    {
      id: '3',
      name: 'Fernanda Costa',
      photo: '/placeholder.svg',
      isOnline: true,
      lastSeen: 'Online',
    },
  ];

  return (
    <div className="bg-zinc-950 h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-zinc-800 p-4 bg-zinc-900">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Contatos</h2>
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
            <UserPlus className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Pesquisar contatos..."
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400 pl-10 rounded-lg h-10 focus:border-purple-500"
          />
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-zinc-800">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="p-4 hover:bg-zinc-900/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={contact.photo}
                    alt={contact.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-zinc-700"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  {contact.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-zinc-950"></div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h4 className="text-white font-semibold">{contact.name}</h4>
                  <p className={`text-sm ${contact.isOnline ? 'text-green-400' : 'text-zinc-400'}`}>
                    {contact.lastSeen}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactsView;