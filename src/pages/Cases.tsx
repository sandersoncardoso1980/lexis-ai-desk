import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { LawFirmService, type LawCase } from "@/services/lawFirmService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Calendar, DollarSign, Scale, Search, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CaseForm } from "@/components/cases/CaseForm";
import { Badge } from "@/components/ui/badge";
import { Briefcase, User } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Cases() {
  const [cases, setCases] = useState<LawCase[]>([]);
  const [filteredCases, setFilteredCases] = useState<LawCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewCaseDialog, setShowNewCaseDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const fetchCases = async () => {
    try {
      setLoading(true);
      const fetchedCases = await LawFirmService.getCases();
      setCases(fetchedCases);
      setFilteredCases(fetchedCases);
    } catch (error) {
      toast({
        title: "Erro ao carregar os casos",
        description: "Não foi possível carregar a lista de casos. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  // Filtro de busca
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCases(cases);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = cases.filter(caseItem => {
      // Busca pelo título do caso
      const titleMatch = caseItem.title?.toLowerCase().includes(query);
      
      // Busca pelo nome do cliente
      const clientNameMatch = caseItem.client?.name?.toLowerCase().includes(query);
      
      // Busca pelo número do caso
      const caseNumberMatch = caseItem.case_number?.toLowerCase().includes(query);
      
      return titleMatch || clientNameMatch || caseNumberMatch;
    });

    setFilteredCases(filtered);
  }, [searchQuery, cases]);

  const handleNewCaseSuccess = () => {
    setShowNewCaseDialog(false);
    fetchCases(); // Recarrega a lista após criar um novo caso
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'closed':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'archived':
        return 'bg-slate-100 text-slate-700 border-slate-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'Aberto'
      case 'in_progress':
        return 'Em Progresso'
      case 'closed':
        return 'Fechado'
      case 'archived':
        return 'Arquivado'
      default:
        return status
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'Urgente'
      case 'high':
        return 'Alta'
      case 'medium':
        return 'Média'
      case 'low':
        return 'Baixa'
      default:
        return priority
    }
  }

  const getCaseTypeLabel = (type: string) => {
    switch (type) {
      case 'civil':
        return 'Civil'
      case 'criminal':
        return 'Criminal'
      case 'family':
        return 'Família'
      case 'commercial':
        return 'Comercial'
      case 'labor':
        return 'Trabalhista'
      case 'tax':
        return 'Tributário'
      case 'administrative':
        return 'Administrativo'
      case 'constitutional':
        return 'Constitucional'
      case 'environmental':
        return 'Ambiental'
      case 'consumer':
        return 'Consumidor'
      case 'real_estate':
        return 'Imobiliário'
      case 'intellectual_property':
        return 'Propriedade Intelectual'
      case 'bankruptcy':
        return 'Falência e Recuperação'
      case 'immigration':
        return 'Imigração'
      case 'other':
        return 'Outros'
      default:
        return type
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Casos</h1>
          <p className="text-muted-foreground mt-1">
            Visualize, crie e gerencie todos os casos do escritório.
          </p>
        </div>
        <Button onClick={() => setShowNewCaseDialog(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Novo Caso
        </Button>
      </div>

      {/* Campo de Busca */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar por título, cliente ou número do caso..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Contador de resultados */}
      {searchQuery && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {filteredCases.length} {filteredCases.length === 1 ? 'caso encontrado' : 'casos encontrados'} 
            {searchQuery && ` para "${searchQuery}"`}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCases.length === 0 ? (
          <div className="col-span-full text-center py-12">
            {searchQuery ? (
              <>
                <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">Nenhum caso encontrado.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Não encontramos casos para "{searchQuery}". Tente outros termos.
                </p>
                <Button variant="outline" onClick={clearSearch} className="mt-4">
                  Limpar busca
                </Button>
              </>
            ) : (
              <>
                <Scale className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">Nenhum caso encontrado.</p>
                <p className="text-sm text-muted-foreground mt-2">Clique em "Novo Caso" para começar.</p>
              </>
            )}
          </div>
        ) : (
          filteredCases.map((caseItem) => (
            <Link key={caseItem.id} to={`/cases/${caseItem.id}`} className="group">
              <Card className="h-full transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-blue-100 hover:border-blue-200 hover:-translate-y-1 cursor-pointer border border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2">
                      {caseItem.title}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-sm text-gray-600 font-medium">
                    Nº {caseItem.case_number}
                  </CardDescription>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge className={`text-xs font-medium ${getStatusColor(caseItem.status)}`}>
                      {getStatusLabel(caseItem.status)}
                    </Badge>
                    <Badge className={`text-xs font-medium ${getPriorityColor(caseItem.priority)}`}>
                      {getPriorityLabel(caseItem.priority)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Scale className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="font-medium">{getCaseTypeLabel(caseItem.case_type)}</span>
                    </div>
                    
                    {caseItem.client && (
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{caseItem.client.name}</span>
                      </div>
                    )}
                    
                    {caseItem.value && (
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                        <span>
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }).format(Number(caseItem.value))}
                        </span>
                      </div>
                    )}
                    
                    {caseItem.start_date && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span>
                          {new Date(caseItem.start_date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {caseItem.description && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {caseItem.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>

      <Dialog open={showNewCaseDialog} onOpenChange={setShowNewCaseDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Novo Caso</DialogTitle>
          </DialogHeader>
          <CaseForm
            onSuccess={handleNewCaseSuccess}
            onCancel={() => setShowNewCaseDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
