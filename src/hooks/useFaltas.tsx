
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Falta {
  id: string;
  data: string;
  motivo: string | null;
  justificativa: boolean | null;
  desconto_aplicado: boolean | null;
  anexo: string | null;
  id_funcionaria: string | null;
  funcionaria?: {
    id: string;
    nome: string;
    salario_base: number;
  };
}

export function useFaltas() {
  const [faltas, setFaltas] = useState<Falta[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFaltas = async () => {
    try {
      const { data, error } = await supabase
        .from('faltas')
        .select(`
          *,
          funcionaria:funcionarias(id, nome, salario_base)
        `)
        
        .order('data', { ascending: false });

      if (error) throw error;
      setFaltas(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar faltas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createFalta = async (falta: Omit<Falta, 'id' | 'funcionaria'>) => {
    try {
      const { data, error } = await supabase
        .from('faltas')
        .insert([falta])
        .select(`
          *,
          funcionaria:funcionarias(id, nome, salario_base)
        `)        
        .single();

      if (error) throw error;

      setFaltas(prev => [data, ...prev]);
      toast({
        title: "Falta registrada",
        description: "Falta adicionada com sucesso!",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Erro ao registrar falta",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateFalta = async (id: string, falta: Partial<Falta>) => {
    try {
      const { data, error } = await supabase
        .from('faltas')
        .update(falta)
        .eq('id', id)
        .select(`
          *,
          funcionaria:funcionarias(id, nome, salario_base)
        `)        
        .single();

      if (error) throw error;

      setFaltas(prev => prev.map(f => f.id === id ? data : f));
      toast({
        title: "Falta atualizada",
        description: "Dados atualizados com sucesso!",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar falta",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteFalta = async (id: string) => {
    try {
      const { error } = await supabase
        .from('faltas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFaltas(prev => prev.filter(f => f.id !== id));
      toast({
        title: "Falta removida",
        description: "Falta removida com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover falta",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchFaltas();
  }, []);

  return {
    faltas,
    loading,
    createFalta,
    updateFalta,
    deleteFalta,
    refetch: fetchFaltas,
  };
}
