import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Users, FileText, BarChart3, Settings } from 'lucide-react';
import BankAccountsManager from './BankAccountsManager';
import BankTransactionsManager from './BankTransactionsManager';
import BankLogsManager from './BankLogsManager';
import BankStatsManager from './BankStatsManager';
import BankSettingsManager from './BankSettingsManager';

const BankManager = () => {
  return (
    <div>
      {/* Tabs Navigation */}
      <Tabs defaultValue="accounts" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-zinc-900 border-zinc-800 mb-6">
          <TabsTrigger 
            value="accounts" 
            className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400"
          >
            <Users className="h-4 w-4 mr-2" />
            Contas
          </TabsTrigger>
          <TabsTrigger 
            value="transactions"
            className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Transações
          </TabsTrigger>
          <TabsTrigger 
            value="logs"
            className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400"
          >
            <FileText className="h-4 w-4 mr-2" />
            Logs
          </TabsTrigger>
          <TabsTrigger 
            value="stats"
            className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Estatísticas
          </TabsTrigger>
          <TabsTrigger 
            value="settings"
            className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </TabsTrigger>
        </TabsList>

        {/* Tab Contents */}
        <TabsContent value="accounts" className="mt-0">
          <BankAccountsManager />
        </TabsContent>

        <TabsContent value="transactions" className="mt-0">
          <BankTransactionsManager />
        </TabsContent>

        <TabsContent value="logs" className="mt-0">
          <BankLogsManager />
        </TabsContent>

        <TabsContent value="stats" className="mt-0">
          <BankStatsManager />
        </TabsContent>

        <TabsContent value="settings" className="mt-0">
          <BankSettingsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BankManager;