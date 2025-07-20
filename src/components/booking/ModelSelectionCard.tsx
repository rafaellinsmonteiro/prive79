import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { PublicModel } from "@/hooks/usePublicModels";

interface ModelSelectionCardProps {
  model: PublicModel;
  onSelect: (modelId: string) => void;
}

export const ModelSelectionCard = ({ model, onSelect }: ModelSelectionCardProps) => {
  const minPrice = Math.min(...model.services.map(s => s.price));
  const maxPrice = Math.max(...model.services.map(s => s.price));

  return (
    <Card className="hover:shadow-lg transition-all duration-300 group cursor-pointer border-border/50">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg text-foreground group-hover:text-primary transition-colors">
              {model.name}
            </CardTitle>
            {model.neighborhood && (
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <MapPin className="h-3 w-3" />
                <span>{model.neighborhood}</span>
                {model.city && <span>, {model.city}</span>}
              </div>
            )}
          </div>
          <Badge variant="secondary" className="bg-muted">
            {model.services.length} serviços
          </Badge>
        </div>
        {model.description && (
          <CardDescription className="text-sm line-clamp-2">
            {model.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Preços a partir de:
          </div>
          <div className="font-semibold text-primary">
            R$ {minPrice}
            {minPrice !== maxPrice && ` - R$ ${maxPrice}`}
          </div>
        </div>
        <Button 
          onClick={() => onSelect(model.id)}
          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        >
          Selecionar Modelo
        </Button>
      </CardContent>
    </Card>
  );
};