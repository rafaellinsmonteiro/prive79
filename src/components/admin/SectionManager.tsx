
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateCustomSection } from '@/hooks/useCustomFields';
import { useToast } from '@/hooks/use-toast';
import { Plus, X } from 'lucide-react';

interface SectionManagerProps {
  onCancel: () => void;
}

const SectionManager = ({ onCancel }: SectionManagerProps) => {
  const [sectionName, setSectionName] = useState('');
  const [displayOrder, setDisplayOrder] = useState(100);
  const createCustomSection = useCreateCustomSection();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sectionName.trim()) {
      toast({
        title: "Erro",
        description: "Nome da seção é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createCustomSection.mutateAsync({
        name: sectionName,
        display_order: displayOrder,
        is_active: true,
      });
      
      toast({
        title: "Sucesso",
        description: "Seção criada com sucesso!",
      });
      
      setSectionName('');
      onCancel();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar seção.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>Nova Seção</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-zinc-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="section_name" className="text-white">
              Nome da Seção *
            </Label>
            <Input
              id="section_name"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              placeholder="ex: Informações Profissionais"
              className="bg-zinc-800 border-zinc-700 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_order" className="text-white">
              Ordem de Exibição
            </Label>
            <Input
              id="display_order"
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={createCustomSection.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createCustomSection.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createCustomSection.isPending ? 'Criando...' : 'Criar Seção'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SectionManager;
