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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      customers: {
        Row: {
          address: string | null
          city: string | null
          company_name: string
          created_at: string
          customer_type: string | null
          email: string | null
          id: string
          npwp: string | null
          phone: string[] | null
          pic_name: string[] | null
          status: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_name: string
          created_at?: string
          customer_type?: string | null
          email?: string | null
          id?: string
          npwp?: string | null
          phone?: string[] | null
          pic_name?: string[] | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          company_name?: string
          created_at?: string
          customer_type?: string | null
          email?: string | null
          id?: string
          npwp?: string | null
          phone?: string[] | null
          pic_name?: string[] | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          created_by: string | null
          description: string
          expense_date: string
          id: string
          job_order_id: string | null
          notes: string | null
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          amount?: number
          category: string
          created_at?: string
          created_by?: string | null
          description: string
          expense_date?: string
          id?: string
          job_order_id?: string | null
          notes?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          expense_date?: string
          id?: string
          job_order_id?: string | null
          notes?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_job_order_id_fkey"
            columns: ["job_order_id"]
            isOneToOne: false
            referencedRelation: "job_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_dp: {
        Row: {
          bl_number: string | null
          created_at: string
          customer_address: string | null
          customer_city: string | null
          customer_id: string | null
          customer_name: string
          description: string | null
          id: string
          invoice_date: string
          invoice_dp_number: string
          invoice_pib_number: string | null
          notes: string | null
          part_number: number
          status: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          bl_number?: string | null
          created_at?: string
          customer_address?: string | null
          customer_city?: string | null
          customer_id?: string | null
          customer_name: string
          description?: string | null
          id?: string
          invoice_date?: string
          invoice_dp_number: string
          invoice_pib_number?: string | null
          notes?: string | null
          part_number?: number
          status?: string | null
          total_amount?: number
          updated_at?: string
        }
        Update: {
          bl_number?: string | null
          created_at?: string
          customer_address?: string | null
          customer_city?: string | null
          customer_id?: string | null
          customer_name?: string
          description?: string | null
          id?: string
          invoice_date?: string
          invoice_dp_number?: string
          invoice_pib_number?: string | null
          notes?: string | null
          part_number?: number
          status?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_dp_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_dp_items: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          invoice_dp_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          description: string
          id?: string
          invoice_dp_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          invoice_dp_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_dp_items_invoice_dp_id_fkey"
            columns: ["invoice_dp_id"]
            isOneToOne: false
            referencedRelation: "invoice_dp"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          invoice_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          description: string
          id?: string
          invoice_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          bl_number: string | null
          created_at: string
          customer_address: string | null
          customer_city: string | null
          customer_id: string | null
          customer_name: string
          delivery_date: string | null
          description: string | null
          down_payment: number
          flight_vessel: string | null
          id: string
          invoice_date: string
          invoice_number: string
          job_order_id: string | null
          no_aju: string | null
          no_pen: string | null
          notes: string | null
          origin: string | null
          party: string | null
          remaining_amount: number
          status: string | null
          subtotal: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          bl_number?: string | null
          created_at?: string
          customer_address?: string | null
          customer_city?: string | null
          customer_id?: string | null
          customer_name: string
          delivery_date?: string | null
          description?: string | null
          down_payment?: number
          flight_vessel?: string | null
          id?: string
          invoice_date?: string
          invoice_number: string
          job_order_id?: string | null
          no_aju?: string | null
          no_pen?: string | null
          notes?: string | null
          origin?: string | null
          party?: string | null
          remaining_amount?: number
          status?: string | null
          subtotal?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          bl_number?: string | null
          created_at?: string
          customer_address?: string | null
          customer_city?: string | null
          customer_id?: string | null
          customer_name?: string
          delivery_date?: string | null
          description?: string | null
          down_payment?: number
          flight_vessel?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          job_order_id?: string | null
          no_aju?: string | null
          no_pen?: string | null
          notes?: string | null
          origin?: string | null
          party?: string | null
          remaining_amount?: number
          status?: string | null
          subtotal?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_job_order_id_fkey"
            columns: ["job_order_id"]
            isOneToOne: false
            referencedRelation: "job_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      job_orders: {
        Row: {
          aju: string | null
          bl_number: string | null
          created_at: string
          customer_id: string | null
          customer_name: string | null
          eta_kapal: string | null
          exp_do: string | null
          id: string
          job_order_number: string
          lokasi: string | null
          no_invoice: string | null
          notes: string | null
          party: string | null
          payment_status: string | null
          pembayaran_do: string | null
          respond_bc: string | null
          status: string | null
          status_bl: string | null
          status_do: string | null
          total_invoice_amount: number | null
          total_paid_amount: number | null
          tujuan: string | null
          updated_at: string
        }
        Insert: {
          aju?: string | null
          bl_number?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          eta_kapal?: string | null
          exp_do?: string | null
          id?: string
          job_order_number: string
          lokasi?: string | null
          no_invoice?: string | null
          notes?: string | null
          party?: string | null
          payment_status?: string | null
          pembayaran_do?: string | null
          respond_bc?: string | null
          status?: string | null
          status_bl?: string | null
          status_do?: string | null
          total_invoice_amount?: number | null
          total_paid_amount?: number | null
          tujuan?: string | null
          updated_at?: string
        }
        Update: {
          aju?: string | null
          bl_number?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          eta_kapal?: string | null
          exp_do?: string | null
          id?: string
          job_order_number?: string
          lokasi?: string | null
          no_invoice?: string | null
          notes?: string | null
          party?: string | null
          payment_status?: string | null
          pembayaran_do?: string | null
          respond_bc?: string | null
          status?: string | null
          status_bl?: string | null
          status_do?: string | null
          total_invoice_amount?: number | null
          total_paid_amount?: number | null
          tujuan?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      quotation_items: {
        Row: {
          created_at: string
          description: string
          fcl_20_rate: number | null
          fcl_40_rate: number | null
          id: string
          item_no: number
          lcl_rate: number | null
          quotation_id: string
          section: string
        }
        Insert: {
          created_at?: string
          description: string
          fcl_20_rate?: number | null
          fcl_40_rate?: number | null
          id?: string
          item_no: number
          lcl_rate?: number | null
          quotation_id: string
          section: string
        }
        Update: {
          created_at?: string
          description?: string
          fcl_20_rate?: number | null
          fcl_40_rate?: number | null
          id?: string
          item_no?: number
          lcl_rate?: number | null
          quotation_id?: string
          section?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotation_items_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          created_at: string
          customer_address: string | null
          customer_id: string | null
          customer_name: string
          id: string
          notes: string[] | null
          quotation_date: string
          quotation_number: string
          route: string | null
          status: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_address?: string | null
          customer_id?: string | null
          customer_name: string
          id?: string
          notes?: string[] | null
          quotation_date?: string
          quotation_number: string
          route?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_address?: string | null
          customer_id?: string | null
          customer_name?: string
          id?: string
          notes?: string[] | null
          quotation_date?: string
          quotation_number?: string
          route?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      trackings: {
        Row: {
          aju: string | null
          company_name: string
          container_number: string | null
          created_at: string
          depo_kosongan: string | null
          destination: string | null
          driver_name: string | null
          driver_phone: string | null
          id: string
          notes: string | null
          plate_number: string | null
          status: string | null
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          aju?: string | null
          company_name: string
          container_number?: string | null
          created_at?: string
          depo_kosongan?: string | null
          destination?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          id?: string
          notes?: string | null
          plate_number?: string | null
          status?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          aju?: string | null
          company_name?: string
          container_number?: string | null
          created_at?: string
          depo_kosongan?: string | null
          destination?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          id?: string
          notes?: string | null
          plate_number?: string | null
          status?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trackings_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      trucks: {
        Row: {
          capacity: string | null
          created_at: string
          driver_name: string | null
          driver_phone: string | null
          id: string
          plate_number: string
          status: string | null
          truck_id: string
          truck_type: string
          updated_at: string
        }
        Insert: {
          capacity?: string | null
          created_at?: string
          driver_name?: string | null
          driver_phone?: string | null
          id?: string
          plate_number: string
          status?: string | null
          truck_id: string
          truck_type: string
          updated_at?: string
        }
        Update: {
          capacity?: string | null
          created_at?: string
          driver_name?: string | null
          driver_phone?: string | null
          id?: string
          plate_number?: string
          status?: string | null
          truck_id?: string
          truck_type?: string
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
      vendors: {
        Row: {
          address: string | null
          bank_account_name: string | null
          bank_account_number: string | null
          bank_name: string | null
          city: string | null
          company_name: string
          created_at: string
          email: string | null
          id: string
          npwp: string | null
          party: string | null
          phone: string | null
          pic_name: string | null
          services: string | null
          status: string | null
          updated_at: string
          vendor_type: string | null
        }
        Insert: {
          address?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          city?: string | null
          company_name: string
          created_at?: string
          email?: string | null
          id?: string
          npwp?: string | null
          party?: string | null
          phone?: string | null
          pic_name?: string | null
          services?: string | null
          status?: string | null
          updated_at?: string
          vendor_type?: string | null
        }
        Update: {
          address?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          city?: string | null
          company_name?: string
          created_at?: string
          email?: string | null
          id?: string
          npwp?: string | null
          party?: string | null
          phone?: string | null
          pic_name?: string | null
          services?: string | null
          status?: string | null
          updated_at?: string
          vendor_type?: string | null
        }
        Relationships: []
      }
      warehouses: {
        Row: {
          administration: string | null
          cbm: number | null
          created_at: string
          customer_id: string | null
          customer_name: string
          daily_notes: string | null
          description: string | null
          handling_in_out: string | null
          id: string
          notes: string | null
          party: string | null
          quantity: number | null
          status: string | null
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          administration?: string | null
          cbm?: number | null
          created_at?: string
          customer_id?: string | null
          customer_name: string
          daily_notes?: string | null
          description?: string | null
          handling_in_out?: string | null
          id?: string
          notes?: string | null
          party?: string | null
          quantity?: number | null
          status?: string | null
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          administration?: string | null
          cbm?: number | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string
          daily_notes?: string | null
          description?: string | null
          handling_in_out?: string | null
          id?: string
          notes?: string | null
          party?: string | null
          quantity?: number | null
          status?: string | null
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
