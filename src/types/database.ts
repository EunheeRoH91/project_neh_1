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
      bank_statements: {
        Row: {
          account_number: string
          amount: number
          bank_name: string
          created_at: string | null
          id: string
          reconciliation_status: string
          sender_name: string
          transaction_date: string
        }
        Insert: {
          account_number: string
          amount: number
          bank_name: string
          created_at?: string | null
          id?: string
          reconciliation_status?: string
          sender_name: string
          transaction_date: string
        }
        Update: {
          account_number?: string
          amount?: number
          bank_name?: string
          created_at?: string | null
          id?: string
          reconciliation_status?: string
          sender_name?: string
          transaction_date?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          channel_scope: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          channel_scope?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          channel_scope?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      suspense_amounts: {
        Row: {
          amount: number
          bank_statement_id: string | null
          candidate_partner_ids: Json | null
          conflict_count: number | null
          created_at: string | null
          id: string
          reason: string
          resolved_at: string | null
          resolved_by: string | null
          sender_name: string
          status: string
        }
        Insert: {
          amount: number
          bank_statement_id?: string | null
          candidate_partner_ids?: Json | null
          conflict_count?: number | null
          created_at?: string | null
          id?: string
          reason: string
          resolved_at?: string | null
          resolved_by?: string | null
          sender_name: string
          status?: string
        }
        Update: {
          amount?: number
          bank_statement_id?: string | null
          candidate_partner_ids?: Json | null
          conflict_count?: number | null
          created_at?: string | null
          id?: string
          reason?: string
          resolved_at?: string | null
          resolved_by?: string | null
          sender_name?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "suspense_amounts_bank_statement_id_fkey"
            columns: ["bank_statement_id"]
            isOneToOne: false
            referencedRelation: "bank_statements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suspense_amounts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_auth_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin: { Args: never; Returns: boolean }
      is_admin_or_executive: { Args: never; Returns: boolean }
    }
    Enums: {
      user_role: "admin" | "executive" | "viewer"
    }
  }
}
