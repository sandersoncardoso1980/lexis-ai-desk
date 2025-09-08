import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { AppLayout } from "@/components/layout/AppLayout"
import { ClientDetails } from "@/components/clients/ClientDetails"
import { ClientForm } from "@/components/clients/ClientForm"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { LawFirmService, type LawClient } from "@/services/lawFirmService"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [client, setClient] = useState<LawClient | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    if (id) {
      loadClient()
    }
  }, [id])

  const loadClient = async () => {
    if (!id) return
    
    try {
      const clients = await LawFirmService.getClients()
      const foundClient = clients.find(c => c.id === id)
      if (foundClient) {
        setClient(foundClient)
      } else {
        toast({
          title: "Erro",
          description: "Cliente não encontrado",
          variant: "destructive"
        })
        navigate("/clients")
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar o cliente",
        variant: "destructive"
      })
      navigate("/clients")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setShowEditDialog(true)
  }

  const handleEditSuccess = () => {
    setShowEditDialog(false)
    loadClient()
  }

  const handleDelete = () => {
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!client) return

    try {
      await LawFirmService.deleteClient(client.id)
      toast({
        title: "Sucesso",
        description: "Cliente excluído com sucesso"
      })
      navigate("/clients")
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o cliente",
        variant: "destructive"
      })
    }
    setShowDeleteDialog(false)
  }

  if (loading) {
    return (
      <AppLayout breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Clientes", href: "/clients" },
        { label: "Carregando..." }
      ]}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    )
  }

  if (!client) {
    return (
      <AppLayout breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Clientes", href: "/clients" },
        { label: "Cliente não encontrado" }
      ]}>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cliente não encontrado.</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout breadcrumbs={[
      { label: "Dashboard", href: "/" },
      { label: "Clientes", href: "/clients" },
      { label: client.name }
    ]}>
      <ClientDetails 
        client={client}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          <ClientForm
            client={client}
            onSuccess={handleEditSuccess}
            onCancel={() => setShowEditDialog(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cliente "{client.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}