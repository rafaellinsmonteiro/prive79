import React, { useState } from 'react';
import { LayoutDashboard, Package, MessageSquare, ShoppingCart, Calendar, Activity, BarChart3, MessageCircle, Settings, LogOut, Sun, Moon, ChevronLeft, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
const DesignTestPage = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDark, setIsDark] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const overviewItems = [{
    icon: LayoutDashboard,
    label: 'Dashboard',
    id: 'dashboard'
  }, {
    icon: Package,
    label: 'Products',
    id: 'products',
    active: true
  }, {
    icon: MessageSquare,
    label: 'Messages',
    id: 'messages',
    badge: '2'
  }, {
    icon: ShoppingCart,
    label: 'Order',
    id: 'order'
  }, {
    icon: Calendar,
    label: 'Calendar',
    id: 'calendar'
  }, {
    icon: Activity,
    label: 'Activity',
    id: 'activity'
  }, {
    icon: BarChart3,
    label: 'Static',
    id: 'static'
  }];
  const accountItems = [{
    icon: MessageCircle,
    label: 'Chat',
    id: 'chat'
  }, {
    icon: Settings,
    label: 'Settings',
    id: 'settings'
  }, {
    icon: LogOut,
    label: 'Log out',
    id: 'logout'
  }];
  return <div className={`min-h-screen flex w-full ${isDark ? 'dark' : ''}`}>
      {/* Sidebar */}
      <div className={`${isDark ? 'bg-gray-900' : 'bg-white'} border-r transition-all duration-300 ${isExpanded ? 'w-64' : 'w-16'} flex flex-col`}>
        
        {/* Header with Logo */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-500 rounded flex items-center justify-center">
              <Grid3X3 className="w-4 h-4 text-white" />
            </div>
            {isExpanded && <div>
                <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Softtech
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Technology
                </div>
              </div>}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} p-1`}>
            <ChevronLeft className={`w-4 h-4 transition-transform ${isExpanded ? '' : 'rotate-180'}`} />
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 py-4">
          {/* Overview Section */}
          <div className="mb-6">
            {isExpanded && <div className={`text-xs font-medium mb-3 px-3 ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>MENU</div>}
            <nav className="space-y-1">
              {overviewItems.map(item => <div key={item.id} className="relative" onMouseEnter={() => setHoveredItem(item.id)} onMouseLeave={() => setHoveredItem(null)}>
                  <Button variant="ghost" className={`w-full justify-start px-3 py-2 h-10 ${item.active ? `${isDark ? 'bg-teal-900 text-teal-400' : 'bg-teal-50 text-teal-600'}` : `${isDark ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-gray-700 hover:bg-gray-100'}`}`}>
                    <item.icon className="w-4 h-4 shrink-0" />
                    {isExpanded && <>
                        <span className="ml-3">{item.label}</span>
                        {item.badge && <Badge variant="secondary" className="ml-auto bg-teal-500 text-white text-xs">
                            {item.badge}
                          </Badge>}
                      </>}
                  </Button>
                  
                  {/* Tooltip for collapsed state */}
                  {!isExpanded && hoveredItem === item.id && <div className="absolute left-16 top-2 z-50 px-2 py-1 text-sm bg-gray-800 text-white rounded shadow-lg">
                      {item.label}
                    </div>}
                </div>)}
            </nav>
          </div>

          {/* Account Section */}
          <div>
            {isExpanded && <div className={`text-xs font-medium mb-3 px-3 ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>CONTA</div>}
            <nav className="space-y-1">
              {accountItems.map(item => <div key={item.id} className="relative" onMouseEnter={() => setHoveredItem(item.id)} onMouseLeave={() => setHoveredItem(null)}>
                  <Button variant="ghost" className={`w-full justify-start px-3 py-2 h-10 ${isDark ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
                    <item.icon className="w-4 h-4 shrink-0" />
                    {isExpanded && <span className="ml-3">{item.label}</span>}
                  </Button>
                  
                  {/* Tooltip for collapsed state */}
                  {!isExpanded && hoveredItem === item.id && <div className="absolute left-16 top-2 z-50 px-2 py-1 text-sm bg-gray-800 text-white rounded shadow-lg">
                      {item.label}
                    </div>}
                </div>)}
            </nav>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="p-3 border-t">
          <div className="flex items-center justify-center gap-2">
            <Sun className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-yellow-500'}`} />
            <Switch checked={isDark} onCheckedChange={setIsDark} className="data-[state=checked]:bg-gray-600" />
            <Moon className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-gray-400'}`} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 ${isDark ? 'bg-gray-50' : 'bg-gray-50'}`}>
        {/* Top Header */}
        <header className={`${isDark ? 'bg-white' : 'bg-white'} border-b px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sidebar navigation</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                Study Case
              </Button>
              
              {/* User Profile */}
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="/lovable-uploads/182f2a41-9665-421f-ad03-aee8b5a34ad0.png" />
                  <AvatarFallback>JW</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">John Wilson</div>
                  <div className="text-gray-500">Wilson@gmail.com</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6">
          <div className="text-center py-20">
            <h2 className="text-xl text-gray-600 mb-4">
              Área de teste para o novo design
            </h2>
            <p className="text-gray-500">
              Esta página foi criada para testar o novo header e sidebar sem afetar o código existente.
            </p>
          </div>
        </main>
      </div>
    </div>;
};
export default DesignTestPage;