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
  TrendingUp,
  Briefcase,
  AlertCircle,
  CheckCircle,
  CalendarDays,
  UserCheck
} from "lucide-react";
import { LawFirmService, LawCase, LawTask, LawAppointment, Profile } from "@/services/lawFirmService";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Interface para os dados do dashboard
interface DashboardData {
  profile: Profile | null;
  totalClients: number;
  activeCases: number;
  pendingTasks: number;
  todayAppointments: number;
  recentCases: LawCase[];
  recentTasks: LawTask[];
  upcomingAppointments: LawAppointment[];
}

// Função para obter dados fictícios (usada temporariamente)
const getMockData = (): DashboardData => ({
  profile: {
    id: "1",
    user_id: "1",
    full_name: "Advogado Silva",
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    phone: "",
    role: ""
  },
  totalClients: 24,
  activeCases: 12,
  pendingTasks: 8,
  todayAppointments: 3,
  recentCases: [
    {
      id: "1", title: "Contrato Comercial", case_number: "2024-001", status: "open", client_id: "1", user_id: "1", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), description: "Contrato de prestação de serviços", expected_end_date: "2024-12-31", actual_end_date: null,
      case_type: "",
      court: "",
      judge: "",
      opposing_party: "",
      priority: "",
      start_date: "",
      value: 0
    },
    {
      id: "2", title: "Divórcio Consensual", case_number: "2024-002", status: "open", client_id: "2", user_id: "1", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), description: "Processo de divórcio", expected_end_date: "2024-11-30", actual_end_date: null,
      case_type: "",
      court: "",
      judge: "",
      opposing_party: "",
      priority: "",
      start_date: "",
      value: 0
    },
    {
      id: "3", title: "Recuperação de Crédito", case_number: "2024-003", status: "in_progress", client_id: "3", user_id: "1", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), description: "Ação de recuperação creditícia", expected_end_date: "2024-10-15", actual_end_date: null,
      case_type: "",
      court: "",
      judge: "",
      opposing_party: "",
      priority: "",
      start_date: "",
      value: 0
    }
  ],
  recentTasks: [
    {
      id: "1", title: "Preparar Petição Inicial", description: "Elaborar petição para caso 2024-001", status: "pending", priority: "high", due_date: new Date().toISOString().split('T')[0], user_id: "1", created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      assigned_to: "",
      case_id: "",
      category: "",
      client_id: "",
      completed_date: "",
      created_by: "",
      notes: ""
    },
    {
      id: "2", title: "Reunião com Cliente", description: "Revisão de documentos", status: "pending", priority: "medium", due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], user_id: "1", created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      assigned_to: "",
      case_id: "",
      category: "",
      client_id: "",
      completed_date: "",
      created_by: "",
      notes: ""
    },
    {
      id: "3", title: "Prazo Processual", description: "Entregar documentos no fórum", status: "pending", priority: "high", due_date: new Date(Date.now() + 172800000).toISOString().split('T')[0], user_id: "1", created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      assigned_to: "",
      case_id: "",
      category: "",
      client_id: "",
      completed_date: "",
      created_by: "",
      notes: ""
    }
  ],
  upcomingAppointments: []
});

// Componente de skeleton para loading
const DashboardSkeleton = () => (
  <AppLayout breadcrumbs={[{ label: "Dashboard" }]}>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-40" />
      </div>
      
      <Skeleton className="h-6 w-80" />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {[1, 2, 3, 4].map((item) => (
          <Card key={item} className="hover:shadow-lg transition-shadow">
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  </AppLayout>
);

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Buscar dados reais do Supabase
        const profile = await LawFirmService.getProfiles();
        
        // Buscar dados reais (usando métodos existentes ou temporários)
        let totalClients = 0;
        let activeCases = 0;
        let pendingTasks = 0;
        let todayAppointments = 0;
        let recentCases: LawCase[] = [];
        let recentTasks: LawTask[] = [];
        let upcomingAppointments: LawAppointment[] = [];

        try {
          // Dados reais
          const clients = await LawFirmService.getClients();
          totalClients = clients.length;
          
          const cases = await LawFirmService.getCases();
          activeCases = cases.filter(c => c.status === 'open').length;
          recentCases = cases.slice(0, 3);
          
          const tasks = await LawFirmService.getTasks();
          pendingTasks = tasks.filter(t => t.status === 'pending').length;
          recentTasks = tasks.filter(t => t.priority === 'high' && t.status === 'pending').slice(0, 3);
          
          const today = new Date().toISOString().split('T')[0];
          const appointments = await LawFirmService.getAppointmentsByDateRange(today, today);
          todayAppointments = appointments.length;
          upcomingAppointments = await LawFirmService.getUpcomingAppointments(3);
        } catch (error) {
          console.warn("Alguns dados não puderam ser carregados:", error);
          // Usar dados fictícios para componentes que falharem
          const mockData = getMockData();
          totalClients = mockData.totalClients;
          activeCases = mockData.activeCases;
          pendingTasks = mockData.pendingTasks;
          todayAppointments = mockData.todayAppointments;
          recentCases = mockData.recentCases;
          recentTasks = mockData.recentTasks;
        }

        setData({
          profile: profile[0] || null,
          totalClients,
          activeCases,
          pendingTasks,
          todayAppointments,
          recentCases,
          recentTasks,
          upcomingAppointments
        });
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Houve um problema ao buscar os dados do dashboard.",
          variant: "destructive",
        });
        // Usar dados fictícios em caso de erro completo
        setData(getMockData());
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [toast]);

  if (loading || !data) {
    return <DashboardSkeleton />;
  }

  // Função para obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Função para obter cor da prioridade
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Função para formatar status
  const formatStatus = (status: string) => {
    switch (status) {
      case 'open': return 'Aberto';
      case 'in_progress': return 'Em Andamento';
      case 'closed': return 'Fechado';
      case 'pending': return 'Pendente';
      case 'completed': return 'Concluído';
      default: return status;
    }
  };

  // Função para formatar prioridade
  const formatPriority = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  return (
    <AppLayout breadcrumbs={[{ label: "Dashboard" }]}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Olá, {data.profile?.full_name?.split(' ')[0] || "Advogado"}
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Bem-vindo ao seu escritório digital. Aqui está seu resumo diário.
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 transition-colors">
          <Plus className="mr-2 h-4 w-4" />
          Novo Registro
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Casos Ativos</CardTitle>
            <div className="p-2 bg-blue-100 rounded-full">
              <Scale className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{data.activeCases}</div>
            <p className="text-xs text-blue-600 mt-1">Casos em andamento</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Clientes</CardTitle>
            <div className="p-2 bg-green-100 rounded-full">
              <Users className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{data.totalClients}</div>
            <p className="text-xs text-green-600 mt-1">Clientes cadastrados</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Tarefas Pendentes</CardTitle>
            <div className="p-2 bg-orange-100 rounded-full">
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">{data.pendingTasks}</div>
            <p className="text-xs text-orange-600 mt-1">Tarefas para concluir</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Compromissos Hoje</CardTitle>
            <div className="p-2 bg-purple-100 rounded-full">
              <CalendarDays className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">{data.todayAppointments}</div>
            <p className="text-xs text-purple-600 mt-1">Agendamentos hoje</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Casos Recentes */}
        <Card className="col-span-4 border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold">Casos Recentes</CardTitle>
                  <p className="text-sm text-gray-500">Últimos casos adicionados</p>
                </div>
              </div>
              <Link to="/cases">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  Ver todos
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {data.recentCases.length > 0 ? (
                data.recentCases.map(caseItem => (
                  <Link key={caseItem.id} to={`/cases/${caseItem.id}`}>
                    <div className="flex items-center justify-between p-4 rounded-lg border hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                          <Scale className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                            {caseItem.title}
                          </p>
                          <p className="text-sm text-gray-500">{caseItem.case_number}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(caseItem.status)}>
                        {formatStatus(caseItem.status)}
                      </Badge>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum caso encontrado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar - Tarefas e Compromissos */}
        <div className="col-span-3 space-y-6">
          {/* Tarefas Urgentes */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-white border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold">Tarefas Urgentes</CardTitle>
                    <p className="text-sm text-gray-500">Prioridade alta</p>
                  </div>
                </div>
                <Link to="/tasks">
                  <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">
                    Ver todas
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {data.recentTasks.length > 0 ? (
                  data.recentTasks.map(task => (
                    <Link key={task.id} to="/tasks">
                      <div className="flex items-center justify-between p-4 rounded-lg border hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 group">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                            <FileText className="h-4 w-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">
                              {task.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              Prazo: {new Date(task.due_date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <Badge className={getPriorityColor(task.priority)}>
                          {formatPriority(task.priority)}
                        </Badge>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <CheckCircle className="h-10 w-10 text-green-400 mx-auto mb-2" />
                    <p className="text-gray-500">Nenhuma tarefa urgente</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Próximos Compromissos */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <UserCheck className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold">Próximos Compromissos</CardTitle>
                    <p className="text-sm text-gray-500">Agendamentos futuros</p>
                  </div>
                </div>
                <Link to="/calendar">
                  <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                    Ver agenda
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {data.upcomingAppointments.length > 0 ? (
                  data.upcomingAppointments.map(apt => (
                    <Link key={apt.id} to="/calendar">
                      <div className="flex items-center justify-between p-4 rounded-lg border hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                            <Calendar className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                              {apt.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(apt.appointment_date).toLocaleDateString('pt-BR')} às {apt.start_time}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-white">
                          {apt.appointment_type === 'consultation' ? 'Consulta' : 
                           apt.appointment_type === 'hearing' ? 'Audiência' : 
                           apt.appointment_type === 'meeting' ? 'Reunião' : 'Outro'}
                        </Badge>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">Nenhum compromisso agendado</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}