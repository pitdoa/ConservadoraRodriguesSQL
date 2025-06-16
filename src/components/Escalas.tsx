import { useState } from 'react';
import { useEscalas } from '../hooks/useEscalas';
import { useFuncionarias } from '../hooks/useFuncionarias';
import { useCondominios } from '../hooks/useCondominios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Edit, Trash2, Calendar, Loader2 } from 'lucide-react';

export function Escalas() {
  const { escalas, loading, createEscala, updateEscala, deleteEscala } = useEscalas();
  const { funcionarias, loading: loadingFuncionarias } = useFuncionarias();
  const { condominios, loading: loadingCondominios } = useCondominios();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEscala, setEditingEscala] = useState<any>(null);
  
  const [filtroDia, setFiltroDia] = useState('todos');
  const [filtroFuncionario, setFiltroFuncionario] = useState('todos');
  const [filtroCondominio, setFiltroCondominio] = useState('todos');

  const [formData, setFormData] = useState({
    dia_semana: '',
    horas_trabalho: '',
    id_funcionaria: '',
    id_condominio: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!formData.id_funcionaria || !formData.id_condominio) {
      alert("Selecione uma funcionária e um condomínio antes de salvar.");
      return;
    }
  
    try {
      const escalaData = {
        dia_semana: formData.dia_semana,
        horas_trabalho: Number(formData.horas_trabalho),
        id_funcionaria: formData.id_funcionaria,
        id_condominio: formData.id_condominio
      };
  
      if (editingEscala) {
        await updateEscala(editingEscala.id, escalaData);
      } else {
        await createEscala(escalaData as any);
      }
  
      setIsDialogOpen(false);
      setEditingEscala(null);
      setFormData({ dia_semana: '', horas_trabalho: '', id_funcionaria: '', id_condominio: '' });
    } catch (error) {
      console.error('Erro ao salvar escala:', error);
    }
  };
  

  const handleEdit = (escala: any) => {
    setEditingEscala(escala);
    setFormData({
      dia_semana: escala.dia_semana,
      horas_trabalho: escala.horas_trabalho.toString(),
      id_funcionaria: escala.id_funcionaria || '',
      id_condominio: escala.id_condominio || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta escala?')) {
      await deleteEscala(id);
    }
  };

  const resetForm = () => {
    setFormData({ dia_semana: '', horas_trabalho: '', id_funcionaria: '', id_condominio: '' });
    setEditingEscala(null);
  };

  const anyLoading = loading || loadingFuncionarias || loadingCondominios;

  if (anyLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // --- FILTRAGEM DE ATIVOS PARA OS MENUS DE SELEÇÃO ---
  const funcionariasAtivas = funcionarias.filter(f => f.status === 'Ativa');
  const condominiosAtivos = condominios.filter(c => c.status === 'Ativo');

  const escalasFiltradas = escalas.filter(escala => {
    const matchDia = filtroDia === 'todos' || escala.dia_semana === filtroDia;
    const matchFuncionario = filtroFuncionario === 'todos' || escala.id_funcionaria === filtroFuncionario;
    const matchCondominio = filtroCondominio === 'todos' || escala.id_condominio === filtroCondominio;
    return matchDia && matchFuncionario && matchCondominio;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold text-foreground">Escalas de Trabalho</h1>
            <p className="text-muted-foreground">Gerencie as escalas das funcionárias</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Escala
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingEscala ? 'Editar Escala' : 'Nova Escala'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dia_semana">Dia da Semana</Label>
                <Select
                  value={formData.dia_semana}
                  onValueChange={(value) => setFormData({ ...formData, dia_semana: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um dia" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"].map((dia) => (
                      <SelectItem key={dia} value={dia}>{dia}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="horas_trabalho">Horas de Trabalho</Label>
                <Input
                  id="horas_trabalho"
                  type="number"
                  step="0.5"
                  value={formData.horas_trabalho}
                  onChange={(e) => setFormData({ ...formData, horas_trabalho: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="funcionaria">Funcionária</Label>
                <Select
                  value={formData.id_funcionaria}
                  onValueChange={(value) => setFormData({ ...formData, id_funcionaria: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma funcionária" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Exibe apenas funcionárias ativas */}
                    {funcionariasAtivas.map((funcionaria) => (
                      <SelectItem
                        key={funcionaria.id}
                        value={funcionaria.id}
                      >
                        {funcionaria.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condominio">Condomínio</Label>
                <Select
                  value={formData.id_condominio}
                  onValueChange={(value) => setFormData({ ...formData, id_condominio: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um condomínio" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Exibe apenas condomínios ativos */}
                    {condominiosAtivos.map((condominio) => (
                      <SelectItem
                        key={condominio.id}
                        value={condominio.id}
                      >
                        {condominio.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingEscala ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Filtros de Pesquisa</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
                <Label>Dia da Semana</Label>
                <Select value={filtroDia} onValueChange={setFiltroDia}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos">Todos os dias</SelectItem>
                        {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"].map(dia => (
                            <SelectItem key={dia} value={dia}>{dia}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex-1 space-y-2">
                <Label>Funcionária</Label>
                <Select value={filtroFuncionario} onValueChange={setFiltroFuncionario}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos">Todas as funcionárias</SelectItem>
                        {funcionariasAtivas.map(f => (
                            <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex-1 space-y-2">
                <Label>Condomínio</Label>
                <Select value={filtroCondominio} onValueChange={setFiltroCondominio}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos">Todos os condomínios</SelectItem>
                         {condominiosAtivos.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle>Lista de Escalas ({escalasFiltradas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dia</TableHead>
                <TableHead>Funcionária</TableHead>
                <TableHead>Condomínio</TableHead>
                <TableHead>Horas</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {escalasFiltradas.length > 0 ? (
                escalasFiltradas.map((escala) => (
                    <TableRow key={escala.id}>
                    <TableCell>{escala.dia_semana}</TableCell>
                    <TableCell>{escala.funcionaria?.nome || 'N/A'}</TableCell>
                    <TableCell>{escala.condominio?.nome || 'N/A'}</TableCell>
                    <TableCell>{escala.horas_trabalho}h</TableCell>
                    <TableCell>
                        <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(escala)}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(escala.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        </div>
                    </TableCell>
                    </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        Nenhuma escala encontrada com os filtros selecionados.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
