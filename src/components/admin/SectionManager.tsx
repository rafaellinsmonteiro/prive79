
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { X } from 'lucide-react';
import { CustomSection } from '@/hooks/useCustomFields';

interface SectionManagerProps {
  section?: CustomSection;
  onSubmit: (sectionData: any) => Promise<void>;
  onCancel: () => void;
}

const SectionManager = ({ section, onSubmit, onCancel }: SectionManagerProps) => {
  const [sectionName, setSectionName] = useState('');
  const [displayOrder, setDisplayOrder] = useState(100);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (section) {
      setSectionName(section.name || '');
      setDisplayOrder(section.display_order || 100);
      setIsActive(section.is_active !== false);
    }
  }, [section]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sectionName.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        name: sectionName,
        display_order: displayOrder,
        is_active: isActive,
      });
      
      if (!section) {
        setSectionName('');
        setDisplayOrder(100);
        setIsActive(true);
      }
    } catch (error) {
      console.error('Error saving section:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>{section ? 'Editar Seção' : 'Nova Seção'}</span>
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

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="is_active" className="text-white">
              Ativa
            </Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Salvando...' : (section ? 'Atualizar Seção' : 'Criar Seção')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SectionManager;
