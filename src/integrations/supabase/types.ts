export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      custom_fields: {
        Row: {
          created_at: string
          display_order: number
          field_name: string
          field_type: string
          help_text: string | null
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
          created_at?: string
          display_order?: number
          field_name: string
          field_type: string
          help_text?: string | null
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
          created_at?: string
          display_order?: number
          field_name?: string
          field_type?: string
          help_text?: string | null
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
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
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
      model_photos: {
        Row: {
          allowed_plan_ids: string[] | null
          created_at: string
          display_order: number | null
          id: string
          is_primary: boolean | null
          model_id: string
          photo_url: string
          show_in_gallery: boolean | null
          show_in_profile: boolean | null
          visibility_type: string | null
        }
        Insert: {
          allowed_plan_ids?: string[] | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_primary?: boolean | null
          model_id: string
          photo_url: string
          show_in_gallery?: boolean | null
          show_in_profile?: boolean | null
          visibility_type?: string | null
        }
        Update: {
          allowed_plan_ids?: string[] | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_primary?: boolean | null
          model_id?: string
          photo_url?: string
          show_in_gallery?: boolean | null
          show_in_profile?: boolean | null
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
          display_order: number | null
          duration: number | null
          id: string
          is_active: boolean | null
          is_featured_in_reels: boolean | null
          model_id: string
          show_in_gallery: boolean | null
          show_in_profile: boolean | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string
          video_url: string
          visibility_type: string | null
        }
        Insert: {
          allowed_plan_ids?: string[] | null
          created_at?: string
          display_order?: number | null
          duration?: number | null
          id?: string
          is_active?: boolean | null
          is_featured_in_reels?: boolean | null
          model_id: string
          show_in_gallery?: boolean | null
          show_in_profile?: boolean | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          video_url: string
          visibility_type?: string | null
        }
        Update: {
          allowed_plan_ids?: string[] | null
          created_at?: string
          display_order?: number | null
          duration?: number | null
          id?: string
          is_active?: boolean | null
          is_featured_in_reels?: boolean | null
          model_id?: string
          show_in_gallery?: boolean | null
          show_in_profile?: boolean | null
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
          garganta: boolean | null
          grava: boolean | null
          height: string | null
          hip: string | null
          hotel: boolean | null
          id: string
          is_active: boolean | null
          jantar: boolean | null
          languages: string | null
          motel: boolean | null
          name: string
          neighborhood: string | null
          nuru: boolean | null
          olhos: string | null
          onlyfans: boolean | null
          oral2: boolean | null
          pernoite: number | null
          plataformas: string | null
          privacy: boolean | null
          Privacy: string | null
          shoe_size: string | null
          silicone: boolean | null
          tatuagem: boolean | null
          telegram: boolean | null
          testedecampo: string | null
          updated_at: string
          vaginal2: boolean | null
          videochamada: boolean | null
          visibility_type: string | null
          waist: string | null
          weight: string | null
          whatsapp_number: string | null
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
          garganta?: boolean | null
          grava?: boolean | null
          height?: string | null
          hip?: string | null
          hotel?: boolean | null
          id?: string
          is_active?: boolean | null
          jantar?: boolean | null
          languages?: string | null
          motel?: boolean | null
          name: string
          neighborhood?: string | null
          nuru?: boolean | null
          olhos?: string | null
          onlyfans?: boolean | null
          oral2?: boolean | null
          pernoite?: number | null
          plataformas?: string | null
          privacy?: boolean | null
          Privacy?: string | null
          shoe_size?: string | null
          silicone?: boolean | null
          tatuagem?: boolean | null
          telegram?: boolean | null
          testedecampo?: string | null
          updated_at?: string
          vaginal2?: boolean | null
          videochamada?: boolean | null
          visibility_type?: string | null
          waist?: string | null
          weight?: string | null
          whatsapp_number?: string | null
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
          garganta?: boolean | null
          grava?: boolean | null
          height?: string | null
          hip?: string | null
          hotel?: boolean | null
          id?: string
          is_active?: boolean | null
          jantar?: boolean | null
          languages?: string | null
          motel?: boolean | null
          name?: string
          neighborhood?: string | null
          nuru?: boolean | null
          olhos?: string | null
          onlyfans?: boolean | null
          oral2?: boolean | null
          pernoite?: number | null
          plataformas?: string | null
          privacy?: boolean | null
          Privacy?: string | null
          shoe_size?: string | null
          silicone?: boolean | null
          tatuagem?: boolean | null
          telegram?: boolean | null
          testedecampo?: string | null
          updated_at?: string
          vaginal2?: boolean | null
          videochamada?: boolean | null
          visibility_type?: string | null
          waist?: string | null
          weight?: string | null
          whatsapp_number?: string | null
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
      system_users: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          name: string | null
          phone: string | null
          plan_id: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_plan: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      user_has_plan_access: {
        Args: { _user_id: string; _allowed_plan_ids: string[] }
        Returns: boolean
      }
    }
    Enums: {
      menu_type: "url" | "category"
      user_role: "admin" | "modelo" | "cliente"
      user_type: "guest" | "authenticated" | "all"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      menu_type: ["url", "category"],
      user_role: ["admin", "modelo", "cliente"],
      user_type: ["guest", "authenticated", "all"],
    },
  },
} as const
