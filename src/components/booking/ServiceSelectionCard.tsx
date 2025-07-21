import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Users } from "lucide-react";
import { PublicService } from "@/hooks/usePublicModels";

interface ServiceSelectionCardProps {
  service: PublicService;
  onSelect: (serviceId: string) => void;
  selected?: boolean;
}

export const ServiceSelectionCard = ({ service, onSelect, selected }: ServiceSelectionCardProps) => {
  return (
    <Card className={`hover:shadow-lg transition-all duration-300 cursor-pointer border-border/50 ${
      selected ? 'ring-2 ring-primary border-primary/50' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg text-foreground">
              {service.name}
            </CardTitle>
            <div className="flex items-center gap-3 text-muted-foreground text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{service.duration} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>Até {service.max_people} {service.max_people === 1 ? 'pessoa' : 'pessoas'}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-xl text-primary">
              R$ {service.price}
            </div>
          </div>
        </div>
        {service.description && (
          <CardDescription className="text-sm">
            {service.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <Button 
          onClick={() => onSelect(service.id)}
          className={`w-full ${
            selected 
              ? 'bg-primary hover:bg-primary/90' 
              : 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70'
          }`}
          variant={selected ? "default" : "default"}
        >
          {selected ? 'Selecionado' : 'Selecionar Serviço'}
        </Button>
      </CardContent>
    </Card>
  );
};