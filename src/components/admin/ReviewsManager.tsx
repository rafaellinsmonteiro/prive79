import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Star, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Shield,
  TrendingUp,
  Edit,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

interface Review {
  id: string;
  reviewer_id: string;
  reviewed_id: string;
  reviewer_type: 'model' | 'client';
  overall_rating: number;
  description: string;
  positive_points?: string;
  improvement_points?: string;
  negative_points?: string;
  status: 'draft' | 'pending_publication' | 'published';
  is_approved?: boolean;
  published_at?: string;
  created_at: string;
  appointment_id: string;
}

const ReviewsManager = () => {
  const [selectedTab, setSelectedTab] = useState('pending');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedReview, setEditedReview] = useState<Partial<Review>>({});
  const queryClient = useQueryClient();

  // Fetch reviews
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['admin-reviews', selectedTab],
    queryFn: async () => {
      let query = supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedTab === 'pending') {
        query = query.eq('status', 'pending_publication');
      } else if (selectedTab === 'published') {
        query = query.eq('status', 'published');
      } else if (selectedTab === 'draft') {
        query = query.eq('status', 'draft');
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Review[];
    },
  });

  // Approve review
  const approveReview = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('reviews')
        .update({ 
          status: 'published',
          is_approved: true,
          published_at: new Date().toISOString()
        })
        .eq('id', reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success('Avaliação aprovada e publicada!');
    },
    onError: (error) => {
      console.error('Error approving review:', error);
      toast.error('Erro ao aprovar avaliação');
    },
  });

  // Reject review
  const rejectReview = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('reviews')
        .update({ 
          status: 'draft',
          is_approved: false
        })
        .eq('id', reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success('Avaliação rejeitada e retornada para rascunho');
    },
    onError: (error) => {
      console.error('Error rejecting review:', error);
      toast.error('Erro ao rejeitar avaliação');
    },
  });

  // Update review
  const updateReview = useMutation({
    mutationFn: async (updates: Partial<Review> & { id: string }) => {
      const { error } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', updates.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success('Avaliação atualizada com sucesso!');
      setIsEditing(false);
      setSelectedReview(null);
    },
    onError: (error) => {
      console.error('Error updating review:', error);
      toast.error('Erro ao atualizar avaliação');
    },
  });

  const handleEditSave = () => {
    if (selectedReview && editedReview) {
      updateReview.mutate({
        id: selectedReview.id,
        ...editedReview
      });
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditedReview({});
  };

  const openReviewModal = (review: Review) => {
    setSelectedReview(review);
    setEditedReview({
      description: review.description,
      positive_points: review.positive_points,
      improvement_points: review.improvement_points,
      negative_points: review.negative_points,
      overall_rating: review.overall_rating
    });
    setIsEditing(false);
  };

  // Stats query
  const { data: stats } = useQuery({
    queryKey: ['admin-reviews-stats'],
    queryFn: async () => {
      const { data: pending } = await supabase
        .from('reviews')
        .select('id')
        .eq('status', 'pending_publication');

      const { data: published } = await supabase
        .from('reviews')
        .select('id')
        .eq('status', 'published');

      const { data: draft } = await supabase
        .from('reviews')
        .select('id')
        .eq('status', 'draft');

      return {
        pending: pending?.length || 0,
        published: published?.length || 0,
        draft: draft?.length || 0
      };
    },
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_publication':
        return <Badge variant="outline" className="text-orange-600"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case 'published':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Publicada</Badge>;
      case 'draft':
        return <Badge variant="outline" className="text-gray-600"><Eye className="h-3 w-3 mr-1" />Rascunho</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="text-white">Carregando avaliações...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Gestão de Avaliações</h2>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="flex items-center p-6">
              <div className="rounded-full p-2 bg-orange-100 dark:bg-orange-900/20 mr-4">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-white">{stats.pending}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="flex items-center p-6">
              <div className="rounded-full p-2 bg-green-100 dark:bg-green-900/20 mr-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Publicadas</p>
                <p className="text-2xl font-bold text-white">{stats.published}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="flex items-center p-6">
              <div className="rounded-full p-2 bg-gray-100 dark:bg-gray-900/20 mr-4">
                <Eye className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rascunhos</p>
                <p className="text-2xl font-bold text-white">{stats.draft}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reviews Table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Avaliações</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">Pendentes</TabsTrigger>
              <TabsTrigger value="published">Publicadas</TabsTrigger>
              <TabsTrigger value="draft">Rascunhos</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="mt-6">
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-zinc-400">
                  Nenhuma avaliação encontrada
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-zinc-300">Avaliador</TableHead>
                      <TableHead className="text-zinc-300">Tipo</TableHead>
                      <TableHead className="text-zinc-300">Nota</TableHead>
                      <TableHead className="text-zinc-300">Status</TableHead>
                      <TableHead className="text-zinc-300">Data</TableHead>
                      <TableHead className="text-zinc-300">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell className="text-white">
                          {review.reviewer_id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {review.reviewer_type === 'model' ? 'Modelo' : 'Cliente'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {renderStars(review.overall_rating)}
                            <span className="ml-2 text-white">{review.overall_rating}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(review.status)}</TableCell>
                        <TableCell className="text-zinc-400">
                          {new Date(review.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => openReviewModal(review)}
                                  className="text-blue-600"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Visualizar
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-zinc-900 border-zinc-800 max-w-3xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="text-white flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Detalhes da Avaliação
                                    {selectedReview && (
                                      <Badge variant="outline" className="ml-2">
                                        {selectedReview.reviewer_type === 'model' ? 'Modelo' : 'Cliente'}
                                      </Badge>
                                    )}
                                  </DialogTitle>
                                </DialogHeader>
                                
                                {selectedReview && (
                                  <div className="space-y-6">
                                    {/* Nota Geral */}
                                    <div className="space-y-2">
                                      <Label className="text-zinc-300">Nota Geral</Label>
                                      <div className="flex items-center gap-3">
                                        {renderStars(isEditing ? (editedReview.overall_rating || selectedReview.overall_rating) : selectedReview.overall_rating)}
                                        <span className="text-white font-medium">
                                          {isEditing ? (editedReview.overall_rating || selectedReview.overall_rating) : selectedReview.overall_rating} estrelas
                                        </span>
                                        {isEditing && (
                                          <select
                                            value={editedReview.overall_rating || selectedReview.overall_rating}
                                            onChange={(e) => setEditedReview(prev => ({ ...prev, overall_rating: parseInt(e.target.value) }))}
                                            className="ml-4 bg-zinc-800 border-zinc-700 text-white rounded px-2 py-1"
                                          >
                                            {[1, 2, 3, 4, 5].map(rating => (
                                              <option key={rating} value={rating}>{rating} estrela{rating > 1 ? 's' : ''}</option>
                                            ))}
                                          </select>
                                        )}
                                      </div>
                                    </div>

                                    {/* Descrição */}
                                    <div className="space-y-2">
                                      <Label className="text-zinc-300">Descrição da Experiência</Label>
                                      {isEditing ? (
                                        <Textarea
                                          value={editedReview.description || selectedReview.description}
                                          onChange={(e) => setEditedReview(prev => ({ ...prev, description: e.target.value }))}
                                          className="bg-zinc-800 border-zinc-700 text-white min-h-[100px]"
                                          placeholder="Descrição da experiência..."
                                        />
                                      ) : (
                                        <div className="bg-zinc-800 p-4 rounded-lg text-zinc-300">
                                          {selectedReview.description}
                                        </div>
                                      )}
                                    </div>

                                    {/* Pontos Positivos */}
                                    <div className="space-y-2">
                                      <Label className="text-zinc-300">Pontos Positivos</Label>
                                      {isEditing ? (
                                        <Textarea
                                          value={editedReview.positive_points || selectedReview.positive_points || ''}
                                          onChange={(e) => setEditedReview(prev => ({ ...prev, positive_points: e.target.value }))}
                                          className="bg-zinc-800 border-zinc-700 text-white"
                                          placeholder="Pontos positivos..."
                                        />
                                      ) : (
                                        <div className="bg-zinc-800 p-4 rounded-lg text-zinc-300">
                                          {selectedReview.positive_points || 'Não informado'}
                                        </div>
                                      )}
                                    </div>

                                    {/* Pontos de Melhoria */}
                                    <div className="space-y-2">
                                      <Label className="text-zinc-300">Pontos que Podem Melhorar</Label>
                                      {isEditing ? (
                                        <Textarea
                                          value={editedReview.improvement_points || selectedReview.improvement_points || ''}
                                          onChange={(e) => setEditedReview(prev => ({ ...prev, improvement_points: e.target.value }))}
                                          className="bg-zinc-800 border-zinc-700 text-white"
                                          placeholder="Pontos de melhoria..."
                                        />
                                      ) : (
                                        <div className="bg-zinc-800 p-4 rounded-lg text-zinc-300">
                                          {selectedReview.improvement_points || 'Não informado'}
                                        </div>
                                      )}
                                    </div>

                                    {/* Pontos Negativos */}
                                    <div className="space-y-2">
                                      <Label className="text-zinc-300">Pontos Negativos</Label>
                                      {isEditing ? (
                                        <Textarea
                                          value={editedReview.negative_points || selectedReview.negative_points || ''}
                                          onChange={(e) => setEditedReview(prev => ({ ...prev, negative_points: e.target.value }))}
                                          className="bg-zinc-800 border-zinc-700 text-white"
                                          placeholder="Pontos negativos..."
                                        />
                                      ) : (
                                        <div className="bg-zinc-800 p-4 rounded-lg text-zinc-300">
                                          {selectedReview.negative_points || 'Não informado'}
                                        </div>
                                      )}
                                    </div>

                                    {/* Status e Metadata */}
                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-700">
                                      <div>
                                        <Label className="text-zinc-300">Status</Label>
                                        <div className="mt-1">
                                          {getStatusBadge(selectedReview.status)}
                                        </div>
                                      </div>
                                      <div>
                                        <Label className="text-zinc-300">Data de Criação</Label>
                                        <div className="text-zinc-400 mt-1">
                                          {new Date(selectedReview.created_at).toLocaleString('pt-BR')}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Ações */}
                                    <div className="flex justify-between items-center pt-4 border-t border-zinc-700">
                                      <div className="flex gap-2">
                                        {!isEditing ? (
                                          <Button
                                            onClick={() => setIsEditing(true)}
                                            variant="outline"
                                            className="text-blue-600"
                                          >
                                            <Edit className="h-4 w-4 mr-1" />
                                            Editar
                                          </Button>
                                        ) : (
                                          <>
                                            <Button
                                              onClick={handleEditSave}
                                              className="bg-green-600 hover:bg-green-700"
                                              disabled={updateReview.isPending}
                                            >
                                              Salvar Alterações
                                            </Button>
                                            <Button
                                              onClick={handleEditCancel}
                                              variant="outline"
                                            >
                                              Cancelar
                                            </Button>
                                          </>
                                        )}
                                      </div>

                                      {selectedReview.status === 'pending_publication' && (
                                        <div className="flex gap-2">
                                          <Button
                                            onClick={() => {
                                              approveReview.mutate(selectedReview.id);
                                              setSelectedReview(null);
                                            }}
                                            className="bg-green-600 hover:bg-green-700"
                                            disabled={approveReview.isPending}
                                          >
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Aprovar
                                          </Button>
                                          <Button
                                            onClick={() => {
                                              rejectReview.mutate(selectedReview.id);
                                              setSelectedReview(null);
                                            }}
                                            variant="outline"
                                            className="text-red-600"
                                            disabled={rejectReview.isPending}
                                          >
                                            <XCircle className="h-4 w-4 mr-1" />
                                            Rejeitar
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            {review.status === 'pending_publication' && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-green-600"
                                  onClick={() => approveReview.mutate(review.id)}
                                  disabled={approveReview.isPending}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Aprovar
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-red-600"
                                  onClick={() => rejectReview.mutate(review.id)}
                                  disabled={rejectReview.isPending}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Rejeitar
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewsManager;