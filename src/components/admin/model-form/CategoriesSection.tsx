
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from '@/components/ui/checkbox';
import { Category } from '@/hooks/useCategories';
import { ModelFormData } from '../ModelForm';

interface CategoriesSectionProps {
  form: UseFormReturn<ModelFormData>;
  categories: Category[];
}

const CategoriesSection = ({ form, categories = [] }: CategoriesSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white border-b border-zinc-700 pb-2">
        Categorias
      </h3>
      <FormField
        control={form.control}
        name="category_ids"
        render={() => (
          <FormItem>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((item) => (
                <FormField
                  key={item.id}
                  control={form.control}
                  name="category_ids"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={item.id}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, item.id])
                                : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== item.id
                                    )
                                  )
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal text-white">
                          {item.name}
                        </FormLabel>
                      </FormItem>
                    )
                  }}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default CategoriesSection;
