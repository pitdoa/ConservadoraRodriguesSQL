import { useState, useEffect, useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Users, Plus, Edit, Eye, Phone, MapPin, Loader2, User, BadgeInfo, Wallet, Bus, Ticket, ShieldCheck, ShieldX, Search, Vote, Baby, Trash2, CalendarPlus, CalendarX, Fingerprint } from "lucide-react";
import { useFuncionarias, type Funcionaria } from "@/hooks/useFuncionarias";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

// Funções de formatação (sem alterações)
const formatCPF = (cpf: string | null) => {
    if (!cpf) return 'Não informado';
    const cleaned = ('' + cpf).replace(/\D/g, '');
    if (cleaned.length !== 11) return cpf;
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/);
    if (match) {
        return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
    }
    return cpf;
};
const formatPhoneNumber = (phone: string | null) => {
    if (!phone) return 'Não informado';
    const cleaned = ('' + phone).replace(/\D/g, '');
    if (cleaned.length === 11) {
        const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
        if (match) { return `(${match[1]}) ${match[2]}-${match[3]}`; }
    }
    if (cleaned.length === 10) {
        const match = cleaned.match(/^(\d{2})(\d{4})(\d{4})$/);
        if (match) { return `(${match[1]}) ${match[2]}-${match[3]}`; }
    }
    return phone;
};
const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não informado';
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR');
}

export function Funcionarias() {
    const { toast } = useToast();
    const { funcionarias, loading, createFuncionaria, updateFuncionaria, mutate } = useFuncionarias();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingFuncionaria, setEditingFuncionaria] = useState<Funcionaria | null>(null);
    const [detalhesFuncionaria, setDetalhesFuncionaria] = useState<Funcionaria | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        nome: '', cpf: '', telefone: '', endereco: '', horas_semanais: '', salario_base: '', valor_passagem: '', passagens_mensais: '', status: 'Ativa' as 'Ativa' | 'Inativa',
        rg: '', pis: '', titulo_eleitor: '', data_de_admissao: '', data_de_desligamento: ''
    });
    const [cpfsFilhos, setCpfsFilhos] = useState<string[]>([]);
    
    const [isBulkUpdateOpen, setIsBulkUpdateOpen] = useState(false);
    const [newFareValue, setNewFareValue] = useState('');
    const [selectedFuncIds, setSelectedFuncIds] = useState<string[]>([]);
    
    const dataDesligamentoRef = useRef<HTMLDivElement>(null);
    const filhosContainerRef = useRef<HTMLDivElement>(null);
    const prevCpfsFilhosCount = useRef(cpfsFilhos.length);

    useEffect(() => {
        if (isDialogOpen && editingFuncionaria) {
            setCpfsFilhos(editingFuncionaria.cpfs_filhos || []);
        } else if (isDialogOpen && !editingFuncionaria) {
            setCpfsFilhos([]);
        }
    }, [isDialogOpen, editingFuncionaria]);
    
    useEffect(() => {
        if (formData.status === 'Inativa') {
            setTimeout(() => {
                dataDesligamentoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }, [formData.status]);

    useEffect(() => {
        if (cpfsFilhos.length > prevCpfsFilhosCount.current) {
            filhosContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
        prevCpfsFilhosCount.current = cpfsFilhos.length;
    }, [cpfsFilhos]);
    
    const handleCpfsChange = (index: number, value: string) => {
        const newCpfs = [...cpfsFilhos];
        newCpfs[index] = value;
        setCpfsFilhos(newCpfs);
    };
    
    const addCpfField = () => setCpfsFilhos([...cpfsFilhos, '']);

    const removeCpfField = (index: number) => {
        const newCpfs = cpfsFilhos.filter((_, i) => i !== index);
        setCpfsFilhos(newCpfs);
    };


    const handleEdit = (funcionaria: Funcionaria) => {
        setDetalhesFuncionaria(null);
        setEditingFuncionaria(funcionaria);
        setFormData({
            nome: funcionaria.nome,
            cpf: funcionaria.cpf,
            telefone: funcionaria.telefone || '',
            endereco: funcionaria.endereco || '',
            horas_semanais: funcionaria.horas_semanais?.toString() || '',
            salario_base: funcionaria.salario_base?.toString() || '',
            valor_passagem: funcionaria.valor_passagem?.toString() || '',
            passagens_mensais: funcionaria.passagens_mensais?.toString() || '',
            status: funcionaria.status || 'Ativa',
            rg: funcionaria.rg || '',
            pis: funcionaria.pis || '',
            titulo_eleitor: funcionaria.titulo_eleitor || '',
            data_de_admissao: funcionaria.data_de_admissao ? funcionaria.data_de_admissao.split('T')[0] : '',
            data_de_desligamento: funcionaria.data_de_desligamento ? funcionaria.data_de_desligamento.split('T')[0] : '',
        });
        setIsDialogOpen(true);
    };

    const handleDetails = (funcionaria: Funcionaria) => {
        setEditingFuncionaria(null);
        setDetalhesFuncionaria(funcionaria);
        setIsDialogOpen(true);
    };

    const handleAddNew = () => {
        setEditingFuncionaria(null);
        setDetalhesFuncionaria(null);
        setFormData({
            nome: '', cpf: '', telefone: '', endereco: '', horas_semanais: '', salario_base: '', valor_passagem: '', passagens_mensais: '', status: 'Ativa',
            rg: '', pis: '', titulo_eleitor: '', data_de_admissao: '', data_de_desligamento: ''
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const requiredFields = { nome: "Nome Completo", cpf: "CPF", endereco: "Endereço", telefone: "Telefone", salario_base: "Salário Base", valor_passagem: "Valor da Passagem", passagens_mensais: "Passagens Mensais" };
        for (const [key, label] of Object.entries(requiredFields)) {
            if (!formData[key as keyof typeof formData] || String(formData[key as keyof typeof formData]).trim() === '') {
                toast({ title: "Campo Obrigatório", description: `Por favor, preencha o campo ${label}.`, variant: "destructive", });
                return;
            }
        }
        
        const funcionariaData = {
            ...formData,
            horas_semanais: formData.horas_semanais ? parseInt(formData.horas_semanais) : null,
            salario_base: formData.salario_base ? parseFloat(formData.salario_base) : null,
            valor_passagem: formData.valor_passagem ? parseFloat(formData.valor_passagem) : null,
            passagens_mensais: formData.passagens_mensais ? parseInt(formData.passagens_mensais) : null,
            cpfs_filhos: cpfsFilhos.map(cpf => cpf.trim()).filter(cpf => cpf),
            data_de_admissao: formData.data_de_admissao || null,
            data_de_desligamento: formData.status === 'Ativa' ? null : formData.data_de_desligamento || null
        };
        try {
            if (editingFuncionaria) {
                await updateFuncionaria(editingFuncionaria.id, funcionariaData);
            } else {
                await createFuncionaria(funcionariaData as Omit<Funcionaria, 'id'>);
            }
            setIsDialogOpen(false);
        } catch (error) { /* handled in hook */ }
    };
    
    const closeDialog = () => {
        setIsDialogOpen(false);
        setDetalhesFuncionaria(null);
        setEditingFuncionaria(null);
    }

    const filteredFuncionarias = funcionarias.filter(f =>
        (f.nome && f.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (f.cpf && f.cpf.replace(/\D/g, '').includes(searchTerm.replace(/\D/g, '')))
    );

    const handleSelectionChange = (funcId: string, isSelected: boolean) => {
        if (isSelected) {
            setSelectedFuncIds(prev => [...prev, funcId]);
        } else {
            setSelectedFuncIds(prev => prev.filter(id => id !== funcId));
        }
    };

    const handleSelectAll = (isSelected: boolean) => {
        if (isSelected) {
            setSelectedFuncIds(funcionarias.map(f => f.id));
        } else {
            setSelectedFuncIds([]);
        }
    };

    const handleBulkUpdateSubmit = async () => {
        const fare = parseFloat(newFareValue);
        if (isNaN(fare) || fare < 0) {
            return toast({ title: "Valor Inválido", description: "Por favor, insira um valor de passagem válido.", variant: "destructive" });
        }
        if (selectedFuncIds.length === 0) {
            return toast({ title: "Nenhuma Seleção", description: "Selecione ao menos uma funcionária para alterar.", variant: "destructive" });
        }

        // Atualiza a UI otimisticamente
        mutate(
            (currentData: Funcionaria[] | undefined) => {
                if (!currentData) return [];
                return currentData.map(f => 
                    selectedFuncIds.includes(f.id) ? { ...f, valor_passagem: fare } : f
                );
            }, 
            false // false = não revalida os dados da API ainda, apenas atualiza o cache local
        );

        const updatePromises = selectedFuncIds.map(id => 
            updateFuncionaria(id, { valor_passagem: fare })
        );

        try {
            await Promise.all(updatePromises);
            toast({ title: "Sucesso!", description: `${selectedFuncIds.length} funcionária(s) tiveram o valor da passagem atualizado.` });
        } catch (error) {
            toast({ title: "Erro", description: "Uma ou mais atualizações falharam. Revertendo dados.", variant: "destructive" });
            mutate(); // Reverte para os dados do servidor em caso de erro
        } finally {
            setIsBulkUpdateOpen(false);
            setSelectedFuncIds([]);
            setNewFareValue('');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3"><Users className="h-8 w-8 text-primary" />Funcionárias</h1>
                    <p className="text-muted-foreground">Gerencie suas funcionárias e suas informações</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isBulkUpdateOpen} onOpenChange={setIsBulkUpdateOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline"><Bus className="w-4 h-4 mr-2" />Alterar Valor da Passagem</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Alterar Valor da Passagem em Massa</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="newFare">Novo Valor da Passagem (R$)</Label>
                                    <Input id="newFare" type="number" step="0.01" placeholder="Ex: 5.75" value={newFareValue} onChange={(e) => setNewFareValue(e.target.value)} />
                                </div>
                                <Separator />
                                <div className="space-y-2">
                                    <Label>Selecione as Funcionárias</Label>
                                    <div className="flex items-center space-x-2 py-2">
                                        <Checkbox id="selectAll" onCheckedChange={handleSelectAll} checked={selectedFuncIds.length === funcionarias.length && funcionarias.length > 0} />
                                        <Label htmlFor="selectAll" className="font-medium">Selecionar Todas</Label>
                                    </div>
                                    <ScrollArea className="h-64 w-full rounded-md border p-4">
                                        <div className="space-y-2">
                                            {funcionarias.map(f => (
                                                <div key={f.id} className="flex items-center space-x-2">
                                                    <Checkbox id={`func-${f.id}`} checked={selectedFuncIds.includes(f.id)} onCheckedChange={(checked) => handleSelectionChange(f.id, Boolean(checked))} />
                                                    <Label htmlFor={`func-${f.id}`} className="font-normal">{f.nome}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsBulkUpdateOpen(false)}>Cancelar</Button>
                                <Button onClick={handleBulkUpdateSubmit}>Salvar Alterações</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isDialogOpen} onOpenChange={open => open ? setIsDialogOpen(true) : closeDialog()}>
                        <DialogTrigger asChild><Button onClick={handleAddNew}><Plus className="w-4 h-4 mr-2" />Nova Funcionária</Button></DialogTrigger>
                        <DialogContent 
                            onPointerDownOutside={(e) => {
                                if (editingFuncionaria || (!editingFuncionaria && !detalhesFuncionaria)) e.preventDefault();
                            }}
                            className={`max-w-4xl flex flex-col ${detalhesFuncionaria ? 'md:max-h-[80vh]' : 'md:h-[90vh]'}`}>
                            <DialogHeader><DialogTitle>{editingFuncionaria ? 'Editar Funcionária' : detalhesFuncionaria ? 'Detalhes da Funcionária' : 'Nova Funcionária'}</DialogTitle></DialogHeader>
                            {detalhesFuncionaria ? (
                                <ScrollArea className="pr-6 -mr-6">
                                    <div className="space-y-6 pt-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">
                                            <div className="flex items-center gap-3"><User className="h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Nome Completo</p><p className="font-medium">{detalhesFuncionaria.nome}</p></div></div>
                                            <div className="flex items-center gap-3"><BadgeInfo className="h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">CPF</p><p className="font-medium">{formatCPF(detalhesFuncionaria.cpf)}</p></div></div>
                                            <div className="flex items-center gap-3"><Fingerprint className="h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">RG</p><p className="font-medium">{detalhesFuncionaria.rg || 'Não informado'}</p></div></div>
                                            <div className="flex items-center gap-3 col-span-full"><MapPin className="h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Endereço</p><p className="font-medium">{detalhesFuncionaria.endereco || 'Não informado'}</p></div></div>
                                            <Separator className="col-span-full" />
                                            <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Telefone</p><p className="font-medium">{formatPhoneNumber(detalhesFuncionaria.telefone)}</p></div></div>
                                            <div className="flex items-center gap-3"><Ticket className="h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">PIS</p><p className="font-medium">{detalhesFuncionaria.pis || 'Não informado'}</p></div></div>
                                            <div className="flex items-center gap-3"><Vote className="h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Título de Eleitor</p><p className="font-medium">{detalhesFuncionaria.titulo_eleitor || 'Não informado'}</p></div></div>
                                            <Separator className="col-span-full" />
                                            <div className="flex items-center gap-3"><CalendarPlus className="h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Data de Admissão</p><p className="font-medium">{formatDate(detalhesFuncionaria.data_de_admissao)}</p></div></div>
                                            {detalhesFuncionaria.status === 'Inativa' && detalhesFuncionaria.data_de_desligamento && 
                                                <div className="flex items-center gap-3"><CalendarX className="h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Data de Desligamento</p><p className="font-medium">{formatDate(detalhesFuncionaria.data_de_desligamento)}</p></div></div>
                                            }
                                            <div className="flex items-center gap-3"><Wallet className="h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Salário Base</p><p className="font-medium">R$ {detalhesFuncionaria.salario_base?.toFixed(2) || '0.00'}</p></div></div>
                                            <div className="flex items-center gap-3"><Bus className="h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Custo Total Passagens</p><p className="font-medium">R$ {((detalhesFuncionaria.valor_passagem || 0) * (detalhesFuncionaria.passagens_mensais || 0)).toFixed(2)}</p></div></div>
                                            <Separator className="col-span-full" />
                                            <div className="flex items-start gap-3 col-span-full"><Baby className="h-5 w-5 text-muted-foreground mt-1" /><div><p className="text-xs text-muted-foreground">Filhos (menores de 14 anos)</p>{(detalhesFuncionaria.cpfs_filhos && detalhesFuncionaria.cpfs_filhos.length > 0 && detalhesFuncionaria.cpfs_filhos[0] !== '') ? (<ul className="list-disc pl-5 font-medium">{detalhesFuncionaria.cpfs_filhos.map((cpf, i) => <li key={i}>{formatCPF(cpf)}</li>)}</ul>) : (<p className="font-medium">Nenhum filho informado</p>)}</div></div>
                                        </div>
                                        <DialogFooter className="pt-4"><Button variant="outline" onClick={closeDialog}>Fechar</Button></DialogFooter>
                                    </div>
                                </ScrollArea>
                            ) : (
                                <>
                                    <ScrollArea className="flex-grow pr-4">
                                        <form id="funcionaria-form" onSubmit={handleSubmit} className="space-y-4 p-1">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-2 col-span-2"><Label htmlFor="nome">Nome Completo <span className="text-red-500">*</span></Label><Input id="nome" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} required placeholder="Ex: Maria da Silva Souza"/></div>
                                                <div className="space-y-2"><Label htmlFor="cpf">CPF <span className="text-red-500">*</span></Label><Input id="cpf" value={formData.cpf} onChange={(e) => setFormData({ ...formData, cpf: e.target.value })} required placeholder="000.000.000-00"/></div>
                                                <div className="space-y-2 col-span-full"><Label htmlFor="endereco">Endereço <span className="text-red-500">*</span></Label><Input id="endereco" value={formData.endereco} onChange={(e) => setFormData({ ...formData, endereco: e.target.value })} required placeholder="Ex: Rua das Flores, 123, Centro"/></div>
                                                <div className="space-y-2"><Label htmlFor="telefone">Telefone <span className="text-red-500">*</span></Label><Input id="telefone" value={formData.telefone} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} required placeholder="(31) 99999-9999"/></div>
                                                <div className="space-y-2"><Label htmlFor="rg">RG</Label><Input id="rg" value={formData.rg} onChange={(e) => setFormData({ ...formData, rg: e.target.value })} placeholder="MG-00.000.000"/></div>
                                                <div className="space-y-2"><Label htmlFor="data_de_admissao">Data de Admissão</Label><Input id="data_de_admissao" type="date" value={formData.data_de_admissao} onChange={(e) => setFormData({ ...formData, data_de_admissao: e.target.value })} /></div>
                                                <div className="space-y-2"><Label htmlFor="pis">PIS</Label><Input id="pis" value={formData.pis} onChange={(e) => setFormData({ ...formData, pis: e.target.value })} placeholder="000.00000.00-0"/></div>
                                                <div className="space-y-2"><Label htmlFor="titulo_eleitor">Título de Eleitor</Label><Input id="titulo_eleitor" value={formData.titulo_eleitor} onChange={(e) => setFormData({ ...formData, titulo_eleitor: e.target.value })} placeholder="0000 1111 2222"/></div>
                                                <div className="space-y-2"><Label htmlFor="salario">Salário Base <span className="text-red-500">*</span></Label><Input id="salario" type="number" step="0.01" value={formData.salario_base} onChange={(e) => setFormData({ ...formData, salario_base: e.target.value })} required placeholder="Ex: 1550.50"/></div>
                                                <div className="space-y-2"><Label htmlFor="valor_passagem">Valor da Passagem <span className="text-red-500">*</span></Label><Input id="valor_passagem" type="number" step="0.01" value={formData.valor_passagem} onChange={(e) => setFormData({ ...formData, valor_passagem: e.target.value })} required placeholder="Ex: 5.75"/></div>
                                                <div className="space-y-2"><Label htmlFor="passagens_mensais">Passagens Mensais <span className="text-red-500">*</span></Label><Input id="passagens_mensais" type="number" value={formData.passagens_mensais} onChange={(e) => setFormData({ ...formData, passagens_mensais: e.target.value })} required placeholder="Ex: 44"/></div>
                                            </div>
                                            <Separator className="my-6"/>
                                            <div ref={filhosContainerRef} className="space-y-4">
                                                <div className="flex flex-col gap-2">
                                                    <Label className="text-base font-medium">Filhos (menores de 14 anos)</Label>
                                                    <Button type="button" variant="outline" size="sm" onClick={addCpfField} className="w-fit"><Plus className="h-4 w-4 mr-2" />Adicionar Filho</Button>
                                                </div>
                                                {cpfsFilhos.map((cpf, index) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <Input placeholder={`CPF do ${index + 1}º filho(a)`} value={cpf} onChange={(e) => handleCpfsChange(index, e.target.value)} />
                                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeCpfField(index)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                                    </div>
                                                ))}
                                            </div>
                                            {editingFuncionaria && (
                                                <>
                                                <Separator className="my-6"/>
                                                <div className="space-y-4">
                                                    <Label className="text-base font-medium">Controle Administrativo</Label>
                                                    <div className="flex items-center space-x-2">
                                                        <Switch id="status" checked={formData.status === 'Ativa'} onCheckedChange={(checked) => { setFormData({ ...formData, status: checked ? 'Ativa' : 'Inativa' }); }} />
                                                        <Label htmlFor="status">Funcionária {formData.status}</Label>
                                                    </div>
                                                    {formData.status === 'Inativa' && (
                                                        <div ref={dataDesligamentoRef} className="space-y-2 mt-4"><Label htmlFor="data_de_desligamento">Data de Desligamento</Label><Input id="data_de_desligamento" type="date" value={formData.data_de_desligamento} onChange={(e) => setFormData({ ...formData, data_de_desligamento: e.target.value })} /></div>
                                                    )}
                                                </div>
                                                </>
                                            )}
                                        </form>
                                    </ScrollArea>
                                    <DialogFooter className="border-t pt-4">
                                        <div className="flex-1" />
                                        <Button type="button" variant="outline" onClick={closeDialog}>Cancelar</Button>
                                        <Button type="submit" form="funcionaria-form">{editingFuncionaria ? 'Salvar Alterações' : 'Cadastrar Funcionária'}</Button>
                                    </DialogFooter>
                                </>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input type="text" placeholder="Pesquisar por nome ou CPF..." className="w-full pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            {loading ? ( <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div> ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredFuncionarias.length > 0 ? (
                    filteredFuncionarias.map(funcionaria => (
                        <Card key={funcionaria.id} className={`hover:shadow-lg transition-all duration-300 border-l-4 ${funcionaria.status === 'Ativa' ? 'border-l-yellow-400 bg-white' : 'border-l-red-300 bg-gray-100 text-muted-foreground'}`}>
                            <CardHeader className="p-6 pb-2">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg text-foreground">{funcionaria.nome}</CardTitle>
                                        <p className="text-sm text-muted-foreground">{formatCPF(funcionaria.cpf)}</p>
                                    </div>
                                    <Badge className={funcionaria.status === 'Ativa' ? 'bg-yellow-400 text-black' : 'bg-red-300 text-black'}>{funcionaria.status}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 pt-4 flex flex-col justify-between flex-1">
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-muted-foreground" /><span>{formatPhoneNumber(funcionaria.telefone)}</span></div>
                                    <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-muted-foreground" /><span>{funcionaria.endereco || 'Endereço não informado'}</span></div>
                                    <div className="flex items-center gap-3"><Bus className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Custo Passagem:</span>
                                        <span className="font-medium">R$ {((funcionaria.passagens_mensais || 0) * (funcionaria.valor_passagem || 0)).toFixed(2)} / mês</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-4">
                                    <Button variant="outline" size="sm" onClick={() => handleEdit(funcionaria)} className="flex-1"><Edit className="w-3 h-3 mr-1" />Editar</Button>
                                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDetails(funcionaria)}><Eye className="w-3 h-3 mr-1" />Detalhes</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <p className="text-muted-foreground col-span-full text-center py-10">Nenhuma funcionária encontrada.</p>
                )}
            </div>
            )}
        </div>
    );
}