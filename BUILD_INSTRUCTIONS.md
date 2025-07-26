# Instruções de Build e Deploy

## Chat-app Independente

Este projeto agora suporta builds separados para:
- **Aplicação principal**: `prive.click`
- **Chat-app independente**: `chat.prive.click`

## Comandos de Build

### Build da aplicação principal
```bash
npm run build
```
- Gera arquivos na pasta `dist/`
- Deploy em `prive.click`

### Build do chat-app
```bash
npm run build:chat
```
- Gera arquivos na pasta `dist-chat/`
- Deploy em `chat.prive.click`

### Build de ambos
```bash
npm run build:all
```
- Gera builds para ambas as aplicações

## Deploy

### No Lovable
1. **Para a aplicação principal (`prive.click`)**:
   - Execute `npm run build`
   - Lovable deployará automaticamente o conteúdo da pasta `dist/`

2. **Para o chat-app (`chat.prive.click`)**:
   - Execute `npm run build:chat`
   - Configure o subdomínio `chat.prive.click` nas configurações do projeto
   - Lovable deployará automaticamente o conteúdo da pasta `dist-chat/`

### Configuração DNS
O subdomínio `chat.prive.click` já foi conectado ao Lovable e funcionará automaticamente após o build.

## Funcionamento

### Aplicação Principal (prive.click)
- Acesso completo a todas as funcionalidades
- Login integrado com redirecionamento baseado no tipo de usuário
- Chat integrado como parte da aplicação

### Chat-app (chat.prive.click)
- Interface de chat independente e otimizada
- Login exclusivo para o chat
- Funcionalidade completa de chat sem outras distrações
- Logout retorna para a tela de login do próprio chat-app

## Desenvolvimento
Durante o desenvolvimento, use `npm run dev` normalmente. Os builds separados são apenas para produção.