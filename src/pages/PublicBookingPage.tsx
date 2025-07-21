import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, Clock, MapPin, User } from "lucide-react";
import { usePublicModels, PublicModel, PublicService } from "@/hooks/usePublicModels";
import { usePublicBooking, BookingData, ClientData } from "@/hooks/usePublicBooking";
import { ModelSelectionCard } from "@/components/booking/ModelSelectionCard";
import { ServiceSelectionCard } from "@/components/booking/ServiceSelectionCard";
import { BookingCalendar } from "@/components/booking/BookingCalendar";
import { ClientDetailsForm } from "@/components/booking/ClientDetailsForm";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type BookingStep = "models" | "services" | "datetime" | "client" | "confirmation";

export default function PublicBookingPage() {
  const [currentStep, setCurrentStep] = useState<BookingStep>("models");
  const [selectedModel, setSelectedModel] = useState<PublicModel | null>(null);
  const [selectedService, setSelectedService] = useState<PublicService | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  const { data: models, isLoading } = usePublicModels();
  const createBooking = usePublicBooking();

  const handleModelSelect = (modelId: string) => {
    const model = models?.find(m => m.id === modelId);
    if (model) {
      setSelectedModel(model);
      setCurrentStep("services");
    }
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
    if (date && time) {
      setCurrentStep("client");
    }
  };

  const handleClientSubmit = (clientData: ClientData) => {
    if (selectedModel && selectedService && selectedDate && selectedTime) {
      const bookingData: BookingData = {
        modelId: selectedModel.id,
        serviceId: selectedService.id,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        clientData
      };
      
      createBooking.mutate(bookingData, {
        onSuccess: () => {
          setCurrentStep("confirmation");
        }
      });
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case "services":
        setCurrentStep("models");
        setSelectedModel(null);
        break;
      case "datetime":
        setCurrentStep("services");
        setSelectedService(null);
        break;
      case "client":
        setCurrentStep("datetime");
        setSelectedDate("");
        setSelectedTime("");
        break;
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: "models", label: "Modelo", icon: User },
      { key: "services", label: "Serviço", icon: Calendar },
      { key: "datetime", label: "Data/Hora", icon: Clock },
      { key: "client", label: "Dados", icon: User }
    ];

    const currentIndex = steps.findIndex(step => step.key === currentStep);

    return (
      <div className="flex items-center justify-center px-4 mb-8 overflow-x-auto">
        <div className="flex items-center space-x-1 sm:space-x-2 min-w-max">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index <= currentIndex;
            const isCurrent = step.key === currentStep;
            
            return (
              <div key={step.key} className="flex items-center">
                <div className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 ${
                  isActive 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : 'border-muted-foreground text-muted-foreground'
                }`}>
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
                <span className={`ml-1 sm:ml-2 text-xs sm:text-sm font-medium ${
                  isCurrent ? 'text-primary' : isActive ? 'text-foreground' : 'text-muted-foreground'
                } hidden xs:inline`}>
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-4 sm:w-8 h-0.5 mx-2 sm:mx-4 ${
                    index < currentIndex ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (currentStep === "confirmation") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="text-center">
              <CardHeader className="pb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-foreground">
                  Agendamento Realizado!
                </CardTitle>
                <CardDescription className="text-base">
                  Seu agendamento foi enviado para a modelo e está aguardando confirmação.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Modelo:</span>
                      <span className="font-medium">{selectedModel?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Serviço:</span>
                      <span className="font-medium">{selectedService?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Data:</span>
                      <span className="font-medium">
                        {format(new Date(selectedDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Horário:</span>
                      <span className="font-medium">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valor:</span>
                      <span className="font-medium text-primary">R$ {selectedService?.price}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Você será notificado quando a modelo confirmar seu agendamento.
                  O pagamento será feito diretamente com a modelo no dia do atendimento.
                </p>
                <Button 
                  onClick={() => window.location.href = "/"}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  Voltar ao Início
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Back Button */}
          {currentStep !== "models" && (
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mb-6 hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          )}

          {/* Content */}
          {currentStep === "models" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Escolha uma Modelo
                </h2>
                <p className="text-muted-foreground">
                  Selecione a modelo que você gostaria de agendar
                </p>
              </div>
              
              {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-6 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <div className="h-10 bg-muted rounded" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
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

          {currentStep === "services" && selectedModel && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Escolha um Serviço
                </h2>
                <p className="text-muted-foreground">
                  Serviços disponíveis para <strong>{selectedModel.name}</strong>
                </p>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                {selectedModel.services.map((service) => (
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

          {currentStep === "datetime" && (
            <div className="max-w-2xl mx-auto">
              <BookingCalendar
                onDateTimeSelect={handleDateTimeSelect}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
              />
            </div>
          )}

          {currentStep === "client" && (
            <div className="max-w-2xl mx-auto">
              <ClientDetailsForm
                onSubmit={handleClientSubmit}
                isLoading={createBooking.isPending}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}