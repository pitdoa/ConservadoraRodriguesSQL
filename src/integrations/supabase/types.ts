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
      condominios: {
        Row: {
          contrato_digital: string | null
          endereco: string
          id: string
          nome: string
          recebe_nota_fiscal: boolean | null
          valor_servico: number | null
        }
        Insert: {
          contrato_digital?: string | null
          endereco: string
          id?: string
          nome: string
          recebe_nota_fiscal?: boolean | null
          valor_servico?: number | null
        }
        Update: {
          contrato_digital?: string | null
          endereco?: string
          id?: string
          nome?: string
          recebe_nota_fiscal?: boolean | null
          valor_servico?: number | null
        }
        Relationships: []
      }
      escalas: {
        Row: {
          data: string
          horas_trabalho: number
          id: string
          id_condominio: string | null
          id_funcionaria: string | null
        }
        Insert: {
          data: string
          horas_trabalho: number
          id?: string
          id_condominio?: string | null
          id_funcionaria?: string | null
        }
        Update: {
          data?: string
          horas_trabalho?: number
          id?: string
          id_condominio?: string | null
          id_funcionaria?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escalas_id_condominio_fkey"
            columns: ["id_condominio"]
            isOneToOne: false
            referencedRelation: "condominios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalas_id_funcionaria_fkey"
            columns: ["id_funcionaria"]
            isOneToOne: false
            referencedRelation: "funcionarias"
            referencedColumns: ["id"]
          },
        ]
      }
      faltas: {
        Row: {
          anexo: string | null
          data: string
          desconto_aplicado: boolean | null
          id: string
          id_funcionaria: string | null
          justificativa: boolean | null
          motivo: string | null
        }
        Insert: {
          anexo?: string | null
          data: string
          desconto_aplicado?: boolean | null
          id?: string
          id_funcionaria?: string | null
          justificativa?: boolean | null
          motivo?: string | null
        }
        Update: {
          anexo?: string | null
          data?: string
          desconto_aplicado?: boolean | null
          id?: string
          id_funcionaria?: string | null
          justificativa?: boolean | null
          motivo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faltas_id_funcionaria_fkey"
            columns: ["id_funcionaria"]
            isOneToOne: false
            referencedRelation: "funcionarias"
            referencedColumns: ["id"]
          },
        ]
      }
      funcionarias: {
        Row: {
          cpf: string
          dias_da_semana: string[] | null
          documentos: Json | null
          endereco: string | null
          horas_semanais: number | null
          id: string
          jornada_dias: number | null
          nome: string
          salario_base: number | null
          telefone: string | null
          valor_passagem: number | null
        }
        Insert: {
          cpf: string
          dias_da_semana?: string[] | null
          documentos?: Json | null
          endereco?: string | null
          horas_semanais?: number | null
          id?: string
          jornada_dias?: number | null
          nome: string
          salario_base?: number | null
          telefone?: string | null
          valor_passagem?: number | null
        }
        Update: {
          cpf?: string
          dias_da_semana?: string[] | null
          documentos?: Json | null
          endereco?: string | null
          horas_semanais?: number | null
          id?: string
          jornada_dias?: number | null
          nome?: string
          salario_base?: number | null
          telefone?: string | null
          valor_passagem?: number | null
        }
        Relationships: []
      }
      salarios: {
        Row: {
          id: string
          id_funcionaria: string | null
          mes: string
          salario_base: number | null
          salario_final: number | null
          total_descontos: number | null
          total_passagens: number | null
        }
        Insert: {
          id?: string
          id_funcionaria?: string | null
          mes: string
          salario_base?: number | null
          salario_final?: number | null
          total_descontos?: number | null
          total_passagens?: number | null
        }
        Update: {
          id?: string
          id_funcionaria?: string | null
          mes?: string
          salario_base?: number | null
          salario_final?: number | null
          total_descontos?: number | null
          total_passagens?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "salarios_id_funcionaria_fkey"
            columns: ["id_funcionaria"]
            isOneToOne: false
            referencedRelation: "funcionarias"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          email: string
          id: string
          role: string | null
          senha_hash: string | null
        }
        Insert: {
          email: string
          id?: string
          role?: string | null
          senha_hash?: string | null
        }
        Update: {
          email?: string
          id?: string
          role?: string | null
          senha_hash?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
