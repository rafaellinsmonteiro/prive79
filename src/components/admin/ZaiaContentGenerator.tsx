
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Wand2, Copy, Loader2 } from 'lucide-react';
import { useZaiaContentGeneration } from '@/hooks/useZaiaAI';
import { useToast } from '@/hooks/use-toast';

const ZaiaContentGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState('description');
  const [generatedContent, setGeneratedContent] = useState('');
  const { toast } = useToast();
  const generateContent = useZaiaContentGeneration();

  const contentTypes = [
    { value: 'description', label: 'Descrição de Modelo' },
    { value: 'bio', label: 'Biografia' },
    { value: 'post', label: 'Post para Redes Sociais' },
    { value: 'title', label: 'Título/Chamada' },
    { value: 'keywords', label: 'Palavras-chave' },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um prompt para gerar conteúdo.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await generateContent.mutateAsync({
        prompt: prompt,
        type: contentType
      });

      setGeneratedContent(response.response);
    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({
      title: "Copiado!",
      description: "Conteúdo copiado para a área de transferência.",
    });
  };

  const getExamplePrompt = (type: string) => {
    const examples = {
      description: 'Crie uma descrição atrativa para uma modelo de 25 anos, ruiva, de São Paulo, que gosta de fitness e fotografia.',
      bio: 'Escreva uma biografia para uma modelo brasileira especializada em moda fitness.',
      post: 'Crie um post para Instagram sobre uma sessão de fotos em estúdio.',
      title: 'Crie um título chamativo para um ensaio fotográfico sensual.',
      keywords: 'Gere palavras-chave para SEO de um perfil de modelo brasileira.'
    };
    return examples[type as keyof typeof examples] || '';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Gerador de Conteúdo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white">Tipo de Conteúdo</Label>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                {contentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Prompt</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={getExamplePrompt(contentType)}
              className="bg-zinc-800 border-zinc-700 text-white min-h-[120px]"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generateContent.isPending || !prompt.trim()}
            className="w-full"
          >
            {generateContent.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Gerar Conteúdo
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Conteúdo Gerado</CardTitle>
            {generatedContent && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {generatedContent ? (
            <div className="bg-zinc-800 p-4 rounded-lg">
              <p className="text-white whitespace-pre-wrap">{generatedContent}</p>
            </div>
          ) : (
            <div className="text-center text-zinc-400 py-8">
              <Wand2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>O conteúdo gerado aparecerá aqui.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ZaiaContentGenerator;
