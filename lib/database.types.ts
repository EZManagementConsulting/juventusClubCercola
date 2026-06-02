// Tipi del database Supabase — generati da `supabase gen types` (fonte di verità).
// NON modificare a mano la sezione generata: rigenerare dopo ogni migration con
//   supabase gen types typescript --project-id <ref> > scripts/database.types.generated.ts
//   python3 scripts/sync-database-types.py
// In coda al file sono definiti enum applicativi e alias di comodo (sezione manuale).

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserStatus = "active" | "inactive"
export type MemberProfileStatus = "active" | "inactive"
/** @deprecated Usare MemberProfileStatus */
export type SocioStatus = MemberProfileStatus
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
      club_sections: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          next_card_number: number
          status: UserStatus
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          next_card_number?: number
          status?: UserStatus
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          next_card_number?: number
          status?: UserStatus
          updated_at?: string
        }
        Relationships: []
      }
      discount_usage_rules: {
        Row: {
          active: boolean
          config: Json
          created_at: string
          discount_id: string
          id: string
          partner_offer_id: string | null
          rule_type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          config: Json
          created_at?: string
          discount_id: string
          id?: string
          partner_offer_id?: string | null
          rule_type: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          config?: Json
          created_at?: string
          discount_id?: string
          id?: string
          partner_offer_id?: string | null
          rule_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "discount_usage_rules_discount_id_fkey"
            columns: ["discount_id"]
            isOneToOne: false
            referencedRelation: "discounts"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_operators: {
        Row: {
          created_at: string
          discount_id: string
          id: string
          partner_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          discount_id: string
          id?: string
          partner_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          discount_id?: string
          id?: string
          partner_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discount_operators_discount_id_fkey"
            columns: ["discount_id"]
            isOneToOne: false
            referencedRelation: "discounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_operators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_usages: {
        Row: {
          created_at: string
          discount_id: string
          id: string
          note: string | null
          scan_method: string
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
          scan_method?: string
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
          scan_method?: string
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
            referencedRelation: "member_discount_assignments"
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
          address: string | null
          business_hours: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          expiry_date: string | null
          id: string
          latitude: number | null
          longitude: number | null
          phone: string | null
          start_date: string | null
          status: DiscountStatus
          title: string
          type: DiscountType
          updated_at: string
          usage_limit: number | null
          value: number | null
          website: string | null
        }
        Insert: {
          address?: string | null
          business_hours?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          start_date?: string | null
          status?: DiscountStatus
          title: string
          type: DiscountType
          updated_at?: string
          usage_limit?: number | null
          value?: number | null
          website?: string | null
        }
        Update: {
          address?: string | null
          business_hours?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          start_date?: string | null
          status?: DiscountStatus
          title?: string
          type?: DiscountType
          updated_at?: string
          usage_limit?: number | null
          value?: number | null
          website?: string | null
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
      member_discount_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          code_expires_at: string | null
          code_generated_at: string | null
          created_at: string
          discount_id: string
          id: string
          member_profile_id: string
          redeem_code: string | null
          status: SocioDiscountStatus
          updated_at: string
          used_at: string | null
          used_by_member_id: string | null
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          code_expires_at?: string | null
          code_generated_at?: string | null
          created_at?: string
          discount_id: string
          id?: string
          member_profile_id: string
          redeem_code?: string | null
          status?: SocioDiscountStatus
          updated_at?: string
          used_at?: string | null
          used_by_member_id?: string | null
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          code_expires_at?: string | null
          code_generated_at?: string | null
          created_at?: string
          discount_id?: string
          id?: string
          member_profile_id?: string
          redeem_code?: string | null
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
            columns: ["member_profile_id"]
            isOneToOne: false
            referencedRelation: "club_member_profiles"
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
      club_member_profiles: {
        Row: {
          card_number: string | null
          codice_socio: string
          created_at: string
          id: string
          membership_expiry: string | null
          membership_start: string | null
          qr_token: string
          section_id: string
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
          section_id: string
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
          section_id?: string
          status?: SocioStatus
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "socio_profiles_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "club_sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "socio_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          status: string
          title: string
          type: string
          updated_at: string
          value: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          title: string
          type: string
          updated_at?: string
          value?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_offers_discount_template_id_fkey"
            columns: ["id"]
            isOneToOne: false
            referencedRelation: "partner_offers"
            referencedColumns: ["discount_template_id"]
          },
        ]
      }
      partners: {
        Row: {
          address: string | null
          business_hours: Json | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          latitude: number | null
          legacy_discount_id: string | null
          longitude: number | null
          name: string
          phone: string | null
          status: string
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          business_hours?: Json | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number | null
          legacy_discount_id?: string | null
          longitude?: number | null
          name: string
          phone?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          business_hours?: Json | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number | null
          legacy_discount_id?: string | null
          longitude?: number | null
          name?: string
          phone?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_offers_partner_id_fkey"
            columns: ["id"]
            isOneToOne: false
            referencedRelation: "partner_offers"
            referencedColumns: ["partner_id"]
          },
        ]
      }
      partner_offers: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          discount_template_id: string
          expiry_date: string | null
          id: string
          legacy_discount_id: string | null
          partner_id: string
          start_date: string | null
          status: string
          title: string | null
          updated_at: string
          usage_limit: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_template_id: string
          expiry_date?: string | null
          id?: string
          legacy_discount_id?: string | null
          partner_id: string
          start_date?: string | null
          status?: string
          title?: string | null
          updated_at?: string
          usage_limit?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_template_id?: string
          expiry_date?: string | null
          id?: string
          legacy_discount_id?: string | null
          partner_id?: string
          start_date?: string | null
          status?: string
          title?: string | null
          updated_at?: string
          usage_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_offers_discount_template_id_fkey"
            columns: ["discount_template_id"]
            isOneToOne: false
            referencedRelation: "discount_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_offers_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          role_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
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
      socio_discounts: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          code_expires_at: string | null
          code_generated_at: string | null
          created_at: string | null
          discount_id: string | null
          id: string | null
          redeem_code: string | null
          socio_id: string | null
          status: string | null
          updated_at: string | null
          used_at: string | null
          used_by_member_id: string | null
        }
        Relationships: []
      }
      socio_profiles: {
        Row: {
          card_number: string | null
          codice_socio: string | null
          created_at: string | null
          id: string | null
          membership_expiry: string | null
          membership_start: string | null
          qr_token: string | null
          section_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
      discounts_with_partner: {
        Row: {
          address: string | null
          business_hours: Json | null
          discount_description: string | null
          discount_id: string | null
          discount_status: string | null
          discount_template_id: string | null
          discount_title: string | null
          expiry_date: string | null
          latitude: number | null
          longitude: number | null
          offer_status: string | null
          offer_title: string | null
          partner_category: string | null
          partner_id: string | null
          partner_name: string | null
          partner_offer_id: string | null
          partner_status: string | null
          phone: string | null
          start_date: string | null
          template_title: string | null
          template_type: string | null
          template_value: number | null
          type: string | null
          usage_limit: number | null
          value: number | null
          website: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      canonical_app_role: { Args: { p_role: string }; Returns: string }
      partner_id_for_discount: { Args: { p_discount_id: string }; Returns: string }
      partner_offer_id_for_discount: { Args: { p_discount_id: string }; Returns: string }
      app_role: { Args: never; Returns: string }
      app_roles: { Args: never; Returns: string[] }
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      has_app_role: { Args: { p_role: string }; Returns: boolean }
      email_for_card_number: {
        Args: { p_card_number: string }
        Returns: string
      }
      generate_section_card_number: {
        Args: { p_section_id: string }
        Returns: string
      }
      is_admin: { Args: never; Returns: boolean }
      is_superadmin: { Args: never; Returns: boolean }
      use_discount: {
        Args: { p_note?: string; p_socio_discount_id: string }
        Returns: Json
      }
      apply_member_discount: {
        Args: { p_discount_id: string; p_qr_token: string; p_note?: string }
        Returns: Json
      }
      check_discount_usage_window: {
        Args: { p_discount_id: string }
        Returns: Json
      }
      generate_discount_code: {
        Args: { p_discount_id: string }
        Returns: Json
      }
      is_discount_operator: {
        Args: { p_discount_id: string }
        Returns: boolean
      }
      lookup_member_by_qr: {
        Args: { p_qr_token: string }
        Returns: Json
      }
      my_operator_discounts: { Args: never; Returns: Json }
      redeem_discount_code: {
        Args: {
          p_discount_id?: string
          p_note?: string
          p_redeem_code: string
        }
        Returns: Json
      }
      _apply_socio_discount: {
        Args: {
          p_note?: string
          p_operator_id: string
          p_require_operator_discount_id?: string
          p_scan_method?: string
          p_socio_discount_id: string
        }
        Returns: Json
      }
      end_of_today_rome: { Args: never; Returns: string }
      eval_discount_usage_rule: {
        Args: { p_config: Json; p_now?: string; p_rule_type: string }
        Returns: boolean
      }
      format_discount_usage_rules_summary: {
        Args: { p_discount_id: string }
        Returns: string
      }
      generate_unique_redeem_code: { Args: never; Returns: string }
      is_membership_card_valid: {
        Args: { p_socio: Database["public"]["Tables"]["club_member_profiles"]["Row"] }
        Returns: boolean
      }
      renew_club_membership: {
        Args: {
          p_profile_id: string
          p_season_start_year?: number
          p_fee_paid?: boolean
          p_note?: string
        }
        Returns: Json
      }
      usage_rule_failure_message: {
        Args: { p_config: Json; p_rule_type: string }
        Returns: string
      }
      usage_rule_summary_line: {
        Args: { p_config: Json; p_rule_type: string }
        Returns: string
      }
      usage_rule_weekday_label: { Args: { p_day: number }; Returns: string }
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

export type ClubMemberProfile = Tables<"club_member_profiles">
export type Role = Tables<"roles">
export type Permission = Tables<"permissions">
export type UserRow = Tables<"users">
export type ClubSection = Tables<"club_sections">
export type Discount = Tables<"discounts">
export type DiscountTemplate = Tables<"discount_templates">
export type Partner = Tables<"partners">
export type PartnerOffer = Tables<"partner_offers">
export type MemberDiscountAssignment = Tables<"member_discount_assignments">
/** @deprecated Usare MemberDiscountAssignment o vista socio_discounts (solo lettura). */
export type SocioDiscount = MemberDiscountAssignment
export type DiscountUsage = Tables<"discount_usages">
export type DiscountUsageRule = Tables<"discount_usage_rules">
export type DiscountWithPartner = Tables<"discounts_with_partner">
