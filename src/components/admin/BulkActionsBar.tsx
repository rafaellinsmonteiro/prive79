import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Eye, 
  EyeOff, 
  Trash2, 
  X, 
  CheckSquare, 
  Square,
  Users,
  Settings
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface BulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkActivate: () => void;
  onBulkDeactivate: () => void;
  onBulkDelete: () => void;
  onBulkVisibilityChange: (visibility: string) => void;
  isAllSelected: boolean;
}

const BulkActionsBar = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onBulkActivate,
  onBulkDeactivate,
  onBulkDelete,
  onBulkVisibilityChange,
  isAllSelected
}: BulkActionsBarProps) => {
  if (selectedCount === 0) return null;

  return (
    <Card className="bg-primary/10 border-primary/20 sticky top-0 z-10 shadow-lg">
      <CardContent className="p-3 md:p-4">
        {/* Layout Mobile */}
        <div className="block md:hidden space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="gap-1 text-xs">
              <Users className="w-3 h-3" />
              {selectedCount} de {totalCount}
            </Badge>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="gap-1 h-7 px-2 text-xs"
            >
              <X className="w-3 h-3" />
              Limpar
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={isAllSelected ? onClearSelection : onSelectAll}
              className="gap-1 h-7 text-xs"
            >
              {isAllSelected ? (
                <CheckSquare className="w-3 h-3" />
              ) : (
                <Square className="w-3 h-3" />
              )}
              {isAllSelected ? 'Desmarcar' : 'Sel. todos'}
            </Button>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={onBulkActivate}
                className="gap-1 h-7 px-2 text-xs hover:bg-green-50 hover:border-green-200"
              >
                <Eye className="w-3 h-3" />
                Ativar
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onBulkDeactivate}
                className="gap-1 h-7 px-2 text-xs hover:bg-yellow-50 hover:border-yellow-200"
              >
                <EyeOff className="w-3 h-3" />
                Desativar
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 h-7 px-2 text-xs text-destructive hover:bg-destructive/10 hover:border-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                    Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="w-[95vw] max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-base">Confirmar exclusão</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm">
                      Excluir {selectedCount} modelo(s)? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                    <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onBulkDelete}
                      className="w-full sm:w-auto bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    >
                      Excluir {selectedCount}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Visibilidade:</span>
            <Select onValueChange={onBulkVisibilityChange}>
              <SelectTrigger className="h-7 text-xs flex-1">
                <SelectValue placeholder="Alterar visibilidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Pública</SelectItem>
                <SelectItem value="private">Privada</SelectItem>
                <SelectItem value="plan_restricted">Restrita por Plano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Layout Desktop */}
        <div className="hidden md:flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={isAllSelected ? onClearSelection : onSelectAll}
                className="gap-2"
              >
                {isAllSelected ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                {isAllSelected ? 'Desmarcar todos' : 'Selecionar todos'}
              </Button>
              
              <Badge variant="secondary" className="gap-1">
                <Users className="w-3 h-3" />
                {selectedCount} de {totalCount} selecionadas
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Ações de status */}
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkActivate}
              className="gap-2 hover:bg-green-50 hover:border-green-200"
            >
              <Eye className="w-4 h-4" />
              Ativar
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onBulkDeactivate}
              className="gap-2 hover:bg-yellow-50 hover:border-yellow-200"
            >
              <EyeOff className="w-4 h-4" />
              Desativar
            </Button>

            {/* Visibilidade */}
            <Select onValueChange={onBulkVisibilityChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Visibilidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Pública</SelectItem>
                <SelectItem value="private">Privada</SelectItem>
                <SelectItem value="plan_restricted">Restrita por Plano</SelectItem>
              </SelectContent>
            </Select>

            {/* Deletar */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-destructive hover:bg-destructive/10 hover:border-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar exclusão em massa</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir {selectedCount} modelo(s) selecionada(s)? 
                    Esta ação não pode ser desfeita e removerá permanentemente:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Os dados das modelos</li>
                      <li>Todas as fotos associadas</li>
                      <li>Categorias vinculadas</li>
                      <li>Histórico de agendamentos</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onBulkDelete}
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  >
                    Excluir {selectedCount} modelo(s)
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Limpar seleção */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Limpar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkActionsBar;