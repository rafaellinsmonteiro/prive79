import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PriveTrustStatus {
  id: string;
  user_id: string;
  reviews_received_count: number;
  reviews_sent_count: number;
  reviews_sent_approved: number;
  average_rating?: number;
  identity_verified: boolean;
  has_prive_trust: boolean;
  achieved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserPXP {
  id: string;
  user_id: string;
  current_points: number;
  total_earned: number;
  current_level: number;
  created_at: string;
  updated_at: string;
}

export interface PXPTransaction {
  id: string;
  user_id: string;
  points: number;
  transaction_type: 'review_received' | 'review_penalty' | 'level_bonus';
  description?: string;
  review_id?: string;
  created_at: string;
}

export const usePriveTrust = () => {
  const { data: priveTrustStatus, isLoading: loadingStatus } = useQuery({
    queryKey: ['prive-trust-status'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar ou criar status do Prive Trust
      let { data: status, error } = await supabase
        .from('prive_trust_status')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (!status) {
        const { data: newStatus, error: insertError } = await supabase
          .from('prive_trust_status')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (insertError) throw insertError;
        status = newStatus;
      }

      return status as PriveTrustStatus;
    },
  });

  const { data: userPXP, isLoading: loadingPXP } = useQuery({
    queryKey: ['user-pxp'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar ou criar PXP do usuário
      let { data: pxp, error } = await supabase
        .from('user_pxp')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (!pxp) {
        const { data: newPXP, error: insertError } = await supabase
          .from('user_pxp')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (insertError) throw insertError;
        pxp = newPXP;
      }

      return pxp as UserPXP;
    },
  });

  const { data: pxpTransactions = [], isLoading: loadingTransactions } = useQuery({
    queryKey: ['pxp-transactions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('pxp_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as PXPTransaction[];
    },
  });

  const getPriveTrustProgress = () => {
    if (!priveTrustStatus) return null;

    const reviewsNeeded = Math.max(0, 5 - priveTrustStatus.reviews_received_count);
    const reviewsSentNeeded = Math.max(0, 5 - priveTrustStatus.reviews_sent_approved);
    const averageOk = (priveTrustStatus.average_rating || 0) >= 4.5;
    
    return {
      reviewsReceived: priveTrustStatus.reviews_received_count,
      reviewsReceivedNeeded: reviewsNeeded,
      reviewsSent: priveTrustStatus.reviews_sent_approved,
      reviewsSentNeeded: reviewsSentNeeded,
      averageRating: priveTrustStatus.average_rating || 0,
      averageOk,
      identityVerified: priveTrustStatus.identity_verified,
      canAchieve: reviewsNeeded === 0 && reviewsSentNeeded === 0 && averageOk && priveTrustStatus.identity_verified,
      hasPriveTrust: priveTrustStatus.has_prive_trust,
      achievedAt: priveTrustStatus.achieved_at
    };
  };

  const getLevelInfo = () => {
    if (!userPXP) return null;

    const currentLevel = userPXP.current_level;
    let nextLevelPoints = 0;
    let currentLevelPoints = 0;

    if (currentLevel < 5) {
      const levels = [0, 100, 300, 600, 1000, 1500];
      currentLevelPoints = levels[currentLevel - 1] || 0;
      nextLevelPoints = levels[currentLevel] || 1500;
    } else {
      currentLevelPoints = 1500 + ((currentLevel - 5) * 500);
      nextLevelPoints = 1500 + ((currentLevel - 4) * 500);
    }

    const pointsToNext = Math.max(0, nextLevelPoints - userPXP.current_points);
    const progressPercent = Math.min(100, 
      ((userPXP.current_points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100
    );

    return {
      currentLevel,
      currentPoints: userPXP.current_points,
      totalEarned: userPXP.total_earned,
      pointsToNext,
      nextLevelPoints,
      progressPercent: Math.max(0, progressPercent)
    };
  };

  return {
    priveTrustStatus,
    loadingStatus,
    userPXP,
    loadingPXP,
    pxpTransactions,
    loadingTransactions,
    getPriveTrustProgress,
    getLevelInfo,
  };
};