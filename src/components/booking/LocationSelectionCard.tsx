import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Monitor, Home, User } from "lucide-react";

interface LocationSelectionCardProps {
  locations: string[];
  onSelect: (location: string) => void;
  selected?: string;
}

const locationConfig = {
  'online': {
    icon: Monitor,
    label: 'Online',
    description: 'Atendimento por videochamada'
  },
  'my_address': {
    icon: Home,
    label: 'Espaço de atendimento',
    description: 'No local do prestador do serviço'
  },
  'client_address': {
    icon: User,
    label: 'Endereço do cliente',
    description: 'No local informado pelo cliente'
  }
};

export const LocationSelectionCard = ({ locations, onSelect, selected }: LocationSelectionCardProps) => {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Escolha o Local</h2>
        <p className="text-muted-foreground">Selecione onde gostaria que o atendimento aconteça</p>
      </div>
      
      <div className="grid gap-4">
        {locations.map((location) => {
          const config = locationConfig[location as keyof typeof locationConfig];
          if (!config) return null;
          
          const Icon = config.icon;
          const isSelected = selected === location;
          
          return (
            <Card 
              key={location}
              className={`cursor-pointer transition-all ${
                isSelected 
                  ? 'border-primary bg-primary/5 shadow-md' 
                  : 'hover:border-primary/50 hover:shadow-sm'
              }`}
              onClick={() => onSelect(location)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isSelected 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{config.label}</CardTitle>
                      <CardDescription>{config.description}</CardDescription>
                    </div>
                  </div>
                  {isSelected && (
                    <Badge variant="default">Selecionado</Badge>
                  )}
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
};