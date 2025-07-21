import React from 'react';
import { V2ClientLayout } from '@/components/V2ClientLayout';

export default function ClientV2PriveBankPage() {
  return (
    <V2ClientLayout title="PriveBank" subtitle="Sua carteira digital" activeId="privebank">
      <div className="p-6">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-foreground mb-4">PriveBank</h2>
          <p className="text-muted-foreground">Em desenvolvimento...</p>
        </div>
      </div>
    </V2ClientLayout>
  );
}