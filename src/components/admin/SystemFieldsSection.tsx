
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Settings, Lock } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';

interface SystemField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  section: string;
  description?: string;
  protected?: boolean; // Campos que não podem ser editados
}

interface SystemFieldsSectionProps {
  onEditField: (field: SystemField) => void;
}

const SystemFieldsSection = ({ onEditField }: SystemFieldsSectionProps) => {
  const systemFieldsBySection = {
    'Informações Básicas': [
      { name: 'name', label: 'Nome', type: 'text', required: true, section: 'Informações Básicas', description: 'Nome da modelo', protected: true },
      { name: 'age', label: 'Idade', type: 'number', required: true, section: 'Informações Básicas', description: 'Idade da modelo', protected: true },
      { name: 'city_id', label: 'Cidade', type: 'select', required: false, section: 'Informações Básicas', description: 'Cidade onde atende', protected: true },
      { name: 'neighborhood', label: 'Bairro', type: 'text', required: false, section: 'Informações Básicas', description: 'Bairro onde atende' },
      { name: 'whatsapp_number', label: 'WhatsApp', type: 'text', required: false, section: 'Informações Básicas', description: 'Número do WhatsApp' },
    ],
    'Características Físicas': [
      { name: 'height', label: 'Altura', type: 'text', required: false, section: 'Características Físicas', description: 'Altura da modelo' },
      { name: 'weight', label: 'Peso', type: 'text', required: false, section: 'Características Físicas', description: 'Peso da modelo' },
      { name: 'eyes', label: 'Olhos', type: 'text', required: false, section: 'Características Físicas', description: 'Cor dos olhos' },
      { name: 'body_type', label: 'Manequim', type: 'text', required: false, section: 'Características Físicas', description: 'Tipo de corpo/manequim' },
      { name: 'shoe_size', label: 'Calçado', type: 'text', required: false, section: 'Características Físicas', description: 'Número do sapato' },
      { name: 'bust', label: 'Busto', type: 'text', required: false, section: 'Características Físicas', description: 'Medida do busto' },
      { name: 'waist', label: 'Cintura', type: 'text', required: false, section: 'Características Físicas', description: 'Medida da cintura' },
      { name: 'hip', label: 'Quadril', type: 'text', required: false, section: 'Características Físicas', description: 'Medida do quadril' },
    ],
    'Outras Informações': [
      { name: 'languages', label: 'Idiomas', type: 'text', required: false, section: 'Outras Informações', description: 'Idiomas falados' },
      { name: 'description', label: 'Descrição', type: 'textarea', required: false, section: 'Outras Informações', description: 'Descrição detalhada' },
    ],
  };

  const getFieldTypeName = (type: string) => {
    const types: { [key: string]: string } = {
      'text': 'Texto',
      'textarea': 'Texto Longo',
      'number': 'Número',
      'boolean': 'Sim/Não',
      'select': 'Lista de Opções',
      'date': 'Data',
      'email': 'Email',
      'url': 'URL',
    };
    return types[type] || type;
  };

  return (
    <div className="space-y-6">
      {Object.entries(systemFieldsBySection).map(([sectionName, fields]) => (
        <Card key={sectionName} className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {sectionName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-700">
                  <TableHead className="text-zinc-300">Nome do Campo</TableHead>
                  <TableHead className="text-zinc-300">Rótulo</TableHead>
                  <TableHead className="text-zinc-300">Tipo</TableHead>
                  <TableHead className="text-zinc-300">Obrigatório</TableHead>
                  <TableHead className="text-zinc-300">Descrição</TableHead>
                  <TableHead className="text-zinc-300">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field) => (
                  <TableRow key={field.name} className="border-zinc-700">
                    <TableCell className="text-white font-mono text-sm">
                      <div className="flex items-center gap-2">
                        {field.protected && <Lock className="h-3 w-3 text-yellow-500" />}
                        {field.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-white">
                      {field.label}
                    </TableCell>
                    <TableCell className="text-zinc-300">
                      {getFieldTypeName(field.type)}
                    </TableCell>
                    <TableCell className="text-zinc-300">
                      {field.required ? 'Sim' : 'Não'}
                    </TableCell>
                    <TableCell className="text-zinc-300 text-sm">
                      {field.description}
                      {field.protected && (
                        <div className="text-xs text-yellow-500 mt-1">
                          Campo protegido - não pode ser editado
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {field.protected ? (
                        <div className="flex items-center gap-1 text-zinc-500">
                          <Lock className="h-4 w-4" />
                          <span className="text-xs">Protegido</span>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditField(field)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-zinc-800"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SystemFieldsSection;
