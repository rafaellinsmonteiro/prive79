import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, User, Image, Briefcase, Package, Calendar, Star, MapPin, Heart, Circle, Eye, Users, Grid3X3, List, MessageCircle, Camera, X, LogOut } from 'lucide-react';
import { useSearch, SearchFilters } from '@/hooks/useSearch';
import { useDebounce } from '@/hooks/useDebounce';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';
const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [showsFace, setShowsFace] = useState(false);
  const [myLocation, setMyLocation] = useState(false);
  const [videoCall, setVideoCall] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    user,
    signOut
  } = useAuth();
  const {
    data: currentUser
  } = useCurrentUser();
  const {
    results,
    loading,
    searchModels
  } = useSearch();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const categories = [{
    key: 'all',
    label: 'Todos',
    icon: Search
  }, {
    key: 'profiles',
    label: 'Perfis',
    icon: User
  }, {
    key: 'content',
    label: 'Conteúdos',
    icon: Image
  }, {
    key: 'services',
    label: 'Serviços',
    icon: Briefcase
  }, {
    key: 'products',
    label: 'Produtos',
    icon: Package
  }, {
    key: 'events',
    label: 'Eventos',
    icon: Calendar
  }, {
    key: 'reviews',
    label: 'Avaliações',
    icon: Star
  }];

  // Trigger search when filters change
  useEffect(() => {
    const filters: SearchFilters = {
      searchTerm: debouncedSearchTerm,
      category: activeCategory,
      onlineOnly,
      showsFace,
      myLocation,
      videoCall
    };
    searchModels(filters);
  }, [debouncedSearchTerm, activeCategory, onlineOnly, showsFace, myLocation, videoCall]);

  // Handler functions
  const handleChat = (model: any) => {
    navigate(`/chat?model=${model.id}`);
  };
  const handleViewMedia = (model: any) => {
    setSelectedModel(model);
    setShowMediaModal(true);
  };
  const handleToggleFavorite = (modelId: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(modelId) ? prev.filter(id => id !== modelId) : [...prev, modelId];
      toast({
        title: prev.includes(modelId) ? "Removido dos favoritos" : "Adicionado aos favoritos",
        description: prev.includes(modelId) ? "Modelo removido da sua lista de favoritos" : "Modelo adicionado à sua lista de favoritos"
      });
      return newFavorites;
    });
  };
  const handleSignOut = async () => {
    const loadingToast = toast({
      title: "Fazendo logout...",
      description: "Aguarde..."
    });
    try {
      await signOut();
      navigate('/buscar', {
        replace: true
      });
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/buscar', {
        replace: true
      });
    }
  };
  const handleLogin = () => {
    navigate('/login');
  };

  const handleViewProfile = (model: any) => {
    navigate(`/modelo/${model.id}`);
  };

  // Filter results based on category
  const filteredResults = useMemo(() => {
    if (activeCategory === 'all' || activeCategory === 'profiles') {
      return results;
    }
    // For other categories, return empty array since we only have models for now
    return [];
  }, [results, activeCategory]);
  const renderListCard = (result: any) => {
    // Mock multiple images for demonstration
    const mockImages = [result.image, `https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=300&h=300&fit=crop`, `https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=300&fit=crop`, `https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=300&h=300&fit=crop`, `https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&h=300&fit=crop`].filter(Boolean).slice(0, 5);
    
    return (
      <Card key={result.id} className="bg-[hsl(var(--dark-card))] border-[hsl(var(--gold-accent))]/20 hover:border-[hsl(var(--gold-primary))]/40 transition-all duration-300 cursor-pointer group shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_hsl(var(--gold-primary))_/_0.1] overflow-hidden">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Images Gallery - Mais destaque */}
            <div className="flex gap-2 overflow-x-auto pb-2 flex-shrink-0">
              {mockImages.map((image, index) => (
                <div key={index} className="relative">
                  <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-xl overflow-hidden bg-[hsl(var(--dark-primary))] ring-2 ring-[hsl(var(--gold-accent))]/30 group-hover:ring-[hsl(var(--gold-primary))]/50 transition-all duration-300 shadow-lg">
                    {image ? (
                      <img src={image} alt={`${result.title} ${index + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-12 w-12 text-[hsl(var(--dark-muted))]" />
                      </div>
                    )}
                  </div>
                  {result.type === 'model' && index === 0 && (
                    <div className="absolute -bottom-1 -right-1">
                      <div className={`w-6 h-6 rounded-full border-3 border-[hsl(var(--dark-card))] ${result.is_online ? 'bg-green-500 shadow-[0_0_12px_green_/_0.6]' : 'bg-[hsl(var(--dark-muted))]'}`} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Content - Reduzido */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-sm truncate text-[hsl(var(--gold-primary))]">{result.title}</h3>
                    {result.age && <span className="text-xs text-[hsl(var(--dark-muted))]">{result.age} anos</span>}
                  </div>
                  {result.is_online && (
                    <Badge className="bg-gradient-to-r from-green-500/20 to-green-400/20 text-green-400 border-green-500/30 shadow-[0_2px_8px_green_/_0.2] text-xs px-2 py-0.5">
                      Online
                    </Badge>
                  )}
                </div>
                
                {result.description && (
                  <p className="text-[hsl(var(--dark-muted))] line-clamp-1 text-xs">{result.description}</p>
                )}
                
                <div className="flex items-center gap-3 text-xs text-[hsl(var(--dark-muted))]">
                  {result.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{result.location}</span>
                    </div>
                  )}
                  {result.is_online !== undefined && (
                    <div className="flex items-center gap-1">
                      <Circle className={`h-3 w-3 ${result.is_online ? 'fill-green-500 text-green-500' : 'fill-[hsl(var(--dark-muted))] text-[hsl(var(--dark-muted))]'}`} />
                      <span>{result.is_online ? 'Disponível' : 'Indisponível'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions - Mais compactos */}
              <div className="flex flex-col gap-1.5 mt-3">
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-[hsl(var(--gold-primary))] to-[hsl(var(--gold-accent))] text-[hsl(var(--dark-primary))] hover:from-[hsl(var(--gold-primary))]/90 hover:to-[hsl(var(--gold-accent))]/90 shadow-[0_4px_12px_hsl(var(--gold-primary))_/_0.3] font-medium text-xs h-7"
                  onClick={() => handleViewProfile(result)}
                >
                  Ver Perfil
                </Button>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="text-[hsl(var(--dark-muted))] hover:text-[hsl(var(--gold-primary))] hover:bg-[hsl(var(--gold-accent))]/10 h-6 w-6 p-0" title="Enviar mensagem" onClick={() => handleChat(result)}>
                    <MessageCircle className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-[hsl(var(--dark-muted))] hover:text-[hsl(var(--gold-primary))] hover:bg-[hsl(var(--gold-accent))]/10 h-6 w-6 p-0" title="Ver mídias" onClick={() => handleViewMedia(result)}>
                    <Camera className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className={`hover:bg-[hsl(var(--gold-accent))]/10 h-6 w-6 p-0 ${favorites.includes(result.id) ? 'text-red-500 hover:text-red-600' : 'text-[hsl(var(--dark-muted))] hover:text-[hsl(var(--gold-primary))]'}`} title={favorites.includes(result.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"} onClick={() => handleToggleFavorite(result.id)}>
                    <Heart className={`h-3 w-3 ${favorites.includes(result.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  const renderGridCard = (result: any) => {
    return (
      <Card key={result.id} className="bg-[hsl(var(--dark-card))] border-[hsl(var(--gold-accent))]/20 hover:border-[hsl(var(--gold-primary))]/40 transition-all duration-300 cursor-pointer group shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_hsl(var(--gold-primary))_/_0.1] overflow-hidden">
        <CardContent className="p-2">
          <div className="space-y-2">
            {/* Photo - Imagem em destaque */}
            <div className="relative mx-auto w-fit">
              <div className="w-full h-48 rounded-lg overflow-hidden bg-[hsl(var(--dark-primary))] ring-2 ring-[hsl(var(--gold-accent))]/30 group-hover:ring-[hsl(var(--gold-primary))]/50 transition-all duration-300 shadow-lg">
                {result.image ? (
                  <img src={result.image} alt={result.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="h-16 w-16 text-[hsl(var(--dark-muted))]" />
                  </div>
                )}
              </div>
              {result.type === 'model' && (
                <div className="absolute -bottom-1 -right-1">
                  <div className={`w-6 h-6 rounded-full border-3 border-[hsl(var(--dark-card))] ${result.is_online ? 'bg-green-500 shadow-[0_0_12px_green_/_0.6]' : 'bg-[hsl(var(--dark-muted))]'}`} />
                </div>
              )}
            </div>

            {/* Content - Minimalista */}
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1">
                <h3 className="font-medium truncate text-[hsl(var(--gold-primary))] text-xs">{result.title}</h3>
                {result.is_online && <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_4px_green_/_0.7]" />}
              </div>
              
              {result.age && <span className="text-xs text-[hsl(var(--dark-muted))]">{result.age} anos</span>}
              
              {result.location && (
                <div className="flex items-center justify-center gap-1 text-xs text-[hsl(var(--dark-muted))]">
                  <MapPin className="h-2.5 w-2.5" />
                  <span className="truncate">{result.location}</span>
                </div>
              )}
            </div>

            {/* Actions - Muito compactos */}
            <div className="space-y-1">
              <Button 
                size="sm" 
                className="w-full bg-gradient-to-r from-[hsl(var(--gold-primary))] to-[hsl(var(--gold-accent))] text-[hsl(var(--dark-primary))] hover:from-[hsl(var(--gold-primary))]/90 hover:to-[hsl(var(--gold-accent))]/90 shadow-[0_4px_12px_hsl(var(--gold-primary))_/_0.3] font-medium text-xs h-6"
                onClick={() => handleViewProfile(result)}
              >
                Ver Perfil
              </Button>
              <div className="flex gap-0.5">
                <Button size="sm" variant="ghost" className="flex-1 text-[hsl(var(--dark-muted))] hover:text-[hsl(var(--gold-primary))] hover:bg-[hsl(var(--gold-accent))]/10 h-5 p-0" title="Enviar mensagem" onClick={() => handleChat(result)}>
                  <MessageCircle className="h-2.5 w-2.5" />
                </Button>
                <Button size="sm" variant="ghost" className="flex-1 text-[hsl(var(--dark-muted))] hover:text-[hsl(var(--gold-primary))] hover:bg-[hsl(var(--gold-accent))]/10 h-5 p-0" title="Ver mídias" onClick={() => handleViewMedia(result)}>
                  <Camera className="h-2.5 w-2.5" />
                </Button>
                <Button size="sm" variant="ghost" className={`flex-1 hover:bg-[hsl(var(--gold-accent))]/10 h-5 p-0 ${favorites.includes(result.id) ? 'text-red-500 hover:text-red-600' : 'text-[hsl(var(--dark-muted))] hover:text-[hsl(var(--gold-primary))]'}`} title={favorites.includes(result.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"} onClick={() => handleToggleFavorite(result.id)}>
                  <Heart className={`h-2.5 w-2.5 ${favorites.includes(result.id) ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  return <div className="min-h-screen bg-[hsl(var(--dark-primary))] relative">
      {/* Floating User Icon - apenas se logado */}
      {user && <div className="fixed top-4 right-4 z-50">
          
        </div>}

      <div className="container max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-80 lg:flex-shrink-0">
            {/* Card de Login/Logout */}
            <Card className="bg-[hsl(var(--dark-card))] border-[hsl(var(--gold-accent))]/20 mb-6 shadow-[0_4px_20px_hsl(var(--gold-primary))_/_0.1]">
              <CardHeader>
                <CardTitle className="text-[hsl(var(--dark-text))] text-lg">
                  {user ? 'Conta' : 'Entrar'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user ? <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      {currentUser?.profile_photo_url ? <img src={currentUser.profile_photo_url} alt="User" className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-zinc-600 flex items-center justify-center">
                          <User className="w-5 h-5 text-zinc-300" />
                        </div>}
                      <div>
                        <p className="text-[hsl(var(--dark-text))] font-medium">
                          {currentUser?.name || user.email}
                        </p>
                        <p className="text-[hsl(var(--dark-muted))] text-sm">
                          {currentUser?.user_role || 'Usuário'}
                        </p>
                      </div>
                    </div>
                    <Button onClick={handleSignOut} variant="outline" className="w-full bg-transparent border-[hsl(var(--gold-accent))] text-[hsl(var(--gold-primary))] hover:bg-[hsl(var(--gold-primary))]/10">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </Button>
                  </div> : <div className="space-y-4">
                    <p className="text-[hsl(var(--dark-muted))] text-sm">
                      Faça login para acessar recursos exclusivos e personalizar sua experiência.
                    </p>
                    <Button onClick={handleLogin} className="w-full bg-[hsl(var(--gold-primary))] hover:bg-[hsl(var(--gold-primary))]/90 text-black font-medium">
                      <User className="w-4 h-4 mr-2" />
                      Fazer Login
                    </Button>
                  </div>}
              </CardContent>
            </Card>

            <Card className="bg-[hsl(var(--dark-card))] border-[hsl(var(--gold-accent))]/20 lg:sticky lg:top-6 shadow-[0_4px_20px_hsl(var(--gold-primary))_/_0.1]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[hsl(var(--gold-primary))]">
                  <Search className="h-5 w-5" />
                  Filtros de Busca
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Quick Filters */}
                <div className="space-y-4">
                  <Label className="text-[hsl(var(--dark-text))]">Filtros Rápidos</Label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{/* ... keep existing code */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--dark-primary))] border border-[hsl(var(--gold-accent))]/20">
                      <Label htmlFor="online-only" className="flex items-center gap-2 cursor-pointer text-[hsl(var(--dark-text))] text-xs">
                        <Circle className="h-3 w-3 fill-green-500 text-green-500" />
                        Online
                      </Label>
                      <Switch id="online-only" checked={onlineOnly} onCheckedChange={setOnlineOnly} className="data-[state=checked]:bg-[hsl(var(--gold-primary))] scale-75" />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--dark-primary))] border border-[hsl(var(--gold-accent))]/20">
                      <Label htmlFor="shows-face" className="flex items-center gap-2 cursor-pointer text-[hsl(var(--dark-text))] text-xs">
                        <Eye className="h-3 w-3" />
                        Rosto
                      </Label>
                      <Switch id="shows-face" checked={showsFace} onCheckedChange={setShowsFace} className="data-[state=checked]:bg-[hsl(var(--gold-primary))] scale-75" />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--dark-primary))] border border-[hsl(var(--gold-accent))]/20">
                      <Label htmlFor="my-location" className="flex items-center gap-2 cursor-pointer text-[hsl(var(--dark-text))] text-xs">
                        <MapPin className="h-3 w-3" />
                        Meu local
                      </Label>
                      <Switch id="my-location" checked={myLocation} onCheckedChange={setMyLocation} className="data-[state=checked]:bg-[hsl(var(--gold-primary))] scale-75" />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--dark-primary))] border border-[hsl(var(--gold-accent))]/20">
                      <Label htmlFor="video-call" className="flex items-center gap-2 cursor-pointer text-[hsl(var(--dark-text))] text-xs">
                        <Camera className="h-3 w-3" />
                        Criadora
                      </Label>
                      <Switch id="video-call" checked={videoCall} onCheckedChange={setVideoCall} className="data-[state=checked]:bg-[hsl(var(--gold-primary))] scale-75" />
                    </div>
                  </div>
                </div>

                <Separator className="bg-[hsl(var(--gold-accent))]/20" />

                {/* Search Input */}
                <div className="space-y-2">
                  <Label htmlFor="search" className="text-[hsl(var(--dark-text))]">Buscar</Label>
                  <div className="relative flex-shrink-0">{/* ... keep existing code */}
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[hsl(var(--dark-muted))]" />
                    <Input id="search" placeholder="Digite sua busca..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-[hsl(var(--dark-primary))] border-[hsl(var(--gold-accent))]/30 text-[hsl(var(--dark-text))] placeholder:text-[hsl(var(--dark-muted))] focus:border-[hsl(var(--gold-primary))] focus:ring-[hsl(var(--gold-primary))]/20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Quick Filter Badges */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-[hsl(var(--dark-muted))]">Filtros ativos:</span>
              {onlineOnly && <Badge className="bg-gradient-to-r from-green-500/20 to-green-400/20 text-green-400 border-green-500/30 shadow-[0_2px_8px_green_/_0.2]">
                  <Circle className="h-3 w-3 mr-1 fill-current" />
                  Online agora
                </Badge>}
              {showsFace && <Badge className="bg-gradient-to-r from-[hsl(var(--gold-primary))]/20 to-[hsl(var(--gold-accent))]/20 text-[hsl(var(--gold-primary))] border-[hsl(var(--gold-primary))]/30 shadow-[0_2px_8px_hsl(var(--gold-primary))_/_0.2]">
                  <Eye className="h-3 w-3 mr-1" />
                  Mostra o rosto
                </Badge>}
              {myLocation && <Badge className="bg-gradient-to-r from-[hsl(var(--gold-primary))]/20 to-[hsl(var(--gold-accent))]/20 text-[hsl(var(--gold-primary))] border-[hsl(var(--gold-primary))]/30 shadow-[0_2px_8px_hsl(var(--gold-primary))_/_0.2]">
                  <MapPin className="h-3 w-3 mr-1" />
                  Meu local
                </Badge>}
              {videoCall && <Badge className="bg-gradient-to-r from-[hsl(var(--gold-primary))]/20 to-[hsl(var(--gold-accent))]/20 text-[hsl(var(--gold-primary))] border-[hsl(var(--gold-primary))]/30 shadow-[0_2px_8px_hsl(var(--gold-primary))_/_0.2]">
                  <Camera className="h-3 w-3 mr-1" />
                  Videochamada
                </Badge>}
              {activeCategory !== 'all' && <Badge variant="outline" className="border-[hsl(var(--gold-accent))]/40 text-[hsl(var(--dark-text))]">
                  {categories.find(c => c.key === activeCategory)?.label}
                </Badge>}
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div className="text-[hsl(var(--dark-text))]">
                <span className="font-semibold text-[hsl(var(--gold-primary))]">{filteredResults.length}</span>
                <span className="text-[hsl(var(--dark-muted))] ml-2">
                  resultado{filteredResults.length !== 1 ? 's' : ''} encontrado{filteredResults.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              {/* View Toggle */}
              <div className="flex items-center gap-2 bg-[hsl(var(--dark-card))] p-1 rounded-lg border border-[hsl(var(--gold-accent))]/20">
                <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'bg-gradient-to-r from-[hsl(var(--gold-primary))] to-[hsl(var(--gold-accent))] text-[hsl(var(--dark-primary))] shadow-[0_2px_8px_hsl(var(--gold-primary))_/_0.3]' : 'text-[hsl(var(--dark-muted))] hover:text-[hsl(var(--gold-primary))] hover:bg-[hsl(var(--gold-accent))]/10'}>
                  <List className="h-4 w-4" />
                </Button>
                <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'bg-gradient-to-r from-[hsl(var(--gold-primary))] to-[hsl(var(--gold-accent))] text-[hsl(var(--dark-primary))] shadow-[0_2px_8px_hsl(var(--gold-primary))_/_0.3]' : 'text-[hsl(var(--dark-muted))] hover:text-[hsl(var(--gold-primary))] hover:bg-[hsl(var(--gold-accent))]/10'}>
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Results List */}
            {loading ? <Card className="bg-[hsl(var(--dark-card))] border-[hsl(var(--gold-accent))]/20">
                <CardContent className="p-6 sm:p-12 text-center">
                  <div className="animate-spin rounded-full h-8 sm:h-12 w-8 sm:w-12 border-b-2 border-[hsl(var(--gold-primary))] mx-auto mb-4"></div>
                  <p className="text-[hsl(var(--dark-muted))]">Buscando...</p>
                </CardContent>
              </Card> : filteredResults.length > 0 ? viewMode === 'list' ? <div className="space-y-4">
                  {filteredResults.map(renderListCard)}
                </div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredResults.map(renderGridCard)}
                </div> : <Card className="bg-[hsl(var(--dark-card))] border-[hsl(var(--gold-accent))]/20">
                <CardContent className="p-6 sm:p-12 text-center">
                  <Search className="h-8 sm:h-12 w-8 sm:w-12 text-[hsl(var(--dark-muted))] mx-auto mb-4" />
                  <h3 className="font-semibold mb-2 text-[hsl(var(--dark-text))]">Nenhum resultado encontrado</h3>
                  <p className="text-[hsl(var(--dark-muted))] text-sm sm:text-base">{/* ... keep existing code */}
                    {searchTerm.trim() ? "Tente ajustar sua busca ou explore outras categorias" : "Digite algo para começar a busca"}
                  </p>
                </CardContent>
              </Card>}
          </div>
        </div>
      </div>

      {/* Media Modal */}
      <Dialog open={showMediaModal} onOpenChange={setShowMediaModal}>
        <DialogContent className="max-w-4xl bg-[hsl(var(--dark-card))] border-[hsl(var(--gold-accent))]/20">
          <DialogHeader>
            <DialogTitle className="text-[hsl(var(--gold-primary))] flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Mídias - {selectedModel?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            {selectedModel ? <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
                {/* Simulated media gallery */}
                {Array.from({
              length: 8
            }).map((_, index) => <div key={index} className="aspect-square rounded-lg overflow-hidden bg-[hsl(var(--dark-primary))] border border-[hsl(var(--gold-accent))]/20 hover:border-[hsl(var(--gold-primary))]/40 transition-all duration-300 cursor-pointer group">
                    {selectedModel.image ? <img src={selectedModel.image} alt={`Media ${index + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-full flex items-center justify-center">
                        <Image className="h-8 w-8 text-[hsl(var(--dark-muted))]" />
                      </div>}
                  </div>)}
              </div> : <div className="p-8 text-center text-[hsl(var(--dark-muted))]">
                Nenhuma mídia disponível
              </div>}
          </div>
        </DialogContent>
      </Dialog>
    </div>;
};
export default SearchPage;