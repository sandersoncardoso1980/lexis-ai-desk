// pages/Clients.tsx
import { AppLayout } from "@/components/layout/AppLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Search, Mail, Phone, Building, Eye, Edit, Trash2, X, FileText, Briefcase } from "lucide-react"
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

import ClientDetails from "@/pages/ClientDetail"

// Assumindo que a interface AppLayoutProps está definida no arquivo do componente
interface AppLayoutProps {
  title: string
}

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState("")
  const [clients, setClients] = useState<LawClient[]>([])
  const [casesByClient, setCasesByClient] = useState<Record<string, LawCase[]>>({})
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<LawClient | null>(null)
  const { toast } = useToast()

  const loadClientsAndCases = async () => {
    try {
      setLoading(true)
      const clientsData = await LawFirmService.getClients()
      setClients(clientsData)

      const casesDataPromises = clientsData.map(async (client) => {
        const cases = await LawFirmService.getCasesByClient(client.id)
        return { clientId: client.id, cases }
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

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  )

  return (
    <AppLayout title="Clientes">
      <div className="flex justify-between items-center mb-6">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredClients.length > 0 ? (
          filteredClients.map((client) => (
            <Card key={client.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">
                  {client.name}
                </CardTitle>
                <Badge variant="secondary">{client.client_type}</Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="mr-2 h-4 w-4" />
                  <span>{client.email}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="mr-2 h-4 w-4" />
                  <span>{client.phone}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Briefcase className="mr-2 h-4 w-4" />
                  <span className="font-medium">
                    {casesByClient[client.id]?.length || 0} Casos
                  </span>
                </div>
                <div className="pt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleViewClientDetails(client)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Detalhe
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setSelectedClient(client);
                      setShowDeleteModal(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">
              {clients.length === 0
                ? "Nenhum cliente encontrado."
                : `Nenhum cliente encontrado para "${searchTerm}".`}
            </p>
          </div>
        )}
      </div>

      {/* Modal de Criação de Cliente */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo cliente para adicioná-lo ao sistema.
            </DialogDescription>
          </DialogHeader>
          <ClientForm onSuccess={handleClientFormSuccess} onCancel={() => setShowCreateModal(false)}/>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes do Cliente */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
            <DialogDescription>
              Informações completas do cliente e seus casos relacionados.
            </DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <ClientDetails
              client={selectedClient}
              onEdit={handleClientFormSuccess}
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
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o cliente
              selecionado.
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
    </AppLayout>
  )
}