import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  const isMainBuild = process.env.BUILD_TARGET === 'main';
  const isChatBuild = process.env.BUILD_TARGET === 'chat';
  
  let buildConfig = {};
  
  if (command === 'build') {
    if (isChatBuild) {
      // Build apenas para o chat-app
      buildConfig = {
        outDir: 'dist-chat',
        rollupOptions: {
          input: path.resolve(__dirname, 'index-chat.html')
        }
      };
    } else {
      // Build padrão (main app)
      buildConfig = {
        outDir: 'dist',
        rollupOptions: {
          input: path.resolve(__dirname, 'index.html')
        }
      };
    }
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: buildConfig,
  };
});
