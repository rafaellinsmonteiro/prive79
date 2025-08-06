import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ClientData {
  name: string;
  email?: string;
  phone?: string;
  clientAddress?: string;
}

export interface BookingData {
  modelId: string;
  serviceId: string;
  appointmentDate: string;
  appointmentTime: string;
  clientData: ClientData;
  selectedLocation?: string;
  clientAddress?: string;
}

export const usePublicBooking = () => {
  return useMutation({
    mutationFn: async (bookingData: BookingData) => {
      // First, create or get the client
      const { data: existingClient } = await supabase
        .from("clients")
        .select("id")
        .eq("name", bookingData.clientData.name)
        .eq("phone", bookingData.clientData.phone || "")
        .maybeSingle();

      let clientId: string;

      if (existingClient) {
        clientId = existingClient.id;
      } else {
        const { data: newClient, error: clientError } = await supabase
          .from("clients")
          .insert({
            name: bookingData.clientData.name,
            email: bookingData.clientData.email,
            phone: bookingData.clientData.phone
          })
          .select("id")
          .single();

        if (clientError) throw clientError;
        clientId = newClient.id;
      }

      // Get service details for pricing and location
      const { data: service, error: serviceError } = await supabase
        .from("services")
        .select("price, duration, service_address")
        .eq("id", bookingData.serviceId)
        .single();

      if (serviceError) throw serviceError;

      // Define location based on selected option
      let appointmentLocation = 'A definir';
      if (bookingData.selectedLocation === 'online') {
        appointmentLocation = 'Online';
      } else if (bookingData.selectedLocation === 'my_address' && service.service_address) {
        appointmentLocation = service.service_address;
      } else if (bookingData.selectedLocation === 'client_address' && bookingData.clientAddress) {
        appointmentLocation = bookingData.clientAddress;
      }

      // Create the appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from("appointments")
        .insert({
          model_id: bookingData.modelId,
          client_id: clientId,
          service_id: bookingData.serviceId,
          appointment_date: bookingData.appointmentDate,
          appointment_time: bookingData.appointmentTime,
          duration: service.duration,
          price: service.price,
          status: "pending",
          payment_status: "pending",
          booking_source: "public",
          location: appointmentLocation,
          created_by_admin: false
        })
        .select()
        .single();

      if (appointmentError) throw appointmentError;

      return appointment;
    },
    onSuccess: () => {
      toast.success("Agendamento realizado com sucesso!", {
        description: "Aguarde a confirmação da modelo para finalizar o agendamento."
      });
    },
    onError: (error) => {
      console.error("Error creating booking:", error);
      toast.error("Erro ao realizar agendamento", {
        description: "Tente novamente ou entre em contato conosco."
      });
    },
  });
};