import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  DollarSign, 
  MessageSquare, 
  Paperclip,
  Repeat,
  Edit,
  Trash2,
  Send,
  Upload
} from 'lucide-react';
import { AdminAppointment, useAdminAppointments } from '@/hooks/useAdminAppointments';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useFileUpload } from '@/hooks/useFileUpload';

interface AdminAppointmentDetailsProps {
  appointment: AdminAppointment;
  onBack: () => void;
}

export const AdminAppointmentDetails = ({ appointment, onBack }: AdminAppointmentDetailsProps) => {
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    status: appointment.status,
    payment_status: appointment.payment_status,
    location: appointment.location || '',
    observations: appointment.observations || '',
    admin_notes: appointment.admin_notes || '',
  });

  const { updateAppointment, deleteAppointment, addComment, addAttachment } = useAdminAppointments();
  const { uploading } = useFileUpload();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pago';
      case 'partial': return 'Parcial';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  const handleSaveEdit = async () => {
    try {
      await updateAppointment.mutateAsync({
        id: appointment.id,
        ...editData,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      try {
        await deleteAppointment.mutateAsync(appointment.id);
        onBack();
      } catch (error) {
        console.error('Error deleting appointment:', error);
      }
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await addComment.mutateAsync({
        appointment_id: appointment.id,
        comment: newComment,
      });
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Por enquanto, vamos usar uma URL temporária
      // Em produção, isso deveria fazer upload para Supabase Storage
      const fileUrl = URL.createObjectURL(file);
      await addAttachment.mutateAsync({
        appointment_id: appointment.id,
        file_name: file.name,
        file_url: fileUrl,
        file_size: file.size,
        file_type: file.type,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-white">Detalhes do Agendamento</h2>
            <p className="text-zinc-400">
              {appointment.models?.name} - {format(new Date(appointment.appointment_date), 'dd/MM/yyyy', { locale: ptBR })}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
            className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white"
          >
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? 'Cancelar' : 'Editar'}
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações principais */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Informações do Agendamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-400">Modelo</Label>
                <div className="text-white font-medium">{appointment.models?.name}</div>
              </div>
              <div>
                <Label className="text-zinc-400">Cliente</Label>
                <div className="text-white font-medium">{appointment.clients?.name}</div>
                {appointment.clients?.phone && (
                  <div className="text-zinc-400 text-sm">{appointment.clients.phone}</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-400">Data</Label>
                <div className="text-white flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(appointment.appointment_date), 'dd/MM/yyyy', { locale: ptBR })}
                </div>
              </div>
              <div>
                <Label className="text-zinc-400">Horário</Label>
                <div className="text-white flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {appointment.appointment_time} ({appointment.duration}min)
                </div>
              </div>
            </div>

            <div>
              <Label className="text-zinc-400">Serviço</Label>
              <div className="text-white font-medium">{appointment.services?.name}</div>
              <div className="text-green-400 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                R$ {appointment.price?.toFixed(2)}
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-zinc-400">Status</Label>
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value as any })}
                    className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2"
                  >
                    <option value="pending">Pendente</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
                <div>
                  <Label className="text-zinc-400">Status do Pagamento</Label>
                  <select
                    value={editData.payment_status}
                    onChange={(e) => setEditData({ ...editData, payment_status: e.target.value as any })}
                    className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2"
                  >
                    <option value="pending">Pendente</option>
                    <option value="partial">Parcial</option>
                    <option value="paid">Pago</option>
                  </select>
                </div>
                <div>
                  <Label className="text-zinc-400">Local</Label>
                  <Input
                    value={editData.location}
                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-zinc-400">Observações</Label>
                  <Textarea
                    value={editData.observations}
                    onChange={(e) => setEditData({ ...editData, observations: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-zinc-400">Notas Administrativas</Label>
                  <Textarea
                    value={editData.admin_notes}
                    onChange={(e) => setEditData({ ...editData, admin_notes: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <Button onClick={handleSaveEdit} className="w-full bg-blue-600 hover:bg-blue-700">
                  Salvar Alterações
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Badge className={getStatusColor(appointment.status)}>
                    {getStatusText(appointment.status)}
                  </Badge>
                  <Badge className={getPaymentStatusColor(appointment.payment_status)}>
                    {getPaymentStatusText(appointment.payment_status)}
                  </Badge>
                </div>

                {appointment.location && (
                  <div>
                    <Label className="text-zinc-400">Local</Label>
                    <div className="text-white flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {appointment.location}
                    </div>
                  </div>
                )}

                {appointment.observations && (
                  <div>
                    <Label className="text-zinc-400">Observações</Label>
                    <div className="text-white">{appointment.observations}</div>
                  </div>
                )}

                {appointment.admin_notes && (
                  <div>
                    <Label className="text-zinc-400">Notas Administrativas</Label>
                    <div className="text-white">{appointment.admin_notes}</div>
                  </div>
                )}
              </div>
            )}

            {appointment.created_by_admin && (
              <div className="pt-4 border-t border-zinc-700">
                <Badge variant="outline" className="text-purple-400 border-purple-400">
                  Criado pelo Admin
                </Badge>
              </div>
            )}

            {appointment.is_recurring_series && (
              <div className="pt-4 border-t border-zinc-700">
                <Badge variant="outline" className="text-blue-400 border-blue-400">
                  <Repeat className="h-3 w-3 mr-1" />
                  Recorrência: {appointment.recurrence_type}
                </Badge>
                {appointment.recurrence_end_date && (
                  <div className="text-zinc-400 text-sm mt-1">
                    Até: {format(new Date(appointment.recurrence_end_date), 'dd/MM/yyyy', { locale: ptBR })}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comentários e anexos */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Comentários e Anexos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Novo comentário */}
            <div className="space-y-2">
              <Label className="text-zinc-400">Adicionar Comentário</Label>
              <div className="flex gap-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Digite seu comentário..."
                  className="bg-zinc-800 border-zinc-700 text-white flex-1"
                />
                <Button 
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || addComment.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Upload de arquivo */}
            <div className="space-y-2">
              <Label className="text-zinc-400">Anexar Arquivo</Label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="bg-zinc-800 border-zinc-700 text-white flex-1"
                />
                <Button disabled={uploading} className="bg-green-600 hover:bg-green-700">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator className="bg-zinc-700" />

            {/* Lista de comentários */}
            {appointment.comments && appointment.comments.length > 0 && (
              <div className="space-y-3">
                <Label className="text-zinc-400">Comentários</Label>
                {appointment.comments.map((comment) => (
                  <div key={comment.id} className="bg-zinc-800 rounded p-3">
                    <div className="text-white">{comment.comment}</div>
                    <div className="text-zinc-400 text-sm mt-1">
                      {format(new Date(comment.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Lista de anexos */}
            {appointment.attachments && appointment.attachments.length > 0 && (
              <div className="space-y-3">
                <Label className="text-zinc-400">Anexos</Label>
                {appointment.attachments.map((attachment) => (
                  <div key={attachment.id} className="bg-zinc-800 rounded p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4 text-zinc-400" />
                      <div>
                        <div className="text-white">{attachment.file_name}</div>
                        <div className="text-zinc-400 text-sm">
                          {attachment.file_size && `${(attachment.file_size / 1024 / 1024).toFixed(2)} MB`} • 
                          {format(new Date(attachment.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(attachment.file_url, '_blank')}
                      className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white"
                    >
                      Abrir
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {(!appointment.comments || appointment.comments.length === 0) && 
             (!appointment.attachments || appointment.attachments.length === 0) && (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto text-zinc-600 mb-2" />
                <div className="text-zinc-400">Nenhum comentário ou anexo ainda</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};