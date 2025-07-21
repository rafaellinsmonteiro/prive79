import { useParams, useNavigate } from 'react-router-dom';
import { useUserType } from '@/hooks/useUserType';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import V2VipModel from '@/components/V2VipModel';
import { V2ClientLayout } from '@/components/V2ClientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  CreditCard,
  PiggyBank,
  TrendingUp,
  AlertCircle,
  Clock,
  Shield
} from 'lucide-react';

const UnifiedBankProductPage = () => {
  const { product } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getUserType } = useUserType();
  const [userType, setUserType] = useState<'admin' | 'modelo' | 'cliente' | null>(null);

  useEffect(() => {
    const checkUserType = async () => {
      if (user) {
        const type = await getUserType();
        setUserType(type);
      }
    };
    checkUserType();
  }, [user, getUserType]);

  const getProductInfo = () => {
    switch (product) {
      case 'privecard':
        return {
          title: 'PriveCard',
          subtitle: 'Cartão de crédito premium exclusivo',
          icon: CreditCard,
          description: 'Tenha acesso ao cartão de crédito mais exclusivo da plataforma, com benefícios únicos e atendimento VIP.',
          features: [
            'Limite pré-aprovado de até P$ 50.000',
            'Programa de pontos exclusivo',
            'Cashback em todas as compras',
            'Atendimento 24/7 especializado',
            'Acesso a salas VIP em aeroportos'
          ]
        };
      case 'emprestimos':
        return {
          title: 'Empréstimos',
          subtitle: 'Crédito rápido e descomplicado',
          icon: PiggyBank,
          description: 'Obtenha crédito rápido e fácil para realizar seus projetos e sonhos com as melhores condições do mercado.',
          features: [
            'Aprovação em até 24 horas',
            'Taxas competitivas do mercado',
            'Sem burocracias desnecessárias',
            'Parcelas flexíveis',
            'Crédito de até P$ 100.000'
          ]
        };
      case 'investimentos':
        return {
          title: 'Investimentos',
          subtitle: 'Faça seu dinheiro render mais',
          icon: TrendingUp,
          description: 'Multiplique seu patrimônio com nossa seleção exclusiva de investimentos premium para clientes VIP.',
          features: [
            'Assessoria especializada',
            'Produtos exclusivos de alta rentabilidade',
            'Diversificação inteligente',
            'Relatórios detalhados mensais',
            'Acesso a fundos exclusivos'
          ]
        };
      default:
        return {
          title: 'Produto não encontrado',
          subtitle: '',
          icon: AlertCircle,
          description: '',
          features: []
        };
    }
  };

  const productInfo = getProductInfo();
  const IconComponent = productInfo.icon;

  const handleGoBack = () => {
    if (userType === 'modelo') {
      navigate('/v2/bank');
    } else if (userType === 'cliente') {
      navigate('/v2/client/privebank');
    } else {
      navigate('/v2/bank');
    }
  };

  if (!userType) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-100">Carregando...</div>
      </div>
    );
  }

  const content = (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleGoBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
            <IconComponent className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{productInfo.title}</h1>
            <p className="text-slate-600">{productInfo.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Status Card - Product not available for this account */}
      <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock className="h-6 w-6 text-amber-700" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-amber-900">Produto Não Disponível</h3>
                <Badge variant="secondary" className="bg-amber-200 text-amber-800 border-amber-300">
                  Em Breve
                </Badge>
              </div>
              <p className="text-amber-700 leading-relaxed">
                Este produto ainda não está disponível para sua conta específica. Nossa equipe está trabalhando para 
                disponibilizá-lo em breve com todas as funcionalidades premium que você merece.
              </p>
              <div className="flex items-center gap-2 mt-4">
                <Shield className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-amber-600 font-medium">
                  Você será notificado assim que estiver disponível
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Information */}
      {productInfo.description && (
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Sobre o {productInfo.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-slate-700 leading-relaxed">
              {productInfo.description}
            </p>

            {productInfo.features.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-4">Principais Benefícios:</h4>
                <div className="grid gap-3">
                  {productInfo.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                      <div className="w-2 h-2 bg-slate-600 rounded-full flex-shrink-0"></div>
                      <span className="text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Button 
          onClick={handleGoBack}
          className="bg-slate-600 hover:bg-slate-700"
        >
          Voltar ao PriveBank
        </Button>
        <Button 
          variant="outline"
          className="border-slate-300 text-slate-600 hover:bg-slate-50"
          disabled
        >
          Notificar quando disponível
        </Button>
      </div>
    </div>
  );

  // Render based on user type
  if (userType === 'modelo') {
    return (
      <V2VipModel 
        title="PriveBank" 
        subtitle="Produtos e Serviços"
        activeId="bank"
      >
        {content}
      </V2VipModel>
    );
  } else if (userType === 'cliente') {
    return (
      <V2ClientLayout title="PriveBank" subtitle="Produtos e Serviços" activeId="privebank">
        {content}
      </V2ClientLayout>
    );
  } else {
    return (
      <V2VipModel 
        title="PriveBank" 
        subtitle="Produtos e Serviços"
        activeId="bank"
      >
        {content}
      </V2VipModel>
    );
  }
};

export default UnifiedBankProductPage;