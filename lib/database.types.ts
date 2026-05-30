// Tipi del database Supabase — generati da `supabase gen types` (fonte di verità).
// NON modificare a mano la sezione generata: rigenerare dopo ogni migration con
//   supabase gen types typescript --project-id <ref> > lib/database.types.ts
// In coda al file sono definiti enum applicativi e alias di comodo (sezione manuale).

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Le colonne di stato/tipo sono `text` con CHECK in Postgres: i tipi generati le
// espongono come `string`. Qui definiamo gli union applicativi e li applichiamo
// alle colonne corrispondenti nel tipo `Database` (pattern consigliato Supabase).
export type UserStatus = "active" | "inactive"
export type SocioStatus = "active" | "inactive"
export type DiscountType = "percentage" | "fixed_amount" | "custom"
export type DiscountStatus = "active" | "inactive" | "expired" | "cancelled"
export type SocioDiscountStatus = "active" | "used" | "expired" | "cancelled"

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      discount_usages: {
        Row: {
          created_at: string
          discount_id: string
          id: string
          note: string | null
          socio_discount_id: string | null
          socio_id: string
          updated_at: string
          used_at: string
          used_by_member_id: string | null
        }
        Insert: {
          created_at?: string
          discount_id: string
          id?: string
          note?: string | null
          socio_discount_id?: string | null
          socio_id: string
          updated_at?: string
          used_at?: string
          used_by_member_id?: string | null
        }
        Update: {
          created_at?: string
          discount_id?: string
          id?: string
          note?: string | null
          socio_discount_id?: string | null
          socio_id?: string
          updated_at?: string
          used_at?: string
          used_by_member_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discount_usages_discount_id_fkey"
            columns: ["discount_id"]
            isOneToOne: false
            referencedRelation: "discounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_usages_socio_discount_id_fkey"
            columns: ["socio_discount_id"]
            isOneToOne: false
            referencedRelation: "socio_discounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_usages_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "socio_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_usages_used_by_member_id_fkey"
            columns: ["used_by_member_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      discounts: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          expiry_date: string | null
          id: string
          start_date: string | null
          status: DiscountStatus
          title: string
          type: DiscountType
          updated_at: string
          usage_limit: number | null
          value: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          start_date?: string | null
          status?: DiscountStatus
          title: string
          type: DiscountType
          updated_at?: string
          usage_limit?: number | null
          value?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          start_date?: string | null
          status?: DiscountStatus
          title?: string
          type?: DiscountType
          updated_at?: string
          usage_limit?: number | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "discounts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          created_at: string
          id: string
          label: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission_id: string
          role_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          permission_id: string
          role_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          permission_id?: string
          role_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          id: string
          label: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      socio_discounts: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          created_at: string
          discount_id: string
          id: string
          socio_id: string
          status: SocioDiscountStatus
          updated_at: string
          used_at: string | null
          used_by_member_id: string | null
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          discount_id: string
          id?: string
          socio_id: string
          status?: SocioDiscountStatus
          updated_at?: string
          used_at?: string | null
          used_by_member_id?: string | null
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          discount_id?: string
          id?: string
          socio_id?: string
          status?: SocioDiscountStatus
          updated_at?: string
          used_at?: string | null
          used_by_member_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "socio_discounts_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "socio_discounts_discount_id_fkey"
            columns: ["discount_id"]
            isOneToOne: false
            referencedRelation: "discounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "socio_discounts_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "socio_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "socio_discounts_used_by_member_id_fkey"
            columns: ["used_by_member_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      socio_profiles: {
        Row: {
          card_number: string | null
          codice_socio: string
          created_at: string
          id: string
          membership_expiry: string | null
          membership_start: string | null
          qr_token: string
          status: SocioStatus
          updated_at: string
          user_id: string
        }
        Insert: {
          card_number?: string | null
          codice_socio: string
          created_at?: string
          id?: string
          membership_expiry?: string | null
          membership_start?: string | null
          qr_token?: string
          status?: SocioStatus
          updated_at?: string
          user_id: string
        }
        Update: {
          card_number?: string | null
          codice_socio?: string
          created_at?: string
          id?: string
          membership_expiry?: string | null
          membership_start?: string | null
          qr_token?: string
          status?: SocioStatus
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "socio_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          phone: string | null
          role_id: string | null
          status: UserStatus
          surname: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          phone?: string | null
          role_id?: string | null
          status?: UserStatus
          surname?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          role_id?: string | null
          status?: UserStatus
          surname?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      app_role: { Args: never; Returns: string }
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      is_admin: { Args: never; Returns: boolean }
      is_superadmin: { Args: never; Returns: boolean }
      use_discount: {
        Args: { p_note?: string; p_socio_discount_id: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

// ============================================================
// Sezione manuale (NON generata): alias di comodo riusati nel frontend/mobile.
// ============================================================

export type Role = Tables<"roles">
export type Permission = Tables<"permissions">
export type UserRow = Tables<"users">
export type SocioProfile = Tables<"socio_profiles">
export type Discount = Tables<"discounts">
export type SocioDiscount = Tables<"socio_discounts">
export type DiscountUsage = Tables<"discount_usages">
