// pages/Clients.tsx
import { AppLayout } from "@/components/layout/AppLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Search, Mail, Phone, Building, Eye, Edit, Trash2, X, FileText, Briefcase, ArrowUpDown, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { LawFirmService, type LawClient, type LawCase } from "@/services/lawFirmService"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ClientForm } from "@/components/clients/ClientForm"
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
import ClientDetails from "@/pages/ClientDetail"
import { WhatsAppButton } from "@/components/utils/WhatsAppButton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Tipos para ordenação
type SortField = 'name' | 'email' | 'status' | 'created_at' | 'cases_count'
type SortDirection = 'asc' | 'desc'

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState("")
  const [clients, setClients] = useState<LawClient[]>([])
  const [casesByClient, setCasesByClient] = useState<Record<string, LawCase[]>>({})
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<LawClient | null>(null)
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const { toast } = useToast()

  const loadClientsAndCases = async () => {
    try {
      setLoading(true)
      const clientsData = await LawFirmService.getClients()
      setClients(clientsData)

      const casesDataPromises = clientsData.map(async (client) => {
        try {
          const cases = await LawFirmService.getCasesByClient(client.id)
          return { clientId: client.id, cases }
        } catch (error) {
          console.error(`Erro ao carregar casos do cliente ${client.id}:`, error)
          return { clientId: client.id, cases: [] }
        }
      })

      const allCasesData = await Promise.all(casesDataPromises)

      const casesMap: Record<string, LawCase[]> = {}
      allCasesData.forEach(item => {
        casesMap[item.clientId] = item.cases
      })
      setCasesByClient(casesMap)
    } catch (error) {
      console.error("Erro ao carregar clientes e casos:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os clientes. Tente novamente mais tarde.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClientsAndCases()
  }, [])

  const handleClientFormSuccess = async () => {
    await loadClientsAndCases()
    setShowCreateModal(false)
    toast({
      title: "Sucesso!",
      description: "Operação concluída com sucesso."
    })
  }

  const handleDeleteClient = async () => {
    if (selectedClient) {
      try {
        await LawFirmService.deleteClient(selectedClient.id)
        await loadClientsAndCases()
        setShowDeleteModal(false)
        setShowDetailsModal(false)
        toast({
          title: "Sucesso!",
          description: "Cliente excluído com sucesso."
        })
      } catch (error) {
        console.error("Erro ao excluir cliente:", error)
        toast({
          title: "Erro",
          description: "Não foi possível excluir o cliente. Tente novamente mais tarde.",
          variant: "destructive"
        })
      }
    }
  }

  const handleViewClientDetails = (client: LawClient) => {
    setSelectedClient(client)
    setShowDetailsModal(true)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Se já está ordenando por este campo, inverte a direção
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // Se é um campo novo, define como ascendente
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.phone && client.phone.includes(searchTerm)) ||
    (client.document_number && client.document_number.includes(searchTerm))
  )

  // Ordenar os clientes filtrados
  const sortedClients = [...filteredClients].sort((a, b) => {
    let aValue: any
    let bValue: any

    switch (sortField) {
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case 'email':
        aValue = a.email.toLowerCase()
        bValue = b.email.toLowerCase()
        break
      case 'status':
        aValue = a.status
        bValue = b.status
        break
      case 'created_at':
        aValue = new Date(a.created_at)
        bValue = new Date(b.created_at)
        break
      case 'cases_count':
        aValue = casesByClient[a.id]?.length || 0
        bValue = casesByClient[b.id]?.length || 0
        break
      default:
        return 0
    }

    if (aValue < bValue) {
      return sortDirection === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortDirection === 'asc' ? 1 : -1
    }
    return 0
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-600'
      case 'potential': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo'
      case 'inactive': return 'Inativo'
      case 'potential': return 'Potencial'
      default: return status
    }
  }

  const getSortLabel = (field: SortField) => {
    switch (field) {
      case 'name': return 'Nome'
      case 'email': return 'Email'
      case 'status': return 'Status'
      case 'created_at': return 'Data de Criação'
      case 'cases_count': return 'Número de Casos'
      default: return field
    }
  }

  return (
    <AppLayout 
    title="Clientes">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">     
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Cliente</DialogTitle>
              <DialogDescription>
                Preencha os dados do novo cliente
              </DialogDescription>
            </DialogHeader>
            <ClientForm
              onCancel={() => setShowCreateModal(false)}
              onSuccess={handleClientFormSuccess}
            />
          </DialogContent>
        </Dialog>

        {/* Menu de Ordenação */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Ordenar por: {getSortLabel(sortField)}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleSort('name')}>
              Nome {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort('email')}>
              Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort('status')}>
              Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort('created_at')}>
              Data de Criação {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort('cases_count')}>
              Número de Casos {sortField === 'cases_count' && (sortDirection === 'asc' ? '↑' : '↓')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Busca */}
      <Card className="mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar clientes por nome, email, telefone ou documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchTerm('')}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Indicador de ordenação */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {sortedClients.length} {sortedClients.length === 1 ? 'cliente encontrado' : 'clientes encontrados'}
          {searchTerm && ` para "${searchTerm}"`}
        </span>
        <span className="text-sm text-muted-foreground">
          Ordenado por: {getSortLabel(sortField)} {sortDirection === 'asc' ? '↑' : '↓'}
        </span>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {sortedClients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow w-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center space-x-3 min-w-0">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-lg truncate">{client.name}</CardTitle>
                  </div>
                  <Badge className={getStatusColor(client.status)}>
                    {getStatusLabel(client.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground break-words">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{client.email}</span>
                </div>
                {client.phone && (
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2 min-w-0">
                      <Phone className="h-4 w-4 shrink-0" />
                      <span className="truncate">{client.phone}</span>
                    </div>
                    <WhatsAppButton
                      phoneNumber={client.phone}
                      size="icon"
                      variant="ghost"
                      message={`Olá ${client.name}, tudo bem?`}
                    />
                  </div>
                )}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  <span className="truncate">
                    {casesByClient[client.id]?.length > 0
                      ? `${casesByClient[client.id].length} caso(s)`
                      : "Nenhum caso"}
                  </span>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    Cliente desde: {new Date(client.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleViewClientDetails(client)}
                  >
                    <Eye className="mr-1 h-3 w-3" />
                    Ver Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Detalhes do Cliente */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
          </DialogHeader>

          {selectedClient && (
            <ClientDetails
              client={selectedClient}
              onEdit={() => {
                setShowDetailsModal(false)
                // Aqui você pode abrir um modal de edição se necessário
              }}
              onDelete={() => {
                setShowDetailsModal(false)
                setShowDeleteModal(true)
              }}
              cases={casesByClient[selectedClient.id] || []}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cliente "{selectedClient?.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteClient}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {!loading && clients.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
            <Building className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Nenhum cliente encontrado</h3>
          <p className="text-muted-foreground mb-4">
            Comece adicionando seu primeiro cliente.
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>
      )}

      {!loading && filteredClients.length === 0 && clients.length > 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Nenhum cliente encontrado para "{searchTerm}".
          </p>
        </div>
      )}
    </AppLayout>
  )
}