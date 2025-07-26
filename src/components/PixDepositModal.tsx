import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, QrCode, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface PixDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  pixData?: {
    id: string;
    brCode: string;
    brCodeBase64: string;
    expiresAt: string;
    status: string;
  } | null;
}

const PixDepositModal = ({ isOpen, onClose, amount, pixData }: PixDepositModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);

  const copyPixCode = () => {
    if (pixData?.brCode) {
      navigator.clipboard.writeText(pixData.brCode);
      toast({
        title: "Código PIX copiado!",
        description: "Cole o código em seu app bancário para realizar o pagamento."
      });
    }
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return "Expirado";
    
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const checkPaymentStatus = async () => {
    if (!pixData?.id) return;

    setIsCheckingPayment(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('abacatepay-pix', {
        body: {
          action: 'status',
          pixId: pixData.id
        }
      });

      if (error) throw error;

      if (data?.status === 'PAID') {
        toast({
          title: "Pagamento confirmado!",
          description: "Seu depósito foi processado com sucesso."
        });
        
        // Invalidar queries para atualizar dados automaticamente
        queryClient.invalidateQueries({ queryKey: ['user-pix-deposits'] });
        queryClient.invalidateQueries({ queryKey: ['user-privabank-account'] });
        queryClient.invalidateQueries({ queryKey: ['privabank-transactions'] });
        queryClient.invalidateQueries({ queryKey: ['user-balance'] });
        
        // Fechar modal
        onClose();
      } else {
        toast({
          title: "Pagamento ainda não identificado",
          description: "Aguarde alguns instantes e tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      toast({
        title: "Erro ao verificar pagamento",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    } finally {
      setIsCheckingPayment(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-center text-foreground">
            Depósito PIX - R$ {amount.toFixed(2)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {pixData ? (
            <>
              {/* Status Badge */}
              <div className="flex justify-center">
                <Badge variant={pixData.status === 'PENDING' ? 'secondary' : 'default'} className="text-sm">
                  {pixData.status === 'PENDING' ? (
                    <><Clock className="h-3 w-3 mr-1" /> Aguardando Pagamento</>
                  ) : (
                    <><CheckCircle className="h-3 w-3 mr-1" /> Pago</>
                  )}
                </Badge>
              </div>

              {/* QR Code */}
              <Card className="bg-white">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <img 
                      src={pixData.brCodeBase64} 
                      alt="QR Code PIX" 
                      className="w-48 h-48 border rounded-lg"
                    />
                  </div>
                  <p className="text-sm text-zinc-600 mb-2">
                    Escaneie o QR Code com seu app bancário
                  </p>
                  <p className="text-xs text-zinc-500">
                    Tempo restante: {formatTimeRemaining(pixData.expiresAt)}
                  </p>
                </CardContent>
              </Card>

              {/* PIX Copy & Paste */}
              <Card className="bg-muted/20 border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">PIX Copia e Cola</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={copyPixCode}
                      className="h-8"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copiar
                    </Button>
                  </div>
                  <div className="bg-background border border-border rounded p-3">
                    <p className="text-xs text-muted-foreground font-mono break-all">
                      {pixData.brCode}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Instructions */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h4 className="font-medium text-blue-600 mb-2 flex items-center">
                  <QrCode className="h-4 w-4 mr-2" />
                  Como pagar
                </h4>
                <ol className="text-sm text-blue-600/80 space-y-1">
                  <li>1. Abra seu app bancário</li>
                  <li>2. Escaneie o QR Code ou use o código PIX</li>
                  <li>3. Confirme o pagamento</li>
                  <li>4. O valor será creditado automaticamente</li>
                </ol>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Gerando código PIX...</p>
            </div>
          )}

          {/* Check Payment Button */}
          {pixData && pixData.status === 'PENDING' && (
            <Button 
              onClick={checkPaymentStatus}
              disabled={isCheckingPayment}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {isCheckingPayment ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  JÁ EFETUEI O PAGAMENTO
                </>
              )}
            </Button>
          )}

          {/* Close Button */}
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="w-full"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PixDepositModal;