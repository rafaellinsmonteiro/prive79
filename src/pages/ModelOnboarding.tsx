
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Star, Shield, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const ModelOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const [formData, setFormData] = useState({
    // Etapa 1 - Informações Básicas
    name: "",
    age: "",
    email: "",
    phone: "",
    city: "",
    
    // Etapa 2 - Características
    height: "",
    weight: "",
    appearance: "",
    languages: "",
    
    // Etapa 3 - Experiência e Serviços
    experience: "",
    services: [],
    description: "",
    
    // Etapa 4 - Disponibilidade e Contato
    availability: "",
    whatsapp: "",
    instagram: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log("Dados do formulário:", formData);
    // Aqui você processaria os dados
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link to="/home" className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/a935e9c2-2b1f-481f-a98d-a750da629b13.png" 
                alt="Prive Logo" 
                className="h-8 w-auto"
              />
            </Link>
            <div className="text-sm text-zinc-400">
              Etapa {currentStep} de {totalSteps}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-zinc-400 mb-2">
              <span>Informações Básicas</span>
              <span>Características</span>
              <span>Experiência</span>
              <span>Finalização</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Welcome Message */}
          {currentStep === 1 && (
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Star className="h-12 w-12 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-4">Bem-vinda à Prive City!</h1>
              <p className="text-zinc-400 text-lg">
                Vamos criar seu perfil exclusivo em alguns passos simples.
              </p>
            </div>
          )}

          {/* Step Content */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-xl">
                {currentStep === 1 && "Informações Básicas"}
                {currentStep === 2 && "Suas Características"}
                {currentStep === 3 && "Experiência e Serviços"}
                {currentStep === 4 && "Disponibilidade e Contato"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Etapa 1 - Informações Básicas */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome Artístico *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Como você quer ser conhecida"
                        className="bg-zinc-800 border-zinc-700"
                      />
                    </div>
                    <div>
                      <Label htmlFor="age">Idade *</Label>
                      <Input
                        id="age"
                        type="number"
                        value={formData.age}
                        onChange={(e) => handleInputChange("age", e.target.value)}
                        placeholder="Sua idade"
                        className="bg-zinc-800 border-zinc-700"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="seu@email.com"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Telefone *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="(11) 99999-9999"
                        className="bg-zinc-800 border-zinc-700"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">Cidade *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        placeholder="Sua cidade"
                        className="bg-zinc-800 border-zinc-700"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Etapa 2 - Características */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="height">Altura</Label>
                      <Input
                        id="height"
                        value={formData.height}
                        onChange={(e) => handleInputChange("height", e.target.value)}
                        placeholder="Ex: 1,65m"
                        className="bg-zinc-800 border-zinc-700"
                      />
                    </div>
                    <div>
                      <Label htmlFor="weight">Peso</Label>
                      <Input
                        id="weight"
                        value={formData.weight}
                        onChange={(e) => handleInputChange("weight", e.target.value)}
                        placeholder="Ex: 60kg"
                        className="bg-zinc-800 border-zinc-700"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="appearance">Aparência Física</Label>
                    <Input
                      id="appearance"
                      value={formData.appearance}
                      onChange={(e) => handleInputChange("appearance", e.target.value)}
                      placeholder="Ex: Morena, olhos castanhos"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="languages">Idiomas</Label>
                    <Input
                      id="languages"
                      value={formData.languages}
                      onChange={(e) => handleInputChange("languages", e.target.value)}
                      placeholder="Ex: Português, Inglês, Espanhol"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                </div>
              )}

              {/* Etapa 3 - Experiência e Serviços */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="experience">Experiência</Label>
                    <Textarea
                      id="experience"
                      value={formData.experience}
                      onChange={(e) => handleInputChange("experience", e.target.value)}
                      placeholder="Conte um pouco sobre sua experiência..."
                      className="bg-zinc-800 border-zinc-700 min-h-[100px]"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Descrição do Perfil</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Escreva uma descrição atrativa para seu perfil..."
                      className="bg-zinc-800 border-zinc-700 min-h-[120px]"
                    />
                    <p className="text-sm text-zinc-500 mt-1">
                      Esta será a primeira impressão dos clientes. Seja autêntica e atrativa.
                    </p>
                  </div>
                </div>
              )}

              {/* Etapa 4 - Disponibilidade e Contato */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="availability">Disponibilidade</Label>
                    <Textarea
                      id="availability"
                      value={formData.availability}
                      onChange={(e) => handleInputChange("availability", e.target.value)}
                      placeholder="Ex: Segunda a sexta, das 14h às 22h"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="whatsapp">WhatsApp</Label>
                      <Input
                        id="whatsapp"
                        value={formData.whatsapp}
                        onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                        placeholder="(11) 99999-9999"
                        className="bg-zinc-800 border-zinc-700"
                      />
                    </div>
                    <div>
                      <Label htmlFor="instagram">Instagram (opcional)</Label>
                      <Input
                        id="instagram"
                        value={formData.instagram}
                        onChange={(e) => handleInputChange("instagram", e.target.value)}
                        placeholder="@seuinstagram"
                        className="bg-zinc-800 border-zinc-700"
                      />
                    </div>
                  </div>

                  {/* Security Message */}
                  <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
                    <div className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-white mb-1">Segurança e Privacidade</h4>
                        <p className="text-sm text-zinc-400">
                          Todos os perfis passam por verificação antes da aprovação. 
                          Suas informações são protegidas e você tem controle total sobre sua visibilidade.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="border-zinc-700 text-zinc-100 hover:bg-zinc-800"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>

                {currentStep < totalSteps ? (
                  <Button
                    onClick={nextStep}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Próximo
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Finalizar Cadastro
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Support Message */}
          <div className="text-center mt-8">
            <p className="text-zinc-400 text-sm">
              Precisa de ajuda? Entre em contato conosco pelo WhatsApp: (11) 99999-9999
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelOnboarding;
