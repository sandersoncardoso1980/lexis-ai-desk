import { AppLayout } from "@/components/layout/AppLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar as CalendarIcon, Clock, User, MapPin } from "lucide-react"
import { mockAppointments } from "@/lib/mockData"
import { useState } from "react"

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  
  const today = new Date().toISOString().split('T')[0]
  const todayAppointments = mockAppointments.filter(apt => apt.date === today)
  const upcomingAppointments = mockAppointments.filter(apt => apt.date > today).slice(0, 5)

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'consultation':
        return 'bg-primary/10 text-primary'
      case 'hearing':
        return 'bg-destructive/10 text-destructive'
      case 'meeting':
        return 'bg-warning/10 text-warning'
      case 'deadline':
        return 'bg-orange-500/10 text-orange-600'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'consultation':
        return 'Consulta'
      case 'hearing':
        return 'Audiência'
      case 'meeting':
        return 'Reunião'
      case 'deadline':
        return 'Prazo'
      default:
        return type
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-success/10 text-success'
      case 'completed':
        return 'bg-muted text-muted-foreground'
      case 'cancelled':
        return 'bg-destructive/10 text-destructive'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Agendado'
      case 'completed':
        return 'Concluído'
      case 'cancelled':
        return 'Cancelado'
      default:
        return status
    }
  }

  return (
    <AppLayout breadcrumbs={[
      { label: "Dashboard", href: "/" },
      { label: "Agenda" }
    ]}>
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Agenda</h2>
        <Button className="bg-gradient-primary">
          <Plus className="mr-2 h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Compromissos de Hoje ({todayAppointments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {todayAppointments.length > 0 ? (
                todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{appointment.title}</h4>
                        <Badge className={getTypeColor(appointment.type)}>
                          {getTypeLabel(appointment.type)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{appointment.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{appointment.time}</span>
                        </div>
                        {appointment.clientId && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>Cliente #{appointment.clientId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                      {getStatusLabel(appointment.status)}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum compromisso para hoje</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Próximos Compromissos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{appointment.title}</h4>
                      <Badge className={getTypeColor(appointment.type)}>
                        {getTypeLabel(appointment.type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{appointment.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{new Date(appointment.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{appointment.time}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(appointment.status)}>
                    {getStatusLabel(appointment.status)}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visão Geral</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">{todayAppointments.length}</div>
                  <div className="text-sm text-muted-foreground">Hoje</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-success">{upcomingAppointments.length}</div>
                  <div className="text-sm text-muted-foreground">Próximos</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Por Tipo</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Consultas</span>
                    <Badge variant="outline" className="bg-primary/10 text-primary">2</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Audiências</span>
                    <Badge variant="outline" className="bg-destructive/10 text-destructive">1</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Reuniões</span>
                    <Badge variant="outline" className="bg-warning/10 text-warning">3</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Nova Consulta
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Agendar Reunião
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Clock className="mr-2 h-4 w-4" />
                Definir Lembrete
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <MapPin className="mr-2 h-4 w-4" />
                Audiência Externa
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lembretes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 border-l-4 border-warning bg-warning/5 rounded">
                <p className="text-sm font-medium">Prazo Processual</p>
                <p className="text-xs text-muted-foreground">Processo #2024001 - Vence em 3 dias</p>
              </div>
              <div className="p-3 border-l-4 border-destructive bg-destructive/5 rounded">
                <p className="text-sm font-medium">Audiência Amanhã</p>
                <p className="text-xs text-muted-foreground">Comarca Central - 09:00h</p>
              </div>
              <div className="p-3 border-l-4 border-primary bg-primary/5 rounded">
                <p className="text-sm font-medium">Reunião Cliente</p>
                <p className="text-xs text-muted-foreground">Maria Silva - Hoje 14:00h</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}