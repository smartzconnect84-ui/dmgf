export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      content_blocks: {
        Row: {
          block_key: string
          id: string
          kind: string
          label: string
          page: string
          sort_order: number
          updated_at: string
          value: string | null
        }
        Insert: {
          block_key: string
          id?: string
          kind?: string
          label: string
          page: string
          sort_order?: number
          updated_at?: string
          value?: string | null
        }
        Update: {
          block_key?: string
          id?: string
          kind?: string
          label?: string
          page?: string
          sort_order?: number
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount_usd: number
          created_at: string
          donor_email: string | null
          donor_name: string
          id: string
          method: string | null
          note: string | null
          received_at: string
          status: string
          updated_at: string
        }
        Insert: {
          amount_usd: number
          created_at?: string
          donor_email?: string | null
          donor_name: string
          id?: string
          method?: string | null
          note?: string | null
          received_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount_usd?: number
          created_at?: string
          donor_email?: string | null
          donor_name?: string
          id?: string
          method?: string | null
          note?: string | null
          received_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      form_submissions: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_read: boolean
          kind: Database["public"]["Enums"]["submission_kind"]
          message: string | null
          name: string | null
          payload: Json | null
          phone: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_read?: boolean
          kind: Database["public"]["Enums"]["submission_kind"]
          message?: string | null
          name?: string | null
          payload?: Json | null
          phone?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_read?: boolean
          kind?: Database["public"]["Enums"]["submission_kind"]
          message?: string | null
          name?: string | null
          payload?: Json | null
          phone?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      gallery_items: {
        Row: {
          alt_text: string | null
          caption: string | null
          created_at: string
          id: string
          image_url: string
          is_active: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      hero_banners: {
        Row: {
          body: string
          created_at: string
          cta_label: string
          cta_to: string
          date_text: string | null
          eyebrow: string
          focus_class: string | null
          id: string
          image_url: string
          is_active: boolean
          location: string | null
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          cta_label?: string
          cta_to?: string
          date_text?: string | null
          eyebrow: string
          focus_class?: string | null
          id?: string
          image_url: string
          is_active?: boolean
          location?: string | null
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          cta_label?: string
          cta_to?: string
          date_text?: string | null
          eyebrow?: string
          focus_class?: string | null
          id?: string
          image_url?: string
          is_active?: boolean
          location?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          alt_text: string | null
          content_type: string | null
          created_at: string
          filename: string
          id: string
          public_url: string
          size_bytes: number | null
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          alt_text?: string | null
          content_type?: string | null
          created_at?: string
          filename: string
          id?: string
          public_url: string
          size_bytes?: number | null
          storage_path: string
          uploaded_by?: string | null
        }
        Update: {
          alt_text?: string | null
          content_type?: string | null
          created_at?: string
          filename?: string
          id?: string
          public_url?: string
          size_bytes?: number | null
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          body: string | null
          created_at: string
          date_text: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_highlight: boolean
          location: string | null
          slug: string | null
          sort_order: number
          summary: string | null
          tag: string | null
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          date_text?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_highlight?: boolean
          location?: string | null
          slug?: string | null
          sort_order?: number
          summary?: string | null
          tag?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          date_text?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_highlight?: boolean
          location?: string | null
          slug?: string | null
          sort_order?: number
          summary?: string | null
          tag?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          address: string | null
          email: string | null
          hours: string | null
          id: number
          logo_url: string | null
          payment_mtn_momo: string | null
          payment_orange_money: string | null
          phone_primary: string | null
          phone_secondary: string | null
          phone_whatsapp: string | null
          short_name: string
          site_name: string
          social_facebook: string | null
          social_instagram: string | null
          social_twitter: string | null
          social_youtube: string | null
          tagline: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          email?: string | null
          hours?: string | null
          id?: number
          logo_url?: string | null
          payment_mtn_momo?: string | null
          payment_orange_money?: string | null
          phone_primary?: string | null
          phone_secondary?: string | null
          phone_whatsapp?: string | null
          short_name?: string
          site_name?: string
          social_facebook?: string | null
          social_instagram?: string | null
          social_twitter?: string | null
          social_youtube?: string | null
          tagline?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          email?: string | null
          hours?: string | null
          id?: number
          logo_url?: string | null
          payment_mtn_momo?: string | null
          payment_orange_money?: string | null
          phone_primary?: string | null
          phone_secondary?: string | null
          phone_whatsapp?: string | null
          short_name?: string
          site_name?: string
          social_facebook?: string | null
          social_instagram?: string | null
          social_twitter?: string | null
          social_youtube?: string | null
          tagline?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          bio: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          photo_url: string | null
          role_title: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          photo_url?: string | null
          role_title: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          photo_url?: string | null
          role_title?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_roles: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "editor"
        | "ceo"
        | "global_director"
        | "communication_director"
        | "program_director"
        | "financial_director"
        | "brand_ambassador"
        | "volunteer"
      submission_kind: "contact" | "volunteer" | "newsletter"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: [
        "admin",
        "editor",
        "ceo",
        "global_director",
        "communication_director",
        "program_director",
        "financial_director",
        "brand_ambassador",
        "volunteer",
      ],
      submission_kind: ["contact", "volunteer", "newsletter"],
    },
  },
} as const
