import { AppLayout } from "@/components/layout/AppLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar as CalendarIcon, Clock, User, MapPin, Edit, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { LawFirmService, LawAppointment } from "@/services/lawFirmService"
import { AppointmentForm } from "@/components/appointment/AppointmentForm"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [appointments, setAppointments] = useState<LawAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<LawAppointment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<LawAppointment | null>(null);
  const { toast } = useToast();

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
      const oneMonthFromNowStr = oneMonthFromNow.toISOString().split('T')[0];

      const fetchedAppointments = await LawFirmService.getAppointmentsByDateRange(today, oneMonthFromNowStr);
      setAppointments(fetchedAppointments);
    } catch (err) {
      setError("Não foi possível carregar os agendamentos. Tente novamente mais tarde.");
      console.error("Failed to fetch appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

 const handleEditAppointment = (appointment: LawAppointment) => {
  console.log("Editando agendamento - dados completos:", appointment);
  console.log("client_id:", appointment.client_id, "type:", typeof appointment.client_id);
  console.log("case_id:", appointment.case_id, "type:", typeof appointment.case_id);
  
  setEditingAppointment(appointment);
  setIsFormOpen(true);
};

  const handleDeleteAppointment = async () => {
    if (!appointmentToDelete) return;

    try {
      await LawFirmService.deleteAppointment(appointmentToDelete.id);
      toast({
        title: "Agendamento excluído",
        description: "O agendamento foi removido com sucesso.",
      });
      fetchAppointments(); // Recarregar a lista
    } catch (error) {
      console.error("Failed to delete appointment:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o agendamento.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setAppointmentToDelete(null);
    }
  };

  const openDeleteDialog = (appointment: LawAppointment) => {
    setAppointmentToDelete(appointment);
    setDeleteDialogOpen(true);
  };

  const today = new Date().toISOString().split('T')[0]
  const todayAppointments = appointments.filter(apt => apt.appointment_date === today)
  const upcomingAppointments = appointments.filter(apt => apt.appointment_date > today).sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()).slice(0, 5)

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
        return 'Outro'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Agendado'
      case 'confirmed':
        return 'Confirmado'
      case 'completed':
        return 'Concluído'
      case 'cancelled':
        return 'Cancelado'
      case 'rescheduled':
        return 'Reagendado'
      default:
        return status
    }
  }

  const renderAppointments = (appointmentsList: LawAppointment[], title: string) => (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading && <p>Carregando agendamentos...</p>}
        {error && <p className="text-destructive">{error}</p>}
        {!loading && appointmentsList.length === 0 && <p className="text-sm text-muted-foreground">Nenhum agendamento encontrado.</p>}
        {appointmentsList.map(apt => (
          <div key={apt.id} className="p-3 border-l-4 border-l-primary bg-primary/5 rounded relative group">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEditAppointment(apt)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => openDeleteDialog(apt)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <Badge className={getTypeColor(apt.appointment_type)}>
                  {getTypeLabel(apt.appointment_type)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {getStatusLabel(apt.status)}
                </Badge>
              </div>
            </div>
            <p className="font-medium text-sm">{apt.title}</p>
            
            {apt.client && apt.client.name && (
              <p className="text-xs text-muted-foreground mt-1">
                Cliente: {apt.client.name}
              </p>
            )}
            
            {apt.case && apt.case.title && (
              <p className="text-xs text-muted-foreground mt-1">
                Caso: {apt.case.title} {apt.case.case_number && `- ${apt.case.case_number}`}
              </p>
            )}
            
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(apt.appointment_date).toLocaleDateString('pt-BR')} às {apt.start_time}
            </p>
            
            {apt.location && (
              <p className="text-xs text-muted-foreground mt-1">
                Local: {apt.location}
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )

  return (
    <AppLayout title="">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Agenda Jurídica</h1>
            <Button onClick={() => {
              setEditingAppointment(null);
              setIsFormOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Evento
            </Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderAppointments(todayAppointments, "Agendamentos de Hoje")}
            {renderAppointments(upcomingAppointments, "Próximos Agendamentos")}
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                size="sm"
                onClick={() => {
                  setEditingAppointment(null);
                  setIsFormOpen(true);
                }}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                Criar Evento
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <User className="mr-2 h-4 w-4" />
                Adicionar Cliente
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
                <p className="text-xs text-muted-foreground">Com o cliente João da Silva - 14:00h</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AppointmentForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onAppointmentCreated={fetchAppointments}
        editingAppointment={editingAppointment}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir agendamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o agendamento "{appointmentToDelete?.title}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAppointment} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}
