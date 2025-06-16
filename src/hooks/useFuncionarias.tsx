import useSWR from 'swr';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Funcionaria } from './types'; // Supondo que você tenha um arquivo de tipos

// 1. Criamos um "fetcher" reutilizável para o SWR
const fetcher = async (key: string) => {
    const { data, error } = await supabase
        .from(key) // Usamos a chave (key) como nome da tabela
        .select('*')
        .order('nome');

    if (error) {
        throw new Error(error.message);
    }
    return data as Funcionaria[];
};

export function useFuncionarias() {
    // 2. SWR agora é a ÚNICA fonte de dados
    const { data: funcionarias, error, mutate } = useSWR('funcionarias', fetcher);
    const { toast } = useToast();

    // 3. A função de criar agora usa 'mutate' para atualizar a lista
    const createFuncionaria = async (funcionariaData: Omit<Funcionaria, 'id'>) => {
        try {
            const { data, error } = await supabase
                .from('funcionarias')
                .insert([funcionariaData])
                .select()
                .single();

            if (error) throw error;

            toast({
                title: 'Funcionária cadastrada',
                description: 'Nova funcionária adicionada com sucesso!',
            });
            
            // Avisa ao SWR para buscar os dados novamente, atualizando a tela
            await mutate(); 
            return data;

        } catch (error: any) {
            toast({ title: 'Erro ao cadastrar', description: error.message, variant: 'destructive' });
            throw error;
        }
    };

    // 4. A função de atualizar também usa 'mutate'
    const updateFuncionaria = async (id: string, funcionariaData: Partial<Funcionaria>) => {
        try {
            const { data, error } = await supabase
                .from('funcionarias')
                .update(funcionariaData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            
            toast({
                title: 'Funcionária atualizada',
                description: 'Dados atualizados com sucesso!',
            });

            // Atualiza os dados locais do SWR sem precisar de um novo fetch
            mutate(currentData => {
                if (!currentData) return [];
                return currentData.map(f => (f.id === id ? data : f));
            }, false); // O 'false' impede um refetch imediato desnecessário

            return data;

        } catch (error: any) {
            toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
            throw error;
        }
    };

    // 5. Retornamos os dados e funções de forma limpa
    return {
        funcionarias: funcionarias || [],
        loading: !error && !funcionarias, // O loading é derivado do estado do SWR
        error,
        createFuncionaria,
        updateFuncionaria,
        mutate, // Exportamos o mutate para uso externo (como na alteração em massa)
    };
}