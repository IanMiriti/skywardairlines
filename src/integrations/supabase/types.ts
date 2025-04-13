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
      bookings: {
        Row: {
          booking_reference: string
          booking_status: string | null
          created_at: string | null
          email: string
          flight_id: string
          id: string
          id_passport_number: string
          is_round_trip: boolean | null
          passenger_count: number
          passenger_name: string
          payment_method: string | null
          payment_reference: string | null
          payment_status: string | null
          phone_number: string
          return_flight_id: string | null
          special_requests: string | null
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booking_reference: string
          booking_status?: string | null
          created_at?: string | null
          email: string
          flight_id: string
          id?: string
          id_passport_number: string
          is_round_trip?: boolean | null
          passenger_count?: number
          passenger_name: string
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          phone_number: string
          return_flight_id?: string | null
          special_requests?: string | null
          total_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booking_reference?: string
          booking_status?: string | null
          created_at?: string | null
          email?: string
          flight_id?: string
          id?: string
          id_passport_number?: string
          is_round_trip?: boolean | null
          passenger_count?: number
          passenger_name?: string
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          phone_number?: string
          return_flight_id?: string | null
          special_requests?: string | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_flight_id_fkey"
            columns: ["flight_id"]
            isOneToOne: false
            referencedRelation: "flights"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_return_flight_id_fkey"
            columns: ["return_flight_id"]
            isOneToOne: false
            referencedRelation: "flights"
            referencedColumns: ["id"]
          },
        ]
      }
      flights: {
        Row: {
          aircraft: string | null
          airline: Database["public"]["Enums"]["airline"]
          amenities: string[] | null
          arrival_city: string
          arrival_time: string
          available_seats: number
          baggage_allowance: string
          created_at: string | null
          departure_city: string
          departure_time: string
          duration: string
          flight_number: string
          gate: string | null
          id: string
          price: number
          status: Database["public"]["Enums"]["flight_status"] | null
          terminal: string | null
          updated_at: string | null
        }
        Insert: {
          aircraft?: string | null
          airline: Database["public"]["Enums"]["airline"]
          amenities?: string[] | null
          arrival_city: string
          arrival_time: string
          available_seats: number
          baggage_allowance: string
          created_at?: string | null
          departure_city: string
          departure_time: string
          duration: string
          flight_number: string
          gate?: string | null
          id?: string
          price: number
          status?: Database["public"]["Enums"]["flight_status"] | null
          terminal?: string | null
          updated_at?: string | null
        }
        Update: {
          aircraft?: string | null
          airline?: Database["public"]["Enums"]["airline"]
          amenities?: string[] | null
          arrival_city?: string
          arrival_time?: string
          available_seats?: number
          baggage_allowance?: string
          created_at?: string | null
          departure_city?: string
          departure_time?: string
          duration?: string
          flight_number?: string
          gate?: string | null
          id?: string
          price?: number
          status?: Database["public"]["Enums"]["flight_status"] | null
          terminal?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          full_name: string | null
          id: string
          phone_number: string | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          full_name?: string | null
          id: string
          phone_number?: string | null
          role: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone_number?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      set_user_as_admin: {
        Args: { user_email: string }
        Returns: boolean
      }
    }
    Enums: {
      airline:
        | "Kenya Airways"
        | "Jambojet"
        | "Fly540"
        | "SafariLink"
        | "Skyward Express"
        | "AirKenya"
      flight_status:
        | "scheduled"
        | "departed"
        | "arrived"
        | "cancelled"
        | "delayed"
      user_role: "admin" | "user"
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
      airline: [
        "Kenya Airways",
        "Jambojet",
        "Fly540",
        "SafariLink",
        "Skyward Express",
        "AirKenya",
      ],
      flight_status: [
        "scheduled",
        "departed",
        "arrived",
        "cancelled",
        "delayed",
      ],
      user_role: ["admin", "user"],
    },
  },
} as const
