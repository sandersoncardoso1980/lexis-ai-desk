// pages/Clients.tsx
import { AppLayout } from "@/components/layout/AppLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Search, Mail, Phone, Building, Eye, Edit, Trash2, X, FileText } from "lucide-react"
import { Input } from "@/components/ui/input"
import { LawFirmService, type LawClient } from "@/services/lawFirmService"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState("")
  const [clients, setClients] = useState<LawClient[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedClient, setSelectedClient] = useState<LawClient | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      setLoading(true)
      const data = await LawFirmService.getClients()
      setClients(data)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os clientes",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.phone && client.phone.includes(searchTerm)) ||
    (client.document_number && client.document_number.includes(searchTerm))
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'inactive':
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
      case 'potential':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo'
      case 'inactive':
        return 'Inativo'
      case 'potential':
        return 'Potencial'
      default:
        return status
    }
  }

  const handleCreateSuccess = () => {
    setShowCreateModal(false)
    loadClients()
    toast({
      title: "Sucesso",
      description: "Cliente criado com sucesso"
    })
  }

  const handleEditSuccess = () => {
    setShowEditModal(false)
    setShowDetailsModal(false)
    loadClients()
    toast({
      title: "Sucesso",
      description: "Cliente atualizado com sucesso"
    })
  }

  const handleViewDetails = (client: LawClient) => {
    setSelectedClient(client)
    setShowDetailsModal(true)
  }

  const handleEditClient = (client: LawClient) => {
    setSelectedClient(client)
    setShowDetailsModal(false)
    setShowEditModal(true)
  }

  const handleDeleteClient = async () => {
    if (!selectedClient) return

    try {
      await LawFirmService.deleteClient(selectedClient.id)
      setShowDeleteDialog(false)
      setShowDetailsModal(false)
      setSelectedClient(null)
      loadClients()
      toast({
        title: "Sucesso",
        description: "Cliente excluído com sucesso"
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o cliente",
        variant: "destructive"
      })
    }
  }

  const openDeleteConfirmation = (client: LawClient) => {
    setSelectedClient(client)
    setShowDeleteDialog(true)
  }

  return (
    <AppLayout breadcrumbs={[
      { label: "Dashboard", href: "/" },
      { label: "Clientes" }
    ]}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Clientes</h2>
        
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
              onSuccess={handleCreateSuccess}
            />
          </DialogContent>
        </Dialog>
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
          </div>
        </CardContent>
      </Card>

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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{client.name}</CardTitle>
                    </div>
                  </div>
                  <Badge className={getStatusColor(client.status)}>
                    {getStatusLabel(client.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{client.email}</span>
                </div>
                {client.phone && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{client.phone}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Building className="h-4 w-4" />
                  <span>{client.client_type === 'company' ? 'Empresa' : 'Pessoa Física'}</span>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    Cliente desde: {new Date(client.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1" 
                    onClick={() => handleViewDetails(client)}
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

      {/* Modal de Detalhes */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Detalhes do Cliente</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDetailsModal(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          {selectedClient && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="text-lg">
                        {selectedClient.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-2xl">{selectedClient.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={getStatusColor(selectedClient.status)}>
                          {getStatusLabel(selectedClient.status)}
                        </Badge>
                        <Badge variant="outline">
                          {selectedClient.client_type === 'company' ? 'Empresa' : 'Pessoa Física'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span>{selectedClient.email}</span>
                  </div>
                  {selectedClient.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <span>{selectedClient.phone}</span>
                    </div>
                  )}
                  {selectedClient.address && (
                    <div className="flex items-center space-x-3">
                      <Building className="h-5 w-5 text-muted-foreground" />
                      <span>{selectedClient.address}</span>
                    </div>
                  )}
                  {selectedClient.document_number && (
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span>{selectedClient.client_type === 'company' ? 'CNPJ' : 'CPF'}: {selectedClient.document_number}</span>
                    </div>
                  )}
                  {selectedClient.notes && (
                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-2">Observações</h4>
                      <p className="text-muted-foreground">{selectedClient.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex space-x-2 justify-end">
                <Button
                  variant="destructive"
                  onClick={() => openDeleteConfirmation(selectedClient)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir Cliente
                </Button>
                <Button onClick={() => handleEditClient(selectedClient)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Cliente
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Edite os dados do cliente {selectedClient?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <ClientForm
              client={selectedClient}
              onCancel={() => setShowEditModal(false)}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmação de Exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
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