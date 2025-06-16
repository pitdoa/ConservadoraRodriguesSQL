import { useState } from 'react';
import { useFaltas } from '@/hooks/useFaltas';
import { useFuncionarias } from '@/hooks/useFuncionarias';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Plus, Edit, Trash2, AlertTriangle, Loader2 } from 'lucide-react';

export function Faltas() {
  const { faltas, loading, createFalta, updateFalta, deleteFalta } = useFaltas();
  const { funcionarias } = useFuncionarias();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFalta, setEditingFalta] = useState<any>(null);
  const [filtroFuncionario, setFiltroFuncionario] = useState('todos');
  const [filtroMes, setFiltroMes] = useState('todos');
  const [formData, setFormData] = useState<{
    data: string;
    motivo: string;
    justificativa: boolean;
    desconto_aplicado: boolean;
    id_funcionaria: string;
  }>({
    data: '',
    motivo: '',
    justificativa: false,
    desconto_aplicado: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!formData.id_funcionaria) {
        alert("Selecione uma funcionária antes de salvar.");
        return;
      }

      if (!formData.justificativa && !formData.desconto_aplicado) {
        alert("Uma falta deve ser justificada ou ter o desconto aplicado. Por favor, selecione uma das opções.");
        return;
      }
      
      const faltaData = {
        data: formData.data,
        motivo: formData.motivo || null,
        justificativa: formData.justificativa,
        desconto_aplicado: formData.desconto_aplicado,
        id_funcionaria: formData.id_funcionaria || null
      };
      
      if (editingFalta) {
        await updateFalta(editingFalta.id, faltaData);
      } else {
        await createFalta(faltaData as any);
      }

      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erro ao salvar falta:', error);
    }
  };

  const handleEdit = (falta: any) => {
    setEditingFalta(falta);
    setFormData({
      data: falta.data,
      motivo: falta.motivo || '',
      justificativa: falta.justificativa || false,
      desconto_aplicado: falta.desconto_aplicado === null ? true : falta.desconto_aplicado,
      id_funcionaria: falta.id_funcionaria || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este registro de falta?')) {
      await deleteFalta(id);
    }
  };

  const resetForm = () => {
    setFormData({
      data: '',
      motivo: '',
      justificativa: false,
      desconto_aplicado: true,
      id_funcionaria: ''
    });
    setEditingFalta(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const faltasFiltradas = faltas.filter(f => {
    const mesmaFunc = !filtroFuncionario || filtroFuncionario === 'todos' || f.id_funcionaria === filtroFuncionario;
    const mesmoMes = !filtroMes || filtroMes === 'todos' || new Date(f.data).getUTCMonth() + 1 === parseInt(filtroMes, 10);
    return mesmaFunc && mesmoMes;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold text-foreground">Registro de Faltas</h1>
            <p className="text-muted-foreground">Gerencie as faltas das funcionárias</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Registrar Falta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingFalta ? 'Editar Falta' : 'Registrar Falta'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">

            <div className="space-y-2">
            <Label htmlFor="data">Data</Label>
            <Input
              id="data"
              type="date"
              required
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
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
                    {funcionarias.map((f) => (
                      <SelectItem key={f.id} value={f.id} disabled={f.status !== 'Ativa'}>
                        {f.nome} {f.status !== 'Ativa' ? '(Inativa)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo da Falta</Label>
                <Textarea
                  id="motivo"
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                  placeholder="Descreva o motivo da falta..."
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="justificativa"
                    checked={formData.justificativa}
                    onCheckedChange={(checked) => {
                        const isChecked = !!checked;
                        setFormData({ ...formData, justificativa: isChecked, desconto_aplicado: !isChecked });
                    }}
                  />
                  <Label htmlFor="justificativa">Falta justificada (sem desconto)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="desconto_aplicado"
                    checked={formData.desconto_aplicado}
                    onCheckedChange={(checked) => {
                        const isChecked = !!checked;
                        setFormData({ ...formData, desconto_aplicado: isChecked, justificativa: !isChecked });
                    }}
                  />
                  <Label htmlFor="desconto_aplicado">Aplicar desconto (não justificada)</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">{editingFalta ? 'Atualizar' : 'Registrar'}</Button>
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
                <Label>Funcionária</Label>
                <Select value={filtroFuncionario} onValueChange={setFiltroFuncionario}>
                    <SelectTrigger><SelectValue placeholder="Todas as funcionárias" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos">Todas as funcionárias</SelectItem>
                        {funcionarias.map(f => (
                            <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex-1 space-y-2">
                <Label>Mês</Label>
                <Select value={filtroMes} onValueChange={setFiltroMes}>
                    <SelectTrigger><SelectValue placeholder="Todos os meses" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos">Todos os meses</SelectItem>
                        {[...Array(12)].map((_, i) => {
                          const monthName = new Date(0, i).toLocaleString('pt-BR', { month: 'long' });
                          const capitalizedMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
                          return (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {capitalizedMonthName}
                            </SelectItem>
                          );
                        })}
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Faltas ({faltasFiltradas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Funcionária</TableHead>
                <TableHead>Justificada</TableHead>
                <TableHead>Desconto Aplicado</TableHead>
                <TableHead>Valor Desconto</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {faltasFiltradas.length > 0 ? (
              faltasFiltradas.map((falta) => (
                <TableRow key={falta.id}>
                  <TableCell>{new Date(falta.data).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</TableCell>
                  <TableCell>{falta.funcionaria?.nome || 'N/A'}</TableCell>
                  <TableCell>
                    {/* --- CORES CORRIGIDAS --- */}
                    <span className={`px-2 py-1 rounded text-xs ${
                      falta.justificativa
                        ? 'bg-green-100 text-green-800'  // Justificada: Sim -> Verde
                        : 'bg-red-100 text-red-800'      // Justificada: Não -> Vermelho
                    }`}>
                      {falta.justificativa ? 'Sim' : 'Não'}
                    </span>
                  </TableCell>
                  <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${
                        falta.desconto_aplicado 
                          ? 'bg-red-100 text-red-800'      // Desconto: Sim -> Vermelho
                          : 'bg-green-100 text-green-800'  // Desconto: Não -> Verde
                      }`}>
                        {falta.desconto_aplicado ? 'Sim' : 'Não'}
                      </span>
                  </TableCell>
                  <TableCell>
                  {(() => {
                    const salario = falta.funcionaria?.salario_base || 0;
                    const aplicavel = falta.desconto_aplicado === true;
                    const valorDia = salario / 30;
                    const desconto = aplicavel ? (valorDia * 2) : 0; 
                    return `R$ ${desconto.toFixed(2)}`;
                  })()}
                </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(falta)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(falta.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
                <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                        Nenhuma falta encontrada com os filtros selecionados.
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