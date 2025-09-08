import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { AppLayout } from "@/components/layout/AppLayout"
import { CaseDetails } from "@/components/cases/CaseDetails"
import { CaseForm } from "@/components/cases/CaseForm"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { LawFirmService, type LawCase } from "@/services/lawFirmService"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [case_, setCase] = useState<LawCase | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    if (id) {
      loadCase()
    }
  }, [id])

  const loadCase = async () => {
    if (!id) return
    
    try {
      const cases = await LawFirmService.getCases()
      const foundCase = cases.find(c => c.id === id)
      if (foundCase) {
        setCase(foundCase)
      } else {
        toast({
          title: "Erro",
          description: "Caso não encontrado",
          variant: "destructive"
        })
        navigate("/cases")
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar o caso",
        variant: "destructive"
      })
      navigate("/cases")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setShowEditDialog(true)
  }

  const handleEditSuccess = () => {
    setShowEditDialog(false)
    loadCase()
  }

  const handleDelete = () => {
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!case_) return

    try {
      await LawFirmService.deleteCase(case_.id)
      toast({
        title: "Sucesso",
        description: "Caso excluído com sucesso"
      })
      navigate("/cases")
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o caso",
        variant: "destructive"
      })
    }
    setShowDeleteDialog(false)
  }

  if (loading) {
    return (
      <AppLayout breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Casos", href: "/cases" },
        { label: "Carregando..." }
      ]}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    )
  }

  if (!case_) {
    return (
      <AppLayout breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Casos", href: "/cases" },
        { label: "Caso não encontrado" }
      ]}>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Caso não encontrado.</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout breadcrumbs={[
      { label: "Dashboard", href: "/" },
      { label: "Casos", href: "/cases" },
      { label: case_.title }
    ]}>
      <CaseDetails 
        case={case_}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Caso</DialogTitle>
          </DialogHeader>
          <CaseForm
            case={case_}
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
              Tem certeza que deseja excluir o caso "{case_.title}"? 
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