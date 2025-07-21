
import React from 'react';
import V2VipModel from '@/components/V2VipModel';
import { V2ClientLayout } from '@/components/V2ClientLayout';
import { useUserType } from '@/hooks/useUserType';
import { useAuth } from '@/contexts/AuthContext';

const UnifiedBankPage = () => {
  const { user } = useAuth();
  const { getUserType } = useUserType();
  const [userType, setUserType] = React.useState<'admin' | 'modelo' | 'cliente' | null>(null);

  React.useEffect(() => {
    const checkUserType = async () => {
      if (user) {
        const type = await getUserType();
        setUserType(type);
      }
    };
    checkUserType();
  }, [user, getUserType]);

  const bankContent = (
    <div className="p-6">
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-foreground mb-4">PriveBank</h2>
        <p className="text-muted-foreground">Em desenvolvimento...</p>
      </div>
    </div>
  );

  if (!userType) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-100">Carregando...</div>
      </div>
    );
  }

  if (userType === 'modelo') {
    return (
      <V2VipModel 
        title="PriveBank"
        subtitle="Sua carteira digital premium."
        activeId="bank"
      >
        {bankContent}
      </V2VipModel>
    );
  }

  // Para cliente
  return (
    <V2ClientLayout 
      title="PriveBank" 
      subtitle="Sua carteira digital" 
      activeId="privebank"
    >
      {bankContent}
    </V2ClientLayout>
  );
};

export default UnifiedBankPage;
