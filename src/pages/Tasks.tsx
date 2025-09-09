// pages/Tasks.tsx
import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Plus, Search, Calendar, User, Clock, Edit } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LawFirmService, LawTask, Profile } from '@/services/lawFirmService'
import { TaskForm } from '@/components/task/TaskForm'
import { useToast } from '@/hooks/use-toast'

export default function Tasks() {
  const [tasks, setTasks] = useState<LawTask[]>([])
  const [profilesMap, setProfilesMap] = useState<Record<string, string>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [openForm, setOpenForm] = useState(false)
  const [editingTask, setEditingTask] = useState<LawTask | null>(null)

  const { toast } = useToast()

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const tasksData = await LawFirmService.getTasks()
      setTasks(tasksData || [])
      
      // Tentar carregar perfis, mas não falhar se não conseguir
      try {
        const profilesData = await LawFirmService.getProfiles()
        const map: Record<string, string> = {}
        profilesData.forEach((p: Profile) => {
          const key = p.user_id || p.id
          if (key) {
            map[key] = p.full_name || 'Usuário sem nome'
          }
        })
        setProfilesMap(map)
      } catch (profileError) {
        console.warn('Não foi possível carregar perfis:', profileError)
        setProfilesMap({})
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as tarefas.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch =
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-orange-100 text-orange-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'Concluída'
      case 'in_progress':
        return 'Em Andamento'
      case 'pending':
        return 'Pendente'
      case 'cancelled':
        return 'Cancelada'
      default:
        return status || 'Desconhecido'
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityLabel = (priority?: string) => {
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
        return priority || 'Desconhecida'
    }
  }

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    pending: tasks.filter(t => t.status === 'pending').length
  }
  const completionRate = taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0

  const handleToggleComplete = async (task: LawTask) => {
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed'
      await LawFirmService.updateTask(task.id, {
        status: newStatus,
        completed_date: newStatus === 'completed' ? new Date().toISOString() : null
      })
      await fetchTasks()
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a tarefa.',
        variant: 'destructive'
      })
    }
  }

  return (
    <>
      <AppLayout breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Tarefas' }]}>
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Tarefas</h2>
          <Button 
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            onClick={() => { 
              setEditingTask(null)
              setOpenForm(true)
              // No arquivo Tasks.tsx, adicione um console.log para debug
              console.log('TaskForm component:', TaskForm) // Deve mostrar a função do componente
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Tarefa
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4 mt-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Total</p>
                  <p className="text-2xl font-bold text-blue-900">{taskStats.total}</p>
                </div>
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">Concluídas</p>
                  <p className="text-2xl font-bold text-green-900">{taskStats.completed}</p>
                </div>
                <Checkbox checked className="h-5 w-5 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-800">Pendentes</p>
                  <p className="text-2xl font-bold text-orange-900">{taskStats.pending}</p>
                </div>
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-purple-800">Taxa de Conclusão</p>
                  <p className="text-sm font-bold text-purple-900">{completionRate.toFixed(0)}%</p>
                </div>
                <Progress value={completionRate} className="h-2 bg-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-4 mt-6 flex-wrap">
          <div className="flex items-center gap-2 bg-white rounded-lg border px-3 py-2 flex-1 max-w-md">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar tarefas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 p-0 h-8 focus-visible:ring-0"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="completed">Concluída</SelectItem>
              <SelectItem value="cancelled">Cancelada</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-40 bg-white">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Prioridades</SelectItem>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4 mt-6">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-lg transition-all duration-200 border-0 bg-gradient-to-r from-white to-gray-50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <Checkbox
                      checked={task.status === 'completed'}
                      onCheckedChange={() => handleToggleComplete(task)}
                      className="mt-1 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    />
                    
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`font-semibold ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {task.title}
                        </h3>
                        <Badge className={getStatusColor(task.status)}>
                          {getStatusLabel(task.status)}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(task.priority)}>
                          {getPriorityLabel(task.priority)}
                        </Badge>
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-gray-600">{task.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                        {task.assigned_to && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{profilesMap[task.assigned_to] || 'Responsável'}</span>
                          </div>
                        )}

                        {task.due_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Prazo: {new Date(task.due_date).toLocaleDateString('pt-BR')}</span>
                          </div>
                        )}

                        {task.category && (
                          <div className="flex items-center gap-1">
                            <span>Categoria: {task.category}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setEditingTask(task)
                      setOpenForm(true)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTasks.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-8 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhuma tarefa encontrada</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                  ? "Tente ajustar os filtros de busca." 
                  : "Comece criando sua primeira tarefa!"}
              </p>
            </div>
          </div>
        )}
      </AppLayout>

      <TaskForm
        open={openForm}
        onOpenChange={setOpenForm}
        onTaskCreated={fetchTasks}
        editingTask={editingTask}
      />
    </>
  )
}