import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCreateLunnaConversation } from '@/hooks/useCreateLunnaConversation';
import { toast } from '@/hooks/use-toast';

const LunnaTestComponent = () => {
  const createLunnaConversation = useCreateLunnaConversation();

  const handleTestLunna = async () => {
    try {
      const conversation = await createLunnaConversation.mutateAsync();
      toast({
        title: "Sucesso!",
        description: `Conversa com Lunna criada: ${conversation.id}`,
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">🌙 Teste da Lunna IA</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-muted-foreground">
          Teste a integração da Lunna IA no chat
        </p>
        <Button 
          onClick={handleTestLunna}
          disabled={createLunnaConversation.isPending}
          className="w-full"
        >
          {createLunnaConversation.isPending ? 'Criando...' : 'Criar Conversa com Lunna'}
        </Button>
        
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Como testar:</strong></p>
          <p>1. Clique no botão acima</p>
          <p>2. Vá para a página de chat</p>
          <p>3. Encontre a conversa "Lunna IA 🌙"</p>
          <p>4. Envie uma mensagem</p>
          <p>5. A Lunna deve responder automaticamente</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LunnaTestComponent;