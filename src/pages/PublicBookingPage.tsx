import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, Clock, MapPin, User, Settings, FileText } from "lucide-react";
import { usePublicModels, PublicModel, PublicService } from "@/hooks/usePublicModels";
import { usePublicBooking, BookingData, ClientData } from "@/hooks/usePublicBooking";
import { ModelSelectionCard } from "@/components/booking/ModelSelectionCard";
import { ServiceSelectionCard } from "@/components/booking/ServiceSelectionCard";
import { LocationSelectionCard } from "@/components/booking/LocationSelectionCard";
import { BookingCalendar } from "@/components/booking/BookingCalendar";
import { ClientDetailsForm } from "@/components/booking/ClientDetailsForm";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type BookingStep = "models" | "location" | "services" | "datetime" | "client" | "confirmation";

interface PublicBookingPageProps {
  preSelectedModelId?: string;
  requireAccount?: boolean;
  modelName?: string;
}

export default function PublicBookingPage({ 
  preSelectedModelId, 
  requireAccount = false,
  modelName 
}: PublicBookingPageProps = {}) {
  const [currentStep, setCurrentStep] = useState<BookingStep>(
    preSelectedModelId ? "location" : "models"
  );
  const [selectedModel, setSelectedModel] = useState<PublicModel | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedService, setSelectedService] = useState<PublicService | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  const { data: models, isLoading } = usePublicModels();
  
  // Se uma modelo específica foi pré-selecionada, encontrá-la nos dados
  useEffect(() => {
    if (preSelectedModelId && models && !selectedModel) {
      const preSelected = models.find(m => m.id === preSelectedModelId);
      if (preSelected) {
        setSelectedModel(preSelected);
      }
    }
  }, [preSelectedModelId, models, selectedModel]);
  const createBooking = usePublicBooking();

  const handleModelSelect = (modelId: string) => {
    const model = models?.find(m => m.id === modelId);
    if (model) {
      setSelectedModel(model);
      // Check if model has multiple location types across services
      const allLocationTypes = model.services.flatMap(s => s.location_types || ['online']);
      const uniqueLocationTypes = [...new Set(allLocationTypes)];
      
      if (uniqueLocationTypes.length > 1) {
        setCurrentStep("location");
      } else {
        setSelectedLocation(uniqueLocationTypes[0]);
        setCurrentStep("services");
      }
    }
  };

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    setCurrentStep("services");
  };

  const handleServiceSelect = (serviceId: string) => {
    const service = selectedModel?.services.find(s => s.id === serviceId);
    if (service) {
      setSelectedService(service);
      setCurrentStep("datetime");
    }
  };

  const handleDateTimeSelect = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setCurrentStep("client");
  };

  const handleClientSubmit = (clientData: ClientData) => {
    if (!selectedModel || !selectedService) return;

    const bookingData: BookingData = {
      modelId: selectedModel.id,
      serviceId: selectedService.id,
      appointmentDate: selectedDate,
      appointmentTime: selectedTime,
      clientData,
      selectedLocation,
      clientAddress: clientData.clientAddress,
    };

    createBooking.mutate(bookingData, {
      onSuccess: () => {
        setCurrentStep("confirmation");
      }
    });
  };

  const handleBack = () => {
    switch (currentStep) {
      case "location":
        if (preSelectedModelId) {
          // Can't go back if model is pre-selected
          return;
        }
        setCurrentStep("models");
        break;
      case "services":
        // Check if we need to go back to location selection
        if (selectedModel) {
          const allLocationTypes = selectedModel.services.flatMap(s => s.location_types || ['online']);
          const uniqueLocationTypes = [...new Set(allLocationTypes)];
          
          if (uniqueLocationTypes.length > 1) {
            setCurrentStep("location");
          } else if (preSelectedModelId) {
            // Can't go back if model is pre-selected
            return;
          } else {
            setCurrentStep("models");
          }
        }
        break;
      case "datetime":
        setCurrentStep("services");
        break;
      case "client":
        setCurrentStep("datetime");
        break;
      default:
        break;
    }
  };

  const renderStepIndicator = () => {
    const steps = preSelectedModelId 
      ? ['location', 'services', 'datetime', 'client'] 
      : ['models', 'location', 'services', 'datetime', 'client'];
    
    // Filter out location step if model has only one location type
    const filteredSteps = steps.filter(step => {
      if (step === 'location' && selectedModel) {
        const allLocationTypes = selectedModel.services.flatMap(s => s.location_types || ['online']);
        const uniqueLocationTypes = [...new Set(allLocationTypes)];
        return uniqueLocationTypes.length > 1;
      }
      return true;
    });

    const stepLabels = {
      models: 'Modelo',
      location: 'Local',
      services: 'Serviço',
      datetime: 'Data/Hora',
      client: 'Dados'
    };

    const stepIcons = {
      models: User,
      location: MapPin,
      services: Settings,
      datetime: Calendar,
      client: FileText
    };

    return (
      <div className="flex justify-center mb-8 px-4">
        <div className="flex items-center space-x-2 md:space-x-4 overflow-x-auto max-w-full">
          {filteredSteps.map((step, index) => {
            const isActive = step === currentStep;
            const isCompleted = filteredSteps.indexOf(currentStep) > index;
            const IconComponent = stepIcons[step as keyof typeof stepIcons];
            
            return (
              <div key={step} className="flex items-center flex-shrink-0">
                {index > 0 && (
                  <div className={`w-4 md:w-8 h-px mx-1 md:mx-2 ${
                    isCompleted ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
                <div className={`
                  flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full text-xs md:text-sm font-medium
                  ${isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : isCompleted 
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }
                `}>
                  {/* Show icon on mobile, number on desktop */}
                  <IconComponent className="h-3 w-3 md:hidden" />
                  <span className="hidden md:inline">{index + 1}</span>
                </div>
                {/* Show text label only on desktop */}
                <span className={`ml-1 md:ml-2 text-xs md:text-sm whitespace-nowrap hidden md:inline ${
                  isActive ? 'text-foreground font-medium' : 'text-muted-foreground'
                }`}>
                  {stepLabels[step as keyof typeof stepLabels]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (currentStep === "confirmation") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-600">Agendamento Realizado!</CardTitle>
            <CardDescription>
              Seu agendamento foi enviado com sucesso. Aguarde a confirmação da modelo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Detalhes do Agendamento:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Modelo:</span>
                  <span>{selectedModel?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Serviço:</span>
                  <span>{selectedService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Data:</span>
                  <span>{selectedDate && format(new Date(selectedDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Horário:</span>
                  <span>{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Local:</span>
                  <span>
                    {selectedLocation === 'online' && 'Online'}
                    {selectedLocation === 'my_address' && 'Endereço da modelo'}
                    {selectedLocation === 'client_address' && 'Endereço do cliente'}
                  </span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Valor:</span>
                  <span>R$ {selectedService?.price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {renderStepIndicator()}
      
      <div className="max-w-4xl mx-auto">
        {(currentStep as string) !== "models" && (currentStep as string) !== "confirmation" && (
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </div>
        )}

        {currentStep === "models" && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Escolha uma Modelo</h1>
              <p className="text-muted-foreground">Selecione a modelo para seu agendamento</p>
            </div>
            
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {models?.map((model) => (
                  <ModelSelectionCard
                    key={model.id}
                    model={model}
                    onSelect={handleModelSelect}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {currentStep === "location" && selectedModel && (
          <div>
            {(() => {
              const allLocationTypes = selectedModel.services.flatMap(s => s.location_types || ['online']);
              const uniqueLocationTypes = [...new Set(allLocationTypes)];
              
              return (
                <LocationSelectionCard
                  locations={uniqueLocationTypes}
                  onSelect={handleLocationSelect}
                  selected={selectedLocation}
                />
              );
            })()}
          </div>
        )}

        {currentStep === "services" && selectedModel && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Escolha um Serviço</h2>
              <p className="text-muted-foreground">
                Serviços disponíveis de {selectedModel.name}
                {selectedLocation && (
                  <span className="block mt-1 text-sm">
                    Local: {selectedLocation === 'online' ? 'Online' : 
                            selectedLocation === 'my_address' ? 'Endereço da modelo' :
                            'Endereço do cliente'}
                  </span>
                )}
              </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              {selectedModel.services
                .filter(service => 
                  !selectedLocation || 
                  !service.location_types || 
                  service.location_types.includes(selectedLocation)
                )
                .map((service) => (
                  <ServiceSelectionCard
                    key={service.id}
                    service={service}
                    onSelect={handleServiceSelect}
                    selected={selectedService?.id === service.id}
                  />
                ))}
            </div>
          </div>
        )}

        {currentStep === "datetime" && selectedService && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Escolha Data e Horário</h2>
              <p className="text-muted-foreground">
                Selecione quando você gostaria de ser atendido
              </p>
            </div>
            
            <BookingCalendar
              onDateTimeSelect={handleDateTimeSelect}
            />
          </div>
        )}

        {currentStep === "client" && selectedService && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Seus Dados</h2>
              <p className="text-muted-foreground">
                Preencha seus dados para finalizar o agendamento
              </p>
            </div>
            
            <ClientDetailsForm
              service={selectedService}
              onSubmit={handleClientSubmit}
              isLoading={createBooking.isPending}
              selectedLocation={selectedLocation}
            />
          </div>
        )}
      </div>
    </div>
  );
}