// components/appointment/AppointmentForm.tsx
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LawFirmService, LawClient, LawCase } from "@/services/lawFirmService"

interface AppointmentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAppointmentCreated: () => void
}

export function AppointmentForm({ open, onOpenChange, onAppointmentCreated }: AppointmentFormProps) {
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<LawClient[]>([])
  const [cases, setCases] = useState<LawCase[]>([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    client_id: "",
    case_id: "",
    appointment_date: new Date().toISOString().split('T')[0],
    start_time: "09:00",
    end_time: "10:00",
    location: "",
    appointment_type: "consultation",
    status: "scheduled",
    notes: ""
  })

  useEffect(() => {
    if (open) {
      fetchClientsAndCases()
    }
  }, [open])

  const fetchClientsAndCases = async () => {
    try {
      const [clientsData, casesData] = await Promise.all([
        LawFirmService.getClients(),
        LawFirmService.getCases()
      ])
      setClients(clientsData)
      setCases(casesData)
    } catch (error) {
      console.error("Failed to fetch clients and cases:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await LawFirmService.createAppointment(formData)
      onAppointmentCreated()
      onOpenChange(false)
      // Reset form
      setFormData({
        title: "",
        description: "",
        client_id: "",
        case_id: "",
        appointment_date: new Date().toISOString().split('T')[0],
        start_time: "09:00",
        end_time: "10:00",
        location: "",
        appointment_type: "consultation",
        status: "scheduled",
        notes: ""
      })
    } catch (error) {
      console.error("Failed to create appointment:", error)
      alert("Erro ao criar agendamento. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
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
              {loading ? "Criando..." : "Criar Agendamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}