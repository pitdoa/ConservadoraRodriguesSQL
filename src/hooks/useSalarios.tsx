
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Salario {
  id: string;
  mes: string;
  salario_base: number | null;
  total_passagens: number | null;
  total_descontos: number | null;
  salario_final: number | null;
  id_funcionaria: string | null;
  funcionaria?: {
    nome: string;
  };
}

export function useSalarios() {
  const [salarios, setSalarios] = useState<Salario[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSalarios = async () => {
    try {
      const { data, error } = await supabase
        .from('salarios')
        .select(`
          *,
          funcionaria:funcionarias(nome)
        `)
        .order('mes', { ascending: false });

      if (error) throw error;
      setSalarios(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar salários",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createSalario = async (salario: Omit<Salario, 'id' | 'funcionaria'>) => {
    try {
      const { data, error } = await supabase
        .from('salarios')
        .insert([salario])
        .select(`
          *,
          funcionaria:funcionarias(nome)
        `)
        .single();

      if (error) throw error;

      setSalarios(prev => [data, ...prev]);
      toast({
        title: "Salário cadastrado",
        description: "Salário adicionado com sucesso!",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar salário",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchSalarios();
  }, []);

  return {
    salarios,
    loading,
    createSalario,
    refetch: fetchSalarios,
  };
}
