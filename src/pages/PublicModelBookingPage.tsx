import { useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PublicBookingPage from "./PublicBookingPage";
import { Skeleton } from "@/components/ui/skeleton";

export default function PublicModelBookingPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: bookingSettings, isLoading, error } = useQuery({
    queryKey: ["public-booking-settings", slug],
    queryFn: async () => {
      if (!slug) throw new Error("Slug não fornecido");

      // Buscar configurações de agendamento
      const { data: settings, error: settingsError } = await supabase
        .from("model_online_booking_settings")
        .select("*")
        .eq("custom_slug", slug)
        .eq("is_enabled", true)
        .maybeSingle();

      if (settingsError) throw settingsError;
      if (!settings) throw new Error("Página de agendamento não encontrada ou inativa");

      // Buscar dados da modelo
      const { data: model, error: modelError } = await supabase
        .from("models")
        .select("id, name, description, city, neighborhood, is_active")
        .eq("id", settings.model_id)
        .eq("is_active", true)
        .single();

      if (modelError) throw modelError;
      if (!model) throw new Error("Modelo não encontrada ou inativa");

      return {
        ...settings,
        model
      };
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-4 w-96 mx-auto" />
            <div className="space-y-4">
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !bookingSettings) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold text-foreground">
            Página não encontrada
          </h1>
          <p className="text-muted-foreground">
            Esta página de agendamento não existe ou não está ativa.
          </p>
        </div>
      </div>
    );
  }

  // Renderizar a página de agendamento público modificada para uma modelo específica
  return (
    <PublicBookingPage 
      preSelectedModelId={bookingSettings.model_id}
      requireAccount={bookingSettings.require_account}
      modelName={bookingSettings.model.name}
    />
  );
}