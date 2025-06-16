import { useState } from 'react';
import { useRelatorios, type Relatorio } from '@/hooks/useRelatorios';
import { useFuncionarias } from '@/hooks/useFuncionarias';
import { useFaltas } from '@/hooks/useFaltas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BarChart3, Loader2, Download, Eye, Trash2, FilePlus } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export function Relatorios() {
  const { relatorios, loading, createRelatorio, deleteRelatorio } = useRelatorios();
  const { funcionarias } = useFuncionarias();
  const { faltas } = useFaltas();

  const [reportMonth, setReportMonth] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
  const [reportType, setReportType] = useState('folhaDePagamento');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Relatorio | null>(null);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    let dados_json: any = {};
    const [year, month] = reportMonth.split('-');
    const mesReferencia = new Date(parseInt(year), parseInt(month) - 1, 15);

    if (reportType === 'folhaDePagamento') {
      dados_json.funcionarias = funcionarias
        .filter(f => f.status === 'Ativa')
        .map(f => {
          const faltasComDesconto = faltas.filter(falta =>
            falta.id_funcionaria === f.id &&
            new Date(falta.data).getUTCMonth() + 1 === parseInt(month) &&
            new Date(falta.data).getUTCFullYear() === parseInt(year) &&
            falta.desconto_aplicado === true 
          );
          const salarioBase = f.salario_base || 0;
          
          // --- LÓGICA DE DESCONTO CORRIGIDA COM BASE NA SUA REGRA ---
          // Desconto do dia da falta + Descanso Semanal Remunerado (DSR)
          const valorDiario = salarioBase / 30;
          const descontos = faltasComDesconto.length * (valorDiario * 2);

          const custoPassagens = (f.passagens_mensais || 0) * (f.valor_passagem || 0);
          const salarioFinal = salarioBase - descontos;
          return { nome: f.nome, salarioBase, custoPassagens, descontos, salarioFinal, faltas: faltasComDesconto.length };
        });
        dados_json.totais = dados_json.funcionarias.reduce((acc: any, curr: any) => ({
            salarioBase: acc.salarioBase + curr.salarioBase,
            custoPassagens: acc.custoPassagens + curr.custoPassagens,
            descontos: acc.descontos + curr.descontos,
            salarioFinal: acc.salarioFinal + curr.salarioFinal,
        }), { salarioBase: 0, custoPassagens: 0, descontos: 0, salarioFinal: 0 });
    } else if (reportType === 'resumoFaltas') {
        dados_json = faltas
            .filter(falta => new Date(falta.data).getUTCMonth() + 1 === parseInt(month) && new Date(falta.data).getUTCFullYear() === parseInt(year))
            .map(f => ({
                data: new Date(f.data).toLocaleDateString('pt-BR', {timeZone: 'UTC'}),
                funcionaria: funcionarias.find(func => func.id === f.id_funcionaria)?.nome || 'N/A',
                justificativa: f.justificativa ? 'Sim' : 'Não',
                motivo: f.motivo || 'Não especificado'
            }));
    }

    await createRelatorio({
      mes_referencia: mesReferencia.toISOString(),
      tipo_relatorio: reportType,
      dados_json,
    });
    setIsGenerating(false);
  };
  
  const handleExportPDF = (relatorio: Relatorio) => {
    const doc = new jsPDF();
    const mes = new Date(relatorio.mes_referencia).toLocaleString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    const tipo = relatorio.tipo_relatorio === 'folhaDePagamento' ? 'Folha de Pagamento' : 'Resumo de Faltas';

    doc.text(`Relatório - ${tipo}`, 14, 16);
    doc.setFontSize(12);
    doc.text(`Mês de Referência: ${mes.charAt(0).toUpperCase() + mes.slice(1)}`, 14, 22);

    if (relatorio.tipo_relatorio === 'folhaDePagamento') {
        const head = [['Funcionária', 'Sal. Base', 'Passagens', 'Descontos', 'Sal. Final']];
        const body = relatorio.dados_json.funcionarias.map((f: any) => [
            f.nome,
            `R$ ${f.salarioBase.toFixed(2)}`,
            `R$ ${f.custoPassagens.toFixed(2)}`,
            `- R$ ${f.descontos.toFixed(2)}`,
            `R$ ${f.salarioFinal.toFixed(2)}`
        ]);
        autoTable(doc, { startY: 30, head, body });
    } else {
        const head = [['Data', 'Funcionária', 'Justificada', 'Motivo']];
        const body = relatorio.dados_json.map((f: any) => [f.data, f.funcionaria, f.justificativa, f.motivo]);
        autoTable(doc, { startY: 30, head, body });
    }
    
    doc.save(`relatorio_${relatorio.tipo_relatorio}_${mes.replace(' de ', '_')}.pdf`);
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2"><BarChart3 className="h-8 w-8 text-primary"/> Relatórios</h1>
        <p className="text-muted-foreground">Gere e visualize relatórios do sistema</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerar Novo Relatório</CardTitle>
          <CardDescription>Selecione o tipo e o mês para gerar um novo relatório para o sistema.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <div className='flex-1 space-y-2'>
            <Label>Tipo de Relatório</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="folhaDePagamento">Folha de Pagamento</SelectItem>
                <SelectItem value="resumoFaltas">Resumo de Faltas</SelectItem>
              </SelectContent>
            </Select>
          </div>
           <div className='flex-1 space-y-2'>
            <Label>Mês de Referência</Label>
            <Input type="month" value={reportMonth} onChange={(e) => setReportMonth(e.target.value)} />
           </div>
           <div className='flex items-end'>
            <Button onClick={handleGenerateReport} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FilePlus className="mr-2 h-4 w-4" />}
                Gerar Relatório
            </Button>
           </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Relatórios Salvos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : (
          <Table>
            <TableHeader><TableRow><TableHead>Tipo</TableHead><TableHead>Mês Referência</TableHead><TableHead>Gerado em</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
            <TableBody>
              {relatorios.length > 0 ? relatorios.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.tipo_relatorio === 'folhaDePagamento' ? 'Folha de Pagamento' : 'Resumo de Faltas'}</TableCell>
                  <TableCell>{new Date(r.mes_referencia).toLocaleString('pt-BR', {month: 'long', year: 'numeric', timeZone: 'UTC'})}</TableCell>
                  <TableCell>{new Date(r.gerado_em).toLocaleString('pt-BR')}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="icon" className="mr-2" onClick={() => setSelectedReport(r)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" className="mr-2" onClick={() => handleExportPDF(r)}><Download className="h-4 w-4" /></Button>
                    <Button variant="destructive" size="icon" onClick={() => deleteRelatorio(r.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground">Nenhum relatório gerado ainda.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-4xl">
            <DialogHeader>
                <DialogTitle>
                    Visualizar Relatório: {selectedReport?.tipo_relatorio === 'folhaDePagamento' ? 'Folha de Pagamento' : 'Resumo de Faltas'}
                </DialogTitle>
                <p className='text-sm text-muted-foreground'>
                    Mês de referência: {selectedReport && (new Date(selectedReport.mes_referencia).toLocaleString('pt-BR', {month: 'long', year: 'numeric', timeZone: 'UTC'}))}
                </p>
            </DialogHeader>
            {selectedReport?.tipo_relatorio === 'folhaDePagamento' && (
                <div className='space-y-4 py-4'>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Salário Base Total</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">R$ {selectedReport.dados_json.totais.salarioBase.toFixed(2)}</p></CardContent></Card>
                        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Passagens</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">R$ {selectedReport.dados_json.totais.custoPassagens.toFixed(2)}</p></CardContent></Card>
                        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Descontos</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-red-500">- R$ {selectedReport.dados_json.totais.descontos.toFixed(2)}</p></CardContent></Card>
                        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Pagamento Final</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-green-600">R$ {selectedReport.dados_json.totais.salarioFinal.toFixed(2)}</p></CardContent></Card>
                    </div>
                    <Accordion type="single" collapsible className="w-full">
                        {selectedReport.dados_json.funcionarias.map((f:any, i:number) => (
                            <AccordionItem value={`item-${i}`} key={i}>
                                <AccordionTrigger className='text-base'>{f.nome} <span className="text-sm text-muted-foreground ml-auto mr-4">Salário Final:</span><span className='font-semibold'>R$ {f.salarioFinal.toFixed(2)}</span></AccordionTrigger>
                                <AccordionContent>
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-md">
                                        <p><strong>Salário Base:</strong> R$ {f.salarioBase.toFixed(2)}</p>
                                        <p><strong>Custo Passagens:</strong> R$ {f.custoPassagens.toFixed(2)}</p>
                                        <p><strong>Faltas com desconto:</strong> {f.faltas}</p>
                                        <p><strong>Valor do Desconto:</strong> - R$ {f.descontos.toFixed(2)}</p>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            )}
            {selectedReport?.tipo_relatorio === 'resumoFaltas' && (
                 <Table>
                    <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Funcionária</TableHead><TableHead>Justificada</TableHead><TableHead>Motivo</TableHead></TableRow></TableHeader>
                    <TableBody>{selectedReport.dados_json.map((f:any, i:number) => <TableRow key={i}><TableCell>{f.data}</TableCell><TableCell>{f.funcionaria}</TableCell><TableCell>{f.justificativa}</TableCell><TableCell>{f.motivo}</TableCell></TableRow>)}</TableBody>
                 </Table>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}