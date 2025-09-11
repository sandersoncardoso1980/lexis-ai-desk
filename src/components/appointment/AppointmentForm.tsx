// components/appointment/AppointmentForm.tsx
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LawFirmService, LawClient, LawCase, LawAppointment } from "@/services/lawFirmService"
import { supabase } from "@/lib/supabaseClient"
import { useToast } from "@/hooks/use-toast"

interface AppointmentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAppointmentCreated: () => void
  editingAppointment?: LawAppointment | null
}

// Constantes para valores vazios (não podemos usar string vazia)
const EMPTY_VALUE = "none"

export function AppointmentForm({ open, onOpenChange, onAppointmentCreated, editingAppointment }: AppointmentFormProps) {
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<LawClient[]>([])
  const [cases, setCases] = useState<LawCase[]>([])
  const { toast } = useToast()

const [formData, setFormData] = useState({
  title: "",
  description: "",
  client_id: EMPTY_VALUE,
  case_id: EMPTY_VALUE,
  appointment_date: new Date().toISOString().split('T')[0],
  start_time: "09:00",
  end_time: "10:00",
  location: "",
  appointment_type: "consultation",
  status: "scheduled",
  notes: "",
  reminder_sent: false
  // Removido created_by do estado inicial
})

  useEffect(() => {
    if (open) {
      console.log("AppointmentForm opened, editingAppointment:", editingAppointment);
      fetchClientsAndCases()
      
      // Se estiver editando, preenche o formulário com os dados existentes
      if (editingAppointment) {
  console.log("Preenchendo formulário com dados de edição:", editingAppointment);
  try {
    setFormData({
      title: editingAppointment.title || "",
      description: editingAppointment.description || "",
      // Converte null/undefined para EMPTY_VALUE
      client_id: editingAppointment.client_id ? String(editingAppointment.client_id) : EMPTY_VALUE,
      case_id: editingAppointment.case_id ? String(editingAppointment.case_id) : EMPTY_VALUE,
      appointment_date: editingAppointment.appointment_date || new Date().toISOString().split('T')[0],
      start_time: editingAppointment.start_time || "09:00",
      end_time: editingAppointment.end_time || "10:00",
      location: editingAppointment.location || "",
      appointment_type: editingAppointment.appointment_type || "consultation",
      status: editingAppointment.status || "scheduled",
      notes: editingAppointment.notes || "",
      reminder_sent: editingAppointment.reminder_sent || false
      // Removido created_by
    });
    console.log("Formulário preenchido com sucesso");
  } catch (error) {
    console.error("Erro ao preencher formulário:", error);
  }
} else {
  console.log("Criando novo agendamento - resetando formulário");
  // Se for novo, reseta o formulário
  setFormData({
    title: "",
    description: "",
    client_id: EMPTY_VALUE,
    case_id: EMPTY_VALUE,
    appointment_date: new Date().toISOString().split('T')[0],
    start_time: "09:00",
    end_time: "10:00",
    location: "",
    appointment_type: "consultation",
    status: "scheduled",
    notes: "",
    reminder_sent: false
    // Removido created_by
  })
}
    }
  }, [open, editingAppointment])

  const fetchClientsAndCases = async () => {
    try {
      console.log("Buscando clientes e casos...");
      const [clientsData, casesData] = await Promise.all([
        LawFirmService.getClients(),
        LawFirmService.getCases()
      ])
      setClients(clientsData)
      setCases(casesData)
      console.log("Clientes e casos carregados:", clientsData.length, casesData.length);
    } catch (error) {
      console.error("Failed to fetch clients and cases:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    console.log("Submetendo formulário, editingAppointment:", editingAppointment);

    // Preparar dados para envio (converter EMPTY_VALUE para null)
    const submitData = {
      title: formData.title,
      description: formData.description,
      client_id: formData.client_id === EMPTY_VALUE ? null : formData.client_id,
      case_id: formData.case_id === EMPTY_VALUE ? null : formData.case_id,
      appointment_date: formData.appointment_date,
      start_time: formData.start_time,
      end_time: formData.end_time,
      location: formData.location,
      appointment_type: formData.appointment_type,
      status: formData.status,
      notes: formData.notes,
      reminder_sent: formData.reminder_sent
    };

    if (editingAppointment) {
      // Atualizar agendamento existente - NÃO enviar created_by
      console.log("Atualizando agendamento:", editingAppointment.id);
      await LawFirmService.updateAppointment(editingAppointment.id, submitData);
      
      toast({
        title: "Agendamento atualizado",
        description: "O agendamento foi atualizado com sucesso.",
      });
    } else {
      // Criar novo agendamento - incluir created_by
      console.log("Criando novo agendamento");
      await LawFirmService.createAppointment({
        ...submitData,
        created_by: user.id
      });
      
      toast({
        title: "Agendamento criado",
        description: "O agendamento foi criado com sucesso.",
      });
    }
    
    onAppointmentCreated();
    onOpenChange(false);
    
  } catch (error) {
    console.error("Failed to save appointment:", error);
    toast({
      title: "Erro",
      description: "Não foi possível salvar o agendamento. Tente novamente.",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
}

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  console.log("Renderizando AppointmentForm, formData:", formData);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingAppointment ? "Editar Agendamento" : "Novo Agendamento"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appointment_type">Tipo *</Label>
              <Select
                value={formData.appointment_type}
                onValueChange={(value) => handleSelectChange("appointment_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consulta</SelectItem>
                  <SelectItem value="hearing">Audiência</SelectItem>
                  <SelectItem value="meeting">Reunião</SelectItem>
                  <SelectItem value="deadline">Prazo</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_id">Cliente</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => handleSelectChange("client_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_VALUE}>Nenhum</SelectItem>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="case_id">Caso</Label>
              <Select
                value={formData.case_id}
                onValueChange={(value) => handleSelectChange("case_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um caso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_VALUE}>Nenhum</SelectItem>
                  {cases.map(caseItem => (
                    <SelectItem key={caseItem.id} value={caseItem.id}>
                      {caseItem.title} - {caseItem.case_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appointment_date">Data *</Label>
              <Input
                id="appointment_date"
                name="appointment_date"
                type="date"
                value={formData.appointment_date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_time">Hora Início *</Label>
              <Input
                id="start_time"
                name="start_time"
                type="time"
                value={formData.start_time}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time">Hora Fim *</Label>
              <Input
                id="end_time"
                name="end_time"
                type="time"
                value={formData.end_time}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Localização</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleSelectChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Agendado</SelectItem>
                <SelectItem value="confirmed">Confirmado</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
                <SelectItem value="rescheduled">Reagendado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : editingAppointment ? "Atualizar Agendamento" : "Criar Agendamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
