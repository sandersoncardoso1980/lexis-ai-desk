// components/task/TaskForm.tsx
import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LawFirmService, LawClient, LawCase, Profile, LawTask } from '@/services/lawFirmService'
import { useToast } from '@/hooks/use-toast'

interface TaskFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTaskCreated: () => void
  editingTask?: LawTask | null
}

type TaskFormData = {
  title: string
  description: string
  case_id: string
  client_id: string
  assigned_to: string
  priority: string
  status: string
  due_date: string
  category: string
  notes: string
}

export function TaskForm({ open, onOpenChange, onTaskCreated, editingTask }: TaskFormProps) {
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<LawClient[]>([])
  const [cases, setCases] = useState<LawCase[]>([])
  const [users, setUsers] = useState<Profile[]>([])
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    case_id: 'none',
    client_id: 'none',
    assigned_to: 'none',
    priority: 'medium',
    status: 'pending',
    due_date: new Date().toISOString().split('T')[0],
    category: '',
    notes: ''
  })

  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      fetchInitialData()
      if (editingTask) {
        setFormData({
          title: editingTask.title || '',
          description: editingTask.description || '',
          case_id: editingTask.case_id || 'none',
          client_id: editingTask.client_id || 'none',
          assigned_to: editingTask.assigned_to || 'none',
          priority: editingTask.priority || 'medium',
          status: editingTask.status || 'pending',
          due_date: editingTask.due_date ? new Date(editingTask.due_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          category: editingTask.category || '',
          notes: editingTask.notes || ''
        })
      } else {
        resetForm()
      }
    }
  }, [open, editingTask])

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      case_id: 'none',
      client_id: 'none',
      assigned_to: 'none',
      priority: 'medium',
      status: 'pending',
      due_date: new Date().toISOString().split('T')[0],
      category: '',
      notes: ''
    })
  }

  const fetchInitialData = async () => {
    try {
      const [clientsData, casesData] = await Promise.all([
        LawFirmService.getClients(),
        LawFirmService.getCases()
      ])
      setClients(clientsData || [])
      setCases(casesData || [])
      
      // Tentar carregar perfis, mas não falhar se não conseguir
      try {
        const profilesData = await LawFirmService.getProfiles()
        setUsers(profilesData || [])
      } catch (profileError) {
        console.warn('Não foi possível carregar perfis:', profileError)
        setUsers([])
      }
    } catch (error) {
      console.error('Failed to fetch clients/cases:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar clientes ou casos.',
        variant: 'destructive'
      })
    }
  }

  // No método handleSubmit do TaskForm.tsx, atualize a preparação do payload
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)

  try {
    const payload: any = {
      title: formData.title,
      description: formData.description || null,
      case_id: formData.case_id === 'none' ? null : formData.case_id,
      client_id: formData.client_id === 'none' ? null : formData.client_id,
      assigned_to: formData.assigned_to === 'none' ? null : formData.assigned_to,
      priority: formData.priority,
      status: formData.status,
      category: formData.category || null,
      notes: formData.notes || null,
      updated_at: new Date().toISOString() // Garantir que updated_at seja atualizado
    }

    // Apenas adicionar due_date se foi preenchido
    if (formData.due_date) {
      payload.due_date = new Date(formData.due_date).toISOString()
    }

    if (editingTask) {
      await LawFirmService.updateTask(editingTask.id, payload)
      toast({ title: 'Sucesso', description: 'Tarefa atualizada com sucesso!' })
    } else {
      await LawFirmService.createTask(payload)
      toast({ title: 'Sucesso', description: 'Tarefa criada com sucesso!' })
    }

    onTaskCreated()
    onOpenChange(false)
    resetForm()
  } catch (error: any) {
    console.error('Failed to save task:', error)
    toast({
      title: 'Erro',
      description: error?.message || 'Erro ao salvar tarefa. Tente novamente.',
      variant: 'destructive'
    })
  } finally {
    setLoading(false)
  }
}

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: keyof TaskFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
          <DialogDescription>
            {editingTask ? 'Edite os detalhes da tarefa' : 'Preencha os detalhes da nova tarefa'}
          </DialogDescription>
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
              <Label htmlFor="priority">Prioridade *</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(v) => handleSelectChange('priority', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
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
              <Label htmlFor="assigned_to">Responsável</Label>
              <Select 
                value={formData.assigned_to} 
                onValueChange={(v) => handleSelectChange('assigned_to', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {users.map(u => (
                    <SelectItem key={u.user_id || u.id} value={u.user_id || u.id}>
                      {u.full_name || 'Usuário sem nome'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_id">Cliente</Label>
              <Select 
                value={formData.client_id} 
                onValueChange={(v) => handleSelectChange('client_id', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum cliente</SelectItem>
                  {clients.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="case_id">Caso</Label>
              <Select 
                value={formData.case_id} 
                onValueChange={(v) => handleSelectChange('case_id', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um caso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum caso</SelectItem>
                  {cases.map(cs => (
                    <SelectItem key={cs.id} value={cs.id}>
                      {cs.title} - {cs.case_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select 
                value={formData.status} 
                onValueChange={(v) => handleSelectChange('status', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="due_date">Data de Vencimento</Label>
              <Input 
                id="due_date" 
                name="due_date" 
                type="date" 
                value={formData.due_date} 
                onChange={handleInputChange} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Input 
                id="category" 
                name="category" 
                value={formData.category} 
                onChange={handleInputChange} 
              />
            </div>
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
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                onOpenChange(false)
                resetForm()
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : editingTask ? 'Atualizar' : 'Criar Tarefa'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}