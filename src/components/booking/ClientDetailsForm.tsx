import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import { ClientData } from "@/hooks/usePublicBooking";
import { PublicService } from "@/hooks/usePublicModels";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface Guest {
  id: string;
  name: string;
  gender: string;
  relationship: string;
}

interface ExtendedClientData extends ClientData {
  hasGuests: boolean;
  guests: Guest[];
}

interface ClientDetailsFormProps {
  service: PublicService;
  onSubmit: (clientData: ExtendedClientData) => void;
  isLoading?: boolean;
}

export const ClientDetailsForm = ({ service, onSubmit, isLoading }: ClientDetailsFormProps) => {
  const { user } = useAuth();
  const { data: currentUser } = useCurrentUser();
  
  const [formData, setFormData] = useState<ExtendedClientData>({
    name: "",
    email: "",
    phone: "",
    hasGuests: false,
    guests: []
  });

  const [errors, setErrors] = useState<Partial<ExtendedClientData>>({});

  // Pré-preencher dados do usuário logado
  useEffect(() => {
    if (user && currentUser) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || ""
      }));
    }
  }, [user, currentUser]);

  const addGuest = () => {
    const newGuest: Guest = {
      id: Date.now().toString(),
      name: "",
      gender: "",
      relationship: ""
    };
    setFormData(prev => ({
      ...prev,
      guests: [...prev.guests, newGuest]
    }));
  };

  const removeGuest = (guestId: string) => {
    setFormData(prev => ({
      ...prev,
      guests: prev.guests.filter(guest => guest.id !== guestId)
    }));
  };

  const updateGuest = (guestId: string, field: keyof Guest, value: string) => {
    setFormData(prev => ({
      ...prev,
      guests: prev.guests.map(guest =>
        guest.id === guestId ? { ...guest, [field]: value } : guest
      )
    }));
  };

  const [guestErrors, setGuestErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Partial<ExtendedClientData> = {};
    const newGuestErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }
    
    if (formData.phone && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(formData.phone)) {
      newErrors.phone = "Telefone deve estar no formato (00) 00000-0000";
    }

    // Validar número total de pessoas contra o limite do serviço
    const totalPeople = 1 + formData.guests.length; // 1 (usuário principal) + convidados
    if (totalPeople > service.max_people) {
      newErrors.hasGuests = `Este serviço permite no máximo ${service.max_people} ${service.max_people === 1 ? 'pessoa' : 'pessoas'}. Você tem ${totalPeople} pessoas no total.` as any;
    }

    // Validar convidados se necessário
    if (formData.hasGuests) {
      formData.guests.forEach((guest, index) => {
        if (!guest.name.trim()) {
          newGuestErrors[`guest_${index}_name`] = "Nome do convidado é obrigatório";
        }
        if (!guest.gender) {
          newGuestErrors[`guest_${index}_gender`] = "Gênero é obrigatório";
        }
        if (!guest.relationship) {
          newGuestErrors[`guest_${index}_relationship`] = "Relação é obrigatória";
        }
      });
    }

    setErrors(newErrors);
    setGuestErrors(newGuestErrors);
    return Object.keys(newErrors).length === 0 && Object.keys(newGuestErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{user ? "Confirmação dos Dados" : "Seus Dados"}</CardTitle>
        <CardDescription>
          {user 
            ? "Confirme suas informações e adicione convidados se necessário" 
            : "Preencha suas informações para finalizar o agendamento"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Seu nome completo"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="seu@email.com"
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">WhatsApp</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
              placeholder="(00) 00000-0000"
              className={errors.phone ? "border-destructive" : ""}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone}</p>
            )}
          </div>

          <Separator className="my-6" />

          {/* Seção de Convidados */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="hasGuests"
                checked={formData.hasGuests}
                onCheckedChange={(checked) => {
                  setFormData({ 
                    ...formData, 
                    hasGuests: checked,
                    guests: checked ? formData.guests : []
                  });
                }}
              />
              <Label htmlFor="hasGuests">Levar convidados</Label>
            </div>
            {errors.hasGuests && (
              <p className="text-sm text-destructive">{errors.hasGuests}</p>
            )}

            {formData.hasGuests && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Convidados</h4>
                    <p className="text-xs text-muted-foreground">
                      Este serviço permite até {service.max_people} {service.max_people === 1 ? 'pessoa' : 'pessoas'} no total (incluindo você)
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addGuest}
                    className="h-8 px-2"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                </div>

                {formData.guests.map((guest, index) => (
                  <Card key={guest.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-sm font-medium">Convidado {index + 1}</h5>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeGuest(guest.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor={`guest-name-${guest.id}`}>Nome *</Label>
                        <Input
                          id={`guest-name-${guest.id}`}
                          value={guest.name}
                          onChange={(e) => updateGuest(guest.id, 'name', e.target.value)}
                          placeholder="Nome do convidado"
                          className={guestErrors[`guest_${index}_name`] ? "border-destructive" : ""}
                        />
                        {guestErrors[`guest_${index}_name`] && (
                          <p className="text-sm text-destructive">{guestErrors[`guest_${index}_name`]}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`guest-gender-${guest.id}`}>Gênero *</Label>
                        <Select
                          value={guest.gender}
                          onValueChange={(value) => updateGuest(guest.id, 'gender', value)}
                        >
                          <SelectTrigger className={guestErrors[`guest_${index}_gender`] ? "border-destructive" : ""}>
                            <SelectValue placeholder="Selecionar gênero" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="masculino">Masculino</SelectItem>
                            <SelectItem value="feminino">Feminino</SelectItem>
                            <SelectItem value="outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                        {guestErrors[`guest_${index}_gender`] && (
                          <p className="text-sm text-destructive">{guestErrors[`guest_${index}_gender`]}</p>
                        )}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor={`guest-relationship-${guest.id}`}>Relação *</Label>
                        <Select
                          value={guest.relationship}
                          onValueChange={(value) => updateGuest(guest.id, 'relationship', value)}
                        >
                          <SelectTrigger className={guestErrors[`guest_${index}_relationship`] ? "border-destructive" : ""}>
                            <SelectValue placeholder="Selecionar relação" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="conjuge">Cônjuge</SelectItem>
                            <SelectItem value="namorado">Namorado(a)</SelectItem>
                            <SelectItem value="amigo">Amigo(a)</SelectItem>
                            <SelectItem value="colega">Colega</SelectItem>
                            <SelectItem value="familiar">Familiar</SelectItem>
                            <SelectItem value="conhecido">Conhecido(a)</SelectItem>
                            <SelectItem value="outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                        {guestErrors[`guest_${index}_relationship`] && (
                          <p className="text-sm text-destructive">{guestErrors[`guest_${index}_relationship`]}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            disabled={isLoading}
          >
            {isLoading ? "Agendando..." : "Finalizar Agendamento"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};