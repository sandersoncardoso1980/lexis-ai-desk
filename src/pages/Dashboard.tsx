import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Scale,
  FileText,
  Clock,
  Plus,
  Calendar,
  Loader2,
  Briefcase,
  AlertCircle,
  CheckCircle,
  CalendarDays,
  UserCheck,
  Search,
  CheckSquare,
  RefreshCw,
} from "lucide-react";
import { LawFirmService } from "@/services/lawFirmService";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";

// ---------- Tipos ----------
interface DashboardData {
  profile: any;
  totalClients: number;
  activeCases: number;
  pendingTasks: number;
  todayAppointments: number;
  recentCases: any[];
  recentTasks: any[];
  upcomingAppointments: any[];
  lastUpdated: string;
}

// ---------- Constantes de Cache ----------
const CACHE_KEY = "dashboard_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos em milissegundos

// ---------- Utilitários de Cache ----------
const getCachedData = (): DashboardData | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const now = new Date().getTime();

    // Verificar se o cache ainda é válido
    if (now - timestamp < CACHE_DURATION) {
      return data;
    }
    
    // Cache expirado, remover
    localStorage.removeItem(CACHE_KEY);
    return null;
  } catch (error) {
    console.error("Erro ao recuperar cache:", error);
    return null;
  }
};

const setCachedData = (data: DashboardData) => {
  try {
    const cacheData = {
      data: {
        ...data,
        lastUpdated: new Date().toISOString()
      },
      timestamp: new Date().getTime()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error("Erro ao salvar cache:", error);
  }
};

const clearCache = () => {
  localStorage.removeItem(CACHE_KEY);
};

// ---------- Skeleton ----------
const DashboardSkeleton = () => (
  <AppLayout 
  title="Dashboard"
  breadcrumbs={[{ label: "Dashboard" }]}>
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-6 w-80" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  </AppLayout>
);

// ---------- Mock Fallback ----------
const getMockData = (): DashboardData => ({
  profile: { full_name: "Advogado Silva" },
  totalClients: 24,
  activeCases: 12,
  pendingTasks: 8,
  todayAppointments: 3,
  recentCases: [
    { id: "1", title: "Contrato Comercial", case_number: "2024-001", status: "open" },
    { id: "2", title: "Divórcio Consensual", case_number: "2024-002", status: "open" },
    { id: "3", title: "Recuperação de Crédito", case_number: "2024-003", status: "in_progress" },
  ],
  recentTasks: [
    { id: "1", title: "Preparar Petição Inicial", status: "pending", priority: "high", due_date: new Date().toISOString().split("T")[0] },
    { id: "2", title: "Reunião com Cliente", status: "pending", priority: "medium", due_date: new Date(Date.now() + 86400000).toISOString().split("T")[0] },
  ],
  upcomingAppointments: [],
  lastUpdated: new Date().toISOString()
});

// ---------- Cores ----------
const statusColor = (s: string) => {
  switch (s) {
    case "open": return "bg-blue-100 text-blue-800";
    case "in_progress": return "bg-yellow-100 text-yellow-800";
    case "closed": return "bg-green-100 text-green-800";
    case "pending": return "bg-orange-100 text-orange-800";
    default: return "bg-gray-100 text-gray-800";
  }
};
const priorityColor = (p: string) => {
  switch (p) {
    case "high": return "bg-red-100 text-red-800";
    case "medium": return "bg-yellow-100 text-yellow-800";
    case "low": return "bg-blue-100 text-blue-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

// ---------- Componente ----------
export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { results, loading: searching } = useGlobalSearch(searchQuery);
  const { toast } = useToast();

  const fetchData = async (forceRefresh = false) => {
    try {
      // Se não for um refresh forçado, tenta usar o cache primeiro
      if (!forceRefresh) {
        const cachedData = getCachedData();
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          return;
        }
      }

      setRefreshing(true);
      
      // Executa todas as chamadas em paralelo para melhor performance
      const [
        profile, 
        clients, 
        cases, 
        tasks, 
        appointments
      ] = await Promise.allSettled([
        LawFirmService.getProfiles(),
        LawFirmService.getClients(),
        LawFirmService.getCases(),
        LawFirmService.getTasks(),
        LawFirmService.getAppointmentsByDateRange(
          new Date().toISOString().split("T")[0], 
          new Date().toISOString().split("T")[0]
        )
      ]);

      const today = new Date().toISOString().split("T")[0];
      const upcomingAppointments = await LawFirmService.getUpcomingAppointments(3).catch(() => []);

      const dashboardData: DashboardData = {
        profile: profile.status === 'fulfilled' && profile.value[0] ? profile.value[0] : { full_name: "Advogado" },
        totalClients: clients.status === 'fulfilled' ? clients.value.length : 0,
        activeCases: cases.status === 'fulfilled' ? cases.value.filter((c: any) => c.status === "open").length : 0,
        pendingTasks: tasks.status === 'fulfilled' ? tasks.value.filter((t: any) => t.status === "pending").length : 0,
        todayAppointments: appointments.status === 'fulfilled' ? appointments.value.length : 0,
        recentCases: cases.status === 'fulfilled' ? cases.value.slice(0, 3) : [],
        recentTasks: tasks.status === 'fulfilled' ? 
          tasks.value.filter((t: any) => t.priority === "high" && t.status === "pending").slice(0, 3) : [],
        upcomingAppointments: upcomingAppointments,
        lastUpdated: new Date().toISOString()
      };

      setData(dashboardData);
      setCachedData(dashboardData);
      
      if (forceRefresh) {
        toast({
          title: "Dados atualizados",
          description: "Dashboard atualizado com sucesso"
        });
      }
    } catch {
      // Fallback para dados mockados em caso de erro
      const mockData = getMockData();
      setData(mockData);
      setCachedData(mockData);
      
      toast({ 
        title: "Erro ao carregar dados", 
        description: "Mostrando informações de demonstração",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    clearCache();
    fetchData(true);
  };

  if (loading || !data) return <DashboardSkeleton />;

  return (
    <AppLayout 
    title="Dashboard"
    breadcrumbs={[{ label: "Dashboard" }]}>
      {/* Header + Busca */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Olá, {data.profile?.full_name?.split(" ")[0] || "Advogado"}</h1>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-8 w-8"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <p className="text-gray-600">Bem-vindo ao seu escritório digital.</p>
          {data.lastUpdated && (
            <p className="text-xs text-gray-400 mt-1">
              Última atualização: {new Date(data.lastUpdated).toLocaleTimeString('pt-BR')}
            </p>
          )}
        </div>
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Digite 3 letras (ex: tar...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />}
          {/* Dropdown */}
          {results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 max-h-96 overflow-auto bg-white border rounded-lg shadow z-20">
              {results.map((item) => (
                <Link
                  key={`${item._type}-${item.id}`}
                  to={
                    item._type === "case"
                      ? `/cases/${item.id}`
                      : item._type === "task"
                      ? `/tasks`
                      : item._type === "client"
                      ? `/clients`
                      : item._type === "appointment"
                      ? `/calendar`
                      : `/documents`
                  }
                  onClick={() => setSearchQuery("")}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    {item._type === "case" && <Briefcase className="h-4 w-4 text-blue-600" />}
                    {item._type === "task" && <CheckSquare className="h-4 w-4 text-orange-600" />}
                    {item._type === "client" && <Users className="h-4 w-4 text-green-600" />}
                    {item._type === "appointment" && <Calendar className="h-4 w-4 text-purple-600" />}
                    {item._type === "document" && <FileText className="h-4 w-4 text-gray-600" />}
                    <div>
                      <p className="font-medium text-sm">{item.title || item.name}</p>
                      {item.case_number && <p className="text-xs text-gray-500">{item.case_number}</p>}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {item._type}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Casos Ativos</CardTitle>
            <Scale className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{data.activeCases}</div>
            <p className="text-xs text-blue-600">em andamento</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Clientes</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{data.totalClients}</div>
            <p className="text-xs text-green-600">cadastrados</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Tarefas Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">{data.pendingTasks}</div>
            <p className="text-xs text-orange-600">para concluir</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Compromissos Hoje</CardTitle>
            <CalendarDays className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">{data.todayAppointments}</div>
            <p className="text-xs text-purple-600">hoje</p>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo Principal */}
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Casos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.recentCases.length ? (
              data.recentCases.map((c) => (
                <Link key={c.id} to={`/cases/${c.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition">
                    <div>
                      <p className="font-medium">{c.title}</p>
                      <p className="text-sm text-gray-500">{c.case_number}</p>
                    </div>
                    <Badge className={statusColor(c.status)}>{c.status}</Badge>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-500">Nenhum caso recente</p>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Tarefas Urgentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.recentTasks.length ? (
              data.recentTasks.map((t) => (
                <Link key={t.id} to="/tasks">
                  <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition">
                    <div>
                      <p className="font-medium">{t.title}</p>
                      <p className="text-sm text-gray-500">Prazo: {new Date(t.due_date).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <Badge className={priorityColor(t.priority)}>{t.priority}</Badge>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-500">Nenhuma tarefa urgente</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}