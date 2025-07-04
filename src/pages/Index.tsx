
import { useModels } from "@/hooks/useModels";
import { useCity } from "@/contexts/CityContext";
import { useModelProfile } from "@/hooks/useModelProfile";
import { useAuth } from "@/hooks/useAuth";
import ModelCard from "@/components/ModelCard";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, MessageCircle, Image, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { selectedCityId } = useCity();
  const { user } = useAuth();
  const { profile: modelProfile, isLoading: profileLoading } = useModelProfile();
  const navigate = useNavigate();
  
  const {
    data: models = [],
    isLoading: modelsLoading,
    error
  } = useModels(selectedCityId);

  const isLoading = modelsLoading || profileLoading;

  if (isLoading) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-100">Carregando...</div>
      </div>;
  }
  if (error) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-red-400">Erro ao carregar dados: {error.message}</div>
      </div>;
  }
  // Se o usuário é uma modelo logada, mostrar dashboard em vez da vitrine
  if (user && modelProfile) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <Header />
        
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">
              Olá, <span className="text-primary">{modelProfile.models?.name || 'Modelo'}</span>!
            </h1>
            <p className="text-zinc-400 text-lg">Gerencie seu perfil e acompanhe suas estatísticas</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card 
              className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
              onClick={() => navigate('/model-dashboard')}
            >
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Meu Perfil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-400 text-sm">
                  Gerencie suas informações pessoais, fotos e configurações
                </p>
                <Button className="w-full mt-4" variant="outline">
                  Acessar Perfil
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
              onClick={() => navigate('/chat')}
            >
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Conversas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-400 text-sm">
                  Veja e responda suas mensagens dos clientes
                </p>
                <Button className="w-full mt-4" variant="outline">
                  Ver Conversas
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
              onClick={() => navigate('/reels')}
            >
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Reels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-400 text-sm">
                  Veja como seus vídeos estão aparecendo nos reels
                </p>
                <Button className="w-full mt-4" variant="outline">
                  Ver Reels
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <p className="text-zinc-500 text-sm">
              💡 Acesse seu dashboard completo clicando no ícone de perfil no menu inferior
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Se é um cliente ou usuário não-modelo, mostrar a vitrine normalmente
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
           A VITRINE MAIS EXCLUSIVA DE <span className="text-primary">ARACAJU</span>
          </h1>
          <p className="text-zinc-400 text-lg">Descubra uma nova forma de conexão e entretenimento de alto nível.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
          {models.map(model => (
            <ModelCard 
              key={model.id} 
              model={model} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
