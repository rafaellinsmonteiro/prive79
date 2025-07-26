import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PixQrCodeData {
  id: string;
  amount: number;
  status: string;
  brCode: string;
  brCodeBase64: string;
  expiresAt: string;
}

interface CreatePixQrCodeParams {
  amount: number;
  description?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerTaxId?: string;
}

export const useAbacatePay = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createPixQrCode = async (params: CreatePixQrCodeParams): Promise<PixQrCodeData | null> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('abacatepay-pix', {
        body: {
          action: 'create',
          amount: params.amount,
          description: params.description || `Depósito PriveBank - R$ ${params.amount.toFixed(2)}`,
          customer: {
            name: params.customerName,
            email: params.customerEmail,
            cellphone: params.customerPhone,
            taxId: params.customerTaxId
          },
          metadata: {
            externalId: `deposit_${Date.now()}`
          }
        }
      });

      if (error) {
        console.error('Erro ao criar PIX QR Code:', error);
        toast({
          title: "Erro",
          description: "Não foi possível gerar o código PIX. Tente novamente.",
          variant: "destructive"
        });
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao criar PIX QR Code:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o código PIX. Tente novamente.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const checkPixStatus = async (pixId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('abacatepay-pix', {
        body: {
          action: 'status',
          pixId
        }
      });

      if (error) {
        console.error('Erro ao verificar status do PIX:', error);
        return null;
      }

      return data?.status || null;
    } catch (error) {
      console.error('Erro ao verificar status do PIX:', error);
      return null;
    }
  };

  return {
    createPixQrCode,
    checkPixStatus,
    isLoading
  };
};