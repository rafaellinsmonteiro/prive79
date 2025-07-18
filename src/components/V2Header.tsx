import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search, Bell, PlusCircle, Menu, ChevronDown, UserCircle, LogOut, Calendar, Users, Briefcase, Camera } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useProfilePhoto } from "@/hooks/useProfilePhoto";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from '@/hooks/use-mobile';
import { ModelAppointmentForm } from "@/components/model/ModelAppointmentForm";
import { ClientForm } from "@/components/admin/ClientForm";
import OrganizedMediaManager from "@/components/model/OrganizedMediaManager";
import { ServiceForm } from "@/components/admin/ServiceForm";
interface V2HeaderProps {
  title: string;
  subtitle?: string;
  onMobileMenuToggle?: () => void;
}
const V2Header = ({
  title,
  subtitle,
  onMobileMenuToggle
}: V2HeaderProps) => {
  const {
    signOut
  } = useAuth();
  const {
    data: currentUser
  } = useCurrentUser();
  const {
    currentPhotoUrl
  } = useProfilePhoto();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Modal states
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };
  const getUserInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };
  return <>
      <header className="bg-card border-b border-border px-4 lg:px-8 py-4 lg:py-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            {isMobile && onMobileMenuToggle && <Button variant="ghost" size="sm" onClick={onMobileMenuToggle} className="p-2 hover:bg-accent">
                <Menu className="w-5 h-5 text-muted-foreground" />
              </Button>}
            
            <div>
              <h1 className="text-xl lg:text-3xl font-bold text-primary mb-1">
                {title}
              </h1>
              {subtitle && <p className="text-sm lg:text-base text-muted-foreground hidden sm:block">
                  {subtitle}
                </p>}
            </div>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Search - Hidden on small mobile */}
            {!isMobile && <div className="relative hidden md:block">
                
                
              </div>}
            
            <Button variant="ghost" size="sm" className="relative p-2 hover:bg-accent">
              <Bell className="w-4 h-4 lg:w-5 lg:h-5 text-muted-foreground" />
              <div className="absolute -top-1 -right-1 w-2 h-2 lg:w-3 lg:h-3 bg-primary rounded-full"></div>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-[0_4px_20px_hsl(var(--primary))_/_0.3] text-sm lg:text-base px-3 lg:px-4">
                  <PlusCircle className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                  <span className="hidden sm:inline">Nova Atividade</span>
                  <span className="sm:hidden">+</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuItem onClick={() => setShowAppointmentModal(true)}>
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Novo Agendamento</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowClientModal(true)}>
                  <Users className="mr-2 h-4 w-4" />
                  <span>Novo Cliente</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowServiceModal(true)}>
                  <Briefcase className="mr-2 h-4 w-4" />
                  <span>Novo Serviço</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowMediaModal(true)}>
                  <Camera className="mr-2 h-4 w-4" />
                  <span>Nova Mídia</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Profile Dropdown */}
            <div className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-4 border-l border-border">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-auto w-auto p-2 rounded-full hover:bg-accent flex items-center gap-2 lg:gap-3">
                    <Avatar className="w-8 h-8 lg:w-10 lg:h-10 ring-2 ring-primary/20">
                      <AvatarImage src={currentPhotoUrl} alt={currentUser?.name || 'User'} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold text-xs lg:text-sm">
                        {getUserInitials(currentUser?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-xs lg:text-sm hidden sm:block text-left">
                      <div className="font-semibold text-foreground">{currentUser?.name || 'Usuário'}</div>
                      <div className="text-muted-foreground">Modelo</div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={currentPhotoUrl} alt={currentUser?.name || 'User'} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {getUserInitials(currentUser?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{currentUser?.name || 'Usuário'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {currentUser?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/v2/profile')}>
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Editar perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      {showAppointmentModal && <Dialog open={showAppointmentModal} onOpenChange={setShowAppointmentModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full p-0">
            <ModelAppointmentForm onClose={() => setShowAppointmentModal(false)} />
          </DialogContent>
        </Dialog>}

      <ClientForm open={showClientModal} onOpenChange={setShowClientModal} />

      <ServiceForm open={showServiceModal} onOpenChange={setShowServiceModal} />

      {showMediaModal && <Dialog open={showMediaModal} onOpenChange={setShowMediaModal}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full p-2 sm:p-6">
            <OrganizedMediaManager />
          </DialogContent>
        </Dialog>}
    </>;
};
export default V2Header;