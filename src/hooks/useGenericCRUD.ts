import useSWR from 'swr';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/apiClient';

/**
 * Um hook genérico e reutilizável para operações CRUD (Create, Read, Update, Delete).
 * @param endpoint O endpoint da API para o recurso (ex: '/condominios').
 */
export function useGenericCRUD<T extends { id: any }>(endpoint: string) {
    // Função que busca os dados na API
    const fetcher = () => apiClient.get<T[]>(endpoint);

    // O useSWR gerencia o cache, revalidação e estado dos dados (loading, error)
    const { data, error, mutate, isLoading } = useSWR(endpoint, fetcher);
    
    const { toast } = useToast();
    
    // Pega o nome do recurso a partir do endpoint para usar nas mensagens
    // Ex: '/condominios' vira 'condominio'
    const resourceName = endpoint.replace('/', '').slice(0, -1);

    // Função para CRIAR um novo item
    const create = async (item: Omit<T, 'id'>) => {
        try {
            await apiClient.post(endpoint, item);
            toast({ title: 'Sucesso!', description: `${resourceName} criado(a) com sucesso.` });
            await mutate(); // Pede ao SWR para buscar os dados novamente e atualizar a tela
        } catch (err: any) {
            toast({ title: 'Erro ao criar', description: err.message, variant: 'destructive' });
        }
    };

    // Função para ATUALIZAR um item existente
    const update = async (id: T['id'], item: Partial<T>) => {
        try {
            await apiClient.put(`${endpoint}/${id}`, item);
            toast({ title: 'Sucesso!', description: `${resourceName} atualizado(a) com sucesso.` });
            await mutate();
        } catch (err: any) {
            toast({ title: 'Erro ao atualizar', description: err.message, variant: 'destructive' });
        }
    };

    // Função para REMOVER um item
    const remove = async (id: T['id']) => {
        try {
            await apiClient.delete(`${endpoint}/${id}`);
            toast({ title: 'Sucesso!', description: `${resourceName} excluído(a) com sucesso.` });
            await mutate();
        } catch (err: any) {
            toast({ title: 'Erro ao excluir', description: err.message, variant: 'destructive' });
        }
    };

    // Retorna os dados e as funções para serem usados nos componentes
    return { 
        data: data || [], // Retorna os dados ou um array vazio se ainda estiver carregando
        loading: isLoading, 
        error, 
        create, 
        update, 
        remove 
    };
}