import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import ChatMediaManager from './ChatMediaManager';
import EditProfileView from './EditProfileView';
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
import { useChatSettings, useUpdateChatSettings } from '@/hooks/useChatSettings';
import { useDisguiseMode } from '@/hooks/useDisguiseMode';

const SettingsView: React.FC = () => {
  const { user, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<'main' | 'media' | 'edit-profile' | 'privacy'>('main');
  const { data: chatSettings } = useChatSettings();
  const updateChatSettings = useUpdateChatSettings();
  const { isDisguiseModeEnabled, disguiseModeType } = useDisguiseMode();

  const handleLogout = async () => {
    await signOut();
  };

  const handleToggleDisguiseMode = async (enabled: boolean) => {
    if (!chatSettings?.id) return;
    
    try {
      await updateChatSettings.mutateAsync({
        id: chatSettings.id,
        disguise_mode_enabled: enabled,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating disguise mode:', error);
    }
  };

  const handleDisguiseModeTypeChange = async (type: string) => {
    if (!chatSettings?.id) return;
    
    try {
      await updateChatSettings.mutateAsync({
        id: chatSettings.id,
        disguise_mode_type: type,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating disguise mode type:', error);
    }
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
          label: 'Privacidade e Segurança',
          description: 'Modo disfarce e outras configurações',
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

  // Renderizar privacy view
  if (currentView === 'privacy') {
    return (
      <div className="bg-zinc-950 h-full flex flex-col">
        {/* Header */}
        <div className="border-b border-zinc-800 p-4 bg-zinc-900 flex items-center">
          <button
            onClick={() => setCurrentView('main')}
            className="mr-3 text-zinc-400 hover:text-white"
          >
            <ChevronRight className="h-5 w-5 rotate-180" />
          </button>
          <h2 className="text-lg font-semibold text-white">Privacidade</h2>
        </div>

        {/* Privacy Settings */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            {/* Modo Disfarce */}
            <div className="bg-zinc-900/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-white font-medium">Modo Disfarce</h3>
                  <p className="text-zinc-400 text-sm">
                    Transforma nomes e fotos dos contatos para maior privacidade
                  </p>
                </div>
                <Switch
                  checked={isDisguiseModeEnabled}
                  onCheckedChange={handleToggleDisguiseMode}
                  className="data-[state=checked]:bg-purple-500"
                />
              </div>

              {isDisguiseModeEnabled && (
                <div className="space-y-3 mt-4 pt-4 border-t border-zinc-700">
                  <p className="text-white text-sm font-medium">Tipo de Disfarce:</p>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => handleDisguiseModeTypeChange('women')}
                      className={`w-full p-3 rounded-lg border text-left transition-colors ${
                        disguiseModeType === 'women'
                          ? 'border-purple-500 bg-purple-500/10 text-white'
                          : 'border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      <div className="font-medium">Mulheres</div>
                      <div className="text-sm text-zinc-400">
                        Todos os contatos aparecerão como mulheres
                      </div>
                    </button>

                    <button
                      onClick={() => handleDisguiseModeTypeChange('men')}
                      className={`w-full p-3 rounded-lg border text-left transition-colors ${
                        disguiseModeType === 'men'
                          ? 'border-purple-500 bg-purple-500/10 text-white'
                          : 'border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      <div className="font-medium">Homens</div>
                      <div className="text-sm text-zinc-400">
                        Todos os contatos aparecerão como homens
                      </div>
                    </button>

                    <button
                      onClick={() => handleDisguiseModeTypeChange('stores')}
                      className={`w-full p-3 rounded-lg border text-left transition-colors ${
                        disguiseModeType === 'stores'
                          ? 'border-purple-500 bg-purple-500/10 text-white'
                          : 'border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      <div className="font-medium">Lojas</div>
                      <div className="text-sm text-zinc-400">
                        Todos os contatos aparecerão como lojas
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar diferentes views
  if (currentView === 'media') {
    return <ChatMediaManager onBack={() => setCurrentView('main')} />;
  }

  if (currentView === 'edit-profile') {
    return <EditProfileView onBack={() => setCurrentView('main')} />;
  }

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
                    onClick={() => {
                      if (item.action === 'manage-media') {
                        setCurrentView('media');
                      } else if (item.action === 'edit-profile') {
                        setCurrentView('edit-profile');
                      } else if (item.action === 'privacy') {
                        setCurrentView('privacy');
                      }
                      // Adicionar outras ações conforme necessário
                    }}
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
