import React from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useUserBalance } from '@/hooks/useUserBalance';
import EnhancedModelProfileManager from '@/components/model/EnhancedModelProfileManager';
import V2VipModel from '@/components/V2VipModel';

const ModelV2ProfilePage = () => {
  const { user } = useAuth();
  const { data: currentUser } = useCurrentUser();
  const { data: balanceData } = useUserBalance();
  const { toast } = useToast();

  return (
    <V2VipModel 
      title="Perfil"
      subtitle="Gerencie suas informações pessoais e configurações."
      activeId="profile"
    >
      <EnhancedModelProfileManager profile={currentUser} />
    </V2VipModel>
  );
};

export default ModelV2ProfilePage;