import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  Moon,
  Volume2,
  Calendar,
  Briefcase,
  Users
} from 'lucide-react';

const SettingsView: React.FC = () => {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  const settingsGroups = [
    {
      title: 'Perfil',
      items: [
        {
          icon: User,
          label: 'Editar Perfil',
          description: 'Nome, foto e informações pessoais',
          hasArrow: true,
          action: 'edit-profile',
        },
      ],
    },
    {
      title: 'Mídias',
      items: [
        {
          icon: Palette,
          label: 'Gerenciar Mídias',
          description: 'Fotos, vídeos e conteúdo',
          hasArrow: true,
          action: 'manage-media',
        },
      ],
    },
    {
      title: 'Gestão',
      items: [
        {
          icon: Calendar,
          label: 'Agenda',
          description: 'Compromissos e horários',
          hasArrow: true,
          action: 'appointments',
        },
        {
          icon: Briefcase,
          label: 'Serviços',
          description: 'Gerenciar serviços oferecidos',
          hasArrow: true,
          action: 'services',
        },
        {
          icon: Users,
          label: 'Clientes',
          description: 'Gerenciar clientes',
          hasArrow: true,
          action: 'clients',
        },
      ],
    },
    {
      title: 'Privacidade',
      items: [
        {
          icon: Shield,
          label: 'Privacidade',
          description: 'Configurações de privacidade e segurança',
          hasArrow: true,
          action: 'privacy',
        },
      ],
    },
    {
      title: 'Aparência',
      items: [
        {
          icon: Moon,
          label: 'Modo Escuro',
          description: 'Ativar tema escuro',
          hasToggle: true,
          enabled: true,
        },
        {
          icon: Volume2,
          label: 'Sons',
          description: 'Configurar sons do chat',
          hasToggle: true,
          enabled: true,
        },
      ],
    },
  ];

  return (
    <div className="bg-zinc-950 h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-zinc-800 p-4 bg-zinc-900">
        <h2 className="text-lg font-semibold text-white">Configurações</h2>
      </div>

      {/* Profile Section */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-zinc-700 text-white text-lg">
              {user?.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
            </h3>
            <p className="text-zinc-400 text-sm">{user?.email}</p>
            <p className="text-green-400 text-sm mt-1">● Online</p>
          </div>
        </div>
      </div>

      {/* Settings Groups */}
      <div className="flex-1 overflow-y-auto">
        {settingsGroups.map((group) => (
          <div key={group.title} className="mb-6">
            <h4 className="text-zinc-400 text-sm font-medium px-4 py-2 uppercase tracking-wider">
              {group.title}
            </h4>
            <div className="bg-zinc-900/30">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    className="w-full p-4 flex items-center space-x-3 hover:bg-zinc-800/50 transition-colors border-b border-zinc-800/50 last:border-b-0"
                  >
                    <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center">
                      <Icon className="h-5 w-5 text-zinc-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-white font-medium">{item.label}</p>
                      <p className="text-zinc-400 text-sm">{item.description}</p>
                    </div>
                    {item.hasToggle && (
                      <Switch checked={item.enabled} className="data-[state=checked]:bg-purple-500" />
                    )}
                    {item.hasArrow && (
                      <ChevronRight className="h-5 w-5 text-zinc-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Logout Section */}
        <div className="p-4">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full p-4 flex items-center space-x-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg"
          >
            <div className="w-10 h-10 bg-red-900/30 rounded-lg flex items-center justify-center">
              <LogOut className="h-5 w-5" />
            </div>
            <span className="flex-1 text-left font-medium">Sair</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;