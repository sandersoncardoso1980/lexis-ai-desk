import { AppLayout } from "@/components/layout/AppLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Search, DollarSign, Calendar, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { mockCases } from "@/lib/mockData"
import { useState } from "react"

export default function Cases() {
  const [searchTerm, setSearchTerm] = useState("")
  
  const filteredCases = mockCases.filter(case_ =>
    case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    case_.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    case_.area.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-success/10 text-success'
      case 'pending':
        return 'bg-warning/10 text-warning'
      case 'closed':
        return 'bg-muted text-muted-foreground'
      case 'reviewing':
        return 'bg-primary/10 text-primary'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-destructive text-destructive-foreground'
      case 'high':
        return 'bg-orange-500/10 text-orange-600'
      case 'medium':
        return 'bg-warning/10 text-warning'
      case 'low':
        return 'bg-muted text-muted-foreground'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'Ativo'
      case 'pending':
        return 'Pendente'
      case 'closed':
        return 'Fechado'
      case 'reviewing':
        return 'Em Revisão'
      default:
        return status
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

  const getProgressValue = (status: string) => {
    switch (status) {
      case 'open':
        return 25
      case 'pending':
        return 50
      case 'reviewing':
        return 75
      case 'closed':
        return 100
      default:
        return 0
    }
  }

  return (
    <AppLayout breadcrumbs={[
      { label: "Dashboard", href: "/" },
      { label: "Casos" }
    ]}>
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Casos</h2>
        <Button className="bg-gradient-primary">
          <Plus className="mr-2 h-4 w-4" />
          Novo Caso
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar casos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        {filteredCases.map((case_) => (
          <Card key={case_.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{case_.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{case_.area}</p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <Badge className={getStatusColor(case_.status)}>
                    {getStatusLabel(case_.status)}
                  </Badge>
                  <Badge variant="outline" className={getPriorityColor(case_.priority)}>
                    {getPriorityLabel(case_.priority)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">{case_.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progresso</span>
                  <span>{getProgressValue(case_.status)}%</span>
                </div>
                <Progress value={getProgressValue(case_.status)} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{case_.clientName}</span>
                </div>
                {case_.value && (
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>R$ {case_.value.toLocaleString('pt-BR')}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Criado: {new Date(case_.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
                {case_.deadline && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Prazo: {new Date(case_.deadline).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2 pt-2 border-t">
                <Button variant="outline" size="sm" className="flex-1">
                  Ver Detalhes
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCases.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum caso encontrado.</p>
        </div>
      )}
    </AppLayout>
  )
}