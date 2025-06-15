
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ModelFormData } from '../ModelForm';

interface PhysicalCharacteristicsSectionProps {
  form: UseFormReturn<ModelFormData>;
}

const PhysicalCharacteristicsSection = ({ form }: PhysicalCharacteristicsSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white border-b border-zinc-700 pb-2">
        Características Físicas
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="height" className="text-white">Altura</Label>
          <Input
            id="height"
            {...form.register('height')}
            placeholder="1.70m"
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="weight" className="text-white">Peso</Label>
          <Input
            id="weight"
            {...form.register('weight')}
            placeholder="60kg"
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="eyes" className="text-white">Olhos</Label>
          <Input
            id="eyes"
            {...form.register('eyes')}
            placeholder="Castanhos, Verdes, etc."
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="body_type" className="text-white">Manequim</Label>
          <Input
            id="body_type"
            {...form.register('body_type')}
            placeholder="P, M, G, GG"
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="shoe_size" className="text-white">Calçado</Label>
          <Input
            id="shoe_size"
            {...form.register('shoe_size')}
            placeholder="37, 38, 39"
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        </div>
      </div>

      {/* Medidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bust" className="text-white">Busto</Label>
          <Input
            id="bust"
            {...form.register('bust')}
            placeholder="90cm"
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="waist" className="text-white">Cintura</Label>
          <Input
            id="waist"
            {...form.register('waist')}
            placeholder="60cm"
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hip" className="text-white">Quadril</Label>
          <Input
            id="hip"
            {...form.register('hip')}
            placeholder="90cm"
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        </div>
      </div>
    </div>
  );
};

export default PhysicalCharacteristicsSection;
