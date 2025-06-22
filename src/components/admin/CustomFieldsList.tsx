
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2 } from 'lucide-react';
import { CustomField, CustomSection } from '@/hooks/useCustomFields';

interface CustomFieldsListProps {
  fields: CustomField[];
  sections: CustomSection[];
  loading: boolean;
  onEdit: (id: string) => void;
  onEditSection: (id: string) => void;
}

const CustomFieldsList = ({ fields, sections, loading, onEdit, onEditSection }: CustomFieldsListProps) => {
  if (loading) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-6">
          <p className="text-white">Carregando campos personalizados...</p>
        </CardContent>
      </Card>
    );
  }

  // Group fields by section
  const fieldsBySection = fields.reduce((acc, field) => {
    const section = field.section || 'Campos Personalizados';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(field);
    return acc;
  }, {} as Record<string, CustomField[]>);

  return (
    <div className="space-y-6">
      {sections.map((section) => {
        const sectionFields = fieldsBySection[section.name] || [];
        
        return (
          <Card key={section.id} className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>{section.name}</span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditSection(section.id)}
                    className="text-zinc-400 hover:text-white"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sectionFields.length === 0 ? (
                <p className="text-zinc-400">Nenhum campo nesta seção</p>
              ) : (
                <div className="space-y-2">
                  {sectionFields.map((field) => (
                    <div
                      key={field.id}
                      className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"
                    >
                      <div>
                        <span className="text-white font-medium">{field.label}</span>
                        <span className="text-zinc-400 text-sm ml-2">
                          ({field.field_name}) - {field.field_type}
                          {field.is_required && ' *'}
                          {!field.is_active && ' (Inativo)'}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(field.id)}
                        className="text-zinc-400 hover:text-white"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
      
      {/* Show fields without sections */}
      {fieldsBySection['Campos Personalizados'] && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Campos Personalizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {fieldsBySection['Campos Personalizados'].map((field) => (
                <div
                  key={field.id}
                  className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"
                >
                  <div>
                    <span className="text-white font-medium">{field.label}</span>
                    <span className="text-zinc-400 text-sm ml-2">
                      ({field.field_name}) - {field.field_type}
                      {field.is_required && ' *'}
                      {!field.is_active && ' (Inativo)'}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(field.id)}
                    className="text-zinc-400 hover:text-white"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomFieldsList;
