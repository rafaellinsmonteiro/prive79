import React from 'react';
import { V2ClientLayout } from '@/components/V2ClientLayout';

export default function ClientV2AccountPage() {
  return (
    <V2ClientLayout title="Minha Conta" subtitle="Configurações da sua conta" activeId="account">
      <div className="p-6">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-foreground mb-4">Minha Conta</h2>
          <p className="text-muted-foreground">Em desenvolvimento...</p>
        </div>
      </div>
    </V2ClientLayout>
  );
}