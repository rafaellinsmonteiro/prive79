import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Briefcase, 
  Heart, 
  Flame, 
  Star, 
  Search, 
  Calendar, 
  MessageCircle, 
  Users, 
  Sparkles, 
  TrendingUp,
  Camera,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react';
import dashboardHeroBg from '/lovable-uploads/42760971-a8a7-467e-93f4-bc2af10c76e9.png';

interface ClientDashboardHomeProps {
  onSectionChange?: (section: string) => void;
}

const ClientDashboardHome = ({ onSectionChange }: ClientDashboardHomeProps) => {
  const [toggles, setToggles] = useState({
    business: true,
    fun: false,
    hot: false
  });

  const handleToggleChange = (toggle: keyof typeof toggles) => {
    setToggles(prev => ({
      ...prev,
      [toggle]: !prev[toggle]
    }));
  };

  // Cards baseados nos toggles ativos
  const getVisibleCards = () => {
    const cards = [];

    if (toggles.business) {
      cards.push(
        <Card key="business-networking" className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Briefcase className="h-6 w-6 text-blue-400" />
              <div className="flex-1">
                <h3 className="font-medium text-white">Networking Executivo</h3>
                <p className="text-sm text-zinc-400">Conecte-se com profissionais</p>
                <Badge variant="secondary" className="mt-1 text-xs">12 eventos disponíveis</Badge>
              </div>
            </div>
          </CardContent>
        </Card>,
        
        <Card key="business-services" className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Users className="h-6 w-6 text-green-400" />
              <div className="flex-1">
                <h3 className="font-medium text-white">Serviços Corporativos</h3>
                <p className="text-sm text-zinc-400">Consultoria e assessoria</p>
                <Badge variant="secondary" className="mt-1 text-xs">8 serviços ativos</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (toggles.fun) {
      cards.push(
        <Card key="fun-events" className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Heart className="h-6 w-6 text-pink-400" />
              <div className="flex-1">
                <h3 className="font-medium text-white">Eventos Sociais</h3>
                <p className="text-sm text-zinc-400">Festas e encontros casuais</p>
                <Badge variant="secondary" className="mt-1 text-xs">25 eventos hoje</Badge>
              </div>
            </div>
          </CardContent>
        </Card>,
        
        <Card key="fun-entertainment" className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Sparkles className="h-6 w-6 text-purple-400" />
              <div className="flex-1">
                <h3 className="font-medium text-white">Entretenimento</h3>
                <p className="text-sm text-zinc-400">Shows, teatro e diversão</p>
                <Badge variant="secondary" className="mt-1 text-xs">15 opções</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (toggles.hot) {
      cards.push(
        <Card key="hot-profiles" className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Flame className="h-6 w-6 text-red-400" />
              <div className="flex-1">
                <h3 className="font-medium text-white">Perfis Exclusivos</h3>
                <p className="text-sm text-zinc-400">Modelos e acompanhantes</p>
                <Badge variant="secondary" className="mt-1 text-xs">127 online agora</Badge>
              </div>
            </div>
          </CardContent>
        </Card>,
        
        <Card key="hot-content" className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Camera className="h-6 w-6 text-orange-400" />
              <div className="flex-1">
                <h3 className="font-medium text-white">Conteúdo Premium</h3>
                <p className="text-sm text-zinc-400">Fotos e vídeos exclusivos</p>
                <Badge variant="secondary" className="mt-1 text-xs">Novo conteúdo</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return cards;
  };

  const activeToggleCount = Object.values(toggles).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header de boas-vindas */}
      <Card className="relative overflow-hidden border-amber-600/30">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
          style={{ backgroundImage: `url(${dashboardHeroBg})` }} 
        />
        <div className="absolute inset-0 bg-black/70" />
        <CardContent className="relative p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Bem-vindo ao seu dashboard! 🎯
              </h1>
              <p className="text-zinc-200">
                Configure suas preferências e descubra o que a plataforma tem a oferecer.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <span className="text-xl font-bold text-white">Premium</span>
              <span className="text-zinc-300 text-sm">acesso</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controles de Toggle */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Suas Preferências
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <Briefcase className="h-6 w-6 text-blue-400" />
                <div>
                  <Label htmlFor="business-toggle" className="text-white font-medium">Business</Label>
                  <p className="text-sm text-zinc-400">Networking e negócios</p>
                </div>
              </div>
              <Switch
                id="business-toggle"
                checked={toggles.business}
                onCheckedChange={() => handleToggleChange('business')}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <Heart className="h-6 w-6 text-pink-400" />
                <div>
                  <Label htmlFor="fun-toggle" className="text-white font-medium">Fun</Label>
                  <p className="text-sm text-zinc-400">Diversão e entretenimento</p>
                </div>
              </div>
              <Switch
                id="fun-toggle"
                checked={toggles.fun}
                onCheckedChange={() => handleToggleChange('fun')}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <Flame className="h-6 w-6 text-red-400" />
                <div>
                  <Label htmlFor="hot-toggle" className="text-white font-medium">Hot</Label>
                  <p className="text-sm text-zinc-400">Conteúdo adulto</p>
                </div>
              </div>
              <Switch
                id="hot-toggle"
                checked={toggles.hot}
                onCheckedChange={() => handleToggleChange('hot')}
              />
            </div>
          </div>

          {activeToggleCount === 0 && (
            <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
              <p className="text-yellow-200 text-sm">
                ℹ️ Ative pelo menos uma preferência para ver conteúdo personalizado
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cards baseados nos toggles */}
      {activeToggleCount > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {getVisibleCards()}
        </div>
      )}

      {/* Cartões Financeiros e Perfil */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-green-900/20 rounded-lg">
                  <span className="text-green-400 font-bold text-lg">R$</span>
                </div>
                <h3 className="font-medium text-white">Saldo BRL</h3>
              </div>
            </div>
            <p className="text-2xl font-bold text-green-400">R$ 2.450,00</p>
            <p className="text-xs text-zinc-500 mt-1">Saldo disponível</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-amber-900/20 rounded-lg">
                  <span className="text-amber-400 font-bold text-lg">P$</span>
                </div>
                <h3 className="font-medium text-white">PriveCoins</h3>
              </div>
            </div>
            <p className="text-2xl font-bold text-amber-400">P$ 850</p>
            <p className="text-xs text-zinc-500 mt-1">Moeda da plataforma</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-purple-900/20 rounded-lg">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="font-medium text-white">Pontos PXP</h3>
              </div>
            </div>
            <p className="text-2xl font-bold text-purple-400">1,250</p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-zinc-500">Nível 3</p>
              <Badge variant="secondary" className="text-xs">+25 hoje</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer">
          <CardContent className="p-4 text-center">
            <Search className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <h3 className="font-medium text-white mb-1">Buscar</h3>
            <p className="text-xs text-zinc-500">Encontre perfis e serviços</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer">
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <h3 className="font-medium text-white mb-1">Agenda</h3>
            <p className="text-xs text-zinc-500">Seus compromissos</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer">
          <CardContent className="p-4 text-center">
            <MessageCircle className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <h3 className="font-medium text-white mb-1">Chat</h3>
            <p className="text-xs text-zinc-500">Conversas ativas</p>
            <Badge className="mt-1 text-xs">3 novas</Badge>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer">
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <h3 className="font-medium text-white mb-1">Avaliações</h3>
            <p className="text-xs text-zinc-500">Suas avaliações</p>
          </CardContent>
        </Card>
      </div>

      {/* Recomendações baseadas nos toggles */}
      {activeToggleCount > 0 && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Recomendado para Você
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {toggles.business && (
                <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Briefcase className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-white font-medium">Networking Corporativo - Evento Premium</p>
                      <p className="text-sm text-zinc-400">Hoje, 19:00 • Centro Empresarial</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-zinc-400" />
                </div>
              )}
              
              {toggles.fun && (
                <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Heart className="h-5 w-5 text-pink-400" />
                    <div>
                      <p className="text-white font-medium">Festa VIP - Open Bar</p>
                      <p className="text-sm text-zinc-400">Sábado, 22:00 • Rooftop Premium</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-zinc-400" />
                </div>
              )}
              
              {toggles.hot && (
                <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Flame className="h-5 w-5 text-red-400" />
                    <div>
                      <p className="text-white font-medium">Novos Perfis Disponíveis</p>
                      <p className="text-sm text-zinc-400">5 modelos online agora • Verificadas</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-zinc-400" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientDashboardHome;