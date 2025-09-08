import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { AppLayout } from "@/components/layout/AppLayout"
import { DocumentDetails } from "@/components/documents/DocumentDetails"
import { DocumentForm } from "@/components/documents/DocumentForm"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { LawFirmService, type LawDocument } from "@/services/lawFirmService"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function DocumentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [document, setDocument] = useState<LawDocument | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    if (id) {
      loadDocument()
    }
  }, [id])

  const loadDocument = async () => {
    if (!id) return
    
    try {
      const documents = await LawFirmService.getDocuments()
      const foundDocument = documents.find(d => d.id === id)
      if (foundDocument) {
        setDocument(foundDocument)
      } else {
        toast({
          title: "Erro",
          description: "Documento não encontrado",
          variant: "destructive"
        })
        navigate("/documents")
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar o documento",
        variant: "destructive"
      })
      navigate("/documents")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setShowEditDialog(true)
  }

  const handleEditSuccess = () => {
    setShowEditDialog(false)
    loadDocument()
  }

  const handleDelete = () => {
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!document) return

    try {
      await LawFirmService.deleteDocument(document.id)
      toast({
        title: "Sucesso",
        description: "Documento excluído com sucesso"
      })
      navigate("/documents")
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o documento",
        variant: "destructive"
      })
    }
    setShowDeleteDialog(false)
  }

  if (loading) {
    return (
      <AppLayout breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Documentos", href: "/documents" },
        { label: "Carregando..." }
      ]}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    )
  }

  if (!document) {
    return (
      <AppLayout breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Documentos", href: "/documents" },
        { label: "Documento não encontrado" }
      ]}>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Documento não encontrado.</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout breadcrumbs={[
      { label: "Dashboard", href: "/" },
      { label: "Documentos", href: "/documents" },
      { label: document.name }
    ]}>
      <DocumentDetails 
        document={document}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Documento</DialogTitle>
          </DialogHeader>
          <DocumentForm
            document={document}
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
              Tem certeza que deseja excluir o documento "{document.name}"? 
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