
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Video, Tags } from 'lucide-react';
import ReelsSettings from './ReelsSettings';
import ReelsMediaManager from './ReelsMediaManager';
import ReelsCategoriesManager from './ReelsCategoriesManager';

const ReelsManager = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Video className="h-6 w-6" />
        <h2 className="text-xl font-semibold text-white">Gerenciar Reels</h2>
      </div>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </TabsTrigger>
          <TabsTrigger value="media">
            <Video className="h-4 w-4 mr-2" />
            Gestão de Mídia
          </TabsTrigger>
          <TabsTrigger value="categories">
            <Tags className="h-4 w-4 mr-2" />
            Categorias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="mt-6">
          <ReelsSettings />
        </TabsContent>

        <TabsContent value="media" className="mt-6">
          <ReelsMediaManager />
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <ReelsCategoriesManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReelsManager;
