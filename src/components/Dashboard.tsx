import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Calendar, AlertTriangle, DollarSign, FileText, Loader2, MapPin } from "lucide-react";
import { useFuncionarias } from "@/hooks/useFuncionarias";
import { useCondominios } from "@/hooks/useCondominios";
import { useFaltas } from "@/hooks/useFaltas";
import { useEscalas } from "@/hooks/useEscalas";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Dashboard() {
  const { funcionarias = [], loading: loadingFuncionarias } = useFuncionarias();
  const { condominios = [], loading: loadingCondominios } = useCondominios();
  const { faltas = [], loading: loadingFaltas } = useFaltas();
  const { escalas = [], loading: loadingEscalas } = useEscalas();

  const isLoading = loadingFuncionarias || loadingCondominios || loadingFaltas || loadingEscalas;

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  
  const nomeMesAtual = hoje.toLocaleString('pt-BR', { month: 'long' });
  const mesCapitalizado = nomeMesAtual.charAt(0).toUpperCase() + nomeMesAtual.slice(1);


  const mapNumeroParaDiaString: { [key: number]: string } = {
    0: 'domingo', 1: 'segunda', 2: 'terça', 3: 'quarta', 4: 'quinta', 5: 'sexta', 6: 'sábado'
  };
  const diaSemanaAtual = mapNumeroParaDiaString[hoje.getDay()];

  const faltasDoMes = faltas.filter(f => {
    if (!f.data) return false;
    const [year, month] = f.data.split('-').map(Number);
    return year === anoAtual && (month - 1) === mesAtual;
  });

  const gastoSalarios = funcionarias.reduce((total, funcionaria) => {
    if (funcionaria.status !== 'Ativa' || !funcionaria.salario_base) return total;
    
    const salarioBase = Number(funcionaria.salario_base) || 0;
    const valorDiario = salarioBase / 30;
    const faltasComDesconto = faltasDoMes.filter(f => f.id_funcionaria === funcionaria.id && f.desconto_aplicado === true);
    const totalDescontos = faltasComDesconto.length * (valorDiario * 2);
    
    return total + (salarioBase - totalDescontos);
  }, 0);

  const totalPassagens = funcionarias.reduce((total, funcionaria) => {
    if (funcionaria.status !== 'Ativa') return total;
    const custoMensal = (funcionaria.passagens_mensais || 0) * (funcionaria.valor_passagem || 0);
    return total + custoMensal;
  }, 0);

  const escalasHoje = escalas.filter(escala => {
    if (!escala.dia_semana) return false;
    const diaDaEscala = escala.dia_semana.trim().toLowerCase().replace('-feira', '');
    return diaDaEscala === diaSemanaAtual;
  });

  const stats = {
    totalFuncionarias: funcionarias.filter(f => f.status === 'Ativa').length,
    totalCondominios: condominios.filter(c => c.status === 'Ativo').length,
    faltasEstesMes: faltasDoMes.length,
    gastoSalarios,
    totalPassagens,
    escalasAtivas: escalas.length
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do sistema da conservadora</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Última atualização</p>
          <p className="font-medium">{hoje.toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard title="Total de Funcionárias" icon={<Users />} value={stats.totalFuncionarias} color="primary" subtitle="Funcionárias ativas" />
        <DashboardCard title="Condomínios Atendidos" icon={<Building2 />} value={stats.totalCondominios} color="secondary" subtitle="Contratos ativos" />
        <DashboardCard title="Faltas Este Mês" icon={<AlertTriangle />} value={stats.faltasEstesMes} color="destructive" subtitle={`Faltas em ${mesCapitalizado}`} />
        <DashboardCard title="Gasto com Salários" icon={<DollarSign />} value={`R$ ${stats.gastoSalarios.toFixed(2)}`} color="primary" subtitle="Valor mensal" />
        <DashboardCard title="Total Passagens" icon={<FileText />} value={`R$ ${stats.totalPassagens.toFixed(2)}`} color="secondary" subtitle="Gastos mensais" />
        <DashboardCard title="Escalas Ativas" icon={<Calendar />} value={stats.escalasAtivas} color="primary" subtitle="Esta semana" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Faltas de {mesCapitalizado}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px] pr-4">
              <div className="space-y-4">
                {faltasDoMes.length > 0 ? (
                  faltasDoMes.map((falta, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{falta.funcionaria?.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(falta.data).toLocaleDateString('pt-BR', {timeZone: 'UTC'})} - {falta.justificativa ? "Com justificativa" : "Sem justificativa"}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${falta.desconto_aplicado ? "bg-destructive/20 text-destructive" : "bg-green-500/20 text-green-600"}`}>
                        {falta.desconto_aplicado ? "Desconto" : "Sem Desconto"}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhuma falta registrada este mês.</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Calendar className="h-5 w-5 text-primary" />
      Escalas de Hoje ({diaSemanaAtual.charAt(0).toUpperCase() + diaSemanaAtual.slice(1)})
    </CardTitle>
  </CardHeader>
  <CardContent>
    <ScrollArea className="h-[240px] pr-4">
      <div className="space-y-4">
        {escalasHoje.length > 0 ? (
          escalasHoje.map((escala) => (
            <div key={escala.id} className="flex items-start justify-between p-3 bg-muted rounded-lg gap-4">
              <div className="flex-1 space-y-1">
                <p className="font-bold text-foreground">{escala.condominio?.nome}</p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2 shrink-0" />
                  <span>{escala.condominio?.endereco || 'Endereço não informado'}</span>
                </div>
                <p className="text-sm text-muted-foreground pt-1">
                  Funcionária: <span className="font-medium text-foreground">{escala.funcionaria?.nome || 'N/A'}</span>
                </p>
                <p className="text-sm text-muted-foreground pt-1">
                  Transporte:{" "}
                  <span className="font-medium text-foreground">
                  {escala.condominio?.transporte_tipo === "onibus"
                    ? `Ônibus: ${escala.condominio?.transporte_onibus_detalhes?.map(d => `${d.linha.toUpperCase()} (${d.tipo.charAt(0).toUpperCase() + d.tipo.slice(1)})`).join(', ')}`
                    : escala.condominio?.transporte_tipo === "veiculo_empresa"
                    ? "Veículo da Empresa"
                    : "Não informado"}
                </span>
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-lg font-bold text-primary whitespace-nowrap">
                  {escala.horas_trabalho}h
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhuma escala para hoje.</p>
        )}
      </div>
    </ScrollArea>
  </CardContent>
</Card>

      </div>
    </div>
  );
}

function DashboardCard({ title, icon, value, subtitle, color }: any) {
  let borderColor = "";
  let textColor = "";

  if (color === "primary") {
    borderColor = "border-l-primary";
    textColor = "text-primary";
  } else if (color === "secondary") {
    borderColor = "border-l-secondary";
    textColor = "text-secondary";
  } else if (color === "destructive") {
    borderColor = "border-l-destructive";
    textColor = "text-destructive";
  }

  return (
    <Card className={`hover:shadow-lg transition-shadow border-l-4 ${borderColor}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`h-4 w-4 ${textColor}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${textColor}`}>{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}