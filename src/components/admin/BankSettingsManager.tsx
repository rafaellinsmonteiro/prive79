import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, DollarSign, Shield, Bell, Clock } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const BankSettingsManager = () => {
  const [settings, setSettings] = useState({
    // Configurações Gerais
    systemEnabled: true,
    maintenanceMode: false,
    defaultCurrency: 'PCoins',
    
    // Limites e Taxas
    minTransferAmount: '1.00',
    maxTransferAmount: '10000.00',
    dailyTransferLimit: '50000.00',
    transferFee: '0.00',
    
    // Segurança
    requireTwoFactor: false,
    passwordExpiryDays: '90',
    maxLoginAttempts: '5',
    lockoutDuration: '30',
    
    // Notificações
    emailNotifications: true,
    smsNotifications: false,
    webhookUrl: '',
    
    // Backup e Logs
    autoBackup: true,
    backupFrequency: 'daily',
    logRetentionDays: '90',
    
    // Interface
    themeDark: true,
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // Aqui implementaria a lógica para salvar as configurações
    console.log('Salvando configurações:', settings);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Configurações do PriveBank</h3>
              <p className="text-sm text-zinc-400">Gerencie as configurações do sistema bancário</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações Gerais */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Configurações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="system-enabled" className="text-zinc-300">
                Sistema Habilitado
              </Label>
              <Switch
                id="system-enabled"
                checked={settings.systemEnabled}
                onCheckedChange={(value) => handleSettingChange('systemEnabled', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="maintenance-mode" className="text-zinc-300">
                Modo Manutenção
              </Label>
              <Switch
                id="maintenance-mode"
                checked={settings.maintenanceMode}
                onCheckedChange={(value) => handleSettingChange('maintenanceMode', value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-currency" className="text-zinc-300">
                Moeda Padrão
              </Label>
              <Select 
                value={settings.defaultCurrency} 
                onValueChange={(value) => handleSettingChange('defaultCurrency', value)}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="PCoins">PCoins (P$)</SelectItem>
                  <SelectItem value="BRL">Real Brasileiro (R$)</SelectItem>
                  <SelectItem value="USD">Dólar Americano ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Limites e Taxas */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Limites e Taxas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="min-transfer" className="text-zinc-300">
                Valor Mínimo Transferência
              </Label>
              <Input
                id="min-transfer"
                type="number"
                step="0.01"
                value={settings.minTransferAmount}
                onChange={(e) => handleSettingChange('minTransferAmount', e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-transfer" className="text-zinc-300">
                Valor Máximo Transferência
              </Label>
              <Input
                id="max-transfer"
                type="number"
                step="0.01"
                value={settings.maxTransferAmount}
                onChange={(e) => handleSettingChange('maxTransferAmount', e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="daily-limit" className="text-zinc-300">
                Limite Diário
              </Label>
              <Input
                id="daily-limit"
                type="number"
                step="0.01"
                value={settings.dailyTransferLimit}
                onChange={(e) => handleSettingChange('dailyTransferLimit', e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transfer-fee" className="text-zinc-300">
                Taxa de Transferência (%)
              </Label>
              <Input
                id="transfer-fee"
                type="number"
                step="0.01"
                value={settings.transferFee}
                onChange={(e) => handleSettingChange('transferFee', e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Segurança */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="two-factor" className="text-zinc-300">
                Autenticação de Dois Fatores
              </Label>
              <Switch
                id="two-factor"
                checked={settings.requireTwoFactor}
                onCheckedChange={(value) => handleSettingChange('requireTwoFactor', value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password-expiry" className="text-zinc-300">
                Expiração de Senha (dias)
              </Label>
              <Input
                id="password-expiry"
                type="number"
                value={settings.passwordExpiryDays}
                onChange={(e) => handleSettingChange('passwordExpiryDays', e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-attempts" className="text-zinc-300">
                Máximo de Tentativas de Login
              </Label>
              <Input
                id="max-attempts"
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => handleSettingChange('maxLoginAttempts', e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lockout-duration" className="text-zinc-300">
                Duração do Bloqueio (minutos)
              </Label>
              <Input
                id="lockout-duration"
                type="number"
                value={settings.lockoutDuration}
                onChange={(e) => handleSettingChange('lockoutDuration', e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Notificações */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications" className="text-zinc-300">
                Notificações por Email
              </Label>
              <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={(value) => handleSettingChange('emailNotifications', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="sms-notifications" className="text-zinc-300">
                Notificações por SMS
              </Label>
              <Switch
                id="sms-notifications"
                checked={settings.smsNotifications}
                onCheckedChange={(value) => handleSettingChange('smsNotifications', value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhook-url" className="text-zinc-300">
                URL do Webhook
              </Label>
              <Input
                id="webhook-url"
                type="url"
                placeholder="https://exemplo.com/webhook"
                value={settings.webhookUrl}
                onChange={(e) => handleSettingChange('webhookUrl', e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Backup e Logs */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Backup e Logs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-backup" className="text-zinc-300">
                Backup Automático
              </Label>
              <Switch
                id="auto-backup"
                checked={settings.autoBackup}
                onCheckedChange={(value) => handleSettingChange('autoBackup', value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="backup-frequency" className="text-zinc-300">
                Frequência do Backup
              </Label>
              <Select 
                value={settings.backupFrequency} 
                onValueChange={(value) => handleSettingChange('backupFrequency', value)}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="hourly">A cada hora</SelectItem>
                  <SelectItem value="daily">Diariamente</SelectItem>
                  <SelectItem value="weekly">Semanalmente</SelectItem>
                  <SelectItem value="monthly">Mensalmente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="log-retention" className="text-zinc-300">
                Retenção de Logs (dias)
              </Label>
              <Input
                id="log-retention"
                type="number"
                value={settings.logRetentionDays}
                onChange={(e) => handleSettingChange('logRetentionDays', e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Interface */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Interface
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-dark" className="text-zinc-300">
                Tema Escuro
              </Label>
              <Switch
                id="theme-dark"
                checked={settings.themeDark}
                onCheckedChange={(value) => handleSettingChange('themeDark', value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language" className="text-zinc-300">
                Idioma
              </Label>
              <Select 
                value={settings.language} 
                onValueChange={(value) => handleSettingChange('language', value)}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="es-ES">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-zinc-300">
                Fuso Horário
              </Label>
              <Select 
                value={settings.timezone} 
                onValueChange={(value) => handleSettingChange('timezone', value)}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                  <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                  <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
};

export default BankSettingsManager;