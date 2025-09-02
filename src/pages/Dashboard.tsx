import { AppLayout } from "@/components/layout/AppLayout"
import { MetricCard } from "@/components/dashboard/MetricCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Scale, 
  FileText, 
  Clock,
  TrendingUp,
  Plus,
  Calendar,
  AlertTriangle
} from "lucide-react"
import { mockCases, mockClients, mockTasks, mockAppointments } from "@/lib/mockData"

export default function Dashboard() {
  const activeCases = mockCases.filter(c => c.status === 'open').length
  const totalClients = mockClients.length
  const pendingTasks = mockTasks.filter(t => t.status === 'pending').length
  const todayAppointments = mockAppointments.filter(a => 
    a.date === new Date().toISOString().split('T')[0]
  ).length

  const recentCases = mockCases.slice(0, 3)
  const urgentTasks = mockTasks.filter(t => t.priority === 'high').slice(0, 3)

  return (
    <AppLayout breadcrumbs={[{ label: "Dashboard" }]}>
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Button className="bg-gradient-primary">
          <Plus className="mr-2 h-4 w-4" />
          Novo Caso
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Casos Ativos"
          value={activeCases}
          description="Casos em andamento"
          icon={Scale}
          trend={{ value: 12, isPositive: true }}
        />
        <MetricCard
          title="Total de Clientes"
          value={totalClients}
          description="Clientes cadastrados"
          icon={Users}
          trend={{ value: 8, isPositive: true }}
        />
        <MetricCard
          title="Tarefas Pendentes"
          value={pendingTasks}
          description="Aguardando execução"
          icon={Clock}
          trend={{ value: -5, isPositive: false }}
        />
        <MetricCard
          title="Agenda Hoje"
          value={todayAppointments}
          description="Compromissos do dia"
          icon={Calendar}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Casos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentCases.map((case_) => (
              <div key={case_.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{case_.title}</p>
                  <p className="text-sm text-muted-foreground">
                    Cliente: {case_.clientName} • {case_.area}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    case_.status === 'open' ? 'bg-success/10 text-success' :
                    case_.status === 'pending' ? 'bg-warning/10 text-warning' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {case_.status === 'open' ? 'Ativo' :
                     case_.status === 'pending' ? 'Pendente' : 'Fechado'}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    case_.priority === 'high' ? 'bg-destructive/10 text-destructive' :
                    case_.priority === 'medium' ? 'bg-warning/10 text-warning' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {case_.priority === 'high' ? 'Alta' :
                     case_.priority === 'medium' ? 'Média' : 'Baixa'}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Tarefas Urgentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {urgentTasks.map((task) => (
              <div key={task.id} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium text-sm">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Responsável: {task.assignee}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Prazo: {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  task.status === 'pending' ? 'bg-warning/10 text-warning' :
                  task.status === 'in_progress' ? 'bg-primary/10 text-primary' :
                  'bg-success/10 text-success'
                }`}>
                  {task.status === 'pending' ? 'Pendente' :
                   task.status === 'in_progress' ? 'Em andamento' : 'Concluída'}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Casos Fechados</span>
                <span className="text-2xl font-bold">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Taxa de Sucesso</span>
                <span className="text-2xl font-bold text-success">94%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Receita Gerada</span>
                <span className="text-2xl font-bold text-primary">R$ 142.000</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documentos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Contrato Silva Ltda.pdf</span>
                <span className="text-muted-foreground">Hoje</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Petição Inicial.docx</span>
                <span className="text-muted-foreground">Ontem</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Parecer Jurídico.pdf</span>
                <span className="text-muted-foreground">2 dias</span>
              </div>
              <Button variant="outline" className="w-full mt-4">
                Ver Todos os Documentos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}