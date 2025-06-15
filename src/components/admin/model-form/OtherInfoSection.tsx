
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ModelFormData } from '../ModelForm';

interface OtherInfoSectionProps {
  form: UseFormReturn<ModelFormData>;
}

const OtherInfoSection = ({ form }: OtherInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white border-b border-zinc-700 pb-2">
        Outras Informações
      </h3>
      
      <div className="space-y-2">
        <Label htmlFor="languages" className="text-white">Idiomas</Label>
        <Input
          id="languages"
          {...form.register('languages')}
          placeholder="Português, Inglês, Espanhol"
          className="bg-zinc-800 border-zinc-700 text-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-white">Descrição</Label>
        <Textarea
          id="description"
          {...form.register('description')}
          rows={4}
          className="bg-zinc-800 border-zinc-700 text-white"
          placeholder="Descrição detalhada da modelo..."
        />
      </div>
    </div>
  );
};

export default OtherInfoSection;
