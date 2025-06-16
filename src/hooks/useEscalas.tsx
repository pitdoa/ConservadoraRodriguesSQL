import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Escala {
  id: string;
  dia_semana: string;
  horas_trabalho: number;
  id_condominio: string | null;
  id_funcionaria: string | null;
  funcionaria?: { nome: string };
  condominio?: {
    nome: string;
    endereco: string;
    transporte_tipo?: string | null;
    transporte_onibus_detalhes?: { linha: string; tipo: 'bairro' | 'move' }[] | null;
  };
}


export function useEscalas() {
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEscalas = async () => {
    try {
      const { data, error } = await supabase
        .from('escalas')
        .select(`
          *,
          funcionaria:funcionarias(nome),
          condominio:condominios(nome, endereco, transporte_tipo, transporte_onibus_detalhes) 
        `)
        .order('dia_semana', { ascending: true });

      if (error) throw error;
      setEscalas(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar escalas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createEscala = async (escala: Omit<Escala, 'id' | 'funcionaria' | 'condominio'>) => {
    try {
      const { data, error } = await supabase
        .from('escalas')
        .insert([escala])
        .select(`
          *,
          funcionaria:funcionarias(nome),
          condominio:condominios(nome, endereco, transporte_tipo, transporte_onibus_detalhes)
        `)
        .single();

      if (error) throw error;

      setEscalas(prev => [data, ...prev]);
      toast({
        title: "Escala cadastrada",
        description: "Escala adicionada com sucesso!",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar escala",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateEscala = async (id: string, escala: Partial<Escala>) => {
    try {
      const { data, error } = await supabase
      .from('escalas')
      .select(`
        *,
        funcionaria:funcionarias(nome),
        condominio:condominios(nome, endereco, transporte_tipo, transporte_onibus_detalhes)
      `)      
      .order('dia_semana', { ascending: true });    

      if (error) throw error;

      setEscalas(prev => prev.map(e => e.id === id ? data : e));
      toast({
        title: "Escala atualizada",
        description: "Dados atualizados com sucesso!",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar escala",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteEscala = async (id: string) => {
    try {
      const { error } = await supabase
        .from('escalas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEscalas(prev => prev.filter(e => e.id !== id));
      toast({
        title: "Escala removida",
        description: "Escala removida com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover escala",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchEscalas();
  }, []);

  return {
    escalas,
    loading,
    createEscala,
    updateEscala,
    deleteEscala,
    refetch: fetchEscalas,
  };
}