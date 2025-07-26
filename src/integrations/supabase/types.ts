export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      appointment_attachments: {
        Row: {
          appointment_id: string
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          user_id: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          user_id: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_attachments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_comments: {
        Row: {
          appointment_id: string
          comment: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_id: string
          comment: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_id?: string
          comment?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_comments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          admin_notes: string | null
          appointment_date: string
          appointment_time: string
          booking_source: string
          client_id: string
          created_at: string
          created_by_admin: boolean | null
          currency: string | null
          duration: number
          id: string
          is_recurring_series: boolean | null
          location: string | null
          model_id: string
          observations: string | null
          parent_appointment_id: string | null
          payment_status: string
          price: number
          recurrence_end_date: string | null
          recurrence_type: string | null
          service_id: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          appointment_date: string
          appointment_time: string
          booking_source?: string
          client_id: string
          created_at?: string
          created_by_admin?: boolean | null
          currency?: string | null
          duration?: number
          id?: string
          is_recurring_series?: boolean | null
          location?: string | null
          model_id: string
          observations?: string | null
          parent_appointment_id?: string | null
          payment_status?: string
          price?: number
          recurrence_end_date?: string | null
          recurrence_type?: string | null
          service_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          appointment_date?: string
          appointment_time?: string
          booking_source?: string
          client_id?: string
          created_at?: string
          created_by_admin?: boolean | null
          currency?: string | null
          duration?: number
          id?: string
          is_recurring_series?: boolean | null
          location?: string | null
          model_id?: string
          observations?: string | null
          parent_appointment_id?: string | null
          payment_status?: string
          price?: number
          recurrence_end_date?: string | null
          recurrence_type?: string | null
          service_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_parent_appointment_id_fkey"
            columns: ["parent_appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          display_order: number
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          name?: string
        }
        Relationships: []
      }
      chat_settings: {
        Row: {
          allowed_file_types: string[] | null
          auto_delete_messages_days: number | null
          created_at: string
          enable_file_upload: boolean
          enable_read_receipts: boolean
          enable_typing_indicators: boolean
          id: string
          is_enabled: boolean
          max_file_size_mb: number
          updated_at: string
        }
        Insert: {
          allowed_file_types?: string[] | null
          auto_delete_messages_days?: number | null
          created_at?: string
          enable_file_upload?: boolean
          enable_read_receipts?: boolean
          enable_typing_indicators?: boolean
          id?: string
          is_enabled?: boolean
          max_file_size_mb?: number
          updated_at?: string
        }
        Update: {
          allowed_file_types?: string[] | null
          auto_delete_messages_days?: number | null
          created_at?: string
          enable_file_upload?: boolean
          enable_read_receipts?: boolean
          enable_typing_indicators?: boolean
          id?: string
          is_enabled?: boolean
          max_file_size_mb?: number
          updated_at?: string
        }
        Relationships: []
      }
      chat_users: {
        Row: {
          chat_display_name: string | null
          created_at: string
          id: string
          is_active: boolean
          updated_at: string
          user_id: string | null
          username: string | null
        }
        Insert: {
          chat_display_name?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string | null
          username?: string | null
        }
        Update: {
          chat_display_name?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      cities: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          state: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          state?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          state?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          added_automatically: boolean
          contact_chat_id: string | null
          contact_name: string | null
          contact_photo_url: string | null
          contact_user_id: string
          created_at: string
          id: string
          is_model: boolean
          model_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          added_automatically?: boolean
          contact_chat_id?: string | null
          contact_name?: string | null
          contact_photo_url?: string | null
          contact_user_id: string
          created_at?: string
          id?: string
          is_model?: boolean
          model_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          added_automatically?: boolean
          contact_chat_id?: string | null
          contact_name?: string | null
          contact_photo_url?: string | null
          contact_user_id?: string
          created_at?: string
          id?: string
          is_model?: boolean
          model_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          last_message_at: string | null
          last_message_content: string | null
          last_message_type: Database["public"]["Enums"]["message_type"] | null
          model_id: string | null
          receiver_chat_id: string | null
          sender_chat_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_message_at?: string | null
          last_message_content?: string | null
          last_message_type?: Database["public"]["Enums"]["message_type"] | null
          model_id?: string | null
          receiver_chat_id?: string | null
          sender_chat_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_message_at?: string | null
          last_message_content?: string | null
          last_message_type?: Database["public"]["Enums"]["message_type"] | null
          model_id?: string | null
          receiver_chat_id?: string | null
          sender_chat_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_receiver_chat_id_fkey"
            columns: ["receiver_chat_id"]
            isOneToOne: false
            referencedRelation: "chat_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_sender_chat_id_fkey"
            columns: ["sender_chat_id"]
            isOneToOne: false
            referencedRelation: "chat_users"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_fields: {
        Row: {
          allowed_plan_ids: string[] | null
          created_at: string
          display_order: number
          field_name: string
          field_type: string
          help_text: string | null
          icon_url: string | null
          id: string
          is_active: boolean
          is_required: boolean
          label: string
          options: string[] | null
          placeholder: string | null
          section: string | null
          updated_at: string
        }
        Insert: {
          allowed_plan_ids?: string[] | null
          created_at?: string
          display_order?: number
          field_name: string
          field_type: string
          help_text?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          label: string
          options?: string[] | null
          placeholder?: string | null
          section?: string | null
          updated_at?: string
        }
        Update: {
          allowed_plan_ids?: string[] | null
          created_at?: string
          display_order?: number
          field_name?: string
          field_type?: string
          help_text?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          label?: string
          options?: string[] | null
          placeholder?: string | null
          section?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      custom_sections: {
        Row: {
          allowed_plan_ids: string[] | null
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          allowed_plan_ids?: string[] | null
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          allowed_plan_ids?: string[] | null
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      goal_progress: {
        Row: {
          created_at: string
          goal_id: string
          id: string
          notes: string | null
          progress_date: string
          progress_value: number
        }
        Insert: {
          created_at?: string
          goal_id: string
          id?: string
          notes?: string | null
          progress_date?: string
          progress_value?: number
        }
        Update: {
          created_at?: string
          goal_id?: string
          id?: string
          notes?: string | null
          progress_date?: string
          progress_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "goal_progress_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          admin_defined: boolean
          appointment_types: string[] | null
          content_formats: string[] | null
          created_at: string
          created_by_user_id: string | null
          current_value: number
          description: string | null
          goal_type: string
          id: string
          is_active: boolean
          model_id: string | null
          period_end: string | null
          period_start: string | null
          period_type: string
          reward_description: string | null
          reward_points: number | null
          target_value: number
          title: string
          updated_at: string
        }
        Insert: {
          admin_defined?: boolean
          appointment_types?: string[] | null
          content_formats?: string[] | null
          created_at?: string
          created_by_user_id?: string | null
          current_value?: number
          description?: string | null
          goal_type: string
          id?: string
          is_active?: boolean
          model_id?: string | null
          period_end?: string | null
          period_start?: string | null
          period_type?: string
          reward_description?: string | null
          reward_points?: number | null
          target_value: number
          title: string
          updated_at?: string
        }
        Update: {
          admin_defined?: boolean
          appointment_types?: string[] | null
          content_formats?: string[] | null
          created_at?: string
          created_by_user_id?: string | null
          current_value?: number
          description?: string | null
          goal_type?: string
          id?: string
          is_active?: boolean
          model_id?: string | null
          period_end?: string | null
          period_start?: string | null
          period_type?: string
          reward_description?: string | null
          reward_points?: number | null
          target_value?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
        ]
      }
      lunna_tools: {
        Row: {
          allowed_user_types: string[] | null
          category: string | null
          created_at: string
          description: string | null
          display_order: number
          function_name: string
          id: string
          is_active: boolean
          label: string
          name: string
          parameters: Json | null
          updated_at: string
        }
        Insert: {
          allowed_user_types?: string[] | null
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          function_name: string
          id?: string
          is_active?: boolean
          label: string
          name: string
          parameters?: Json | null
          updated_at?: string
        }
        Update: {
          allowed_user_types?: string[] | null
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          function_name?: string
          id?: string
          is_active?: boolean
          label?: string
          name?: string
          parameters?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      lunna_user_preferences: {
        Row: {
          created_at: string | null
          id: string
          interaction_count: number | null
          last_interaction_at: string | null
          notes: string | null
          preferred_age_range: string | null
          preferred_cities: string[] | null
          preferred_price_range: string | null
          preferred_services: string[] | null
          updated_at: string | null
          user_name: string | null
          user_session_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          interaction_count?: number | null
          last_interaction_at?: string | null
          notes?: string | null
          preferred_age_range?: string | null
          preferred_cities?: string[] | null
          preferred_price_range?: string | null
          preferred_services?: string[] | null
          updated_at?: string | null
          user_name?: string | null
          user_session_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          interaction_count?: number | null
          last_interaction_at?: string | null
          notes?: string | null
          preferred_age_range?: string | null
          preferred_cities?: string[] | null
          preferred_price_range?: string | null
          preferred_services?: string[] | null
          updated_at?: string | null
          user_name?: string | null
          user_session_id?: string
        }
        Relationships: []
      }
      menu_configurations: {
        Row: {
          city_id: string | null
          created_at: string
          id: string
          is_active: boolean
          menu_item_id: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          city_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          menu_item_id: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          city_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          menu_item_id?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: [
          {
            foreignKeyName: "menu_configurations_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_configurations_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          category_id: string | null
          created_at: string
          display_order: number
          icon: string | null
          id: string
          is_active: boolean
          menu_type: Database["public"]["Enums"]["menu_type"]
          parent_id: string | null
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          menu_type: Database["public"]["Enums"]["menu_type"]
          parent_id?: string | null
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          menu_type?: Database["public"]["Enums"]["menu_type"]
          parent_id?: string | null
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string
          delivered_at: string | null
          file_name: string | null
          file_size: number | null
          id: string
          media_type: string | null
          media_url: string | null
          message_type: Database["public"]["Enums"]["message_type"]
          read_at: string | null
          sender_id: string
          sender_type: string
          source: string | null
          status: Database["public"]["Enums"]["message_status"]
          whatsapp_message_id: string | null
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string
          delivered_at?: string | null
          file_name?: string | null
          file_size?: number | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          message_type?: Database["public"]["Enums"]["message_type"]
          read_at?: string | null
          sender_id: string
          sender_type: string
          source?: string | null
          status?: Database["public"]["Enums"]["message_status"]
          whatsapp_message_id?: string | null
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string
          delivered_at?: string | null
          file_name?: string | null
          file_size?: number | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          message_type?: Database["public"]["Enums"]["message_type"]
          read_at?: string | null
          sender_id?: string
          sender_type?: string
          source?: string | null
          status?: Database["public"]["Enums"]["message_status"]
          whatsapp_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      model_categories: {
        Row: {
          category_id: string
          model_id: string
        }
        Insert: {
          category_id: string
          model_id: string
        }
        Update: {
          category_id?: string
          model_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "model_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_categories_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
        ]
      }
      model_dashboard_settings: {
        Row: {
          allow_direct_messages: boolean
          auto_approve_photos: boolean
          created_at: string
          id: string
          model_id: string
          privacy_mode: boolean
          show_online_status: boolean
          updated_at: string
        }
        Insert: {
          allow_direct_messages?: boolean
          auto_approve_photos?: boolean
          created_at?: string
          id?: string
          model_id: string
          privacy_mode?: boolean
          show_online_status?: boolean
          updated_at?: string
        }
        Update: {
          allow_direct_messages?: boolean
          auto_approve_photos?: boolean
          created_at?: string
          id?: string
          model_id?: string
          privacy_mode?: boolean
          show_online_status?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "model_dashboard_settings_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: true
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
        ]
      }
      model_media_folders: {
        Row: {
          created_at: string | null
          created_by_user_id: string | null
          description: string | null
          id: string
          model_id: string
          name: string
          parent_folder_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by_user_id?: string | null
          description?: string | null
          id?: string
          model_id: string
          name: string
          parent_folder_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by_user_id?: string | null
          description?: string | null
          id?: string
          model_id?: string
          name?: string
          parent_folder_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      model_online_booking_settings: {
        Row: {
          created_at: string
          custom_slug: string | null
          id: string
          is_enabled: boolean
          model_id: string
          require_account: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_slug?: string | null
          id?: string
          is_enabled?: boolean
          model_id: string
          require_account?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_slug?: string | null
          id?: string
          is_enabled?: boolean
          model_id?: string
          require_account?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      model_photos: {
        Row: {
          allowed_plan_ids: string[] | null
          created_at: string
          created_by_user_id: string | null
          display_order: number | null
          folder_id: string | null
          id: string
          is_primary: boolean | null
          model_id: string
          photo_url: string
          show_in_gallery: boolean | null
          show_in_profile: boolean | null
          stage: string | null
          tags: string[] | null
          visibility_type: string | null
        }
        Insert: {
          allowed_plan_ids?: string[] | null
          created_at?: string
          created_by_user_id?: string | null
          display_order?: number | null
          folder_id?: string | null
          id?: string
          is_primary?: boolean | null
          model_id: string
          photo_url: string
          show_in_gallery?: boolean | null
          show_in_profile?: boolean | null
          stage?: string | null
          tags?: string[] | null
          visibility_type?: string | null
        }
        Update: {
          allowed_plan_ids?: string[] | null
          created_at?: string
          created_by_user_id?: string | null
          display_order?: number | null
          folder_id?: string | null
          id?: string
          is_primary?: boolean | null
          model_id?: string
          photo_url?: string
          show_in_gallery?: boolean | null
          show_in_profile?: boolean | null
          stage?: string | null
          tags?: string[] | null
          visibility_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "model_photos_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
        ]
      }
      model_profiles: {
        Row: {
          chat_user_id: string | null
          created_at: string
          id: string
          is_active: boolean
          model_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          chat_user_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          model_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          chat_user_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          model_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "model_profiles_chat_user_id_fkey"
            columns: ["chat_user_id"]
            isOneToOne: false
            referencedRelation: "chat_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_profiles_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
        ]
      }
      model_video_reels_categories: {
        Row: {
          category_id: string
          video_id: string
        }
        Insert: {
          category_id: string
          video_id: string
        }
        Update: {
          category_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "model_video_reels_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "reels_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_video_reels_categories_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "model_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      model_videos: {
        Row: {
          allowed_plan_ids: string[] | null
          created_at: string
          created_by_user_id: string | null
          display_order: number | null
          duration: number | null
          folder_id: string | null
          id: string
          is_active: boolean | null
          is_featured_in_reels: boolean | null
          model_id: string
          show_in_gallery: boolean | null
          show_in_profile: boolean | null
          stage: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string
          video_url: string
          visibility_type: string | null
        }
        Insert: {
          allowed_plan_ids?: string[] | null
          created_at?: string
          created_by_user_id?: string | null
          display_order?: number | null
          duration?: number | null
          folder_id?: string | null
          id?: string
          is_active?: boolean | null
          is_featured_in_reels?: boolean | null
          model_id: string
          show_in_gallery?: boolean | null
          show_in_profile?: boolean | null
          stage?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          video_url: string
          visibility_type?: string | null
        }
        Update: {
          allowed_plan_ids?: string[] | null
          created_at?: string
          created_by_user_id?: string | null
          display_order?: number | null
          duration?: number | null
          folder_id?: string | null
          id?: string
          is_active?: boolean | null
          is_featured_in_reels?: boolean | null
          model_id?: string
          show_in_gallery?: boolean | null
          show_in_profile?: boolean | null
          stage?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          video_url?: string
          visibility_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "model_videos_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
        ]
      }
      model_working_hours: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean
          model_id: string
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean
          model_id: string
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean
          model_id?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "model_working_hours_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
        ]
      }
      models: {
        Row: {
          "1hora": number | null
          "2horas": number | null
          "3horas": number | null
          age: number
          allowed_plan_ids: string[] | null
          anal: boolean | null
          anal2: boolean | null
          appearance: string | null
          beijo: boolean | null
          body_type: string | null
          bust: string | null
          cabelo: string | null
          chuva_dourada: string | null
          city: string | null
          city_id: string | null
          clube_swing: boolean | null
          com_local: boolean | null
          created_at: string
          description: string | null
          despedida_solteiro: boolean | null
          diaria: number | null
          display_order: number | null
          domicilio: boolean | null
          dupla_penetracao: boolean | null
          etnia: string | null
          eyes: string | null
          face_private: boolean | null
          face_public: boolean | null
          garganta: boolean | null
          grava: boolean | null
          height: string | null
          hip: string | null
          hotel: boolean | null
          id: string
          is_active: boolean | null
          is_online: boolean | null
          jantar: boolean | null
          languages: string | null
          last_status_update: string | null
          manual_status_override: boolean | null
          motel: boolean | null
          name: string
          neighborhood: string | null
          nossa_recomendacao: string | null
          nuru: boolean | null
          olhos: string | null
          onlyfans: boolean | null
          oral2: boolean | null
          pernoite: number | null
          plataformas: string | null
          privacy: boolean | null
          Privacy: string | null
          privefan: boolean | null
          profiles_extra: string | null
          shoe_size: string | null
          silicone: boolean | null
          silicone2: boolean | null
          tamanho: string | null
          tatuagem: boolean | null
          telegram: boolean | null
          teste: string | null
          testedecampo: string | null
          tipodecorpo: string | null
          updated_at: string
          vaginal2: boolean | null
          videochamada: boolean | null
          visibility_type: string | null
          waist: string | null
          weight: string | null
          whatsapp_normal: boolean | null
          whatsapp_number: string | null
          whatsapp_temp: boolean | null
        }
        Insert: {
          "1hora"?: number | null
          "2horas"?: number | null
          "3horas"?: number | null
          age: number
          allowed_plan_ids?: string[] | null
          anal?: boolean | null
          anal2?: boolean | null
          appearance?: string | null
          beijo?: boolean | null
          body_type?: string | null
          bust?: string | null
          cabelo?: string | null
          chuva_dourada?: string | null
          city?: string | null
          city_id?: string | null
          clube_swing?: boolean | null
          com_local?: boolean | null
          created_at?: string
          description?: string | null
          despedida_solteiro?: boolean | null
          diaria?: number | null
          display_order?: number | null
          domicilio?: boolean | null
          dupla_penetracao?: boolean | null
          etnia?: string | null
          eyes?: string | null
          face_private?: boolean | null
          face_public?: boolean | null
          garganta?: boolean | null
          grava?: boolean | null
          height?: string | null
          hip?: string | null
          hotel?: boolean | null
          id?: string
          is_active?: boolean | null
          is_online?: boolean | null
          jantar?: boolean | null
          languages?: string | null
          last_status_update?: string | null
          manual_status_override?: boolean | null
          motel?: boolean | null
          name: string
          neighborhood?: string | null
          nossa_recomendacao?: string | null
          nuru?: boolean | null
          olhos?: string | null
          onlyfans?: boolean | null
          oral2?: boolean | null
          pernoite?: number | null
          plataformas?: string | null
          privacy?: boolean | null
          Privacy?: string | null
          privefan?: boolean | null
          profiles_extra?: string | null
          shoe_size?: string | null
          silicone?: boolean | null
          silicone2?: boolean | null
          tamanho?: string | null
          tatuagem?: boolean | null
          telegram?: boolean | null
          teste?: string | null
          testedecampo?: string | null
          tipodecorpo?: string | null
          updated_at?: string
          vaginal2?: boolean | null
          videochamada?: boolean | null
          visibility_type?: string | null
          waist?: string | null
          weight?: string | null
          whatsapp_normal?: boolean | null
          whatsapp_number?: string | null
          whatsapp_temp?: boolean | null
        }
        Update: {
          "1hora"?: number | null
          "2horas"?: number | null
          "3horas"?: number | null
          age?: number
          allowed_plan_ids?: string[] | null
          anal?: boolean | null
          anal2?: boolean | null
          appearance?: string | null
          beijo?: boolean | null
          body_type?: string | null
          bust?: string | null
          cabelo?: string | null
          chuva_dourada?: string | null
          city?: string | null
          city_id?: string | null
          clube_swing?: boolean | null
          com_local?: boolean | null
          created_at?: string
          description?: string | null
          despedida_solteiro?: boolean | null
          diaria?: number | null
          display_order?: number | null
          domicilio?: boolean | null
          dupla_penetracao?: boolean | null
          etnia?: string | null
          eyes?: string | null
          face_private?: boolean | null
          face_public?: boolean | null
          garganta?: boolean | null
          grava?: boolean | null
          height?: string | null
          hip?: string | null
          hotel?: boolean | null
          id?: string
          is_active?: boolean | null
          is_online?: boolean | null
          jantar?: boolean | null
          languages?: string | null
          last_status_update?: string | null
          manual_status_override?: boolean | null
          motel?: boolean | null
          name?: string
          neighborhood?: string | null
          nossa_recomendacao?: string | null
          nuru?: boolean | null
          olhos?: string | null
          onlyfans?: boolean | null
          oral2?: boolean | null
          pernoite?: number | null
          plataformas?: string | null
          privacy?: boolean | null
          Privacy?: string | null
          privefan?: boolean | null
          profiles_extra?: string | null
          shoe_size?: string | null
          silicone?: boolean | null
          silicone2?: boolean | null
          tamanho?: string | null
          tatuagem?: boolean | null
          telegram?: boolean | null
          teste?: string | null
          testedecampo?: string | null
          tipodecorpo?: string | null
          updated_at?: string
          vaginal2?: boolean | null
          videochamada?: boolean | null
          visibility_type?: string | null
          waist?: string | null
          weight?: string | null
          whatsapp_normal?: boolean | null
          whatsapp_number?: string | null
          whatsapp_temp?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "models_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          appointment_id: string
          created_at: string
          id: string
          notes: string | null
          payment_date: string
          payment_method: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          appointment_id: string
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          appointment_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      pinned_conversations: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          pinned_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          pinned_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          pinned_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pix_deposits: {
        Row: {
          amount: number
          br_code: string | null
          created_at: string
          expires_at: string | null
          id: string
          pix_id: string
          processed: boolean | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          br_code?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          pix_id: string
          processed?: boolean | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          br_code?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          pix_id?: string
          processed?: boolean | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      plan_categories: {
        Row: {
          category_id: string
          plan_id: string
        }
        Insert: {
          category_id: string
          plan_id: string
        }
        Update: {
          category_id?: string
          plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_categories_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          name: string
          price: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          price?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      privabank_accounts: {
        Row: {
          balance: number
          balance_brl: number
          created_at: string
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          balance_brl?: number
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          balance_brl?: number
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      privabank_logs: {
        Row: {
          action_details: Json | null
          action_type: string
          created_at: string
          error_message: string | null
          id: string
          ip_address: unknown | null
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          created_at?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          created_at?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      privabank_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string | null
          from_account_id: string | null
          id: string
          status: string
          to_account_id: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description?: string | null
          from_account_id?: string | null
          id?: string
          status?: string
          to_account_id?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          from_account_id?: string | null
          id?: string
          status?: string
          to_account_id?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "privabank_transactions_from_account_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "privabank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "privabank_transactions_to_account_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "privabank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      prive_trust_status: {
        Row: {
          achieved_at: string | null
          average_rating: number | null
          created_at: string
          has_prive_trust: boolean
          id: string
          identity_verified: boolean
          reviews_received_count: number
          reviews_sent_approved: number
          reviews_sent_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          achieved_at?: string | null
          average_rating?: number | null
          created_at?: string
          has_prive_trust?: boolean
          id?: string
          identity_verified?: boolean
          reviews_received_count?: number
          reviews_sent_approved?: number
          reviews_sent_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          achieved_at?: string | null
          average_rating?: number | null
          created_at?: string
          has_prive_trust?: boolean
          id?: string
          identity_verified?: boolean
          reviews_received_count?: number
          reviews_sent_approved?: number
          reviews_sent_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pxp_transactions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          points: number
          review_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          points: number
          review_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          points?: number
          review_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pxp_transactions_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reels_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      reels_settings: {
        Row: {
          auto_play: boolean
          created_at: string
          id: string
          is_enabled: boolean
          items_per_page: number | null
          max_duration: number | null
          show_controls: boolean
          updated_at: string
        }
        Insert: {
          auto_play?: boolean
          created_at?: string
          id?: string
          is_enabled?: boolean
          items_per_page?: number | null
          max_duration?: number | null
          show_controls?: boolean
          updated_at?: string
        }
        Update: {
          auto_play?: boolean
          created_at?: string
          id?: string
          is_enabled?: boolean
          items_per_page?: number | null
          max_duration?: number | null
          show_controls?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          appointment_id: string
          created_at: string
          description: string
          id: string
          improvement_points: string | null
          is_approved: boolean | null
          negative_points: string | null
          overall_rating: number
          positive_points: string | null
          published_at: string | null
          reviewed_id: string
          reviewer_id: string
          reviewer_type: string
          status: string
          updated_at: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          description: string
          id?: string
          improvement_points?: string | null
          is_approved?: boolean | null
          negative_points?: string | null
          overall_rating: number
          positive_points?: string | null
          published_at?: string | null
          reviewed_id: string
          reviewer_id: string
          reviewer_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          description?: string
          id?: string
          improvement_points?: string | null
          is_approved?: boolean | null
          negative_points?: string | null
          overall_rating?: number
          positive_points?: string | null
          published_at?: string | null
          reviewed_id?: string
          reviewer_id?: string
          reviewer_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          duration: number
          id: string
          is_active: boolean
          max_people: number
          model_id: string
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration?: number
          id?: string
          is_active?: boolean
          max_people?: number
          model_id: string
          name: string
          price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: number
          id?: string
          is_active?: boolean
          max_people?: number
          model_id?: string
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
        ]
      }
      system_users: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          name: string | null
          phone: string | null
          plan_id: string | null
          profile_photo_url: string | null
          updated_at: string
          user_id: string | null
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          name?: string | null
          phone?: string | null
          plan_id?: string | null
          profile_photo_url?: string | null
          updated_at?: string
          user_id?: string | null
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          name?: string | null
          phone?: string | null
          plan_id?: string | null
          profile_photo_url?: string | null
          updated_at?: string
          user_id?: string | null
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "fk_system_users_plan"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "system_users_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      typing_indicators: {
        Row: {
          conversation_id: string
          id: string
          is_typing: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          is_typing?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          is_typing?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "typing_indicators_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_pxp: {
        Row: {
          created_at: string
          current_level: number
          current_points: number
          id: string
          total_earned: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_level?: number
          current_points?: number
          id?: string
          total_earned?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_level?: number
          current_points?: number
          id?: string
          total_earned?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_connections: {
        Row: {
          created_at: string
          id: string
          instance_id: string
          is_connected: boolean
          last_activity_at: string | null
          phone_number: string
          qr_code: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          instance_id: string
          is_connected?: boolean
          last_activity_at?: string | null
          phone_number: string
          qr_code?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          instance_id?: string
          is_connected?: boolean
          last_activity_at?: string | null
          phone_number?: string
          qr_code?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_notifications: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message: string
          notification_type: string
          sent_at: string | null
          status: string
          title: string
          user_id: string
          whatsapp_message_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message: string
          notification_type: string
          sent_at?: string | null
          status?: string
          title: string
          user_id: string
          whatsapp_message_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message?: string
          notification_type?: string
          sent_at?: string | null
          status?: string
          title?: string
          user_id?: string
          whatsapp_message_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_level: {
        Args: { points: number }
        Returns: number
      }
      check_model_should_be_online: {
        Args: { model_id_param: string }
        Returns: boolean
      }
      cleanup_old_typing_indicators: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_recurring_appointments: {
        Args: {
          _appointment_id: string
          _recurrence_type: string
          _recurrence_end_date: string
        }
        Returns: undefined
      }
      ensure_model_chat_user: {
        Args: { model_id: string }
        Returns: string
      }
      get_current_user_plan: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_by_username: {
        Args: { username_to_find: string }
        Returns: {
          id: string
          user_id: string
          chat_display_name: string
          username: string
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_username_available: {
        Args: { username_to_check: string }
        Returns: boolean
      }
      update_model_online_status: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      user_has_plan_access: {
        Args: { _user_id: string; _allowed_plan_ids: string[] }
        Returns: boolean
      }
    }
    Enums: {
      menu_type: "url" | "category"
      message_status: "sent" | "delivered" | "read"
      message_type: "text" | "image" | "video" | "audio" | "file"
      user_role: "admin" | "modelo" | "cliente"
      user_type: "guest" | "authenticated" | "all"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      menu_type: ["url", "category"],
      message_status: ["sent", "delivered", "read"],
      message_type: ["text", "image", "video", "audio", "file"],
      user_role: ["admin", "modelo", "cliente"],
      user_type: ["guest", "authenticated", "all"],
    },
  },
} as const
