import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Estrutura para os detalhes de uma linha de ônibus
export interface OnibusDetalhe {
  linha: string;
  tipo: 'bairro' | 'move';
}

// Estrutura completa de um Condomínio
export interface Condominio {
  id: string;
  nome: string;
  endereco: string;
  status: 'Ativo' | 'Inativo';
  valor_servico: number | null;
  cnpj: string | null;
  sindico: string | null;
  email_sindico: string | null;
  telefone_sindico: string | null;
  vencimento_boleto: number | null;
  transporte_tipo: string | null;
  transporte_onibus_detalhes: OnibusDetalhe[] | null;
  recebe_nota_fiscal: boolean;
  valor_inss: number | null;
}

export function useCondominios() {
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCondominios = async () => {
    try {
      const { data, error } = await supabase
        .from('condominios')
        .select('*')
        .order('nome');

      if (error) throw error;
      setCondominios(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar condomínios",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCondominio = async (condominio: Omit<Condominio, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('condominios')
        .insert([{ ...condominio, status: 'Ativo' }])
        .select()
        .single();

      if (error) throw error;
      await fetchCondominios(); // Garante que a lista seja atualizada
      toast({ title: "Condomínio cadastrado", description: "Condomínio adicionado com sucesso!" });
      return data;
    } catch (error: any) {
      toast({ title: "Erro ao cadastrar condomínio", description: error.message, variant: "destructive" });
      throw error;
    }
  };

  const updateCondominio = async (id: string, condominio: Partial<Condominio>) => {
    try {
      const { data, error } = await supabase
        .from('condominios')
        .update(condominio)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setCondominios(prev => prev.map(c => c.id === id ? data : c));
      toast({ title: "Condomínio atualizado", description: "Dados atualizados com sucesso!" });
      return data;
    } catch (error: any) {
      toast({ title: "Erro ao atualizar condomínio", description: error.message, variant: "destructive" });
      throw error;
    }
  };

  useEffect(() => { fetchCondominios(); }, []);

  return {
    condominios,
    loading,
    createCondominio,
    updateCondominio,
    refetch: fetchCondominios,
  };
}
