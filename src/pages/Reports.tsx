import { AppLayout } from "@/components/layout/AppLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, DollarSign, Users, Scale, FileText, Download, Calendar, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockCases, mockClients, mockTasks, mockDocuments } from "@/lib/mockData"
import { useState } from "react"

export default function Reports() {
  const [timeRange, setTimeRange] = useState("month")
  
  // Calculate metrics
  const totalCases = mockCases.length
  const activeCases = mockCases.filter(c => c.status === 'open').length
  const totalClients = mockClients.length
  const activeClients = mockClients.filter(c => c.status === 'active').length
  const completedTasks = mockTasks.filter(t => t.status === 'completed').length
  const totalTasks = mockTasks.length
  const totalRevenue = mockCases.reduce((sum, c) => sum + (c.value || 0), 0)
  
  const metrics = [
    {
      title: "Receita Total",
      value: `R$ ${totalRevenue.toLocaleString('pt-BR')}`,
      change: "+12.5%",
      isPositive: true,
      icon: DollarSign,
      description: "vs. período anterior"
    },
    {
      title: "Casos Ativos",
      value: activeCases,
      change: "+8.2%",
      isPositive: true,
      icon: Scale,
      description: `${totalCases} casos totais`
    },
    {
      title: "Clientes Ativos",
      value: activeClients,
      change: "+15.3%",
      isPositive: true,
      icon: Users,
      description: `${totalClients} clientes totais`
    },
    {
      title: "Taxa de Conclusão",
      value: `${Math.round((completedTasks / totalTasks) * 100)}%`,
      change: "+5.7%",
      isPositive: true,
      icon: BarChart3,
      description: `${completedTasks}/${totalTasks} tarefas`
    }
  ]

  const casesByArea = [
    { area: "Direito Empresarial", count: 5, percentage: 45 },
    { area: "Direito Trabalhista", count: 3, percentage: 27 },
    { area: "Direito Civil", count: 2, percentage: 18 },
    { area: "Direito Tributário", count: 1, percentage: 10 }
  ]

  const monthlyData = [
    { month: "Jan", cases: 8, revenue: 45000 },
    { month: "Fev", cases: 12, revenue: 67000 },
    { month: "Mar", cases: 15, revenue: 89000 },
    { month: "Abr", cases: 10, revenue: 52000 },
    { month: "Mai", cases: 18, revenue: 142000 }
  ]

  return (
    <AppLayout breadcrumbs={[
      { label: "Dashboard", href: "/" },
      { label: "Relatórios" }
    ]}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
          <p className="text-muted-foreground">Análise completa do desempenho do escritório</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última Semana</SelectItem>
              <SelectItem value="month">Último Mês</SelectItem>
              <SelectItem value="quarter">Último Trimestre</SelectItem>
              <SelectItem value="year">Último Ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center mt-2">
                <span className={`text-xs font-medium ${
                  metric.isPositive ? 'text-success' : 'text-destructive'
                }`}>
                  {metric.change}
                </span>
                <span className="text-xs text-muted-foreground ml-1">
                  {metric.description}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Casos por Área do Direito
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {casesByArea.map((item) => (
              <div key={item.area} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.area}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{item.count} casos</span>
                    <Badge variant="outline">{item.percentage}%</Badge>
                  </div>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((data) => (
                <div key={data.month} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{data.month}</p>
                    <p className="text-sm text-muted-foreground">{data.cases} casos</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">R$ {data.revenue.toLocaleString('pt-BR')}</p>
                    <p className="text-sm text-muted-foreground">receita</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Status dos Clientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Ativos</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="font-medium">{activeClients}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Potenciais</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-warning rounded-full"></div>
                <span className="font-medium">1</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Inativos</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-muted rounded-full"></div>
                <span className="font-medium">0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Status dos Casos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Ativos</span>
              <Badge className="bg-success/10 text-success">
                {mockCases.filter(c => c.status === 'open').length}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Pendentes</span>
              <Badge className="bg-warning/10 text-warning">
                {mockCases.filter(c => c.status === 'pending').length}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Em Revisão</span>
              <Badge className="bg-primary/10 text-primary">
                {mockCases.filter(c => c.status === 'reviewing').length}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Fechados</span>
              <Badge className="bg-muted text-muted-foreground">
                {mockCases.filter(c => c.status === 'closed').length}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documentos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{mockDocuments.length}</div>
              <div className="text-sm text-muted-foreground">Total de Documentos</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Aprovados</span>
                <span>{mockDocuments.filter(d => d.status === 'approved').length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Em Revisão</span>
                <span>{mockDocuments.filter(d => d.status === 'review').length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Rascunhos</span>
                <span>{mockDocuments.filter(d => d.status === 'draft').length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Ações Recomendadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border-l-4 border-warning bg-warning/5 rounded">
              <h4 className="font-semibold text-warning">Atenção Necessária</h4>
              <p className="text-sm text-muted-foreground mt-1">
                3 casos com prazos vencendo em menos de 7 dias
              </p>
              <Button variant="outline" size="sm" className="mt-2">
                Ver Detalhes
              </Button>
            </div>
            <div className="p-4 border-l-4 border-success bg-success/5 rounded">
              <h4 className="font-semibold text-success">Oportunidade</h4>
              <p className="text-sm text-muted-foreground mt-1">
                2 clientes potenciais aguardando contato há mais de 5 dias
              </p>
              <Button variant="outline" size="sm" className="mt-2">
                Entrar em Contato
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  )
}