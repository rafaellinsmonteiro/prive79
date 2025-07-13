import React from 'react';
import DesignTestLayout from '@/components/design-test/DesignTestLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, MoreVertical, Star, MapPin, Eye, Edit, Trash2 } from 'lucide-react';

const AdminDesignTestModels = () => {
  const models = [
    {
      id: 1,
      name: 'Ana Silva',
      age: 25,
      city: 'São Paulo',
      rating: 4.8,
      reviews: 23,
      status: 'Ativo',
      featured: true,
      earnings: 'R$ 3.450',
    },
    {
      id: 2,
      name: 'Carolina Mendes',
      age: 28,
      city: 'Rio de Janeiro',
      rating: 4.9,
      reviews: 31,
      status: 'Ativo',
      featured: false,
      earnings: 'R$ 2.890',
    },
    {
      id: 3,
      name: 'Beatriz Costa',
      age: 24,
      city: 'Belo Horizonte',
      rating: 4.7,
      reviews: 18,
      status: 'Pendente',
      featured: false,
      earnings: 'R$ 1.250',
    },
    {
      id: 4,
      name: 'Juliana Santos',
      age: 26,
      city: 'Salvador',
      rating: 4.9,
      reviews: 42,
      status: 'Ativo',
      featured: true,
      earnings: 'R$ 4.120',
    },
  ];

  return (
    <DesignTestLayout title="Gestão de Modelos">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[hsl(var(--dark-muted))]" />
            <Input 
              placeholder="Buscar modelos..." 
              className="pl-10 bg-[hsl(var(--dark-card))] border-[hsl(var(--gold-accent))]/20 text-[hsl(var(--dark-text))]"
            />
          </div>
          <Button variant="outline" className="border-[hsl(var(--gold-accent))]/20 text-[hsl(var(--dark-text))] hover:bg-[hsl(var(--gold-accent))]/10">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>
        <Button className="bg-gradient-to-r from-[hsl(var(--gold-primary))] to-[hsl(var(--gold-accent))] hover:from-[hsl(var(--gold-primary))]/90 hover:to-[hsl(var(--gold-accent))]/90 text-[hsl(var(--dark-primary))]">
          <Plus className="w-4 h-4 mr-2" />
          Novo Modelo
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-[hsl(var(--dark-card))] border-[hsl(var(--gold-accent))]/20">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[hsl(var(--gold-primary))]">156</p>
              <p className="text-sm text-[hsl(var(--dark-muted))]">Total de Modelos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[hsl(var(--dark-card))] border-[hsl(var(--gold-accent))]/20">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">142</p>
              <p className="text-sm text-[hsl(var(--dark-muted))]">Ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[hsl(var(--dark-card))] border-[hsl(var(--gold-accent))]/20">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-500">8</p>
              <p className="text-sm text-[hsl(var(--dark-muted))]">Pendentes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[hsl(var(--dark-card))] border-[hsl(var(--gold-accent))]/20">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">6</p>
              <p className="text-sm text-[hsl(var(--dark-muted))]">Inativos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {models.map((model) => (
          <Card key={model.id} className="bg-[hsl(var(--dark-card))] border-[hsl(var(--gold-accent))]/20 hover:shadow-lg transition-all duration-200 group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[hsl(var(--gold-primary))] to-[hsl(var(--gold-accent))] flex items-center justify-center">
                  <span className="text-[hsl(var(--dark-primary))] font-bold text-lg">
                    {model.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  {model.featured && (
                    <Badge variant="secondary" className="bg-[hsl(var(--gold-primary))]/20 text-[hsl(var(--gold-primary))] border-[hsl(var(--gold-primary))]/30">
                      Destaque
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm" className="p-1 h-8 w-8 text-[hsl(var(--dark-muted))] hover:text-[hsl(var(--gold-primary))]">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-[hsl(var(--gold-primary))]">{model.name}</h3>
                  <p className="text-sm text-[hsl(var(--dark-muted))]">{model.age} anos</p>
                </div>

                <div className="flex items-center text-[hsl(var(--dark-muted))] text-sm">
                  <MapPin className="h-3 w-3 mr-1" />
                  {model.city}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-[hsl(var(--dark-text))]">{model.rating}</span>
                    <span className="text-xs text-[hsl(var(--dark-muted))]">({model.reviews})</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      model.status === 'Ativo' 
                        ? 'border-green-500/50 text-green-500' 
                        : model.status === 'Pendente'
                        ? 'border-yellow-500/50 text-yellow-500'
                        : 'border-red-500/50 text-red-500'
                    }`}
                  >
                    {model.status}
                  </Badge>
                </div>

                <div className="pt-2 border-t border-[hsl(var(--gold-accent))]/20">
                  <p className="text-sm text-[hsl(var(--dark-muted))]">Ganhos:</p>
                  <p className="font-semibold text-[hsl(var(--gold-primary))]">{model.earnings}</p>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 border-[hsl(var(--gold-accent))]/20 text-[hsl(var(--dark-text))] hover:bg-[hsl(var(--gold-accent))]/10">
                    <Eye className="h-3 w-3 mr-1" />
                    Ver
                  </Button>
                  <Button variant="outline" size="sm" className="border-[hsl(var(--gold-accent))]/20 text-[hsl(var(--dark-text))] hover:bg-[hsl(var(--gold-accent))]/10">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" className="border-red-500/20 text-red-500 hover:bg-red-500/10">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DesignTestLayout>
  );
};

export default AdminDesignTestModels;