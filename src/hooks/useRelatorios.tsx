import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Interface para definir o formato de um relatório
export interface Relatorio {
  id: string;
  mes_referencia: string; // Formato YYYY-MM-DD
  tipo_relatorio: string;
  dados_json: any; // Os dados do relatório em formato JSON
  gerado_em: string;
}

export function useRelatorios() {
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Função SELECT para buscar os relatórios no banco
  const fetchRelatorios = useCallback(async () => {
    setLoading(true);
    console.log("Buscando relatórios no Supabase...");
    try {
      const { data, error } = await supabase
        .from('relatorios')
        .select('*')
        .order('gerado_em', { ascending: false });

      if (error) throw error;
      
      console.log("Relatórios recebidos:", data);
      setRelatorios(data || []);
    } catch (error: any) {
      console.error("Erro ao buscar relatórios:", error);
      toast({ title: "Erro ao carregar relatórios", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRelatorios();
  }, [fetchRelatorios]);

  // Função INSERT para criar um novo relatório
  const createRelatorio = async (reportData: Omit<Relatorio, 'id' | 'gerado_em'>) => {
    setLoading(true);
    try {
      const { data: newReport, error } = await supabase
        .from('relatorios')
        .insert([reportData])
        .select('*')
        .single();

      if (error) throw error;

      fetchRelatorios(); // Re-busca a lista para incluir o novo
      toast({ title: "Relatório gerado!", description: "O novo relatório foi salvo com sucesso." });
      return newReport;
    } catch (error: any) {
      toast({ title: "Erro ao salvar relatório", description: error.message, variant: "destructive" });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função DELETE para remover um relatório
  const deleteRelatorio = async (id: string) => {
    try {
      const { error } = await supabase.from('relatorios').delete().eq('id', id);
      if (error) throw error;
      setRelatorios(prev => prev.filter(r => r.id !== id));
      toast({ title: "Relatório removido." });
    } catch (error: any) {
      toast({ title: "Erro ao deletar relatório", description: error.message, variant: "destructive" });
      throw error;
    }
  };

  return { relatorios, loading, createRelatorio, deleteRelatorio };
}